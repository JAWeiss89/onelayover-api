const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");

class Activity {
    static async getLayoverActivities(layoverCode) {
        const activityResults = await db.query(
            `SELECT id, author_id, layover_code, type_id, address, title, description, body
             FROM activities
             WHERE layover_code = $1`, [layoverCode]
        )
        console.log({layoverCode})
        const activities = activityResults.rows;
        console.log({activities})
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
        const {author_id, layover_code, type_id, address, title, description, body} = newActivityObj;
        
        const results = await db.query(
            `INSERT INTO activities (author_id, layover_code, type_id, address, title, description, body)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [author_id, layover_code, type_id, address, title, description, body]
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

    static async addActivityType(activityType) {
        // Requires admin
        const results = await db.query(
            `INSERT INTO activity_types (type) VALUES ($1)`, [activityType]
        )
        if (results.rows.length === 0) {
            throw new ExpressError("Unable to add activity type");
        }

        return results.rows[0];
    }
    
    static async deleteActivityType(activityType) {
        // Requires admin
        const results = await db.query(
            `DELETE FROM activity_types WHERE type = $1 RETURNING id`,
            [activityType]
        )
        if (results.rows.length === 0) {
            throw new ExpressError("Unable to delete activity type");
        }

        return results.rows[0];
    }
}

module.exports = Activity;