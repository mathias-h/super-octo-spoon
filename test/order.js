const { expect } = require("chai");
const mongoose = require("mongoose");
const moment = require("moment");
const childProcess = require("child_process")
const rimraf = require("rimraf")
const fs = require("fs")
const { Order: OrderSchema } = require("../models/order")
const { User: UserSchema } = require("../models/user")

mongoose.Promise = global.Promise;

const sleep = time => new Promise(resolve => setTimeout(resolve, time))


describe("order", () => {
    let db
    let Order
    let User

    async function createOrder(data = {}) {
        const consultantId = mongoose.Types.ObjectId()
        const d = {
            consultant: consultantId,
            signedDate: new Date("1970-01-01"),
            name: "NAME",
            farmName: "FARM_NAME",
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

        Order = connection.models.Order || connection.model("Order", OrderSchema)
        User = connection.models.User || connection.model("User", UserSchema)
    })

    after(async () => {
        await mongoose.disconnect()
        db.kill()
    })

    beforeEach(async () => {
        await Order.remove({})
        await User.remove({})
    })

    describe("edit order", () => {
        it("should edit order", async () => {
            const consultantId = mongoose.Types.ObjectId()
            const order = await createOrder()

            await Order.editOrder({
                _id: order._id,
                consultant: consultantId,
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
            const consultantId = mongoose.Types.ObjectId()
            const order = await createOrder()
            await order.save()

            await Order.editOrder({
                _id: order._id,
                consultant: consultantId,
                signedDate: new Date("1970-01-01"),
                name: "NEW_NAME",
                farmName: "FARM_NAME",
                address: {
                    city: "CITY",
                    zip: 9999,
                    street: "STREET"
                }
            }, consultantId)

            const newOrder = await Order.findById(order._id)

            const log = newOrder.log[0]

            expect(log.time.getTime()).to.eq(moment(new Date()).startOf("minute").toDate().getTime())
            expect(log.consultant.toHexString()).to.eq(consultantId.toHexString())
            expect(log.changes).to.deep.eq({
                name: "NEW_NAME"
            })
        })

        it("should handle address", async () => {
            const consultantId = mongoose.Types.ObjectId()
            const order = await createOrder()
            await order.save()

            await Order.editOrder({
                _id: order._id,
                consultant: consultantId,
                signedDate: new Date("1970-01-01"),
                name: "NAME",
                farmName: "FARM_NAME",
                address: {
                    city: "NEW_CITY",
                    zip: 8888,
                    street: "NEW_STREET"
                }
            }, consultantId)

            const newOrder = await Order.findById(order._id)

            const log = newOrder.log[0]

            expect(log.changes).to.deep.eq({
                city: "NEW_CITY",
                street: "NEW_STREET",
                zip: 8888
            })
        })

        it("should handle no changes", async () => {
            const consultantId = mongoose.Types.ObjectId()
            const order = await createOrder()
            await order.save()

            await Order.editOrder({
                _id: order._id,
                consultant: consultantId,
                signedDate: new Date("1970-01-01"),
                name: "NAME",
                farmName: "FARM_NAME",
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

            const consultantId = mongoose.Types.ObjectId();
            const order = await createOrder()
            await order.save();

            await Order.editOrder({
                _id: order._id,
                consultant: consultantId,
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
            const consultant = new User({
                username: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                isDisabled: false
            })
            await consultant.save()
            const consultant1 = new User({
                username: "CONSULTANT1",
                password: "PASS",
                isAdmin: false,
                isDisabled: false
            })
            await consultant1.save()
            const order = await createOrder({ consultant: consultant._id })

            await Order.editOrder({
                _id: order._id,
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

            expect(log.consultant).to.eq(consultant1.name)
        })

        it("should not log null values", async () => {
            const order = await createOrder()

            await Order.editOrder({
                _id: order._id,
                consultant: mongoose.Types.ObjectId(),
                signedDate: new Date("1970-01-01"),
                name: "NAME",
                farmName: "FARM_NAME",
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
                consultant: consultantId,
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
            
            expect(newOrder.log.length).to.eq(1)
        })

        it("should not override dynamics", async () => {
            const order = await createOrder({
                dynamics: {
                    "1": {
                        "test": "test"
                    }
                }
            })

            await Order.editOrder({
                _id: order._id,
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
                    "1": {
                        "test1": "test"
                    }
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
        const orderData = {
            consultant: mongoose.Types.ObjectId(),
            signedDate: new Date('1970-01-01'),
            landlineNumber: "11223344",
            phoneNumber: "55667788",
            name: 'NAME',
            farmName: 'FARMNAME',
            street: "STREET",
            city: "CITY",
            zip: 8888,
            comment: 'COMMENT'
        }
        await Order.createOrder(orderData);

        const newOrder = await Order.findOne();

        expect(newOrder.consultant.toHexString()).to.eq(orderData.consultant.toHexString());
        expect(newOrder.signedDate.getTime()).to.eq(orderData.signedDate.getTime());
        expect(newOrder.landlineNumber).to.eq(orderData.landlineNumber);
        expect(newOrder.phoneNumber).to.eq(orderData.phoneNumber);
        expect(newOrder.name).to.eq(orderData.name);
        expect(newOrder.farmName).to.eq(orderData.farmName);
        expect(newOrder.address.street).to.eq(orderData.street);
        expect(newOrder.address.city).to.eq(orderData.city);
        expect(newOrder.address.zip).to.eq(orderData.zip);
        expect(newOrder.comment).to.eq(orderData.comment);
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
            const consultant = new User({
                username: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                isDisabled: false
            })
            await consultant.save()
            const query = "X"
            const order = new Order({ 
                name: "X",
                signedDate: new Date("1970-01-01"),
                address: {
                    zip: 8888,
                    city: "CITY",
                    street: "STREET"
                },
                consultant: consultant._id,
                landlineNumber: "88888888",
                phoneNumber: "88888888",
                farmName: "FARM_NAME"
            })
            await order.save()
            await new Order({ 
                name: "Y",
                signedDate: new Date("1970-01-01"),
                address: {
                    zip: 9999,
                    city: "CITY",
                    street: "STREET"
                },
                consultant: consultant._id,
                landlineNumber: "99999999",
                phoneNumber: "99999999",
                farmName: "FARM_NAME"
            }).save()
            
            const result = await Order.getAll({ query })

            expect(result.length).to.eq(1)
            expect(result[0]._id.toHexString()).to.eq(order._id.toHexString())
        })
  
        it("should sort asc", async () => {
            const consultant = new User({
                username: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                isDisabled: false
            })
            await consultant.save()
            const order = new Order({ 
                name: "B",
                signedDate: new Date("1970-01-01"),
                address: {
                    zip: 8888,
                    city: "CITY",
                    street: "STREET"
                },
                consultant: consultant._id,
                landlineNumber: "88888888",
                phoneNumber: "88888888",
                farmName: "FARM_NAME"
            })
            await order.save()
            const order1 = new Order({ 
                name: "A",
                signedDate: new Date("1970-01-01"),
                address: {
                    zip: 9999,
                    city: "CITY",
                    street: "STREET"
                },
                consultant: consultant._id,
                landlineNumber: "99999999",
                phoneNumber: "99999999",
                farmName: "FARM_NAME"
            })
            await order1.save()

            const results = await Order.getAll({ sortBy: "name", order: "asc" })

            expect(results[1]._id.toHexString()).to.eq(order._id.toHexString())
            expect(results[0]._id.toHexString()).to.eq(order1._id.toHexString())
        })
        it("should sort asc", async () => {
            const consultant = new User({
                username: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                isDisabled: false
            })
            await consultant.save()
            const order = new Order({ 
                name: "A",
                signedDate: new Date("1970-01-01"),
                address: {
                    zip: 8888,
                    city: "CITY",
                    street: "STREET"
                },
                consultant: consultant._id,
                landlineNumber: "88888888",
                phoneNumber: "88888888",
                farmName: "FARM_NAME"
            })
            await order.save()
            const order1 = new Order({ 
                name: "B",
                signedDate: new Date("1970-01-01"),
                address: {
                    zip: 9999,
                    city: "CITY",
                    street: "STREET"
                },
                consultant: consultant._id,
                landlineNumber: "99999999",
                phoneNumber: "99999999",
                farmName: "FARM_NAME"
            })
            await order1.save()

            const results = await Order.getAll({ sortBy: "name", order: "desc" })

            expect(results[1]._id.toHexString()).to.eq(order._id.toHexString())
            expect(results[0]._id.toHexString()).to.eq(order1._id.toHexString())
        })
        it("should sort by signed date by default", async () => {
            const consultant = new User({
                username: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                isDisabled: false
            })
            await consultant.save()
            const order = new Order({ 
                name: "NAME",
                signedDate: new Date("1970-01-01"),
                address: {
                    zip: 8888,
                    city: "CITY",
                    street: "STREET"
                },
                consultant: consultant._id,
                landlineNumber: "88888888",
                phoneNumber: "88888888",
                farmName: "FARM_NAME"
            })
            await order.save()
            const order1 = new Order({ 
                name: "NAME",
                signedDate: new Date("1970-01-02"),
                address: {
                    zip: 9999,
                    city: "CITY",
                    street: "STREET"
                },
                consultant: consultant._id,
                landlineNumber: "99999999",
                phoneNumber: "99999999",
                farmName: "FARM_NAME"
            })
            await order1.save()

            const results = await Order.getAll({})

            expect(results[1]._id.toHexString()).to.eq(order._id.toHexString())
            expect(results[0]._id.toHexString()).to.eq(order1._id.toHexString())
        })

        it("should format signed date", async () => {
            const consultant = new User({
                username: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                isDisabled: false
            })
            await consultant.save()
            const order = new Order({ 
                name: "NAME",
                signedDate: new Date("1970-02-01"),
                address: {
                    zip: 8888,
                    city: "CITY",
                    street: "STREET"
                },
                consultant: consultant._id,
                landlineNumber: "88888888",
                phoneNumber: "88888888",
                farmName: "FARM_NAME"
            })
            await order.save()

            const [result] = await Order.getAll({})

            expect(result.signedDate).to.eq("01-02-1970")
        })
        it("should set fase 1", async () => {
            const consultant = new User({
                username: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                isDisabled: false
            })
            await consultant.save()
            const order = new Order({ 
                name: "NAME",
                signedDate: new Date("1970-01-01"),
                address: {
                    zip: 8888,
                    city: "CITY",
                    street: "STREET"
                },
                consultant: consultant._id,
                landlineNumber: "88888888",
                phoneNumber: "88888888",
                farmName: "FARM_NAME"
            })
            await order.save()

            const [result] = await Order.getAll({})

            expect(result.fase).to.eq(1)
        })
        it("should set fase 1", async () => {
            const consultant = new User({
                username: "CONSULTANT",
                password: "PASS",
                isAdmin: false,
                isDisabled: false
            })
            await consultant.save()
            const order = new Order({ 
                name: "NAME",
                signedDate: new Date("1970-01-01"),
                address: {
                    zip: 8888,
                    city: "CITY",
                    street: "STREET"
                },
                consultant: consultant._id,
                landlineNumber: "88888888",
                phoneNumber: "88888888",
                farmName: "FARM_NAME",
                mapDate: new Date("1970-01-01")
            })
            await order.save()

            const [result] = await Order.getAll({})

            expect(result.fase).to.eq(2)
        })
    })
});