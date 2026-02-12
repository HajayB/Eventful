import { z } from "zod";

export const createReminderSchema = z.object({
  eventId: z.string().min(1),
  remindAt: z.coerce.date(),
});
