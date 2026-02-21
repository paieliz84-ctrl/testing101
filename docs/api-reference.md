# API Reference

Dokumentasi lengkap semua API endpoints.

---

## 🌐 Base URL

```
Development: http://localhost:5173
Production:  https://your-app.pages.dev
```

---

## 🔐 Authentication

Semua protected endpoints memerlukan session cookie. Cookie di-set saat login dan otomatis dikirim oleh browser.

**Auth Response Headers:**
```http
Set-Cookie: auth_session=xxx; HttpOnly; Secure; SameSite=Strict
```

---

## 👤 Authentication Endpoints

### POST `/auth/register`

Register user baru dengan email dan password.

**Request:**
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "user": {
    "id": "user_xxx",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Response 400 Bad Request:**
```json
{
  "message": "Validation failed"
}
```

**Response 409 Conflict:**
```json
{
  "message": "Email already registered"
}
```

---

### POST `/auth/login`

Login dengan email dan password.

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_xxx",
    "email": "john@example.com",
    "name": "John Doe",
    "provider": "email"
  }
}
```

**Response 401 Unauthorized:**
```json
{
  "message": "Invalid email or password"
}
```

**Response 403 Forbidden:**
```json
{
  "message": "Please verify your email before logging in"
}
```

---

### POST `/auth/logout`

Logout user dan invalidate session.

**Request:**
```http
POST /auth/logout
Cookie: auth_session=xxx
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### GET `/auth/google`

Initiate Google OAuth login. Redirect ke Google consent screen.

**Request:**
```http
GET /auth/google
```

**Response:**
Redirect ke Google OAuth page.

---

### GET `/auth/google/callback`

Callback URL setelah Google OAuth approval.

**Query Parameters:**
- `code` - Authorization code dari Google
- `state` - CSRF protection state

**Response:**
Redirect ke `/dashboard` dengan session cookie set.

**Response 400:**
```json
{
  "message": "Invalid state parameter"
}
```

---

### POST `/auth/forgot-password`

Request password reset link.

**Request:**
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "If an account exists, a reset link has been sent"
}
```

**Note:** Selalu return 200 meski email tidak ada (security).

---

### POST `/auth/reset-password`

Reset password dengan token.

**Request:**
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_xxx",
  "email": "john@example.com",
  "password": "NewSecurePass123"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Response 400:**
```json
{
  "message": "Invalid or expired token"
}
```

---

### GET `/auth/verify-email`

Verify email dengan token.

**Query Parameters:**
- `token` - Verification token
- `email` - User email

**Response:**
Redirect ke `/login` dengan status verified.

---

## 👥 User Endpoints

### GET `/api/users`

List semua users (public).

**Request:**
```http
GET /api/users
```

**Response 200 OK:**
```json
{
  "data": [
    {
      "id": "user_xxx",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://...",
      "provider": "email",
      "createdAt": 1704067200
    }
  ]
}
```

---

### GET `/api/users/:id`

Get user by ID.

**Request:**
```http
GET /api/users/user_xxx
```

**Response 200 OK:**
```json
{
  "data": {
    "id": "user_xxx",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Software developer",
    "location": "Jakarta",
    "website": "https://johndoe.com",
    "avatar": "https://...",
    "provider": "email",
    "createdAt": 1704067200
  }
}
```

**Response 404:**
```json
{
  "message": "User not found"
}
```

---

## 👤 Profile Endpoints

### GET `/api/profile`

Get current user profile (authenticated).

**Request:**
```http
GET /api/profile
Cookie: auth_session=xxx
```

**Response 200 OK:**
```json
{
  "user": {
    "id": "user_xxx",
    "email": "john@example.com",
    "name": "John Doe",
    "bio": "Software developer",
    "location": "Jakarta",
    "website": "https://johndoe.com",
    "avatar": "https://...",
    "provider": "email",
    "emailVerified": true,
    "createdAt": 1704067200
  }
}
```

**Response 401:**
```json
{
  "message": "Unauthorized"
}
```

---

### PUT `/api/profile`

Update current user profile.

**Request:**
```http
PUT /api/profile
Content-Type: application/json
Cookie: auth_session=xxx

