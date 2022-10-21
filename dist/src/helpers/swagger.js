"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDoc = void 0;
const swaggerJsdoc_1 = __importDefault(require("swaggerJsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const package_json_1 = require("../../package.json");
const pino_1 = __importDefault(require("pino"));
const dayjs_1 = __importDefault(require("dayjs"));
const options = {
    definition: {
        info: {
            title: "My Article Server Api",
            version: package_json_1.version,
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
    apis: ["../app.ts"],
};
const swaggerSpec = (0, swaggerJsdoc_1.default)(options);
const swaggerDoc = (app, port) => {
    // Swager pager
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    // Swager JSON doc
    app.get("docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    log.info(`Docs available at http://localhost:${port}/docs`);
};
exports.swaggerDoc = swaggerDoc;
const log = (0, pino_1.default)({
    prettyPrint: true,
    base: {
        pid: false,
    },
    timestamp: () => `,"time":"${(0, dayjs_1.default)().format()}"`,
});
//# sourceMappingURL=swagger.js.map