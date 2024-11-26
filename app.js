const express = require("express");
const {
  getApi,
  getTopics,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
} = require("./controllers/app.controller");
const { postgresErrorHandler, customErrorHandler } = require("./errors");
const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Not found" });
});

app.use(postgresErrorHandler);

app.use(customErrorHandler);

module.exports = app;
