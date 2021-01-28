const express = require("express");
const ExpressError = require("../helpers/expressError");
const Comment = require("../models/comment");

const router = new express.Router();

router.get("/layovers/:layoverCode/activities/:activityID/comments", async function(req, res, next) {
    // TO-DO: require auth middleware
    try {
        const { activityID } = req.params;
        const comments = await Comment.getActivityComments(activityID);
        
        
        return res.json({comments});

    } catch(err) {
        next(err);
    }
});

router.get("/users/:username/comments", async function(req, res, next){
    try {
        const { username } = req.params;
        const comments = await Comment.getUserComments(username);
        
        return res.json({comments})
    } catch(err) {
        next(err);
    }
});

router.post("/layovers/:layoverCode/activities/:activityID/comments", async function(req, res, next) {
    try {
        const commentData = req.body.comment;
        const validationResults = {valid: true} // replace with jsonschema verification
        if (!validationResults.valid) {
            const errors = validationResults.erros.map(error => error.stack);
            throw new ExpressError(errors) // add invalid request error code
        }
        const comment = await Comment.createComment(commentData);

        return res.json({comment})
    } catch(err) {
        next(err);
    }
});

router.patch("/layovers/:layoverCode/activities/:activityID/comments/:id", async function (req, res, next) {
    try {
        const { id } = req.params;
        const commentData = req.body.comment;
        const validationResults = {valid: true} // replace with jsonschema verification

        if (!validationResults.valid) {
            const errors = validationResults.erros.map(error => error.stack);
            throw new ExpressError(errors) // add invalid request error code
        }
        const comment = await Comment.updateComment(id, commentData);
        return res.json({comment})
    } catch(err) {
        next(err);
    }
});

router.delete("/layovers/:layoverCode/activities/:activityID/comments/:id", async function(req, res, next) {
    try {
        const { id } = req.params;
        const commentTitle = await Comment.deleteComment(id);

        return res.json({message: `Successfully deleted layover "${commentTitle}"`});
    } catch(err) {
        next(err);
    }
});

module.exports = router;