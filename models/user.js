const db = require("../db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate.js");
const { user } = require("../db.js");

class User {
    // getAll => returns array of all users with username, first_name, last_name, and email
    static async getAll() {
        const userResults = await db.query(
            `SELECT username, first_name, last_name, email FROM users`
        );
        const users = userResults.rows;
        return users;
    }

    // getOne => returns instance of one user with all data except for password
    static async getOne(username) {
        const userResult = await db.query(
            `SELECT id, username, first_name, last_name, email, created_at, airline
             FROM users
             WHERE username = $1`, [username]
        );
        if (userResult.rows.length===0) {
            throw new ExpressError(`Could not find a user with username ${username}.`, 404)
        }
        return userResult.rows[0];
    }

    // create => creates new user. Requires values for username, password, first_name, last_name, email, airline, and is_admin
    static async createUser(newUserObj) {
        // inserts user into database and returns token
        const { username, password, first_name, last_name, email, airline } = newUserObj;
        let created_at = new Date();
        created_at = String(created_at);
        const is_admin = false;
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await db.query(
            `INSERT INTO users (username, password, first_name, last_name, email, created_at, airline, is_admin)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING username, first_name, last_name, email, airline, is_admin`,
             [username, hashedPassword, first_name, last_name, email, created_at, airline, is_admin]
        )
        const user = result.rows[0];
        let token = jwt.sign({username: user.username, is_admin: user.is_admin}, SECRET_KEY);
        
        return token;
    }

    // updateUser => updates user. userData can have any parameters that are desired to be updated
    static async updateUser(username, userData) {
        const { query, values } = partialUpdate("users", userData, "username", username);

        const results = await db.query(query, values);
        if (results.rows.length === 0) {
            throw new ExpressError(`Could not find user with username ${username}`, 404);
        }
        return results.rows[0];
    }

    // deleteUser => deletes user instance in database. Returns 404 if no such user with given username
    static async deleteUser(username) {
        const results = await db.query(
            `DELETE FROM users WHERE username = $1 RETURNING username`, [username]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(`Could not find user with username ${username}`)
        }
        return results.rows[0];
    }

    // authenticate => returns token if correct password and username. Throws 404 if cant find user, throws 500 if unable to authenticate
    static async authenticate(username, password) {
        const userResults = await db.query(`SELECT * FROM users WHERE username=$1`, [username]);
        const user = userResults[0];
        const is_admin = user.is_admin;

        if (user) {
            if (await bcrypt.compare(password, user.password)) {
                let token = jwt.sign({username, is_admin}, SECRET_KEY);
                return token;
            } else {
                throw new ExpressError("Could not authenticate user");
            }
        } else {
            throw new ExpressError(`Could not find user with username ${username}`, 404);
        }
    }

    static async likeCommentToggle(commentID, username) {
        const userResponse = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
        const userID = userResponse.rows[0].id;
        const time = new Date();
        const createdAt = time.toString().slice(0, 33);
        const results = await db.query(`SELECT * FROM comment_likes WHERE comment_id = $1 AND author_id = $2`, [commentID, userID]);
        const alreadyLiked = results.rows[0]; // alreadyLiked will be undefined if no record of the like
        console.log({alreadyLiked});
        if (alreadyLiked) { // if comment has been already liked, "unlike" by removing like from database
            await db.query(
                `DELETE FROM comment_likes WHERE comment_id = $1 AND author_id = $2 RETURNING id`,
                [commentID, userID]
            )
            return `Comment ${commentID} was unliked by ${username}`;
        } else {
            await db.query(
                `INSERT INTO comment_likes (comment_id, author_id, created_at)
                 VALUES ($1, $2, $3)`,
                 [commentID, userID, createdAt]
            )
            return `Comment ${commentID} was liked by ${username}`;
        }
    }
    
    static async likePhotoToggle(photoID, username) {
        const userResponse = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
        const userID = userResponse.rows[0].id;
        const time = new Date();
        const createdAt = time.toString().slice(0, 33);
        const results = await db.query(`SELECT * FROM photo_likes WHERE photo_id = $1 AND user_id = $2`, [photoID, userID]);
        const alreadyLiked = results.rows[0]; // alreadyLiked will be undefined if no record of the like
        if (alreadyLiked) { // if photo has been already liked, "unlike" by removing like from database
            await db.query(
                `DELETE FROM photo_likes WHERE photo_id = $1 AND author_id = $2 RETURNING id`,
                [photoID, userID]
            )
            return `Photo ${photoID} was unliked by ${username}`;
        } else {
            await db.query(
                `INSERT INTO photo_likes (photo_id, author_id, created_at)
                 VALUES ($1, $2, $3)`,
                 [photoID, userID, createdAt]
            )
            return `Photo ${photoID} was liked by ${username}`;
        }
        
    }
    
    static async likeActivityToggle(activityID, username) {
        const userResponse = await db.query(`SELECT id FROM users WHERE username = $1`, [username]);
        const userID = userResponse.rows[0].id;
        const time = new Date();
        const createdAt = time.toString().slice(0, 33);
        const results = await db.query(`SELECT * FROM activity_likes WHERE activity_id = $1 AND author_id = $2`, [activityID, userID]);
        const alreadyLiked = results.rows[0]; // alreadyLiked will be undefined if no record of the like
        if (alreadyLiked) { // if activity has been already liked, "unlike" by removing like from database
            await db.query(
                `DELETE FROM activity_likes WHERE activity_id = $1 AND author_id = $2 RETURNING id`,
                [activityID, userID]
            )
            return `Activity ${activityID} was unliked by ${username}`;
        } else { // else add like to database
            await db.query(
                `INSERT INTO activity_likes (activity_id, author_id, created_at)
                 VALUES ($1, $2, $3)`,
                 [activityID, userID, createdAt]
            )
            return `Activity ${activityID} was liked by ${username}`;
        }
    }

}

module.exports = User;