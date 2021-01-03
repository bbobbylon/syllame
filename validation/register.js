/*
This will be our validation flow: 
pull in ~validator~ and ~is-empty~ dependencies
    export validateRegisterInput: it takes in ~data~ as a parameter, which is sent from our frontend registration form
    instantiate ~errors~ object
    convert all empty fields to empty string before running validation checks, since ~validator~ only works with strings
    check for empty fields, make sure email format is valid, password requirements are met, and confirm passowords are the same using ~validator~ functions
    return ~errors~ object with all errors contained along with isValid boolean to see if we have any errors
*/
const Validator = require('validator');
const isEmpty = require('is-empty');
module.exports = function validateRegisterInput(data) {
  let errors = {};
// Convert empty fields to an empty string so we can use validator functions
  data.firstname = !isEmpty(data.firstname) ? data.firstname : "";
  data.lastname = !isEmpty(data.lastname) ? data.lastname : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";
// Name checks
  if (Validator.isEmpty(data.firstname)) {
    errors.firstname = "Name field is required";
  }
  if (Validator.isEmpty(data.lastname)) {
      errors.lastname  = "Last name is required"
  }
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
if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password field is required";
  }
if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be at least 6 characters";
  }
if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }
return {
    errors,
    isValid: isEmpty(errors)
  };
};
