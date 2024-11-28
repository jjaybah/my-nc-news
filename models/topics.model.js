const db = require(`${__dirname}/../db/connection`);

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics`).then(({ rows }) => {
    return rows;
  });
};

exports.checkTopicExists = (topic) => {
  return db
    .query(`SELECT * FROM topics WHERE slug = $1`, [topic])
    .then(({ rows }) => {
      if (!rows.length) console.log("rejecting");
      return Promise.reject({ status: 400, msg: "Bad request" });
    });
};

exports.addTopic = (topicsData) => {
  return db
    .query(
      `INSERT INTO topics(slug, description)
    VALUES($1, $2) RETURNING *`,
      [topicsData.slug, topicsData.description]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
