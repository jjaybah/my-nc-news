const { selectTopics, addTopic } = require("../models/topics.model");

exports.getTopics = (req, res) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.postTopic = (req, res, next) => {
  const topicData = req.body;
  addTopic(topicData)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};
