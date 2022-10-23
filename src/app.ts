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

app.get("/articles", async (req, res) => {
  res.send(await loadJSON());
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

app.get("/articles/:slug", async (req, res) => {
  const posts = await loadJSON();
  const listedArticle = posts.find((post) => post.slug === req.params.slug);
  res.send(listedArticle);
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

app.delete("/articles/:slug", async (req, res) => {
  const articleFromJSON = await loadJSON();
  const newArticlesState = articleFromJSON.filter(
    (post) => post.slug !== req.params.slug
  );
  saveJSON(newArticlesState);
  res.send(newArticlesState);
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

swaggerDoc(app);

app.listen(port, () => {
  console.log(`It_Absolvent backend is running on port ${port}`);
});
