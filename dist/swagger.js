"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const openapi_1 = require("./docs/openapi");
const setupSwagger = (app) => {
    const document = (0, openapi_1.generateOpenAPIDocument)();
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(document));
};
exports.setupSwagger = setupSwagger;
