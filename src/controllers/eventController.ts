import { Request, Response } from "express";
import mongoose from "mongoose";
import { cache } from "../utils/cache"

import {
  createEventService,
  getAllEventsService,
  getSingleEventService,
  getCreatorEventsService,
  updateEventService,
  deleteEventService,
} from "../services/eventService";
import { Event } from "../models/eventModel";
//INVALIDATE CACHE
export const invalidateEventsCache = () => {
  const keys = cache.keys(); // gets ALL keys

  const eventKeys = keys.filter((key) => key.startsWith("events:all:"));

  eventKeys.forEach((key) => {
    cache.del(key);
  });
};
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
    await invalidateEventsCache()


    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
const parseQuery = (query: any) => ({
  page: Number(query.page) || 1,
  limit: Number(query.limit) || 4,
  search: String(query.search || ""),
});
const buildEventsCacheKey = (parseQuery:any) => {
  const { page = 1, limit = 4, search = "" } = parseQuery;

  return `events:all:page=${page}:limit=${limit}:search=${search}`;
};

/**
 * GET ALL EVENTS (PUBLIC)
 */
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const parsed = parseQuery(req.query);

    const cacheKey = buildEventsCacheKey(parsed); // ✅ FIXED

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    const { page, limit, search } = parseQuery(req.query)
    const events = await getAllEventsService(page, limit, search);

    cache.set(cacheKey, events, 60); // TTL = 60 seconds
    await invalidateEventsCache();
    return res.status(200).json(events);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

/**
 * GET SINGLE EVENT (PUBLIC)
 */
export const getSingleEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const cacheKey = `events:${eventId}`;

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    
    const event = await getSingleEventService(eventId);
    
    cache.set(cacheKey, event);
    
    res.status(200).json(event);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const getCreatorEvents = async (req: Request, res: Response) => {
  try {
    const creatorId = req.user!.userId.toString();

    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const events = await getCreatorEventsService(creatorId, page, limit);
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
    await invalidateEventsCache()
    

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
    await invalidateEventsCache();
    

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