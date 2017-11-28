'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;


const User = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    }
},{
    timestamps: true
});

User.pre('save', function (next) {

    if(this.username === undefined){
        return next(new Error('Username is undefined.'));
    }
    if(this.username === ''){
        return next(new Error('Username is empty.'));
    }
    if(typeof this.username !== 'string'){
        return next(new Error('Username is not a string.'));
    }
    if(this.password === undefined){
        return next(new Error('Password is undefined.'));
    }
    if(this.password === ''){
        return next(new Error('Password is empty.'));
    }
    if(typeof this.password !== 'string'){
        return next(new Error('Password is not a string.'));
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

User.pre('findOneAndUpdate', function (next) {



    const userName = this.getUpdate().$set.username;
    const password = this.getUpdate().$set.password;
    const isAdmin = this.getUpdate().$set.isAdmin;

    if(userName && userName === ''){
        return next(new Error('Username is empty.'));
    }
    if(userName && userName && typeof userName !== 'string'){
        return next(new Error('Username is not a string.'));
    }
    if(password && password === ''){
        return next(new Error('New password is empty.'));
    }
    if(password && typeof password !== 'string'){
        return next(new Error('New password is not a string.'));
    }
    if(isAdmin && isAdmin=== ''){
        return next(new Error('Admin level is empty.'));
    }
    if(isAdmin && typeof isAdmin !== 'string'){
        return next(new Error('Admin level is not a string.'));
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

User.statics.matchPasswords = function (username, password) {
    return this.findOne({username: username})
        .then(function (response) {
            if(!response){
                return Promise.reject({status: "ERROR", message: "Username or password is invalid."});
            }

            const hashedPassword = bcrypt.hashSync(password, response.salt);
            if(hashedPassword !== response.password){
                return Promise.reject({status: "ERROR", message: "Username or password is invalid."});
            }

            var result = {
                status: "OK",
                message: "Authentication OK",
                userData: {
                    username: response.username,
                    isAdmin: response.isAdmin
                    }
                };
            return Promise.resolve(result);
        })
        .catch(function (error) {
            return Promise.reject(error);
        });
};

module.exports = mongoose.model('User', User);