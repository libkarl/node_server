import cors from "cors";
import express from "express";
import fs from "fs";
import { v1 } from "uuid";
import bodyParser from "body-parser";
import slugify from "slugify";
import { availablePics } from "./helpers/data";

const app = express();
const port = 1234;

const options = {
  replacement: "-",
  remove: undefined,
  lower: true,
  strict: false,
  locale: "en",
  trim: true,
};

app.use(cors());
app.use(bodyParser.json());

type Article = {
  id: string;
  title: string;
  text: string;
  slug: string;
  category: string;
  picture: string;
};

const readDataFromJSON = () => {
  const dataString = fs.readFileSync(`${__dirname}/../${"data"}.json`, "utf-8");
  return JSON.parse(dataString).articles as Article[];
};

const saveDataInJSON = (articles: Article[]) => {
  fs.writeFileSync(
    `${__dirname}/../data.json`,
    JSON.stringify({ articles }),
    "utf-8"
  );
};

// this will return all articles
app.get("/articles", (req, res) => {
  res.send(readDataFromJSON());
});

app.post("/articles", (req, res) => {
  const newPost: Article = {
    title: req.body.title,
    id: v1(),
    text: req.body.text,
    slug: slugify(req.body.title, options),
    category: req.body.category,
    picture: availablePics[req.body.category],
  };
  console.log(newPost);
  const posts = readDataFromJSON();
  posts.push(newPost);
  saveDataInJSON(posts);
  res.send(newPost);
});

app.get("/articles/:slug", (req, res) => {
  const posts = readDataFromJSON();
  const listedArticle: Article = posts.find(
    (post: Article) => post.slug === req.params.slug
  );
  console.log(listedArticle);
  res.send(listedArticle);
});

app.delete("/articles/:slug", (req, res) => {
  const articleFromJSON = readDataFromJSON();
  const newArticlesState = articleFromJSON.filter(
    (post) => post.slug !== req.params.slug
  );
  saveDataInJSON(newArticlesState);
  res.send(newArticlesState);
});

app.post("/articles/:slug", (req, res) => {
  const articleFromJSON = readDataFromJSON();
  console.log("update hit");
  console.log(req.body.updateText);
  const newArticlesState = articleFromJSON.map((post: Article) =>
    post.slug === req.body.slugToUpdate
      ? { ...post, text: req.body.updateText }
      : post
  );
  saveDataInJSON(newArticlesState);
  res.send(newArticlesState);
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json("Server side error ");
    res.json(err);
  }
);

app.listen(port, () => {
  console.log(`It_Absolvent backend is running on port ${port}`);
});
