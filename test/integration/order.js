const puppeteer = require("puppeteer")
const childProcess = require("child_process")
const mongoose = require("mongoose")
const { expect } = require("chai")
const fs = require("fs")
const rimraf = require("rimraf")
const moment = require("moment")

const { Order : OrderSchema } = require("../../models/order")
const { createApp } = require("../../app")

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

describe("order integration test", () => {
    let server
    let db
    let browser
    const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema)
    
    before(async () => {
        const dataPath = __dirname + "/../test-data"
        rimraf.sync(dataPath)
        fs.mkdirSync(dataPath)

        db = childProcess.spawn("mongod", ["--port", "27018", "--dbpath", dataPath])
        
        await sleep(100)

        mongoose.connect("mongodb://localhost:27018/super-octo-spoon");
        mongoose.Promise = global.Promise;

        server = createApp(OrderModel).listen(1024)
        browser = await puppeteer.launch()
    })

    after(async () => {
        await mongoose.disconnect()
        await browser.close()
        server.close()
        db.kill()
    })

    beforeEach(() => OrderModel.remove({}).exec())

    it("should show orders in overview", async () => {
        const orderId1 = mongoose.Types.ObjectId()
        orderId1.toHexString()
        const order = new OrderModel({
            _id: orderId1,
            consultant: "CONTULTANT",
            signedDate: new Date("2017-01-02"),
            name: "NAME",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: 9999
            }
        })
        const orderId2 = mongoose.Types.ObjectId()
        const order1 = new OrderModel({
            _id: orderId2,
            consultant: "CONTULTANT",
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
        const page = await browser.newPage()

        await page.goto("http://localhost:1024/")

        const orderIds = await page.evaluate(() =>
            Array.from(document.querySelectorAll("tr.order"))
                .map(o => o.getAttribute("data-order-id")))

        expect(orderIds).to.deep.eq([orderId1.toHexString(), orderId2.toHexString()])

        await page.close()
    })

    it("should create order", async () => {
        const page = await browser.newPage()
        await page.goto("http://localhost:1024/")

        await page.evaluate(() => {
            document.querySelector("#navbarSupportedContent > ul > li:nth-child(1) > a").click()

            const modal = document.querySelector("#createOrderModal")

            setTimeout(() => {
                if (!modal.classList.contains("show")) {
                    throw new Error("modal not shown")
                }

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

                modal.querySelector("button[type=submit]").click()
            }, 200)
        })

        await sleep(400)

        const [order] = await OrderModel.find().lean().exec()

        expect(order.consultant).to.eq("MH")
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

        await page.close()
    })
})