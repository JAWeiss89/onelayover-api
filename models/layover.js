const db = require("../db");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

class Layover {
    static async getAll() {
        const layoverResults = await db.query(
            `SELECT id, city_name, airport_code, country_name, thumbnail_url layovers`
        );
        const layovers = layoverResults.rows;
        return layovers;
    }

    static async getOne(airportCode) {
        const layoverResult = await db.query(
            "SELECT * FROM layovers WHERE airport_code = $1", [airportCode]
        );
        if (layoverResult.rows.length===0) {
            throw new ExpressError(`Could not find layover with airport code ${airportCode}`, 404);
        }
        return layoverResult.rows[0];
    }

    static async create(newLayoverObj) {
        // admin required
        const {city_name, airport_code, country_name, description, currency, intl, main_img_url, thumbnail_url} = newLayoverObj;
        const result = await db.query(
            `INSERT INTO layovers (city_name, airport_code, country_name, description, currency, intl, main_img_url, thumbnail_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
             [city_name, airport_code, country_name, description, currency, intl, main_img_url, thumbnail_url]
        )
        const layover = result.rows[0];
        return layover;
    }
}