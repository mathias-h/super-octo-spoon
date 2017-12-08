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
<<<<<<< HEAD
        required: true
=======
        required: true,
>>>>>>> fa54e46fffb09588fa86c3610cbb0b7069c7740e
    }
});

Season.statics.createSeason = function (season) {
    if (!season){
        throw new Error("Seasonal Error")
    }else {
        return new this({
            season: season,
<<<<<<< HEAD
            default: false // TODO set default
=======
            default: false
>>>>>>> fa54e46fffb09588fa86c3610cbb0b7069c7740e
        }).save()
    }
}

Season.statics.updateSeasonName = function (seasonID, newSeasonName) {
    return this.findOneAndUpdate({_id: seasonID}, {$set:{season:newSeasonName}}, {runValidators: true})
}

Season.statics.setDefaultSeason = async function (seasonID) {
    await this.update({},{$set:{default:false}}, {runValidators: true, multi:true});
    await this.findOneAndUpdate({_id: seasonID}, {$set:{default:true}}, {runValidators: true})
}

module.exports.Season = Season

