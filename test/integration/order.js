const puppeteer = require("puppeteer")
const childProcess = require("child_process")
const mongoose = require("mongoose")
const { expect } = require("chai")
const fs = require("fs")
const rimraf = require("rimraf")
const moment = require("moment")
const session = require("express-session")

const { Order: OrderSchema } = require("../../models/order")
const { Consultant : ConsultantSchema } = require("../../models/consultant")
const { Season : SeasonSchema } = require("../../models/season")
const { Dynamic: DynamicSchema } = require("../../models/dynamic")
const { createApp } = require("../../app")

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

describe("order integration test", () => {
    let server
    let db
    let browser
    let page
    let Order
    let Consultant
    let Dynamic
    let Season
    
    before(async () => {
        const dataPath = __dirname + "/../test-data"
        rimraf.sync(dataPath)
        fs.mkdirSync(dataPath)

        db = childProcess.spawn("mongod", ["--port", "27018", "--dbpath", dataPath])
        
        await sleep(500)

        mongoose.Promise = global.Promise;
        const connection = await mongoose.createConnection("mongodb://localhost:27018/super-octo-spoon-test");

        Order = connection.models.Order || connection.model("Order", OrderSchema)
        Consultant = connection.models.Consultant || connection.model("Consultant", ConsultantSchema)
        Season = connection.models.Season || connection.model("Season", SeasonSchema)
        Dynamic = connection.models.Dynamic || connection.model("Dynamic", DynamicSchema)

        server = createApp({
            Order,
            Consultant,
            Season,
            Dynamic,
            session
        }).listen(1025);

        browser = await puppeteer.launch({ headless: false, devtools: true })

        page = await browser.newPage()
        await page.goto("http://localhost:1025/")

        await Consultant.remove({})

        const u = new Consultant({
            name: "admin",
            password: "pass",
            isAdmin: true,
            dummy: false
        })
        await u.save()

        await page.evaluate(() => {
            document.getElementById("inputConsultantname").value = "admin"
            document.getElementById("inputPassword").value = "pass"
            document.querySelector("button[type=submit]").click()
        })
    })

    after(async () => {
        await mongoose.disconnect()
        //await browser.close()
        server.close()
        db.kill()
    })

    beforeEach(async () => {
        await Order.remove({})
        await Consultant.remove({ name: { $not: /^admin$/ }})
    })

    it("should show orders in overview", async () => {
        const order = new Order({
            season: mongoose.Types.ObjectId(),
            consultant: mongoose.Types.ObjectId(),
            signedDate: new Date("2017-01-02"),
            name: "NAME",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            }
        })
        const order1 = new Order({
            season: mongoose.Types.ObjectId(),
            consultant: mongoose.Types.ObjectId(),
            signedDate: new Date("2017-01-01"),
            name: "NAME",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            }
        })
        await order.save()
        await order1.save()

        await page.reload()
        
        const orderIds = await page.evaluate(() =>
            Array.from(document.querySelectorAll("tr.order"))
                .map(o => o.getAttribute("data-order-id")))

        expect(orderIds).to.deep.eq([order._id.toHexString(), order1._id.toHexString()])
    })

    it("should create order", async () => {
        const consultant = new Consultant({
            name: "CONSULTANTNAME",
            password: "PASSWORD",
            isAdmin: true,
            dummy: false
        })
        await consultant.save()
        await new Season({
            season: "SEASON1"
        }).save()
        const season = new Season({
            season: "SEASON"
        })
        await season.save()

        await page.reload()

        await page.evaluate((consultantId, seasonId) => {
            document.querySelector("#navbarSupportedContent > ul > li:nth-child(1) > a").click()

            const modal = document.querySelector("#createOrderModal")

            setTimeout(() => {
                if (!modal.classList.contains("show")) {
                    throw new Error("modal not shown")
                }

                modal.querySelector("#orderSeason").value = seasonId
                modal.querySelector("#inputConsultant").value = consultantId
                modal.querySelector("#inputName").value = "NAME"
                modal.querySelector("#inputFarmName").value = "FARM_NAME"
                modal.querySelector("#inputStreet").value = "STREET"
                modal.querySelector("#inputZip").value = 9999
                modal.querySelector("#inputCity").value = "CITY"
                modal.querySelector("#inputLandlineNumber").value = "88888888"
                modal.querySelector("#inputPhoneNumber").value = "99999999"
                modal.querySelector("#inputComment").value = "COMMENT"
                modal.querySelector("#inputSampleDensity").value = 1
                modal.querySelector("#inputArea").value = 2
                modal.querySelector("#inputSamePlanAsLast").checked = true
                modal.querySelector("#inputTakeOwnSamples").checked = true

                console.log(modal.querySelector("button[type=submit]"))

                modal.querySelector("button[type=submit]").click()
            }, 300)
        }, consultant._id, season._id)

        await sleep(500)

        const orders = await Order.find().lean().exec()
        const order = orders[0]

        console.log(order.season)

        expect(order.season.toHexString()).to.eq(season._id.toHexString())
        expect(order.consultant.toHexString()).to.eq(consultant._id.toHexString())
        expect(moment(order.signedDate).format("YYYY-MM-DD")).to.eq(moment(new Date()).format("YYYY-MM-DD"))
        expect(order.name).to.eq("NAME")
        expect(order.farmName).to.eq("FARM_NAME")
        expect(order.address.street).to.eq("STREET")
        expect(order.address.city).to.eq("CITY")
        expect(order.address.zip).to.eq(9999)
        expect(order.landlineNumber).to.eq("88888888")
        expect(order.phoneNumber).to.eq("99999999")
        expect(order.comment).to.eq("COMMENT")
        expect(order.sampleDensity).to.eq(1)
        expect(order.area).to.eq(2)
        expect(order.samePlanAsLast).to.be.true
        expect(order.takeOwnSamples).to.be.true
    })

    it("should edit order", async () => {
        const consultant = new Consultant({
            name: "CONSULTANT",
            password: "PASSWORD",
            isAdmin: false,
            dummy: false
        })
        const consultant1 = new Consultant({
            name: "CONSULTANT1",
            password: "PASSWORD",
            isAdmin: false,
            dummy: false
        })
        const season = new Season({
            season: "SEASON"
        })
        await season.save()
        const season1 = new Season({
            season: "SEASON1"
        })
        await season1.save()

        await consultant.save()
        await consultant1.save()

        const orderId = mongoose.Types.ObjectId()
        await new Order({
            _id: orderId,
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
            receptApproved: new Date("1970-01-01")
        }).save()

        await page.reload()

        await page.evaluate((newConsultantId, newSeasonId) => {
            document.querySelector(".order").click()
            const modal = document.getElementById("editOrderModal")

            setTimeout(() => {
                if (!modal.classList.contains("show")) {
                    throw new Error("modal not shown")
                }

                modal.querySelector("#editOrderSeason").value = newSeasonId
                modal.querySelector("#editInputConsultant").value = newConsultantId
                modal.querySelector("#editInputName").value = "NEW_NAME"
                modal.querySelector("#editInputFarmName").value = "NEW_FARM_NAME"
                modal.querySelector("#editInputStreet").value = "NEW_STREET"
                modal.querySelector("#editInputZip").value = 8888
                modal.querySelector("#editInputCity").value = "NEW_CITY"
                modal.querySelector("#editInputLandlineNumber").value = "77777777"
                modal.querySelector("#editInputPhoneNumber").value = "66666666"
                modal.querySelector("#editInputComment").value = "NEW_COMMENT"
                modal.querySelector("#editInputSampleDensity").value = 2
                modal.querySelector("#editInputArea").value = 3
                modal.querySelector("#editInputSamePlanAsLast").checked = false
                modal.querySelector("#editInputTakeOwnSamples").checked = false
                modal.querySelector("#inputMapDate").value = "1970-01-02"
                modal.querySelector("#inputSampleDate").value = "1970-01-02"
                modal.querySelector("#inputSampleTime").value = 2
                modal.querySelector("#inputMgSamples").value = 2
                modal.querySelector("#inputCutSamples").value = 2
                modal.querySelector("#inputOtherSamples").value = 2
                modal.querySelector("#inputSamplesTaken").value = 2
                modal.querySelector("#inputLabDate").value = "1970-01-02"
                modal.querySelector("#inputFromLabDate").value = "1970-01-02"
                modal.querySelector("#inputMO").value = "1970-01-02"
                modal.querySelector("#inputReceptApproved").value = "1970-01-02"

                //TODO should test fase 3

                //TODO should show log

                //TODO should show dynamic

                modal.querySelector("#orderEditSave").click()
            }, 200)
        }, consultant1._id, season1._id)

        await sleep(500)

        const order = await Order.findOne({ _id: orderId })

        expect(order.season.toHexString()).to.eq(season1._id.toHexString())
        expect(order.consultant.toHexString()).to.eq(consultant1._id.toHexString())
        expect(order.name).to.eq("NEW_NAME")
        expect(order.farmName).to.eq("NEW_FARM_NAME")
        expect(order.address.street).to.eq("NEW_STREET")
        expect(order.address.zip).to.eq(8888)
        expect(order.address.city).to.eq("NEW_CITY")
        expect(order.landlineNumber).to.eq("77777777")
        expect(order.phoneNumber).to.eq("66666666")
        expect(order.comment).to.eq("NEW_COMMENT")
        expect(order.sampleDensity).to.eq(2)
        expect(order.area).to.eq(3)
        expect(order.samePlanAsLast).to.eq(false)
        expect(order.takeOwnSamples).to.eq(false)
        expect(order.mapDate).to.deep.eq(new Date("1970-01-02"))
        expect(order.sampleDate).to.deep.eq(new Date("1970-01-02"))
        expect(order.sampleTime).to.eq(2)
        expect(order.mgSamples).to.eq(2)
        expect(order.cutSamples).to.eq(2)
        expect(order.otherSamples).to.eq(2)
        expect(order.samplesTaken).to.eq(2)
        expect(order.labDate).to.deep.eq(new Date("1970-01-02"))
        expect(order.fromLabDate).to.deep.eq(new Date("1970-01-02"))
        expect(order.mO).to.deep.eq(new Date("1970-01-02"))
        expect(order.receptApproved).to.deep.eq(new Date("1970-01-02"))
    })

    it("should search")

    it("should order")

    it("should display statistics")

    it("should login")

    it("should create consultant")

    it("should update consultant")

    it("should set season")

    it("should create season")

    it("should select season")
})