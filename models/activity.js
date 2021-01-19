const db = require("../db");
const ExpressError = require("../helpers/expressError");

class Activity {
    // change layover id to layover code
    static async getLayoverActivities(layoverID) {
        const activityResults = await db.query(
            `SELECT author_id, layover_id, type_id, title, description, body, average_rating
             FROM layovers
             WHERE layover_id = $1`, [layoverID]
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

    // static async createActivity(newActivityObj) {}
    
    // update activity
    // delete activity
}