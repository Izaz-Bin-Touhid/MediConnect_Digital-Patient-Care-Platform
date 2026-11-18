# MediConnect: Digital Patient Care Platform

Backend API built with NestJS, TypeORM and PostgreSQL.

## Local setup

Run commands from this folder, where the NestJS `package.json` is located.

1. Install dependencies with `npm install`.
2. Create a PostgreSQL database using pgAdmin.
3. Copy `.env.example` to `.env` and enter your database settings and a JWT secret.
4. Start the server:

```powershell
npm run start:dev
```

The API runs at `http://localhost:3000` by default. TypeORM creates the tables from the entities during development.

## Patient APIs

- Registration, login, profile management and password change.
- Draft case creation, listing, updates and deletion.
- Test decisions and diagnostic center selection.
- Viewing advice, verified and forwarded reports, follow-ups and sent reminders.
- List pagination with `page` and `limit`.

Send the login token as a Bearer Token in Postman for protected requests. Consultation payment is pending.

## Build

```powershell
npm run build
```
