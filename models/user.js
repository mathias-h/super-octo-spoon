'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;


let user = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String//,
        //required: true
    },
    admin: {
        type: Boolean,
        required: true,
        default: false
    }
},{
    timestamps: true
});

user.pre('save', function (next) {

    if(this.userName === undefined){
        return next(new Error('Username is undefined.'));
    }
    if(this.userName === ''){
        return next(new Error('Username is empty.'));
    }
    if(typeof this.userName !== 'string'){
        return next(new Error('Username is not a string.'));
    }
    if(this.password === undefined){
        return next(new Error('New password is undefined.'));
    }
    if(this.password === ''){
        return next(new Error('New password is empty.'));
    }
    if(typeof this.password !== 'string'){
        return next(new Error('New password is not a string.'));
    }

    try {
        this.salt = bcrypt.genSaltSync(SALT_ROUNDS);
        this.password = bcrypt.hashSync(this.password, this.salt);
        return next();
    }
    catch(error){
        return next(error);
    }
});

user.pre('findOneAndUpdate', function (next) {

    const userName = this.getUpdate().$set.userName;
    const password = this.getUpdate().$set.password;

    if(userName !== undefined && userName === ''){
        return next(new Error('Username is empty.'));
    }
    if(userName !== undefined && typeof userName !== 'string'){
        return next(new Error('Username is not a string.'));
    }

    if(password !== undefined && password === ''){
        return next(new Error('New password is empty.'));
    }
    if(password !== undefined && typeof password !== 'string'){
        return next(new Error('New password is not a string.'));
    }

    try {
        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        const hashedPassword = bcrypt.hashSync(password, salt);
        this.getUpdate().$set.password = hashedPassword;
        this.getUpdate().$set.salt = salt;
        return next();
    } catch (error) {
        return next(error);
    }
});

module.exports = mongoose.model('User', user);