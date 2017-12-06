const request = require('supertest');
const testSession = require("supertest-session")
const { expect } = require("chai");
const { createApp } = require("../../app");

describe("Order server tests", () => {
    function sessionMock(consultantId) {
        return () => (req,res,next) => {
            req.session = {
                isLoggedIn: true,
                consultantId: consultantId
            }
    
            next()
        }
    }

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
                    return this
                },
                populate: () => ({
                    populate: () => ({
                        populate() { return Promise.resolve(order) }
                    })
                })
            }
            const app = createApp({
                Order: OrderMock,
                session: sessionMock()
            })

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
                findOne: () => ({
                    populate: () => ({
                        populate: () => ({
                            populate: () => Promise.resolve(null)
                        })
                    })  
                })
            }

            const app = createApp({
                Order: OrderMock,
                session: sessionMock()
            })

            return request(app)
                .get("/order/" + orderId)
                .expect("Content-Type", /text\/plain/)
                .expect(404)
                .expect("order not found")
        })
    })
    it("edit order", () => {
        const orderId = "ORDER_ID"
        const consultantId = "CONSULTANT_ID"
        const order = {
            _id: orderId,
            order: "order"
        }
        const OrderMock = { 
            editOrder(o, uid) {
                expect(o).to.deep.eq(order)
                expect(uid).to.eq(consultantId)
                return Promise.resolve()
            }
        };
        const ConsultantMock = {
            findOne(query) {
                expect(query).to.deep.eq({ _id: consultantId })
                return Promise.resolve({ _id: consultantId })
            }
        }
        
        const app = createApp({
            Order: OrderMock,
            Consultant: ConsultantMock,
            session: sessionMock(consultantId)
        })

        return request(app)
            .put("/order")
            .send(order)
            .expect(200)
            .expect("OK")
    });
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
            };

            const OrderMock = {
                createOrder(o) {
                    expect(o).to.deep.eq(order);
                    return Promise.resolve();
                }
            };
            const ConsultantMock = {
                findOne(q) {
                    return Promise.resolve({ _id: "USER_ID" })
                }
            }

            const app = createApp({
                Order: OrderMock,
                Consultant: ConsultantMock,
                session: sessionMock()
            });

            return request(app)
                .post('/order')
                .send(order)
                .expect(200)
                .expect('OK');
        });

        it('should handle create requests, which are missing all data', () => {
            const order = {
                _id: "ORDER_ID"
            };

            const OrderMock = {
                createOrder(o) {
                    expect(o).to.deep.eq(order);
                    return Promise.reject();
                }
            };
            const ConsultantMock = {
                findOne(q) {
                    return Promise.resolve({ _id: "USER_ID" })
                }
            }

            const app = createApp({
                Order: OrderMock,
                Consultant: ConsultantMock,
                session: sessionMock()
            });

            return request(app)
                .post('/order')
                .send(order)
                .expect(500);
        });
        it('should handle create requests, which are missing all data but phone number', () => {
            const order = {
                _id: "ORDER_ID",
                landlineNumber: 11223344
            };

            const OrderMock = {
                createOrder(o){
                    expect(o).to.deep.eq(order);
                    return Promise.reject();
                }
            };
            const ConsultantMock = {
                findOne(q) {
                    return Promise.resolve({ _id: "USER_ID" })
                }
            }

            const app = createApp({
                Order: OrderMock,
                Consultant: ConsultantMock,
                session: sessionMock()
            });

            return request(app)
                .post('/order')
                .send(order)
                .expect(500)
        });
    })
});