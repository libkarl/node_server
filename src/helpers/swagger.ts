import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { resolve } from "path";

const version = require("../../package.json").version;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Article Server Api",
      version,
    },
    security: [
      {
        baarerAuth: [],
      },
    ],
  },
  apis: [resolve(__dirname, "../app.js")],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDoc = (app: Express) => {
  console.log(JSON.stringify(swaggerSpec));
  let res = swaggerUi.setup(swaggerSpec);
  // Swager pager
  app.use("/docs", swaggerUi.serve, res);

  // Swager JSON doc
  app.get("/docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
