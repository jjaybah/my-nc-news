const { addComment } = require("../models/comments.model");
const { checkArticleExists } = require("./articles.model");

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
