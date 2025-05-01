const request = require('supertest');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('./user-model');
const Ranking = require("./ranking-model");

let mongoServer;
let app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    app = require('./user-service');
});

afterAll(async () => {
    app.close();
    await mongoServer.stop();
});

async function testInvalidUserCreation(username ,password, expectedErrorMessage) {
    const newUser = {
        username,
        password,
    };

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', expectedErrorMessage);

    // Verifica que el usuario no se haya insertado en la base de datos
    const userInDb = await User.findOne({ username: username });
    expect(userInDb).toBeNull();
}

describe('User Service', () => {
    it('should add a new user on POST /adduser', async () => {
        const newUser = {
            username: 'testuser',
            password: '123456q@', //NOSONAR
        };

        const response = await request(app).post('/adduser').send(newUser);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('username', 'testuser');

        // Check if the user is inserted into the database
        const userInDb = await User.findOne({ username: 'testuser' });

        // Assert that the user exists in the database
        expect(userInDb).not.toBeNull();
        expect(userInDb.username).toBe('testuser');

        // Assert that the password is encrypted
        const isPasswordValid = await bcrypt.compare('123456q@', userInDb.password);
        expect(isPasswordValid).toBe(true);
    });

    it('should not add a new user on POST /adduser', async () => {
        await testInvalidUserCreation('t' , '123456q@', 'El nombre de usuario debe tener al menos 3 caracteres');
        await testInvalidUserCreation('testuser2' , '1', 'La contraseña debe tener al menos 8 caracteres');
        await testInvalidUserCreation('testuser2' , '123456789.', 'La contraseña debe contener al menos una letra');
        await testInvalidUserCreation('testuser2' , 'qwertyui.', 'La contraseña debe contener al menos un número');
        await testInvalidUserCreation('testuser2' , '1234567q', 'La contraseña debe contener al menos un caracter especial (!@#$%^&*.)');
    });

    it('should get the user statistics on GET /stats/:username', async () => {
        const response = await request(app).get('/stats/testuser');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('username', 'testuser');
        expect(response.body).toHaveProperty('gamesPlayed', 0);
        expect(response.body).toHaveProperty('correctAnswered', 0);
        expect(response.body).toHaveProperty('incorrectAnswered', 0);
        expect(response.body).toHaveProperty('timePlayed', 0);
        expect(response.body).toHaveProperty('puntuation', 0);
    });

    it('should not get the user statistics on GET /stats/:username', async () => {
        jest.spyOn(Ranking, 'findOne').mockImplementationOnce(() => {
            throw new Error('Simulated database error');
        });

        const response = await request(app).get('/stats/testuser');
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Simulated database error');

        // Restaura el mock
        jest.restoreAllMocks();
    });

    it('should update the user statistics on POST /stats', async () => {
        const stats = {
            username: 'testUser',
            correctAnswered: 5,
            incorrectAnswered: 2,
            gamesPlayed: 3,
            timePlayed: 120,
            puntuation: 10,
        };
        let response = await request(app).post('/stats').send(stats);
        expect(response.status).toBe(200);
        response = await request(app).get('/stats/testUser').send(stats);
        expect(response.body).toHaveProperty('username', 'testUser');
        expect(response.body).toHaveProperty('correctAnswered', 5);
        expect(response.body).toHaveProperty('incorrectAnswered', 2);
        expect(response.body).toHaveProperty('gamesPlayed', 3);
        expect(response.body).toHaveProperty('timePlayed', 120);
        expect(response.body).toHaveProperty('puntuation', 10);
    });

    it('should not update the user statistics on POST /stats', async () => {
        const response = await request(app).post('/stats').send();
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');

    });

    it('should get the all the stats on GET /getStats', async () => {
        const response = await request(app).get('/getStats');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('should get the all the stats on GET /getDBUsers', async () => {
        const response = await request(app).get('/getDBUsers');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });
});
