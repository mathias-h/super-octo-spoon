"use strict";

const bodyParser = require('body-parser');
const express = require("express");
const hbs = require("hbs");
const User = require('./models/user');
const CONSULTANTS = ["MH","MJ","NK","NL","MHL"];

module.exports.createApp = function createApp(Order) {
    const app = express();
    app.set('view engine', 'hbs');
    
    // temp reload fix
    app.use((req,res, next) => {
        hbs.registerPartial("createOrderModal", require("fs").readFileSync(__dirname + "/views/createOrderModal.hbs").toString());
        hbs.registerPartial("editOrderModal", require("fs").readFileSync(__dirname + "/views/editOrderModal.hbs").toString());
        hbs.registerPartial("createUserModal", require("fs").readFileSync(__dirname + "/views/createUserModal.hbs").toString());
        next()
    })

    app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    
    app.get("/", (req,res) => {
        Order.sampleTotals().then(({ totalSamples, totalTaken }) => {
            Order.getAll(req.query).then(orders => {
                const data = {
                    orders,
                    totalSamples,
                    totalTaken,
                    query: req.query.query,
                    consultants: CONSULTANTS
                };
                res.render("overview", data);
            })
        })
    });
    
    app.post("/order/create", (req, res) => {
        Order.createOrder(req.body).then(() => {
            res.header("Content-Type", "text/plain");
            res.send("order created");
        }).catch(e => {
            res.status(500).json(e);
        })
    });
    
    app.get("/order/:orderId", (req,res) => {
        const orderId = req.params.orderId;
        Order.findOne({ _id: orderId }).then(order => {
            if (!order) {
                res.header("Content-Type", "text/plain");
                res.status(404).send("order not found");
            }
            else res.json(order);
        });
    });
    
    app.post("/order", (req,res) => {
        const order = req.body;
    
        Order.editOrder(order).then(() => {
            res.header("Content-Type", "text/plain");
            res.end("order updated");
        }).catch(err => {
            res.status(500).json(err);
        });
    });

    app.post("/user/create", function (req, res) {
        const userData = req.body;

        var user = new User({userName: userData.userName, password: userData.password});

        user.save().then(function (response) {
            res.json({status: "Bruger oprettet."});
        }).catch(function (error) {
            res.json({error: "Kunne ikke oprette bruger."});
        });

    });

    app.put('/user/setPassword', function (req, res) {
        // TODO
        const userData = req.body;

        User.findOneAndUpdate({userName: userData.userName}, {$set: {password: userData.password}})
            .then(function (response) {
                console.log(response);
                res.json({status: "Password sat."});
            })
            .catch(function (error) {
                console.log(error);
                res.json({error: "Kunne ikke sætte password."});
            });

    });

    return app
}