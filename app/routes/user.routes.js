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
  router
    .route("/:userId/profile")
    .get([authJwt.verifyToken], user.getUserDetailsByUserId);
  router
    .route("/:userId/profile/:fieldToUpdate")
    .put(
      [authJwt.verifyToken, user.validate("editUserDetails")],
      user.editUserDetailsByUserIdAndFieldToUpdate
    );
  // #endregion user

  // #region set router prefix
  app.use("/user", router);
  // #endregion set router prefix
};
