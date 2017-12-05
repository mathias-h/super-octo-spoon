"use strict";

const bodyParser = require('body-parser');
const express = require("express");
const session = require('express-session');
const hbs = require("hbs");

module.exports.createApp = function createApp({
    Order,
    Consultant,
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
        hbs.registerPartial("createConsultant", require("fs").readFileSync(__dirname + "/views/admin/createConsultant.hbs").toString());
        hbs.registerPartial("createSeason", require("fs").readFileSync(__dirname + "/views/admin/createSeason.hbs").toString());

        hbs.registerHelper("objectIter", function(obj, options) {
            let out = ""
            for (const [key, val] of Object.entries(obj)) {
                out += options.fn({ key, val })
            }
            console.log(out)
            return out
        });
        hbs.registerHelper("equals", function (a, b, options) {
           if (a === b){
               return options.fn()
           }
        });

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
        name: null,
        consultantId: null,
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
            const consultants = await Consultant.find({});
            const seasons = await Season.find({});
            const dynamics = await Dynamic.find({});
            
            const data = {
                orders,
                totalSamples,
                totalTaken,
                query: req.query.query,
                selectedSeason: req.query.season,
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
    
    app.post("/order", async (req, res) => {
        try {
            const user = await User.findOne({ _id: req.session.userId });
            await Order.createOrder(req.body, user._id)
            res.send("OK");
        } catch (error) {
            console.error(error);
            res.status(500).end("ERROR");
        }
    });
    
    app.get("/order/:orderId", async (req,res) => {
        const orderId = req.params.orderId;
        const order = await Order.findOne({ _id: orderId })
            .populate("consultant", "name")
            .populate("log.consultant", "name")
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
            const consultant = await Consultant.findOne({ _id: req.session.consultantId });
            await Order.editOrder(order, consultant._id)
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
        Season.createSeason(req.body.consultantData)
            .then(function (response) {
                res.json({status:"ok", message:"season created"})
            })
            .catch(function (err) {
                res.json({status: "ERROR", message: "Could not create season."});
            })
    });

    app.post("/dynamic", (req,res) => {
        const { name, fase } = req.body;

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

    app.post("/consultant", function (req, res) {
        Consultant.createConsultant(req.body)
            .then(function (response) {
                //console.log(response);
                res.json({status: "OK", message: "Consultant created."});
            })
            .catch(function (error) {
                //console.log(error);
                res.json({status: "ERROR", message: "Could not create consultant."});
            });

    });

    app.put('/consultant/:consultantId', function (req, res) {
        Consultant.updateConsultant(req.params.consultantId, req.body)
            .then(function (response) {
                res.json({status: "OK", message: "Consultant updated."});
            })
            .catch(function (error) {
                res.status(500).end("ERROR");
            });
    });

    app.delete('/consultant/:consultantId', function (req, res) {
        Consultant.deleteConsultant(req.params.consultantId)
            .then(function (result) {
                console.log(result);
                res.json({status: "OK", message: "Consultant deleted."});
            })
            .catch(function (error) {
                console.log(error);
                res.status(500).end("ERROR");
            });
    });

    app.get('/login', (req, res) =>{
        res.render('login');
    });

    app.post('/login', function (req, res) {
        Consultant.matchPasswords(req.body.name, req.body.password)
            .then(function (result) {
                //console.log("DEBUG: route then()");
                //console.log(result);

                if(result.status){
                    const sess = req.session;

                    sess.isLoggedIn = true;
                    sess.name = result.consultant.name;
                    sess.consultantId = result.consultant.id;
                    sess.isAdmin = result.consultant.isAdmin;

                    res.json({status: "OK"});
                }
                else{
                    res.json({status: "INCORRECT_CREDENTIALS", message: "Forkert brugernavn eller kodeord."});
                }
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