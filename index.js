const bodyParser = require('body-parser');
const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");
const hbs = require("hbs");
const { URL } = require("url");

const CONSULTANTS = ["MH","MJ","NK","NL","MHL"]

const { search } = require("./models/search");
const { sort } = require("./models/sort");

mongoose.connect("mongodb://localhost:27017/super-octo-spoon");
mongoose.Promise = global.Promise;

const Order = require('./models/order');

hbs.registerPartial("editOrderModal", require("fs").readFileSync(__dirname + "/views/editOrderModal.hbs").toString())

const app = express();
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (req,res) => {
    Order.find().sort({ signedDate: -1 }).lean().exec((err, orders) => {
        const query = req.query.query;
        var sortBy = "date";
        if (req.query.sortBy){
            sortBy = req.query.sortBy;
        console.log(req.query)
        }
        //TODO Add asc/desc + arrow to gui
        const data = {
            orders: sort(search(orders, query), sortBy, "asc").map(o => Object.assign(o, { signedDate: moment(o.signedDate).format("DD-MM-YYYY") })),
            query,
            consultants: CONSULTANTS
        };
        res.render("overview", data)
    })
});

app.post("/order/create", (req, res) => {
    console.log("POST");
    if(req.body.landlineNumber || req.body.phoneNumber) {
        try {
            const order = new Order({
                consultant: req.body.consultant,
                signedDate: req.body.signedDate,
                landlineNumber: req.body.landlineNumber,
                phoneNumber: req.body.phoneNumber,
                name: req.body.name,
                address: {
                    street: req.body.street,
                    city: req.body.city,
                    zip: req.body.zip
                },
                comment: req.body.comment
            });

            order.save().then(() => res.json({message: "Ordre oprettet i database."}))
                .catch((e) => {
                    res.json({error: "Ordre kunne ikke oprettes i database."});
                    console.log(e);
                });

        } catch(e) {
            console.log(e);
            res.json({error: "Ordre kunne ikke oprettes i database."});
        }
    }else{
        res.json({error: "Intet telefonnummer angivet."});
    }
});

app.get("/order/:orderId", (req,res) => {
    const orderId = req.params.orderId;
    Order.findOne({ _id: orderId }).then(order => {
        if (!order) res.status(404).send("order not found");
        else res.json(order)
    })
});

app.post("/order", (req,res) => {
    const order = req.body;

    Order.findOneAndUpdate({ _id: order._id }, { $set: order }).then(() => {
        res.end("order updated")
    }).catch(err => {
        res.status(500).json(err)
    })
});

app.listen(1024);

module.exports.app = app;