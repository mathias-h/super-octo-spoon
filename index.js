const mongoose = require("mongoose");
const {createApp} = require("./app");
const { Order } = require("./models/order");
const { Consultant } = require("./models/consultant");
const session = require('express-session');
const { Season } = require("./models/season");
const { Dynamic } = require("./models/dynamic");

mongoose.Promise = global.Promise;
const connection = mongoose.createConnection("mongodb://localhost:27017/super-octo-spoon");

const app = createApp({
    Order: connection.model("Order", Order),
    Consultant: connection.model('Consultant', Consultant),
    session,
    Season: connection.model('Season', Season),
    Dynamic: connection.model('Dynamic', Dynamic)
});

app.listen(1024, () => {
    console.log("listening")
});