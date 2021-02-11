const db = require("../db");
const ExpressError = require("../helpers/expressError");

class ActivityPhoto {
    static async getActivityPhotos(activityID) {
        const photoResults = await db.query (
            `SELECT * FROM activity_photos WHERE activity_id`, [activityID]
        )
        if (photoResults.rows.length === 0) {
            throw new ExpressError(`Could not find photos for activity with ID ${activityID}`, 404);
        }
        return photoResults.rows;
    }

    static async  createActivityPhoto(newPhotoObj) {
        const {caption, activity_id, author_id, url, main_img} = newPhotoObj;
        const time = new Date();
        const created_at = time.toString().slice(0, 33);
        const results = await db.query(
            `INSERT INTO activity_photos (caption, activity_id, author_id, created_at, url, main_img)
             VALUES ($1, $2, $3, $4, $5, $6)`,
             [caption, activity_id, author_id, created_at, url, main_img]
        )
        const photo = results.rows[0];
        return photo;
    }

    static async deletePhoto(photoID, userID) {
        const results = await db.query(
            `DELETE FROM activity_photos WHERE id = $1 and author_id = $2 RETURNING id`, [photoID, userID]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Could not find photo with ID ${photoID}`)
        }
        return results.rows[0];
    }
}

module.exports = ActivityPhoto;