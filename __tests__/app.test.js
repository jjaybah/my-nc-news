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
describe("GET /api/article/:article_id", () => {
  it("200: responds with an individual article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.article_id).toBe(1);
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
        expect(article).toHaveProperty("article_img_url");
      });
  });
  it("404: responds with an error message if article_id is not found", () => {
    return request(app)
      .get("/api/articles/100")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  }, 10000);
  it("400: responds with an error message for invalid article_id", () => {
    return request(app)
      .get("/api/articles/five")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});
describe("GET /api/articles", () => {
  it("200: responds with an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length).toBe(13);
        expect(articles).toBeSortedBy("created_at", { descending: true });
        articles.forEach((article) => {
          expect(article).not.toHaveProperty("body");
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
});
describe("GET /api/articles/:article_id/comments", () => {
  it("200: responds with an array of comment objects for an article by article_id", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length).toBe(2);
        expect(comments).toBeSortedBy("created_at", { descending: true });
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });
  it("200: responds with an empty array if there are no comments for the given article_id", () => {
    return request(app)
      .get("/api/articles/7/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
  it("404: responds with an error message if an article with given id does not exist", () => {
    return request(app)
      .get("/api/articles/231/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  it("400: responds with an error message for an invalid article id ", () => {
    return request(app)
      .get("/api/articles/eleven/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});
describe("POST /api/articles/:article_id/comments", () => {
  it("201: responds with a newly created comment object", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Salted pistachio is the best ice cream flavour",
    };
    return request(app)
      .post("/api/articles/6/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: 19,
          votes: 0,
          created_at: expect.any(String),
          author: "butter_bridge",
          body: "Salted pistachio is the best ice cream flavour",
          article_id: 6,
        });
      });
  });
  it("404: responds with an error message if an article with given id does not exist", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Salted pistachio is the best ice cream flavour",
    };
    return request(app)
      .post("/api/articles/231/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  it("400: responds with an error message for invalid article id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Salted pistachio is the best ice cream flavour",
    };
    return request(app)
      .post("/api/articles/eleven/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  it("400: responds with an error message for incomplete data in a request", () => {
    const newComment = {
      username: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  it("400: responds with an error message if user does not exist", () => {
    const newComment = {
      username: "iAmNotHere",
      body: "Salted pistachio is the best ice cream flavour",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not found");
      });
  });
});
describe("PATCH /api/articles/:article_id", () => {
  it("200: responds with an updated article with increased votes", () => {
    const votes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(votes)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 101,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  it("200: responds with an updated article with decreased votes", () => {
    const votes = {
      inc_votes: -50,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(votes)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 50,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  it("404: responds with an error message if article with given id does not exist", () => {
    const votes = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/99")
      .send(votes)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  it("400: responds with an error message for an invalid article id", () => {
    const votes = { inc_votes: -5 };
    return request(app)
      .patch("/api/articles/eleven")
      .send(votes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  it("400: responds with an error message for an invalid data type in the request", () => {
    const votes = { inc_votes: "add one vote" };
    return request(app)
      .patch("/api/articles/1")
      .send(votes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  it("400: responds with an error message for an empty request", () => {
    const votes = {};
    return request(app)
      .patch("/api/articles/1")
      .send(votes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});
describe.only("DELETE /api/comments/:comment_id", () => {
  it("204: deletes a comment by id", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  it("404: responds with an error message if a comment does not exist", () => {
    return request(app)
      .delete("/api/comments/20")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not found");
      });
  });
  it("400: responds with an error message for an invalid comment id", () => {
    return request(app)
      .delete("/api/comments/eleven")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});
