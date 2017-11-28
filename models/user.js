'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const salt = require('./salt');
const Salt = mongoose.model('Salt', salt);
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
    // rewrite related
    saltId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salt'
    },
    /*
    salt: {
        type: String
    },
    */
    isAdmin: {
        required: true,
        type: Boolean,
        default: false
    },
    isDisabled: {
        required: true,
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
    strict: true

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

    const username = this.getUpdate().$set.username;
    const password = this.getUpdate().$set.password;
    const isAdmin = this.getUpdate().$set.isAdmin;

    if(username === ''){
        return next(new Error('Username is empty.'));
    }
    if(username && typeof username !== 'string'){
        return next(new Error('Username is not a string.'));
    }
    if(password === ''){
        return next(new Error('New password is empty.'));
    }
    if(password && typeof password !== 'string'){
        return next(new Error('New password is not a string.'));
    }
    if(isAdmin=== ''){
        return next(new Error('Admin level is empty.'));
    }
    if(isAdmin && typeof isAdmin !== "boolean"){
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
};

// REWRITE STARTS HERE

User.statics.createUser = function (userData){
    if(!userData.username){
        return Promise.reject(new Error('Username missing.'));
    }
    if(userData.username && typeof userData.username !== 'string'){
        return Promise.reject(new Error('Username is not a string.'));
    }
    if(userData.username === ''){
        return Promise.reject(new Error('Username is an empty string.'));
    }
    if(!userData.password){
        return Promise.reject(new Error('Password missing'));
    }
    if(userData.password && typeof userData.password !== 'string'){
        return Promise.reject(new Error('Password is not a string.'));
    }
    if(userData.password === ''){
        return Promise.reject(new Error('Password is an empty string'));
    }

    const salt = new Salt(userData);

    return salt.save()
        .then(function () {
            // TODO create/save user
            // if user cannot be saved, delete salt from db
            var user = new this({
                username: userData.username,
                password: bcrypt.hashSync(userData.password, salt.value),
                saltId: salt._id
            });
            if(userData.isAdmin){
                user.isAdmin = userData.isAdmin;
            }
            if(userData.isDisabled){
                user.isDisabled = userData.isDisabled;
            }
            user.save()
                .then(function (response) {
                    console.log(response);
                    return Promise.resolve('User saved to database')
                })
                .catch(function (error) {
                    console.log(error);
                    Salt.findByIdAndRemove(salt._id).then(function (response) {
                        console.log(response);
                        return Promise.reject(new Error('Could not save user to database.'));
                    });
                });
        })
        .catch(function (error) {
            console.log(error);
            return Promise.reject(new Error('Could not save user to database.'));
        });

};


// REWRITE ENDS HERE

module.exports.User = User;