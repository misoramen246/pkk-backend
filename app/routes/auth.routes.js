// #region import
// library/framework
const router = require("express").Router();
// file
const { verifySignUp } = require("../middlewares");
const auth = require("../controllers/auth.controller");
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

  // #region authentication
  router.post(
    "/signup",
    [verifySignUp.checkDuplicateUsernameOrEmail],
    auth.signup
  );
  router.post("/signin", auth.signin);
  // #endregion authentication

  // #region set router prefix
  app.use("/auth", router);
  // #endregion set router prefix
};
