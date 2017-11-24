const { Schema } = require("mongoose");
const { search } = require("./search");
const { sort } = require("./sort")
const moment = require("moment");

const Order = new Schema({
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
    mapDate: Date,
    mapSample: Date,
    sampleTime: Number,
    mgSamples: Number,
    cutSamples: Number,
    otherSamples: Number,
    labDate: Date,
    fromLabDate: Date,
    mO: Date,
    receptApproved: Date
}, { strict: true });

Order.statics.editOrder = function updateOrder(order) {
    return this.findOneAndUpdate({ _id: order._id }, { $set: order }).exec()
}
Order.statics.createOrder = function createOrder(orderData) {
    if(orderData.landlineNumber || orderData.phoneNumber) {
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
            comment: orderData.comment,
            sampleDensity: orderData.sampleDensity,
            area: orderData.area,
            samePlanAsLast: orderData.samePlanAsLast,
            takeOwnSamples: orderData.takeOwnSamples
        });
        return order.save();
    } else {
        return Promise.reject(new Error("no landline or phone number"));
    }
};

Order.statics.sampleTotals = function sampleTotals() {
    const startOfYear = moment(new Date()).startOf("year").toDate()

    return this.find({ signedDate: { $gte: startOfYear }}).exec().then(orders => {
        return ({
            totalSamples: orders.reduce((total, order) => total + order.area,0),
            totalTaken: orders.reduce((total, order) => total + (order.mgSamples || 0) + (order.cutSamples || 0) + (order.otherSamples || 0), 0),
        })
    })
}

Order.statics.getAll = function getAll({query, sortBy="date"}) {
    return this.find().lean().exec().then(orders => {
        return sort(search(orders, query), sortBy, "asc").map(o => Object.assign(o, {
            signedDate: moment(o.signedDate).format("DD-MM-YYYY")
        }))
    });
}

module.exports.Order = Order