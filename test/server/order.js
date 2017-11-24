const request = require('supertest');
const { expect } = require("chai");
const { createApp } = require("../../app");

describe("Order integration tests", () => {
    describe("getOrder", () => {
        it("should get order", () => {
            const orderId = "ORDER_ID"
            const order = {
                _id: orderId,
                order: "order"
            }
            const OrderMock = { 
                findOne(query) {
                    expect(query._id).to.eq(orderId)
                    return Promise.resolve(order)
                }
            }
            const app = createApp(OrderMock)

            return request(app)
                .get("/order/" + orderId)
                .expect("Content-Type", /application\/json/)
                .expect(200)
                .expect(JSON.stringify(order))
        })

        it("should handle nonexistant order", () => {
            const orderId = "NONEXISTANT_ORDER_ID"
            const order = {
                _id: orderId
            }
            const OrderMock = { 
                findOne: () => Promise.resolve(null)
            }

            const app = createApp(OrderMock)

            return request(app)
                .get("/order/" + orderId)
                .expect("Content-Type", /text\/plain/)
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
        const OrderMock = { 
            editOrder(o) {
                expect(o).to.deep.eq(order)
                return Promise.resolve()
            }
        }
        
        const app = createApp(OrderMock)

        return request(app)
            .post("/order")
            .send(order)
            .expect("Content-Type", /text\/plain/)
            .expect(200)
            .expect("order updated")
    })
    describe("create order", () => {
        it("should create order", () => {
            const order = {
                _id: "ORDER_ID",
                consultant: "CONSULTANT",
                signedDate: 2017-11-24,
                landlineNumber: 11223344,
                phoneNumber: 55667788,
                name: 'NAME',
                address: {
                    street: 'STREET',
                    city: 'CITY',
                    zip: '1234'
                },
                comment: 'COMMENT'
            }

            const OrderMock = {
                createOrder(o) {
                    expect(o).to.deep.eq(order);
                    return Promise.resolve();
                }
            }

            const app = createApp(OrderMock);

            return request(app)
                .post('/order/create')
                .send(order)
                .expect('Content-Type', /text\/plain/)
                .expect(200)
                .expect('order created');
        });

        it('should handle create requests, which are missing all data', () => {
            const order = {
                _id: "ORDER_ID"
            }

            const OrderMock = {
                createOrder(o) {
                    expect(o).to.deep.eq(order);
                    return Promise.reject();
                }
            }

            const app = createApp(OrderMock);

            return request(app)
                .post('/order/create')
                .send(order)
                .expect('Content-Type', /application\/json/)
                .expect(500);
        });
        it('should handle create requests, which are missing all data but phone number', () => {
            const order = {
                _id: "ORDER_ID",
                landlineNumber: 11223344
            }

            const OrderMock = {
                createOrder(o){
                    expect(o).to.deep.eq(order);
                    return Promise.reject();
                }
            }

            const app = createApp(OrderMock);

            return request(app)
                .post('/order/create')
                .send(order)
                .expect('Content-Type', /application\/json/)
                .expect(500)
        });
    })
})