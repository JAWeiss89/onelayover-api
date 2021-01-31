const express = require("express");
const ExpressError = require("../helpers/expressError");
const Comment = require("../models/comment");
const jsonschema = require("jsonschema");
const commentSchema = require("../schemas/comment.json");
 const { ensureLoggedIn, ensureSameUser } = require("../middleware/auth");
 

const router = new express.Router();


// ==========================================================
// TO-DO: does ensureSameUser work appropriately 
// 
// ==========================================================

router.get("/layovers/:layoverCode/activities/:activityID/comments", ensureLoggedIn, async function(req, res, next) {
    
    try {
        const { activityID } = req.params;
        const comments = await Comment.getActivityComments(activityID);
        
        return res.json({comments});

    } catch(err) {
        next(err);
    }
});

router.get("/users/:userID/comments", ensureLoggedIn, async function(req, res, next){
    try {
        const { userID } = req.params;
        const comments = await Comment.getUserComments(userID);
        
        return res.json({comments})
    } catch(err) {
        next(err);
    }
});

router.post("/layovers/:layoverCode/activities/:activityID/comments", ensureLoggedIn, ensureSameUser,  async function(req, res, next) {
    // Route expects three things to be passed in request json body:
    // 1) userID: "user123"   (to compare incoming request to userID in token. This id will also be used as author id of comment)
    // 2) comment: {"body": "this is my comment"}
    // 3) _token: "mytoken.aa.cc"     (for authentication)
    try {
        if (!req.body.userID) throw new ExpressError("Did not receive value for userID in request body")
        const commentData = req.body.comment;
        const validationResults = jsonschema.validate(commentData, newCommentSchema);
        if (!validationResults.valid) {
            const errors = validationResults.erros.map(error => error.stack);
            throw new ExpressError(errors) // add invalid request error code
        }

        commentData.activity_id = Number(req.params.activityID);
        commentData.user_id = Number(req.body.userID);
        // commentData should now have values for user_id, activity_id, and body
        
        const comment = await Comment.createComment(commentData);

        return res.json({comment})
    } catch(err) {
        next(err);
    }
});

router.patch("/layovers/:layoverCode/activities/:activityID/comments/:id", ensureLoggedIn, ensureSameUser, async function (req, res, next) {
    // Route expects three things to be passed in request json body:
    // 1) userID: "user123"   (to compare incoming request to userID in token. This id will also be used as author id of comment)
    // 2) comment: {"body": "this is my comment"}
    // 3) _token: "mytoken.aa.cc"     (for authentication)
    try {
        if (!req.body.userID) throw new ExpressError("Did not receive value for userID in request body")
        const { id } = req.params;
        const commentData = req.body.comment;
        const validationResults = jsonschema.validate(commentData, editCommentSchema);
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

router.delete("/layovers/:layoverCode/activities/:activityID/comments/:id", ensureLoggedIn, ensureSameUser, async function(req, res, next) {
    // Route expects two things:
    // 1) userID: "user123" (so that only users that created the comment can delete it)
    // 2) _token: "mytoken.bbb.ccc"   (for authentication)
    try {
        const { id } = req.params;
        const { userID } = req.body.userID;
        const commentTitle = await Comment.deleteComment(id, userID);

        return res.json({message: `Successfully deleted layover "${commentTitle}"`});
    } catch(err) {
        next(err);
    }
});

module.exports = router;