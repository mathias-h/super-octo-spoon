const express = require("express");
const mongoose = require("mongoose");
const hbs = require("hbs");

mongoose.connect("mongodb://localhost:27017/super-octo-spoon");
mongoose.Promise = global.Promise;

const app = express();
app.set('view engine', 'hbs');

const testOrders = [
    {
        consultant: "CONSULANT1",
        createdDate: new Date("1/1/2017"),
        tlf: "88888888",
        name: "NN1 Bondegården",
        address: {
            street: "Markvejen 1",
            city: "Bondeby",
            zip: "8123"
        },
        comment: "Ring efter høst"
    },
    {
        consultant: "CONSULANT1",
        createdDate: new Date("1/1/2017"),
        tlf: "88888889",
        name: "NN1 Bondegården",
        address: {
            street: "Markvejen 2",
            city: "Bondeby",
            zip: "8123"
        },
        comment: "Ring før høst"
    },
    {
        consultant: "CONSULANT2",
        createdDate: new Date("1/1/2017"),
        tlf: "88888888",
        name: "NN1 Bondegården",
        address: {
            street: "Markvejen 3",
            city: "Bondeby",
            zip: "8123"
        },
        comment: "Ring under høst"
    }
];

app.get("/", (req,res) => res.render("overview", { orders: testOrders }));

app.listen(1024);