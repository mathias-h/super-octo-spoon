"use strict";

const bodyParser = require('body-parser');
const express = require("express");
const session = require('express-session');
const hbs = require("hbs");

module.exports.createApp = function createApp({
    Order,
    User,
    session,
    Season,
    Dynamic
}) {
    const app = express();
    app.set('view engine', 'hbs');
    
    // temp reload fix
    app.use((req,res, next) => {
        hbs.registerPartial("createOrderModal", require("fs").readFileSync(__dirname + "/views/createOrderModal.hbs").toString());
        hbs.registerPartial("editOrderModal", require("fs").readFileSync(__dirname + "/views/editOrderModal.hbs").toString());

        hbs.registerPartial("adminModal", require("fs").readFileSync(__dirname + "/views/admin.hbs").toString());
        hbs.registerPartial("createUser", require("fs").readFileSync(__dirname + "/views/admin/createUser.hbs").toString());
        hbs.registerPartial("createSeason", require("fs").readFileSync(__dirname + "/views/admin/createSeason.hbs").toString());

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

    // Session related stuff starting //
    // Create session and defaults

    app.use(session({
        secret: "5up3r53cur353cr37",
        resave: false,
        saveUninitialized: false,
        isLoggedIn: false,
        username: null,
        userId: null,
        isAdmin: false
    }));

    // Default session check for all requests to this app
    app.use(function (req, res, next) {
        const sess = req.session;
        const url = req.url;

        if(sess.isLoggedIn && url === '/login'){
            res.redirect('/');
        }
        else if((sess.isLoggedIn && url !== '/login') || (!sess.isLoggedIn && url === '/login')){
            next();
        }
        else{
            res.redirect('/login');
        }
    });

    // Session related stuff ends //

    app.get("/", async (req,res) => {
        try {
            const { totalSamples, totalTaken } = await Order.sampleTotals();
            const orders = await Order.getAll(req.query);
            const consultants = await User.find({});
            const seasons = await Season.find({});
            const dynamics = await Dynamic.find({});
            
            const data = {
                orders,
                totalSamples,
                totalTaken,
                query: req.query.query,
                consultants,
                seasons,
                dynamics
            };
            res.render("overview", data);
        } catch(err) {
            console.error(err);
            res.render("error");
        }
    });
    
    app.post("/order", (req, res) => {
        Order.createOrder(req.body).then(() => {
            res.send("OK");
        }).catch(e => {
            console.error(e)
            res.status(500).end("ERROR");
        })
    });
    
    app.get("/order/:orderId", async (req,res) => {
        const orderId = req.params.orderId;
        const order = await Order.findOne({ _id: orderId })
            .populate("consultant", "username")
            .populate("log.consultant", "username")
            .populate('season', "season")

        if (!order) {
            res.header("Content-Type", "text/plain");
            res.status(404).send("order not found");
        }
        else {
            res.json(order);
        }
    });
    
    app.put("/order", async (req,res) => {
        const order = req.body;

        try {
            const user = await User.findOne({ _id: req.session.userId });
            await Order.editOrder(order, user._id)
            res.end("OK")
        } catch (error) {
            console.error(error)
            res.status(500).end("ERROR");
        }
    });

    app.delete("/order/:orderId", async (req,res) => {
        const orderId = req.params.orderId;

        try {
            await Order.remove({ _id: orderId });
            res.end("OK");
        } catch (error) {
            console.error(error);
            res.status(500).end("ERROR");
        }
    })

    app.post("/season", function (req, res) {
        Season.createSeason(req.body.userData)
            .then(function (response) {
                res.json({status:"ok", message:"season created"})
            })
            .catch(function (err) {
                res.json({status: "ERROR", message: "Could not create season."});
            })
    });

    app.post("/dynamic", (req,res) => {
        const { name, fase } = req.body;

        console.log(Dynamic.createDynamic)

        Dynamic.createDynamic(name, fase).then(() => {
            res.end("OK");
        }).catch(err => {
            console.error(err);
            res.status(500).end("ERROR");
        });
    });
    app.delete("/dynamic/:id", (req,res) => {
        const id = req.params.id

        Dynamic.deleteDynamic(id).then(() => {
            res.end("OK");
        }).catch(err => {
            console.error(err);
            res.status(500).end("ERROR");
        });
    });

    app.post("/user", function (req, res) {
        User.createUser(req.body)
            .then(function (response) {
                //console.log(response);
                res.json({status: "OK", message: "User created."});
            })
            .catch(function (error) {
                //console.log(error);
                res.json({status: "ERROR", message: "Could not create user."});
            });

    });

    app.put('/user/:userId', function (req, res) {
        User.updateUser(req.params.userId, req.body)
            .then(function (response) {
                //console.log("DEBUG: route then()");
                //console.log(response);
                res.json({status: "OK", message: "User updated."});
            })
            .catch(function (error) {
                //console.log("DEBUG: route catch()");
                //console.log(error);
                res.status(500).end("ERROR");
            });
    });

    app.get('/login', (req, res) =>{
        res.render('login');
    });

    app.post('/login', function (req, res) {

        const sess = req.session;

        User.matchPasswords(req.body.username, req.body.password)
            .then(function (result) {
                //console.log("DEBUG: route then()");
                //console.log(result);

                if(result.status){
                    // TODO Start session her
                    //console.log("Starting session.");

                    sess.isLoggedIn = true;
                    sess.username = result.user.username;
                    sess.userId = result.user.id;
                    sess.isAdmin = result.user.isAdmin;

                    //console.log(sess);

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

    app.get('/logout', function (req, res) {
        const sess = req.session;

        if(sess.isLoggedIn){
            sess.destroy();
        }
        res.redirect('/login');

    });

    return app;
};