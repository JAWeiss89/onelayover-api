const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");

const router = new express.Router();

router.post("/login", async function (req, res, next) {
    try {
        const {username, password} = req.body;
        const {token, userID} = await User.authenticate(username, password);
        return res.json({token, userID});
    } catch(err) {
        next(err);
    }
});

module.exports = router;