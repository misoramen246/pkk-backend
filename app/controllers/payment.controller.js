// #region import
// library/framework
const { body, param, validationResult } = require("express-validator");
const db = require("../models");
const User = db.user;
const TrashPaymentHistory = db.trashPaymentHistory;
const SecurityPaymentHistory = db.securityPaymentHistory;
// file
const { wrapAsync, ExpressError } = require("../helper/errorHandler.helper");
const {
  genNewRunningNumber,
  getUserBalanceByUserId,
} = require("../helper/general.helper");
// #endregion import

/**
 * Created on Sun Dec 11 2022
 *
 * Function for doing payment
 *
 * Validate
 * Check if balance insufficient
 * Create trash/security payment history
 *
 * @param req, res
 * @return 200: Payment success
 * @throws 400: Your balance is not enough, please top up
 * @todo ..
 * @author Miso Ramen
 */
exports.doPayment = wrapAsync(async (req, res) => {
  // #region variables
  const { period, nominal } = req.body;
  const { userId: reqUserId, paymentType } = req.params;
  const { userId } = req;
  const now = Math.floor(new Date().getTime() / 1000);
  let impactedTable = null;
  // #endregion variables

  // #region validate body
  const valErrors = validationResult(req);
  if (!valErrors.isEmpty()) {
    return res.status(400).send({
      errors: valErrors.array(),
    });
  }
  // #endregion validate body

  // check if balance insufficient
  const userBalance = await getUserBalanceByUserId(reqUserId);
  if (userBalance < nominal) {
    throw new ExpressError(400, "Your balance is not enough, please top up");
  }

  // #region create conditional for table
  impactedTable =
    paymentType === "trash-payment"
      ? TrashPaymentHistory
      : SecurityPaymentHistory;
  // #endregion create conditional for table

  // #region create top up history
  const trashPaymentHistory = new impactedTable({
    transaction_code: await genNewRunningNumber(
      impactedTable,
      "transaction_code"
    ),
    user_id: userId,
    period,
    nominal,
    status: true,
    created_by: userId,
    created_on: now,
  });
  await trashPaymentHistory.save();
  // #endregion create top up history

  res.send({ message: "Payment success" });
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
    case "doPayment": {
      return [
        param("paymentType")
          .isIn(["trash-payment", "security-payment"])
          .withMessage("Invalid value"),
        body("period")
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("period").exists())
          .isInt({ min: 0 })
          .withMessage("Invalid value"),
        body("nominal")
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("nominal").exists())
          .isInt({ min: 0 })
          .withMessage("Invalid value"),
      ];
    }
  }
};
