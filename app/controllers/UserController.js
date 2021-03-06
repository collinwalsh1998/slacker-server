//packages
let bcrypt = require("bcrypt");
let uniqid = require("uniqid");
let validator = require("validator");

//models
let User = require("../models/UserModel");

module.exports.createUser = function(req, res) {
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let password = req.body.password;
    let passwordAgain = req.body["password-again"];
    let formValidation = validateForm(req.body, true);

    if(!formValidation.success) {
        res.status(400);
        res.json(formValidation);
        return;
    }
    
    bcrypt.hash(password, 10, function(error, hash) {
        if(error) {
            res.status(400);
            res.json({ success: false, message: "An error occurred creating the user" });
            return;
        }

        let user = new User({
			user_id: uniqid(),
			first_name: first_name,
			last_name: last_name,
			email: email,
			password: hash,
			created_at: new Date(),
			updated_at: new Date()
        });
        
        user.save(function(error) {
            if(error) {
                //mongo error code 11000 is for duplicate entry. Since the only rows that need to be unique are user_id and email, it is safe to assume that the email is the duplicate field
                if(error.code === 11000) {
					res.status(400);
                    res.json({ success: false, message: "That email is already in use" });
                    return;
				}

                res.status(400);
                res.json({ success: false, message: "An error occurred creating the user" });
                return;
            }

            //remove some user object properties and send response
            let userData = user.toObject();
            delete userData._id;
			delete userData.__v;
			delete userData.password;
			delete userData.created_at;
            delete userData.updated_at;
            
            //all data returned to the frontend should be an array for consistancy
            userData = [userData];

            res.status(200);
            res.json(userData);
            return;
        });
    });
}

module.exports.login = function(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let formValidation = validateForm(req.body, false);

    if(!formValidation.success) {
        res.status(400);
        res.json(formValidation);
        return;
    }

    //find account with email given. Remove excess rows that are not needed
    User.findOne({ email: email }, "-_id -__v -created_at -updated_at", function(error, result) {
        if(error) {
            res.status(400);
            res.json({ success: false, message: "An error occurred while logging in" });
            return;
        }

        if(!result) {
            res.status(400);
            res.json({ success: false, message: "No account associated with that email" });
            return;
        }

        //to allow the object to be modified I needed to call the toObject function
        result = result.toObject();

        bcrypt.compare(password, result.password, function(error, match) {
            if(error) {
                res.status(400);
                res.json({ success: false, message: "An error occurred while logging in" });
                return;
            }

            if(!match) {
                res.status(400);
                res.json({ success: false, message: "Incorrect email or password" });
                return;
            }

            //remove the password property from object before sending back to client
            delete result.password;
            
            //all data returned to the frontend should be an array for consistancy
            result = [result];            

            res.status(200);
            res.json(result);
            return;
        });
    });
}

function validateForm(formData, checkPasswords) {
    //check that the form fields aren't empty
    for(let i in formData) {
        if(validator.isEmpty(formData[i])) {
            return { success: false, message: "Please fill out all form fields" };
        }
    }

    //check that the email is valid
    if(!validator.isEmail(formData.email)) {
        return { success: false, message: "Please enter a valid email address" };
    }

    //if two passwords need to be validated (when creating account). Otherwise skip over this (when logging in)
    if(checkPasswords) {
        //check that the passwords match. I could have used a comparison operator, but for consistancy I used the validator library
        if(!validator.equals(formData.password, formData["password-again"])) {
            return { success: false, message: "Your passwords do not match" };
        }
    }

    return { success: true };
}