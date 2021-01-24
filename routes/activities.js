const express = require("express");
const ExpressError = require("../helpers/expressError");
const Activity  = require("../models/activity");

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
    // TO-DO: add jsonschema for validation of request
    try {
        const activityData = req.body.activity;
        const validationResults = {valid: true} // replace with jsonschema verification
        if (!validationResults.valid) {
            const errors = validationResults.erros.map(error => error.stack);
            throw new ExpressError(errors) // add invalid request error code
        }
        const activity = Activity.createActivity(activityData);
        return res.json({activity});
    } catch(err) {
        next(err);
    }
});

router.patch("/:layoverCode/activities/:id", async function(req, res, next) {
    try {
        const { id } = req.params;
        const activityData = req.body.activity;
        const validationResults = {valid: true} // replace with jsonschema verification
        if (!validationResults.valid) {
            const errors = validationResults.erros.map(error => error.stack);
            throw new ExpressError(errors) // add invalid request error code
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