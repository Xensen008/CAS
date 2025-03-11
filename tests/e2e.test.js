const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../Models/user.model');
const Availability = require('../Models/availability.model');
const Appointment = require('../Models/appointment.model');

let mongoServer;
let server;

beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Start MongoDB memory server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to test database
    await mongoose.disconnect();
    await mongoose.connect(mongoUri);
    
    // Start express server
    const port = 8081; 
    server = app.listen(port);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    await server.close();
});

beforeEach(async () => {
    await User.deleteMany({});
    await Availability.deleteMany({});
    await Appointment.deleteMany({});
});

describe('E2E Test Flow', () => {
    let studentA1Token, studentA2Token, professorToken;
    let professorId, appointmentId;

    test('Complete appointment flow', async () => {
        // 1. Register Student A1
        const studentA1Response = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Student A1',
                email: 'student1@test.com',
                password: 'password123',
                role: 'student'
            });
        expect(studentA1Response.status).toBe(201);
        expect(studentA1Response.body).toHaveProperty('token');
        studentA1Token = studentA1Response.body.token;

        // 2. Register Professor P1
        const professorResponse = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Professor P1',
                email: 'professor@test.com',
                password: 'password123',
                role: 'professor'
            });
        expect(professorResponse.status).toBe(201);
        professorToken = professorResponse.body.token;
        
        // Extract professor ID from token
        const professorData = await User.findOne({ email: 'professor@test.com' });
        professorId = professorData._id;

        // 3. Professor sets availability
        const availabilityResponse = await request(app)
            .post('/api/professor/availability')
            .set('Authorization', `Bearer ${professorToken}`)
            .send({
                date: '2024-03-20',
                slots: ['09:00', '10:00', '11:00']
            });
        expect(availabilityResponse.status).toBe(201);
        expect(availabilityResponse.body.slots).toHaveLength(3);

        // 4. Student A1 views availability
        const viewAvailabilityResponse = await request(app)
            .get(`/api/professor/${professorId}/availability`)
            .set('Authorization', `Bearer ${studentA1Token}`);
        expect(viewAvailabilityResponse.status).toBe(200);
        expect(viewAvailabilityResponse.body[0].slots).toContain('09:00');

        // 5. Student A1 books appointment T1
        const bookingResponse = await request(app)
            .post('/api/appointments/book')
            .set('Authorization', `Bearer ${studentA1Token}`)
            .send({
                professorId: professorId,
                date: '2024-03-20',
                timeSlot: '09:00'
            });
        expect(bookingResponse.status).toBe(201);
        appointmentId = bookingResponse.body._id;

        // 6. Register Student A2
        const studentA2Response = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Student A2',
                email: 'student2@test.com',
                password: 'password123',
                role: 'student'
            });
        expect(studentA2Response.status).toBe(201);
        studentA2Token = studentA2Response.body.token;

        // 7. Student A2 books appointment T2
        const booking2Response = await request(app)
            .post('/api/appointments/book')
            .set('Authorization', `Bearer ${studentA2Token}`)
            .send({
                professorId: professorId,
                date: '2024-03-20',
                timeSlot: '10:00'
            });
        expect(booking2Response.status).toBe(201);

        // 8. Professor cancels Student A1's appointment
        const cancelResponse = await request(app)
            .put(`/api/appointments/${appointmentId}/cancel`)
            .set('Authorization', `Bearer ${professorToken}`);
        expect(cancelResponse.status).toBe(200);
        expect(cancelResponse.body.status).toBe('cancelled');

        // 9. Student A1 checks appointments
        const checkAppointmentsResponse = await request(app)
            .get('/api/appointments/mine')
            .set('Authorization', `Bearer ${studentA1Token}`);
        expect(checkAppointmentsResponse.status).toBe(200);
        const activeAppointments = checkAppointmentsResponse.body.filter(
            app => app.status === 'booked'
        );
        expect(activeAppointments).toHaveLength(0);
    });
});
