# deskbird-users-api

NestJS + TypeORM API that exposes auth and user management for the deskbird users challenge.

## Run locally

```bash
npm install
npm run start:dev
```

## Production hardening gaps

- Pagination/filtering: `/users` always returns the full table; no total count or server-side pagination.
- Validation consistency: create user uses the entity shape with no DTO validation; no global validation pipe; login payload is not validated.
- Security posture: CORS is wide open (`*`); no rate limiting or brute-force protection on login; no `helmet`/security headers; JWTs have no refresh/rotation or revocation; seeded credentials are static.
- Error handling: no global exception filter or consistent error envelope; no input sanitization beyond patch DTOs.
- Ops/observability: missing health/readiness endpoints, structured logging, tracing/metrics, and config schema validation.
- Tests: no unit/e2e coverage for auth/users flows or migrations.
