const bodyParser = require('body-parser');
const express = require("express");
const mongoose = require("mongoose");
const hbs = require("hbs");

const CONSULTANTS = ["MH","MJ","NK","NL","MHL"];

mongoose.connect("mongodb://localhost:27017/super-octo-spoon");
mongoose.Promise = global.Promise;

const Order = require('./models/order');

hbs.registerPartial("editOrderModal", require("fs").readFileSync(__dirname + "/views/editOrderModal.hbs").toString());

const app = express();
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (req,res) => {
    
    Order.getAll(req.query).then(orders => {
        const data = {
            orders,
            query: req.query.query,
            consultants: CONSULTANTS
        };
        res.render("overview", data);
    })
});

app.post("/order/create", (req, res) => {
    Order.createOrder(req.body).then(() => {
        res.eend("Ordre oprettet")
    }).catch(e => {
        res.status(500).json(e)
    })
});

app.get("/order/:orderId", (req,res) => {
    const orderId = req.params.orderId;
    Order.findOne({ _id: orderId }).then(order => {
        if (!order) res.status(404).send("order not found");
        else res.json(order);
    });
});

app.post("/order", (req,res) => {
    const order = req.body;

    Order.updateOrder(order).then(() => {
        res.end("order updated");
    }).catch(err => {
        res.status(500).json(err);
    });
});

app.listen(1024);

module.exports.app = app;