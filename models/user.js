'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;


const User = new Schema({
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

User.pre('findOneAndUpdate', function (next) {

    const userName = this.getUpdate().$set.userName;
    const password = this.getUpdate().$set.password;

    if(userName === undefined){
        return next(new Error('Username is undefined.'));
    }
    if(userName === ''){
        return next(new Error('Username is empty.'));
    }
    if(typeof userName !== 'string'){
        return next(new Error('Username is not a string.'));
    }

    if(password === undefined){
        return next(new Error('Username is undefined.'));
    }
    if(password === ''){
        return next(new Error('New password is empty.'));
    }
    if(typeof password !== 'string'){
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

User.statics.matchPasswords = function (userName, password) {
    return this.findOne({userName: userName})
        .then(function (response) {
            //TODO: Skal lige have sparring på det her. Bør vi returnere errors istedet for som pt. er gjort nedenfor?
            if(!response){
                return Promise.reject({status: "ERROR", message: "User not found."});
            }

            const hashedPassword = bcrypt.hashSync(password, response.salt);
            if(hashedPassword !== response.password){
                return Promise.reject({status: "ERROR", message: "Password mismatch."});
            }

            var result = {
                status: "OK",
                //TODO: Hvis ovenstående todo er ok, hvad skal message så være istedet for?
                message: "",
                userData: {
                    userName: response.userName,
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