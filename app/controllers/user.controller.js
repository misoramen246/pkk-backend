// #region import
// library/framework
const { body, param, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.user;
const UserProfile = db.userProfile;
// file
const { wrapAsync, ExpressError } = require("../helper/errorHandler.helper");
const { genNewRunningNumber } = require("../helper/general.helper");
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
  const users = await User.find({ deleted: false })
    .populate("user_profile")
    .then((users) => {
      return users.map((user) => {
        return {
          id: user?._id ?? "-",
          username: user?.username ?? "-",
          email: user?.email ?? "-",
          name: user?.user_profile?.name ?? "-",
          phoneNumber: user?.user_profile?.phone_number ?? "-",
          address: user?.user_profile?.address ?? "-",
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

/**
 * Created on Sun Dec 11 2022
 *
 * Function for edit user profile by user id and field to update
 *
 * Check if user exist
 * Validate fieldToUpdate input
 * Update user/user profile data
 *
 * @param req, res
 * @return 200: Updated successfully, 200: No changes
 * @throws 404: User not found!, 400: Invalid field to update
 * @todo ..
 * @author Miso Ramen
 */
exports.editUserDetailsByUserIdAndFieldToUpdate = wrapAsync(
  async (req, res) => {
    // #region variables
    const { userId: reqUserId, fieldToUpdate } = req.params;
    const { userId } = req;
    const now = Math.floor(new Date().getTime() / 1000);
    const validFieldToUpdate = [
      "name",
      "phone-number",
      "email",
      "address",
      "password",
    ];
    const { name, phoneNumber, email, address, password } = req.body;
    let isModified = true;
    // #endregion variables

    // #region validate body
    const valErrors = validationResult(req);
    if (!valErrors.isEmpty()) {
      return res.status(400).send({
        errors: valErrors.array(),
      });
    }
    // #endregion validate body

    // #region check if user exist
    const user = await User.findOne({
      _id: reqUserId,
      deleted: false,
    }).populate("user_profile");
    if (!user) {
      throw new ExpressError(404, "User not found!");
    }
    // #endregion check if user exist

    // #region validate fieldToUpdate input
    if (!validFieldToUpdate.includes(fieldToUpdate)) {
      throw new ExpressError(400, "Invalid field to update");
    }
    // #endregion validate fieldToUpdate input

    // #region update user/user profile data
    // if no user profile & to update (name, phone number, address), create new user profile data
    if (!user?.user_profile && !["email", "password"].includes(fieldToUpdate)) {
      const userProfile = new UserProfile({
        ...(fieldToUpdate === "name" && { name }),
        ...(fieldToUpdate === "phone-number" && { phone_number: phoneNumber }),
        ...(fieldToUpdate === "address" && { address }),
        subscription_code: await genNewRunningNumber(
          UserProfile,
          "subscription_code"
        ),
        created_by: userId,
        created_on: now,
      });
      await userProfile.save();
      user.user_profile = userProfile;
      await user.save();
    }
    // if any user profile & to update (name, phone number, address), update user profile data
    else if (user?.user_profile && fieldToUpdate === "name") {
      user.user_profile.name = name;
      isModified = user.user_profile.isModified("name");
      if (isModified) await user.user_profile.save();
    } else if (user?.user_profile && fieldToUpdate === "phone-number") {
      user.user_profile.phone_number = phoneNumber;
      isModified = user.user_profile.isModified("phone_number");
      if (isModified) await user.user_profile.save();
    } else if (user?.user_profile && fieldToUpdate === "address") {
      user.user_profile.address = address;
      isModified = user.user_profile.isModified("address");
      if (isModified) await user.user_profile.save();
    }
    // if to update (email, password), update user data
    else if (fieldToUpdate === "email") {
      user.email = email;
      isModified = user.isModified("email");
      if (isModified) await user.save();
    } else if (fieldToUpdate === "password") {
      user.password = bcrypt.hashSync(password, 8);
      await user.save();
    }
    // #endregion update user/user profile data

    if (isModified) {
      res.send({ message: "Updated successfully" });
    } else {
      res.send({ message: "No changes" });
    }
  }
);

/**
 * Created on Sun Dec 11 2022
 *
 * Function for validate body
 *
 * use express validator
 *
 * @param method
 * @return validation results
 * @throws ..
 * @todo ..
 * @author Miso Ramen
 */
exports.validate = (method) => {
  switch (method) {
    case "editUserDetails": {
      return [
        param("fieldToUpdate")
          .isIn(["name", "phone-number", "email", "address", "password"])
          .withMessage("Invalid value"),
        body("name")
          .if(param("fieldToUpdate").equals("name"))
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("name").exists())
          .isLength({ max: 255 })
          .withMessage("Max 255 characters"),
        body("phoneNumber")
          .if(param("fieldToUpdate").equals("phone-number"))
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("phoneNumber").exists())
          .isLength({ max: 255 })
          .withMessage("Max 255 characters"),
        body("email")
          .if(param("fieldToUpdate").equals("email"))
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("email").exists())
          .isEmail()
          .withMessage("Invalid email format")
          .isLength({ max: 255 })
          .withMessage("Max 255 characters"),
        body("address")
          .if(param("fieldToUpdate").equals("address"))
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("address").exists())
          .isLength({ max: 255 })
          .withMessage("Max 255 characters"),
        body("password")
          .if(param("fieldToUpdate").equals("password"))
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("password").exists())
          .isLength({ max: 255 })
          .withMessage("Max 255 characters"),
      ];
    }
  }
};
