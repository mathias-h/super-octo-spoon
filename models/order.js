const { Schema, Types } = require("mongoose");
const mongoose = require("mongoose");
const { sort } = require("./sort");
const { search } = require("./search");
const moment = require("moment");
const { diff } = require("deep-object-diff");

const Order = new Schema({
    season: {
        type: Schema.Types.ObjectId,
        ref: "Season",
        required: true
    },
    consultant: {
        type: Schema.Types.ObjectId,
        ref: 'Consultant',
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
        consultant: {
            type: Schema.Types.ObjectId,
            ref: "Consultant"
        }
    }],
    dynamics: Object
}, { strict: true });

Order.statics.editOrder = async function updateOrder(order, userId) {
    order = (await new this(order).populate("consultant", "username").populate("season", "season").execPopulate())._doc
    const oldOrder = (await this.findOne({ _id: order._id }).populate("consultant", "username").populate("season", "season").exec())._doc
    let consultantId
    let seasonId

    delete oldOrder.__v
    delete oldOrder.log
    delete order.log

    const changes = diff(oldOrder, order)

    if (changes.consultant) {
        consultantId = order.consultant._doc._id.toHexString()
        changes.consultant = order.consultant._doc.name
    }

    if (changes.season) {
        seasonId = order.season._doc._id.toHexString()
        changes.season = order.season._doc.season
    }

    delete changes._id

    const dynamicChanges = changes.dynamics
    delete changes.dynamics

    const update = { $set: changes }

    const logChanges = Object.assign({}, changes, changes.address)
    delete logChanges.dynamics

    if (dynamicChanges) {
        for (const fase of Object.keys(dynamicChanges)) {
            for (const [k,v] of Object.entries(dynamicChanges[fase])) {
                if (v !== null && v !== undefined) {
                    update.$set["dynamics." + fase + "." + k] = v
                }
                logChanges[k] = v
            }
        }
    }

    for (const key of Object.keys(logChanges)) {
        if (logChanges[key] === null) delete logChanges[key]
    }

    delete logChanges.address

    if (Object.keys(logChanges).length > 0) {
        const newLog = {
            time: moment(new Date()).startOf("minute").toDate(),
            consultant: userId,
            changes: logChanges
        }

        update.$push = { log: newLog }
    }

    if (changes.consultant) {
        changes.consultant = consultantId
    }
    if (changes.season) {
        changes.season = seasonId
    }

    return this.findOneAndUpdate({ _id: order._id }, update)
}
Order.statics.createOrder = async function createOrder(orderData) {
    let dynamics = {}
    
    ;(await this.model("Dynamic").find()).forEach(({ fase, name }) => {
        if (!dynamics.hasOwnProperty(fase)) dynamics[fase] = {};
        dynamics[fase][name] = null;
    });

    if(orderData.landlineNumber || orderData.phoneNumber) {
        const order = new this({
            consultant: orderData.consultant,
            signedDate: orderData.signedDate,
            season: orderData.season,
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
            takeOwnSamples: orderData.takeOwnSamples,
            dynamics
        });
        await order.save();
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
    let orders = await this.find().lean()
        .populate('consultant', "username")
        .populate('season', "season")
        .exec()

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

module.exports.Order = Order