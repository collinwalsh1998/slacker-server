var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ConversationSchema = new Schema({
	conversation_id: { type: String, required: true, unique: true },
	users: { type: Array, required: true },
	created_at: Date,
	updated_at: Date
});

var Conversation = mongoose.model("Conversation", ConversationSchema);
module.exports = Conversation;