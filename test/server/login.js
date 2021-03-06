"use strict";

const request = require('supertest');
const { expect } = require("chai");
const { createApp } = require("../../app");
const mongoose = require("mongoose");

describe('Login/session testing', function () {

    describe('Testing GET endpoints when not logged in', function () {

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
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
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
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
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
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
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

    describe('Testing GET endpoints when logged in', function () {

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

                const order = {
                    name: "ORDER_NAME",
                    comment: "comment"
                };
                const OrderMock = {
                    getAll(queryParams) {
                        return Promise.resolve([order])
                    },
                    sampleTotals() {
                        return Promise.resolve({ totalSamples: 0, totalTaken: 0 })
                    }
                };
                const ConsultantMock = {
                    find: () => Promise.resolve({}),
                    count() {
                        return Promise.resolve(1);
                    }
                };
                const SeasonMock = {
                    find: () => Promise.resolve([]),
                    findOne: () => Promise.resolve({})
                };
                const DynamicMock = {
                    find: () => Promise.resolve([])
                };
                const app = createApp({
                    Order: OrderMock,
                    Consultant: ConsultantMock,
                    Season: SeasonMock,
                    Dynamic: DynamicMock,
                    session: sessionMock()
                });

                return request(app)
                    .get('/')
                    .then(function (res) {
                        expect(200);
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
                    name: 'testOrder',
                    comment: "comment"
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
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
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
            it('should serve /', function () {
                const order = {
                    name: "ORDER_NAME",
                    comment: "comment"
                };
                const OrderMock = {
                    getAll(queryParams) {
                        return Promise.resolve([order])
                    },
                    sampleTotals() {
                        return Promise.resolve({ totalSamples: 0, totalTaken: 0 })
                    }
                };
                const ConsultantMock = {
                    find: () => Promise.resolve({}),
                    count() {
                        return Promise.resolve(1);
                    }
                };
                const SeasonMock = {
                    find: () => Promise.resolve([]),
                    findOne: () => Promise.resolve({})
                };
                const DynamicMock = {
                    find: () => Promise.resolve([])
                };
                const app = createApp({
                    Order: OrderMock,
                    Consultant: ConsultantMock,
                    Season: SeasonMock,
                    Dynamic: DynamicMock,
                    session: sessionMock()
                });

                return request(app)
                    .get('/')
                    .then(function (res) {
                        expect(200);
                        expect("Content-Type", /text\/html/);
                        expect(res.text).not.contain('<form id="login-form">');
                        expect(/jordprøvebestilling/i);
                    });
            });
        });

    });

    describe('Testing POST endpoints when not logged in', function () {

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
            it('should receive http status 401 and message "Not authorized."', function () {

                const orderMock = {
                    name: "testOrder"
                };

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
                    session: sessionMock()
                });

                return request(app)
                    .post('/order')
                    .send(orderMock)
                    .expect(401)
                    .expect('Not authorized.');
            });
        });

        describe('POST /season', function () {
            it('should receive http status 401 and message "Not authorized."', function () {

                const seasonMock = {
                    name: "2017/2018"
                };

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
                    session: sessionMock()
                });

                return request(app)
                    .post('/season')
                    .send(seasonMock)
                    .expect(401)
                    .expect('Not authorized.');
            });
        });

        describe('POST /dynamic', function () {
            it('should receive http status 401 and message "Not authorized."', function () {

                const dynamicMock = {
                    name: "newDynamicRow"
                };

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
                    session: sessionMock()
                });

                return request(app)
                    .post('/dynamic')
                    .send(dynamicMock)
                    .expect(401)
                    .expect('Not authorized.');
            });
        });

        describe('POST /consultant', function () {
            it('should receive http status 401 and message "Not authorized."', function () {

                const consultant = {
                    name: "testConsultant",
                    password: "testPassword"
                };

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
                    session: sessionMock()
                });

                return request(app)
                    .post('/consultant')
                    .send(consultant)
                    .expect(401)
                    .expect('Not authorized.');

            });
        });

        describe('POST /login', function () {

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
                },
                count() {
                    return Promise.resolve(1);
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

                consultant.password = 'incorrectTestPassword';

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
            it('should respond with http status 200', function () {

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
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
                    session: sessionMock()
                });

                return request(app)
                    .post('/logout')
                    .expect(200)
                    .then(function (res) {
                        expect(destroyCalled).to.eq(true);
                    })

            });

        });

    });

    describe('Testing POST endpoints when logged in', function () {

        let destroyCalled = false;

        function sessionMock() {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: true,
                    consultantId: "testConsultantId",
                    destroy: () => {
                        destroyCalled = true;
                    }
                };

                next();
            }
        }

        const orderMock = {
            name: "testOrder",
            createOrder() {
                return Promise.resolve()
            }
        };

        const consultantMock = {
            name: "testConsultant",
            findOne() {
                return Promise.resolve({
                    _id: "testConsultantId"
                });
            },
            matchPasswords() {
                return Promise.resolve({
                    status: true,
                    message: "OK Credentials",
                    consultant: {
                        id: "testConsultantId",
                        name: "testConsultant",
                        isAdmin: true
                    }
                });
            },
            count() {
                return Promise.resolve(1);
            }
        };

        const seasonMock = {
            createSeason() {
                return Promise.resolve();
            }
        };

        const dynamicMock = {
            createDynamic() {
                return Promise.resolve();
            }
        };

        const app = createApp({
            session: sessionMock(),
            Consultant: consultantMock,
            Order: orderMock,
            Season: seasonMock,
            Dynamic: dynamicMock
        });

        describe('POST /order', function () {
            it('should receive http status 200 and message "OK"', function () {

                const postBody = {
                    msg: "testing POST /order when logged in"
                };

                return request(app)
                    .post('/order')
                    .send(postBody)
                    .expect(200)
                    .expect('OK');
            });
        });

        describe('POST /season', function () {
            it('should receive http status 200 and message "season created"', function () {

                const postBody = {
                    msg: "testing POST /season when logged in"
                };

                return request(app)
                    .post('/season')
                    .send(postBody)
                    .expect(200)
                    .expect('season created');

            });
        });

        describe('POST /dynamic', function () {
            it('should receive http status 200 and message "OK"', function () {

                const postBody = {
                    msg: "testing POST /dynamic when logged in"
                };

                return request(app)
                    .post('/dynamic')
                    .send(postBody)
                    .expect(200)
                    .expect('OK');

            });
        });

        describe('POST /consultant', function () {
            it('should receive http status 403 and message "Must be admin to create consultants."', function () {

                const postBody = {
                    msg: "testing POST /consultant when logged in"
                };

                return request(app)
                    .post('/consultant')
                    .send(postBody)
                    .expect(403)
                    .expect('Must be admin to create consultants.');

            });
        });

        describe('POST /login', function () {
            it('should receive http status 200 and message "Successfully logged in."', function () {

                const postBody = {
                    name: "testAdmin",
                    password: "testAdmin"
                };

                return request(app)
                    .post('/login')
                    .send(postBody)
                    .expect(200)
                    .expect('Successfully logged in.');

            });
        });

        describe('POST /logout', function () {
            it('should receive http status 200 and message "Logged out successfully."', function () {

                return request(app)
                    .post('/logout')
                    .expect(200)
                    .expect('Logged out successfully.');

            });
        });
    });

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

        describe('PUT /order', function () {
            it('should return http status 401 and message "Not authorized."', function () {

                const testOrder = {
                    name: "testOrder"
                };

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
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

                const testSeason = {
                    name: "2016/2017"
                };

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
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
            it('should return http status 401 and message "Not authorized."', function () {

                const consultant = {
                    name: "testConsultant",
                    password: "testPassword"
                };

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
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
                    isLoggedIn: true,
                    consultantId: consultantId
                };

                next();
            }
        }

        describe('PUT /order', function () {
            it('should receive http status 200 and message "OK"', function () {

                const Consultant = {
                    findOne() {
                        return Promise.resolve({_id: "testId"});
                    },
                    count() {
                        return Promise.resolve(1);
                    }
                };

                const Order = {
                    editOrder() {
                        return Promise.resolve();
                    }

                };

                const app = createApp({
                    Order: Order,
                    Consultant: Consultant,
                    session: sessionMock()
                });

                return request(app)
                    .put('/order/')
                    .expect(200)
                    .expect("OK");
            });
        });

        describe('PUT /season/:seasonID', function () {
            it('should receive http status 200 and {"status":"OK","message":"Season updated."}', function () {

                const Season = {
                    updateSeasonName() {
                        return Promise.resolve();
                    }

                };

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
                    Season: Season,
                    session: sessionMock()
                });

                return request(app)
                    .put('/season/' + 'testId')
                    .expect(200)
                    .expect({"status":"OK","message":"Season updated."});
            });
        });

        describe('PUT /consultant/:consultantId as non admin', function () {
            it('should receive http status 403 and message "Must be admin to edit consultants."', function () {

                const consultant = {
                    name: "testConsultant",
                    password: "testPassword"
                };

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
                    session: sessionMock()
                });

                const consultantId = "testId";

                return request(app)
                    .put('/consultant/' + consultantId)
                    .send(consultant)
                    .expect(403)
                    .expect('Must be admin to edit consultants.');

            });
        });

    });

    describe('Testing DELETE endpoints when not logged in', function () {
        function sessionMock(consultantId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: false,
                    isAdmin: false,
                    consultantId: consultantId
                };

                next();
            }
        }

        describe('DELETE /order/:orderId', function () {
            it('should receive http status 500 and message "ERROR"', function () {

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
                    session: sessionMock()
                });

                const orderId = "testId";

                return request(app)
                    .delete('/order/' + orderId)
                    .expect(401)
                    .expect('Not authorized.');
            })
        });

        describe('DELETE /dynamic/:id', function () {
            it('should receive http status 500 and message "ERROR"', function () {

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
                    session: sessionMock()
                });

                const id = "testId";

                return request(app)
                    .delete('/order/' + id)
                    .expect(401)
                    .expect('Not authorized.');
            })
        });

        describe('DELETE /consultant/:consultantId', function () {
            it('should receive http status 500 and message "ERROR"', function () {

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
                    session: sessionMock()
                });

                const consultantId = "testId";

                return request(app)
                    .delete('/consultant/' + consultantId)
                    .expect(401)
                    .expect('Not authorized.');
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

        describe('DELETE /order/:orderId', function () {
            it('should receive http status 200 and message "OK"', function () {

                const orderMock = {
                    remove() {
                        return Promise.resolve();
                    }

                };

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
                    Order: orderMock,
                    session: sessionMock()
                });

                return request(app)
                    .delete('/order/' + 'testId')
                    .expect(200)
                    .expect("OK");

            })
        });

        describe('DELETE /dynamic/:id', function () {
            it('should receive http status 200 and message "OK"', function () {

                const dynamicMock = {
                    deleteDynamic() {
                        return Promise.resolve();
                    }

                };

                const app = createApp({
                    Consultant: new class {
                        count() {
                            return Promise.resolve(1);
                        }
                    },
                    Dynamic: dynamicMock,
                    session: sessionMock()
                });

                return request(app)
                    .delete('/dynamic/' + 'testId')
                    .expect(200)
                    .expect("OK");

            })
        });

        describe('DELETE /consultant/:consultantId', function () {
            it('should receive http status 200 and "Consultant deleted.".', function () {

                const consultantMock = {
                    deleteConsultant() {
                        return Promise.resolve({
                            status: 'OK',
                            message: 'Deletion successfully completed.'
                        });
                    },
                    count() {
                        return Promise.resolve(1);
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