const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const express = require("express");
const hbs = require("hbs");

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