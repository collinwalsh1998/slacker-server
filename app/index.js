//packages
let express = require("express");
let bodyParser = require("body-parser");
let cors = require("cors");

//controllers
let DatabaseController = require("./controllers/DatabaseController");

let app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//set routes
require("./routes/routes")(app);

app.listen(8081, function() {
    DatabaseController.connect("mongodb://localhost:27017/slacker")
        .catch(error => {
            console.log("Error connecting to database: " + error);
			process.exit(1);
		});
});