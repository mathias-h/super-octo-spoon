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

    let that = this;

    bcrypt.hash(this.password, SALT_ROUNDS, function (error, hash) {
        if(error){
            return next(error);
        }

        that.password = hash;
        return next();
    });
});

User.pre('findOneAndUpdate', function (next) {

    const username = this.getUpdate().$set.username;
    const password = this.getUpdate().$set.password;
    const isAdmin = this.getUpdate().$set.isAdmin;
    const isDisabled = this.getUpdate().$set.isDisabled;

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
        return next(new Error('Admin level is not a boolean.'));
    }
    if(isDisabled=== ''){
        return next(new Error('Activity level is empty.'));
    }
    if(isDisabled && typeof isDisabled !== "boolean"){
        return next(new Error('Activity level is not a boolean.'));
    }

    let that = this;
    if(password){
        bcrypt.hash(password, SALT_ROUNDS, function (error, hash) {
            if(error){
                return next(error);
            }

            that.getUpdate().$set.password = hash;
            return next();
        });
    }
    return next();
});

User.statics.matchPasswords = async function (username, password) {
/*
    let foundUser = await this.findOne({username: username}).exec();

    return await bcrypt.compare(password, foundUser.password);
*/

    if(!username){
        return {status: false, message: "Missing username."};
    }
    if(typeof username !== 'string'){
        return {status: false, message: "Incorrect type of username."};
    }
    if(!password){
        return {status: false, message: "Missing password."};
    }
    if(typeof password !== 'string'){
        return {status: false, message: "Incorrect type of password."};
    }
    return this.findOne({username: username})
        .then(function (user) {

            if(user === null){
                return {
                        status: false,
                        message: "User not found."
                        };
            }
            else{
                let response = {
                    status: false,
                    message: "Incorrect credentials"
                };

                response.status = bcrypt.compareSync(password, user.password);

                if(response.status){
                    response.message = "OK Credentials",
                    response.user = {
                        id: user._id,
                        username: user.username,
                        isAdmin: user.isAdmin,
                        isDisabled: user.isDisabled
                    }
                }

                return response;
            }
        }).catch(function (error) {
            return {
                    status: false,
                    error: error
                    };
        });

};

User.statics.updateUser = function (userId, userData) {

    const condition = {
        _id: userId
    };

    const update = {
        $set: userData
    };

    return this.findOneAndUpdate(condition, update, {runValidators: true})
        .then(function (response) {
            if(response){
                return {status: "OK", message: "User updated."};
            } else{
                throw new Error("User not found.");
            }
        })

};

User.statics.createUser = function (userData) {

    const user = new this();

    // TODO Check lige op på følgende checks. De holder vidst ikke helt i praksis - ndlarsen
    if(userData.username){
        user.username = userData.username;
    }
    if(userData.password){
        user.password = userData.password;
    }
    if(userData.isAdmin){
        user.isAdmin = userData.isAdmin;
    }
    if(userData.isDisabled){
        user.isDisabled = userData.isDisabled;
    }

    return user.save()
        .then(function (response) {
            return {status: "OK", message: "User created."};
        }).catch(function (error) {
            throw new Error("Could not create user.");
        });
};

//module.exports.User = User;
module.exports = mongoose.model('User', User);