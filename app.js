const express = require("express");
const { getApi, getTopics } = require("./controllers/app.controller");
const { serverErrorHandler } = require("./errors");
const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Not found" });
});

module.exports = app;
