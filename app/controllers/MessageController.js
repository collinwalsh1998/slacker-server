//packages
let mongoose = require("mongoose");
let uniqid = require("uniqid");

//models
let User = require("../models/UserModel");
let Message = require("../models/MessageModel");

module.exports.sendMessage = function(req, res) {
    let threadId = req.body.thread_id;
    let sender = req.body.sender;
    let messageContent = req.body.message;

    //get user_id of sender
    User.find({ email: sender  }, "-_id -__v -first_name -last_name -password -created_at -updated_at", function(error, result) {
        if(error) {
            res.status(400);
            res.json({ success: false, message: "An error occurred sending the message" });
            return;
        }

        let senderData = [{ email: result[0].email, user_id: result[0].user_id }];

        var messageModel = mongoose.model(threadId, Message);
        var message = messageModel({
            message_id: uniqid(),
            sender: senderData,
            message: messageContent,
            created_at: new Date(),
            updated_at: new Date()
        });
    
        message.save(function(error) {
            if(error) {
                res.status(400);
                res.json({ success: false, message: "An error occurred sending the message" });
                return;
            }

            let messageData = message.toObject();
            delete messageData._id;
            delete messageData.__v;
            delete messageData.updated_at;

            //all data returned to the frontend should be an array for consistancy
            messageData = [messageData];

            res.status(200);
            res.json(messageData);
            return;
        });
    });
}