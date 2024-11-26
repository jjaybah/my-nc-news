const db = require("../db/connection");

exports.selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC`,
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.addComment = (article_id, username, body) => {
  return db
    .query(
      `INSERT INTO comments (body, author, article_id)
    VALUES($1, $2, $3) RETURNING *`,
      [body, username, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
