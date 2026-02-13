import NodeCache from "node-cache";

export const cache = new NodeCache({
  stdTTL: 60, // default TTL
  checkperiod: 120,
});

export const getCache = async <T>(key: string): Promise<T | null> => {
  const value = cache.get<T>(key);
  return value ?? null;
};

export const setCache = async <T>(
  key: string,
  value: T,
  ttl?: number
): Promise<void> => {
  if (ttl !== undefined) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
};


export const deleteCache = async (key: string): Promise<void> => {
  cache.del(key);
};
