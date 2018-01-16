'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Season = new Schema({
    season: {
        type: String,
        unique: true,
        required: true,
    },
    default: {
        type: Boolean,
        required: true
    }
});

Season.statics.createSeason = function (season) {
    if (!season){
        throw new Error("Seasonal Error")
    }else {
        return this.count().then(count => {
            const isFirstSeason = count === 0
            return new this({
                season: season,
                default: isFirstSeason
            }).save()
        })
    }
}

Season.statics.updateSeasonName = function (seasonID, { season }) {
    return this.findOneAndUpdate({_id: seasonID}, {$set:{ season }}, {runValidators: true})
}

Season.statics.setDefaultSeason = async function (seasonID) {
    await this.update({},{$set:{default:false}}, {runValidators: true, multi:true});
    await this.findOneAndUpdate({_id: seasonID}, {$set:{default:true}}, {runValidators: true})
}

module.exports.Season = Season

