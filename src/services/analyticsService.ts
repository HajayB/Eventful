
import { Types } from "mongoose";
import { Event } from "../models/eventModel";
import { Ticket } from "../models/ticketModel";
import { Payment } from "../models/paymentModel";
import { getCache, setCache } from "../utils/redis";
interface CreatorPaymentAnalyticsInput {
  creatorId: string;
}
//CREATOR ANALYTICS 

/**
 * CREATOR: All-time analytics
 */
export const getCreatorAllTimeAnalytics = async (
  creatorId: string
) => {
  const cacheKey = `analytics:creator:${creatorId}:all`;

  const cached = await getCache<{
    totalTicketsSold: number;
    totalRevenue: number;
    totalAttendees: number;
    totalUnusedTickets: number;
  }>(cacheKey);

  if (cached) {
    return cached;
  }

  const creatorObjectId = new Types.ObjectId(creatorId);

  // 1. Fetch creator events
  const events = await Event.find(
    { creatorId: creatorObjectId },
    { _id: 1 }
  );

  // 🚨 No events → return zeroed analytics
  if (events.length === 0) {
    const emptyResult = {
      totalTicketsSold: 0,
      totalRevenue: 0,
      totalAttendees: 0,
      totalUnusedTickets: 0,
    };

    await setCache(cacheKey, emptyResult, 60);
    return emptyResult;
  }

  const eventIds = events.map((e) => e._id);

  // 2. Tickets sold + revenue
  const payments = await Payment.aggregate([
    { $match: { eventId: { $in: eventIds } } },
    {
      $group: {
        _id: null,
        totalTicketsSold: { $sum: "$quantity" },
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);

  // 3. Attendance (QR verified)
  const attendance = await Ticket.aggregate([
    {
      $match: {
        eventId: { $in: eventIds },
        isScanned: true,
      },
    },
    {
      $group: {
        _id: null,
        totalAttendees: { $sum: 1 },
      },
    },
  ]);

  const totalTicketsSold = payments[0]?.totalTicketsSold ?? 0;
  const totalAttendees = attendance[0]?.totalAttendees ?? 0;

  const result = {
    totalTicketsSold,
    totalRevenue: payments[0]?.totalRevenue ?? 0,
    totalAttendees,
    totalUnusedTickets: totalTicketsSold - totalAttendees,
  };

  await setCache(cacheKey, result, 60);

  return result;
};



/**
 * CREATOR: Analytics Per Event 
 */
export const getCreatorEventAnalytics = async (
    creatorId: string,
    eventId: string
  ) => {
    const cacheKey = `analytics:creator:${creatorId}:event:${eventId}`;
  
    const cached = await getCache<{
      ticketsSold: number;
      revenue: number;
      qrVerified: number;
      qrUnverified: number;
    }>(cacheKey);
  
    if (cached) {
      return cached;
    }
  
    const event = await Event.findOne({
      _id: eventId,
      creatorId,
    });
  
    if (!event) {
      throw new Error("Event not found or unauthorized");
    }
  
    const payments = await Payment.aggregate([
      { $match: { eventId: event._id } },
      {
        $group: {
          _id: null,
          ticketsSold: { $sum: "$quantity" },
          revenue: { $sum: "$amount" },
        },
      },
    ]);
  
    const qrVerified = await Ticket.countDocuments({
      eventId: event._id,
      isScanned: true,
    });
  
    const qrUnverified = await Ticket.countDocuments({
      eventId: event._id,
      isScanned: false,
    });
  
    const ticketsSold = payments[0]?.ticketsSold ?? 0;
    const result = {
      ticketsSold,
      revenue: payments[0]?.revenue ?? 0,
      qrVerified,
      qrUnverified: ticketsSold - qrVerified,
    };
  
    await setCache(cacheKey, result, 60);
  
    return result;
  };
//get the analytics for the payment on each event  
export const getCreatorPaymentAnalytics = async ({
  creatorId,
}: CreatorPaymentAnalyticsInput) => {
// Find creator's events
  const events = await Event.find({
    creatorId: new Types.ObjectId(creatorId),
  }).select("_id title");
  
  if (!events.length) {
    return {
      totalRevenue: 0,
      totalPayments: 0,
      totalTicketsSold: 0,
      perEvent: [],
    };
    }
  
  const eventIds = events.map((e) => e._id);
  
//Fetch successful payments
 const payments = await Payment.find({
    eventId: { $in: eventIds },
    status: "SUCCESS",
  });
  
//Aggregate totals
  const totalRevenue = payments.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  
  const totalPayments = payments.length;
  
  const totalTicketsSold = payments.reduce(
    (sum, p) => sum + p.quantity,
    0
  );
  
//Per-event breakdown
  const perEvent = events.map((event) => {
    const eventPayments = payments.filter(
      (p) => p.eventId.toString() === event._id.toString()
    );
  
    return {
      eventId: event._id,
      title: event.title,
      revenue: eventPayments.reduce(
        (sum, p) => sum + p.amount,
        0
      ),
      payments: eventPayments.length,
      ticketsSold: eventPayments.reduce(
        (sum, p) => sum + p.quantity,
        0
      ),
    };
  });
  
  return {
    totalRevenue,
    totalPayments,
    totalTicketsSold,
    perEvent,
  };
  };

  /**
 * EVENTEE: Events paid for
 */
export const getEventeePaidEvents = async (
    eventeeId: string
  ) => {
    return Payment.find({ userId: eventeeId },  {
      qrPayload: 0,
      paymentRef: 0,
      __v: 0,
    })
    .populate({
      path: "eventId",
      select: "title location startTime endTime price",
    })  
      .sort({ createdAt: -1 });
  };
/**
 * EVENTEE: Events attended (QR verified)
 */
export const getEventeeAttendedEvents = async (
    eventeeId: string
  ) => {
    return Ticket.find({
      eventeeId,
      isScanned: true,
    },
    {
      qrPayload: 0,
      paymentRef: 0,
      __v: 0,
    })
    
    .populate({
      path: "eventId",
      select: "title location startTime endTime price",
    })
  
      .sort({ scannedAt: -1 });
  };
/**
 * EVENTEE: Paid but not attended
 */
export const getEventeeUnattendedEvents = async (
    eventeeId: string
  ) => {
    return Ticket.find({
      eventeeId,
      isScanned: false,
    },  {
      qrPayload: 0,
      paymentRef: 0,
      __v: 0,
    }).populate({
      path: "eventId",
      select: "title location startTime endTime price",
    })
  };
      