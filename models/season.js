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
        return Error("Seasonal Error")
    }else {
        return new this({
            season: season
        }).save()
    }
}

Season.statics.updateSeason = function (seasonID, seasonData) {
    return this.findOneAndUpdate({_id: seasonID}, {$set:seasonData}, {runValidators: true})
        .then(function (res) {
            if (res){
                return {status: "OKSEASONKO", message: "season updated"}
            }else {
                throw new Error("oops update season didn't work")
            }
        })
}

module.exports.Season = Season

