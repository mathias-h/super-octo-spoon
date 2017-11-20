var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var order = new Schema({
    consultant:     {
        type:       String,
        required:   true
    },
    signedDate:     {
        type:       Date,
        required:   true
    },
    landlineNumber: String,
    phoneNumber:    String,
    name:           {
        type:       String,
        required:   true
    },
    address:    {
        street: {
            type:       String,
            required:   true
        },
        city:   {
            type:       String,
            required:   true
        },
        zip:    {
            type:       Number,
            required:   true
        }
    },
    comment: String
});

module.exports = mongoose.model('Order', order);