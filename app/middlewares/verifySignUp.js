// #region import
// file
const { ExpressError, wrapAsync } = require("../helper/errorHandler.helper");
const db = require("../models");
const User = db.user;
// #endregion import

/**
 * Created on Thu Dec 08 2022
 *
 * Function for checking if username or email already exist in db
 *
 * Check username
 * Check email
 *
 * @param req, res, next
 * @return next
 * @throws 400: Failed! Username is already in use!, 400: Failed! Email is already in use!, 500: Server error
 * @todo ..
 * @author Miso Ramen
 */
checkDuplicateUsernameOrEmail = wrapAsync(async (req, res, next) => {
  // #region check Username
  const isUsernameExist = await User.findOne({
    username: req.body.username,
  });

  if (isUsernameExist) {
    throw new ExpressError(400, "Failed! Username is already in use!");
  }
  // #endregion check Username

  // #region check Email
  const isEmailExist = await User.findOne({
    email: req.body.email,
  });

  if (isEmailExist) {
    throw new ExpressError(400, "Failed! Email is already in use!");
  }
  // #endregion check Email

  next();
});

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
};

module.exports = verifySignUp;
