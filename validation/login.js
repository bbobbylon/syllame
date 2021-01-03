/*
This will be our validation flow for login (similar to register.js but different fields): 
pull in ~validator~ and ~is-empty~ dependencies
    export validateRegisterInput: it takes in ~data~ as a parameter, which is sent from our frontend registration form
    instantiate ~errors~ object
    convert all empty fields to empty string before running validation checks, since ~validator~ only works with strings
    check for empty fields, make sure email format is valid, password requirements are met, and confirm passowords are the same using ~validator~ functions
    return ~errors~ object with all errors contained along with isValid boolean to see if we have any errors
*/

const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateLoginInput(data) {
  let errors = {};
// Convert empty fields to an empty string so we can use validator functions
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
// Email checks
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }
// Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }
return {
    errors,
    isValid: isEmpty(errors)
  };
};


