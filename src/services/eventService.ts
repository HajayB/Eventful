import { Event, EventDocument } from "../models/eventModel";
import { Payment } from "../models/paymentModel";
import { User } from "../models/userModel";
import { sendEventUpdatedEmail, sendEventCancelledEmail } from "./emailService";

interface CreateEventInput {
  creatorId: string;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  price: number;
  totalTickets: number;
  coverImage: string;
  maxTicketsPerPurchase?: number;
}


export const createEventService = async (
  data: CreateEventInput
) => {
  const {
    creatorId,
    title,
    description,
    location,
    startTime,
    endTime,
    price,
    totalTickets,
    coverImage,
    maxTicketsPerPurchase,
  } = data;


  if (new Date(startTime) >= new Date(endTime)) {
    throw new Error("Event end time must be after start time");
  }

  if (price < 0) {
    throw new Error("Price cannot be negative");
  }

  if (totalTickets < 1) {
    throw new Error("Total tickets must be at least 1");
  }
  if (coverImage && !coverImage.startsWith("http")) {
    throw new Error("Invalid image URL");
  }

  const event = await Event.create({
    creatorId,
    title,
    description,
    location,
    startTime,
    endTime,
    price,
    totalTickets,
    coverImage,
    ticketsSold: 0,
    ...(maxTicketsPerPurchase !== undefined && { maxTicketsPerPurchase }),
  });
  const eventObject = event.toObject();

  const {
    __v,
    _id,
    ...rest
  } = eventObject;
  
  return {
    message:"Event created succesfully",
    id: _id.toString(),
    ...rest,
  };
};

