// #region import
// library/framework
const { body, param, validationResult } = require("express-validator");
const db = require("../models");
const User = db.user;
const TopUpHistory = db.topUpHistory;
// file
const { wrapAsync, ExpressError } = require("../helper/errorHandler.helper");
const {
  genNewRunningNumber,
  convertTimestamp,
  convertRunningNumber,
} = require("../helper/general.helper");
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
 * Function for getting top up history by user id
 *
 * Get top up histories
 * Map data
 * Create pagination
 *
 * @param req, res
 * @return 200: top up histories
 * @throws 404: Not found,
 * @todo ..
 * @author Miso Ramen
 */
exports.getTopUpHistoryByUserId = wrapAsync(async (req, res) => {
  // #region variables
  const { userId, page, limit } = req.params;
  // #endregion variables

  // #region pagination
  const start = (page - 1) * limit;
  // #endregion pagination

  // #region check if user exist
  const user = await User.findOne({
    _id: userId,
    deleted: false,
  });
  if (!user) throw new ExpressError(404, "User not found");
  // #endregion check if user exist

  // #region get top up histories
  const topUpHistories = await TopUpHistory.find({
    user_id: userId,
    deleted: false,
  })
    .sort({ created_on: -1 })
    .skip(start)
    .limit(limit)
    .then(async (results) => {
      return await Promise.all(
        results.map(async (result) => {
          const user = await User.findOne({
            _id: result.user_id,
            deleted: false,
          }).populate("user_profile");

          return {
            name: user?.user_profile?.name ?? "-",
            phoneNumber: user?.user_profile?.phone_number ?? "-",
            status: result?.status ? "Berhasil" : "Gagal",
            transactionTime: convertTimestamp(result.created_on),
            transactionCode: convertRunningNumber(result.transaction_code),
            nominal: result.top_up_nominal,
            paymentMethod: result.payment_method,
          };
        })
      );
    });
  if (!topUpHistories.length) {
    throw new ExpressError(404, "Not found");
  }
  // #endregion get top up histories

  // #region get total record
  const totalRecord = await TopUpHistory.count({
    user_id: userId,
    deleted: false,
  });
  // #endregion get total record

  res.send({
    paginationInfo: {
      totalRecord,
      currentPage: page,
      currentLimit: limit,
      thisPageTotalRecord: topUpHistories.length,
      thisPageStartNo: (page - 1) * limit + 1,
      thisPageEndNo: (page - 1) * limit + topUpHistories.length,
    },
    topUpHistories,
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
