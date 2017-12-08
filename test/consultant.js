"use strict";

const { expect } = require("chai");
const mongoose = require("mongoose");
const childProcess = require("child_process");
const rimraf = require("rimraf");
const fs = require("fs");
const bcrypt = require('bcrypt');
const { Order: OrderSchema } = require("../models/order");
const { Consultant: ConsultantSchema } = require("../models/consultant");
const { Season: SeasonSchema } = require("../models/season");
const { Dynamic: DynamicSchema } = require("../models/dynamic");

mongoose.Promise = global.Promise;

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

describe("consultant tests", () => {

    let db;
    let Consultant;
    let consultantData;
    let Dynamic;
    let Order;
    let Season;

    async function createConsultant(data = {}) {
        const d = {
            name: "testConsultant01",
            password: "testConsultant01Password",
            isAdmin: true,
            dummy: false
        };

        const consultant = new Consultant(Object.assign(d, data));
        await consultant.save();
        return consultant;
    }

    before(async () => {

        const dataPath = __dirname + '/test-data-consultant';
        rimraf.sync(dataPath);
        fs.mkdirSync(dataPath);

        db = childProcess.spawn("mongod", ["--port", "27018", "--dbpath", dataPath]);

        await sleep(500);

        mongoose.Promise = global.Promise;
        const connection = await mongoose.createConnection("mongodb://localhost:27018/super-octo-spoon");
        //Dynamic = connection.models.Dynamic || connection.model("Dynamic", DynamicSchema);
        Order = connection.models.Order || connection.model("Order", OrderSchema);
        Season = connection.models.Season || connection.model("Season", SeasonSchema);
        Consultant = connection.models.Consultant || connection.model("Consultant", ConsultantSchema);

    });

    after(async () => {
        await mongoose.disconnect();
        await db.kill();
        const dataPath = __dirname + '/test-data-consultant';
        rimraf.sync(dataPath);

    });

    beforeEach(async () => {

        await Order.remove({});
        await Season.remove({});
        await Consultant.remove({});

        consultantData = {
            name: "testConsultant",
            password: "testPassword",
            isAdmin: false,
            dummy: false
        };

        await Consultant.createConsultant(consultantData);

        const consultDataArr = [
            {
                "name": "superuser",
                "password": "5up3r53cr37P455w0rd",
                "isAdmin": true,
                "dummy": false
            },
            {
                "name": "admin",
                "password": "admin",
                "isAdmin": false,
                "dummy": false
            },
            {
                "name": "Slettet bruger",
                "password": "dummy",
                "isAdmin": false,
                "dummy": true
            },
            {
                "name": "MH",
                "password": "MHPassword",
                "isAdmin": false,
                "dummy": false
            },
            {
                "name": "MJ",
                "password": "MJPassword",
                "isAdmin": false,
                "dummy": false
            },
            {
                "name": "NL",
                "password": "NLPassword",
                "isAdmin": false,
                "dummy": false
            },
            {
                "name": "NK",
                "password": "NKPassword",
                "isAdmin": false,
                "dummy": false
            }
        ];

        const orderDataArr = [
            {
                "consultant": "MH",
                "signedDate": new Date("1/1/2017"),
                "landlineNumber": "88888888",
                "phoneNumber": "20202020",
                "name": "NN1",
                "farmName": "Bondegården",
                "address": {
                    "street": "Markvejen 1",
                    "city": "Bondeby",
                    "zip": "8123"
                },
                "comment": "Ring efter høst",
                "sampleDensity": 1,
                "samePlanAsLast": true,
                "takeOwnSamples": true,
                "area": 100
            },
            {
                "consultant": "MJ",
                "signedDate": new Date("1/1/2017"),
                "landlineNumber": "88888889",
                "phoneNumber": "20202020",
                "name": "NN1",
                "farmName": "Bondegården",
                "address": {
                    "street": "Markvejen 2",
                    "city": "Bondeby",
                    "zip": "8123"
                },
                "comment": "Ring før høst",
                "sampleDensity": 1,
                "samePlanAsLast": true,
                "takeOwnSamples": true,
                "area": 100
            },
            {
                "consultant": "NL",
                "signedDate": new Date("1/1/2017"),
                "landlineNumber": "88888888",
                "phoneNumber": "20202020",
                "name": "NN1",
                "farmName": "Bondegården",
                "address": {
                    "street": "Markvejen 12",
                    "city": "TestAArhus",
                    "zip": "8000"
                },
                "comment": "Ring under høst",
                "sampleDensity": 1,
                "samePlanAsLast": true,
                "takeOwnSamples": true,
                "area": 100
            },
            {
                "consultant": "NL",
                "signedDate": new Date("1/1/2017"),
                "landlineNumber": "88888888",
                "phoneNumber": "20202020",
                "name": "NN1",
                "farmName": "Bondegården",
                "address": {
                    "street": "Markvejen 12",
                    "city": "Aarhus",
                    "zip": "8000"
                },
                "comment": "Ring under høst",
                "sampleDensity": 1,
                "samePlanAsLast": true,
                "takeOwnSamples": true,
                "area": 100
            },
            {
                "consultant": "NK",
                "signedDate": new Date("1/1/2017"),
                "landlineNumber": "88888888",
                "phoneNumber": "20202020",
                "name": "NN1",
                "farmName": "Bondegården",
                "address": {
                    "street": "Markvejen 3",
                    "city": "Bondeby",
                    "zip": "8123"
                },
                "comment": "Ring under høst",
                "smapleDensity": 1,
                "samePlanAsLast": true,
                "takeOwnSamples": true,
                "area": 100
            }
        ];

        //TODO populate db with dummy consultant, admin and 2 regular consultants
        //TODO populate db with orders references both regular consultants

        await Season.createSeason("2017/2018");

    });

    describe('create consultant', function () {
        it('should create a consultant', async () => {

            const newConsultant = await Consultant.findOne({name: consultantData.name});

            expect(newConsultant.name).to.eq(consultantData.name);

            expect(newConsultant.password).to.be.ok.and.not.to.eq(consultantData.password);
            expect(newConsultant.password).to.exist.and.not.to.eq(consultantData.password);
            const compareResult = bcrypt.compareSync(consultantData.password, newConsultant.password);
            expect(compareResult).to.eq(true);

            expect(newConsultant.isAdmin).to.eq(consultantData.isAdmin);
            expect(newConsultant.dummy).to.eq(consultantData.dummy);

        });
    });

    describe('edit consultant', function () {
        it('should change the consultants name', async function () {

            const updateData = {
                name: "newConsultantName"
            };

            const consultant = await Consultant.findOne();
            await Consultant.updateConsultant(consultant._id, updateData);

            const updatedConsultant = await Consultant.findById(consultant._id);

            expect(updatedConsultant.name).to.eq(updateData.name);

        });

        it('should change the consultants password', async function () {
            const updateData = {
                password: "newPassword"
            };

            const consultant = await Consultant.findOne();
            const updateResult = await Consultant.updateConsultant(consultant._id, updateData);

            const updatedConsultant = await Consultant.findById(consultant._id);

            expect(updatedConsultant.password).not.to.eq(updateData.password);
            expect(updatedConsultant.password).not.to.eq(consultant.password);
        });

        it('should change admin level of the consultant', async function () {

            const consultant = await Consultant.findOne();

            const updateData = {
                isAdmin: false,
            };

            let updateResult = await Consultant.updateConsultant(consultant._id, updateData);
            let updatedConsultant = await Consultant.findById(consultant._id);

            expect(updatedConsultant.isAdmin).is.eq(false);

            updateData.isAdmin = true;

            updateResult = await Consultant.updateConsultant(consultant._id, updateData);
            updatedConsultant = await Consultant.findById(consultant._id);

            expect(updatedConsultant.isAdmin).is.eq(true);

        });

        // TODO rewrite or remove
        it('should change activity status', async function () {
            const consultant = await Consultant.findOne();

            const updateData = {
                dummy: false,
            };

            let updateResult = await Consultant.updateConsultant(consultant._id, updateData);
            let updatedConsultant = await Consultant.findById(consultant._id);

            expect(updatedConsultant.dummy).is.eq(false);

            updateData.dummy = true;

            updateResult = await Consultant.updateConsultant(consultant._id, updateData);
            updatedConsultant = await Consultant.findById(consultant._id);

            expect(updatedConsultant.dummy).is.eq(true);
        });
    });

    describe('match passwords', function () {
        it('should compare passwords and return true if they match else false', async function () {
            const consultant = await Consultant.findOne();

            const mismatchResult1 = (await Consultant.matchPasswords(consultant.name, "wrongPassword")).status;
            const matchResult1 = (await Consultant.matchPasswords(consultant.name, "testPassword")).status;

            expect(mismatchResult1).is.eq(false);
            expect(matchResult1).is.eq(true);

            const updateData = {
                password: "5up3r53r37P455w0rd",
            };

            let updateResult = await Consultant.updateConsultant(consultant._id, updateData);
            let updatedConsultant = await Consultant.findById(consultant._id);

            const mismatchResult2 = (await Consultant.matchPasswords(updatedConsultant.name, "wrongPassword")).status;
            const matchResult2 = (await Consultant.matchPasswords(updatedConsultant.name, updateData.password)).status;

            expect(mismatchResult2).is.eq(false);
            expect(matchResult2).is.eq(true);
        });
    });

    // todo - test for delete consultant

    describe('Testing delete consultant', function () {

        it('should delete a consultant ' +
            'and update all orders referencing this consultant to reference the dummy consultant instead');
    });

});