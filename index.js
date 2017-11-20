const express = require("express")
const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/super-octo-spoon")
mongoose.Promise = global.Promise

const app = express()

app.get("/", (req,res) => res.end("HELLO WORLD"))

app.get("/opretOrdre", (req, res) => {

});

app.listen(1024)