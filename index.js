const express = require("express");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/super-octo-spoon");
mongoose.Promise = global.Promise;

const app = express();

//app.get("/", (req,res) => res.end("HELLO WORLD"))

app.listen(1024);

//Mainview
//Headers
//Menu, Søgeknap
//#Headers
//#Data