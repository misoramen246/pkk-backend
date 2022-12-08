/**
 * Created on Thu Dec 08 2022
 *
 * Function for wrapping async function
 *
 * ..
 *
 * @param fn
 * @return ..
 * @throws ..
 * @todo ..
 * @author Miso Ramen
 */
const wrapAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      if (err) {
        console.log(err);
        if (err.status > 400 || !err.status) {
          console.log("\x1b[31m", "Catch Error: ");
          console.log("\x1b[37m", err.stack);
        }
        next(err);
      }
    });
  };
};

/**
 * Created on Thu Dec 08 2022
 *
 * Class for express error
 *
 * ExpressError with status included, original Error class doens't include status
 *
 * @param ..
 * @return ..
 * @throws ..
 * @todo ..
 * @author Miso Ramen
 */
class ExpressError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }
}

module.exports = {
  wrapAsync,
  ExpressError,
};
