const { Schema } = require("mongoose");
const { sort } = require("./sort");
const { search } = require("./search");
const moment = require("moment");
const diff = require("object-diff");

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
    sampleDate: Date,
    sampleTime: Number,
    mgSamples: Number,
    cutSamples: Number,
    otherSamples: Number,
    labDate: Date,
    fromLabDate: Date,
    mO: Date,
    receptApproved: Date,
    samplesTaken: Number,
    log:[{
        time: Date,
        changes: Object
    }]
}, { strict: true });

Order.statics.editOrder = async function updateOrder(order) {
    order = new this(order)._doc
    delete order.log
    const oldOrder = (await this.findOne({ _id: order._id }).exec())._doc
    delete oldOrder.log
    delete oldOrder.__v
    const changes = diff.custom({
        equal: function(a, b){
            if (a instanceof Date && b instanceof Date)
                return a.getTime() === b.getTime();
         
            return a === b;
        }
    }, oldOrder, order)
    delete changes._id
    delete changes.address
    const addressChanges = diff(oldOrder.address || {}, order.address || {})
    const dbChanges = Object.keys(addressChanges).length ? Object.assign({}, changes, { address: addressChanges }) : changes
    const logChanges = Object.assign({}, changes, addressChanges)
    const newLog = {
        time: moment(new Date()).startOf("minute").toDate(),
        changes: logChanges
    }

    return this.findOneAndUpdate({ _id: order._id }, { $set: dbChanges, $push: { log: newLog } }).exec()
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

Order.statics.sampleTotals = async function sampleTotals() {
    const startOfYear = moment(new Date()).startOf("year").toDate()

    return (await this.aggregate([
        { $match: {
            signedDate: { $gte: startOfYear }
        }},
        { $group: {
            _id: null,
            totalSamples: { $sum:"$area" },
            totalTaken: { $sum:{$add:["$mgSamples","$cutSamples","$otherSamples"] }
        }}}
    ]).exec())[0] || {}
}

Order.statics.getAll = async function getAll({query, sortBy="date", order}) {
    const orders = await this.find().lean().exec()

    if (!query & !order){
        order = "desc";
    }

    return sort(search(orders, query), sortBy, order).map(o => Object.assign(o, {
        signedDate: moment(o.signedDate).format("DD-MM-YYYY")
    }))
}

Order.statics.setDynamicField = function setDynamicField(orderId, fase, name, value) {
    return this.findOneAndUpdate({ _id: orderId }, {
        $set: {
            ["dynamics." + fase + "." + name]: value
        }
    }).exec()
}

Order.index({
    consultant:"text",
    "address.zip":"text",
    "address.city":"text",
    "address.street":"text",
    landlineNumber:"text",
    phoneNumber:"text",
    name:"text",
    farmName:"text"
}, {
    name: "search-index"
})

module.exports.Order = Order