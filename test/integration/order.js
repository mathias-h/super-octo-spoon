const puppeteer = require("puppeteer")
const childProcess = require("child_process")
const mongoose = require("mongoose")
const { expect } = require("chai")
const fs = require("fs")

const { Order : OrderSchema } = require("../../models/order")
const { createApp } = require("../../app")

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

describe("Order integration tests", () => {
    let dbProcess
    let server
    const Order = mongoose.model("Order", OrderSchema)
    before(() => {
        const dataPath = __dirname + "/../test-data"
        childProcess.execSync("rm -rf " + dataPath)
        fs.mkdir(dataPath)

        dbProcess = childProcess.spawn("mongod", ["--dbpath", dataPath])
        mongoose.Promise = global.Promise;


        return sleep(200)
            .then(() => mongoose.connect("mongodb://localhost:27017/super-octo-spoon"))
            .then(() => {
                app = createApp(Order);
                server = app.listen(1024);
            })
    })

    after(() => {
        server.close();
        return mongoose.disconnect().then(() => dbProcess.kill());
    })

    describe("overview tests", () => {
        const orderId1 = mongoose.Types.ObjectId()
        const order1 = new Order({
            _id: orderId1,
            consultant: "MH",
            signedDate: new Date(),
            landlineNumber: "88888888",
            phoneNumber: "88888888",
            name: "NAME",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: "9999"
            }
        })
        const orderId2 = mongoose.Types.ObjectId()
        const order2 = new Order({
            _id: orderId2,
            consultant: "MH",
            signedDate: new Date(),
            landlineNumber: "88888888",
            phoneNumber: "88888888",
            name: "NAME",
            farmName: "FARM_NAME",
            address: {
                city: "CITY",
                street: "STREET",
                zip: "9999"
            }
        })

        beforeEach(() =>
            Order.remove().exec()
                .then(() => order1.save())
                .then(() => order2.save()))

        it("should get orders", () =>
            puppeteer.launch({ headless: false })
                .then(browser => browser.newPage()
                    .then(page => page.goto("http://localhost:1024")
                        .then(() => page.evaluate(function () {
                            return Array.from(document.querySelectorAll("tr.order"))
                                .map(orderEl => orderEl.getAttribute("data-order-id"))
                        })
                            .then(orderIds => expect(orderIds).to.deep.eq([orderId1.toHexString(),orderId2.toHexString()]))))))
        .timeout(50000)
    })
})