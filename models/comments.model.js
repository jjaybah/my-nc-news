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

exports.removeCommentById = (comment_id) => {
  return db.query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id]);
};

exports.checkCommentExists = (comment_id) => {
  return db
    .query(`SELECT * FROM comments WHERE comment_id = $1`, [comment_id])
    .then(({ rows }) => {
      if (rows.length) return true;
      else return false;
    });
};

exports.editComment = (comment_id, votes) => {
  return db
    .query(
      `UPDATE comments SET votes = votes + ($1) WHERE comment_id = $2 RETURNING *`,
      [votes, comment_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
