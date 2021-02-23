process.env.NODE_ENV='test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const db = require('../../db');
const { SECRET_KEY } = require('../../config');

// ===============================
//   TEST SET UP 
// ===============================

// Set up inserts one user into test database

let testUser;
let testSameUserToken;
let testDiffUserToken;

beforeEach( async () => {
    await db.query(`DELETE FROM users WHERE username='jorgito'`);
    await db.query(`DELETE FROM users WHERE username='sarita111'`);
    let results = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, email, created_at, airline, is_admin)
        VALUES ('jorgito', 'hashedpw', 'jorge', 'weiss', 'jorge@jorge.com', 'Now', 'united', true)
        RETURNING id, username, first_name, last_name, email, airline, is_admin`
    );
    testUser = results.rows[0]; 

    const testSameUser = { username: "jorgito", is_admin: true};
    const testDiffUser  = { username: "danielito", is_admin: false}
    testSameUserToken = jwt.sign(testSameUser, SECRET_KEY);
    testDiffUserToken = jwt.sign(testDiffUser, SECRET_KEY);
});

// ===============================
//   TESTS
// ===============================

describe("SAMPLE ROUTE", () => {
    test("SAMPLE TEST", async() => {
        expect(1+1).toBe(2);
    })
});

describe("GET /users", () => {
    // route requires authentication and admin access
    test("Gets all users", async() => {
        const res = await request(app)
            .get("/users")
            .set({
                '_token': testSameUserToken,
                'id': testUser.id
            })
        expect(res.statusCode).toBe(200);
        expect(res.body.users).toHaveLength(1);
        expect(res.body.users[0].username).toBe(testUser.username);
    })
});

describe("GET /users/:userID", () => {
    // route requires authentication
    test("Gets one user", async() => {
        const res = await request(app)
            .get(`/users/${testUser.id}`)
            .set({
                '_token': testSameUserToken,
                'id': testUser.id
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.user.username).toEqual(testUser.username);
    })
    test("Returns 404 if can't find user", async() => {
        const res = await request(app)
            .get(`/users/10002`)
            .set({
                '_token': testSameUserToken,
                'id': testUser.id                
            })
        expect(res.statusCode).toBe(404);
    })
})





// ===============================
//   TEST TEAR DOWN
// ===============================

afterEach(async () => {
    // delete company made in set up
    await db.query(`DELETE FROM users WHERE username='jorgito'`);
    await db.query(`DELETE FROM users WHERE username='sarita111'`);

})

afterAll(async function() {
    // close db connection
    await db.end();
})