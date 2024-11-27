const endpointsJSON = require(`${__dirname}/../endpoints.json`);

const getApi = (req, res) => res.status(200).send({ endpoints: endpointsJSON });

module.exports = getApi;
