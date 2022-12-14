// #region import
// library/framework
const { body, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
// file
const { ExpressError, wrapAsync } = require("../helper/errorHandler.helper");
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
// #endregion import

/**
 * Created on Thu Dec 08 2022
 *
 * Function for sign up
 *
 * Validate body
 * Create user object, has password
 * Save it to DB
 *
 * @param req, res
 * @return 200: User was registered successfully!
 * @throws 500: Server error
 * @todo ..
 * @author Miso Ramen
 */
exports.signup = wrapAsync(async (req, res) => {
  // #region variables
  const { username, email, password } = req.body;
  // #endregion variables

  // #region validate body
  const valErrors = validationResult(req);
  if (!valErrors.isEmpty()) {
    return res.status(400).send({
      errors: valErrors.array(),
    });
  }
  // #endregion validate body

  // #region create the user object
  const user = new User({
    username: username,
    email: email,
    password: bcrypt.hashSync(password, 8), // password hashing
  });
  // #endregion create the user object

  // #region save to db
  try {
    await user.save();
  } catch (err) {
    throw new ExpressError(500, err.message);
  }
  // #endregion save to db

  res.send({ message: "User was registered successfully!" });
});

/**
 * Created on Thu Dec 08 2022
 *
 * Function for sign in
 *
 * Find user
 * Throw error if user not found
 * Check user password
 * Create token
 *
 * @param req, res
 * @return 200: User details and token
 * @throws 404: User not found!, 401: Invalid password!, 500: Server error
 * @todo ..
 * @author Miso Ramen
 */
exports.signin = wrapAsync(async (req, res) => {
  // #region find user
  const user = await User.findOne({
    username: req.body.username,
  });
  // #endregion find user

  // #region validate body
  const valErrors = validationResult(req);
  if (!valErrors.isEmpty()) {
    return res.status(400).send({
      errors: valErrors.array(),
    });
  }
  // #endregion validate body

  // #region throw error if user not found
  if (!user) {
    throw new ExpressError(404, "User not found!");
  }
  // #endregion throw error if user not found

  // #region check user password
  var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

  // throw error if password invalid
  if (!passwordIsValid) {
    return res.status(401).send({
      accessToken: null,
      message: "Invalid password!",
    });
  }
  // #endregion check user password

  // #region create token
  var token = jwt.sign(
    { id: user.id },
    config.secret
    // { expiresIn: 86400 } // 24 hours
  );
  // #endregion create token

  res.status(200).send({
    id: user._id,
    username: user.username,
    email: user.email,
    accessToken: token,
  });
});

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
    case "signup": {
      return [
        body("username")
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("username").exists())
          .isLength({ max: 255 })
          .withMessage("Max 255 characters"),
        body("email")
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("email").exists())
          .isEmail()
          .withMessage("Invalid email format")
          .isLength({ max: 255 })
          .withMessage("Max 255 characters"),
        body("password")
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("password").exists())
          .isLength({ max: 255 })
          .withMessage("Max 255 characters"),
      ];
    }
    case "signin": {
      return [
        body("username")
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("username").exists())
          .isLength({ max: 255 })
          .withMessage("Max 255 characters"),
        body("password")
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("password").exists())
          .isLength({ max: 255 })
          .withMessage("Max 255 characters"),
      ];
    }
  }
};
