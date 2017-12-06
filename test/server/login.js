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

        describe('GET /login', function () {
            //TODO
            it('should serve /', function () {
                // TODO
                fail();
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

        describe('POST /order', function () {
            it('should ...', function () {
                //TODO
                fail();
            });
        });

        describe('POST /season', function () {
            it('should ...', function () {
                //TODO
                fail();
            });
        });

        describe('POST /dynamic', function () {
            it('should ...', function () {
                //TODO
                fail();
            });
        });

        //TODO
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

    describe('Testing POST endpoints when logged in', function () {
        //TODO
        function sessionMock(consultantId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: false,
                    consultantId: consultantId
                };

                next();
            }
        }

        //TODO
        it('should', function () {
            //TODO
            fail();
        })
    });

    describe('Testing PUT endpoints when not logged in', function () {
        //TODO
        function sessionMock(consultantId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: false,
                    consultantId: consultantId
                };

                next();
            }
        }

        describe('PUT /order/:orderId', function () {
            it('should return http status 401 and message "Not authorized."', function () {
                //TODO

                const testOrder = {
                    name: "testOrder"
                };

                const app = createApp({
                    session: sessionMock()
                });

                return request(app)
                    .put('/order/')
                    .send(testOrder)
                    .expect(401)
                    .expect('Not authorized.');

            });
        });

        describe('PUT /season/:seasonID', function () {
            it('\'should return http status 401 and message "Not authorized."', function () {
                //TODO
                const testSeason = {
                    name: "2016/2017"
                };

                const app = createApp({
                    session: sessionMock()
                });

                return request(app)
                    .put('/season/')
                    .send(testSeason)
                    .expect(401)
                    .expect('Not authorized.');
            });
        });

        describe('PUT /consultant/:consultantId', function () {
            it('\'should return http status 401 and message "Not authorized."', function () {

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

    describe('Testing PUT endpoints when logged in', function () {

        function sessionMock(consultantId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: false,
                    consultantId: consultantId
                };

                next();
            }
        }

        //TODO
        describe('PUT /order/:orderId', function () {
            it('should ...', function () {
                //TODO
                fail();
            });
        });

        describe('PUT /season/:seasonID', function () {
            it('should ...', function () {
                //TODO
                fail();
            });
        });

        describe('PUT /consultant/:consultantId', function () {
            //TODO
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

    describe('Testing DELETE endpoints when not logged in', function () {
        function sessionMock(consultantId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: true,
                    isAdmin: true,
                    consultantId: consultantId
                };

                next();
            }
        }

        //TODO
        describe('DELETE /order/:orderId', function () {
            //TODO
            it('should ...', function () {
                fail()
            })
        });

        describe('DELETE /dynamic/:id', function () {
            //TODO
            it('should ...', function () {
                fail()
            })
        });

        describe('DELETE /consultant/:consultantId', function () {
            //TODO
            it('should ...', function () {
                fail()
            })
        });
    });

    describe('Testing DELETE endpoints when logged in', function () {

        function sessionMock(consultantId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: true,
                    isAdmin: true,
                    consultantId: consultantId
                };

                next();
            }
        }

        //TODO
        describe('DELETE /order/:orderId', function () {
            //TODO
            it('should ...', function () {
                fail()
            })
        });

        describe('DELETE /dynamic/:id', function () {
            //TODO
            it('should ...', function () {
                fail()
            })
        });

        describe('DELETE /consultant/:consultantId', function () {
            //TODO

            it('should return http status 200 and "Consultant deleted." on sucess.', function () {

                const consultantMock = {
                    deleteConsultant() {
                        return Promise.resolve({
                            status: 'OK',
                            message: 'Deletion successfully completed.'
                        });
                    }


                };

                const app = createApp({
                    Consultant: consultantMock,
                    session: sessionMock()
                });

                return request(app)
                    .delete('/consultant/' + 'testId')
                    .expect(200)
                    .expect("Consultant deleted.");

            })
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