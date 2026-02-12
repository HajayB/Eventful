import { Schema, model, Types } from "mongoose";

const emailLogSchema = new Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    eventId: { type: Types.ObjectId, ref: "Event" },
    paymentId: { type: Types.ObjectId, ref: "Payment" },
    ticketIds: [{ type: Types.ObjectId, ref: "Ticket" }],
    status: {
      type: String,
      enum: ["SENT", "FAILED"],
      default: "SENT",
    },
    error: String,
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const EmailLog = model("EmailLog", emailLogSchema);