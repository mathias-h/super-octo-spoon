const { expect } = require("chai");
const mongoose = require("mongoose");
const moment = require("moment");
const childProcess = require("child_process")
const rimraf = require("rimraf")
const fs = require("fs")
const { Order: OrderSchema } = require("../models/order")
const { Consultant: ConsultantSchema } = require("../models/consultant")
const { Season: SeasonSchema } = require("../models/season")
const { Dynamic: DynamicSchema } = require("../models/dynamic")

mongoose.Promise = global.Promise;

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

describe("order", () => {
    let db
    let Order = null
    let Consultant
    let Season
    let Dynamic

    async function createOrder(data = {}) {
        let season

        if (!data.season) {
            const id = mongoose.Types.ObjectId()
            season = new Season({
                _id: id,
                season: "SEASON-" + id,
                default: true
            })
            await season.save()
            season = season._id
        }
            const d = {
            season: season,
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
            }
        }

        const order = new Order(Object.assign(d, data))
        await order.save()
        return order
    }

    before(async () => {
        const dataPath = __dirname + "/test-data"
        rimraf.sync(dataPath)
        fs.mkdirSync(dataPath)

        db = childProcess.spawn("mongod", ["--port", "27018", "--dbpath", dataPath])

        await sleep(500)

        mongoose.Promise = global.Promise;
        const connection = await mongoose.createConnection("mongodb://localhost:27018/super-octo-spoon");

        Dynamic = connection.models.Dynamic || connection.model("Dynamic", DynamicSchema);
        Order = connection.models.Order || connection.model("Order", OrderSchema);
        Consultant = connection.models.Consultant || connection.model("Consultant", ConsultantSchema);
        Season = connection.models.Season || connection.model("Season", SeasonSchema);
    })

    after(async () => {
        await mongoose.disconnect()
        db.kill()
    })

    beforeEach(async () => {
        await Order.remove({})
        await Consultant.remove({})
        await Dynamic.remove({})
        await Season.remove({})
    })

    describe("edit order", () => {
        it("should edit order", async () => {
            const order = await createOrder()

            await Order.editOrder({
                _id: order._id,
                season: order.season,
                consultant: order.consultant,
                signedDate: new Date("1970-01-01"),
                name: "NEW_NAME",
                farmName: "FARM_NAME",
                address: {
                    city: "CITY",
                    zip: 9999,
                    street: "STREET"
                }
            })

            const newOrder = await Order.findById(order._id)

            expect(newOrder.name).to.eq("NEW_NAME")
        });

        it("should update log", async () => {

            const order = await createOrder()
            await order.save()

            await Order.editOrder({
                _id: order._id,
                season: order.season,
                consultant: order.consultant,
                signedDate: new Date("1970-01-01"),
                name: "NEW_NAME",
                farmName: "FARM_NAME",
                address: {
                    city: "CITY",
                    zip: 9999,
                    street: "STREET"
                }
            }, order.consultant)

            const newOrder = await Order.findById(order._id)

            const log = newOrder.log[0]

            expect(log.time.getTime()).to.eq(moment(new Date()).startOf("minute").toDate().getTime())
            expect(log.consultant.toHexString()).to.eq(order.consultant.toHexString())
            expect(log.changes).to.deep.eq({
                name: "NEW_NAME"
            })
        })

        it("should handle address", async () => {
            const order = await createOrder()
            await order.save()

            await Order.editOrder({
                _id: order._id,
                season: order.season,
                consultant: order.consultant,
                signedDate: new Date("1970-01-01"),
                name: "NAME",
                farmName: "FARM_NAME",
                address: {
                    city: "NEW_CITY",
                    zip: 8888,
                    street: "NEW_STREET"
                }
            }, order.consultant)

            const newOrder = await Order.findById(order._id)

            const log = newOrder.log[0]

            expect(log.changes).to.deep.eq({
                city: "NEW_CITY",
                street: "NEW_STREET",
                zip: 8888
            })
        })

        it("should handle no changes", async () => {
            const order = await createOrder()
            await order.save()

            await Order.editOrder({
                _id: order._id,
                season: order.season,
                consultant: order.consultant,
                signedDate: new Date("1970-01-01"),
                name: "NAME",
                farmName: "FARM_NAME",
                landlineNumber: "88888888",
                phoneNumber: "99999999",
                address: {
                    city: "CITY",
                    zip: 9999,
                    street: "STREET"
                }
            })

            const newOrder = await Order.findById(order._id)

            expect(newOrder.log.length).to.eq(0)
        })

        it("should handle dynamic columns", async () => {
            const fase = 0;
            const name = "NAME";
            const value = "VALUE";

            const order = await createOrder()
            await order.save();

            await Order.editOrder({
                _id: order._id,
                season: order.season,
                consultant: order.consultant,
                signedDate: new Date("1970-01-01"),
                name: "NAME",
                farmName: "FARM_NAME",
                address: {
                    city: "CITY",
                    zip: 9999,
                    street: "STREET"
                },
                dynamics: {
                    [fase]: {
                        [name]: value
                    }
                }
            });

            const newOrder = await Order.findById(order._id);

            expect(newOrder.dynamics).to.deep.eq({
                [fase]: {
                    [name]: value
                }
            });
            expect(newOrder.log[0].changes).to.deep.eq({
                [name]: value
            });
        })

        it("should handle log consultant", async () => {
            const consultant = new Consultant({
                name: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                dummy: false
            })
            await consultant.save()
            const consultant1 = new Consultant({
                name: "CONSULTANT1",
                password: "PASS",
                isAdmin: false,
                dummy: false
            })
            await consultant1.save()
            const order = await createOrder({ consultant: consultant._id })

            await Order.editOrder({
                _id: order._id,
                season: order.season,
                consultant: consultant1._id,
                signedDate: new Date("1970-01-01"),
                name: "NAME",
                farmName: "FARM_NAME",
                address: {
                    city: "CITY",
                    zip: 9999,
                    street: "STREET"
                }
            });

            const newOrder = await Order.findById(order._id)
            const log = newOrder.log[0]

            expect(newOrder.consultant.toHexString()).to.eq(consultant1._id.toHexString())
            expect(log.changes.consultant).to.eq(consultant1.name)
        })

        it("should handle log season", async () => {
            const season = new Season({
                season: "SEASON",
                default: false
            })
            await season.save()
            const season1 = new Season({
                season: "SEASON1",
                default: false
            })
            await season1.save()
            
            const order = await createOrder({ season: season._id })

            await Order.editOrder({
                _id: order._id,
                season: season1._id,
                consultant: order.consultant,
                signedDate: new Date("1970-01-01"),
                name: "NAME",
                farmName: "FARM_NAME",
                address: {
                    city: "CITY",
                    zip: 9999,
                    street: "STREET"
                }
            });

            const newOrder = await Order.findById(order._id)
            const log = newOrder.log[0]

            expect(newOrder.season.toHexString()).to.eq(season1._id.toHexString())
            expect(log.changes.season).to.eq(season1.season)
        })

        it("should handle log sendBy", async () => {
            const consultant = new Consultant({
                name: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                dummy: false
            })
            await consultant.save()
            const consultant1 = new Consultant({
                name: "CONSULTANT1",
                password: "PASS",
                isAdmin: false,
                dummy: false
            })
            await consultant1.save()
            const order = await createOrder({ sendBy: consultant._id })

            await Order.editOrder({
                _id: order._id,
                season: order.season,
                consultant: order.consultant,
                signedDate: new Date("1970-01-01"),
                name: "NAME",
                farmName: "FARM_NAME",
                address: {
                    city: "CITY",
                    zip: 9999,
                    street: "STREET"
                },
                sendBy: consultant1._id
            });

            const newOrder = await Order.findById(order._id)
            const log = newOrder.log[0]

            expect(newOrder.sendBy.toHexString()).to.eq(consultant1._id.toHexString())
            expect(log.changes.sendBy).to.eq(consultant1.name)
        })

        it("should not log null values", async () => {
            const order = await createOrder()

            await Order.editOrder({
                _id: order._id,
                season: order.season,
                consultant: order.consultant,
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
                area: null
            });

            const newOrder = await Order.findById(order._id)
            
            expect(newOrder.log.length).to.eq(0)
        })

        it("should handle existing log", async () => {
            const consultantId = mongoose.Types.ObjectId()
            const order = await createOrder({
                log: [{
                    time: new Date(),
                    consultant: consultantId,
                    changes: {}
                }]
            })
            
            await Order.editOrder({
                _id: order._id,
                season: order.season,
                consultant: consultantId,
                signedDate: new Date("1970-01-01"),
                name: "NAME",
                farmName: "FARM_NAME",
                landlineNumber: "88888888",
                phoneNumber: "99999999",
                address: {
                    city: "CITY",
                    zip: 9999,
                    street: "STREET"
                }
            });

            const newOrder = await Order.findById(order._id)
            
            expect(newOrder.log.length).to.eq(1)
        })

        it("should not override dynamics", async () => {
            const order = await createOrder({
                dynamics: {
                    "1": { "test": "test" }
                }
            })

            await Order.editOrder({
                _id: order._id,
                season: order.season,
                consultant: order.consultant,
                signedDate: new Date("1970-01-01"),
                name: "NAME",
                farmName: "FARM_NAME",
                address: {
                    city: "CITY",
                    zip: 9999,
                    street: "STREET"
                },
                dynamics: {
                    "1": { "test1": "test" }
                }
            });

            const newOrder = await Order.findById(order._id)
            const fase = newOrder.dynamics["1"]

            expect(newOrder.dynamics["1"]).to.deep.eq({
                test: "test",
                test1: "test"
            })
        })
    });
   
    it("should create order", async () => {
        await new Dynamic({
            name: "NAME",
            fase: 1
        }).save()

        const orderData = {
            season: mongoose.Types.ObjectId(),
            consultant: mongoose.Types.ObjectId(),
            signedDate: new Date('1970-01-01'),
            landlineNumber: "11223344",
            phoneNumber: "55667788",
            name: 'NAME',
            farmName: 'FARMNAME',
            address: {
                street: "STREET",
                city: "CITY",
                zip: 8888
            },
            comment: 'COMMENT'
        }
        await Order.createOrder(orderData);

        const newOrder = await Order.findOne();

        expect(newOrder.season.toHexString()).to.eq(orderData.season.toHexString())
        expect(newOrder.consultant.toHexString()).to.eq(orderData.consultant.toHexString());
        expect(newOrder.signedDate.getTime()).to.eq(orderData.signedDate.getTime());
        expect(newOrder.landlineNumber).to.eq(orderData.landlineNumber);
        expect(newOrder.phoneNumber).to.eq(orderData.phoneNumber);
        expect(newOrder.name).to.eq(orderData.name);
        expect(newOrder.farmName).to.eq(orderData.farmName);
        expect(newOrder.address.street).to.eq(orderData.address.street);
        expect(newOrder.address.city).to.eq(orderData.address.city);
        expect(newOrder.address.zip).to.eq(orderData.address.zip);
        expect(newOrder.comment).to.eq(orderData.comment);
        expect(newOrder.dynamics).to.deep.eq({
            "1": {
                "NAME": null
            }
        })

        it("should create log")
    })

    it("sample totals", async () => {
        await createOrder({
            signedDate: new Date("2017-02-01"),
            area: 10,
            mgSamples: 1,
            cutSamples: 1,
            otherSamples: 1
        });
        await createOrder({
            signedDate: new Date("2017-02-01"),
            area: 10,
            mgSamples: 1,
            cutSamples: 1,
            otherSamples: 1
        });

        const result = await Order.sampleTotals()
        
        expect(result).to.deep.eq({
            _id: null,
            totalSamples: 20,
            totalTaken: 6
        })
    })

    describe("get all", () => {
        it("should search", async () => {
            const consultant = new Consultant({
                name: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                dummy: false
            })
            await consultant.save()
            const order = await createOrder({ name: "X", consultant: consultant._id })
            await createOrder({ name: "Y", consultant: consultant._id })
            
            const result = await Order.getAll({ query: "X" })

            expect(result.length).to.eq(1)
            expect(result[0]._id.toHexString()).to.eq(order._id.toHexString())
        })
  
        it("should sort asc", async () => {
            const season = new Season({
                season: "SEASON",
                default: true
            })
            await season.save()
            const consultant = new Consultant({
                name: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                dummy: false
            })
            await consultant.save()
            const order = await createOrder({
                name: "B",
                consultant: consultant._id,
                season: season._id
            })
            const order1 = await createOrder({
                name: "A",
                consultant: consultant._id,
                season: season._id
            })

            const results = await Order.getAll({ sortBy: "name", order: "asc" })

            expect(results.length).to.eq(2)
            expect(results[1]._id.toHexString()).to.eq(order._id.toHexString())
            expect(results[0]._id.toHexString()).to.eq(order1._id.toHexString())
        })
        it("should sort desc", async () => {
            const season = new Season({
                season: "SEASON",
                default: true
            })
            await season.save()
            const consultant = new Consultant({
                name: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                dummy: false
            })
            await consultant.save()
            const order = await createOrder({
                name: "A",
                consultant: consultant._id,
                season: season._id
            })
            const order1 = await createOrder({
                name: "B",
                consultant: consultant._id,
                season: season._id
            })

            const results = await Order.getAll({ sortBy: "name", order: "desc" })

            expect(results.length).to.eq(2)
            expect(results[1]._id.toHexString()).to.eq(order._id.toHexString())
            expect(results[0]._id.toHexString()).to.eq(order1._id.toHexString())
        })
        it("should sort by signed date by default", async () => {
            const season = new Season({
                season: "SEASON",
                default: true
            })
            await season.save()
            const consultant = new Consultant({
                name: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                dummy: false
            })
            await consultant.save()
            const order = await createOrder({
                signedDate: new Date("1970-01-01"),
                consultant: consultant._id,
                season: season._id
            })
            const order1 = await createOrder({
                signedDate: new Date("1970-01-02"),
                consultant: consultant._id,
                season: season._id
            })

            const results = await Order.getAll({})

            expect(results[1]._id.toHexString()).to.eq(order._id.toHexString())
            expect(results[0]._id.toHexString()).to.eq(order1._id.toHexString())
        })

        it("should format signed date", async () => {
            const consultant = new Consultant({
                name: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                dummy: false
            })
            await consultant.save()
            await createOrder({
                signedDate: new Date("1970-02-01"),
                consultant: consultant._id
            })

            const [result] = await Order.getAll({})

            expect(result.signedDate).to.eq("01-02-1970")
        })
        it("should set fase 1", async () => {
            const consultant = new Consultant({
                name: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                dummy: false
            })
            await consultant.save()
            await createOrder({
                consultant: consultant._id
            })

            const [result] = await Order.getAll({})

            expect(result.fase).to.eq(1)
        })
        it("should set fase 2", async () => {
            const consultant = new Consultant({
                name: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                dummy: false
            })
            await consultant.save()
            await createOrder({
                mapDate: new Date("1970-01-01"),
                consultant: consultant._id
            })

            const [result] = await Order.getAll({})

            expect(result.fase).to.eq(2)
        })
    })
});