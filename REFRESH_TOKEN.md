# 🔄 JWT Refresh Token Implementation

## Overview

This API implements a secure JWT refresh token system with the following features:

- **Short-lived Access Tokens** (15 minutes)
- **Long-lived Refresh Tokens** (7 days)
- **Token Rotation** - New refresh token issued on each refresh
- **HTTP-Only Cookies** - Refresh tokens sent via secure cookies
- **Secure Storage** - Refresh tokens stored in database
- **Automatic Cleanup** - Expired tokens are deleted

---

## 🏗️ Architecture

### Token Types

| Token Type    | Lifetime   | Storage           | Transmission     | Purpose                  |
| ------------- | ---------- | ----------------- | ---------------- | ------------------------ |
| Access Token  | 15 minutes | Client Memory     | Response Body    | API authentication       |
| Refresh Token | 7 days     | Database + Cookie | HTTP-Only Cookie | Obtain new access tokens |

### Security Features

- ✅ **Stateful Refresh Tokens** - Stored in database for revocation
- ✅ **Token Rotation** - Old refresh token invalidated after use
- ✅ **HTTP-Only Cookies** - Prevents XSS attacks (JavaScript cannot access)
- ✅ **Secure Flag** - Cookies only sent over HTTPS in production
- ✅ **SameSite Strict** - Prevents CSRF attacks
- ✅ **Cryptographically Secure** - 32 bytes random tokens
- ✅ **Expiration Tracking** - Auto-delete expired tokens
- ✅ **User Association** - Each token linked to specific user

---

## 📊 Database Schema

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}
```

**Key Features:**

- Unique constraint on `token` field
- Indexed for fast lookups
- Cascade delete when user is deleted
- Tracks creation and expiration times

---

## 🔐 API Endpoints

### 1. Login - Get Tokens

**Endpoint:** `POST /api/v1/auth/login`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nama": "User Name",
    "role": "PELAJAR"
  }
}
```

**Cookie Set:**

```
Set-Cookie: refreshToken=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
```

**Cookie Attributes:**

- `HttpOnly` - Cannot be accessed by JavaScript (prevents XSS)
- `Secure` - Only sent over HTTPS in production
- `SameSite=Strict` - Only sent to same-site requests (prevents CSRF)
- `Max-Age=604800` - Expires in 7 days (604800 seconds)
- `Path=/` - Available to all routes

### 2. Refresh - Get New Tokens

**Endpoint:** `POST /api/v1/auth/refresh`

**Headers:**

```
Cookie: refreshToken=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...
```

**Request Body:** None (refresh token read from cookie)

````

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nama": "User Name",
    "role": "PELAJAR"
  }
}
````

**Cookie Set (New Refresh Token):**

```
Set-Cookie: refreshToken=x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
```

**Process:**

1. Read refresh token from HTTP-only cookie
2. Validate refresh token exists in database
3. Check if token is expired
4. Generate new access token (15 min)
5. Generate new refresh token (7 days)
6. Delete old refresh token from database
7. Store new refresh token in database
8. Set new refresh token as HTTP-only cookie
9. Return access token and user info

### 3. Logout - Invalidate Token

**Endpoint:** `POST /api/v1/auth/logout`

**Headers:**

```
Cookie: refreshToken=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...
```

**Request Body:** None (refresh token read from cookie)

**Request:**

```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
}
```

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

**Cookie Cleared:**

```
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/
```

**Process:**

1. Read refresh token from HTTP-only cookie
2. Delete refresh token from database
3. Clear refresh token cookie
4. Access token remains valid until expiry (15 min max)

---

## 💻 Frontend Implementation

### React/Next.js Example with HTTP-Only Cookies

```typescript
// utils/auth.ts
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    nama: string;
    role: string;
  };
}

// Create axios instance with credentials enabled
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: Send cookies with requests
});

export const authService = {
  // Login - receives access token in response, refresh token in cookie
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    // Store access token in memory/state (not localStorage for security)
    return data;
  },

  // Refresh - automatically sends refresh token from cookie
  async refreshToken(): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
    return data;
  },

  // Logout - automatically sends refresh token from cookie
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  // Get current user
  async getCurrentUser(accessToken: string) {
    const { data } = await apiClient.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return data;
  },
};
```

refreshToken: string;
}

// Store tokens in localStorage (or httpOnly cookies in production)
export const setTokens = (tokens: AuthTokens) => {
localStorage.setItem('accessToken', tokens.accessToken);
localStorage.setItem('refreshToken', tokens.refreshToken);
};

export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const clearTokens = () => {
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
};

// Login
export const login = async (email: string, password: string) => {
const response = await axios.post(`${API_URL}/auth/login`, {
email,
password,
});
setTokens(response.data);
return response.data;
};

// Refresh tokens
export const refreshTokens = async () => {
const refreshToken = getRefreshToken();
if (!refreshToken) throw new Error('No refresh token');

const response = await axios.post(`${API_URL}/auth/refresh`, {
refreshToken,
});
setTokens(response.data);
return response.data;
};

// Logout
export const logout = async () => {
const refreshToken = getRefreshToken();
if (refreshToken) {
await axios.post(`${API_URL}/auth/logout`, { refreshToken });
}
clearTokens();
};

````

### Axios Interceptor for Auto-Refresh

