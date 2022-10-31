"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDoc = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = require("path");
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
    apis: [(0, path_1.resolve)(__dirname, "../app.js")],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const swaggerDoc = (app) => {
    let res = swagger_ui_express_1.default.setup(swaggerSpec);
    // Swager pager
    app.use("/docs", swagger_ui_express_1.default.serve, res);
    // Swager JSON doc
    app.get("/docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
};
exports.swaggerDoc = swaggerDoc;
//# sourceMappingURL=swagger.js.map