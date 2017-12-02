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

process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const User = require('../models/user');

const chai = require('chai');
const chaiHTTP = require('chai-http');

const { createApp } = require("../app");