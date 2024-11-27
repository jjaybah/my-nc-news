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
