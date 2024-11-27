const express = require("express");

const {
  postgresErrorHandler,
  customErrorHandler,
  serverErrorHandler,
} = require("./errors");
const apiRouter = require("./routes/api-router");
const topicsRouter = require("./routes/topics-router");
const { articlesRouter } = require("./routes/articles-router");
const { usersRouter } = require("./routes/users-router");
const { commentsRouter } = require("./routes/comments-router");

const app = express();
app.use(express.json());

app.use("/api", apiRouter);

app.use("/api/topics", topicsRouter);

app.use("/api/articles", articlesRouter);

app.use("/api/users", usersRouter);

app.use("/api/comments", commentsRouter);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Not found" });
});

app.use(postgresErrorHandler);

app.use(customErrorHandler);

app.use(serverErrorHandler);

module.exports = app;
