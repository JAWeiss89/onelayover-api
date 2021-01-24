const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const jsonschema = require("jsonschema");
const editUserSchema = require("../schemas/editUser.json");
const newUserSchema = require("../schemas/newUser.json");
// const {ensureLoggedIn, ensureSameUser} = require("../middleware/auth");

const router = new express.Router();

router.get("/", async function(req, res, next) {
    // TO-DO: require auth middleware && require admin middleware

    try {
        const users = await User.getAll();
        
        return res.json({users});
    } catch(err) {
        next(err);
    }
});

router.get("/:username", async function(req, res, next) {
    try {
        const { username } = req.params;
        const user = await User.getOne(username);
        
        return res.json({user})
    } catch(err) {
        next(err);
    }
});

router.post("/", async function(req, res, next) {
    // route expects user in body as json with values for the following fields:
    // username, password, first_name, last_name, email, created_at, airline
    try {
        const userData = req.body.user;
        const validationResults = jsonschema.validate(userData, newUserSchema);
        if (!validationResults.valid) { // if json can't be validated
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 400); // double check errors print as intended
        }
        const user = await User.createUser(userData);

        return res.status(201).json({user})
    } catch(err) {
        next(err);
    }
});

router.patch("/:username", async function(req, res, next) {
    // route expects user in body as json with values for any of the following fields:
    // username, password, first_name, last_name, email, airline
    try {
        const { username } = req.params;
        const userData = req.body.user;
        const validationResults = jsonschema.validate(userData, editUserSchema);
        if (!validationResults.valid) { // if json can't be validated
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 400); // double check errors print as intended
        }
        const user = await User.updateUser(username, userData);

        return res.json({user});
    } catch(err) {
        next(err);
    }
});

router.delete("/:username", async function(req, res, next) {
    try {
        const { username } = req.params;
        const deletedUsername = await User.deleteUser(username);

        return res.json({message: `Successfully deleted user "${deletedUsername}"`});
    } catch(err) {
        next(err);
    }
});

module.exports = router;