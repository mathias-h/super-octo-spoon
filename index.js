const mongoose = require("mongoose");
const {createApp} = require("./app");
const { Order } = require("./models/order");
const { User } = require("./models/user");

//TODO Connection skal skrives om ved lejlighed så vi slipper for den deprecation warning.

mongoose.connect("mongodb://localhost:27017/super-octo-spoon");
mongoose.Promise = global.Promise;

const OrderModel = mongoose.model("Order", Order)
const UserModel = mongoose.model('User', User)

const app = createApp(OrderModel, UserModel);

app.listen(1024);