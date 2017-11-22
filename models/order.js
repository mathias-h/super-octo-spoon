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
    farmName: {
        type: String,
        require: true
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
    comment: String,
    sampleDensity: {
        type: Number,
        min: 0
    },
    samePlanAsLast: {
        type: Boolean,
        default: false
    },
    takeOwnSamples: {
        type: Boolean,
        default: false
    },
    area: {
        type: Number,
        min: 0
    }
}, { strict: true });

module.exports = mongoose.model('Order', order);