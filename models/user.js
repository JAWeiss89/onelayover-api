const db = require("../db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

class User {
    // static methods
    static async getAll() {
        const userResults = await db.query(
            `SELECT username, first_name, last_name, email FROM users)`
        );
        const users = userResults.rows;
        return users;
    }

    static async getOne(username) {
        const userResult = await db.query(
            `SELECT username, first_name, last_name, email, created_at, airline, favorite_layover
             FROM users
             WHERE username = $1`, [username]
        );
        if (userResult.rows.length===0) {
            throw new ExpressError(`Could not find a user with username ${username}.`, 404)
        }
        return userResult.rows[0];
    }

    static async create(newUserObj) {
        // inserts user into database and returns token
        const { username, password, first_name, last_name, email, is_admin } = newUserObj;
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await db.query(
            `INSERT INTO users (username, password, first_name, last_name, email, is_admin)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING username, first_name, last_name, email, is_admin`,
             [username, hashedPassword, first_name, last_name, email, is_admin]
        )
        const user = result.rows[0];
        let token = jwt.sign({username: user.username, is_admin: user.is_admin}, SECRET_KEY);
        
        return token;
    }

    // static async update(username, userData) {}

    // static async delete(username) {}

    // methods to like commment, activity, and photo??

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

}