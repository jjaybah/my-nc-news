const {
  addComment,
  selectCommentsByArticleId,
  removeCommentById,
  checkCommentExists,
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
    checkArticleExists(article_id),
    addComment(article_id, username, body),
  ];
  Promise.all(promises)
    .then(([_, comment]) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  checkCommentExists(comment_id)
    .then((result) => {
      if (result === false) {
        return Promise.reject({
          status: 404,
          msg: "Not found",
        });
      } else {
        removeCommentById(comment_id).then(() => {
          checkCommentExists(comment_id).then((result) => {
            if (result === false) {
              res.status(204).send({});
            }
          });
        });
      }
    })
    .catch(next);
};
