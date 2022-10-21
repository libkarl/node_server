import cors from "cors";
import express from "express";
import fs from "fs";
import { v1 } from "uuid";
import bodyParser from "body-parser";
import slugify from "slugify";
import { availablePics } from "./helpers/data";
import swaggerUi from "swagger-ui-express";
import { swaggerDoc } from "./helpers/swagger";

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

const loadJSON = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${__dirname}/../${"data"}.json`, "utf8", (err, content) => {
      if (err) {
        reject(err);
      } else {
        try {
          resolve(JSON.parse(content).articles);
        } catch (err) {
          reject(err);
        }
      }
    });
  }) as Promise<Article[]>;
};

const saveJSON = (articles: Article[]) => {
  fs.writeFile(
    `${__dirname}/../data.json`,
    JSON.stringify({ articles }),
    (err) => {
      if (err) throw err;
    }
  );
};

/**
 * @openapi
 * /articles:
 *  get:
 *    tag:
 *       - All Articles
 *        description: Responds if the app is up and running
 *        responses:
 *           200:
 *             description: All available articles sended
 *
 */

app.get("/articles", async (req, res) => {
  res.send(await loadJSON());
  res.sendStatus(200);
});

app.post("/articles", async (req, res) => {
  const newPost: Article = {
    title: req.body.title,
    id: v1(),
    text: req.body.text,
    slug: slugify(req.body.title, options),
    category: req.body.category,
    picture: availablePics[req.body.category],
  };
  const posts: Article[] = await loadJSON();
  posts.push(newPost);
  saveJSON(posts);
  res.send(newPost);
});

app.get("/articles/:slug", async (req, res) => {
  const posts = await loadJSON();
  const listedArticle = posts.find((post) => post.slug === req.params.slug);
  res.send(listedArticle);
});

app.delete("/articles/:slug", async (req, res) => {
  const articleFromJSON = await loadJSON();
  const newArticlesState = articleFromJSON.filter(
    (post) => post.slug !== req.params.slug
  );
  saveJSON(newArticlesState);
  res.send(newArticlesState);
});

app.post("/articles/:slug", async (req, res) => {
  const articleFromJSON = await loadJSON();
  const newArticlesState = articleFromJSON.map((post: Article) =>
    post.slug === req.body.slugToUpdate
      ? {
          ...post,
          text: req.body.updateText,
          category: req.body.category,
          title: req.body.title,
          picture: availablePics[req.body.category],
          slug: slugify(req.body.title, options),
        }
      : post
  );
  saveJSON(newArticlesState);
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
  swaggerDoc(app);
});
