const {
  selectArticleById,
  selectArticles,
  editArticleData,
} = require("../models/articles.model");

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

exports.getArticles = (req, res) => {
  selectArticles().then((articles) => {
    res.status(200).send({ articles });
  });
};

exports.patchArticleById = (req, res, nex) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  editArticleData(article_id, inc_votes).then((article) => {
    res.status(200).send({ article });
  });
};
