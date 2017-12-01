const mongoose = require("mongoose");
// const {createApp} = require("./app");
const { Order } = require("../models/order");
const { User } = require("../models/user");

mongoose.Promise = global.Promise;
const connection = mongoose.createConnection("mongodb://localhost:27017/super-octo-spoon");

const OrderModel = connection.model("Order", Order);
const UserModel = connection.model('User', User);

UserModel.createUser({username:"admin",password:"admin",isAdmin:true,isDisabled:false})