var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const { search } = require("./search");
const moment = require("moment");

var Order = new Schema({
    consultant: {
        type: String,
        required: true
    },
    signedDate: {
        type: Date,
        required: true
    },
    landlineNumber: String,
    phoneNumber: String,
    name: {
        type: String,
        required: true
    },
    farmName: {
        type: String,
        require: true
    },
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        zip: {
            type: Number,
            required: true
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
    },
    dynamic: [{
        name: {
            type: String,
            required: true
        },
        value: String
    }]
}, { strict: true });

Order.statics.updateOrder = function updateOrder(order) {
    return this.findOneAndUpdate({ _id: order._id }, { $set: order });
}
Order.statics.createOrder = function createOrder(orderData) {
    if(orderData.landlineNumber || orderData.phoneNumber) {
        try {
            const order = new this({
                consultant: orderData.consultant,
                signedDate: orderData.signedDate,
                landlineNumber: orderData.landlineNumber,
                phoneNumber: orderData.phoneNumber,
                name: orderData.name,
                farmName: orderData.farmName,
                address: {
                    street: orderData.street,
                    city: orderData.city,
                    zip: orderData.zip
                },
                comment: orderData.comment
            });

            return order.save();
        } catch(e) {
            console.error(e)
            throw new Error("Ordre kunne ikke oprettes i database.");
        }
    }else{
        throw new Error("Intet telefonnummer angivet.");
    }
}
Order.statics.getAll = function getAll({query}) {
    return this.find().sort({ signedDate: -1 }).lean().exec().then(orders =>
        search(orders, query).map(o => Object.assign(o, {
            signedDate: moment(o.signedDate).format("DD-MM-YYYY")
        })));
}

module.exports = mongoose.model('Order', Order);