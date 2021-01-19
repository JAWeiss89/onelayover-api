const db = require("../db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

class Layover {
    static async getAll() {
        const layoverResults = await db.query(
            `SELECT id, city_name, airport_code, country_name, thumbnail_url layovers`
        );
        const layovers = layoverResults.rows;
        return layovers;
    }
}