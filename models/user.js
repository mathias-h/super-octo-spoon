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

    let foundUser = await this.findOne({username: username}).exec();

    return await bcrypt.compare(password, foundUser.password);



/*
    let foundUser = this.findOne({username: username});

    let returnValue = "notSet";

    bcrypt.compare(password, foundUser.password, function (error, isValidLogin) {

        console.log("DEBUG: isValidLogin " + isValidLogin);
        if(isValidLogin){

            returnValue = {
                id: foundUser._id,
                username: foundUser.username,
                isAdmin: foundUser.isAdmin,
                isDisabled: foundUser.isDisabled
            };
        }
        else {
            returnValue = false;
        }
        console.log(":" + returnValue);
    });

    //console.log(returnValue);

    return returnValue;



    return this.findOne({username: username})
        .then(function (response) {
            //console.log("DEBUG: findOne.then():");
            //console.log(response);
            if(!response){
                throw new Error("Username or password is invalid.");
            }

            bcrypt.compareSync(password, response.password, function (error, isValidLogin) {

                console.log("DEBUG: isValidLogin " + isValidLogin);
                if(isValidLogin){

                    return {
                        id: response._id,
                        username: response.username,
                        isAdmin: response.isAdmin,
                        isDisabled: response.isDisabled
                    };
                }
                else {
                    return false;
                }
            })



            const result = {
                id: response._id,
                username: response.username,
                isAdmin: response.isAdmin,
                isDisabled: response.isDisabled
            };

            bcrypt.compareSync(password, response.password)
                .then(function (isValidLogin) {
                    console.log("DEBUG: bcrypt.compare.then:");
                    if(isValidLogin){
                        console.log("DEBUG: isValidLogin " + isValidLogin);
                        return result;
                    }
                    else{
                        throw new Error("Username or password is incorrect.");
                    }

                })
                .catch(function (error) {
                    throw new Error("Could not validate.");
                });

        })
        .catch(function (error) {
            throw new Error("Could not validate.");
        });
    */
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
            console.log("DEBUG: findOneAndUpdate then():");
            console.log(response);
            if(response){
                console.log("resolving");
                return {status: "OK", message: "User updated."};
            } else{
                throw new Error("User not found.");
            }
        })

};

User.statics.createUser = function (userData) {

    const user = new this();

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
            console.log(response);
            return {status: "OK", message: "User created."};
        }).catch(function (error) {
            console.log(error);
            throw new Error("Could not create user.");
        });
};

module.exports.User = User;