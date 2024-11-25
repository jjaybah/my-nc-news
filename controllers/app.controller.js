const endpointsJSON = require(`${__dirname}/../endpoints.json`);
const { selectTopics } = require(`${__dirname}/../models/app.model`);

exports.getApi = (req, res) =>
  res.status(200).send({ endpoints: endpointsJSON });

exports.getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};
