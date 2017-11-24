const { expect } = require("chai")
const mongoose = require("mongoose")
const {Order} = require("../models/order")

mongoose.Promise = global.Promise

describe("order", () => {
    it("should edit order", () => {
        const orderId = mongoose.Types.ObjectId()
        const newOrder = {
            _id: orderId,
            order: "order"
        }

        Order.statics.findOneAndUpdate = function findOneAndUpdateMock(query, update) {
            expect(query).to.deep.eq({ _id: orderId })
            expect(update).to.deep.eq({ $set: newOrder })

            return { exec: () => Promise.resolve() }
        }

        return Order.statics.editOrder(newOrder)
    })
    it("should create order", () => {
        
    })
    describe("sample totals", () => {
        it("should get sample totals", () => {
            const orders = [
                {
                    area: 100,
                    mgSamples: 10,
                    cutSamples: 20,
                    otherSamples: 30
                },
                {
                    area: 200,
                    mgSamples: 30,
                    cutSamples: 20,
                    otherSamples: 10
                }
            ]
    
            Order.statics.find = function findMock(query) {
                return { exec: () => Promise.resolve(orders) }
            }
    
            return Order.statics.sampleTotals().then(result => {
                expect(result).to.deep.eq({
                    totalSamples: 300,
                    totalTaken: 120
                })
            })
        })

        it("should handle missing values", () => {
            const orders = [
                {
                    area: 1,
                    mgSamples: 10,
                    cutSamples: 10,
                },
                {
                    area: 1,
                    mgSamples: 10,
                    otherSamples: 10
                },
                {
                    area: 1,
                    mgSamples: 10,
                    cutSamples: 10,
                },
                {
                    area: 1,
                    cutSamples: 10,
                    otherSamples: 10
                }
            ]
    
            Order.statics.find = function findMock(query) {
                return { exec: () => Promise.resolve(orders) }
            }
    
            return Order.statics.sampleTotals().then(result => {
                expect(result).to.deep.eq({
                    totalSamples: 4,
                    totalTaken: 80
                })
            })
        })
    })
    
    it("should get all orders", () => {

    })
})