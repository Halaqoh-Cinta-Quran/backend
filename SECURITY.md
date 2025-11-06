# Security Policy

## ⚠️ Important Security Notice

This is an **open-source educational project**. Please be aware of the following security considerations:

## Default Credentials

### Development/Testing Credentials (DO NOT USE IN PRODUCTION!)

The seed file (`prisma/seed.ts`) contains default credentials for development:

| Role     | Email            | Password    |
| -------- | ---------------- | ----------- |
| Admin    | admin@hcq.com    | admin123    |
| Pengajar | pengajar@hcq.com | pengajar123 |
| Pelajar  | pelajar@hcq.com  | pelajar123  |

**⚠️ WARNING**: These are ONLY for development and testing.

### Before Deploying to Production:

1. **Change ALL default passwords immediately**
2. **Set strong environment variables**:
   - `JWT_SECRET`: Use a cryptographically secure random string (64+ characters)
   - `DATABASE_URL`: Use secure production database credentials
   - `SMTP_USER` & `SMTP_PASS`: Use secure email service credentials

3. **Never commit `.env` file** - It's already in `.gitignore`, keep it that way

4. **Use environment-specific configuration**:
   ```bash
   # Production
   NODE_ENV=production
   JWT_SECRET=<STRONG_RANDOM_64_CHAR_STRING>
   DATABASE_URL=<PRODUCTION_DATABASE_URL>
   ```

## Reporting Security Vulnerabilities

If you discover a security vulnerability within this project, please:

1. **DO NOT** open a public issue
2. Send details to the maintainers privately
3. Allow reasonable time for the issue to be addressed before public disclosure

## Security Best Practices

When deploying this application:

- [ ] Change all default passwords
- [ ] Use strong, unique JWT_SECRET
- [ ] Enable HTTPS/TLS in production
- [ ] Use secure database connections
- [ ] Implement rate limiting for auth endpoints
- [ ] Enable CORS with specific origins only
- [ ] Keep dependencies up to date
- [ ] Use environment variables for all sensitive data
- [ ] Enable database backups
- [ ] Implement proper logging and monitoring

## Secure Configuration Example

```env
# .env (NEVER COMMIT THIS FILE!)
NODE_ENV=production
DATABASE_URL="postgresql://user:STRONG_PASSWORD@localhost:5432/hcq_lms?schema=public"
JWT_SECRET="GENERATE_THIS_WITH_openssl_rand_-base64_64"
JWT_EXPIRES_IN="1h"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
```

## Disclaimer

This is an educational project. The developers are not responsible for security issues arising from improper deployment or configuration. Users are responsible for:

- Conducting their own security audits
- Implementing additional security measures as needed
- Keeping the application and dependencies updated
- Following security best practices for their deployment environment

## License

See [LICENSE](LICENSE) file for details.
