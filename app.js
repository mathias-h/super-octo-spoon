"use strict";

const bodyParser = require('body-parser');
const express = require("express");
const session = require('express-session');
const hbs = require("hbs");
const { MongoError } = require("mongodb")

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
        hbs.registerHelper("trunkText", function(comment){
            if(comment.length > 50){
                comment = comment.substring(0, 50).trim() + "...";
            }
            return comment;
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
        const method = req.method;
        const url = req.url;
        const isLoggedIn = req.session.isLoggedIn || false;

        if(method === 'GET'){
            if(isLoggedIn && url === '/login'){
                res.redirect('/');
            }
            else if((isLoggedIn && url !== '/login') || (!isLoggedIn && url === '/login')){
                next();
            }
            else{
                res.redirect('/login');
            }
        }
        else if ((!isLoggedIn && method === 'POST' && (url === '/login' || url === "/logout")) || isLoggedIn) {
            next();
        }
        else{
            res.status(401).end('Not authorized.');
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
            const defaultSeason = await Season.findOne({default:true});
            
            const data = {
                orders,
                totalSamples,
                totalTaken,
                query: req.query.query,
                selectedSeason: (defaultSeason !== null) ? req.query.season || defaultSeason.season : null ,
                defaultSeason: (defaultSeason !== null) ? defaultSeason._id : null,
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
            const consultant = await Consultant.findOne({ _id: req.session.consultantId });
            await Order.createOrder(req.body, consultant._id)
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
    });

    app.post("/season", function (req, res) {
        Season.createSeason(req.body.consultantData)
            .then(function (response) {
                res.send("season created")
            })
            .catch(function (err) {
                res.status(400).end("seasonal error")
            })
    });

    app.put("/season/:seasonID", (req, res) => {
        Season.updateSeasonName(req.params.seasonID, req.body)
            .then(function (response) {
                res.json({status: "OK", message: "Season updated."});
            })
            .catch(function (error) {
                res.status(500).end("ERROR");
            });
    });

    app.put("/season/default/:seasonID", (req, res) => {
        Season.setDefaultSeason(req.params.seasonID)
            .then(function (response) {
                res.json({status: "OK", message: "Season updated to default."});
            })
            .catch(function (error) {
                res.status(500).end("ERROR");
            });
    })

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

    app.post('/consultant', function (req, res) {

        const sess = req.session;

        if(!sess.isAdmin){
            res.status(403).send('Must be admin to create consultants.');
        }
        else {
            Consultant.createConsultant(req.body)
                .then(function (response) {
                    console.log(response);
                    res.status(200).end("Consultant created.");
                })
                .catch(function (error) {

                    console.log(error);

                    if (error instanceof MongoError && error.code === 11000){
                        res.status(409).end('Username already in use.');
                    }
                    else {
                        res.status(500).end('Unknown error.');
                    }
                });
        }

    });

    app.put('/consultant/:consultantId', function (req, res) {

        const sess = req.session;

        console.log(req.params.consultantId);
        console.log(sess.consultantId)
        console.log(req.params.consultantId === sess.consultantId);

        if(!sess.isAdmin){
            res.status(403).send('Must be admin to edit consultants.');
        }
        else if(req.params.consultantId === sess.consultantId && req.body.isAdmin === false){
            res.status(403).end('Cannot change your own admin privileges.');
        }
        else{
            Consultant.updateConsultant(req.params.consultantId, req.body)
                .then(function (response) {
                    res.status(200).end("Consultant updated.");
                })
                .catch(function (error) {
                    res.status(500).end("Unknown error.");
                });
        }
    });

    app.delete('/consultant/:consultantId', function (req, res) {

        const sess = req.session;

        if(!sess.isAdmin){
            res.status(403).send('Must be admin to delete consultants.');
        }
        else if(req.params.consultantId === sess.consultantId){
            res.status(403).end('Cannot delete yourself.');
        }
        else{
            Consultant.deleteConsultant(req.params.consultantId)
                .then(function () {
                    res.status(200).end("Consultant deleted.");
                })
                .catch(function (error) {
                    console.log(error);
                    res.status(500).end("Unknown error.");
                });
        }

    });

    app.get('/login', (req, res) =>{
        res.render('login');
    });

    app.post('/login', function (req, res) {

        const MSG_LOGIN_OK = 'Successfully logged in.';
        const MSG_LOGIN_ERROR = 'Could not login.';

        if(req.session.isLoggedIn){
            res.status(200).end(MSG_LOGIN_OK);
        }

        Consultant.matchPasswords(req.body.name, req.body.password)
            .then(function (result) {

                if(result.status){
                    const sess = req.session;

                    sess.isLoggedIn = true;
                    sess.name = result.consultant.name;
                    sess.consultantId = result.consultant.id;
                    sess.isAdmin = result.consultant.isAdmin;

                    res.status(200).end(MSG_LOGIN_OK);
                }
                else{
                    res.status(401).end(MSG_LOGIN_ERROR);
                }
            })
            .catch(function (error) {
                console.log(error);
                res.status(500).end('Unknown error.');
            });
    });

    app.post('/logout', function (req, res) {
        const sess = req.session;

        try {
            if (sess.isLoggedIn) {
                sess.destroy();
            }
            res.status(200).end('Logged out successfully.');
        } catch (error) {
            console.log(error);
            res.status(500).end('Could not logout.');
        }

    });



    return app;
};