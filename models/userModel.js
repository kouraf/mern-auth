const mongoose = require("mongoose");

// mnogodb collections schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 5 },
  name: { type: String },
});

const User = mongoose.model("user", userSchema);

module.exports = User;