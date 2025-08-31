# API Documentation

## Base URL
\`\`\`
Production: https://your-backend-domain.railway.app/api
Development: http://localhost:5000/api
\`\`\`

## Authentication

All protected routes require a JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Response Format

All API responses follow this structure:
\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
\`\`\`

Error responses:
\`\`\`json
{
  "success": false,
  "error": "Error message"
}
\`\`\`

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
