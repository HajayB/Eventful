// src/utils/jwt.ts
import * as jwt from "jsonwebtoken";
import { env } from "../config/env";

interface JwtUserPayload {
  userId: string;
  email: string;
  role: "CREATOR" | "EVENTEE";
}

export const signToken = (payload: JwtUserPayload): string => {
  return jwt.sign(
    payload,
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn } as jwt.SignOptions
  );
};
