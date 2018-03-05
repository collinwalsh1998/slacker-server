//controllers
let UserController = require("../controllers/UserController");

module.exports = function(app) {
    app.post("/createUser", UserController.createUser);
}