"use strict";

const { expect } = require("chai");
const mongoose = require("mongoose");
const moment = require("moment");
const childProcess = require("child_process");
const rimraf = require("rimraf");
const fs = require("fs");
const { User: UserSchema } = require("../models/user");

mongoose.Promise = global.Promise;

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

describe("user tests", () => {

    let db;
    let User;
    let userData;
    let newUser;

    async function createUser(data = {}) {
        const d = {
            username: "ndlarsen",
            password: "1Qqqqqqq",
            isAdmin: true,
            isDisabled: false
        };

        const user = new User(Object.assign(d, data));
        await user.save();
        return user;
    }

    before(async () => {
        const dataPath = __dirname + '/test-data-users';
        rimraf.sync(dataPath);
        fs.mkdirSync(dataPath);

        db = childProcess.spawn("mongod", ["--port", "27018", "--dbpath", dataPath]);

        await sleep(500);

        mongoose.Promise = global.Promise;
        const connection = await mongoose.createConnection("mongodb://localhost:27018/super-octo-spoon");

        User = connection.models.User || connection.model("User", UserSchema);

    });

    after(async () => {
        await mongoose.disconnect();
        await db.kill();
        const dataPath = __dirname + '/test-data-users';
        rimraf.sync(dataPath);

    });

    beforeEach(async () => {
        await User.remove({});

        userData = {
            username: "TESTUSER",
            password: "TESTPASSWORD",
            isAdmin: false,
            isDisabled: false
        };

        await User.createUser(userData);

    });

    describe('create user', function () {
        it('should create a user', async () => {

            // TODO - ryd op hvis alle tests er ok.
            /*
            const userData = {
                username: "TESTUSER",
                password: "TESTPASSWORD",
                isAdmin: false,
                isDisabled: false
            };

            await User.createUser(userData);
            */

            const newUser = await User.findOne();

            expect(newUser.username).to.eq(userData.username);
            //TODO - Vi skal have fundet en bedre måde at teste password på. Problemet er at det pt. bliver hashed i en
            //TODO - pre og der med aldrig vil være lig med test password.
            expect(newUser.password).to.be.ok.and.not.to.eq(userData.password);
            expect(newUser.password).to.exist.and.be.not.to.eq(userData.password);

            expect(newUser.isAdmin).to.eq(userData.isAdmin);
            expect(newUser.isDisabled).to.eq(userData.isDisabled);

        });
    });

    describe('edit user', function () {
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

});