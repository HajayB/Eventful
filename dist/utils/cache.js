"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCache = exports.setCache = exports.getCache = exports.cache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
exports.cache = new node_cache_1.default({
    stdTTL: 60, // default TTL
    checkperiod: 120,
});
const getCache = async (key) => {
    const value = exports.cache.get(key);
    return value ?? null;
};
exports.getCache = getCache;
const setCache = async (key, value, ttl) => {
    if (ttl !== undefined) {
        exports.cache.set(key, value, ttl);
    }
    else {
        exports.cache.set(key, value);
    }
};
exports.setCache = setCache;
const deleteCache = async (key) => {
    exports.cache.del(key);
};
exports.deleteCache = deleteCache;
