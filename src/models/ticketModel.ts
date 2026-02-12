
import mongoose, { Schema, Document, Types } from "mongoose";

export interface TicketDocument extends Document {
  eventId: Types.ObjectId;
  eventeeId: Types.ObjectId;
  paymentRef:string;

  qrPayload: string;

  isScanned: boolean;
  scannedAt?: Date;

  createdAt: Date;
}

const ticketSchema = new Schema<TicketDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    eventeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paymentRef: {
      type: String,
      required: true,
      index: true,
    },

    qrPayload: {
      type: String,
      required: true,
      unique: true,
    },

    isScanned: {
      type: Boolean,
      default: false,
    },

    scannedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Ticket = mongoose.model<TicketDocument>("Ticket", ticketSchema);
