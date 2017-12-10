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
    let Dynamic;
    let Order;
    let Season;

    before(async () => {

        const dataPath = __dirname + '/test-data';

        rimraf.sync(dataPath);
        fs.mkdirSync(dataPath);

        db = await childProcess.spawn("mongod", ["--port", "27018", "--dbpath", dataPath]);

        await sleep(500);

        mongoose.Promise = global.Promise;
        const connection = await mongoose.createConnection("mongodb://localhost:27018/super-octo-spoon");
        Dynamic = connection.models.Dynamic || connection.model("Dynamic", DynamicSchema);
        Order = connection.models.Order || connection.model("Order", OrderSchema);
        Season = connection.models.Season || connection.model("Season", SeasonSchema);
        Consultant = connection.models.Consultant || connection.model("Consultant", ConsultantSchema);

    });

    after(() => {
        mongoose.disconnect();
        db.kill();
        const dataPath = __dirname + '/test-data';
        rimraf.sync(dataPath);
    });

    beforeEach(async () => {

        await Season.remove({});
        await Order.remove({});
        await Consultant.remove({});

    });

    describe('create consultant', function () {
        it('should create a consultant', async () => {

            const consultantData = {
                name: "testConsultant01",
                password: "testConsultant01Password",
                isAdmin: true,
                dummy: false
            };

            await Consultant.createConsultant(consultantData);

            const newConsultant = await Consultant.findOne({});

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

            const consultantData = {
                name: "testConsultant01",
                password: "testConsultant01Password",
                isAdmin: true,
                dummy: false
            };

            await Consultant.createConsultant(consultantData);

            const consultant = await Consultant.findOne();

            const updateData = {
                name: "newConsultantName"
            };

            await Consultant.updateConsultant(consultant._id, updateData);

            const updatedConsultant = await Consultant.findById(consultant._id);

            expect(updatedConsultant.name).to.eq(updateData.name);
            expect(updatedConsultant.password).to.be.ok.and.not.to.eq(consultantData.password);
            expect(updatedConsultant.password).to.exist.and.not.to.eq(consultantData.password);
            const compareResult = bcrypt.compareSync(consultantData.password, updatedConsultant.password);
            expect(compareResult).to.eq(true);

            expect(updatedConsultant.isAdmin).to.eq(consultantData.isAdmin);
            expect(updatedConsultant.dummy).to.eq(consultantData.dummy);


        });

        it('should change the consultants password', async function () {
            const consultantData = {
                name: "testConsultant01",
                password: "testConsultant01Password",
                isAdmin: true,
                dummy: false
            };

            await Consultant.createConsultant(consultantData);

            const consultant = await Consultant.findOne();

            const updateData = {
                password: "newPassword"
            };

            const foundDonsultant = await Consultant.findOne();
            const updateResult = await Consultant.updateConsultant(consultant._id, updateData);

            const updatedConsultant = Consultant.findById(consultant._id);

            expect(updatedConsultant.password).not.to.eq(updateData.password);
            expect(updatedConsultant.password).not.to.eq(consultant.password);
        });

        it('should change admin level of the consultant', async function () {

            const consultantData = {
                name: "testConsultant01",
                password: "testConsultant01Password",
                isAdmin: true,
                dummy: false
            };

            await Consultant.createConsultant(consultantData);

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

    });

    describe('match passwords', function () {
        it('should compare passwords and return true if they match else false', async function () {

            const consultantData = {
                name: "testConsultant01",
                password: "testConsultant01Password",
                isAdmin: true,
                dummy: false
            };

            await Consultant.createConsultant(consultantData);

            const consultant = await Consultant.findOne();

            const mismatchResult1 = await Consultant.matchPasswords(consultant.name, "wrongPassword");
            const matchResult1 = await Consultant.matchPasswords(consultant.name, consultantData.password);

            expect(mismatchResult1.status).is.eq(false);
            expect(matchResult1.status).is.eq(true);

            const updateData = {
                password: "5up3r53r37P455w0rd",
            };

            let updateResult = await Consultant.updateConsultant(consultant._id, updateData);
            let updatedConsultant = await Consultant.findById(consultant._id);

            const mismatchResult2 = await Consultant.matchPasswords(updatedConsultant.name, "wrongPassword");
            const matchResult2 = await Consultant.matchPasswords(updatedConsultant.name, updateData.password);

            expect(mismatchResult2.status).is.eq(false);
            expect(matchResult2.status).is.eq(true);
        });
    });

    // todo - test for delete consultant

    describe('Testing delete consultant', function () {

        it('should delete a consultant ' +
            'and update all orders referencing this consultant to reference the dummy consultant instead', async function () {

            const orderDataArr = [
                {
                    consultant: undefined,
                    season: undefined,
                    signedDate: new Date("1/1/2017"),
                    landlineNumber: "88888888",
                    phoneNumber: "20202020",
                    name: "NN1",
                    farmName: "Bondegården",
                    address: {
                        "street": "Markvejen 1",
                        "city": "Bondeby",
                        "zip": "8123"
                    },
                    comment: "Ring efter høst",
                    sampleDensity: 1,
                    samePlanAsLast: true,
                    takeOwnSamples: true,
                    area: 100
                },
                {
                    consultant: undefined,
                    season: undefined,
                    signedDate: new Date("1/1/2017"),
                    landlineNumber: "88888889",
                    phoneNumber: "20202020",
                    name: "NN1",
                    farmName: "Bondegården",
                    address: {
                        "street": "Markvejen 2",
                        "city": "Bondeby",
                        "zip": "8123"
                    },
                    comment: "Ring før høst",
                    sampleDensity: 1,
                    samePlanAsLast: true,
                    takeOwnSamples: true,
                    area: 100
                },
                {
                    consultant: undefined,
                    season: undefined,
                    signedDate: new Date("1/1/2017"),
                    landlineNumber: "88888888",
                    phoneNumber: "20202020",
                    name: "NN1",
                    farmName: "Bondegården",
                    address: {
                        "street": "Markvejen 12",
                        "city": "TestAArhus",
                        "zip": "8000"
                    },
                    comment: "Ring under høst",
                    sampleDensity: 1,
                    samePlanAsLast: true,
                    takeOwnSamples: true,
                    area: 100
                },
                {
                    consultant: undefined,
                    season: undefined,
                    signedDate: new Date("1/1/2017"),
                    landlineNumber: "88888888",
                    phoneNumber: "20202020",
                    name: "NN1",
                    farmName: "Bondegården",
                    address: {
                        "street": "Markvejen 12",
                        "city": "Aarhus",
                        "zip": "8000"
                    },
                    comment: "Ring under høst",
                    sampleDensity: 1,
                    samePlanAsLast: true,
                    takeOwnSamples: true,
                    area: 100
                },
                {
                    consultant: undefined,
                    season: undefined,
                    signedDate: new Date("1/1/2017"),
                    landlineNumber: "88888888",
                    phoneNumber: "20202020",
                    name: "NN1",
                    farmName: "Bondegården",
                    address: {
                        "street": "Markvejen 3",
                        "city": "Bondeby",
                        "zip": "8123"
                    },
                    comment: "Ring under høst",
                    smapleDensity: 1,
                    samePlanAsLast: true,
                    takeOwnSamples: true,
                    area: 100
                }
            ];

            const adminData = {
                "name": "admin",
                "password": "admin",
                "isAdmin": true,
                "dummy": false
            };

            await Consultant.createConsultant(adminData);

            const dummyData = {
                "name": "dummy",
                "password": "dummy",
                "isAdmin": false,
                "dummy": true
            };

            await Consultant.createConsultant(dummyData);
            const dummy = await Consultant.findOne({name: 'dummy'});

            const consultantData = {
                name: "testConsultant01",
                password: "testConsultant01Password",
                isAdmin: true,
                dummy: false
            };

            await Consultant.createConsultant(consultantData);

            await Season.createSeason("2017/2018");

            const season = await Season.findOne();

            const foundConsultant = await Consultant.findOne({name: consultantData.name});

            for(let i = 0; i < orderDataArr.length; i++){
                orderDataArr[i].consultant = foundConsultant._id;
                orderDataArr[i].season = season._id;

                await Order.createOrder(orderDataArr[i]);
            }

            const foundOrders = await Order.find();

            for(let i = 0; i < foundOrders.length; i++){
                expect(foundOrders[i].consultant === foundConsultant._id);
            }

            await Consultant.deleteConsultant(foundConsultant._id);

            for(let i = 0; i < foundOrders.length; i++){
                expect(foundOrders[i].consultant === dummy._id);
            }

        });
    });

});