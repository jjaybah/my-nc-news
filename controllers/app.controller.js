const { selectTopics, selectArticleById } = require("../models/app.model");
const endpointsJSON = require(`${__dirname}/../endpoints.json`);

exports.getApi = (req, res) =>
  res.status(200).send({ endpoints: endpointsJSON });

exports.getTopics = (req, res) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
