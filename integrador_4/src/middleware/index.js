const EErrors = require("../services/enum.js");


const errorHandler = (error, req, res, next) => {
  console.log(error.cause);
  switch (error.code) {
    case EErrors.INVALID_TYPES_ERROR:
      res.status(400).send({ status: "error", error: error.cause });
      break;
    default:
      res.status(500).send({ status: "error", error: "error no manejado" });
      break;
  }
};

module.exports = errorHandler;




