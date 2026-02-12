
import mongoose, { Schema, Document, Types } from "mongoose";
import { string } from "zod";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface PaymentDocument extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;

  amount: number;
  quantity: number;
  email:string;

  reference: string;
  status: PaymentStatus;

  createdAt: Date;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    email:{
      type:String,
      required: true,
      lowercase: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Payment = mongoose.model<PaymentDocument>(
  "Payment",
  paymentSchema
);
