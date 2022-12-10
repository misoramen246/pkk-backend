// #region import
// library/framework
const mongoose = require("mongoose");
// #endregion import

// #region mongo config
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);
// #endregion mongo config

// #region model
const db = {};
db.mongoose = mongoose;

db.user = require("./user.model");
db.userProfile = require("./user_profile.model");
// #endregion model

module.exports = db;
