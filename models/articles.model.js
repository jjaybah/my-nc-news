const db = require("../db/connection");

exports.checkArticleExists = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
    });
};

exports.countArticles = () => {
  return db.query(`SELECT * FROM articles`).then(({ rows }) => {
    return rows.length;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.article_id)::INT AS comment_count 
      FROM articles
      LEFT JOIN comments
      ON articles.article_id = comments.article_id 
        WHERE articles.article_id = $1
        GROUP BY articles.article_id`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.selectArticles = (
  sort_by = "created_at",
  order = "desc",
  topic,
  limit = 10,
  page = 1
) => {
  const validSortBy = ["title", "topic", "author", "created_at", "votes", "comment_count"];
  const validOrder = ["desc", "asc"];
  const validTopics = ["mitch", "cats", "paper", "coding", "football", "cooking"];
  const offset = limit * (page - 1);
  if (!validSortBy.includes(sort_by) || !validOrder.includes(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  let queryString = `SELECT articles.author, articles.title, articles.  article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id)::INT AS comment_count 
      FROM articles
      LEFT JOIN comments
      ON articles.article_id = comments.article_id `;
  if (topic) {
    if (!validTopics.includes(topic)) {
      return Promise.reject({ status: 400, msg: "Bad request" });
    }
    queryString += `WHERE articles.topic = '${topic}' `;
  }
  queryString += `GROUP BY articles.article_id ORDER BY ${sort_by} ${order}`;
  queryString += ` LIMIT ${limit} OFFSET ${offset}`;
  return db.query(queryString).then(({ rows }) => {
    return rows;
  });
};

exports.editArticleData = (article_id, votes) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + ($1) WHERE article_id = $2 RETURNING *`,
      [votes, article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.addArticle = (article) => {
  const { author, title, body, topic, article_img_url } = article;
  let values = [author, title, body, topic];
  let query = `
  INSERT INTO articles(author, title, body, topic${
    article_img_url ? ", article_img_url" : ""
  })
  VALUES($1, $2, $3, $4 ${article_img_url ? ", $5" : ""})
  RETURNING *`;

  if (article_img_url) {
    values.push(article_img_url);
  }

  return db.query(query, values).then(({ rows }) => {
    return { ...rows[0], comment_count: 0 };
  });
};

exports.dropArticle = (article_id) => {
  return db.query(`DELETE FROM articles WHERE article_id = $1`, [article_id]);
};
