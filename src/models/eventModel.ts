
import mongoose, { Schema, Document, Types } from "mongoose";

export interface EventDocument extends Document {
  creatorId: Types.ObjectId;

  title: string;
  description: string;
  location: string;

  startTime: Date;
  endTime: Date;

  price: number;

  coverImage: string;

  totalTickets: number;
  ticketsSold: number;

  createdAt: Date;
}

const eventSchema = new Schema<EventDocument>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    totalTickets: {
      type: Number,
      required: true,
      min: 1,
    },
    coverImage: {
      type: String,
      trim: true,
      default:"https://placehold.co/600x400?text=EventFul+CoverImage",
    },
    

    ticketsSold: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Search index
eventSchema.index({ title: "text", location: "text", });

// Sorting & filtering
eventSchema.index({ startTime: 1 });

// Better date queries
eventSchema.index({ startTime: 1, endTime: 1 });

eventSchema.index({ startTime: 1, ticketsSold: 1, totalTickets: 1 });
export const Event = mongoose.model<EventDocument>("Event", eventSchema);
