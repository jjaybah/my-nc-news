const {
  addComment,
  selectCommentsByArticleId,
} = require("../models/comments.model");
const { checkArticleExists } = require("../models/articles.model");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const promises = [
    selectCommentsByArticleId(article_id),
    checkArticleExists(article_id),
  ];
  Promise.all(promises)
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  const promises = [
    addComment(article_id, username, body),
    checkArticleExists(article_id),
  ];
  Promise.all(promises)
    .then(([comment]) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};
