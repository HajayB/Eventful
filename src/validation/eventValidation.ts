import { z } from "zod";

/**
 * CREATE EVENT VALIDATION
 */
export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, "Title is required"),

  description: z
    .string()
    .min(10, "Description is required"),

  location: z
    .string()
    .min(3, "Location is required"),

  startTime: z.coerce.date(),

  endTime: z.coerce.date(),

  price: z
    .number()
    .min(0, "Price cannot be negative"),

  totalTickets: z
    .number()
    .int()
    .min(1, "Total tickets must be at least 1"),
});

/**
 * UPDATE EVENT VALIDATION
 * All fields optional, but still validated if present
 */
export const updateEventSchema = z.object({
  title: z
    .string()
    .min(3)
    .optional(),

  description: z
    .string()
    .min(10)
    .optional(),

  location: z
    .string()
    .min(3)
    .optional(),

  startTime: z.coerce.date().optional(),

  endTime: z.coerce.date().optional(),

  price: z
    .number()
    .min(0)
    .optional(),

  totalTickets: z
    .number()
    .int()
    .min(1)
    .optional(),
});
