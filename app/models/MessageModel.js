var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    message_id: { type: String, required: true, unique: true },
    sender: { type: Array, required: true },
    message: { type: String, required: true },
    created_at: Date,
    updated_at: Date
});

module.exports = MessageSchema;