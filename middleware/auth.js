const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

function authenticateJWT(req, res, next) {
    // this will run on every route
    try {
        if (req.body._token) {  // if user is sending token in request,
            const token = req.body._token;
            const payload = jwt.verify(token, SECRET_KEY); // Step where we verify the token
            req.user = payload; // since JWT has been verified, add JWT payload to user key in request
        }
        return next();
    } catch(err) {
        next(err);
    }
};

function ensureLoggedIn(req, res, next) {
    if (req.user) { // user key can only be added to req if token sent has been verified by authenticateJWT();
        return next();
    } else { // if token was not verified by authenticateJWT() ...
        const unauthError = new ExpressError("Please log in or sign up to proceed", 401);
        return  next(unauthError);
    }
};

function ensureAdmin(req, res, next) {
    if (req.user.is_admin) {
        return next();
    } else {
        const adminError = new ExpressError("Only admins can access this page", 401);
        return next(adminError);
    }
};

function ensureSameUser(req, res, next) {
    if (req.user.username === req.params.username) {
        return next();
    } else {
        const incorrectUserErr = new ExpressError("You are not authorized to modify this user", 401);
        return next(incorrectUserErr);
    }
};

module.exports = { authenticateJWT, ensureLoggedIn, ensureAdmin, ensureSameUser}