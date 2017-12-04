const mongoose = require("mongoose");
const { Consultant } = require("./models/consultant");

mongoose.Promise = global.Promise;
const connection = mongoose.createConnection("mongodb://localhost:27017/super-octo-spoon");

const ConsultantModel = connection.model('Consultant', Consultant);

ConsultantModel.createConsultant({name:"admin",password:"admin",isAdmin:true,dummy:false})