"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const Salt = new Schema({
    value: {
        type: String,
        default: bcrypt.genSaltSync(SALT_ROUNDS)
    }
});

module.exports.Salt = Salt;