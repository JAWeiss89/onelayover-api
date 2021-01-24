const express = require("express");
const ExpressError = require("../helpers/expressError");
const Activity  = require("../models/activity");
const jsonschema = require("jsonschema");
const editActivitySchema = require("../schemas/editActivity.json");
const newActivitySchema = require("../schemas/newActivity.json");

const router = new express.Router();

router.get("/:layoverCode/activites", async function(req, res, next) {
    // TO-DO: require auth middleware
    try {
        const { layoverCode } = req.params; 
        const activites = await Activity.getLayoverActivities(layoverCode);
        return res.json({activites});

    } catch(err) {
        next(err);
    }
});

router.get("/:layoverCode/activities/:id", async function(req, res, next) {
    // TO-DO: require auth middleware
    try {
        const { id } = req.params; 
        const activity = await Activity.getActivity(id);

        return res.json({activity});

    } catch(err) {
        next(err);
    }
});

router.post("/:layoverCode/activities", async function(req, res, next) {
    // TO-DO: require auth middleware
    // route expects activity in body as json with values for the following fields:
    // author_id(int), layover_code, type_id(int), address, title, description, body
    try {
        const activityData = req.body.activity;
        const validationResults = jsonschema.validate(activityData, newActivitySchema);
        if (!validationResults.valid) {
            const errors = validationResults.erros.map(error => error.stack);
            throw new ExpressError(errors, 400) // add invalid request error code
        }
        const activity = Activity.createActivity(activityData);
        return res.status(201).json({activity});
    } catch(err) {
        next(err);
    }
});

router.patch("/:layoverCode/activities/:id", async function(req, res, next) {
    // route expects user in body as json with values for any of the following fields:
    // author_id(int), layover_code, type_id(int), address, title, description, body
    try {
        const { id } = req.params;
        const activityData = req.body.activity;
        const validationResults = jsonschema.validate(activityData, editActivitySchema);
        if (!validationResults.valid) {
            const errors = validationResults.erros.map(error => error.stack);
            throw new ExpressError(errors, 400) // add invalid request error code
        }
        const activity = await Activity.updateActivity(id, activityData)
        return res.json({activity})
    } catch(err) {
        next(err);
    }
});

router.delete("/:layoverCode/activities/:id", async function(req, res, next) {
    try {
        const { id } = req.params;
        const activity = await Activity.deleteActivity(id);
        return res.json({message: `Successfuly deleted activity "${activity}"`});
    } catch(err) {
        next(err);
    }
});

module.exports = router;