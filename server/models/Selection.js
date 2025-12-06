const mongoose = require("mongoose");

const selectionSchema = new mongoose.Schema(
  {
    teacher: { type: String, required: true }, // mobile number
    board: { type: String, required: true },
    className: { type: String, required: true },
    subject: { type: String, required: true },
    bookTypes: { type: [String], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Selection", selectionSchema);
