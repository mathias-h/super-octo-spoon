const mock = require('mock-require');
const request = require('supertest');
const { expect } = require("chai")

mock("mongoose", {
    connect() {}
})

describe("Order integration tests", () => {
    describe("getOrder", () => {
        it("should get order", () => {
            const orderId = "ORDER_ID"
            const order = {
                _id: orderId,
                order: "order"
            }
            mock('../models/order', { 
                findOne: (query) => {
                    expect(query._id).to.eq(orderId)
                    return Promise.resolve(order)
                }
            });
            const {app} = require("../index")
            request(app)
                .get("/order/" + orderId)
                .expect("Content-Type", "application/json")
                .expect(200)
                .expect(JSON.stringify(order))
        })

        it("should handle nonexistant order", () => {
            const orderId = "NONEXISTANT_ORDER_ID"
            const order = {
                _id: orderId
            }
            mock('../models/order', { 
                findOne: (query) => {
                    return null
                }
            });
            const {app} = require("../index")
            request(app)
                .get("/order/" + orderId)
                .expect("Content-Type", "text/plain")
                .expect(404)
                .expect("order not found")
        })
    })
    it("edit order", () => {
        const orderId = "ORDER_ID"
        const order = {
            _id: orderId,
            order: "order"
        }
        mock('../models/order', { 
            findOneAndUpdate: (query, update) => {
                expect(query).to.deep.eq({ _id: orderId })
                expect(update).to.deep.eq({ $set: order })

                return Promise.resolve()
            }
        });
        const {app} = require("../index")

        request(app)
            .post("/order")
            .send(order)
            .expect(200)
            .expect("order updated")
    })
})