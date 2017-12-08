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
    dynamics: Object,
    sendToFarmer: Date,
    sendBy: {
        type: Schema.Types.ObjectId,
        ref: "Consultant"
    },
    contactFarmer: Boolean,
    wantsMap: Boolean,
    appointments: String,
    mapSendToFarmer: Date,
    mapSendToMachineStation: Date,
    fields: Number,
    areaMap: Number,
    done: Boolean
}, { strict: true });

Order.statics.editOrder = async function updateOrder(order, consultantId) {
    order = (await new this(order)
        .populate("consultant", "name")
        .populate("season", "season")
        .populate("sendBy", "name")
        .execPopulate())._doc
    const oldOrder = (await this.findOne({ _id: order._id })
        .populate("consultant", "name")
        .populate("season", "season")
        .populate("sendBy", "name")
        .exec())._doc
    let consultantIdChange
    let seasonId
    let sendById

    delete oldOrder.__v
    delete oldOrder.log
    delete order.log

    const changes = diff(oldOrder, order)

    if (changes.consultant) {
        consultantIdChange = order.consultant._doc._id.toHexString()
        changes.consultant = order.consultant._doc.name
    }

    if (changes.season) {
        seasonId = order.season._doc._id.toHexString()
        changes.season = order.season._doc.season
    }

    if (changes.sendBy) {
        sendById = order.sendBy._doc._id.toHexString()
        changes.sendBy = order.sendBy._doc.name
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
            consultant: consultantId,
            changes: logChanges
        }

        update.$push = { log: newLog }
    }

    if (changes.consultant) {
        changes.consultant = consultantIdChange
    }
    if (changes.season) {
        changes.season = seasonId
    }
    if (changes.sendBy) {
        changes.sendBy = sendById
    }

    return this.findOneAndUpdate({ _id: order._id }, update)
}
Order.statics.createOrder = async function createOrder(orderData, userId) {
    const dynamics = {};
    
    (await this.model("Dynamic").find()).forEach(({ fase, name }) => {
        if (!dynamics.hasOwnProperty(fase)) dynamics[fase] = {};
        dynamics[fase][name] = null;
    });

    if(orderData.landlineNumber || orderData.phoneNumber) {
        const log = {
            time: moment(new Date()).startOf("minute").toDate(),
            consultant: userId,
            changes: JSON.parse(JSON.stringify(orderData))
        }
        orderData.dynamics = dynamics
        orderData.log = [log]
        const order = new this(orderData);
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

Order.statics.getAll = async function getAll({ query, sortBy="date", order }, seasonId) {
    let orders = await this.find({ _id: seasonId }).lean()
        .populate('consultant', "name")
        .populate('season', "season")
        .exec();

    if (!query && !order){
        order = "desc";
    }

    orders = search(orders, query).map(o => {
        let fase;

        if (o.done) fase = 4;
        else if (o.sendToFarmer) fase = 3;
        else if (o.mapDate) fase = 2;
        else fase = 1;

        o.fase = fase;

        return o;
    });

    return sort(orders, sortBy, order).map(o => {
        o.signedDate = moment(o.signedDate).format("DD-MM-YYYY");
        return o;
    });
}

module.exports.Order = Order