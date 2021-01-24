const express = require("express");
// const {authenticateJWT} = require("./middleware/auth");
const ExpressError = require("./helpers/expressError");

const morgan = require("morgan");
const app = express();

app.use(express.json()); // Tells express we will be using JSON send/receive messages
// app.use(authenticateJWT);

const userRoutes = require("./routes/users");
const layoverRoutes = require("./routes/layovers");
const activityRoutes = require("./routes/activities");
const authRoutes = require("./routes/auth");

app.use("/users/", userRoutes);
app.use("/layovers/", layoverRoutes);
app.use("/layovers/", activityRoutes);
app.use("/", authRoutes);  // double check this

// add logging system
app.use(morgan("tiny"));

// handle 404
app.use(function(req, res, next) {
    const err = new ExpressError("Not Found", 404);
    // pass the error to next piece of middleware
    return next(err);
});

// handle generic error

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.stack);

    return res.json({
        status: err.status,
        message: err.message
    });
});

module.exports = app;