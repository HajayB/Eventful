import { Request, Response } from "express";
import mongoose from "mongoose";
import { redis } from "../config/redis";
import {
  createEventService,
  getAllEventsService,
  getSingleEventService,
  getCreatorEventsService,
  updateEventService,
  deleteEventService,
} from "../services/eventService";
import { Event } from "../models/eventModel";
/**
 * CREATE EVENT (CREATOR)
 */
export const createEvent = async (req: Request, res: Response) => {
  try {
    const creatorId = req.user!.userId.toString();

    const event = await createEventService({
      ...req.body,
      creatorId,
    });

    // Invalidate public events cache
    await redis.del("events:all");

    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * GET ALL EVENTS (PUBLIC)
 */
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const cacheKey = "events:all";

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const events = await getAllEventsService();

    await redis.set(cacheKey, JSON.stringify(events), "EX", 60);

    res.status(200).json(events);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * GET SINGLE EVENT (PUBLIC)
 */
export const getSingleEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const cacheKey = `events:${eventId}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const event = await getSingleEventService(eventId);

    await redis.set(cacheKey, JSON.stringify(event), "EX", 60);

    res.status(200).json(event);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};


/**
 * GET CREATOR EVENTS
 */
export const getCreatorEvents = async (req: Request, res: Response) => {
  try {
    const creatorId = req.user!.userId.toString();

    const events = await getCreatorEventsService(creatorId);

    res.status(200).json(events);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * UPDATE EVENT
 */
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const creatorId = req.user!.userId.toString();
    const eventId = req.params.eventId as string;

    const updatedEvent = await updateEventService(
      eventId,
      creatorId,
      req.body
    );

    // Invalidate caches
    await redis.del("events:all");
    await redis.del(`events:${eventId}`);

    res.status(200).json(updatedEvent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * DELETE EVENT
 */
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const creatorId = req.user!.userId.toString();
    const eventId = req.params.eventId as string;

    await deleteEventService(eventId, creatorId);

    // Invalidate caches
    await redis.del("events:all");
    await redis.del(`events:${eventId}`);

    res.status(200).json({message:"Event deleted 🗑"});
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

//share event via link 

const DEFAULT_EVENT_IMAGE =
  "https://placehold.co/600x400?text=EventFul+CoverImage";

export const shareEvent = async (req:Request, res:Response) => {
  const eventId = req.params.eventId as string;
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(404).json({
      message: "Event not found",
    });
  } 
  const event = await Event.findById(eventId).select(
    "title description startTime location coverImage price"
  );

  if (!event) {
    return res.status(404).json({
      message: "Event not found",
    });
  }

  const finalCoverImage =
    event.coverImage || DEFAULT_EVENT_IMAGE;

  res.json({
    id: event._id,
    title: event.title,
    description: event.description,
    startTime: event.startTime,
    location: event.location,
    price: event.price,
    coverImage: finalCoverImage,
    shareUrl: `${process.env.APP_BASE_URL}/api/events/${event._id}`,
  });
};