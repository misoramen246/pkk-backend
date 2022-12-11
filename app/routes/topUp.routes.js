// #region import
// library/framework
const router = require("express").Router();
// file
const { authJwt } = require("../middlewares");
const topUp = require("../controllers/topUp.controller");
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

  // #region top up
  router.post(
    "/",
    [authJwt.verifyToken, topUp.validate("doTopUp")],
    topUp.doTopUp
  );
  router.get(
    "/:userId/histories/page/:page/limit/:limit",
    [authJwt.verifyToken],
    topUp.getTopUpHistoryByUserId
  );
  // #endregion top up

  // #region set router prefix
  app.use("/top-up", router);
  // #endregion set router prefix
};
