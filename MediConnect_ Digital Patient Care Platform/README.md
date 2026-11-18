# MediConnect: Digital Patient Care Platform

Patient backend built with NestJS, TypeORM and PostgreSQL.

## Local setup

Run commands from this folder, where the NestJS `package.json` is located.

1. Run `npm install`.
2. Create a PostgreSQL database using pgAdmin.
3. Copy `.env.example` to `.env` and enter your database settings and JWT secret.
4. Run `npm run start:dev`.

The API runs at `http://localhost:3000` by default.

## Patient APIs

- `POST /auth/registration`
- `POST /auth/login`
- `PATCH /auth/change-password`
- `GET /patients/:id`
- `PATCH /patients/updatePatientPartially/:id`
- `DELETE /patients/:id`
- `POST /patient-cases`
- `GET /patient-cases?page=1&limit=10`
- `GET /patient-cases/:id`
- `PATCH /patient-cases/:id`
- `DELETE /patient-cases/:id`

Protected APIs require a Bearer Token. A patient can access only their own profile and cases. Only draft cases can be updated or deleted.

Patient-owned entities are PATIENT, PATIENT_CASE and PAYMENT. The PAYMENT entity is present; payment APIs are pending. The Doctor scaffold already supplied by the team is retained for the Case foreign key. Other role workflows will be connected after the team merges its code.

## Build

```powershell
npm run build
```

## Folder structure

```text
src/
  main.ts
  app.module.ts
  app.controller.ts
  app.service.ts
  config/
    environment.module.ts
  common/
    guards/
      jwtGuards.ts
      roles.guard.ts
    dtos/
      pagination.dto.ts
  database/
    database.module.ts
  auth/
    dtos/
    auth.controller.ts
    auth.module.ts
    auth.service.ts
    jwtStrategy.strategy.ts
  patient/
    dtos/
    entities/
    patients.controller.ts
    patients.module.ts
    patients.service.ts
    patient-cases.controller.ts
    patient-cases.module.ts
    patient-cases.service.ts
    payments.module.ts
  doctors/
    dtos/
    entities/
    doctors.controller.ts
    doctors.module.ts
    doctors.service.ts
```

Patient profile, case and payment files are together in `patient`. Authentication stays in `auth`, and shared guards and pagination stay in `common`. Environment loading is in `config`, and the existing TypeORM connection is in `database`.
