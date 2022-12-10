// #region import
// framework/library
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
// file
const dbConfig = require("./app/config/db.config");
// #endregion import

// #region initialize server
const app = express();
// #endregion initialize server

// #region cors config
var corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));
// #endregion cors config

// #region connect to mongodb
const db = require("./app/models");

db.mongoose
  .connect(
    `mongodb+srv://${dbConfig.MONGO_USERNAME}:${dbConfig.MONGO_PASSWORD}@cluster0.4k2nbrh.mongodb.net/${dbConfig.MONGO_DB_SCHEMA}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });
// #endregion connect to mongodb

// #region bodyparser config
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// #endregion bodyparser config

// #region routes
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to PKK application." });
});
// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
// #endregion routes

// #region error handler
app.use((error, req, res, next) => {
  // #region default message
  let { message = "Something went wrong", status = 500 } = error;
  // #endregion default message

  // #region other error message
  if (error.parent && error.parent.errno === 1265) {
    return res.status(400).send({
      success: false,
      message: "Invalid data, please recheck your data",
    });
  }
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: error.errors.map((err) => err.message),
    });
  }
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      success: false,
      message: error.errors.map((err) => err.message),
    });
  }
  if (error.name === "SequelizeDatabaseError") {
    return res.status(400).json({
      success: false,
      message: error.errors.map((err) => err.message),
    });
  }
  // #endregion other error message

  res.status(status).json({ error: message });
});
// #endregion error handler

// #region set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
// #endregion set port, listen for requests
