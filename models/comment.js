const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");

class Comment {
    // getActivityComments => returns array of all comments for an activity
    // TO-DO: determine best way to order these comments (date/popularity)
    static async getActivityComments(activityID) {
        const commentResults = await db.query(
            `SELECT * FROM comments WHERE activity_id = $1`, [activityID]
        )
        if (commentResults.rows.length === 0) {
            throw new ExpressError(`Could not find comments for activity with ID ${activityID}`, 404);
        }
        return commentResults.rows[0]; 
    }

    // getUserComments => returns array of all comments from user
    static async getUserComments(username) {
        const commentResults = await db.query(
            `SELECT * FROM comments WHERE username = $1`, [username]
        )
        if (commentResults.rows.length === 0) {
            throw new ExpressError(`Could not find comments for user with username ${username}`, 404);
        }
        return commentResults.rows[0];         
    }

    // createComment => posts new comment. All values are required to post
    static async createComment(newCommentObj) {
        const { author_id, activity_id, created_at, title, body } = newCommentObj;

        const results = await db.query(
            `INSERT INTO comments (author_id, activity_id, created_at, title, body)
             VALUES $1, $2, $3, $4, $5`,
             [author_id, activity_id, created_at, title, body]
        )
        const comment = results.rows[0];
        return comment;
    }

    // updateComment => updates comment. Data can have whatever keys/values that are valid and wish to be updated
    static async updateComment(commentID, commentData) {
        const { query, values } = partialUpdate("comments", commentData, "id", commentID);
        
        const results = await db.query(query, values);
        if (results.rows.length === 0) {
            throw new ExpressError(`Could not find comment with id ${commentID}`, 404);
        }
        return results.rows[0];
    }

    // delete => deletes comment. Returns 404 if no such comment exists in db
    static async delete(commentID) {
        const results = await db.query(
            `DELETE FROM comments WHERE id = $1 RETURNING title`, [commentID]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Could not find comment with ID ${commentID}`, 404);
        }
        return results.rows[0];
    }
}

module.exports = Comment;