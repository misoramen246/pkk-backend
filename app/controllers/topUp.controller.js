// #region import
// library/framework
const { body, param, validationResult } = require("express-validator");
const db = require("../models");
const TopUpHistory = db.topUpHistory;
// file
const { wrapAsync, ExpressError } = require("../helper/errorHandler.helper");
const { genNewRunningNumber } = require("../helper/general.helper");
// #endregion import

/**
 * Created on Sun Dec 11 2022
 *
 * Function for doing top up
 *
 * Validate body
 * Generate random number 1 to 10 as top up nominal
 * Create top up history
 *
 * @param req, res
 * @return 200: Top up success
 * @throws ..
 * @todo ..
 * @author Miso Ramen
 */
exports.doTopUp = wrapAsync(async (req, res) => {
  // #region variables
  const { paymentMethod } = req.body;
  const { userId } = req;
  const now = Math.floor(new Date().getTime() / 1000);
  // #endregion variables

  // #region validate body
  const valErrors = validationResult(req);
  if (!valErrors.isEmpty()) {
    return res.status(400).send({
      errors: valErrors.array(),
    });
  }
  // #endregion validate body

  // #region random number 1 to 10
  const randomNumber = Math.floor(Math.random() * 10 + 1);
  // #endregion random number 1 to 10

  // #region create top up history
  const topUpHistory = new TopUpHistory({
    transaction_code: await genNewRunningNumber(
      TopUpHistory,
      "transaction_code"
    ),
    user_id: userId,
    payment_method: paymentMethod,
    top_up_nominal: randomNumber * 10000,
    status: true,
    created_by: userId,
    created_on: now,
  });
  await topUpHistory.save();
  // #endregion create top up history

  res.send({ message: "Top up success" });
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
    case "doTopUp": {
      return [
        body("paymentMethod")
          .notEmpty({ ignore_whitespace: true })
          .withMessage("Required")
          .if(body("paymentMethod").exists())
          .isIn([1, 2, 3, 4])
          .withMessage("Invalid value"),
      ];
    }
  }
};