{
  "name": "John Updated",
  "bio": "Senior developer",
  "location": "Singapore",
  "website": "https://newsite.com",
  "avatar": "https://cdn.example.com/avatar.jpg"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "user": {
    "id": "user_xxx",
    "name": "John Updated",
    "bio": "Senior developer",
    ...
  }
}
```

**Validation Rules:**
- `name`: min 2 chars, max 100
- `bio`: max 500 chars
- `location`: max 100 chars
- `website`: valid URL format

---

## 📤 Upload Endpoints

### POST `/api/upload/presign`

Get presigned URL untuk direct upload ke R2.

**Request:**
```http
POST /api/upload/presign
Content-Type: application/json
Cookie: auth_session=xxx

{
  "filename": "document.pdf",
  "contentType": "application/pdf",
  "size": 1048576
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "presignedUrl": "https://bucket.r2.cloudflarestorage.com/...",
  "publicUrl": "https://pub-xxx.r2.dev/uploads/document.pdf",
  "key": "uploads/document.pdf",
  "expiresIn": 300
}
```

**Response 400:**
```json
{
  "message": "File too large (max 10MB)"
}
```

---

### POST `/api/upload/image`

Upload image dengan auto-convert ke WebP.

**Request:**
```http
POST /api/upload/image
Content-Type: multipart/form-data
Cookie: auth_session=xxx

file: [binary image data]
type: "avatar" | "post"
```

**Response 200 OK:**
```json
{
  "success": true,
  "url": "https://pub-xxx.r2.dev/uploads/avatar.webp",
  "originalName": "photo.jpg",
  "size": 45000,
  "width": 400,
  "height": 400
}
```

**Supported Formats:**
- image/jpeg
- image/png
- image/gif
- image/webp

**Max Size:** 5MB

---

### DELETE `/api/upload/image`

Delete image dari R2.

**Request:**
```http
DELETE /api/upload/image
Content-Type: application/json
Cookie: auth_session=xxx

{
  "url": "https://pub-xxx.r2.dev/uploads/avatar.webp"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Image deleted"
}
```

---

## 🏥 Health Check

### GET `/api/health`

Check system health dan database connectivity.

**Request:**
```http
GET /api/health
```

**Response 200 OK:**
```json
{
  "status": "ok",
  "db": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

**Response 503 Service Unavailable:**
```json
{
  "status": "error",
  "db": "disconnected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔧 Error Responses

### Standard Error Format

```json
{
  "message": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "additional info"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST (new resource) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Logged in but no permission |
| 404 | Not Found | Resource tidak ada |
| 409 | Conflict | Duplicate data |
| 429 | Too Many Requests | Rate limit |
| 500 | Server Error | Unexpected error |

---

## 📝 Pagination

Untuk endpoints yang return list dengan banyak data:

### Request

```http
GET /api/users?page=2&limit=20
```

### Response

```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### Default Values

- `page`: 1
- `limit`: 20 (max 100)

---

## 🔍 Filtering & Sorting

### Filter

```http
GET /api/users?provider=google&status=active
```

### Sort

```http
GET /api/users?sort=name&order=asc
# atau
GET /api/users?sort=-createdAt (descending)
```

---

## 📊 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/*` | 5 requests | 1 minute |
| `/api/*` (authenticated) | 100 requests | 1 minute |
| `/api/*` (unauthenticated) | 30 requests | 1 minute |

**Response 429:**
```json
{
  "message": "Too many requests",
  "retryAfter": 45
}
```

---

## 🧪 Testing with cURL

### Login

```bash
curl -X POST http://localhost:5173/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}' \
  -c cookies.txt
```

### Get Profile (with cookie)

```bash
curl http://localhost:5173/api/profile \
  -b cookies.txt
```

### Upload Image

```bash
curl -X POST http://localhost:5173/api/upload/image \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/image.jpg" \
  -F "type=avatar" \
  -b cookies.txt
```

---

## 📚 TypeScript Types

```typescript
// src/lib/api/types.ts

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  provider: 'email' | 'google';
  emailVerified: boolean;
  createdAt: number;
}

export interface UploadResponse {
  success: boolean;
  url: string;
  originalName: string;
  size: number;
  width?: number;
  height?: number;
}
```

---

**Note:** API ini dapat berubah. Check changelog untuk updates. 📝
