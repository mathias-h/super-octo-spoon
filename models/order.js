var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var order = new Schema({
    consultant:     String,
    signedDate:     Date,
    landlineNumber: String,
    phoneNumber:    String,
    name:           String,
    address: {
        street: String,
        city:   String,
        zip:    Number,
    },
    comment: String


});

module.exports = mongoose.model('Order', order);