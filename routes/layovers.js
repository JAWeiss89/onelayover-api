const express = require("express");
const ExpressError = require("../helpers/expressError");
const Layover = require("../models/layover");
const jsonschema = require("jsonschema");
const editLayoverSchema = require("../schemas/editLayover.json");
const newLayoverSchema = require("../schemas/newLayover.json");
 const {ensureLoggedIn, ensureSameUser, ensureAdmin} = require("../middleware/auth");

const router = new express.Router();

router.get("/", ensureLoggedIn, async function(req, res, next) {
    try {
        const layovers = await Layover.getAll();
        return res.json({layovers});
    } catch(err) {
        next(err);
    }
});

router.get("/:layoverCode", ensureLoggedIn, async function (req, res, next) {
    try {
        const { layoverCode } = req.params; 
        const layover = await Layover.getOne(layoverCode);
        return res.json({layover});
    } catch(err) {
        next(err);
    }
});

router.post("/", ensureLoggedIn, ensureAdmin, async function(req, res, next) {
   // route expects layover in body with values for the following fields:
   // layover_code, city_name, country_name, description, currency ("3 char code"), international(t/f), main_img_url, thumbnail_url
    try {
        const layoverData = req.body.layover;
        const validationResults = jsonschema.validate(layoverData, newLayoverSchema);
        if (!validationResults.valid) { // if json can't be validated
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors, 400); // double check errors print as intended
        }
        await Layover.createLayover(layoverData);
        
        return res.status(201).json({message: `Layover ${layoverData.layover_code}/${layoverData.city_name} was successfully created`});
    } catch(err) {
        next(err);
    }

});

router.patch("/:layoverCode", ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    // route expects layover in body as json with values for any of the following fields:
    // layover_code, city_name, country_name, description, currency ("3 char code"), international(t/f), main_img_url, thumbnail_url

    try {
        const { layoverCode } = req.params;
        const layoverData = req.body.layover; 
        const validationResults = jsonschema.validate(layoverData, editLayoverSchema);
        if (!validationResults.valid) { // if json can't be validated
            const errors = validationResults.errors.map(error => error.stack);
            throw new ExpressError(errors); // add invalid request error code
        }
        const layover = await Layover.updateLayover(layoverCode, layoverData);
        
        return res.json({layover})
    } catch(err) {
        next(err);
    }
});

router.delete("/:layoverCode", ensureLoggedIn, ensureAdmin, async function(req, res, next) {

    try {
        const { layoverCode } = req.params;
        const response = await Layover.deleteLayover(layoverCode);
        return res.json({message: `Successfuly deleted layover ${response.layover_code}`})
    } catch(err) {
        next(err);
    }
})

module.exports = router;