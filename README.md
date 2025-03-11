# College Appointment System (CAS) API Documentation

A RESTful API for managing professor availability and student appointments in a college system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=8080
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

3. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "professor" // or "student"
}
```

Response:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

Response:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Professor Availability

#### Set Availability (Professor Only)
```http
POST /api/professor/availability
Authorization: Bearer <your_token>
Content-Type: application/json

{
    "date": "2024-03-20",
    "slots": ["09:00", "10:00", "11:00", "14:00", "15:00"]
}
```

Response:
```json
{
    "_id": "65f96e8b2d66a123456789",
    "professorId": "65f96e8b2d66a987654321",
    "date": "2024-03-20T00:00:00.000Z",
    "slots": ["09:00", "10:00", "11:00", "14:00", "15:00"],
    "createdAt": "2024-03-19T10:30:00.000Z",
    "updatedAt": "2024-03-19T10:30:00.000Z"
}
```

#### Get Professor's Availability
```http
GET /api/professor/:professorId/availability
Authorization: Bearer <your_token>
```

Optional query parameter for specific date:
```http
GET /api/professor/:professorId/availability?date=2024-03-20
```

Response:
```json
[
    {
        "_id": "65f96e8b2d66a123456789",
        "professorId": {
            "_id": "65f96e8b2d66a987654321",
            "name": "John Doe",
            "email": "john@example.com"
        },
        "date": "2024-03-20T00:00:00.000Z",
        "slots": ["09:00", "10:00", "11:00", "14:00", "15:00"],
        "createdAt": "2024-03-19T10:30:00.000Z",
        "updatedAt": "2024-03-19T10:30:00.000Z"
    }
]
```

### Appointments

#### Book Appointment (Student Only)
```http
POST /api/appointments/book
Authorization: Bearer <your_token>
Content-Type: application/json

{
    "professorId": "65f96e8b2d66a987654321",
    "date": "2024-03-20",
    "timeSlot": "10:00"
}
```

Response:
```json
{
    "_id": "65f96e8b2d66a123456789",
    "studentId": "65f96e8b2d66a987654322",
    "professorId": "65f96e8b2d66a987654321",
    "date": "2024-03-20T00:00:00.000Z",
    "timeSlot": "10:00",
    "status": "booked",
    "createdAt": "2024-03-19T10:30:00.000Z",
    "updatedAt": "2024-03-19T10:30:00.000Z"
}
```

#### Get My Appointments (Both Student and Professor)
```http
GET /api/appointments/mine
Authorization: Bearer <your_token>
```

Response:
```json
[
    {
        "_id": "65f96e8b2d66a123456789",
        "studentId": {
            "_id": "65f96e8b2d66a987654322",
            "name": "John Student",
            "email": "student@example.com"
        },
        "professorId": {
            "_id": "65f96e8b2d66a987654321",
            "name": "Dr. Smith",
            "email": "smith@example.com"
        },
        "date": "2024-03-20T00:00:00.000Z",
        "timeSlot": "10:00",
        "status": "booked"
    }
]
```

#### Get Professor Appointments (Professor Only)
```http
GET /api/appointments/professor
Authorization: Bearer <your_token>
```

Response: Same format as Get My Appointments

#### Cancel Appointment (Professor Only)
```http
PUT /api/appointments/:id/cancel
Authorization: Bearer <professor_token>
```

Response:
```json
{
    "_id": "65f96e8b2d66a123456789",
    "studentId": {
        "_id": "65f96e8b2d66a987654322",
        "name": "John Student",
        "email": "student@example.com"
    },
    "professorId": {
        "_id": "65f96e8b2d66a987654321",
        "name": "Dr. Smith",
        "email": "smith@example.com"
    },
    "date": "2024-03-20T00:00:00.000Z",
    "timeSlot": "10:00",
    "status": "cancelled",
    "createdAt": "2024-03-19T10:30:00.000Z",
    "updatedAt": "2024-03-19T10:30:00.000Z"
}
```

## Authentication

- All protected routes require a JWT token in the Authorization header
- Format: `Authorization: Bearer <token>`
- Tokens are valid for 24 hours

## Role-Based Access

- **Professor Role**:
  - Can set their availability
  - Can view their own and other professors' availability

- **Student Role**:
  - Can view professors' availability

## Data Models

### User Model
- name (String, required)
- email (String, required, unique)
- password (String, required, min 6 chars)
- role (String, enum: ['student', 'professor'])
- createdAt (Date)

### Availability Model
- professorId (ObjectId, required)
- date (Date, required)
- slots (Array of Strings, time format: HH:mm)
- timestamps (createdAt, updatedAt)

### Appointment Model
- studentId (ObjectId, required, ref: 'User')
- professorId (ObjectId, required, ref: 'User')
- date (Date, required)
- timeSlot (String, required, format: HH:mm)
- status (String, enum: ['booked', 'cancelled'])
- timestamps (createdAt, updatedAt)

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 500: Server Error

## Time Format

- All times must be in 24-hour format (HH:mm)
- All dates must be in YYYY-MM-DD format
- Timestamps are returned in ISO format

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control
- Input validation
- MongoDB injection protection

## Testing

### Setup
```bash
npm install --save-dev jest supertest mongodb-memory-server cross-env
```

### Running Tests
```bash
# Run all tests
npm test


### Test Coverage
The test suite includes:

E2E Flow Tests
   - Complete user journey from registration to appointment cancellation
   - Validates all major functionalities

### Test Environment
- Uses MongoDB Memory Server for isolated testing
- Runs on a separate port (8081)
- Cleans up test data between runs
- Handles async operations properly
### Flow

- Register and log in Student A1
- Register and log in Professor P1
- Professor sets availability
- Student A1 views availability
- Student A1 books appointment T1
- Student A2 registers and books appointment T2
- Professor P1 cancels Student A1’s appointment
- Student A1 checks and sees no appointment.
- Use token variables to simulate login headers in the test file, and use await for each API call. Add appropriate expect() statements to verify responses."


### Example Test Flow
```javascript
// Register users
POST /api/auth/register (Student A1)
POST /api/auth/register (Professor P1)

// Set availability
POST /api/professor/availability

// Book appointments
GET /api/professor/:id/availability
POST /api/appointments/book

// Cancel and verify
PUT /api/appointments/:id/cancel
GET /api/appointments/mine
```


```bash 
newman run college-app.postman_collection.json -e college-env.postman_environment.json
```