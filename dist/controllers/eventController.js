"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareEvent = exports.getTodayEvents = exports.deleteEvent = exports.updateEvent = exports.getCreatorEvents = exports.getSingleEvent = exports.getAllEvents = exports.createEvent = exports.invalidateEventsCache = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cache_1 = require("../utils/cache");
const eventService_1 = require("../services/eventService");
const eventModel_1 = require("../models/eventModel");
//INVALIDATE CACHE
const invalidateEventsCache = () => {
    const keys = cache_1.cache.keys();
    const staleKeys = keys.filter((key) => key.startsWith("events:all:") || key.startsWith("creator:"));
    staleKeys.forEach((key) => cache_1.cache.del(key));
};
exports.invalidateEventsCache = invalidateEventsCache;
const invalidateSingleEventCache = (eventId) => {
    cache_1.cache.del(`events:${eventId}`);
};
/**
 * CREATE EVENT (CREATOR)
 */
const createEvent = async (req, res) => {
    try {
        const creatorId = req.user.userId.toString();
        const event = await (0, eventService_1.createEventService)({
            ...req.body,
            creatorId,
        });
        // Invalidate public events cache
        await (0, exports.invalidateEventsCache)();
        res.status(201).json(event);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createEvent = createEvent;
const parseQuery = (query) => ({
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 8,
    search: String(query.search || ""),
});
const buildEventsCacheKey = (parseQuery) => {
    const { page = 1, limit = 8, search = "" } = parseQuery;
    return `events:all:page=${page}:limit=${limit}:search=${search}`;
};
/**
 * GET ALL EVENTS (PUBLIC)
 */
const getAllEvents = async (req, res) => {
    try {
        const parsed = parseQuery(req.query);
        const cacheKey = buildEventsCacheKey(parsed); // ✅ FIXED
        const cached = cache_1.cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const { page, limit, search } = parseQuery(req.query);
        const events = await (0, eventService_1.getAllEventsService)(page, limit, search);
        cache_1.cache.set(cacheKey, events, 60); // TTL = 60 seconds
        return res.status(200).json(events);
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
exports.getAllEvents = getAllEvents;
/**
 * GET SINGLE EVENT (PUBLIC)
 */
const getSingleEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const cacheKey = `events:${eventId}`;
        const cached = cache_1.cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const event = await (0, eventService_1.getSingleEventService)(eventId);
        cache_1.cache.set(cacheKey, event);
        res.status(200).json(event);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getSingleEvent = getSingleEvent;
const parseCreatorQuery = (query) => ({
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 4,
    search: String(query.search || "").trim(), //trimmed here so search with space share a cache key with search without space
});
const buildCreatorEventsCacheKey = (creatorId, parsed) => {
    const { page, limit, search } = parsed;
    return `creator:${creatorId}:events:page=${page}:limit=${limit}:search=${search}`;
    //by adding ^^^^ we scope the cache per creator
};
const getCreatorEvents = async (req, res) => {
    try {
        const creatorId = req.user.userId.toString();
        const parsed = parseCreatorQuery(req.query);
        const cacheKey = buildCreatorEventsCacheKey(creatorId, parsed);
        const cached = cache_1.cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const { page, limit, search } = parsed; // ✅ use the already-parsed result
        const events = await (0, eventService_1.getCreatorEventsService)(creatorId, page, limit, search);
        cache_1.cache.set(cacheKey, events); // ✅ actually store it
        res.status(200).json(events);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getCreatorEvents = getCreatorEvents;
/**
 * UPDATE EVENT
 */
const updateEvent = async (req, res) => {
    try {
        const creatorId = req.user.userId.toString();
        const eventId = req.params.eventId;
        const updatedEvent = await (0, eventService_1.updateEventService)(eventId, creatorId, req.body);
        (0, exports.invalidateEventsCache)();
        invalidateSingleEventCache(eventId);
        res.status(200).json(updatedEvent);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateEvent = updateEvent;
/**
 * DELETE EVENT
 */
const deleteEvent = async (req, res) => {
    try {
        const creatorId = req.user.userId.toString();
        const eventId = req.params.eventId;
        await (0, eventService_1.deleteEventService)(eventId, creatorId);
        (0, exports.invalidateEventsCache)();
        invalidateSingleEventCache(eventId);
        res.status(200).json({ message: "Event deleted 🗑" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.deleteEvent = deleteEvent;
//share event via link 
const DEFAULT_EVENT_IMAGE = "https://placehold.co/600x400?text=Eventify+CoverImage";
// GET /events/today — public, for guest purchase page
const getTodayEvents = async (req, res) => {
    try {
        const events = await (0, eventService_1.getTodayEventsService)();
        return res.json({ events });
    }
    catch (error) {
        return res.status(500).json({ message: error.message || "Failed to fetch today's events" });
    }
};
exports.getTodayEvents = getTodayEvents;
const shareEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        if (!mongoose_1.default.Types.ObjectId.isValid(eventId)) {
            return res.status(404).json({
                message: "Event not found",
            });
        }
        const event = await eventModel_1.Event.findById(eventId).select("title description startTime location coverImage price");
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
    }
    catch (error) {
        return res.status(500).json({ message: error.message || "Failed to share event" });
    }
};
exports.shareEvent = shareEvent;
