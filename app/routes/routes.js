//controllers
let UserController = require("../controllers/UserController");
let ConversationController = require("../controllers/ConversationController");
let MessageController = require("../controllers/MessageController");

module.exports = function(app) {
    //authorization routes
    app.post("/createUser", UserController.createUser);
    app.post("/login", UserController.login);
    
    //conversation routes
    app.post("/createConversation", ConversationController.createConversation);
    app.get("/getAllConversations/:userId", ConversationController.getAllConversations);
    app.get("/getNewConversations/:userId/:conversationId", ConversationController.getNewConversations);

    //message routes
    app.post("/sendMessage", MessageController.sendMessage);
    app.get("/getAllMessages/:threadId", MessageController.getAllMessages);
}