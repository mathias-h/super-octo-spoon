const puppeteer = require("puppeteer");
const childProcess = require("child_process");
const mongoose = require("mongoose");
const { expect } = require("chai");
const fs = require("fs");
const rimraf = require("rimraf");
const moment = require("moment");
const session = require("express-session");

const { Order: OrderSchema } = require("../../models/order");
const { Consultant : ConsultantSchema } = require("../../models/consultant");
const { Season : SeasonSchema } = require("../../models/season");
const { Dynamic: DynamicSchema } = require("../../models/dynamic");
const { createApp } = require("../../app");

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

describe("order integration test", () => {
    let server;
    let db;
    let browser;
    let page;
    let Order;
    let Consultant;
    let Dynamic;
    let Season;

    before(async () => {
        const dataPath = __dirname + "/../test-data";
        rimraf.sync(dataPath);
        fs.mkdirSync(dataPath);

        db = childProcess.spawn("mongod", ["--port", "27018", "--dbpath", dataPath]);
        await sleep(1500); // sleep to wait for db to start

        mongoose.Promise = global.Promise;
        const connection = await mongoose.createConnection("mongodb://localhost:27018/super-octo-spoon-test");

        Order = connection.models.Order || connection.model("Order", OrderSchema);
        Consultant = connection.models.Consultant || connection.model("Consultant", ConsultantSchema);
        Season = connection.models.Season || connection.model("Season", SeasonSchema);
        Dynamic = connection.models.Dynamic || connection.model("Dynamic", DynamicSchema);

        server = createApp({
            Order,
            Consultant,
            Season,
            Dynamic,
            session
        }).listen(1025);

        browser = await puppeteer.launch();

        page = await browser.newPage();
        await page.goto("http://localhost:1025/");

        await Consultant.remove({});

        const u = new Consultant({
            name: "admin",
            password: "pass",
            isAdmin: true,
            dummy: false
        });
        await u.save();

        await page.evaluate(() => {
            document.getElementById("inputConsultantname").value = "admin";
            document.getElementById("inputPassword").value = "pass";
            document.querySelector("button[type=submit]").click()
        });

        await page.waitForNavigation();
    });

    after(async () => {
        await mongoose.disconnect();
        await browser.close();
        server.close();
        db.kill()
    });

    beforeEach(async () => {
        await Dynamic.remove({});
        await Season.remove({});
        await Order.remove({});
        await Consultant.remove({ name: { $not: /^admin$/ }})
    });

    it("should show orders in overview", async () => {
        const season = new Season({
            season: "SEASON",
            default: true
        })
        await season.save()
        const order = new Order({
            season: season._id,
            consultant: mongoose.Types.ObjectId(),
            signedDate: new Date("2017-01-02"),
            name: "NAME",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            }
        });
        const order1 = new Order({
            season: season._id,
            consultant: mongoose.Types.ObjectId(),
            signedDate: new Date("2017-01-01"),
            name: "NAME",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            }
        });
        await order.save();
        await order1.save();

        await page.reload();
        
        const orderIds = await page.evaluate(() =>
            Array.from(document.querySelectorAll("tr.order"))
                .map(o => o.getAttribute("data-order-id")));

        expect(orderIds).to.deep.eq([order._id.toHexString(), order1._id.toHexString()])
    });

    it("should create order", async () => {
        const consultant = new Consultant({
            name: "CONSULTANTNAME",
            password: "PASSWORD",
            isAdmin: true,
            dummy: false
        });
        await consultant.save();
        await new Season({
            season: "SEASON1",
            default: true
        }).save();
        const season = new Season({
            season: "SEASON",
            default: false
        });
        await season.save();

        await page.reload();

        await page.evaluate((consultantId, seasonId) => {
            const modal = document.querySelector("#createOrderModal");
            
            $(modal).on("shown.bs.modal", () => {
                modal.querySelector("#orderSeason").value = seasonId;
                modal.querySelector("#inputConsultant").value = consultantId;
                modal.querySelector("#inputName").value = "NAME";
                modal.querySelector("#inputFarmName").value = "FARM_NAME";
                modal.querySelector("#inputStreet").value = "STREET";
                modal.querySelector("#inputZip").value = 9999;
                modal.querySelector("#inputCity").value = "CITY";
                modal.querySelector("#inputLandlineNumber").value = "88888888";
                modal.querySelector("#inputPhoneNumber").value = "99999999";
                modal.querySelector("#inputComment").value = "COMMENT";
                modal.querySelector("#inputSampleDensity").value = 1;
                modal.querySelector("#inputArea").value = 2;
                modal.querySelector("#inputSamePlanAsLast").checked = true;
                modal.querySelector("#inputTakeOwnSamples").checked = true;
    
                modal.querySelector("button[type=submit]").click()
            });

            document.querySelector("#navbarSupportedContent > ul > li:nth-child(2) > a").click();
        }, consultant._id, season._id);

        await page.waitForNavigation();

        const orders = await Order.find();
        const order = orders[0];

        expect(order.season.toHexString()).to.eq(season._id.toHexString());
        expect(order.consultant.toHexString()).to.eq(consultant._id.toHexString());
        expect(moment(order.signedDate).format("YYYY-MM-DD")).to.eq(moment(new Date()).format("YYYY-MM-DD"));
        expect(order.name).to.eq("NAME");
        expect(order.farmName).to.eq("FARM_NAME");
        expect(order.address.street).to.eq("STREET");
        expect(order.address.city).to.eq("CITY");
        expect(order.address.zip).to.eq(9999);
        expect(order.landlineNumber).to.eq("88888888");
        expect(order.phoneNumber).to.eq("99999999");
        expect(order.comment).to.eq("COMMENT");
        expect(order.sampleDensity).to.eq(1);
        expect(order.area).to.eq(2);
        expect(order.samePlanAsLast).to.be.true;
        expect(order.takeOwnSamples).to.be.true
    });

    it("should show order", () => {
        // TODO show fase 1
        // TODO show fase 2
        // TODO show fase 3
        // TODO show log
    });

    it("should delete order", () => {
        
    });

    it("should edit order", async () => {
        const consultant = new Consultant({
            name: "CONSULTANT",
            password: "PASSWORD",
            isAdmin: false,
            dummy: false
        });
        const consultant1 = new Consultant({
            name: "CONSULTANT1",
            password: "PASSWORD",
            isAdmin: false,
            dummy: false
        });
        const season = new Season({
            season: "SEASON",
            default: true
        });
        await season.save();
        const season1 = new Season({
            season: "SEASON1",
            default: false
        });
        await season1.save();

        await consultant.save();
        await consultant1.save();

        const order = new Order({
            season: season._id,
            consultant: consultant._id,
            signedDate: new Date("2017-01-01"),
            name: "NAME",
            farmName: "FARM_NAME",
            landlineNumber: "88888888",
            phoneNumber: "99999999",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            },
            comment: "COMMENT",
            sampleDensity: 1,
            area: 2,
            samePlanAsLast: true,
            takeOwnSamples: true,
            mapDate: new Date("1970-01-01"),
            sampleDate: new Date("1970-01-01"),
            sampleTime: 1,
            mgSamples: 1,
            cutSamples: 1,
            otherSamples: 1,
            samplesTaken: 1,
            labDate: new Date("1970-01-01"),
            fromLabDate: new Date("1970-01-01"),
            mO: new Date("1970-01-01"),
            receptApproved: new Date("1970-01-01"),
            sendToFarmer: new Date("1970-01-01"),
            sendBy: consultant._id,
            contactFarmer: true,
            wantsMap: true,
            appointments: "APPOINTMENTS",
            mapSendToFarmer: new Date("1970-01-01"),
            mapSendToMachineStation: new Date("1970-01-01"),
            fields: 1,
            areaMap: 1,
            done: true
        })
        await order.save();

        await page.reload();

        await page.evaluate((newConsultantId, newSeasonId) => {
            const modal = document.getElementById("editOrderModal");

            $(modal).on("shown.bs.modal", () => {
                modal.querySelector("#editOrderSeason").value = newSeasonId;
                modal.querySelector("#editInputConsultant").value = newConsultantId;
                modal.querySelector("#editInputName").value = "NEW_NAME";
                modal.querySelector("#editInputFarmName").value = "NEW_FARM_NAME";
                modal.querySelector("#editInputStreet").value = "NEW_STREET";
                modal.querySelector("#editInputZip").value = 8888;
                modal.querySelector("#editInputCity").value = "NEW_CITY";
                modal.querySelector("#editInputLandlineNumber").value = "77777777";
                modal.querySelector("#editInputPhoneNumber").value = "66666666";
                modal.querySelector("#editInputComment").value = "NEW_COMMENT";
                modal.querySelector("#editInputSampleDensity").value = 2;
                modal.querySelector("#editInputArea").value = 3;
                modal.querySelector("#editInputSamePlanAsLast").checked = false;
                modal.querySelector("#editInputTakeOwnSamples").checked = false;
                modal.querySelector("#inputMapDate").value = "1970-01-02";
                modal.querySelector("#inputSampleDate").value = "1970-01-02";
                modal.querySelector("#inputSampleTime").value = 2;
                modal.querySelector("#inputMgSamples").value = 2;
                modal.querySelector("#inputCutSamples").value = 2;
                modal.querySelector("#inputOtherSamples").value = 2;
                modal.querySelector("#inputSamplesTaken").value = 2;
                modal.querySelector("#inputLabDate").value = "1970-01-02";
                modal.querySelector("#inputFromLabDate").value = "1970-01-02";
                modal.querySelector("#inputMO").value = "1970-01-02";
                modal.querySelector("#inputReceptApproved").value = "1970-01-02";
                modal.querySelector("#inputSendToFarmer").value = "1970-01-02";
                modal.querySelector("#inputSendBy").value = newConsultantId;
                modal.querySelector("#inputContactFarmer").checked = false;
                modal.querySelector("#inputWantsMap").checked = false;
                modal.querySelector("#inputAppointments").value = "NEW_APPOINTMENTS";
                modal.querySelector("#inputMapSendToFarmer").value = "1970-01-02";
                modal.querySelector("#inputSendToMachineStation").value = "1970-01-02";
                modal.querySelector("#inputFields").value = 2;
                modal.querySelector("#inputAreaMap").value = 2;
                modal.querySelector("#inputDone").checked = false;

                modal.querySelector("#orderEditSave").click();
            });

            document.querySelector(".order").click();
        }, consultant1._id, season1._id);

        await page.waitForNavigation();

        const newOrder = await Order.findOne({ _id: order._id });

        expect(newOrder.season.toHexString()).to.eq(season1._id.toHexString());
        expect(newOrder.consultant.toHexString()).to.eq(consultant1._id.toHexString());
        expect(newOrder.name).to.eq("NEW_NAME");
        expect(newOrder.farmName).to.eq("NEW_FARM_NAME");
        expect(newOrder.address.street).to.eq("NEW_STREET");
        expect(newOrder.address.zip).to.eq(8888);
        expect(newOrder.address.city).to.eq("NEW_CITY");
        expect(newOrder.landlineNumber).to.eq("77777777");
        expect(newOrder.phoneNumber).to.eq("66666666");
        expect(newOrder.comment).to.eq("NEW_COMMENT");
        expect(newOrder.sampleDensity).to.eq(2);
        expect(newOrder.area).to.eq(3);
        expect(newOrder.samePlanAsLast).to.eq(false);
        expect(newOrder.takeOwnSamples).to.eq(false);
        expect(newOrder.mapDate).to.deep.eq(new Date("1970-01-02"));
        expect(newOrder.sampleDate).to.deep.eq(new Date("1970-01-02"));
        expect(newOrder.sampleTime).to.eq(2);
        expect(newOrder.mgSamples).to.eq(2);
        expect(newOrder.cutSamples).to.eq(2);
        expect(newOrder.otherSamples).to.eq(2);
        expect(newOrder.samplesTaken).to.eq(2);
        expect(newOrder.labDate).to.deep.eq(new Date("1970-01-02"));
        expect(newOrder.fromLabDate).to.deep.eq(new Date("1970-01-02"));
        expect(newOrder.mO).to.deep.eq(new Date("1970-01-02"));
        expect(newOrder.receptApproved).to.deep.eq(new Date("1970-01-02"))
        expect(newOrder.sendToFarmer.getTime()).to.eq(new Date("1970-01-02").getTime())
        expect(newOrder.sendBy.toHexString()).to.eq(consultant1._id.toHexString())
        expect(newOrder.contactFarmer).to.eq(false)
        expect(newOrder.wantsMap).to.eq(false)
        expect(newOrder.appointments).to.eq("NEW_APPOINTMENTS")
        expect(newOrder.mapSendToFarmer.getTime()).to.eq(new Date("1970-01-02").getTime())
        expect(newOrder.mapSendToMachineStation.getTime()).to.eq(new Date("1970-01-02").getTime())
        expect(newOrder.fields).to.eq(2)
        expect(newOrder.areaMap).to.eq(2)
        expect(newOrder.done).to.eq(false)
    });

    it("should search", async () => {
        const season = new Season({
            season: "SEASON",
            default: true
        })
        await season.save()
        const consultant = new Consultant({
            name: "CONSULTANT",
            password: "PASS",
            isAdmin: false
        });
        await consultant.save();
        const order = new Order({
            season: season._id,
            consultant: consultant._id,
            signedDate: new Date("2017-01-02"),
            name: "X",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            }
        });
        const order1 = new Order({
            season: season._id,
            consultant: consultant._id,
            signedDate: new Date("2017-01-01"),
            name: "Y",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            }
        });
        await order.save();
        await order1.save();

        await page.reload();

        await page.evaluate(() => {
            $("#search input").val("X");

            $("#search").submit()
        });

        await page.waitForNavigation();

        const orderIds = await page.evaluate(() =>
        Array.from(document.querySelectorAll("tr.order"))
            .map(o => o.getAttribute("data-order-id")));

        expect(orderIds).to.deep.eq([order._id.toHexString()]);

        await page.goto("http://localhost:1025/");
    });

    it("should sort orders", async () => {
        const season = new Season({
            season: "SEASON",
            default: true
        })
        await season.save()
        const consultant = new Consultant({
            name: "CONSULTANT",
            password: "PASS",
            isAdmin: false
        });
        await consultant.save();
        const order = new Order({
            season: season._id,
            consultant: consultant._id,
            signedDate: new Date("2017-01-02"),
            name: "B",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            }
        });
        const order1 = new Order({
            season: season._id,
            consultant: consultant._id,
            signedDate: new Date("2017-01-01"),
            name: "A",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            }
        });
        await order.save();
        await order1.save();

        await page.reload();

        await page.evaluate(() => {
            $("#name").click()
        });

        await page.waitForNavigation();

        const orderIds = await page.evaluate(() =>
            Array.from(document.querySelectorAll("tr.order"))
                .map(o => o.getAttribute("data-order-id")));

        expect(orderIds).to.deep.eq([
            order1._id.toHexString(),
            order._id.toHexString()
        ]);

        await page.goto("http://localhost:1025/");
    });

    it("should display statistics", async () => {
        const consultant = new Consultant({
            name: "CONSULTANT",
            password: "PASS",
            isAdmin: false
        });
        await consultant.save();
        const season = new Season({
            season: "season",
            default: true
        })
        await season.save();
        const order = new Order({
            season: season._id,
            consultant: consultant._id,
            signedDate: new Date("2017-01-02"),
            name: "NAME",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            },
            area: 3,
            samplesTaken: 3
        });
        const order1 = new Order({
            season: season._id,
            consultant: consultant._id,
            signedDate: new Date("2017-01-01"),
            name: "NAME",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            },
            area: 3,
            samplesTaken: 3,
        });
        await order.save();
        await order1.save();

        await page.reload();

        await page.evaluate(() => {
            $("#name").click()
        });

        await page.waitForNavigation();

        const { totalSamples, totalTaken } = await page.evaluate(() => {
            const totalMatch = $("#navbar-statistics").text().match(/Prøver udtaget: (\d+)\s*\/\s*(\d+)/)

            if (!totalMatch) throw new Error("no match")

            const [_,totalSamples,totalTaken] = totalMatch.map(Number)
            return { totalSamples, totalTaken }
        });

        expect(totalSamples).to.eq(6);
        expect(totalTaken).to.eq(6)
    });

    it("should create consultant", async () => {
        await page.reload()

        await page.evaluate(() => {
            $("#adminModal").on("shown.bs.modal", () => {
                $("#inputCreateConsultant-consultant").val("CONSULTANT");
                $("#inputCreateConsultant-isSuperUser").prop("checked", true);
                $("#inputCreateConsultant-password").val("Pa55word");
                $("#inputCreateConsultant-passwordRepeat").val("Pa55word");

                $("#createConsultantForm button[type=submit]").click()
            });

            $("#navbarSupportedContent > ul > li:nth-child(3) > a").click();
        });

        await page.waitForNavigation();

        const consultants = await Consultant.find()
        const consultant = consultants[1]

        expect(consultant.name).to.eq("CONSULTANT");
        expect(consultant.isAdmin).to.be.true;
        expect(consultant.dummy).to.be.false
    });

    it("should update consultant", async () => {
        const consultant = new Consultant({
            name: "CONSULTANT",
            password: "PASS",
            isAdmin: true,
            dummy: false
        });
        await consultant.save();

        await page.reload();

        await page.evaluate(() => {
            $("#adminModal").on("shown.bs.modal", () => {
                const consultants = document.querySelectorAll("#adminModal .consultant");
                const consultant = consultants[1];

                consultant.querySelector(".editConsultantName").value = "NEW_CONSULTANT_NAME";
                consultant.querySelector(".editConsultantIsAdmin").checked = false;
                consultant.querySelector(".editConsultantPasswordBtn").click();
                consultant.querySelector(".editConsultantPassword").value= "NEW_Pa55";

                consultant.querySelector(".editConsultantSaveBtn").click()
            });
               
            $("#navbarSupportedContent > ul > li:nth-child(3) > a").click();
        });

        await page.waitForNavigation();

        const newConsultant = await Consultant.findById(consultant._id);

        expect(newConsultant.name).to.eq("NEW_CONSULTANT_NAME");
        expect(newConsultant.isAdmin).to.be.false;
        expect(newConsultant.password).to.not.eq(consultant.password)
    });

    it("should set season", async () => {
        const season1718 = new Season({
            season: "Sæson 17/18",
            default: true
        });
        await season1718.save();
        const season1819 = new Season({
            season: "Sæson 18/19",
            default: false
        });
        await season1819.save();
        const order = new Order({
            season: season1718._id,
            consultant: mongoose.Types.ObjectId(),
            signedDate: new Date("2017-01-02"),
            name: "NAME",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            }
        });
        await order.save();
        const order1 = new Order({
            season: season1819._id,
            consultant: mongoose.Types.ObjectId(),
            signedDate: new Date("2017-01-01"),
            name: "NAME",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            }
        });
        await order1.save();
        await page.reload();

        await page.evaluate((seasonId) => {
            $("#season").val(seasonId)
            $("#season")[0].dispatchEvent(new CustomEvent("change"))
        }, season1819._id);

        await page.waitForNavigation();

        const orderIds = await page.evaluate(() =>
            Array.from(document.querySelectorAll("tr.order"))
                .map(o => o.getAttribute("data-order-id")));

        expect(orderIds).to.deep.eq([order1._id.toHexString()])

        await page.goto("http://localhost:1025/")
    });

    it("should create season", async () => {
        await page.reload();

        await page.evaluate(() => {
            $("#adminModal").on("shown.bs.modal", () => {
                const seasons = document.querySelectorAll("#season");
                const season = seasons[0];
                
                $("#seasonInput").val("19/20");
                $("#createSeasonSubmit").click();
            });

            $("#navbarSupportedContent > ul > li:nth-child(3) > a").click();
        });

        await page.waitForNavigation();

        const seasons = await Season.find();
        const season = seasons[0];

        expect(season.season).to.eq("19/20");
    });

    it("should edit season", async () => {
        const season = new Season({
            season: "SEASON",
            default: true
        });
        await season.save();

        await page.reload();

        await page.evaluate(() => {
            $("#adminModal").on("shown.bs.modal", () => {
                const season = document.querySelector(".season");

                season.querySelector(".editSeasonInput").value = "NEW_SEASON";

                season.querySelector(".editSeasonSaveBtn").click();
            });

            $("#navbarSupportedContent > ul > li:nth-child(3) > a").click();
        });

        await page.waitForNavigation();

        const newSeason = await Season.findOne({ _id: season._id });

        expect(newSeason.season).to.eq("NEW_SEASON");
    });

    it("should set default season");
    it("should create dynamic");
    it("should delete dynamic");
});