const mongoose = require("mongoose");
const {createApp} = require("./app");
const { Order } = require("./models/order");
const { User } = require("./models/user");
const session = require('express-session');

mongoose.Promise = global.Promise;
const connection = mongoose.createConnection("mongodb://localhost:27017/super-octo-spoon");

const OrderModel = connection.model("Order", Order);
const UserModel = connection.model('User', User);

const app = createApp({
    Order: OrderModel,
    User: UserModel,
    session
});

app.listen(1024, () => {
    console.log("listening")
});