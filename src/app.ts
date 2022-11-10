import cors from "cors";
import express from "express";
import { v1 } from "uuid";
import bodyParser from "body-parser";
import slugify from "slugify";
import { availablePics } from "./helpers/data";
import swaggerUi from "swagger-ui-express";
import { swaggerDoc } from "./helpers/swagger";

const app = express();
const port = 1234;
const logger = require("morgan");
app.use(logger("dev"));
const localPath = `${__dirname}/../data.json`;

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

const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const readFiles = async (path: string): Promise<Article[]> => {
  try {
    const buf = await readFile(path);
    return JSON.parse(buf.toString("utf8")).articles;
  } catch (error) {
    return error;
  }
};

const saveJSON = async (articles: Article[]): Promise<undefined | Error> => {
  try {
    const saveResult = await writeFile(
      `${__dirname}/../data.json`,
      JSON.stringify({ articles })
    );
    return saveResult;
  } catch (error) {
    return error;
  }
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

app.get("/articles", async (req, res, next) => {
  const jsonData = await readFiles(localPath);
  if (jsonData instanceof Error) {
    next(jsonData);
  } else {
    res.send(jsonData);
  }
});

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
app.post("/articles", async (req, res, next) => {
  const newPost = {
    title: req.body.title,
    id: v1(),
    text: req.body.text,
    slug: slugify(req.body.title, options),
    category: req.body.category,
    picture: availablePics[req.body.category],
  };
  const posts = await readFiles(localPath);
  if (posts instanceof Error) {
    next(posts);
  } else {
    posts.push(newPost);
    const saveResult = await saveJSON(posts);
    saveResult instanceof Error && saveResult !== undefined
      ? next(saveResult)
      : res.send(posts);
  }
});

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

app.get("/articles/:slug", async (req, res, next) => {
  const posts = await readFiles(localPath);
  if (posts instanceof Error) {
    next(posts);
  } else {
    const lookingPost = posts.find((post) => post.slug === req.params.slug);

    lookingPost === undefined ? res.sendStatus(404) : res.send(lookingPost);
  }
});

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

app.delete("/articles/:slug", async (req, res, next) => {
  const articleFromJSON = await readFiles(localPath);
  if (articleFromJSON instanceof Error) {
    next(articleFromJSON);
  } else {
    const newArticlesState = articleFromJSON.filter(
      (post) => post.slug !== req.params.slug
    );
    if (articleFromJSON.length === newArticlesState.length) {
      res.sendStatus(404);
    } else {
      const saveResult = await saveJSON(newArticlesState);
      saveResult instanceof Error && saveResult !== undefined
        ? next(saveResult)
        : res.send(newArticlesState);
    }
  }
});

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

app.post("/articles/:slug", async (req, res, next) => {
  const articleFromJSON = await readFiles(localPath);
  if (articleFromJSON instanceof Error) {
    next(articleFromJSON);
  } else {
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
    const updatedArticle = newArticlesState.find(
      (article) => article.slug === slugify(req.body.title, options)
    );

    if (updatedArticle === undefined) {
      res.sendStatus(404);
    } else {
      const saveResult = await saveJSON(newArticlesState);
      saveResult instanceof Error && saveResult !== undefined
        ? next(saveResult)
        : res.send(updatedArticle);
    }
  }
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

swaggerDoc(app);

app.listen(port, () => {
  console.log(`It_Absolvent backend is running on port ${port}`);
});
