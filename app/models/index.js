const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.track = require("./track.model");
db.settings = require("./settings.model");

db.ROLES = ["superadmin", "user", "admin", "guest"];

module.exports = db;
