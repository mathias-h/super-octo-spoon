"use strict";

const { expect } = require("chai");
const mongoose = require('mongoose');

describe("user", function () {
    let User;

    beforeEach(function () {
        User = require("../models/user").User;
    });

    it('should create a user ', function () {

        const oldUserStatics = User.statics;

        User.statics = function(user){
            expect(user.username).to.eq(newUser.username);
            // TODO: Nedenstående fejler nok pga. hashing
            expect(user.password).to.eq(newUser.password);
            expect(user.isAdmin).to.eq(newUser.isAdmin);
            expect(user.isDisabled).to.eq(newUser.isDisabled);

            return User.statics;
        };

        Object.assign(User.statics, oldUserStatics);

        const newUser = {
            username: "testUser01",
            password: "12345678",
            isAdmin: true,
            isDisabled: false
        };

        User.statics.save = function saveMock(){
            return {exec: function (){
                return Promise.resolve()
                }
            }
        };

        return User.statics.createUser(newUser);
    });

    it('should edit user', function () {
        //TODO
    });




});