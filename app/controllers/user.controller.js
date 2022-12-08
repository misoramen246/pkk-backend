// #region import
// library/framework
const db = require("../models");
const User = db.user;
// file
const { wrapAsync, ExpressError } = require("../helper/errorHandler.helper");
// #endregion import

/**
 * Created on Thu Dec 08 2022
 *
 * Function for getting all users' profile
 *
 * Get all users
 * Map profile
 *
 * @param req, res
 * @return 200: users' profile
 * @throws 404: Not found!
 * @todo ..
 * @author Miso Ramen
 */
exports.getAllUsers = wrapAsync(async (req, res) => {
  // #region get all users
  const users = await User.find({ deleted: false }).then((users) => {
    return users.map((user) => {
      return {
        username: user?.username ?? "-",
        email: user?.email ?? "-",
      };
    });
  });
  // #endregion get all users

  // #region throw error if not found
  if (!users.length) {
    throw new ExpressError(404, "Not found!");
  }
  // #endregion throw error if not found

  res.send(users);
});
