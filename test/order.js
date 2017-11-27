const { expect } = require("chai");
const mongoose = require("mongoose");
const moment = require("moment")

mongoose.Promise = global.Promise;

describe("order", () => {
    let Order

    beforeEach(() => {
        Order = require("../models/order").Order
    })

    it("should edit order", () => {
        const orderId = mongoose.Types.ObjectId();
        const newOrder = {
            _id: orderId,
            order: "order"
        };

        Order.statics.findOneAndUpdate = function findOneAndUpdateMock(query, update) {
            expect(query).to.deep.eq({ _id: orderId });
            expect(update).to.deep.eq({ $set: newOrder });

            return { exec: () => Promise.resolve() }
        };

        return Order.statics.editOrder(newOrder)
    });
    it("should create order", () => {
        // TODO
    });
    it("sample totals", async () => {
        Order.statics.aggregate = function aggretageMock([match,group]) {
            expect(match).to.deep.eq({ $match: {
                signedDate: { $gte: moment(new Date("2017-01-01")).startOf("year").toDate() }
            }})
            expect(group).to.deep.eq({ $group: {
                _id: null,
                totalSamples: { $sum:"$area" },
                totalTaken: { $sum:{$add:["$mgSamples","$cutSamples","$otherSamples"] }
            }}})

            return { exec: async () => [{ _id: null, totalSamples: 100, totalTaken: 50 }] }
        }

        const result = await Order.statics.sampleTotals()

        expect(result).to.deep.eq({
            _id: null,
            totalSamples: 100,
            totalTaken: 50
        })
    });
    
    describe("get all", () => {
        it("should search", async () => {
            const query = "A 9999"
            const orders = [
                { 
                    _id: 1,
                    name: "NAME",
                    address: {
                        zip: 9999,
                        city: "CITY",
                        street: "STREET"
                    },
                    consultant: "CONSULTANT",
                    landlineNumber: "88888888",
                    phoneNumber: "88888888",
                    farmName: "FARM_NAME"
                }
            ]
            Order.statics.find = () => ({ lean: () => ({ exec: () => orders }) })

            const result = await Order.statics.getAll({ query })

            expect(result).to.deep.eq(orders)
        })
        it("should sort results asc", async () => {
            const orders = [
                { _id: 1, name: "B" },
                { _id: 2, name: "A" }
            ]
            Order.statics.find = () => ({ lean: () => ({ exec: () => orders }) })

            const result = await Order.statics.getAll({ sortBy: "name", order: "asc" })

            expect(result[0]._id).to.eq(2)
            expect(result[1]._id).to.eq(1)
        })
        it("should sort results desc", async () => {
            const orders = [
                { _id: 1, name: "A" },
                { _id: 2, name: "B" }
            ]
            Order.statics.find = () => ({ lean: () => ({ exec: () => orders }) })

            const result = await Order.statics.getAll({ sortBy: "name", order: "desc" })

            expect(result[0]._id).to.eq(2)
            expect(result[1]._id).to.eq(1)
        })
        it("should sort by singed date by default", async () => {
            const orders = [
                { _id: 1, signedDate: new Date("1970-01-01") },
                { _id: 2, signedDate: new Date("1970-01-02") }
            ]
            Order.statics.find = () => ({ lean: () => ({ exec: () => orders }) })

            const result = await Order.statics.getAll({})

            expect(result[0]._id).to.eq(2)
            expect(result[1]._id).to.eq(1)
        })
        it("should format singed date", async () => {
            const orders = [
                { _id: 1, signedDate: new Date("1970-01-01") }
            ]
            Order.statics.find = () => ({ lean: () => ({ exec: () => orders }) })

            const result = await Order.statics.getAll({})

            expect(result[0].signedDate).to.eq("01-01-1970")
        })
    })
});