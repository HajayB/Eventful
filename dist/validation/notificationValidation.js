"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReminderSchema = void 0;
const zod_1 = require("zod");
exports.createReminderSchema = zod_1.z.object({
    eventId: zod_1.z.string().min(1),
    remindAt: zod_1.z.coerce.date(),
});
