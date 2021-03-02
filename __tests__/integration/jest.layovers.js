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

    const testAdmin    = { id: testUser.id, is_admin: true};
    const testNotAdmin = { id: testUser.id, is_admin: false};

    testAdminToken    = jwt.sign(testAdmin, SECRET_KEY);
    testNotAdminToken = jwt.sign(testNotAdmin, SECRET_KEY);
});

beforeEach(async() => {
    await db.query(`DELETE FROM layovers WHERE layover_code='aus'`);
    await db.query(`DELETE FROM layovers WHERE layover_code='iah'`);

    let results = await db.query(
        `INSERT INTO layovers
        (layover_code, city_name, country_name, description, currency, language, police, ambulance, international, main_img_url, thumbnail_url)
        VALUES 
        ('aus', 'Austin', 'Texas', 'Live Music Capital of the World', 'usd', 'english', 911, 911, TRUE, 'www.fakeaustinimage.com', 'www.fakeaustinimage.com')
        RETURNING *`
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

describe("GET /layovers", () => {
    test("Gets all layovers if authenticated", async() => {
        const res = await request(app)
            .get("/layovers")
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.layovers).toHaveLength(1);
        expect(res.body.layovers[0].city_name).toBe('Austin');
    });
    test("Does not get layovers if unauthenticated", async() => {
        const res = await request(app)
            .get("/layovers");
        expect(res.statusCode).toBe(401);
    });
});

describe("GET /layovers/:layoverCode", () => {
    test("Gets layover if authenticated", async() => {
        const res = await request(app)
            .get(`/layovers/${testLayover.layover_code}`)
            .set({
                _token: testNotAdminToken,
                id: testUser.id 
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.layover.city_name).toBe('Austin');
    });
    test("Does not get layover if unauthenticated", async() => {
        const res = await request(app)
            .get(`/layovers/${testLayover.layover_code}`);
        expect(res.statusCode).toBe(401);
    });
    test("Returns 404 if no such layover", async() => {
        const res = await request(app)
            .get(`/layovers/abc`)
            .set({
                _token: testNotAdminToken,
                id: testUser.id 
            });
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /layovers", () => {
    test("Creates a new layover if admin and request body meets requirements", async () => {
        const newLayover = { layover_code: 'iah', city_name: 'Houston', country_name: 'Texas', description: 'Energy Capital of the world', currency: 'usd', language: 'english', police: 911, ambulance: 911, international: false, main_img_url:'www.google.com', thumbnail_url: 'www.google.com' }
        const res = await request(app)
            .post('/layovers')
            .send({ layover: newLayover, _token: testAdminToken });
        expect(res.statusCode).toBe(201);
        const res2 = await request(app)
            .get("/layovers")
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res2.body.layovers).toHaveLength(2);
    });
    test("Fails at adding a new layover if not admin", async () => {
        const newLayover = { layover_code: 'iah', city_name: 'Houston', country_name: 'Texas', description: 'Energy Capital of the world', currency: 'usd', language: 'english', police: 911, ambulance: 911, international: false, main_img_url:'www.google.com', thumbnail_url: 'www.google.com' }
        const res = await request(app)
            .post('/layovers')
            .send({ layover: newLayover, _token: testNotAdminToken });
        expect(res.statusCode).toBe(401);
        const res2 = await request(app)
            .get("/layovers")
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res2.body.layovers).toHaveLength(1);
    });
    test("Fails at adding a new layover if admin admim but missing layover data", async () => {
        const newLayover = { layover_code: 'iah', city_name: 'Houston', description: 'Energy Capital of the world', currency: 'usd', language: 'english', police: 911, ambulance: 911, international: false, main_img_url:'www.google.com', thumbnail_url: 'www.google.com' }
        const res = await request(app)
            .post('/layovers')
            .send({ layover: newLayover, _token: testAdminToken });
        expect(res.statusCode).toBe(400);
        const res2 = await request(app)
            .get("/layovers")
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res2.body.layovers).toHaveLength(1);
    });
});

describe("PATCH /layovers/:layoverCode", () => {
    test("Successfully updates existing layover", async () => {
        const updatedLayover = { description: 'Energy Capital of the world', language: 'spanish' }
        const res = await request(app)
            .patch(`/layovers/${testLayover.layover_code}`)
            .send({ layover: updatedLayover, _token: testAdminToken });
        expect(res.statusCode).toBe(200);
        const res2 = await request(app)
            .get(`/layovers/${testLayover.layover_code}`)
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res2.body.layover.description).toBe('Energy Capital of the world');
    });
    test("Doesn't update if not admin", async () => {
        const updatedLayover = { description: 'Energy Capital of the world', language: 'spanish' }
        const res = await request(app)
            .patch(`/layovers/${testLayover.layover_code}`)
            .send({ layover: updatedLayover, _token: testNotAdminToken });
        expect(res.statusCode).toBe(401);
        const res2 = await request(app)
            .get(`/layovers/${testLayover.layover_code}`)
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res2.body.layover.description).toBe('Live Music Capital of the World');
    });
});

describe("DELETE /layovers/:layoverCode", () => {
    test("Deletes layover if admin", async () => {
        const res = await request(app)
            .delete(`/layovers/${testLayover.layover_code}`)
            .set({
                _token: testAdminToken,
                id: testUser.id
            });
        const res2 = await request(app)
            .get("/layovers")
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res2.body.layovers).toHaveLength(0);
    });
    test("Delete fails if not admin", async () => {
        const res = await request(app)
            .delete(`/layovers/${testLayover.layover_code}`)
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res.statusCode).toBe(401);
        const res2 = await request(app)
            .get("/layovers")
            .set({
                _token: testNotAdminToken,
                id: testUser.id
            });
        expect(res2.body.layovers).toHaveLength(1);
    });
});

// ===============================
//   TEST BREAK DOWN 
// ===============================

// Break down deletes instance of user after test suite has run
// Break down deletes instance of layover after each test has run

afterEach(async () => {
    await db.query(`DELETE FROM layovers WHERE layover_code='aus'`);
    await db.query(`DELETE FROM layovers WHERE layover_code='iah'`);

});

afterAll(async function() {

    await db.query(`DELETE FROM users WHERE username='jorgito'`);

    // close db connection
    await db.end();
});