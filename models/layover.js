const db = require("../db");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");

class Layover {
    // getAll => returns array of all layovers with layover_code, city_name, country_name, and thumbnail urls
    static async getAll() {
        const layoverResults = await db.query(
            `SELECT layover_code, city_name, country_name, thumbnail_url FROM layovers`
        );
        const layovers = layoverResults.rows;
        return layovers;
    }

    // getOne => returns instance of layover with all available data including full size image url
    static async getOne(layoverCode) {
        const layoverResult = await db.query(
            "SELECT * FROM layovers WHERE layover_code = $1", [layoverCode]
        );
        if (layoverResult.rows.length===0) {
            throw new ExpressError(`Could not find layover with layover code ${layoverCode}`, 404);
        }
        return layoverResult.rows[0];
    }

    // create => creates new layover. Requires values for city_name, layover_code, country_name, description, currency, intl, main_img_url, thumbnail_url
    // returns newly created layover
    static async create(newLayoverObj) {
        // admin required
        const {city_name, layover_code, country_name, description, currency, intl, main_img_url, thumbnail_url} = newLayoverObj;
        const result = await db.query(
            `INSERT INTO layovers (city_name, layover_code, country_name, description, currency, intl, main_img_url, thumbnail_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
             [city_name, layover_code, country_name, description, currency, intl, main_img_url, thumbnail_url]
        )
        const layover = result.rows[0];
        return layover;
    }
    
    // updateLayover => updates Layover instance with layoverData. Data can have whatever desired key/value pairs that are valid and wish to be updated
    static async updateLayover(layoverCode, layoverData) {
        const { query, values } = partialUpdate("layovers", layoverData, "layover_code", layoverCode);

        const results = await db.query(query, values);
        if (results.rows.length === 0) {
            throw new ExpressError(`Could not find layover with layover code ${layoverCode}`, 404);
        }

        return results.rows[0];
    }

    // deleteLayover => deletes instance of layover that matches layoverCode. Returns 404 if no such layover with given layoverCode
    static async deleteLayover(layoverCode) {
        const results = db.query(
            `DELETE FROM layovers WHERE layover_code = $1 RETURNING layover_code`, [layoverCode]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Could not find layover with layover code ${layoverCode}`, 404); 
        }
        return results.rows[0];
    }
}

module.exports = Layover;