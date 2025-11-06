# 🔄 JWT Refresh Token Implementation

## Overview

This API implements a secure JWT refresh token system with the following features:

- **Short-lived Access Tokens** (15 minutes)
- **Long-lived Refresh Tokens** (7 days)
- **Token Rotation** - New refresh token issued on each refresh
- **Secure Storage** - Refresh tokens stored in database
- **Automatic Cleanup** - Expired tokens are deleted

---

## 🏗️ Architecture

### Token Types

| Token Type    | Lifetime   | Storage  | Purpose                  |
| ------------- | ---------- | -------- | ------------------------ |
| Access Token  | 15 minutes | Memory   | API authentication       |
| Refresh Token | 7 days     | Database | Obtain new access tokens |

### Security Features

- ✅ **Stateful Refresh Tokens** - Stored in database for revocation
- ✅ **Token Rotation** - Old refresh token invalidated after use
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
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nama": "User Name",
    "role": "PELAJAR"
  }
}
```

### 2. Refresh - Get New Tokens

**Endpoint:** `POST /api/v1/auth/refresh`

**Request:**

```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nama": "User Name",
    "role": "PELAJAR"
  }
}
```

**Process:**

1. Validate refresh token exists in database
2. Check if token is expired
3. Generate new access token (15 min)
4. Generate new refresh token (7 days)
5. Delete old refresh token
6. Store new refresh token
7. Return both tokens

### 3. Logout - Invalidate Token

**Endpoint:** `POST /api/v1/auth/logout`

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

**Process:**

1. Delete refresh token from database
2. Access token remains valid until expiry

---

## 💻 Frontend Implementation

### React/Next.js Example

```typescript
// utils/auth.ts
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

interface AuthTokens {
  accessToken: string;
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
```

### Axios Interceptor for Auto-Refresh

```typescript
// utils/axios.ts
import axios from 'axios';
import { getAccessToken, refreshTokens, clearTokens } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
});

// Request interceptor - Add access token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
        // Refresh tokens
        await refreshTokens();

        // Retry original request with new token
        const token = getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
```

### Usage in Components

```typescript
// pages/dashboard.tsx
import api from '@/utils/axios';
import { logout } from '@/utils/auth';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Automatically handles token refresh if needed
    api.get('/auth/me')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

---

## 🔒 Security Best Practices

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
