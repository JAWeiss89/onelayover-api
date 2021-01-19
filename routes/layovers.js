const express = require("express");
const ExpressError = require("../helpers/expressError");
// const Layover = require("../models/layover");
// const {ensureLoggedIn, ensureSameUser} = require("../middleware/auth");

const router = new express.Router();

router.get("/", async function(req, res, next) {
    try {
        // const layovers = await Layover.getAll();
        const layovers = [{country: "mexico", airportCode: "MEX"}]
        return res.json({layovers});
    } catch(err) {
        next(err);
    }
});

module.exports = router;