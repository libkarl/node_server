"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const body_parser_1 = __importDefault(require("body-parser"));
const slugify_1 = __importDefault(require("slugify"));
const data_1 = require("./helpers/data");
const app = (0, express_1.default)();
const port = 1234;
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
const readDataFromJSON = () => {
    const dataString = fs_1.default.readFileSync(`${__dirname}/../${"data"}.json`, "utf-8");
    return JSON.parse(dataString).articles;
};
const saveDataInJSON = (articles) => {
    fs_1.default.writeFileSync(`${__dirname}/../data.json`, JSON.stringify({ articles }), "utf-8");
};
// this will return all articles
app.get("/articles", (req, res) => {
    res.send(readDataFromJSON());
});
app.post("/articles", (req, res) => {
    const newPost = {
        title: req.body.title,
        id: (0, uuid_1.v1)(),
        text: req.body.text,
        slug: (0, slugify_1.default)(req.body.title, options),
        category: req.body.category,
        picture: data_1.availablePics[req.body.category],
    };
    console.log(newPost);
    const posts = readDataFromJSON();
    posts.push(newPost);
    saveDataInJSON(posts);
    res.send(newPost);
});
app.get("/articles/:slug", (req, res) => {
    const posts = readDataFromJSON();
    const listedArticle = posts.find((post) => post.slug === req.params.slug);
    console.log(listedArticle);
    res.send(listedArticle);
});
app.delete("/articles/:slug", (req, res) => {
    const articleFromJSON = readDataFromJSON();
    const newArticlesState = articleFromJSON.filter((post) => post.slug !== req.params.slug);
    saveDataInJSON(newArticlesState);
    res.send(newArticlesState);
});
app.post("/articles/:slug", (req, res) => {
    const articleFromJSON = readDataFromJSON();
    console.log("update hit");
    console.log(req.body.category);
    const newArticlesState = articleFromJSON.map((post) => post.slug === req.body.slugToUpdate
        ? Object.assign(Object.assign({}, post), { text: req.body.updateText, category: req.body.category, title: req.body.title, picture: data_1.availablePics[req.body.category] }) : post);
    saveDataInJSON(newArticlesState);
    res.send(newArticlesState);
});
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json("Server side error ");
    res.json(err);
});
app.listen(port, () => {
    console.log(`It_Absolvent backend is running on port ${port}`);
});
//# sourceMappingURL=app.js.map