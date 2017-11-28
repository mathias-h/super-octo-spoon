"use strict";

const bodyParser = require('body-parser');
const express = require("express");
const hbs = require("hbs");
const CONSULTANTS = ["MH","MJ","NK","NL","MHL"];

module.exports.createApp = function createApp(Order, User) {
    const app = express();
    app.set('view engine', 'hbs');
    
    // temp reload fix
    app.use((req,res, next) => {
        hbs.registerPartial("createOrderModal", require("fs").readFileSync(__dirname + "/views/createOrderModal.hbs").toString());
        hbs.registerPartial("editOrderModal", require("fs").readFileSync(__dirname + "/views/editOrderModal.hbs").toString());
        hbs.registerPartial("createUserModal", require("fs").readFileSync(__dirname + "/views/createUserModal.hbs").toString());
        hbs.registerHelper("objectIter", function(obj, options) {
            let out = ""
            for (const [key, val] of Object.entries(obj)) {
                out += options.fn({ key, val })
            }
            console.log(out)
            return out
        })
        next()
    });

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
    
    app.post("/order", (req, res) => {
        Order.createOrder(req.body).then(() => {
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
    
    app.put("/order", (req,res) => {
        const order = req.body;
        const currentUser = "MH" // TODO get current user
    
        Order.editOrder(order, currentUser).then(() => {
            res.end("order updated");
        }).catch(err => {
            res.status(500).json(err);
        });
    });

    app.put("/order/dynamic/:orderId", (req,res) => {
        const orderId = req.params.orderId
        const { fase, name, value } = req.body

        Order.setDynamicField(orderId, fase, name, value)
            .then(() => res.end("ok"))
            .catch(err => res.status(500).json(err))
    })

    app.post("/user", function (req, res) {

        const user = new User({
            username: req.body.username,
            password: req.body.password,
            isAdmin: req.body.isAdmin
        });

        user.save().then(function (response) {
            res.json({status: "OK", message: "User created."});
        }).catch(function (error) {
            res.json({status: "ERROR", message: "Could not create user."});
        });

    });

    app.put('/user/:username', function (req, res) {

        const condition = {
            username: req.params.username
        };

        const update = {
            $set: req.body
        };

        User.findOneAndUpdate(condition, update, {runValidators: true})
            .then(function (response) {
                if(!response){
                    res.json({status: "ERROR", message: "User not found."})
                }
                res.json({status: "OK", message: "User updated."});
            })
            .catch(function (error) {
                res.json(error);
            });
    });

    app.post('/login', function (req, res) {
        User.matchPasswords(req.body.username, req.body.password)
            .then(function (result) {
                res.json(result);
            })
            .catch(function (error) {
                res.json(error);
            });
    });

    return app;
};