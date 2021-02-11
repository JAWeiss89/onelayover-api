const express = require("express");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
// const photoSchema = require("../schemas/photo.json");
const { ensureLoggedIn, ensureSameUser } = require("../middleware/auth");
const ActivityPhoto = require("../models/activityPhoto");

const router = new express.Router();

router.get("/layovers//layovers/:layoverCode/activities/:activityID/photos", ensureLoggedIn, async function(req, res, next) {
    try {
        const { activityID } = req.params;
        const photos = await ActivityPhoto.getActivityPhotos(activityID);

        return res.json({photos});

    } catch(err) {
        next(err);
    }
});

router.post("/layovers/:layoverCode/activities/:activityID/photos", ensureLoggedIn, async function(req, res, next) {
    // Route expects three things to be passed in request json body:
    // 1) userID: "123"   (to compare incoming request to userID in token. This id will also be used as author id of comment)
    // 2) photo: {"caption":"this is my photo", "url":"myurl", main_img: true}
    // 3) _token: "mytoken.aa.cc"     (for authentication)
    try {
        if (!req.body.userID) throw new ExpressError("Did not receive value for userID in request body")
        const photoData = req.body.photo;
        // const validationResults = jsonschema.validate(photoData, newPhotoSchema);
        // if (!validationResults.valid) {
        //     const errors = validationResults.erros.map(error => error.stack);
        //     throw new ExpressError(errors) // add invalid request error code
        // }

        photoData.activity_id = Number(req.params.activityID);
        photoData.author_id = Number(req.body.userID);
        // photoData should now have values for author_id and activity_id

        const photo = await ActivityPhoto.createActivityPhoto(photoData);

        return res.json({photo})

    } catch(err) {
        next(err);
    }
});

router.delete("/layovers/:layoverCode/activities/:activityID/photos/:id", ensureLoggedIn, ensureSameUser, async function(req, res, next) {
    // Route expects two things:
    // 1) userID: "user123" (so that only users that created the comment can delete it)
    // 2) _token: "mytoken.bbb.ccc"   (for authentication)
    try {
        const { id } = req.params;
        const { userID } = req.body;
        const photoID = await ActivityPhoto.deletePhoto(id, userID);

        return res.json({message: `Successfully deleted photo ${photoID}`});

    } catch(err) {
        next(err);
    }
})

module.exports = router;