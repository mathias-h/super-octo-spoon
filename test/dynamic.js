const rimraf = require("rimraf")
const fs = require("fs")
const childProcess = require("child_process")
const mongoose = require("mongoose")
const { expect } = require("chai");
const { Order: OrderSchema } = require("../models/order");
const { Dynamic: DynamicSchema } = require("../models/dynamic");

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

describe("dynamic", () => {
    let Order
    let Dynamic
    let db 
    before(async () => {
        const dataPath = __dirname + "/test-data"
        rimraf.sync(dataPath)
        fs.mkdirSync(dataPath)

        db = childProcess.spawn("mongod", ["--port", "27018", "--dbpath", dataPath])
        await sleep(1000);

        mongoose.Promise = global.Promise;
        const connection = await mongoose.createConnection("mongodb://localhost:27018/super-octo-spoon-test");

        Dynamic = connection.models.Dynamic || connection.model("Dynamic", DynamicSchema)
        Order = connection.models.Order || connection.model("Order", OrderSchema)
    })

    after(async () => {
        await mongoose.disconnect();
        db.kill();
        await sleep(1000);
    })

    beforeEach(async () => {
        await Dynamic.remove({})
        await Order.remove({})
    })
    it("should create dynamic", async () => {
        const name = "NAME"
        const fase = 1
        const order = new Order({
            season: mongoose.Types.ObjectId(),
            consultant: mongoose.Types.ObjectId(),
            signedDate: new Date("1970-01-01"),
            name: "NAME",
            farmName: "FARM_NAME",
            landlineNumber: "88888888",
            phoneNumber: "99999999",
            address: {
                city: "CITY",
                zip: 9999,
                street: "STREET"
            },
            dynamics: {
                [fase]: {
                    otherName: "test"
                }
            }
        })
        await order.save()
        
        await Dynamic.createDynamic(name, fase)

        const newDynamic = (await Dynamic.find())[0]
        const newOrder = await Order.findById(order._id)

        expect(newDynamic.name).to.eq(name)
        expect(newDynamic.fase).to.eq(fase)
        expect(newOrder.dynamics).to.deep.eq({
            [fase]: {
                otherName: "test",
                [name]: ""
            }
        })
    })

    it("should delete dynamic", async () => {
        const name = "NAME"
        const fase = 1
        const dynamic = new Dynamic({ name, fase })
        await dynamic.save()
        const order = new Order({
            season: mongoose.Types.ObjectId(),
            consultant: mongoose.Types.ObjectId(),
            signedDate: new Date("1970-01-01"),
            name: "NAME",
            farmName: "FARM_NAME",
            landlineNumber: "88888888",
            phoneNumber: "99999999",
            address: {
                city: "CITY",
                zip: 9999,
                street: "STREET"
            },
            dynamics: {
                [fase]: {
                    test: "test",
                    [name]: "test"
                }
            }
        })
        await order.save()

        await Dynamic.deleteDynamic(dynamic._id)

        const newOrder = await Order.findById(order._id)

        expect(await Dynamic.count()).to.eq(0)
        expect(newOrder.dynamics).to.deep.eq({
            [fase]: {
                test: "test"
            }
        })
    })
})