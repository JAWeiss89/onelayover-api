const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const jsonschema = require("jsonschema");
const editUserSchema = require("../schemas/editUser.json");
const newUserSchema = require("../schemas/newUser.json");
const { ensureLoggedIn, ensureAdmin, ensureSameUser } = require("../middleware/auth");

const router = new express.Router();


// ==========================================================
// TO-DO: Route to create a new user with admin capabilities
// ==========================================================

router.get("/", ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    // route expects _token in body of request
    try {
        const users = await User.getAll();
        
        return res.json({users});
    } catch(err) {
        next(err);
    }
});

router.get("/:username", ensureLoggedIn, async function(req, res, next) {
    // route expects _token in body of request
    try {
        const { username } = req.params;
        const user = await User.getOne(username);
        
        return res.json({user})
    } catch(err) {
        next(err);
    }
});

router.post("/", async function(req, res, next) {
    // route does not require token because user is signing up for the first time
    // route expects user in body of request as json with values for the following fields:
    // username, password, first_name, last_name, email, airline
    try {
        const userData = req.body.user;
        const validationResults = jsonschema.validate(userData, newUserSchema);
        if (!validationResults.valid) { // if json can't be validated
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 400); // double check errors print as intended
        }
        const token = await User.createUser(userData); 

        return res.status(201).json({token})
    } catch(err) {
        next(err);
    }
});

router.patch("/:username", ensureLoggedIn, ensureSameUser, async function(req, res, next) {
    // route expects user and _token in body of request as json
    // user in body can have any of the following fields:
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
        delete user.password;
        return res.json({user});
    } catch(err) {
        next(err);
    }
});

router.delete("/:username", ensureLoggedIn, ensureSameUser, async function(req, res, next) {
    // route expects _token in body of request as json
    try {
        const { username } = req.params;
        const response = await User.deleteUser(username);

        return res.json({message: `Successfully deleted user ${response.username}`});
    } catch(err) {
        next(err);
    }
});

//  comment like/unlike
router.post("/:username/comments/:commentID", ensureLoggedIn, ensureSameUser, async function(req, res, next) {
    // route expects _token in body of request as json
    try {
        const {username, commentID} = req.params;
        const message = await User.likeCommentToggle(commentID, username);
        return res.json({message});
    } catch(err) {
        next(err);
    }
});

// photo like/unlike
router.post("/:username/photos/:photoID", ensureLoggedIn, ensureSameUser, async function(req, res, next) {
    // route expects _token in body of request as json
    try {
        const {username, photoID} = req.params;
        const message = await User.likePhotoToggle(photoID, username);
        return res.json({message});
    } catch(err) {
        next(err);
    }
});

//activity like/unlike
router.post("/:username/activities/:activityID", ensureLoggedIn, ensureSameUser, async function(req, res, next) {
    // route expects _token in body of request as json
    try {
        const {username, activityID} = req.params;
        const message = await User.likeActivityToggle(activityID, username);
        return res.json({message});
    } catch(err) {
        next(err);
    }
});

module.exports = router;