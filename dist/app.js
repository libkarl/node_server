"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const body_parser_1 = __importDefault(require("body-parser"));
const slugify_1 = __importDefault(require("slugify"));
const data_1 = require("./helpers/data");
const swagger_1 = require("./helpers/swagger");
const app = (0, express_1.default)();
const port = 1234;
const localPath = `${__dirname}/../data.json`;
const options = {
    replacement: "-",
    remove: undefined,
    lower: true,
    strict: false,
    locale: "en",
    trim: true,
};
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const readFiles = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const buf = yield readFile(path);
    return JSON.parse(buf.toString("utf8"));
});
const loadJSON = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(`${__dirname}/../data.json`, "utf8", (err, content) => {
            if (err) {
                reject(err);
            }
            else {
                try {
                    resolve(JSON.parse(content).articles);
                }
                catch (err) {
                    reject(err);
                }
            }
        });
    });
};
const saveJSON = (articles) => {
    fs.writeFile(`${__dirname}/../data.json`, JSON.stringify({ articles }), (err) => {
        if (err)
            throw err;
    });
};
/**
 * @openapi
 * /articles:
 *  get:
 *     tags:
 *     - Get All Articles
 *     description: If there are available articles, it will return all articles.
 *     responses:
 *       200:
 *         description: Success
 *
 *       404:
 *         description: Articles not found
 */
app.get("/articles", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(yield loadJSON());
}));
/**
 * @openapi
 * /articles:
 *   post:
 *     tags:
 *       - Save New Article
 *     description: Returns all articles inside the databse
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - text
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 default: The article title
 *               text:
 *                 type: string
 *                 default: The content of article
 *               category:
 *                 type: string
 *                 default: Article category
 */
app.post("/articles", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newPost = {
        title: req.body.title,
        id: (0, uuid_1.v1)(),
        text: req.body.text,
        slug: (0, slugify_1.default)(req.body.title, options),
        category: req.body.category,
        picture: data_1.availablePics[req.body.category],
    };
    const posts = yield readFiles(localPath).catch((err) => {
        console.log(err);
    });
    posts.push(newPost);
    saveJSON(posts);
    res.send(newPost);
}));
/**
 * @openapi
 * '/articles/:slug':
 *  get:
 *     tags:
 *     - Get Article by slug
 *     summary: Get a single article by article slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *             properties:
 *               slug:
 *                 type: string
 *                 default: article-slug
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 default: Article ID
 *               title:
 *                 type: string
 *                 default: The article title
 *               text:
 *                 type: string
 *                 default: The content of article
 *               category:
 *                 type: string
 *                 default: Article category
 *               slug:
 *                 type: string
 *                 default: Article slug
 *       404:
 *         description: Article not found
 */
app.get("/articles/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield loadJSON();
    const listedArticle = posts.find((post) => post.slug === req.params.slug);
    res.send(listedArticle);
}));
/**
 * @openapi
 * '/articles/:slug':
 *  delete:
 *     tags:
 *     - Delete Article by slug
 *     summary: Delete single article by slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *             properties:
 *               slug:
 *                 type: string
 *                 default: article-slug
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Article not found
 */
app.delete("/articles/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const articleFromJSON = yield readFiles(localPath).catch((err) => {
        console.log(err);
    });
    const newArticlesState = articleFromJSON.filter((post) => post.slug !== req.params.slug);
    saveJSON(newArticlesState);
    res.send(newArticlesState);
}));
/**
 * @openapi
 * /articles/:slug:
 *   post:
 *     tags:
 *       - Update Existing Article by slug
 *     description: This method will be update article by slug with submited values
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - title
 *               - text
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 default: The article title
 *               text:
 *                 type: string
 *                 default: The content of article
 *               category:
 *                 type: string
 *                 default: Article category
 *               slug:
 *                 type: string
 *                 default: article-slug
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Article not found
 */
app.post("/articles/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const articleFromJSON = yield readFiles(localPath).catch((err) => {
        console.log(err);
    });
    const newArticlesState = articleFromJSON.map((post) => post.slug === req.body.slugToUpdate
        ? Object.assign(Object.assign({}, post), { text: req.body.updateText, category: req.body.category, title: req.body.title, picture: data_1.availablePics[req.body.category], slug: (0, slugify_1.default)(req.body.title, options) }) : post);
    saveJSON(newArticlesState);
    res.send(newArticlesState);
}));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json("Server side error ");
    res.json(err);
});
(0, swagger_1.swaggerDoc)(app);
app.listen(port, () => {
    console.log(`It_Absolvent backend is running on port ${port}`);
});
//# sourceMappingURL=app.js.map