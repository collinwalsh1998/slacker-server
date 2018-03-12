//packages
let bcrypt = require("bcrypt");
let uniqid = require("uniqid");
let validator = require("validator");

//models
let Conversation = require("../models/ConversationModel");
let User = require("../models/UserModel");

module.exports.createConversation = function(req, res) {
    let emailList = req.body.emailList;
    let idList = [];
    let formValidation = validateForm(emailList);

    if(!formValidation.success) {
        res.status(400);
        res.json(formValidation);
        return;
    }

    User.find({ email: { $in: emailList } }, "-_id -__v -first_name -last_name -password -created_at -updated_at", function(error, result) {
        if(error) {
            res.status(400);
            res.json({ success: false, message: "An error occurred creating the conversation" });
            return;
        }

        //push user data for new conversation into array
        for(let i in result) {
            idList.push({
                email: result[i].email,
                user_id: result[i].user_id
            });
        }

        if(!idList.length) {
            res.status(400);
            res.json({ success: false, message: "An error occurred creating the user" });
            return;
        }

        let conversation = new Conversation({
            conversation_id: uniqid(),
            users: idList,
            created_at: new Date(),
            updated_at: new Date()
        });

        conversation.save(function(error) {
            if(error) {
                res.status(400);
                res.json({ success: false, message: "An error occurred creating the conversation" });
                return;
            }

            let conversationData = conversation.toObject();
            delete conversationData._id;
            delete conversationData.__v;
            delete conversationData.created_at;

            res.status(200);
            res.json(conversationData);
            return;
        });
    });
}

function validateForm(formData) {
    //check that the email list isn't empty
    if(!formData.length) {
        return { success: false, message: "Invalid email list" };
    }

    //check that the emails in the email list are valid
    for(let i in formData) {
        if(validator.isEmpty(formData[i]) || !validator.isEmail(formData[i])) {
            return { success: false, message: "Invalid email or emails" };
        }
    }

    return { success: true };
}