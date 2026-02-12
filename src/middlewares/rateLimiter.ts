// src/middlewares/rateLimiter.ts
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import type { RedisReply } from "rate-limit-redis";
import { redis } from "../config/redis";

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

    store: new RedisStore({
      sendCommand: (...args: string[]) => {
        return redis.call(
          args[0],
          ...args.slice(1)
        ) as Promise<RedisReply>;
      },
    }),

    handler: (_req, res) => {
      res.status(429).json({
        message: "Too many requests, please try again later",
      });
    },
  });
};
