"use strict";

const request = require('supertest');
const testSession = require("supertest-session");
const { expect } = require("chai");
const { createApp } = require("../../app");

describe('Login/session testing', function () {

    describe('Testing GET route endpoints when not logged in', function () {

        function sessionMock(consultantId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: false,
                    consultantId: consultantId
                };

                next();
            }
        }

        describe('GET /', function () {
            it('should redirect to /login', function () {

                const app = createApp({
                    session: sessionMock()
                });

                return request(app)
                    .get('/')
                    .then(function (res) {
                        expect(res.statusCode).to.eq(302);
                        expect(res.header.location).to.eq('/login');
                    });

            });
        });

        describe('GET /order/:orderId', function () {
            it('should redirect to /login', function () {

                const app = createApp({
                    session: sessionMock()
                });

                const mongoose = require('mongoose');
                const orderId = mongoose.Types.ObjectId();

                return request(app)
                    .get('/order/' + orderId)
                    .then(function (res) {
                        expect(res.statusCode).to.eq(302);
                        expect(res.header.location).to.eq('/login');
                    });

            });
        });

        describe('GET /login', function () {
            it('should serve /login', function () {

                const app = createApp({
                    session: sessionMock()
                });

                return request(app)
                    .get('/login')
                    .then(function (res) {
                        expect(res.statusCode).to.eq(200);
                        expect("Content-Type", /text\/html/);
                        expect(res.text).contain('<form id="login-form">');
                    });

            });
        });

        describe('GET /logout', function () {
            it('should redirect to /login', function () {

                const app = createApp({
                    session: sessionMock()
                });
                return request(app)
                    .get('/logout')
                    .then(function (res) {
                        expect(res.statusCode).to.eq(302);
                        expect(res.header.location).to.eq('/login');
                    });
            });
        });
    });

    describe('Testing GET route endpoints when logged in', function () {

        function sessionMock(consultantId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: true,
                    consultantId: consultantId
                };

                next();
            }
        }

        describe('GET /', function () {
            it('should serve / overview', function () {

                const order = { name: "ORDER_NAME" };
                const OrderMock = {
                    getAll(queryParams) {
                        return Promise.resolve([order])
                    },
                    sampleTotals() {
                        return Promise.resolve({ totalSamples: 0, totalTaken: 0 })
                    }
                };
                const ConsultantMock = {
                    find: () => Promise.resolve({})
                };
                const SeasonMock = {
                    find: () => Promise.resolve([])
                };
                const DynamicMock = {
                    find: () => Promise.resolve([])
                };
                const app = createApp({
                    Order: OrderMock,
                    Consultant: ConsultantMock,
                    Season: SeasonMock,
                    Dynamic: DynamicMock,
                    session: function sessionMock(req,res,next) {
                        return (req,res,next) => {
                            req.session = {
                                isLoggedIn: true
                            };

                            next()
                        }
                    }
                });

                return request(app)
                    .get('/')
                    .then(function (res) {
                        expect(res.statusCode).to.eq(200);
                        expect("Content-Type", /text\/html/);
                        expect(res.text).not.contain('<form id="login-form">');
                        expect(res.text).contain('Opret\n                    Jordprøvebestilling');
                    });

            });
        });

        describe('GET /order/:orderId', function () {
            it('should respond with the requested order', function () {

                const id = "testId";

                const order = {
                    _id: id,
                    name: 'testOrder'
                };
                const OrderMock = {
                    findOne: () => ({
                        populate: () => ({
                            populate: () => ({
                                populate() { return Promise.resolve(order) }
                            })
                        })
                    })
                };

                const app = createApp({
                    Order: OrderMock,
                    session: function sessionMock(req,res,next) {
                        return (req,res,next) => {
                            req.session = {
                                isLoggedIn: true
                            };

                            next()
                        }
                    }
                });

                return request(app)
                    .get('/order/' + id)
                    .expect(200)
                    .expect(order);

            });
        });

        it('GET /login', function () {

            //TODO
            const app = createApp({
                session: sessionMock()
            });

        });

        it('GET /logout - should logout and redirect to login', function () {

            //TODO
            const app = createApp({
                session: sessionMock()
            });

        });
    });

    //TODO
    describe('Testing POST endpoints response when logged in', function () {

        function sessionMock(consultantId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: true,
                    consultantId: consultantId
                };

                next();
            }
        }

        it('POST consultant', function () {
            // TODO

        });

        it('PUT consultant', function () {
            // TODO
        });

        it('POST /login', function () {
            // TODO
        })

    });

});

/*
    TODO
    login
    delete Order
    /season
    dynamics når de kommer
 */