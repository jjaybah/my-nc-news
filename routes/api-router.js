const apiRouter = require("express").Router();
const getApi = require("../controllers/api.controller");

apiRouter.get("/", getApi);

module.exports = apiRouter;
