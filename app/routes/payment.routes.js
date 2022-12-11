// #region import
// library/framework
const router = require("express").Router();
// file
const { authJwt } = require("../middlewares");
const payment = require("../controllers/payment.controller");
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

  // #region payment
  router.post(
    "/:userId/:paymentType",
    [authJwt.verifyToken, payment.validate("doPayment")],
    payment.doPayment
  );
  // #endregion payment

  // #region set router prefix
  app.use("/payment", router);
  // #endregion set router prefix
};
