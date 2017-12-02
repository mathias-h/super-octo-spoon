'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Season = new Schema({
    season: String
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


module.exports.Season = Season