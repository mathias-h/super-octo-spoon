"use strict";

const request = require('supertest');
const testSession = require("supertest-session");
const { expect } = require("chai");
const { createApp } = require("../../app");
const { Consultant: ConsultantSchema } = require("../../models/consultant.js");
const mongoose = require("mongoose");
const childProcess = require("child_process");
const rimraf = require("rimraf");
const fs = require("fs");

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

                //const mongoose = require('mongoose');
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

        // TODO - denne skal vel fjernes?
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
            it('should serve overview at /', function () {

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
                        expect(/jordprøvebestilling/i);
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

    });

    describe('Testing POST endpoints response when not logged in', function () {

        function sessionMock(consultantId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: false,
                    consultantId: consultantId
                };

                next();
            }
        }

        describe('POST /consultant', function () {
            it('should respond with http status 401', function () {

                const consultant = {
                    name: "testConsultant",
                    password: "testPassword"
                };

                const app = createApp({
                    session: sessionMock()
                });

                return request(app)
                    .post('/consultant')
                    .send(consultant)
                    .expect(401);

            });
        });

        describe('POST /login', function () {

            function sessionMock(consultantId) {
                return () => (req,res,next) => {
                    req.session = {
                        isLoggedIn: false
                    };

                    next();
                }
            }

            const consultant = {
                name: "testConsultant",
                password: "testPassword"
            };

            const ConsultantMock = {
                matchPasswords(name, password) {

                    const validPassword = 'testPassword';

                    if(password === validPassword){

                        return Promise.resolve({
                            status: true,
                            message: "OK Credentials",
                            consultant: {
                                name: consultant.name,
                                isAdmin: consultant.isAdmin
                            }
                        });
                    }
                    else{
                        return Promise.resolve({
                            status: false,
                            message: "Incorrect credentials"
                        });
                    }
                }
            };

            it('should respond with http status 200 if correct credentials is supplied', function () {

                const app = createApp({
                    session: sessionMock(),
                    Consultant: ConsultantMock,
                });

                return request(app)
                    .post('/login')
                    .send(consultant)
                    .expect(200)
                    .expect('Successfully logged in.')

            });

            it('should respond with http status 401 if incorrect credentials is supplied', function () {

                consultant.password = 'incorrecttestPassword';

                const app = createApp({
                    session: sessionMock(),
                    Consultant: ConsultantMock,
                });

                return request(app)
                    .post('/login')
                    .send(consultant)
                    .expect(401)
                    .expect('Could not login.');
            });

        });

        describe('POST /logout', function () {
            it('should respond with http status 200 if ok logout', function () {

                let destroyCalled = false;

                function sessionMock(consultantId) {
                    return () => (req,res,next) => {
                        req.session = {
                            isLoggedIn: true,
                            consultantId: consultantId,
                            destroy: () => {
                                destroyCalled = true;
                            }
                        };

                        next();
                    }
                }
                const app = createApp({
                    session: sessionMock()
                });

                return request(app)
                    .post('/logout')
                    .expect(200)
                    .then(function (res) {
                        expect(destroyCalled).to.eq(true);
                    })

            });

            it('should respond with http status 500 if not ok logout', function () {

                let destroyCalled = false;

                function sessionMock(consultantId) {
                    return () => (req,res,next) => {
                        req.session = {
                            isLoggedIn: false,
                            consultantId: consultantId,
                            destroy: () => {
                                destroyCalled = false;
                            }
                        };

                        next();
                    }
                }
                const app = createApp({
                    session: sessionMock()
                });

                return request(app)
                    .post('/logout')
                    .expect(500)
                    .then(function (res) {
                        expect(destroyCalled).to.eq(false);
                    })

            });

        });

    });



    //TODO - der mangler test af PUT/DELETE

    describe('Testing PUT endpoints when not logged in', function () {

        function sessionMock(consultantId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: false,
                    consultantId: consultantId
                };

                next();
            }
        }

        describe('PUT /consultant/:consultantId', function () {
            it('should return http 401', function () {

                const consultant = {
                    name: "testConsultant",
                    password: "testPassword"
                };

                const app = createApp({
                    session: sessionMock()
                });

                const consultantId = "testId";

                return request(app)
                    .put('/consultant/' + consultantId)
                    .send(consultant)
                    .expect(401)
                    .expect('Not authorized.');

            });
        });
    });

});

/*
    TODO
    login
    delete Order
    resten af login test
    test af om admin kan slette sig selv
 */