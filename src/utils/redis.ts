import { redis } from "../config/redis";

export const getCache = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
};

export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds: number
) => {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
};