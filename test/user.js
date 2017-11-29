"use strict";

const { expect } = require("chai");
const mongoose = require('mongoose');

describe("user", function () {
    let User;

    beforeEach(function () {
        User = require("../models/user");
    });

    it('should create user in database', function () {

        const oldUserStatics = User.statics;

        User.statics = function(user){
            expect(user.username).to.eq(newUser.username);

            return User.statics;
        };

        Object.assign(User.statics, oldUserStatics);

        const user = new User({
            username: "testUser01",
            password: "12345678",
            isAdmin: true,
            isDisabled: false
        });

        User.statics.save = function saveMock(){
            return {exec: function (){
                return Promise.resolve()
                }
            }
        }
    });

    it('should edit user', function () {
        //TODO
    });




});