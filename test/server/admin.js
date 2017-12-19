"use strict";

const request = require('supertest');
const { expect } = require("chai");
const { createApp } = require("../../app");
const mongoose = require("mongoose");

describe('Testing admin privileges', function () {

    describe('Testing create, edit and delete a consultant as a non admin', function () {

        const testId  = "1234567890";
        const adminId = "adminId";

        function sessionMock() {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: true,
                    isAdmin: false,
                    consultantId: adminId
                };

                next();
            }
        };

        const app = createApp({
            Consultant: new class {
                count() {
                    return Promise.resolve(1);
                }
            },
            session: sessionMock()
        });

        describe('POST /consultant : Testing creating a consultant as non admin.', function () {
            it('should receive http status 403 and message "Must be admin to create consultants."', function () {

                return request(app)
                    .post('/consultant')
                    .expect(403)
                    .expect("Must be admin to create consultants.");
            });
        });

        describe('PUT /consultant/:consultantId : Testing editing a consultant as non admin.', function () {
            it('should receive http status 403 and message "Must be admin to edit consultants."', function () {

                const consultantData = {
                    name: "testUser",
                    password: "testUserPassword",
                    isAdmin: false
                };

                return request(app)
                    .put('/consultant/' + testId)
                    .send(consultantData)
                    .expect(403)
                    .expect("Must be admin to edit consultants.");
            });
        });

        describe('DELETE /consultant/consultantId : Testing deleting a consultant as non admin.', function () {
            it('should receive http status 403 and message "Must be admin to delete consultants."', function () {

                return request(app)
                    .delete('/consultant/' + testId)
                    .expect(403)
                    .expect("Must be admin to delete consultants.");
            });
        });

    });

    describe('Testing create, edit and delete a consultant as an admin', function () {

        const testId  = "1234567890";
        const adminId = "adminId";

        function sessionMock() {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: true,
                    isAdmin: true,
                    consultantId: adminId
                };

                next();
            }
        };

        const ConsultantMock = {
            updateConsultant(){
                return Promise.resolve();
            },
            createConsultant(){
                return Promise.resolve();
            },
            deleteConsultant(){
                return Promise.resolve();
            },
            count() {
                return Promise.resolve(1);
            }
        };

        const app = createApp({
            session: sessionMock(),
            Consultant: ConsultantMock
        });
        describe('POST /consultant : Testing creating a consultant as an admin.', function () {
            it('should receive http status 200 and message "Consultant created."', function () {

                const consultantData = {
                    name: "testUser",
                    password: "testUserPassword",
                    isAdmin: false
                };

                return request(app)
                    .post('/consultant')
                    .send(consultantData)
                    .expect(200)
                    .expect("Consultant created.");
            });
        });

        describe('PUT /consultant/:consultantId : Testing editing a consultant as an admin.', function () {
            it('should receive http status 200 and message "Consultant updated."', function () {

                const consultantData = {
                    name: "testUser",
                    password: "testUserPassword",
                    isAdmin: false
                };

                return request(app)
                    .put('/consultant/' + testId)
                    .send(consultantData)
                    .expect(200)
                    .expect("Consultant updated.");
            });
        });

        describe('DELETE /consultant/consultantId : Testing editing a consultant as an admin.', function () {
            it('should receive http status 200 and message "Must be admin to delete consultants."', function () {

                const consultantData = {
                    name: "testUser",
                    password: "testUserPassword",
                    isAdmin: false
                };

                return request(app)
                    .delete('/consultant/' + testId)
                    .expect(200)
                    .expect("Consultant deleted.");
            });
        });
    });

    describe('Testing delete oneself as an admin user', function () {
        describe('DELETE /consultant/:consultantId : Testing delete oneself as an admin user', function () {
            it('should receive http status 403 and message "Cannot delete yourself."', function () {

                const testId  = "1234567890";
                const adminId = "adminId";

                function sessionMock() {
                    return () => (req,res,next) => {
                        req.session = {
                            isLoggedIn: true,
                            isAdmin: true,
                            consultantId: adminId
                        };

                        next();
                    }
                };

                const ConsultantMock = {
                    updateConsultant() {
                        return Promise.resolve();
                    },
                    count() {
                        return Promise.resolve(1);
                    }
                };

                const app = createApp({
                    session: sessionMock(),
                    Consultant: ConsultantMock
                });

                const editData = {
                    isAdmin: false
                };

                return request(app)
                    .delete('/consultant/' + adminId)
                    .expect(403)
                    .expect("Cannot delete yourself.");

            });
        })
    });

    describe('Testing remove admin rights from oneself as an admin user', function () {
        describe('PUT /consultant/:consultantId : Testing remove admin rights from oneself as an admin user', function () {
            it('should receive http status 403 and message "Cannot remove admin privileges from yourself."', function () {

                const testId  = "1234567890";
                const adminId = "adminId";

                function sessionMock() {
                    return () => (req,res,next) => {
                        req.session = {
                            isLoggedIn: true,
                            isAdmin: true,
                            consultantId: adminId
                        };

                        next();
                    }
                };

                const ConsultantMock = {
                    updateConsultant() {
                        return Promise.resolve();
                    },
                    count() {
                        return Promise.resolve(1);
                    }
                };

                const app = createApp({
                    session: sessionMock(),
                    Consultant: ConsultantMock
                });

                const editData = {
                    isAdmin: false
                };

                return request(app)
                    .put('/consultant/' + adminId)
                    .send(editData)
                    .expect(403)
                    .expect("Cannot change your own admin privileges.");
            });
        })
    });

});