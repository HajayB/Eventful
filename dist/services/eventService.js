"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventService = exports.updateEventService = exports.getCreatorEventsService = exports.getSingleEventService = exports.getAllEventsService = exports.createEventService = void 0;
const eventModel_1 = require("../models/eventModel");
const createEventService = async (data) => {
    const { creatorId, title, description, location, startTime, endTime, price, totalTickets, coverImage, } = data;
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
    const event = await eventModel_1.Event.create({
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
    });
    const eventObject = event.toObject();
    const { __v, _id, ...rest } = eventObject;
    return {
        message: "Event created succesfully",
        id: _id.toString(),
        ...rest,
    };
};
exports.createEventService = createEventService;
//get all events
const getAllEventsService = async () => {
    const events = await eventModel_1.Event.find({
        $expr: { $lt: ["$ticketsSold", "$totalTickets"] },
    })
        .select("-__v")
        .sort({ startTime: 1 });
    return events;
};
exports.getAllEventsService = getAllEventsService;
//get single event
const getSingleEventService = async (eventId) => {
    const event = await eventModel_1.Event.findOne({
        _id: eventId,
        $expr: { $lt: ["$ticketsSold", "$totalTickets"] },
    }).select("-__v");
    if (!event) {
        throw new Error("Event not found");
    }
    return event;
};
exports.getSingleEventService = getSingleEventService;
//get creator event 
const getCreatorEventsService = async (creatorId) => {
    const events = await eventModel_1.Event.find({ creatorId }).sort({
        startTime: 1,
    }).select("-__v");
    return events;
};
exports.getCreatorEventsService = getCreatorEventsService;
//update an event's details (creator only)
const updateEventService = async (eventId, creatorId, updates) => {
    const event = await eventModel_1.Event.findOne({
        _id: eventId,
        creatorId,
    });
    if (!event) {
        throw new Error("Event not found or unauthorized");
    }
    if (updates.startTime &&
        updates.endTime &&
        new Date(updates.startTime) >= new Date(updates.endTime)) {
        throw new Error("Event end time must be after start time");
    }
    if (updates.price !== undefined && updates.price < 0) {
        throw new Error("Price cannot be negative");
    }
    if (updates.totalTickets !== undefined &&
        updates.totalTickets < event.ticketsSold) {
        throw new Error("Total tickets cannot be less than tickets already sold");
    }
    Object.assign(event, updates);
    await event.save();
    const eventObject = event.toObject();
    const { __v, _id, ...rest } = eventObject;
    return {
        message: "Event edited succesfully",
        id: _id.toString(),
        ...rest,
    };
};
exports.updateEventService = updateEventService;
//delete events (creator only)
const deleteEventService = async (eventId, creatorId) => {
    const event = await eventModel_1.Event.findOneAndDelete({
        _id: eventId,
        creatorId,
    });
    if (!event) {
        throw new Error("Event not found or unauthorized");
    }
    return { message: "Event deleted successfully" };
};
exports.deleteEventService = deleteEventService;
