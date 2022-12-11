// #region import
// library/framework
const mongoose = require("mongoose");
const db = require("../models");
const TopUpHistory = db.topUpHistory;
// file
const { wrapAsync, ExpressError } = require("../helper/errorHandler.helper");
// #endregion import

/**
 * Created on Sun Dec 11 2022
 *
 * Function for generating new running number
 *
 * Find max
 * 1 if not found
 * + 1 if found
 *
 * @param table, key
 * @return newRunningNumber
 * @throws ..
 * @todo ..
 * @author Miso Ramen
 */
exports.genNewRunningNumber = async (table, key) => {
  const maxRunningNumber = await table.findOne().sort({ [key]: -1 });

  return !maxRunningNumber ? 1 : maxRunningNumber[key] + 1;
};

/**
 * Created on Sun Dec 11 2022
 *
 * Function for getting user balance
 *
 * Get top up history
 * Get trash payment history
 * Get security payment history
 * Canculate balance (topup - tash - security)
 *
 * @param userId
 * @return balance
 * @throws ..
 * @todo ..
 * @author Miso Ramen
 */
exports.getUserBalanceByUserId = async (userId) => {
  // #region variables
  let balance = 0;
  let topUp = 0;
  // #endregion variables

  // #region get succeed top up nominal
  const topUpHistories = await TopUpHistory.aggregate([
    {
      $match: {
        $and: [
          { user_id: new mongoose.Types.ObjectId(userId) },
          { status: true },
          { deleted: false },
        ],
      },
    },
    {
      $group: {
        _id: "$user_id",
        total: {
          $sum: "$top_up_nominal",
        },
      },
    },
  ]);
  if (topUpHistories.length) topUp = topUpHistories[0].total;
  // #endregion get succeed top up nominal

  // #region calculate balance
  balance = topUp;
  // #endregion calculate balance

  return balance;
};
