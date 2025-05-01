const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const User = require('./auth-model');

let mongoServer;
let app;

//test user
const user = {
    username: 'testuser',
    password: 'testpassword',
};

async function addUser(user){
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = new User({
        username: user.username,
        password: hashedPassword,
    });

    await newUser.save();
}

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    app = require('./auth-service');
    await addUser(user);
});

afterAll(async () => {
    app.close();
    await mongoServer.stop();
});

describe('Auth Service', () => {
    it('Should perform a login operation /login', async () => {
        const response = await request(app).post('/login').send(user);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('username', 'testuser');
    });

    it('Should not perform a login operation and send a 401 error', async () => {
        const user = {
            username: 'name',
            password: 'wrongpassword', //NOSONAR
        };
        const response = await request(app).post('/login').send(user);
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Campos incorrectos');
    });

    it('Should not perform a login operation and send a 500 error', async () => {
        jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
            throw new Error('Simulated server error');
        });
        const response = await request(app).post('/login').send(user);
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal Server Error');
    });

    it('Should not perform a login operation and send a 400 error', async () => {
        const user = {};
        const response = await request(app).post('/login').send(user);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });
});
