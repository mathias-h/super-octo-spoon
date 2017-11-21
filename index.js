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

const testOrders = [
    {
        consultant: "CONSULTANT1",
        signedDate: new Date("1/1/2017"),
        phone: "88888888",
        mobile: "20202020",
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
        signedDate: new Date("1/1/2017"),
        phone: "88888889",
        mobile: "20202020",
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
        signedDate: new Date("1/1/2017"),
        phone: "88888887",
        mobile: "20202020",
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
    const orders = search(testOrders, query)
        .map(o => Object.assign({
            signedDate: moment(o.signedDate).format("DD/MM/YYYY")
        }, o))
    res.render("overview", { orders, query })
});

app.get("/opretOrdre", (req,res) => res.sendFile(__dirname + "/views/createOrder.html"));

app.post("/opretOrdre", (req, res) => {
    if(req.body.landlineNumber || req.body.phoneNumber) {
        try{
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

        }catch(e){
            console.log(e);
            res.json({error: "Ordre kunne ikke oprettes i database."});
        }
    }else{
        res.json({error: "Intet telefonnummer angivet."});
    }
});


app.listen(1024);