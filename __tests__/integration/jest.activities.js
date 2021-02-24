process.env.NODE_ENV='test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const db = require('../../db');
const { SECRET_KEY } = require('../../config');

describe("SAMPLE ROUTE", () => {
    test("SAMPLE TEST", async() => {
        expect(1+1).toBe(2);
    })
});





afterAll(async function() {
    // close db connection
    await db.end();
})