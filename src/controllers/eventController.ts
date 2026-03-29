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
  getTodayEventsService,
} from "../services/eventService";
import { Event } from "../models/eventModel";
//INVALIDATE CACHE
export const invalidateEventsCache = () => {
  const keys = cache.keys();
  const staleKeys = keys.filter(
    (key) => key.startsWith("events:all:") || key.startsWith("creator:")
  );
  staleKeys.forEach((key) => cache.del(key));
};

const invalidateSingleEventCache = (eventId: string) => {
  cache.del(`events:${eventId}`);
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
  limit: Number(query.limit) || 8,
  search: String(query.search || ""),
});
const buildEventsCacheKey = (parseQuery:any) => {
  const { page = 1, limit = 8, search = "" } = parseQuery;

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

const parseCreatorQuery = (query: any) => ({
  page: Number(query.page) || 1,
  limit: Number(query.limit) ||4,
  search: String(query.search || "").trim(), //trimmed here so search with space share a cache key with search without space
});

const buildCreatorEventsCacheKey = (creatorId: string, parsed: ReturnType<typeof parseCreatorQuery>) => {
  const { page, limit, search } = parsed; 

  return `creator:${creatorId}:events:page=${page}:limit=${limit}:search=${search}`;
  //by adding ^^^^ we scope the cache per creator
};


export const getCreatorEvents = async (req: Request, res: Response) => {
  try {
    const creatorId = req.user!.userId.toString();
    const parsed = parseCreatorQuery(req.query);

    const cacheKey = buildCreatorEventsCacheKey(creatorId,parsed);

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const { page, limit, search } = parsed; // ✅ use the already-parsed result
    const events = await getCreatorEventsService(creatorId, page, limit, search);

    cache.set(cacheKey, events); // ✅ actually store it
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

    invalidateEventsCache();
    invalidateSingleEventCache(eventId);

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

    invalidateEventsCache();
    invalidateSingleEventCache(eventId);

    res.status(200).json({message:"Event deleted 🗑"});
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

//share event via link 

const DEFAULT_EVENT_IMAGE =
  "https://placehold.co/600x400?text=Eventify+CoverImage";

// GET /events/today — public, for guest purchase page
export const getTodayEvents = async (req: Request, res: Response) => {
  try {
    const events = await getTodayEventsService();
    return res.json({ events });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch today's events" });
  }
};

export const shareEvent = async (req:Request, res:Response) => {
  try {
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

    const finalCoverImage = event.coverImage || DEFAULT_EVENT_IMAGE;

    return res.json({
      id: event._id,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      location: event.location,
      price: event.price,
      coverImage: finalCoverImage,
      shareUrl: `${process.env.FRONTEND_BASE_URL}/eventee/events/${event._id}`,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to share event" });
  }
};