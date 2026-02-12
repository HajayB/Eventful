
import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "CREATOR" | "EVENTEE";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["CREATOR", "EVENTEE"],
      default: "EVENTEE",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const User = mongoose.model<UserDocument>("User", userSchema);
