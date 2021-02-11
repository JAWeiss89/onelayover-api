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
        return commentResults.rows; 
    }

    // getUserComments => returns array of all comments from user
    static async getUserComments(userID) {
        const userResults  = await db.query(`SELECT id FROM users where id = $1`, [userID]);
        if (userResults.rows.length === 0) throw new ExpressError(`Could not find user with id ${userID}.`, 404)
        
        const commentResults = await db.query(
            `SELECT * FROM comments WHERE author_id = $1`, [userID]
        )
        if (commentResults.rows.length === 0) {
            throw new ExpressError(`Could not find comments for user with id ${userID}`, 404);
        }
        return commentResults.rows;         
    }

    // createComment => posts new comment. All values are required to post
    static async createComment(newCommentObj) {
        const { author_id, activity_id, body } = newCommentObj;
        const time = new Date();
        const created_at = time.toString().slice(0, 33);

        const results = await db.query(
            `INSERT INTO comments (author_id, activity_id, created_at, body)
             VALUES ($1, $2, $3, $4)`,
             [author_id, activity_id, created_at, body]
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

    // deleteComment => deletes comment. Returns 404 if no such comment exists in db
    static async deleteComment(commentID, userID) {
        const results = await db.query(
            `DELETE FROM comments WHERE id = $1 and author_id = $2 RETURNING title`, [commentID, userID]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Could not find comment with ID ${commentID} with userID ${userID}`, 404);
        }
        return results.rows[0];
    }
}

module.exports = Comment;