const request = require('supertest');
const testSession = require("supertest-session");
const { expect } = require("chai");
const { createApp } = require("../app");

describe('Login/session testing', function () {

    describe('Testing GET route endpoints when not logged in', function () {

        function sessionMock(userId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: false,
                    userId: userId
                };

                next();
            }
        }

        it('GET / - should redirect to /login', function () {

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

        it('GET /order/:orderId - should redirect to /login', function () {

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

        it('GET /login - should serve /login', function () {

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

        it('GET /logout - should redirect to /login', function () {

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

    describe('testing GET endpoint response when logged in', function () {

        function sessionMock(userId) {
            return () => (req,res,next) => {
                req.session = {
                    isLoggedIn: true,
                    userId: userId
                };

                next();
            }
        }

        it('GET / should redirect to GET /login', function () {

        });

        it('should fail at GET /', function () {

        });

        it('', function () {

        })

    });

});