import * as chaiModule from "chai";
import chaiHttp from "chai-http";
import nock from "nock";
import app from "../index.js";

const chai = chaiModule.use(chaiHttp);

describe("GET /books", () => {
  const googleBooksBaseUrl = "https://www.googleapis.com";
  const googleBooksPath = "/books/v1/volumes";

  beforeEach(() => {
    nock.cleanAll();
  });

  it("should return books data for valid query parameters", async () => {
    const query = {
      q: "JavaScript",
      key: "test-api-key",
      startIndex: 0,
      maxResults: 10,
    };

    const mockResponse = {
      items: [
        { id: "1", title: "JavaScript: The Good Parts" },
        { id: "2", title: "Eloquent JavaScript" },
      ],
    };

    nock(googleBooksBaseUrl)
      .get(googleBooksPath)
      .query(query)
      .reply(200, mockResponse);

    const res = await chai.request.execute(app).get("/api/books").query(query);
    chai.expect(res).to.have.status(200);
    chai.expect(res.body).to.deep.equal(mockResponse);
  });

  it("should handle errors from the Google Books API", async () => {
    const query = {
      q: "JavaScript",
      key: "test-api-key",
    };

    nock(googleBooksBaseUrl)
      .get(googleBooksPath)
      .query(query)
      .reply(500, { error: "Internal Server Error" });

    const res = await chai.request.execute(app).get("/api/books").query(query);
    chai.expect(res).to.have.status(404);
    chai
      .expect(res.body)
      .to.have.property(
        "error",
        "An error occurred while fetching data from Google Books API."
      );
  });

  it("should return validation error for invalid startIndex parameter", async () => {
    const query = {
      key: 12345,
      startIndex: "invalid",
    };

    const res = await chai.request.execute(app).get("/api/books").query(query);
    chai.expect(res).to.have.status(400);
    chai.expect(res.text).to.equal('"startIndex" must be a number');
  });

  it("should return validation error for invalid maxResults parameter", async () => {
    const query = {
      key: 12345,
      maxResults: "invalid",
    };

    const res = await chai.request.execute(app).get("/api/books").query(query);
    chai.expect(res).to.have.status(400);
    chai.expect(res.text).to.equal('"maxResults" must be a number');
  });
});
