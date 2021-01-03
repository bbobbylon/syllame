
/*
In this file : 
    we pull in our required dependencies
    initiallize our app using express()
    apply middleware function for ~bodyparser~ so we can use it 
    pull in our MongoURI from keys.js and connect to our mongoDB database
    set the port for our server to run on and have our app listen on this port 


*/
const express = require ('express'); //node.js flexible web application framework that provides features for web applications
const mongoose = require ("mongoose"); // Mongoose is a MongoDB object modeling toold designed to work in an asynchronous environment, supporting both promises and callbacks
const bodyParser = require ("body-parser"); //node.js body parsing middleware
const passport = require("passport"); //used to authenticate requests, via plugins known as  ~strategies~.
const path = require("path");

const users = require("./routes/api/users");

const app = express();
//body parser middleware

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

//configure our database connection
const db = require("./config/keys").mongoURI;

//actually connecting to our database
mongoose
    .connect(
        db, 
        { useNewUrlParser: true, useUnifiedTopology: true}
    )
    .then( () => console.log("Mongo DB connected successfully!"))
    .catch(err => console.log(err));

//middleware for passport
app.use(passport.initialize());

//configure the passport
require("./config/passport")(passport);

//our routes
app.use("/api/users", users);

//serve our static assets (build folder if we are in production)

if(process.env.NODE_ENV=== 'production') {
    //set static folder
    app.use(express.static('client/build'))


    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build' , 'index.html'));

    })
}


    const port = process.env.PORT || 5000; //process.env.PORT is heroku's port if you choose to deploy the app

    app.listen(port, () => console.log(`Server up and running on port ${port} !`));

