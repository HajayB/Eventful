"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlacklisted = exports.addToBlacklist = void 0;
const tokenBlacklist = new Set();
const addToBlacklist = (token) => {
    tokenBlacklist.add(token);
};
exports.addToBlacklist = addToBlacklist;
const isBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};
exports.isBlacklisted = isBlacklisted;