//get all events
export const getAllEventsService = async (page=1, limit=4, search="") => {

  const skip = (page - 1) * limit;

    const now = new Date();
    const baseConditions: any[] = [
      { $expr: { $lt: ["$ticketsSold", "$totalTickets"] } },
      {
        $or: [
          { startTime: { $gte: now } },
          { endTime: { $gte: now } },
        ],
      },
    ];

    const filter: any = {
      $and: baseConditions,
    };
    if (search) {
      if (search.length >= 3) {
        filter.$text = { $search: search }; // use text
      } else {
        filter.$and.push({
          title: { $regex: search, $options: "i" }, // fallback
        });
      }
    }
    const [events, total] = await Promise.all([
      Event.find(
        filter,
        search ? { score: { $meta: "textScore" } } : {}
      )
        .select("-__v")
        .sort(
          search
            ? { score: { $meta: "textScore" } }
            : { startTime: 1 }
        )
        .skip(skip)
        .limit(limit),

      Event.countDocuments(filter),
    ]);

  return {
    data: events,
    meta: {
      total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

//get single event
export const getSingleEventService = async (eventId: string) => {
  const event = await Event.findOne({
    _id: eventId,
    $expr: { $lt: ["$ticketsSold", "$totalTickets"] },
  }).select("-__v");

  if (!event) {
    throw new Error("Event not found");
  }

  return event;
};


export const getCreatorEventsService = async (
  creatorId: string, page: number = 1, limit: number = 4, search = ""
) => {
  const skip = (page - 1) * limit;
  const now = new Date();

  // Build search filter only when a term is provided
  const searchFilter = search.trim()
    ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const activeEventsFilter = {
    creatorId,
    endTime: { $gte: now },
    ...searchFilter,
  };

  const pastEventsFilter = {
    creatorId,
    endTime: { $lt: now },
    ...searchFilter,
  };

  const [activeEvents, pastEvents, totalCurrentEvents, totalOldEvents] =
    await Promise.all([
      Event.find(activeEventsFilter).select("-__v").sort({ startTime: 1 }).skip(skip).limit(limit),
      Event.find(pastEventsFilter).select("-__v").sort({ startTime: 1 }).skip(skip).limit(limit),
      Event.countDocuments(activeEventsFilter),
      Event.countDocuments(pastEventsFilter),
    ]);

  return {
    CurrentEvents: {
      activeEvents,
      pagination: {
        totalEvents: totalCurrentEvents,
        page,
        limit,
        totalPages: Math.ceil(totalCurrentEvents / limit),
      },
    },
    OldEvents: {
      pastEvents,
      pagination: {
        totalEvents: totalOldEvents,
        page,
        limit,
        totalPages: Math.ceil(totalOldEvents / limit),
      },
    },
  };
};

//update an event's details (creator only)
export const updateEventService = async (
  eventId: string,
  creatorId: string,
  updates: Partial<{
    title: string;
    description: string;
    location: string;
    startTime: Date;
    endTime: Date;
    price: number;
    totalTickets: number;
    coverImage: string;
    maxTicketsPerPurchase: number;
  }>
) => {
  const event = await Event.findOne({
    _id: eventId,
    creatorId,
  });

  if (!event) {
    throw new Error("Event not found or unauthorized");
  }

  if (
    updates.startTime &&
    updates.endTime &&
    new Date(updates.startTime) >= new Date(updates.endTime)
  ) {
    throw new Error("Event end time must be after start time");
  }

  if (updates.coverImage && !updates.coverImage.startsWith("http")) {
    throw new Error("Invalid image URL");
  }

  if (updates.price !== undefined && updates.price < 0) {
    throw new Error("Price cannot be negative");
  }

  if (
    updates.totalTickets !== undefined &&
    updates.totalTickets < event.ticketsSold
  ) {
    throw new Error(
      "Total tickets cannot be less than tickets already sold"
    );
  }

  // Snapshot fields users care about before overwriting
  const watchedFields = ["title", "location", "startTime", "endTime", "price"] as const;
  const formatValue = (field: string, val: any): string => {
    if ((field === "startTime" || field === "endTime") && val) {
      return new Date(val).toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" });
    }
    if (field === "price") return `₦${Number(val).toLocaleString()}`;
    return String(val ?? "");
  };
  const before: Record<string, any> = {};
  watchedFields.forEach((f) => { before[f] = event[f]; });

  Object.assign(event, updates);

  await event.save();

  // Build diff
  const changes: { field: string; from: string; to: string }[] = [];
  watchedFields.forEach((f) => {
    if (updates[f] !== undefined && String(before[f]) !== String(event[f])) {
      changes.push({ field: f, from: formatValue(f, before[f]), to: formatValue(f, event[f]) });
    }
  });

  // Notify ticket holders (fire-and-forget)
  if (changes.length) {
    Promise.all([
      Payment.find({ eventId: event._id, status: "SUCCESS" }).select("email").lean(),
      User.findById(event.creatorId).select("email").lean(),
    ])
      .then(([payments, creator]) => {
        const emails = [...new Set(payments.map((p) => p.email))];
        const creatorEmail = creator?.email ?? "";
        return sendEventUpdatedEmail(emails, event, changes, creatorEmail);
      })
      .catch(console.error);
  }

  const eventObject = event.toObject();

  const {
    __v,
    _id,
    ...rest
  } = eventObject;
  
  return {
    message:"Event edited succesfully",
    id: _id.toString(),
    ...rest,
  };
};

// Get today's events (for guest purchase page)
export const getTodayEventsService = async () => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const events = await Event.find({
    startTime: { $lte: endOfToday },
    endTime: { $gte: startOfToday },
    $expr: { $lt: ["$ticketsSold", "$totalTickets"] },
  })
    .select("-__v")
    .sort({ startTime: 1 });

  return events;
};

//delete events (creator only)
export const deleteEventService = async (
  eventId: string,
  creatorId: string
) => {
  const event = await Event.findOne({ _id: eventId, creatorId });

  if (!event) {
    throw new Error("Event not found or unauthorized");
  }

  // Fetch ticket-holder emails before deleting (fire-and-forget)
  Promise.all([
    Payment.find({ eventId: event._id, status: "SUCCESS" }).select("email").lean(),
    User.findById(event.creatorId).select("email").lean(),
  ])
    .then(([payments, creator]) => {
      const emails = [...new Set(payments.map((p) => p.email))];
      const creatorEmail = creator?.email ?? "";
      return sendEventCancelledEmail(emails, event, creatorEmail);
    })
    .catch(console.error);

  await event.deleteOne();

  return { message: "Event deleted successfully" };
};
