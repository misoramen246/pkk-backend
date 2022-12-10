// #region import
// library/framework
const router = require("express").Router();
// file
const { authJwt } = require("../middlewares");
const user = require("../controllers/user.controller");
// #endregion import

module.exports = function (app) {
  // #region set header
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  // #endregion set header

  // #region user
  router.get("/all", [authJwt.verifyToken], user.getAllUsers);
  router.get(
    "/:userId/profile",
    [authJwt.verifyToken],
    user.getUserDetailsByUserId
  );
  // #endregion user

  // #region set router prefix
  app.use("/user", router);
  // #endregion set router prefix
};
