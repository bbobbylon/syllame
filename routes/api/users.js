const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

//here we will load our input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//here we load our user model

const User = require("../../models/user");



/*

Now we will create our register endpoint.
1. We will pull ~errors~ and ~isValid~ from validateRegisterInput(req.body) function to check for validation
2. If valid, use MongoDB User.findOne() function to see if the user exists
If new user, fill in ~name, password , email~ with data that was sent in the body of the request
Then we will use ~bcryptjs~ for our password hashing before storing it into the database

*/


//@route POST api/users/register
// @desc Register a user
//@access public
router.post("/register", (req, res) => {
    //inside of this router.post functiom , we will do our form validation
    const {errors, isValid} = validateRegisterInput(req.body);
    

    //here we check the validation
    if(!isValid) {
        return res.status(400).json(errors)
    }

    User.findOne({email: req.body.email}).then(user => {
        if(user){
            return res.status(400).json({email: "Email already exists"});
        } 
        else {
            const newUser = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: req.body.password
            });

            //make sure to hash the password before saving to the database
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err,hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                    .save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
                });
            });
        }
    });
});


/*
Next step is our login route, where we do the same first two steps as the register endpoint. 
After that, use bcryptjs to compare the password the user submitted to the hashed password that is saved in the database
If match, JWT Payload is created
now we sign the JWT(includes payload, keys.secretOrKey from keys.js) and set an expiration time
if successful, connect the JWT to Bearer string in passport.js
*/
// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
    // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  const email = req.body.email;
    const password = req.body.password;
  // Find user by email
    User.findOne({ email }).then(user => {
      // Check if user exists
      if (!user) {
        return res.status(404).json({ emailnotfound: "Email not found" });
      }
  // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname
          };
  // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: "Password incorrect" });
        }
      });
    });
  });

  //export so that we can use this elsewhere
  module.exports = router;