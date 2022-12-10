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
        id: user?._id ?? "-",
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

/**
 * Created on Sat Dec 10 2022
 *
 * Function for getting user details by user id
 *
 * Check if user exist
 * Map result
 *
 * @param req, res
 * @return 200: result
 * @throws 404: User not found!
 * @todo ..
 * @author Miso Ramen
 */
exports.getUserDetailsByUserId = wrapAsync(async (req, res) => {
  // #region variables
  const { userId: reqUserId } = req.params;
  const result = {
    name: null,
    phoneNumber: null,
    email: null,
    address: null,
  };
  // #endregion variables

  // #region check if user exist
  const user = await User.findOne({
    _id: reqUserId,
    deleted: false,
  }).populate("user_profile");
  if (!user) {
    throw new ExpressError(404, "User not found!");
  }
  // #endregion check if user exist

  // #region map result
  if (user?.user_profile) {
    result.name = user?.user_profile?.name ?? null;
    result.phoneNumber = user?.user_profile?.phone_number ?? null;
    result.address = user?.user_profile?.address ?? null;
  }
  result.email = user?.email ?? null;
  // #endregion map result

  res.send(result);
});
