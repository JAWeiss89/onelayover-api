const express = require("express");
const ExpressError = require("../helpers/expressError");
// const User = require("../models/user");
// const userSchema = require("../schemas/user.json");
// const newUserSchema = require("../schemas/newUser.json");
// const {ensureLoggedIn, ensureSameUser} = require("../middleware/auth");

const router = new express.Router();

router.get("/", async function(req, res, next) {
    try {
        // const users = await User.getAll();
        const users = [{username: "fakeUser1", firstName: "spongbob"}]
        return res.json({users});
    } catch(err) {
        next(err);
    }
});

module.exports = router;