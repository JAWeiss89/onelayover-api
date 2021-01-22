const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");

class Activity {
    // change layover id to layover code
    static async getLayoverActivities(layoverCode) {
        const activityResults = await db.query(
            `SELECT author_id, layover_code, type_id, title, description, body, average_rating
             FROM layovers
             WHERE layover_id = $1`, [layoverCode]
        )
        const activities = activityResults.rows;
        return activities;
    }

    static async getActivity(activityID) {
        const activityResult = await db.query(
            `SELECT * FROM activities WHERE id = $1`, [activityID]
        )
        if (activityResult.rows.length === 0) {
            throw new ExpressError(`Could not find activity with id ${activityID}`)
        }
        return activityResult.rows[0];
    }

    static async createActivity(newActivityObj) {
        // authentication required
        const {author_id, layover_code, type_id, address, title, description, body, average_rating} = newActivityObj;
        ;
        const results = await db.query(
            `INSERT INTO activities (author_id, layover_code, type_id, address, title, description, body, average_rating)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [author_id, layover_code, type_id, address, title, description, body, average_rating]
        )
        const activity = results.rows[0];
        return activity;
    }

    static async  updateActivity(activityID, activityData) {
        const { query, values } = partialUpdate("activities", activityData, "id", activityID)

        const results = await db.query(query, values);
        if (results.rows.length === 0) {
            throw new ExpressError(`Could not find activity with ID ${activityID}.`, 404);
        }
        return results.rows[0];
    }
    
    static async deleteActivity(activityID) {
        const results = await db.query(
            `DELETE FROM activities WHERE id = $1 RETURNING title`, [activityID]
        )
        if (results.rows.length===0) {
            throw new ExpressError(`Could not find activity with id ${activityID}`, 404);
        }
        return results.rows[0];
    }
    
}