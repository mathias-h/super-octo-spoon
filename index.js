const mongoose = require("mongoose");
const {createApp} = require("./app")
const { Order } = require("./models/order")

//TODO Connection skal skrives om ved lejlighed så vi slipper for den deprecation warning.

mongoose.connect("mongodb://localhost:27017/super-octo-spoon");
mongoose.Promise = global.Promise;

const app = createApp(mongoose.model("Order", Order));

app.listen(1024);