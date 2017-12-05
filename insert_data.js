const mongoose = require("mongoose");
const {createApp} = require("./app");
const { Order } = require("./models/order");
const { Consultant } = require("./models/consultant");

mongoose.Promise = global.Promise;
const connection = mongoose.createConnection("mongodb://localhost:27017/super-octo-spoon");

const OrderModel = connection.model("Order", Order);
const ConsultantModel = connection.model('Consultant', Consultant);

const consultants = [
    {
        "name": "SuperUser",
        "password": "5up3r53cr37P455w0rd",
        "isAdmin": true,
        "dummy": false
    },
    {
        "name": "admin",
        "password": "admin",
        "isAdmin": false,
        "dummy": false
    },
    {
        "name": "dummy",
        "password": "dummy",
        "isAdmin": false,
        "dummy": true
    },
    {
        "name": "ndlarsen",
        "password": "ndarsen",
        "isAdmin": false,
        "dummy": false
    },
    {
        "name": "TestConsultant01",
        "password": "TestConsultant01Password",
        "isAdmin": false,
        "dummy": false
    },
    {
        "name": "TestConsultant02",
        "password": "TestConsultant02Password",
        "isAdmin": false,
        "dummy": false
    },
    {
        "name": "TestConsultant03",
        "password": "TestConsultant03Password",
        "isAdmin": false,
        "dummy": false
    },
    {
        "name": "TestConsultant04",
        "password": "TestConsultant04Password",
        "isAdmin": false,
        "dummy": false
    },
    {
        "name": "TestConsultant04",
        "password": "TestConsultant04Password",
        "isAdmin": false,
        "dummy": false
    }
];

const orders = [
    {
        "consultant": "MH",
        "signedDate": new Date("1/1/2017"),
        "landlineNumber": "88888888",
        "phoneNumber": "20202020",
        "name": "NN1",
        "farmName": "Bondegården",
        "address": {
            "street": "Markvejen 1",
            "city": "Bondeby",
            "zip": "8123"
        },
        "comment": "Ring efter høst",
        "sampleDensity": 1,
        "samePlanAsLast": true,
        "takeOwnSamples": true,
        "area": 100
    },
    {
        "consultant": "MJ",
        "signedDate": new Date("1/1/2017"),
        "landlineNumber": "88888889",
        "phoneNumber": "20202020",
        "name": "NN1",
        "farmName": "Bondegården",
        "address": {
            "street": "Markvejen 2",
            "city": "Bondeby",
            "zip": "8123"
        },
        "comment": "Ring før høst",
        "sampleDensity": 1,
        "samePlanAsLast": true,
        "takeOwnSamples": true,
        "area": 100
    },
    {
        "consultant": "NL",
        "signedDate": new Date("1/1/2017"),
        "landlineNumber": "88888888",
        "phoneNumber": "20202020",
        "name": "NN1",
        "farmName": "Bondegården",
        "address": {
            "street": "Markvejen 12",
            "city": "TestAArhus",
            "zip": "8000"
        },
        "comment": "Ring under høst",
        "sampleDensity": 1,
        "samePlanAsLast": true,
        "takeOwnSamples": true,
        "area": 100
    },
    {
        "consultant": "MHL",
        "signedDate": new Date("1/1/2017"),
        "landlineNumber": "88888888",
        "phoneNumber": "20202020",
        "name": "NN1",
        "farmName": "Bondegården",
        "address": {
            "street": "Markvejen 12",
            "city": "Aarhus",
            "zip": "8000"
        },
        "comment": "Ring under høst",
        "sampleDensity": 1,
        "samePlanAsLast": true,
        "takeOwnSamples": true,
        "area": 100
    },
    {
        "consultant": "NK",
        "signedDate": new Date("1/1/2017"),
        "landlineNumber": "88888888",
        "phoneNumber": "20202020",
        "name": "NN1",
        "farmName": "Bondegården",
        "address": {
            "street": "Markvejen 3",
            "city": "Bondeby",
            "zip": "8123"
        },
        "comment": "Ring under høst",
        "smapleDensity": 1,
        "samePlanAsLast": true,
        "takeOwnSamples": true,
        "area": 100
    }
];

ConsultantModel.findOne({name: "admin"})
    .then(function (result) {
        if(result !== null){
            console.log('Admin Consultant found');
            connection.close();
        }
        else{
            ConsultantModel.createConsultant({
                name: "admin",
                password: "admin",
                isAdmin: true,
                dummy: false
            }).then(function (result) {
                console.log(result);
                console.log("Admin created.");
                connection.close();
            });
        }
    })
    .catch(function (error) {
        console.log(error);
        connection.close();
    });

ConsultantModel.findOne({name: "dummy"})
    .then(function (result) {
        if(result !== null){
            console.log('Dummy consultant found');
            connection.close();
        }
        else{
            ConsultantModel.createConsultant({
                name: "dummy",
                password: "dummy",
                isAdmin: false,
                dummy: true
            }).then(function (result) {
                console.log(result);
                console.log("Dummy created.");
                connection.close();
            });
        }
    })
    .catch(function (error) {
        console.log(error);
        connection.close();
    });