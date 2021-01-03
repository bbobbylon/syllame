/*
In this file, we will:
    pull our dependencies
    create Schema to represent a User, defining fields and types as objects of the Schema
    export the model so we can access it outside of this file
*/

const mongoose = require('mongoose'); // Mongoose is a MongoDB object modeling toold designed to work in an asynchronous environment, supporting both promises and callbacks
const Schema = mongoose.Schema;


//this schema contains the fields of a user object, that is later sent to our database
const userSchema = new Schema ({
    firstname: {
        type: String, 
        required: true
    },
    lastname: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: true
    },
    password: {
        type:String,
        required: true,
    },
    date: {
        type: Date, 
        default: Date.now
    }

});
//here we export "User" with our schema and the collection (in MongoDB) "users"
//this is essentially how we send data to database
//module.exports = mongoose.model("User" , userSchema , "users")

module.exports = User = mongoose.model("users", userSchema)