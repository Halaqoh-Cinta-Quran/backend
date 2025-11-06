# 🍪 HTTP-Only Cookie Authentication

## Overview

Implementasi refresh token menggunakan **HTTP-Only Cookies** untuk meningkatkan keamanan aplikasi. Refresh token tidak lagi dikirim di response body, melainkan otomatis diset sebagai cookie oleh server.

---

## 🔒 Keamanan

### Mengapa HTTP-Only Cookies?

| Aspek                      | HTTP-Only Cookie               | localStorage/sessionStorage  |
| -------------------------- | ------------------------------ | ---------------------------- |
| **XSS Protection**         | ✅ JavaScript tidak bisa akses | ❌ Rentan terhadap XSS       |
| **CSRF Protection**        | ✅ SameSite=Strict             | ⚠️ Perlu implementasi manual |
| **Automatic Transmission** | ✅ Browser kirim otomatis      | ❌ Harus manual di code      |
| **Secure**                 | ✅ Hanya HTTPS (production)    | ⚠️ Tergantung implementasi   |

### Cookie Attributes

```
Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
```

- **HttpOnly**: Cookie tidak bisa diakses via JavaScript (`document.cookie`)
- **Secure**: Cookie hanya dikirim via HTTPS (di production)
- **SameSite=Strict**: Cookie hanya dikirim untuk same-site requests (mencegah CSRF)
- **Max-Age=604800**: Cookie expire dalam 7 hari (604800 detik)
- **Path=/**: Cookie tersedia untuk semua routes

---

## 🔄 Flow Authentication

### 1. Login Flow

```
Client                    Server                    Database
  |                         |                          |
  |----POST /auth/login---->|                          |
  |  {email, password}      |                          |
  |                         |----Query User----------->|
  |                         |<-----------------------  |
  |                         |                          |
  |                         |----Create RefreshToken-->|
  |                         |<-----------------------  |
  |                         |                          |
  |<---Response Body--------|                          |
  |  {accessToken, user}    |                          |
  |                         |                          |
  |<---Set-Cookie-----------|                          |
  |  refreshToken=xxx       |                          |
```

### 2. Refresh Flow

```
Client                    Server                    Database
  |                         |                          |
  |----POST /auth/refresh-->|                          |
  |  Cookie: refreshToken   |                          |
  |                         |----Validate Token------->|
  |                         |<-----------------------  |
  |                         |                          |
  |                         |----Delete Old Token----->|
  |                         |----Create New Token----->|
  |                         |<-----------------------  |
  |                         |                          |
  |<---Response Body--------|                          |
  |  {accessToken, user}    |                          |
  |                         |                          |
  |<---Set-Cookie-----------|                          |
  |  refreshToken=new       |                          |
```

### 3. Logout Flow

```
Client                    Server                    Database
  |                         |                          |
  |----POST /auth/logout--->|                          |
  |  Cookie: refreshToken   |                          |
  |                         |----Delete Token--------->|
  |                         |<-----------------------  |
  |                         |                          |
  |<---Response Body--------|                          |
  |  {message: "success"}   |                          |
  |                         |                          |
  |<---Clear-Cookie---------|                          |
  |  refreshToken=          |                          |
```

---

## 💻 Frontend Integration

### Setup Axios dengan Credentials

```typescript
// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  withCredentials: true, // PENTING: Kirim cookies otomatis
});

export default api;
```

### Login

```typescript
// Login - refresh token otomatis di-set sebagai cookie
const response = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});

// Response hanya berisi accessToken dan user
const { accessToken, user } = response.data;

// Simpan accessToken di memory (JANGAN di localStorage)
setAccessToken(accessToken);
```

### Refresh Token

```typescript
// Refresh - refresh token otomatis dikirim dari cookie
const response = await api.post('/auth/refresh');

// Response berisi accessToken baru
const { accessToken, user } = response.data;

// Update accessToken di memory
setAccessToken(accessToken);
```

### Logout

```typescript
// Logout - refresh token otomatis dikirim dari cookie
await api.post('/auth/logout');

// Cookie otomatis di-clear oleh server
clearAccessToken();
```

### Axios Interceptor

```typescript
// utils/axios.ts
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies
});

let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

// Add access token to requests
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh automatically uses cookie
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        setAccessToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
```

---

## 🧪 Testing dengan cURL

### Login

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt \
  -v
```

Cookie akan disimpan di `cookies.txt`.

### Refresh

```bash
curl -X POST http://localhost:4000/api/v1/auth/refresh \
  -b cookies.txt \
  -c cookies.txt \
  -v
```

Cookie baru akan di-update di `cookies.txt`.

### Logout

```bash
curl -X POST http://localhost:4000/api/v1/auth/logout \
  -b cookies.txt \
  -v
```

Cookie akan di-clear.

---

## 🔧 Environment Variables

Pastikan set environment variable di `.env`:

```env
NODE_ENV=production  # Untuk enable Secure flag di cookie
```

Di development, cookie tetap bekerja tanpa HTTPS karena `Secure` flag hanya aktif di production.

---

## ⚠️ Important Notes

### CORS Configuration

CORS harus dikonfigurasi dengan benar untuk cookies:

```typescript
app.enableCors({
  origin: ['http://localhost:3000'], // Frontend URL
  credentials: true, // PENTING: Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Frontend Configuration

Frontend harus menggunakan `withCredentials: true`:

```typescript
axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  withCredentials: true, // WAJIB
});
```

### Browser Considerations

- **Safari**: Memerlukan explicit cookie consent untuk third-party cookies
- **Chrome/Edge**: SameSite=Strict bekerja optimal
- **Firefox**: Mendukung HTTP-only cookies dengan baik

---

## 📚 Resources

- [MDN - HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP - Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Auth0 - Token Best Practices](https://auth0.com/docs/secure/tokens/token-best-practices)
