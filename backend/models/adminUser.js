const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, default: "user" } // should be 'admin' for admin users
});

module.exports = mongoose.model("User", userSchema);
