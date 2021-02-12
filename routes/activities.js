const express = require("express");
const ExpressError = require("../helpers/expressError");
const Activity  = require("../models/activity");
const jsonschema = require("jsonschema");
const editActivitySchema = require("../schemas/editActivity.json");
const newActivitySchema = require("../schemas/newActivity.json");
const { ensureLoggedIn, ensureSameUser} = require("../middleware/auth");

const router = new express.Router();

router.get("/:layoverCode/activities/", ensureLoggedIn, async function(req, res, next) {
    try {
        const { layoverCode } = req.params; 
        const activities = await Activity.getLayoverActivities(layoverCode);
        return res.json({activities});

    } catch(err) {
        next(err);
    }
});

router.get("/:layoverCode/activities/:id", ensureLoggedIn, async function(req, res, next) {
    try {
        const { id } = req.params; 
        const activity = await Activity.getActivity(id);

        return res.json({activity});

    } catch(err) {
        next(err);
    }
});

router.post("/:layoverCode/activities/", ensureLoggedIn, ensureSameUser, async function(req, res, next) {
    // Route expects three things to be passed in request json body:
    // 1) userID: "123"   (to compare incoming request to userID in token. This id will also be used as author id of comment)
    // 2) activity: { type_id(int): 1, address: "123 ABX Dr", title: "My title", description: "My description", body: "Body text of activity" }
    // 3) _token: "mytoken.aa.cc"     (for authentication)
    try {
        const activityData = req.body.activity;
        activityData.type_id = Number(activityData.type_id);
        activityData.author_id = Number(req.body.userID);
        activityData.layover_code = req.params.layoverCode;
        const validationResults = jsonschema.validate(activityData, newActivitySchema);
        if (!validationResults.valid) {
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 400) // add invalid request error code
        } 
        await Activity.createActivity(activityData);
        return res.status(201).json({message: `Successfuly created activity ${activityData.title}`});
    } catch(err) {
        next(err);
    }
});

router.patch("/:layoverCode/activities/:id", ensureLoggedIn, ensureSameUser, async function(req, res, next) {
    // Route expects three things to be passed in request json body:
    // 1) userID: "123"   (to compare incoming request to userID in token. This id will also be used as author id of comment)
    // 2) activity: with any of the following { type_id(int): 1, address: "123 ABX Dr", title: "My title", description: "My description", body: "Body text of activity" }
    // 3) _token: "mytoken.aa.cc"     (for authentication)

    try {
        const { id } = req.params;
        const userID = req.body.userID;
        const activityData = req.body.activity;
        const validationResults = jsonschema.validate(activityData, editActivitySchema);
        if (!validationResults.valid) {
            const errors = validationResults.erros.map(error => error.stack);
            throw new ExpressError(errors, 400) // add invalid request error code
        }
        const activity = await Activity.updateActivity(id, userID, activityData);
        return res.json({activity})
    } catch(err) {
        next(err);
    }
});

router.delete("/:layoverCode/activities/:id", ensureLoggedIn, ensureSameUser, async function(req, res, next) {
    // Route expects two things:
    // 1) userID: "user123" (so that only users that created the activity can delete it)
    // 2) _token: "mytoken.bbb.ccc"   (for authentication)
    try {
        const { id } = req.params;
        const { userID } = req.body;
        const {title} = await Activity.deleteActivity(id, userID);
        return res.json({message: `Successfuly deleted activity ${title}`});
    } catch(err) {
        next(err);
    }
});

module.exports = router;