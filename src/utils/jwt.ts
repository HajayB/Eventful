// src/utils/jwt.ts
import * as jwt from "jsonwebtoken";
import { env } from "../config/env";

interface JwtUserPayload {
  userId: string;
  email: string;
  role: "CREATOR" | "EVENTEE";
}

interface ResetPasswordPayload {
  userId: string;
  email: string;
}

export const signAccessToken = (payload: JwtUserPayload): string => {
  return jwt.sign(
    payload,
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn } as jwt.SignOptions
  );
};

export const signRefreshToken = (payload: JwtUserPayload): string => {
  return jwt.sign(
    payload,
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn } as jwt.SignOptions
  );
};

export const verifyAccessToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, env.jwt.accessSecret) as JwtUserPayload;
};

export const verifyRefreshToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, env.jwt.refreshSecret) as JwtUserPayload;
};


// Generate reset password JWT
export const generateResetPasswordToken = (payload:ResetPasswordPayload) => {
  return jwt.sign(
    { id: payload.userId, email: payload.email },
    env.email.resetSecret,
    { expiresIn: "1h" } // 1 hour
  );
};
// Verify RESET JWT
export const verifyPasswordResetToken = (token:string) => {
  try {
    return jwt.verify(token, env.email.resetSecret);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};