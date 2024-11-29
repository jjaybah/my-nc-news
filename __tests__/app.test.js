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
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  it("200: responds with an individual article object with a successfully added property of comment_count", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.comment_count).toBe(11);
      });
  });
  it("200: responds with an individual article object with a correct value of 0 for comment_count", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.comment_count).toBe(0);
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
  it("200: responds with an array of article objects sorted by desc created_at by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { total_count, articles } }) => {
        expect(total_count).toBe(13);
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
  describe("sorting queries", () => {
    it("200: accepts a sort_by query and responds with an array of article objects sorted by title descending ", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body: { total_count, articles } }) => {
          expect(total_count).toBe(13);
          expect(articles).toBeSortedBy("title", { descending: true });
        });
    });
    it("200: accepts a sort_by query and responds with an array of article objects sorted by votes", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body: { total_count, articles } }) => {
          expect(total_count).toBe(13);
          expect(articles).toBeSortedBy("votes", { descending: true });
        });
    });
    it("200: accepts an order query and responds with an array of article objects in an ascending order", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body: { total_count, articles } }) => {
          expect(total_count).toBe(13);
          expect(articles).toBeSortedBy("created_at");
        });
    });
    it("200: accepts a sort_by and an order query, and responds with an array of article objects", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=asc")
        .expect(200)
        .then(({ body: { total_count, articles } }) => {
          expect(total_count).toBe(13);
          expect(articles).toBeSortedBy("author");
        });
    });
    it("400: responds with an error message for invalid sort_by query", () => {
      return request(app)
        .get("/api/articles?sort_by=length")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    it("400: responds with an error message for invalid order query", () => {
      return request(app)
        .get("/api/articles?sort_by=title&order=ascending")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("topic query", () => {
    it("200: accepts a topic query and responds with an array of article objects filtered by topic", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(1);
          articles.forEach((article) => {
            expect(article.topic).toBe("cats");
          });
        });
    });
    it("200: accepts a topic query and responds with an empty array when there are no articles for an existent topic", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toEqual([]);
        });
    });
    it("400: responds with an error message for non-existent topic query", () => {
      return request(app)
        .get("/api/articles?topic=dogs")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("complex quieries", () => {
    it("200: accepts several queries and responds with an array of articles", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=asc&topic=mitch")
        .expect(200)
        .then(({ body: { total_count, articles } }) => {
          expect(total_count).toBe(13);
          expect(articles).toBeSortedBy("author");
          articles.forEach((article) => {
            expect(article.topic).toBe("mitch");
          });
        });
    });
  });
  describe("pagination", () => {
    it("200: responds with an array of a limited number of article objects", () => {
      return request(app)
        .get("/api/articles?limit=5")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(5);
        });
    });
    it("200: responds with an array of article objects limited to the default number when no limit query is provided", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(10);
        });
    });
    it("400: responds with an error message for invalid limit request", () => {
      return request(app)
        .get("/api/articles?limit=eleven")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    it("200: accepts a page query and responds with paginated articles starting from the specified page", () => {
      return request(app)
        .get("/api/articles?limit=5&p=2")
        .expect(200)
        .then(({ body: { total_count, articles } }) => {
          expect(total_count).toBe(13);
          expect(articles.length).toBe(5);
          expect(articles[0]).toMatchObject({
            article_id: 5,
            title: "UNCOVERED: catspiracy to bring down democracy",
            topic: "cats",
            author: "rogersop",
            created_at: "2020-08-03T13:14:00.000Z",
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    it("400: responds with an error message for invalid page request", () => {
      return request(app)
        .get("/api/articles?p=eleven")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    it("404: responds with an error message for non-existent page", () => {
      return request(app)
        .get("/api/articles?limit=13&p=2")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Page not found");
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
    const votes = { inc_votes: 3 };
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
          votes: 103,
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
describe("DELETE /api/comments/:comment_id", () => {
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
describe("GET /api/users", () => {
  it("200: responds with an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});
describe("GET /api/users/:username", () => {
  it("200: responds with an individual user object", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toMatchObject({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  it("404: responds with an error message if user does not exist", () => {
    return request(app)
      .get("/api/users/totoro")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("User not found");
      });
  });
});
describe("PATCH /api/comments/:comment_id", () => {
  it("201: responds with an updated comment object", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1 })
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: 1,
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          votes: 17,
          author: "butter_bridge",
          article_id: 9,
          created_at: "2020-04-06T12:17:00.000Z",
        });
      });
  });
  it("404: responds with an error message for non-existent comment id", () => {
    return request(app)
      .patch("/api/comments/50")
      .send({ inc_votes: 1 })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not found");
      });
  });
  it("400: responds with an error message for invalid comment id", () => {
    return request(app)
      .patch("/api/comments/eleven")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  it("400: responds with an error message for invalid inc_votes", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "eleven" })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  it("400: responds with an error message for an empty request", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({})
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});
describe("POST /api/articles/", () => {
  it("201: responds with a newly created article object", () => {
    const newArticle = {
      author: "icellusedkars",
      title: "I saw a cat today",
      body: "And it licked my shoe",
      topic: "cats",
      article_img_url:
        "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 14,
          author: "icellusedkars",
          title: "I saw a cat today",
          body: "And it licked my shoe",
          topic: "cats",
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
          article_img_url:
            "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg?w=700&h=700",
        });
      });
  });
  it("201: responds with a newly created article object with a default img_url value", () => {
    const newArticle = {
      author: "icellusedkars",
      title: "I saw a cat today",
      body: "And it licked my shoe",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          article_id: 14,
          author: "icellusedkars",
          title: "I saw a cat today",
          body: "And it licked my shoe",
          topic: "cats",
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
          article_img_url:
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
        });
      });
  });
  it("400: responds with an error message if the request body is empty", () => {
    return request(app)
      .post("/api/articles")
      .send({})
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  it("400: responds with an error message if at least one of the required values is missing", () => {
    const newArticle = {
      author: "icellusedkars",
      body: "And it licked my shoe",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  it("404: responds with an error message if author does not exist", () => {
    const newArticle = {
      author: "icellnukars",
      title: "I saw a cat today",
      body: "And it licked my shoe",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not found");
      });
  });
  it("404: responds with an error message if topic does not exist", () => {
    const newArticle = {
      author: "icellusedkars",
      title: "I saw a cat today",
      body: "It didn't like my dog",
      topic: "dogs",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not found");
      });
  });
});
describe("POST /api/topics", () => {
  it("201: responds with a newly created topic object", () => {
    return request(app)
      .post("/api/topics")
      .send({ slug: "dogs", description: "dogs should be here" })
      .expect(201)
      .then(({ body: { topic } }) => {
        expect(topic).toEqual({
          slug: "dogs",
          description: "dogs should be here",
        });
      });
  });
  it("201: responds with a newly created topic object when sent only topic name", () => {
    return request(app)
      .post("/api/topics")
      .send({ slug: "dogs" })
      .expect(201)
      .then(({ body: { topic } }) => {
        expect(topic).toEqual({
          slug: "dogs",
          description: null,
        });
      });
  });
  it("400: responds with an error message if request body is empty", () => {
    return request(app)
      .post("/api/topics")
      .send({})
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  it("400: responds with an error message if the key value is missing", () => {
    return request(app)
      .post("/api/topics")
      .send({ description: "dogs should be here" })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});
describe("DELETE /api/articles/:article_id", () => {
  it("204: deletes an article by id and responds with no content", () => {
    return request(app)
      .delete("/api/articles/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      })
      .then(() => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body: { total_count, articles } }) => {
            expect(total_count).toBe(12);
          });
      });
  });
  it("404: responds with an error message if article id does not exist", () => {
    return request(app)
      .delete("/api/articles/20")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  it("404: responds with an error message for invalid artile id", () => {
    return request(app)
      .delete("/api/articles/eleven")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});
