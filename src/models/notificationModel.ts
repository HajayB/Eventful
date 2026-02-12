import { Schema, model, Types } from "mongoose";

export interface NotificationDocument {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  email: string;
  remindAt: Date;
  isSent: boolean;
  sentAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    eventId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Event",
    },
    email: {
      type: String,
      required: true,
    },
    remindAt: {
      type: Date,
      required: true,
    },
    isSent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Notification = model<NotificationDocument>(
  "Notification",
  notificationSchema
);
