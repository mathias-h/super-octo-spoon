"use strict";

const { expect } = require("chai");
const mongoose = require('mongoose');

describe("user", function () {

    let User;
    const testData = {
        username: "testUser01",
        password: "12345678",
        isAdmin: true,
        isDisabled: false
    };

    beforeEach(function () {
        User = require("../models/user");
    });

    it('should create a user',function () {

        const user = new User(testData);

        expect(user.username).to.eq(testData.username);
        expect(user.password).to.eq(testData.password);
        expect(user.isAdmin).to.eq(testData.isAdmin);
        expect(user.isDisabled).to.eq(testData.isDisabled);

    });

/*
    it('should create a user ', function () {

        console.log(User);
        const oldUserStatics = User.statics;

        User.statics = function(user){
            expect(user.username).to.eq(newUser.username);
            // TODO: Nedenstående fejler nok pga. hashing
            expect(user.password).to.eq(newUser.password);
            expect(user.isAdmin).to.eq(newUser.isAdmin);
            expect(user.isDisabled).to.eq(newUser.isDisabled);

            return User.statics;
        };

        const newUser = {
            username: "testUser01",
            password: "12345678",
            isAdmin: true,
            isDisabled: false
        };

        const testDataUser = new User({
            username: "testUser01",
            password: "12345678",
            isAdmin: true,
            isDisabled: false
        });

        Object.assign(User.statics, oldUserStatics);

        User.statics.save = function saveMock(){
            return {exec: function (){
                return Promise.resolve()
                }
            }
        };

        return User.statics.createUser(newUser);
    });
*/
    it('should change username', function () {
        //TODO
    });

    it('should change password', function () {
            //TODO
    });

    it('should change admin user level', function () {
        //TODO
    });

    it('should change activity status', function () {
        //TODO
    });

});