const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  /* Errors that are not generated by us but should be operational. */
  if (
    err.code === 11000 ||
    err.name === "CastError" ||
    err.name === "ValidationError" ||
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  )
    err.isOperational = true;

  /* 1. Production. */
  if (process.env.NODE_ENV == "production") {
    console.error("⚠️ ", err);

    if (err.code === 11000) {
      const value = Object.values(err.keyValue);
      err.message = `Duplicate field value (${value}).`;
    }

    if (err.name === "JsonWebTokenError") {
      err.message = "User authentication failed.";
    }

    if (err.name === "TokenExpiredError") {
      err.message = "User authentication token is expired.";
    }

    /* 1.1. Operational (generated by us). */
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    /* 1.2. Not operational (not generated by us). */
    if (!err.isOperational) {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong.",
      });
    }
  } else {
    /* 2. Development and others. */
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: { ...err, stack: err.stack },
    });
  }
};

module.exports = globalErrorHandler;
