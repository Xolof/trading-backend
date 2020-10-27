process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app.js");

chai.should();
chai.use(chaiHttp);

describe("Routes", () => {
    describe("GET /", () => {
        it("200 HAPPY PATH", (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.text.should.be.an("string");

                    done();
            });
        });
    });

    describe("GET /reports/week/1", () => {
        it("200 HAPPY PATH", (done) => {
            chai.request(server)
                .get("/reports/week/1")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.report.should.be.an("object");
                    res.body.data.report.week.should.be.an("number");
                    res.body.data.report.report.should.be.an("string");

                    done();
            });
        });
    });

    describe("POST /register", () => {
        it("201 HAPPY PATH", (done) => {
            chai.request(server)
                .post("/register")
                .send({ email: "mumin@skogen.fi", password: "m00M1nd413n" })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.msg.should.be.an("string");

                    done();
            });
        });
    });

    describe("POST /login, POST /reports, PUT /reports", () => {

        let token = "";

        it("200 HAPPY PATH", (done) => {
            chai.request(server)
                .post("/login")
                .send({ email: "mumin@skogen.fi", password: "m00M1nd413n" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.msg.should.be.an("string");

                    token = res.body.data.token;

                    done();
            });
        });

        it("201 HAPPY PATH", (done) => {
            chai.request(server)
                .post("/reports")
                .set("x-access-token", token)
                .send({ week: 5, text: "This is a report text." })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.msg.should.be.an("string");

                    done();
            });
        });

        describe("PUT /reports", () => {
            it("204 HAPPY PATH", (done) => {
                chai.request(server)
                    .put("/reports")
                    .set("x-access-token", token)
                    .send({ week: 5, text: "Changed text." })
                    .end((err, res) => {
                        res.should.have.status(204);

                        done();
                });
            });
        })
    });
});
