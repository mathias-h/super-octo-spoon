"use strict";

const bodyParser = require('body-parser');
const express = require("express");
const hbs = require("hbs");

module.exports.createApp = function createApp(Order, User) {
    const app = express();
    app.set('view engine', 'hbs');
    
    // temp reload fix
    app.use((req,res, next) => {
        hbs.registerPartial("createOrderModal", require("fs").readFileSync(__dirname + "/views/createOrderModal.hbs").toString());
        hbs.registerPartial("editOrderModal", require("fs").readFileSync(__dirname + "/views/editOrderModal.hbs").toString());

        hbs.registerPartial("adminModal", require("fs").readFileSync(__dirname + "/views/admin.hbs").toString());
        hbs.registerPartial("createUser", require("fs").readFileSync(__dirname + "/views/admin/createUser.hbs").toString());

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
            return Order.getAll(req.query).then(orders => {
                return User.find({}).select({username: 1}).then(consultants => {
                    const data = {
                        orders,
                        totalSamples,
                        totalTaken,
                        query: req.query.query,
                        consultants: consultants
                    };
                    res.render("overview", data);
                });
            })
        }).catch(err => {
            console.error(err)
            res.render("error")
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
        Order.findOne({ _id: orderId }).populate("consultant", "username").populate("log.consultant", "username").exec().then(order => {
            if (!order) {
                res.header("Content-Type", "text/plain");
                res.status(404).send("order not found");
            }
            else res.json(order);
        });
    });
    
    app.put("/order", (req,res) => {
        const order = req.body;
        
        User.findOne().exec().then(user => {
            Order.editOrder(order, user._id).then(() => {
                res.end("order updated");
            }).catch(err => {
                console.error(err)
                res.status(500).json(err);
            });
        })
    });

    app.put("/order/dynamic/:orderId", (req,res) => {
        const orderId = req.params.orderId
        const { fase, name, value } = req.body

        Order.setDynamicField(orderId, fase, name, value)
            .then(() => res.end("ok"))
            .catch(err => res.status(500).json(err))
    })

    app.post("/user", function (req, res) {

        User.createUser(req.body)
            .then(function (response) {
                console.log(response);
                res.json({status: "OK", message: "User created."});
            })
            .catch(function (error) {
                console.log(error);
                res.json({status: "ERROR", message: "Could not create user."});
            });

    });

    app.put('/user/:userId', function (req, res) {

        User.updateUser(req.params.userId, req.body)
            .then(function (response) {
                console.log("DEBUG: route then()");
                console.log(response);
                res.json({status: "OK", message: "User updated."});
            })
            .catch(function (error) {
                console.log("DEBUG: route catch()");
                console.log(error);
                res.status(500).end("ERROR");
            });
    });

    app.get('/login', (req, res) =>{
        res.render('login');
    });

    app.post('/login', function (req, res) {

        User.matchPasswords(req.body.username, req.body.password)
            .then(function (result) {
                // TODO create session and set session variables
                console.log("DEBUG: route then()");
                console.log(result);

                if(result.status){
                    // TODO Start session her
                    res.json({status: "OK"});
                }
                else{
                    res.json({status: "INCORRECT_CREDENTIALS", message: "Forkert brugernavn eller kodeord."});
                }
                res.json(result);
            })
            .catch(function (error) {
                res.status(500).end({status: "ERROR", message: "Unknown error"});
            });
    });

    return app;
};