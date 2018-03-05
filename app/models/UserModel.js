var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	user_id: { type: String, required: true, unique: true },
	first_name: { type: String, required: true },
	last_name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	created_at: Date,
	updated_at: Date
});

var User = mongoose.model("User", UserSchema);
module.exports = User;