//controllers
let UserController = require("../controllers/UserController");
let ConversationController = require("../controllers/ConversationController");

module.exports = function(app) {
    //authorization routes
    app.post("/createUser", UserController.createUser);
    app.post("/login", UserController.login);
    
    //conversation routes
    app.post("/createConversation", ConversationController.createConversation);
    app.get("/getAllConversations/:userId", ConversationController.getAllConversations);
    app.get("/getNewConversations/:conversationId", ConversationController.getNewConversations);
}