process.env.NODE_ENV='test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const db = require('../../db');
const { SECRET_KEY } = require('../../config');



let testUser;
let testSameUserToken;
let testLayover;

// ===============================
//   TEST SET UP 
// ===============================

// Set up inserts one user into test database before test suite
// Set up inserts one instance of layover before each test

beforeAll( async () => {
    await db.query(`DELETE FROM users WHERE username='jorgito'`);
    let results = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, email, created_at, airline, is_admin)
        VALUES ('jorgito', 'hashedpw', 'jorge', 'weiss', 'jorge@jorge.com', 'Now', 'united', true)
        RETURNING id, username, first_name, last_name, email, airline, is_admin`
    );
    testUser = results.rows[0]; 

    const testSameUser = { id: testUser.id, is_admin: true};
    testSameUserToken = jwt.sign(testSameUser, SECRET_KEY);
});

beforeEach(async() => {
    await db.query(`DELETE FROM layovers WHERE layover_code='aus'`);
    let results = await db.query(
        `INSERT INTO layovers
        (layover_code, city_name, country_name, description, currency, language, police, ambulance, international, main_img_url, thumbnail_url)
        VALUES 
        ('aus', 'Austin', 'Texas', 'Live Music Capital of the World', 'usd', 'english', 911, 911, TRUE, 'www.fakeaustinimage.com', 'www.fakeaustinimage.com)`
    );
    testLayover = results.rows[0];
});

// ===============================
//   TESTS
// ===============================

describe("SAMPLE ROUTE", () => {
    test("SAMPLE TEST", async() => {
        expect(1+1).toBe(2);
    });
});

// ===============================
//   TEST BREAK DOWN 
// ===============================

// Break down deletes instance of user after test suite has run
// Break down deletes instance of layover after each test has run

afterEach(async () => {
    await db.query(`DELETE FROM layovers WHERE layover_code='aus'`);
})

afterAll(async function() {

    await db.query(`DELETE FROM users WHERE username='jorgito'`);

    // close db connection
    await db.end();
})