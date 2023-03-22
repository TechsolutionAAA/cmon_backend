const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    viewdetail: Number,
    links: [
      {
        user: String,
        date: String,
        url: String
      }
    ]
  })
);

module.exports = User;
