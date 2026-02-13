import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { generateOpenAPIDocument } from "./docs/openapi";

export const setupSwagger = (app: Express) => {
  const document = generateOpenAPIDocument();
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(document));
};
