const { Schema } = require("mongoose");
const { sort } = require("./sort");
const { search } = require("./search");
const moment = require("moment");
const { diff } = require("deep-object-diff");

const Order = new Schema({
    consultant: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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
        changes: Object,
        consultant: String
    }],
    dynamics: Object
}, { strict: true });

Order.statics.editOrder = async function updateOrder(order, user) {
    order = new this(order)._doc
    const oldOrder = (await this.findOne({ _id: order._id }).exec())._doc

    delete oldOrder.__v
    delete oldOrder.log
    delete order.log

    const changes = diff(oldOrder, order)
    
    delete changes._id
    delete changes.log

    const logChanges = Object.assign({}, changes, changes.address)
    delete logChanges.dynamics

    for (const fase in changes.dynamics) {
        for (const [k,v] of Object.entries(changes.dynamics[fase])) {
            logChanges[k] = v
        }
    }

    delete logChanges.address
    const newLog = {
        time: moment(new Date()).startOf("minute").toDate(),
        consultant: user,
        changes: logChanges
    }

    return this.findOneAndUpdate({ _id: order._id }, { $set: changes, $push: { log: newLog } }).exec()
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
    let orders = await this.find().lean().populate('consultant').exec()

    if (!query & !order){
        order = "desc";
    }

    orders = search(orders, query).map(o => {
        let fase = 1

        if (o.mapDate) fase = 2

        o.fase = fase

        return o
    })

    return sort(orders, sortBy, order).map(o => {
        o.signedDate = moment(o.signedDate).format("DD-MM-YYYY")
        return o
    })
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