# Notes App Backend APIs — Intern Engineering Assignment

## Project Overview

Build a small backend application for a multi-user notes service, similar to the backend server for Google Keep or Apple Notes.

The backend should expose REST APIs to manage users and their personal notes.

### Primary Features

- New user registration
- User authentication / login
- Create, read, update, and delete notes
- Share a note with another user

---

## Expected Deliverables

- A working backend server with REST APIs for the required functionality
- The backend server must be hosted online

You can use free deployment platforms such as:

- Heroku
- Railway.app
- Render.com
- Fly.io

---

## Feature Requirements

## 1. Register New User

### Endpoint

```http
POST /register
```

### Payload

```json
{
  "email": "string",
  "password": "string"
}
```

### Response

Status code:

```http
201 CREATED
```

Response should include a success message.

---

## 2. User Authentication / Login

### Endpoint

```http
POST /login
```

### Payload

```json
{
  "email": "string",
  "password": "string"
}
```

### Success Response

Status code:

```http
200 OK
```

Response:

```json
{
  "access_token": "string"
}
```

### Failure Response

Status code:

```http
401 Unauthorized
```

Response:

```json
{
  "message": "Invalid email or password"
}
```

---

## 3. Get All Notes for Authenticated User

### Endpoint

```http
GET /notes
```

### Header

```http
Authorization: Bearer <your_jwt_token>
```

### Response

Status code:

```http
200 OK
```

Response should contain a list of all notes created by the authenticated user.

```json
[
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

---

## 4. Get a Specific Note by ID

### Endpoint

```http
GET /notes/{id}
```

### Header

```http
Authorization: Bearer <your_jwt_token>
```

### Response

Status code:

```http
200 OK
```

Response should contain the note data.

The user should only be able to access:

- Their own notes
- Notes shared with them

---

## 5. Create a New Note

### Endpoint

```http
POST /notes
```

### Header

```http
Authorization: Bearer <your_jwt_token>
```

### Payload

```json
{
  "title": "string",
  "content": "string"
}
```

### Response

Status code:

```http
201 CREATED
```

Response should contain the newly created note data.

```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## 6. Update an Existing Note

### Endpoint

```http
PUT /notes/{id}
```

### Header

```http
Authorization: Bearer <your_jwt_token>
```

### Payload

```json
{
  "title": "string",
  "content": "string"
}
```

### Response

Status code:

```http
200 OK
```

Response should contain the updated note data.

---

## 7. Delete a Note

### Endpoint

```http
DELETE /notes/{id}
```

### Header

```http
Authorization: Bearer <your_jwt_token>
```

### Response

Status code:

```http
204 No Content
```

---

## 8. Share a Note with Another User

### Endpoint

```http
POST /notes/{id}/share
```

### Header

```http
Authorization: Bearer <your_jwt_token>
```

### Payload

```json
{
  "share_with_email": "string"
}
```

### Response

Status code:

```http
200 OK
```

Response should contain a success message.

After sharing, the user specified in `share_with_email` should be able to access the note using:

```http
GET /notes/{id}
```

---

## 9. API Documentation

### Endpoint

```http
GET /openapi.json
```

### Response

A JSON file containing all exposed endpoints.

Use the OpenAPI 3.0 structure:

```text
https://swagger.io/docs/specification/v3_0/basic-structure/
```

---

## 10. About

### Endpoint

```http
GET /about
```

### Response

```json
{
  "name": "your name",
  "email": "your email",
  "my features": {
    "feature name": "Feature description. Why did you choose it."
  }
}
```

---

# Your Feature — Required

Design and implement at least one new, meaningful feature that is not listed in the document.

This feature should show:

- Product sense
- Creativity
- Practical thinking

Example ideas:

- Pin notes
- Archive notes
- Add tags to notes
- Favorite notes
- Note version history
- Soft delete / trash
- Reminder for notes
- Collaborator permissions

---

# Stretch Goals — Optional

- Paginate the `GET /notes` API call
- Implement full-text search for notes

```http
GET /search?q=keyword
```

- Dockerize the application
- Build a basic frontend to interact with the API

---

# Notes for Candidates

- Submit the base URL of your deployed application.

Example:

```text
https://my-notes-app.render.com
```

Automated tests will call your API endpoints by suffixing paths to the base URL.

Examples:

```text
https://my-notes-app.render.com/about
https://my-notes-app.render.com/login
```

- You will be judged on edge case handling.
- Ensure API endpoints have good validations.
- Use any programming language you are comfortable with.
- Use any database you are comfortable with, such as PostgreSQL or SQLite.
- Keep the project simple, functional, and secure.
- You may use third-party libraries for JWT, password hashing, validation, etc.

---

# Recommended Implementation Checklist

## Authentication

- [ ] Register user
- [ ] Hash password before saving
- [ ] Login user
- [ ] Return JWT token
- [ ] Protect authenticated routes using JWT middleware

## Notes

- [ ] Create note
- [ ] Get all notes for logged-in user
- [ ] Get note by ID
- [ ] Update note
- [ ] Delete note
- [ ] Prevent users from accessing notes they do not own or that are not shared with them

## Sharing

- [ ] Share note with another registered user
- [ ] Validate shared user exists
- [ ] Allow shared user to access the note
- [ ] Prevent duplicate sharing entries

## Documentation

- [ ] Add `/openapi.json`
- [ ] Include all endpoints in OpenAPI format

## About Endpoint

- [ ] Add `/about`
- [ ] Include name
- [ ] Include email
- [ ] Include custom feature description

## Deployment

- [ ] Deploy backend online
- [ ] Test deployed base URL
- [ ] Submit only the base URL

---

# Suggested Edge Cases to Handle

## User Registration

- Duplicate email
- Invalid email format
- Empty password
- Weak password
- Missing fields

## Login

- Wrong email
- Wrong password
- Missing email or password

## Notes

- Empty title
- Empty content
- Invalid note ID
- Note not found
- Unauthorized access
- Updating another user's note
- Deleting another user's note

## Sharing

- Sharing with non-existing user
- Sharing note with yourself
- Sharing a note you do not own
- Sharing the same note with the same user multiple times

## Security

- Passwords must be hashed
- JWT secret should be stored in environment variables
- Do not expose sensitive data in responses
- Validate all request payloads
