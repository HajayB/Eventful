import { Event } from "../models/eventModel";

interface CreateEventInput {
  creatorId: string;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  price: number;
  totalTickets: number;
  coverImage:string;
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
  }) ;
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
export const getAllEventsService = async () => {
  const events = await Event.find({  
    $expr: { $lt: ["$ticketsSold", "$totalTickets"] },
  })
  .select("-__v")
  .sort({ startTime: 1 });

  return events;
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


//get creator event 
export const getCreatorEventsService = async (
  creatorId: string
) => {
  const events = await Event.find({ creatorId }).sort({
    startTime: 1,
  }).select("-__v");

  return events;
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

  Object.assign(event, updates);

  await event.save();

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

//delete events (creator only)
export const deleteEventService = async (
  eventId: string,
  creatorId: string
) => {
  const event = await Event.findOneAndDelete({
    _id: eventId,
    creatorId,
  });

  if (!event) {
    throw new Error("Event not found or unauthorized");
  }

  return{message:"Event deleted successfully"};
};
