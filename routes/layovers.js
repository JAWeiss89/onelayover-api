const express = require("express");
const ExpressError = require("../helpers/expressError");
const Layover = require("../models/layover");
// const {ensureLoggedIn, ensureSameUser} = require("../middleware/auth");

const router = new express.Router();

router.get("/", async function(req, res, next) {
    // TO-DO: require auth middleware
    try {
        const layovers = await Layover.getAll();
        return res.json({layovers});
    } catch(err) {
        next(err);
    }
});

router.get("/:layoverCode", async function (req, res, next) {
    // TO-DO: require auth middleware
    try {
        const { layoverCode } = req.params; 
        const layover = await Layover.getOne(layoverCode);
        return res.json({layover});
    } catch(err) {
        next(err);
    }
});

router.post("/", async function(req, res, next) {
    // TO-DO: require auth middleware
    // TO-DO: add jsonschema for validation of request

    try {
        const layoverData = req.body.layover;
        const validationResults = {valid: true} // use jsonschema here
        if (!validationResults.valid) { // if json can't be validated
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 404); // double check errors print as intended
        }
        const layover = await Layover.createLayover(layoverData);
        return res.status(201).json({layover});
    } catch(err) {
        next(err);
    }

});

router.patch("/:layoverCode", async function(req, res, next) {
    // TO-DO: require auth middleware && require admin middleware
    // TO-DO: add jsonschema for validation of request

    try {
        const { layoverCode } = req.params;
        const layoverData = req.body.layover; 
        const validationResults = {valid: true} // use jsonschema here
        if (!validationResults.valid) { // if json can't be validated
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 404); // double check errors print as intended
        }
        const layover = await Layover.updateLayover(layoverCode, layoverData);
        return res.json({layover})
    } catch(err) {
        next(err);
    }
});

router.delete("/:layoverCode", async function(req, res, next) {
    // TO-DO: require auth middleware && require admin middleware
    // TO-DO: add jsonschema for validation of request

    try {
        const { layoverCode } = req.params;
        const deletedCode = await Layover.deleteLayover(layoverCode);
        return res.json({message: `Successfuly deleted layover ${deletedCode}`})
    } catch(err) {
        next(err);
    }
})

module.exports = router;