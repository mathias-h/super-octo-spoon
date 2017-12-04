const mongoose = require("mongoose");
const { User } = require("./models/user");

mongoose.Promise = global.Promise;
const connection = mongoose.createConnection("mongodb://localhost:27017/super-octo-spoon");

const UserModel = connection.model('User', User);

UserModel.createConsultant({name:"admin",password:"admin",isAdmin:true,dummy:false})