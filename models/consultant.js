'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const Consultant = new Schema({
    name: {
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
    dummy: {
        required: true,
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
    strict: true

});

/**
 * Pre-save hook to hash password before saving to database.
 */
Consultant.pre('save', function (next) {

    if(this.name === undefined){
        return next(new Error('Name is undefined.'));
    }
    if(this.name === ''){
        return next(new Error('Name is empty.'));
    }
    if(typeof this.name !== 'string'){
        return next(new Error('Name is not a string.'));
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

/**
 * Pre-findOneAndUpdate hook to hash password before saving to database.
 */
Consultant.pre('findOneAndUpdate', function (next) {

    const name = this.getUpdate().$set.name;
    const password = this.getUpdate().$set.password;
    const isAdmin = this.getUpdate().$set.isAdmin;
    const dummy = this.getUpdate().$set.dummy;

    if(name && typeof name !== 'string'){
        return next(new Error('Name is not a string.'));
    }
    if(name === ''){
        return next(new Error('Name is empty.'));
    }
    if(password && typeof password !== 'string'){
        return next(new Error('New password is not a string.'));
    }
    if(password === ''){
        return next(new Error('New password is empty.'));
    }
    if(isAdmin && typeof isAdmin !== "boolean"){
        return next(new Error('Admin level is not a boolean.'));
    }
    if(dummy && typeof dummy !== "boolean"){
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
    else return next();
});

/**
 * Password validation. Matches the given consultants password with given password.
 * @param name - the name of the consultant.
 * @param password - the password to match against.
 * @returns {Promise.<*>} - a promise containing a status and a message or error related to that status.
 */
Consultant.statics.matchPasswords = async function (name, password) {

    if(!name){
        return {status: false, message: "Missing name."};
    }
    if(typeof name !== 'string'){
        return {status: false, message: "Incorrect type of name."};
    }
    if(!password){
        return {status: false, message: "Missing password."};
    }
    if(typeof password !== 'string'){
        return {status: false, message: "Incorrect type of password."};
    }
    return this.findOne({name: name})
        .then(function (consultant) {

            let response = {
                status: false,
                message: "Incorrect credentials"
            };

            if(consultant === null || consultant.dummy){
                return response;
            }
            else{
                return bcrypt.compare(password, consultant.password).then(function (res) {

                    if(res){
                        response.status = res;
                        response.message = "OK Credentials";
                        response.consultant = {
                            id: consultant._id,
                            name: consultant.name,
                            isAdmin: consultant.isAdmin
                        }
                    }
                    return response;
                });
            }
        }).catch(function (error) {
            console.error(error);
            return { status: false, error: error };
        });

};

/**
 * Updates a consultant with the passed data.
 * NOTE: Properties not defined in this schema cannot be added.
 * @param consultantId - the id of the consultant to update.
 * @param consultantData - the update data.
 * @returns {Query|*} - result from the query.
 */
Consultant.statics.updateConsultant = function (consultantId, consultantData) {

    const condition = {
        _id: consultantId
    };

    const update = {
        $set: consultantData
    };

    return this.findOneAndUpdate(condition, update, {runValidators: true});

};

/**
 * Creates a consultant.
 * @param consultantData - the information of the new consultant.
 */
Consultant.statics.createConsultant = function (consultantData) {
    const consultant = new this(consultantData);

    return consultant.save();
};


//TODO - skal lige have code review af deleteConsultant. Der er muligvis en bug.
/**
 * Deletes a consultant.
 * @param consultantId - the id of the consultant to delete.
 * @returns {Promise|Promise.<T>}
 */
Consultant.statics.deleteConsultant = function (consultantId) {
    /*
    implement delete functionality. Deleting a user should replace all references to that user with a dummy user
    "tidligereAnsat" and then delete user.
     */

    return this.findOne({name: "dummy"})
        .then(function (result) {

            if(result === null){
                throw new Error('Could not process delete.');
            }

            const condition = {
                _id: consultantId
            };
            const update = {
                $set: {
                    consultant: result._id
                }
            };

            this.model("Order").updateMany(condition, update)
                .then(function () {
                    this.findOneAndRemove({_id: consultantId})
                        .then(function () {
                            return {
                                status: 'OK',
                                message: 'Deletion successfully completed.'
                            };
                        });
                });

        })
        .catch(function (error) {
            console.error(error);
            return {
                status: 'ERROR',
                message: error
            };
        });

};

module.exports.Consultant = Consultant;