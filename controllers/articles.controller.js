const {
  selectArticleById,
  selectArticles,
  editArticleData,
  addArticle,
  dropArticle,
  checkArticleExists,
  countArticles,
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

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic, limit, p } = req.query;
  return Promise.all([
    countArticles(),
    selectArticles(sort_by, order, topic, limit, p),
  ])
    .then(([total_count, articles]) => {
      if (Math.ceil(total_count % limit) + 1 < p) {
        res.status(404).send({ msg: "Page not found" });
      } else res.status(200).send({ total_count, articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  editArticleData(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const newArticle = req.body;
  addArticle(newArticle)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;
  return Promise.all([checkArticleExists(article_id), dropArticle(article_id)])
    .then(() => {
      res.status(204).send({});
    })
    .catch(next);
};
