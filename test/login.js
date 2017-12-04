/*
const request = require('supertest');
const testSession = require("supertest-session");
const { expect } = require("chai");
const { createApp } = require("../app");

describe(' /GET on all end routes, session and login test', function () {

    it('should redirect if not logged in', function () {

        request(app);

    });
});
*/

const request = require('supertest');
const testSession = require("supertest-session")
const { expect } = require("chai");
const { createApp } = require("../app");

describe('login testing', function () {

    function sessionMock(userId) {
        return () => (req,res,next) => {
            req.session = {
                isLoggedIn: true,
                userId: userId
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
                .expect()

        })
    });

    describe('testing response when not logged in', function () {

        it('GET / should redirect to GET /login', function () {

        });

        it('should fail at GET /', function () {

        });

        it('', function () {

        })

    });

    describe('testing response when logged in', function () {

        it('')

    });

});