"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareEvent = exports.deleteEvent = exports.updateEvent = exports.getCreatorEvents = exports.getSingleEvent = exports.getAllEvents = exports.createEvent = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cache_1 = require("../utils/cache");
const eventService_1 = require("../services/eventService");
const eventModel_1 = require("../models/eventModel");
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
        await cache_1.cache.del("events:all");
        res.status(201).json(event);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createEvent = createEvent;
/**
 * GET ALL EVENTS (PUBLIC)
 */
const getAllEvents = async (req, res) => {
    try {
        const cacheKey = "events:all";
        const cached = cache_1.cache.get(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const events = await (0, eventService_1.getAllEventsService)();
        cache_1.cache.set(cacheKey, events);
        res.status(200).json(events);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
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
/**
 * GET CREATOR EVENTS
 */
const getCreatorEvents = async (req, res) => {
    try {
        const creatorId = req.user.userId.toString();
        const events = await (0, eventService_1.getCreatorEventsService)(creatorId);
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
        // Invalidate caches
        await cache_1.cache.del("events:all");
        await cache_1.cache.del(`events:${eventId}`);
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
        // Invalidate caches
        await cache_1.cache.del("events:all");
        await cache_1.cache.del(`events:${eventId}`);
        res.status(200).json({ message: "Event deleted 🗑" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.deleteEvent = deleteEvent;
//share event via link 
const DEFAULT_EVENT_IMAGE = "https://placehold.co/600x400?text=EventFul+CoverImage";
const shareEvent = async (req, res) => {
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
exports.shareEvent = shareEvent;
