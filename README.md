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
