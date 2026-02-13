"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCache = exports.getCache = void 0;
const redis_1 = require("../config/redis");
const getCache = async (key) => {
    const data = await redis_1.redis.get(key);
    if (!data)
        return null;
    return JSON.parse(data);
};
exports.getCache = getCache;
const setCache = async (key, value, ttlSeconds) => {
    await redis_1.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
};
exports.setCache = setCache;
