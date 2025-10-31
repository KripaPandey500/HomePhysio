const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String, // optional image URL
  category: String,
  duration: String,
  difficulty: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Exercise", exerciseSchema);
