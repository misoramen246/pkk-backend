const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const { wrapAsync, ExpressError } = require("../helper/errorHandler.helper.js");

/**
 * Created on Thu Dec 08 2022
 *
 * Function for verify token
 *
 * Verify token
 *
 * @param req, res, next
 * @return ..
 * @throws 403: No token provided!, 401: Unauthorized!
 * @todo ..
 * @author Miso Ramen
 */
verifyToken = wrapAsync(async (req, res, next) => {
  // #region variables
  let token = req.headers["x-access-token"];
  // #endregion variables

  // #region if no token
  if (!token) {
    throw new ExpressError(403, "No token provided!");
  }
  // #endregion if no token

  // #region verify token
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
  // #endregion verify token
});

const authJwt = {
  verifyToken,
};

module.exports = authJwt;
