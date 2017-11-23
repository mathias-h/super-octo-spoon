var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var user = new Schema({
    userName: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required, true
    },
    salt: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', user);