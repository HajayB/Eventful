// src/middlewares/rateLimiter.ts
import rateLimit from "express-rate-limit";

export const createRateLimiter = ({
  windowMs,
  max,
}: {
  windowMs: number;
  max: number;
}) => {
  return rateLimit({
    windowMs,
    max,

    standardHeaders: true,
    legacyHeaders: false,

    handler: (_req, res) => {
      res.status(429).json({
        message: "Too many requests, please try again later",
      });
    },
  });
};