```typescript
// utils/axios.ts
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: Send cookies with requests
});

let accessToken: string | null = null;

// Function to set access token
export const setAccessToken = (token: string) => {
  accessToken = token;
};

// Function to get access token
export const getAccessToken = () => accessToken;

// Function to clear access token
export const clearAccessToken = () => {
  accessToken = null;
};

// Request interceptor - Add access token to headers
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh tokens (refresh token sent automatically via cookie)
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Update access token
        setAccessToken(data.accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        clearAccessToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
````

### Usage in Components

```typescript
// pages/login.tsx
import { useState } from 'react';
import { authService } from '@/utils/auth';
import { setAccessToken } from '@/utils/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Login - refresh token stored in HTTP-only cookie automatically
      const data = await authService.login(email, password);

      // Store access token in memory (not localStorage for security)
      setAccessToken(data.accessToken);

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

```typescript
// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { authService } from '@/utils/auth';
import { clearAccessToken } from '@/utils/axios';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Automatically handles token refresh if needed
    api.get('/auth/me')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    clearAccessToken();
    window.location.href = '/login';
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

---

## 🔒 Security Best Practices

### HTTP-Only Cookie Benefits

1. **XSS Protection** - JavaScript cannot access the cookie
2. **Automatic Transmission** - Browser sends cookie automatically
3. **CSRF Protection** - SameSite=Strict prevents cross-site requests
4. **Secure Transmission** - Only sent over HTTPS in production

### Production Recommendations

1. **Use httpOnly Cookies for Refresh Tokens**

   ```typescript
   // Backend: Set refresh token as httpOnly cookie
   res.cookie('refreshToken', token, {
     httpOnly: true,
     secure: true, // HTTPS only
     sameSite: 'strict',
     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
   });
   ```

2. **Implement CSRF Protection**
   - Use CSRF tokens for state-changing operations
   - SameSite cookie attribute

3. **Token Rotation**
   - ✅ Already implemented - new refresh token on each refresh
   - Prevents token reuse attacks

4. **Secure Storage**
   - ❌ Don't store refresh tokens in localStorage (XSS vulnerable)
   - ✅ Use httpOnly cookies (not accessible to JavaScript)
   - ✅ Database storage for revocation capability

5. **Token Cleanup**

   ```typescript
   // Cron job to delete expired tokens
   @Cron('0 0 * * *') // Daily at midnight
   async cleanupExpiredTokens() {
     await this.prisma.refreshToken.deleteMany({
       where: {
         expiresAt: { lt: new Date() }
       }
     });
   }
   ```

6. **Rate Limiting**
   - Limit refresh endpoint to prevent brute force
   - Implement exponential backoff

7. **Monitor Suspicious Activity**
   - Log failed refresh attempts
   - Alert on multiple devices using same token
   - Detect token theft attempts

---

## 🧪 Testing

### Test Scenarios

```bash
# 1. Login and get tokens
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hcq.com","password":"admin123"}'

# Save the tokens from response

# 2. Use access token
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer ACCESS_TOKEN"

# 3. Wait 15+ minutes for access token to expire

# 4. Try using expired access token (should fail)
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer EXPIRED_ACCESS_TOKEN"

# 5. Refresh to get new tokens
curl -X POST http://localhost:4000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"REFRESH_TOKEN"}'

# 6. Try using old refresh token again (should fail)
curl -X POST http://localhost:4000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"OLD_REFRESH_TOKEN"}'

# 7. Logout
curl -X POST http://localhost:4000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"REFRESH_TOKEN"}'
```

---

## 📈 Token Lifecycle

```
┌──────────┐
│  Login   │
└────┬─────┘
     │
     ▼
┌──────────────────────────┐
│ Generate Access Token    │ (15 min)
│ Generate Refresh Token   │ (7 days)
│ Store Refresh in DB      │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Use Access Token for API │
└────┬─────────────────────┘
     │
     ▼ (After 15 min)
┌──────────────────────────┐
│ Access Token Expires     │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Send Refresh Token       │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Validate Refresh Token   │
│ - Check DB existence     │
│ - Check expiration       │
│ - Check user validity    │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Generate New Tokens      │
│ Delete Old Refresh Token │
│ Store New Refresh Token  │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Return New Tokens        │
└──────────────────────────┘
```

---

## ❓ FAQs

**Q: Why 15 minutes for access token?**  
A: Short-lived tokens reduce the window of opportunity if token is stolen.

**Q: Why store refresh tokens in database?**  
A: Enables instant revocation (logout), user session management, and security monitoring.

**Q: What happens if refresh token is stolen?**  
A: Attacker can get new access tokens until:

- Token expires (7 days)
- User logs out
- Admin revokes token

**Q: Can I have multiple active sessions?**  
A: Yes! Each login creates a new refresh token. All stored in database.

**Q: How to implement "Logout from all devices"?**  
A: Delete all refresh tokens for that user:

```typescript
await prisma.refreshToken.deleteMany({
  where: { userId: user.id },
});
```

**Q: Should I invalidate access token on logout?**  
A: Access tokens are stateless (JWT). They remain valid until expiry. This is acceptable since they're short-lived (15 min).

---

## 🎯 Next Steps

### Recommended Enhancements

- [ ] Implement httpOnly cookies for refresh tokens
- [ ] Add CSRF protection
- [ ] Implement rate limiting on refresh endpoint
- [ ] Add cron job for token cleanup
- [ ] Monitor and log security events
- [ ] Implement "Remember Me" functionality
- [ ] Add device/session management UI
- [ ] Implement refresh token families (additional security layer)

---

**Version:** 1.0.0  
**Last Updated:** November 6, 2025  
**Status:** ✅ Production Ready
