import { Types } from "mongoose";
import {User} from "../models/userModel"
import {Payment} from "../models/paymentModel";
import { getEventeeTickets } from "./ticketService";
import {Event} from "../models/eventModel";
import {Ticket} from "../models/ticketModel";
export const getEventeeDashboard = async (userId: string) => {
  const now = new Date();

  /* ---------------- USER ---------------- */
  const user = await User.findById(userId).select("name");
  if (!user) {
    throw new Error("User not found");
  }

  /* ---------------- TICKETS ---------------- */
  const tickets = await getEventeeTickets({ eventeeId: userId });

  /* ---------------- UPCOMING EVENTS (GROUPED) ---------------- */

  const groupedEvents = new Map();

  for (const ticket of tickets) {
    const event = ticket.eventId as any;

    const start = new Date(event.startTime);

    if (start > now && !ticket.isScanned) {
      const eventId = event._id.toString();

      if (!groupedEvents.has(eventId)) {
        groupedEvents.set(eventId, {
          eventId,
          title: event.title,
          location: event.location,
          startTime: event.startTime,
          endTime: event.endTime,
          ticketCount: 1,
        });
      } else {
        groupedEvents.get(eventId).ticketCount += 1;
      }
    }
  }

  const upcomingEvents = Array.from(groupedEvents.values())
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime()
    )
    .slice(0, 3);
    

  /* ---------------- STATS ---------------- */

  const stats = {
    ticketsOwned: tickets.length,
    eventsAttended: tickets.filter(t => t.isScanned).length,
  };

  /* ---------------- PAYMENT HISTORY ---------------- */

  const payments = await Payment.find(
    {
      userId: new Types.ObjectId(userId),
      status: "SUCCESS", // only successful payments
    },
    {
      amount: 1,
      reference: 1,
      quantity: 1,
      createdAt: 1,
      eventId: 1,
    }
  )
    .populate("eventId", "title startTime")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const paymentHistory = payments.map(payment => ({
    amount: payment.amount,
    reference: payment.reference,
    quantity: payment.quantity,
    paidAt: payment.createdAt,
    eventTitle: (payment.eventId as any)?.title,
    eventDate: (payment.eventId as any)?.startTime,
  }));

  /* ---------------- FINAL RESPONSE ---------------- */

  return {
    userName: user.name,
    upcomingEvents,
    stats,
    paymentHistory,

  };
};


export const getCreatorDashboard = async (creatorId: string) => {
  const now = new Date();

  /* ---------------- USER ---------------- */
  const user = await User.findById(creatorId).select("name");
  if (!user) throw new Error("User not found");

  /* ---------------- EVENTS ---------------- */
  const events = await Event.find(
    { creatorId: new Types.ObjectId(creatorId) },
    {
      title: 1,
      startTime: 1,
      endTime: 1,
      totalTickets: 1,
    }
  ).lean();

  const eventIds = events.map(e => e._id);

  if (eventIds.length === 0) {
    return {
      userName: user.name,
      stats: {
        eventsCreated: 0,
        upcomingEvents: 0,
        ticketsSold: 0,
      },
      upcomingEvents: [],
      checkInSummary: [],
      eventsNeedingAttention: [],
      recentActivity: [],
    };
  }

  /* ---------------- AGGREGATION ---------------- */
  const ticketStats = await Ticket.aggregate([
    { $match: { eventId: { $in: eventIds } } },
    {
      $group: {
        _id: "$eventId",
        ticketsSold: { $sum: 1 },
        checkedIn: {
          $sum: { $cond: ["$isScanned", 1, 0] },
        },
      },
    },
  ]);

  const ticketMap = new Map(
    ticketStats.map(stat => [stat._id.toString(), stat])
  );

  /* ---------------- STATS ---------------- */
  const stats = {
    eventsCreated: events.length,
    upcomingEvents: events.filter(e => new Date(e.startTime) > now).length,
    ticketsSold: ticketStats.reduce((acc, s) => acc + s.ticketsSold, 0),
  };

  /* ---------------- UPCOMING EVENTS ---------------- */
  const upcomingEvents = events
    .filter(e => new Date(e.startTime) > now)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime()
    )
    .slice(0, 3)
    .map(event => {
      const stat = ticketMap.get(event._id.toString());
      const sold = stat?.ticketsSold || 0;

      return {
        eventId: event._id.toString(),
        title: event.title,
        startTime: event.startTime,
        ticketsSold: sold,
        capacityFilled: event.totalTickets
          ? Math.round((sold / event.totalTickets) * 100)
          : 0,
      };
    });

  /* ---------------- CHECK-IN SUMMARY ---------------- */
  //This shows the amount of tickets that have been scanned while an event is happening 
  const checkInSummary = events
    .filter(e => {
      const start = new Date(e.startTime);
      const end = new Date(e.endTime);
      return start <= now && end >= now;
    })
    .map(event => {
      const stat = ticketMap.get(event._id.toString());

      return {
        eventId: event._id.toString(),
        title: event.title,
        ticketsSold: stat?.ticketsSold || 0,
        checkedIn: stat?.checkedIn || 0,
      };
    });

  /* ---------------- EVENTS NEEDING ATTENTION ---------------- */
  const eventsNeedingAttention = events
    .map(event => {
      const stat = ticketMap.get(event._id.toString());
      const sold = stat?.ticketsSold || 0;

      const daysLeft =
        (new Date(event.startTime).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24);

      const percent = event.totalTickets
        ? sold / event.totalTickets
        : 0;

      return {
        eventId: event._id.toString(),
        title: event.title,
        ticketsSold: sold,
        daysLeft: Math.floor(daysLeft),
        capacityPercent: percent,
      };
    })
    .filter(
      e =>
        e.daysLeft <= 20 && //show events that will happen in 20 days or less
        e.daysLeft > 0 && 
        e.capacityPercent < 0.3 //and events that have sold less than 30% 
    )
    .slice(0, 3);

  /* ---------------- RECENT ACTIVITY ---------------- */
const recentActivityRaw = await Payment.find(
  {
    eventId: { $in: eventIds },
    status: "SUCCESS", 
  },
  {
    eventId: 1,
    createdAt: 1,
    quantity: 1,
    amount: 1,
  }
)
  .sort({ createdAt: -1 })
  .limit(3)
  .populate("eventId", "title")
  .populate("userId", "name email")
  .lean();
  
const recentActivity = recentActivityRaw.map(payment => {
  const eventTitle = (payment.eventId as any)?.title;
  const buyerName = (payment.userId as any)?.name;
  return {
    eventTitle,
    purchasedAt: payment.createdAt,
    // quantity: payment.quantity,
    amount: payment.amount,
    summary: `${buyerName} bought ${payment.quantity} ${payment.quantity === 1 ? "ticket" : "tickets"}`,
}
});  
  /* ---------------- FINAL RESPONSE ---------------- */
  return {
    userName: user.name,
    stats,
    upcomingEvents,
    checkInSummary,
    eventsNeedingAttention,
    recentActivity,
  };
};
