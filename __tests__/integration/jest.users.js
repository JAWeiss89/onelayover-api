process.env.NODE_ENV='test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const db = require('../../db');
const { SECRET_KEY } = require('../../config');
const { user } = require('../../db');

// ===============================
//   TEST SET UP 
// ===============================

// Set up inserts one user into test database

let testUser;
let testSameUserToken;
let testDiffUserToken;
let testNotAdminToken;

beforeEach( async () => {
    await db.query(`DELETE FROM users WHERE username='jorgito'`);
    await db.query(`DELETE FROM users WHERE username='sarita111'`);
    let results = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, email, created_at, airline, is_admin)
        VALUES ('jorgito', 'hashedpw', 'jorge', 'weiss', 'jorge@jorge.com', 'Now', 'united', true)
        RETURNING id, username, first_name, last_name, email, airline, is_admin`
    );
    testUser = results.rows[0]; 

    const testSameUser = { id: testUser.id, is_admin: true};
    const testDiffUser = { id: 999, is_admin: true};
    const testNotAdmin = { id: 888, is_admin: false};
    testSameUserToken = jwt.sign(testSameUser, SECRET_KEY);
    testDiffUserToken = jwt.sign(testDiffUser, SECRET_KEY);
    testNotAdminToken = jwt.sign(testNotAdmin, SECRET_KEY);
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
    test("Returns 401 if unathenticated", async() => {
        const res = await request(app)
            .get("/users");
        expect(res.statusCode).toBe(401);
    });
    test("Returns 401 if not admin", async() => {
        const res = await request(app)
            .get("/users")
            .set({
                '_token': testNotAdminToken,
                'id': testUser.id
            })
        expect(res.statusCode).toBe(401);
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
    });
    test("Returns 404 if can't find user", async() => {
        const res = await request(app)
            .get(`/users/10002`)
            .set({
                '_token': testSameUserToken,
                'id': testUser.id                
            })
        expect(res.statusCode).toBe(404);
    });
    test("Returns 401 if unauthenticated", async() => {
        const res = await request(app)
            .get(`/users/1`);
        expect(res.statusCode).toBe(401);
    });
});

describe("POST /users", () => {
    // no auth required
    test("Adds one user to database", async() => {
        const newUser = {username: "sarita111", password: "mypw", first_name:"Sarira", last_name:"Ramirez", email:"myemail@email.com", airline:"united"};
        const res = await request(app)
            .post("/users")
            .send({user: newUser});
        expect(res.statusCode).toBe(201);

        const res2 = await request(app)
        .get("/users")
        .set({
            '_token': testSameUserToken,
            'id': testUser.id
        });
        expect(res2.body.users).toHaveLength(2);
    });
    test("Doens't add user if missing data", async() => {
        const newUser = {username: "sarita111", password: "mypw", last_name:"Ramirez", email:"myemail@email.com", airline:"united"};
        const res = await request(app)
            .post("/users")
            .send({user: newUser});
        expect(res.statusCode).toBe(400);

        const res2 = await request(app)
            .get("/users")
            .set({
                '_token': testSameUserToken,
                'id': testUser.id
            });
        expect(res2.body.users).toHaveLength(1);
    });
});

describe("PATCH /users/:userID", () => {
    test("Updates if same user making request", async() => {
        const userData = {first_name: 'coco', last_name: 'ramos'};
        const res = await request(app)
            .patch(`/users/${testUser.id}`)
            .send({_token: testSameUserToken, user: userData});
        expect(res.statusCode).toBe(200);

        const res2 = await request(app)
            .get(`/users/${testUser.id}`)
            .set({
                '_token': testSameUserToken,
                'id': testUser.id
            });

        expect(res2.body.user.first_name).toBe("coco");
    });
    test("Doesn't update if different user is making request", async() => {
        const userData = {first_name: 'coco', last_name: 'ramos'}
        const res = await request(app)
            .patch(`/users/${testUser.id}`)
            .send({_token: testDiffUserToken, user: userData});
        expect(res.statusCode).toBe(401);
        const res2 = await request(app)
            .get(`/users/${testUser.id}`)
            .set({
                '_token': testSameUserToken,
                'id': testUser.id
            });

        expect(res2.body.user.username).toBe("jorgito");
        expect(res2.body.user.first_name).toBe("jorge");
    });
    test("Returns 404 if no such user", async() => {
        const userData = {first_name: 'coco', last_name: 'ramos'};
        const res = await request(app)
            .patch(`/users/999`)
            .send({_token: testDiffUserToken, user: userData});
        expect(res.statusCode).toBe(404);
    })
});

describe("/users/:userID", () => {
    test("Deletes user if same user is requesting delete", async()=> {
        const res = await request(app)
            .delete(`/users/${testUser.id}`)
            .send({_token: testSameUserToken});
        expect(res.statusCode).toBe(200);
        const res2 = await request(app)
            .get('/users')
            .set({
                '_token': testSameUserToken,
                'id': testUser.id
            });
        expect(res2.body.users).toHaveLength(0);
    });
    test("Returns 401 if different user is requesting delete", async()=> {
        const res = await request(app)
            .delete(`/users/${testUser.id}`)
            .send({_token: testDiffUserToken});
        expect(res.statusCode).toBe(401);
        const res2 = await request(app)
            .get('/users')
            .set({
                '_token': testSameUserToken,
                'id': testUser.id
            });
        expect(res2.body.users).toHaveLength(1);
    });
    test("Returns 404 if user is not found", async()=> {
        const res = await request(app)
            .delete(`/users/999`)
            .send({_token: testDiffUserToken});
        expect(res.statusCode).toBe(404);
        const res2 = await request(app)
            .get('/users')
            .set({
                '_token': testSameUserToken,
                'id': testUser.id
            });
        expect(res2.body.users).toHaveLength(1);
    });
});




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