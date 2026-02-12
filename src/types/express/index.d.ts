import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: Types.ObjectId;
        email: string;
        role: "CREATOR" | "EVENTEE";
      };
    }
  }
}

export {};
