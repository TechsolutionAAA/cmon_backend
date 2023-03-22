const mongoose = require("mongoose");

const Settings = mongoose.model(
    "Settings",
    new mongoose.Schema({
        type: String,
        data: String
    })
);



module.exports = Settings;
