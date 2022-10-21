import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import logger from "pino";
import dayjs from "dayjs";
import swaggerJsdoc from "swagger-jsdoc";

const version = require("../../package.json").version;

const options = {
  definition: {
    info: {
      title: "My Article Server Api",
      version,
    },
    components: {
      securitySchemes: {
        baarerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        baarerAuth: [],
      },
    ],
  },
  apis: ["src/app.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDoc = (app: Express) => {
  // Swager pager
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Swager JSON doc
  app.get("docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
