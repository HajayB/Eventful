"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const startServer = async () => {
    await (0, db_1.connectDB)();
    app_1.default.listen(env_1.env.port, () => {
        console.log(`🚀 Server running on port ${env_1.env.port}`);
    });
};
startServer();
