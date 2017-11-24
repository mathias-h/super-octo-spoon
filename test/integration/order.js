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
    let OrderModel = mongoose.model("Order", OrderSchema)

    before(async () => {
        const dataPath = __dirname + "/../test-data"
        rimraf.sync(dataPath)
        fs.mkdirSync(dataPath)

        db = childProcess.spawn("mongod", ["--dbpath", dataPath])
        
        await sleep(10)

        mongoose.connect("mongodb://localhost:27017/super-octo-spoon");
        mongoose.Promise = global.Promise;

        server = createApp(OrderModel).listen(1024)
        browser = await puppeteer.launch({ headless: false, devtools: true })
    })

    after(async () => {
        server.close()
        db.kill()
        browser.close()
    })

    beforeEach(() => OrderModel.remove({}).exec())

    it("should show orders in overview", async () => {
        const orderId1 = mongoose.Types.ObjectId()
        orderId1.toHexString()
        const order = new OrderModel({
            _id: orderId1,
            consultant: "CONTULTANT",
            signedDate: new Date(),
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
            signedDate: new Date(),
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
})