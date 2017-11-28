"use strict";

const { expect } = require("chai");
const mongoose = require('mongoose');

describe("create user", function () {
    let User;

    beforeEach(function () {
        User = require("../models/user");
    });

    it('should create user in database', function () {
        const user = new User({
            username: "testUser01",
            password: "12345678",
            isAdmin: false
        });
    });

    it('should edit user', function () {
        //TODO
    });




});