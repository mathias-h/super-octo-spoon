const bodyParser = require('body-parser');
const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");
const hbs = require("hbs");

const { search } = require("./models/search");

mongoose.connect("mongodb://localhost:27017/super-octo-spoon");
mongoose.Promise = global.Promise;

var Order = require('./models/order');

const app = express();
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (req,res) => {
    Order.find().exec((err, orders) => {
        const query = req.query.query
        const data = {
            orders: search(orders, query)
                .map(o => Object.assign(o, { signedDate: moment(o.signedDate).format("DD-MM-YYYY") })),
            query
        }
        res.render("overview", data)
    })
});

app.get("/opretOrdre", (req,res) => res.sendFile(__dirname + "/views/createOrder.html"));

app.post("/opretOrdre", (req, res) => {
    if(req.body.landlineNumber || req.body.phoneNumber) {
        try {
            var order = new Order({
                consultant:     req.body.consultant,
                signedDate:     req.body.signedDate,
                landlineNumber: req.body.landlineNumber,
                phoneNumber:    req.body.phoneNumber,
                name:           req.body.name,
                address:        req.body.address,
                comment:        req.body.comment
            });

            order.save().then(() => res.json({message: "Ordre oprettet i database."})).catch(() => res.json({error: "Ordre kunne ikke oprettes i database."}));

        } catch(e) {
            console.log(e);
            res.json({error: "Ordre kunne ikke oprettes i database."});
        }
    }else{
        res.json({error: "Intet telefonnummer angivet."});
    }
});


app.listen(1024);