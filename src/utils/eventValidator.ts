import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(3),

  startTime: z.string().datetime(),
  endTime: z.string().datetime(),

  price: z.number().min(0),
  totalTickets: z.number().min(1),
});
