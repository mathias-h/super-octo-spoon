"use strict";

const { expect } = require("chai");
const mongoose = require("mongoose");
const moment = require("moment");
const childProcess = require("child_process");
const rimraf = require("rimraf");
const fs = require("fs");
const bcrypt = require('bcrypt');
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
            username: "testUser01",
            password: "testUser01Password",
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

            const newUser = await User.findOne();

            expect(newUser.username).to.eq(userData.username);

            expect(newUser.password).to.be.ok.and.not.to.eq(userData.password);
            expect(newUser.password).to.exist.and.not.to.eq(userData.password);
            const compareResult = bcrypt.compareSync(userData.password, newUser.password);
            expect(compareResult).to.eq(true);

            expect(newUser.isAdmin).to.eq(userData.isAdmin);
            expect(newUser.isDisabled).to.eq(userData.isDisabled);

        });
    });

    describe('edit user', function () {
        it('should change username', async function () {

            const updateData = {
                username: "NEWUSERNAME"
            };

            const user = await User.findOne();
            await User.updateUser(user._id, updateData);

            const updatedUser = await User.findById(user._id);

            expect(updatedUser.username).to.eq(updateData.username);

        });

        it('should change password', async function () {
            const updateData = {
                password: "NEWPASSWORD"
            };

            const user = await User.findOne();
            const updateResult = await User.updateUser(user._id, updateData);

            const updatedUser = await User.findById(user._id);

            expect(updatedUser.password).not.to.eq(updateData.password);
            expect(updatedUser.password).not.to.eq(user.password);
        });

        it('should change admin user level', async function () {

            const user = await User.findOne();

            const updateData = {
                isAdmin: false,
            };

            let updateResult = await User.updateUser(user._id, updateData);
            let updatedUser = await User.findById(user._id);

            expect(updatedUser.isAdmin).is.eq(false);

            updateData.isAdmin = true;

            updateResult = await User.updateUser(user._id, updateData);
            updatedUser = await User.findById(user._id);

            expect(updatedUser.isAdmin).is.eq(true);

        });

        it('should change activity status', async function () {
            const user = await User.findOne();

            const updateData = {
                isDisabled: false,
            };

            let updateResult = await User.updateUser(user._id, updateData);
            let updatedUser = await User.findById(user._id);

            expect(updatedUser.isDisabled).is.eq(false);

            updateData.isDisabled = true;

            updateResult = await User.updateUser(user._id, updateData);
            updatedUser = await User.findById(user._id);

            expect(updatedUser.isDisabled).is.eq(true);
        });
    });

    describe('match passwords', function () {
        it('should compare passwords and return true if they match else false', async function () {
            const user = await User.findOne();

            const mismatchResult1 = (await User.matchPasswords(user.username, "WRONGPASSWORD")).status;
            const matchResult1 = (await User.matchPasswords(user.username, "TESTPASSWORD")).status;

            expect(mismatchResult1).is.eq(false);
            expect(matchResult1).is.eq(true);

            const updateData = {
                password: "5up3r53r37P455w0rd",
            };

            let updateResult = await User.updateUser(user._id, updateData);
            let updatedUser = await User.findById(user._id);

            const mismatchResult2 = (await User.matchPasswords(updatedUser.username, "WRONGPASSWORD")).status;
            const matchResult2 = (await User.matchPasswords(updatedUser.username, updateData.password)).status;

            expect(mismatchResult2).is.eq(false);
            expect(matchResult2).is.eq(true);
        });
    });

});