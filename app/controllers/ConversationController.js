//packages
let bcrypt = require("bcrypt");
let uniqid = require("uniqid");
let validator = require("validator");

//models
let Conversation = require("../models/ConversationModel");
let User = require("../models/UserModel");

module.exports.getAllConversations = function(req, res) {
    let userId = req.params.userId;
    
    if(!userId) {
        res.status(400);
        res.json({ success: false, message: "Invalid user Id" });
        return;
    }

    Conversation.find({ users: { $elemMatch: { user_id: userId } } }, "-_id -__v -created_at", function(error, result) {
        if(error) {
            res.status(400);
            res.json({ success: false, message: "An error occurred locating the user" });
            return;
        }

        if(!result) {
            res.status(400);
            res.json({ success: false, message: "No user found with that user id" });
            return;
        }

        res.status(200);
        res.json(result);
        return;
    });
}

module.exports.getNewConversations = function(req, res) {
    let userId = req.params.userId;
    let conversationId = req.params.conversationId;

    Conversation.find({ users: { $elemMatch: { user_id: userId } }, conversation_id: { $gt: conversationId } }, "-_id -__v -created_at", function(error, result) {
        if(error) {
            res.status(400);
            res.json({ success: false, message: "An error occurred getting new conversations" });
            return;
        }

        if(!result) {
            res.status(400);
            res.json({ success: false, message: "An error occurred getting new conversations" });
            return;
        }

        res.status(200);
        res.json(result);
        return;
    });
}

module.exports.createConversation = function(req, res) {
    let emailList = req.body.emailList;
    let userList = [];
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
            userList.push({
                email: result[i].email,
                user_id: result[i].user_id
            });
        }

        if(!userList.length) {
            res.status(400);
            res.json({ success: false, message: "An error occurred creating the conversation" });
            return;
        }

        //sort the list of users
        userList = userList.sort(sortEmailList);

        //check that the list of users isn't already in a conversation (conversation already exists)
        Conversation.find({ users: userList }, function(error, result) {
            if(error) {
                res.status(400);
                res.json({ success: false, message: "An error occurred creating the conversation" });
                return;
            }

            if(result.length) {
                res.status(400);
                res.json({ success: false, message: "That conversation already exists" });
                return;
            }
        
            let conversation = new Conversation({
                conversation_id: uniqid(),
                users: userList,
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
    
                //all data returned to the frontend should be an array for consistancy
                conversationData = [conversationData];
    
                res.status(200);
                res.json(conversationData);
                return;
            });
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

function sortEmailList(a, b) {
    if(a.email < b.email) return -1;
    if(a.email > b.email) return 1;
    return 0;
}