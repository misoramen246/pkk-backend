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
db.topUpHistory = require("./top_up_history.model");
db.trashPaymentHistory = require("./trash_payment_history.model");
db.securityPaymentHistory = require("./security_payment_history.model");
// #endregion model

module.exports = db;
