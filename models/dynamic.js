'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Dynamic = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    fase: {
        type: Number,
        required: true
    }
});

Dynamic.statics.createDynamic = async function(name, fase) {
    await new this({
        name,
        fase
    }).save()

    await this.model("Order").update(
        { [`dynamics.${fase}.${name}`]: { $exists: false } },
        { $set: { [`dynamics.${fase}.${name}`]: undefined } })
}

Dynamic.statics.deleteDynamic = async function(id) {
    const { name, fase } = await this.findById(id)

    await this.model("Order").update({}, {
        $unset: { ["dynamics." + fase + "." + name]: "" }
    })

    await this.remove({ _id: id })
}

module.exports.Dynamic = Dynamic

