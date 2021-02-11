const express = require("express");
const {authenticateJWT} = require("./middleware/auth");
const ExpressError = require("./helpers/expressError");

const cors = require("cors");
const morgan = require("morgan");
const app = express();

// The following can be used to allow certain sites access by CORS
// var whitelist = ['http://example1.com', 'http://example2.com']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

app.use(cors()); // Controls Same origin policy
app.use(express.json()); // Tells express we will be using JSON send/receive messages
app.use(authenticateJWT); // All routes will check for the presence of a _token key in request

const userRoutes = require("./routes/users");
const layoverRoutes = require("./routes/layovers");
const activityRoutes = require("./routes/activities");
const authRoutes = require("./routes/auth");
const commentRoutes = require("./routes/comments");
const activityPhotos = require("./routes/photos");

app.use("/users", userRoutes);
app.use("/layovers", layoverRoutes);
app.use("/layovers", activityRoutes);
app.use("/", commentRoutes);
app.use("/", activityPhotos);
app.use("/", authRoutes);  // double check this

// add logging system
app.use(morgan("tiny"));

// handle 404
app.use(function(req, res, next) {
    const err = new ExpressError("Page Not Found", 404);
    // pass the error to next piece of middleware
    return next(err);
});

// handle generic error

app.use(function(err, req, res, next) {
    // receives any errors thrown by previous routes and console logs in and returns it as json
    res.status(err.status || 500);
    console.log(err.stack);

    return res.json({
        status: err.status,
        message: err.message
    });
});

module.exports = app;