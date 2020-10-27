/**
* Test for model auth
*/
"use strict";

/* global describe it */

const assert = require("assert");
const auth = require("../../models/auth");
const verify = auth.verify;

const jwt = require("jsonwebtoken");

const payload = { email: "example@example.com" };
const secret = process.env.JWT_SECRET;

describe("Verify JWT token", function() {
    describe("Try to verify a valid token", function() {
        it("Should return true", function() {
            let token = jwt.sign(payload, secret, { expiresIn: "1h" });
            let res = verify(token, secret);

            assert.equal(res, true);
        })
    });

    describe("Try to verify an invalid token", function() {
        it("Should return false", function() {
            let token = "someFakeTokenThatShouldNotWork";
            let res = verify(token, secret);

            assert.equal(res, false);
        })
    });
});
