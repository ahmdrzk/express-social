const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const morgan = require("morgan");

const { updateOpSetOptions, schemaSetOptions } = require("./helpers/mongoosePlugins");
const OpError = require("./helpers/opError");
const globalErrorHandler = require("./helpers/globalErrorHandler");

mongoose.plugin(updateOpSetOptions);
mongoose.plugin(schemaSetOptions);

const userRouter = require("./routers/usersRouter");

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,
  message: "Too many requests made from this IP, please try again after an hour.",
});

app.use(cors({ origin: process.env.CLIENT_HOST }));
app.options("*", cors());
app.use(helmet());
if (process.env.NODE_ENV == "development") app.use(morgan("dev"));
app.use("/api", limiter);
app.use(express.json({ limit: "2MB" }));
app.use(hpp());
app.use(mongoSanitize());
app.use(compression());

// NOTE: Use when in need to.
// app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new OpError(404, `Can't '${req.method}' on '${req.originalUrl}'.`));
});

app.use(globalErrorHandler);

module.exports = app;
