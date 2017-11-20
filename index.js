
const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");
const hbs = require("hbs");

const { search } = require("./models/search")

mongoose.connect("mongodb://localhost:27017/super-octo-spoon");
mongoose.Promise = global.Promise;

const app = express();
app.set('view engine', 'hbs');

const testOrders = [
    {
        consultant: "CONSULTANT1",
        createdDate: new Date("1/1/2017"),
        phone: "88888888",
        name: "NN1",
        farmName: "Bondegården",
        address: {
            street: "Markvejen 1",
            city: "aarhus",
            zip: "8123"
        },
        comment: "Ring efter høst"
    },
    {
        consultant: "CONSULTANT1",
        createdDate: new Date("1/1/2017"),
        phone: "88888889",
        name: "NN2",
        farmName: "Bondegården",
        address: {
            street: "parkvejen 2",
            city: "galten",
            zip: "8124"
        },
        comment: "Ring før høst"
    },
    {
        consultant: "CONSULTANT2",
        createdDate: new Date("1/1/2017"),
        phone: "88888887",
        name: "NN3",
        farmName: "Bondegården",
        address: {
            street: "parkvejen 3",
            city: "galten",
            zip: "8124"
        },
        comment: "Ring under høst"
    }
]

app.get("/", (req,res) => {
    const query = req.query.query
    const orders = search(testOrders, query).map(o => {
        o.createdDate = moment(o.createdDate).format("DD/MM/YYYY")
    return o;
    })
    res.render("overview", { orders, query })
});

app.listen(1024);