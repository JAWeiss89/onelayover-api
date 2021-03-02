process.env.NODE_ENV='test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const db = require('../../db');
const { SECRET_KEY } = require('../../config');

let testUser;
let testAdminToken;
let testNotAdminToken;
let testLayover;
let testActivity;

// ===============================
//   TEST SET UP 
// ===============================

// Set up inserts one user and layover into test database before test suite
// Set up inserts one instance of layover before each test

beforeAll( async () => {
    await db.query(`DELETE FROM users WHERE username='jorgito'`);
    let userResults = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, email, created_at, airline, is_admin)
        VALUES ('jorgito', 'hashedpw', 'jorge', 'weiss', 'jorge@jorge.com', 'Now', 'united', true)
        RETURNING id, username, first_name, last_name, email, airline, is_admin`
    );
    let layoverResults = await db.query(
        `INSERT INTO layovers
        (layover_code, city_name, country_name, description, currency, language, police, ambulance, international, main_img_url, thumbnail_url)
        VALUES 
        ('aus', 'Austin', 'Texas', 'Live Music Capital of the World', 'usd', 'english', 911, 911, TRUE, 'www.fakeaustinimage.com', 'www.fakeaustinimage.com')
        RETURNING *`
    );
    testUser = userResults.rows[0];
    testLayover = layoverResults.rows[0];

    const testAdmin    = { id: testUser.id, is_admin: true};
    const testNotAdmin = { id: testUser.id, is_admin: false};

    testAdminToken    = jwt.sign(testAdmin, SECRET_KEY);
    testNotAdminToken = jwt.sign(testNotAdmin, SECRET_KEY);


});

beforeEach(async() => {
    await db.query(`DELETE FROM activities WHERE title='ipanema beach'`);
    await db.query(`DELETE FROM activities WHERE title='copacabana beach'`);


    let results = await db.query(
        `INSERT INTO activities 
        (author_id, layover_code, type_id, address, title, description, body)
        VALUES 
        (${testUser.id}, 'aus', 1, '123 Penny Ln', 'ipanema beach', 'best beach ever', 'Yes it is the best beach ever')
        RETURNING *`
    );
    testActivity = results.rows[0];
});

// ===============================
//   TESTS
// ===============================

describe("SAMPLE ROUTE", () => {
    test("SAMPLE TEST", async() => {
        expect(1+1).toBe(2);
    })
});

describe("GET layovers/:layoverCode/activities", () => {
    test("Gets all activities for layover", async () => {
        const res = await request(app)
            .get(`/layovers/${testLayover.layover_code}/activities`)
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.activities).toHaveLength(1);
    });
    test("Doesn't get if not authenticated", async () => {
        const res = await request(app)
            .get(`/layovers/${testLayover.layover_code}/activities`)
            .set({
                _token: 'fake.token.abc',
                id: testUser.id
            });
        expect(res.statusCode).toBe(500);
    });
});

describe("GET layovers/:layoverCode/activities/:id", () => {
    test("Gets details for one activity", async () => {
        const res = await request(app)
            .get(`/layovers/${testLayover.layover_code}/activities/${testActivity.id}`)
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.activity.title).toBe('ipanema beach');
    });
    test("Error if not authenticated", async () => {
        const res = await request(app)
            .get(`/layovers/${testLayover.layover_code}/activities/${testActivity.id}`)
        expect(res.statusCode).toBe(401);
    });
    test("Returns 404 if not found", async () => {
        const res = await request(app)
            .get(`/layovers/${testLayover.layover_code}/activities/999`)
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /layovers/:layoverCode/activities", () => {
    test("Successfully adds new activity to layover", async () => {
        const activityData = { author_id: testUser.id, layover_code: testLayover.layover_code, type_id: 1, address:'452 abc rd', title:'copacabana beach', description: 'second best beach', body:'yes the second best' }
        const res = await request(app)
            .post(`/layovers/${testLayover.layover_code}/activities`)
            .send({
                activity: activityData,
                userID: testUser.id,
                _token: testNotAdminToken
            });
        expect(res.statusCode).toBe(201);
        const res2 = await request(app)
            .get(`/layovers/${testLayover.layover_code}/activities`)
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res2.statusCode).toBe(200);
        expect(res2.body.activities).toHaveLength(2);
    });
    test("Does not add if missing data", async () => {
        const activityData = { author_id: testUser.id, type_id: 1, title:'copacabana beach', description: 'second best beach', body:'yes the second best' }
        const res = await request(app)
            .post(`/layovers/${testLayover.layover_code}/activities`)
            .send({
                activity: activityData,
                userID: testUser.id,
                _token: testNotAdminToken
            });
        expect(res.statusCode).toBe(400);
        const res2 = await request(app)
            .get(`/layovers/${testLayover.layover_code}/activities`)
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res2.statusCode).toBe(200);
        expect(res2.body.activities).toHaveLength(1);
    });
});

describe("PATCH /layovers/:layoverCode/activities/:id", () => {
    test("Updates layover activity if same user", async () => {
        const activityData = {body: 'The water can be a little dirty but still fun', address:'213 derby ave'};

        const res = await request(app)
            .patch(`/layovers/${testLayover.layover_code}/activities/${testActivity.id}`)
            .send({
                activity: activityData,
                userID: testUser.id,
                _token: testNotAdminToken
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.activity.body).toBe('The water can be a little dirty but still fun');
    });
});

describe("DELETE /layovers/:layoverCode/activities/:id", () => {
    test("Deletes activity if same user", async () => {
        const res = await request(app)
            .delete(`/layovers/${testLayover.layover_code}/activities/${testActivity.id}`)
            .send({
                userID: testUser.id,
                _token: testNotAdminToken
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe(`Successfully deleted activity ${testActivity.title}`)
        const res2 = await request(app)
            .get(`/layovers/${testLayover.layover_code}/activities`)
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });

        expect(res2.body.activities).toHaveLength(0);
        
    });
    test("Doesn't delete activity if different user", async() => {
        const res = await request(app)
            .delete(`/layovers/${testLayover.layover_code}/activities/${testActivity.id}`)
            .send({
                userID: 99999,
                _token: testNotAdminToken
            });
        expect(res.statusCode).toBe(401);
        const res2 = await request(app)
            .get(`/layovers/${testLayover.layover_code}/activities`)
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });

        expect(res2.body.activities).toHaveLength(1);
    });
});

// ===============================
//   TEST BREAK DOWN 
// ===============================

// Break down deletes instance of user after test suite has run
// Break down deletes instance of layover after each test has run

afterEach(async () => {

    await db.query(`DELETE FROM activities WHERE title='ipanema beach'`);
    await db.query(`DELETE FROM activities WHERE title='copacabana beach'`);
});

afterAll(async () => {

    await db.query(`DELETE FROM users WHERE username='jorgito'`);
    await db.query(`DELETE FROM layovers WHERE layover_code='aus'`);
    // close db connection
    await db.end();
});