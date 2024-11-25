const endpointsJson = require(`${__dirname}/../endpoints.json`);
const request = require("supertest");
const app = require(`${__dirname}/../app`);
const db = require(`${__dirname}/../db/connection`);
const seed = require(`${__dirname}/../db/seeds/seed`);
const data = require(`${__dirname}/../db/data/test-data/index`);

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api", () => {
  it("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});
describe("General errors", () => {
  it("404: responds with an error message when requested a non-existent endpoint", () => {
    return request(app)
      .get("/api/non-existent-endpoint")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not found");
      });
  });
});
describe("GET /api/topics", () => {
  it("200: responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("description");
          expect(topic).toHaveProperty("slug");
        });
      });
  });
});
