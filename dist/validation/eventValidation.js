"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
/**
 * CREATE EVENT VALIDATION
 */
exports.createEventSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(3, "Title is required"),
    description: zod_1.z
        .string()
        .min(10, "Description is required"),
    location: zod_1.z
        .string()
        .min(3, "Location is required"),
    startTime: zod_1.z.coerce.date(),
    endTime: zod_1.z.coerce.date(),
    price: zod_1.z
        .number()
        .min(0, "Price cannot be negative"),
    totalTickets: zod_1.z
        .number()
        .int()
        .min(1, "Total tickets must be at least 1"),
});
/**
 * UPDATE EVENT VALIDATION
 * All fields optional, but still validated if present
 */
exports.updateEventSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(3)
        .optional(),
    description: zod_1.z
        .string()
        .min(10)
        .optional(),
    location: zod_1.z
        .string()
        .min(3)
        .optional(),
    startTime: zod_1.z.coerce.date().optional(),
    endTime: zod_1.z.coerce.date().optional(),
    price: zod_1.z
        .number()
        .min(0)
        .optional(),
    totalTickets: zod_1.z
        .number()
        .int()
        .min(1)
        .optional(),
});
