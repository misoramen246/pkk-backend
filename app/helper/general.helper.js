// #region import
// library/framework
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
