const db = require(`${__dirname}/../db/connection`);

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics`).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT * FROM articles
        WHERE article_id = $1`,
      [article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
