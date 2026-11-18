# MediConnect: Digital Patient Care Platform

Patient, Doctor and Admin backend built with NestJS, TypeORM and PostgreSQL.

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

Patient-owned entities are PATIENT, PATIENT_CASE and PAYMENT. The PAYMENT entity is present; payment APIs are pending. Doctor profile, advice and test-request CRUD, ownership checks and Admin verification are integrated. Diagnostic center and follow-up workflows are pending.

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

## Doctor and Admin integration

- Patient login remains `POST /auth/login` with `patientId` and `password`.
- Doctor login is `POST /auth/doctor/login` with `email` and `password`.
- Admin login is `POST /auth/admin/login` with `email` and `password`.
- Patient login returns its JWT in `data`; Doctor and Admin login return it in `data.access_token`.
- Doctor registration is `POST /doctors`. Profile, advice and test-request APIs are under `/doctors` and require the logged-in Doctor's own records.
- Doctors submit profiles through `POST /doctors/profiles/:id/submit`. Admins review them through `PATCH /admins/doctor-profiles/:id/verification`.
- `GET /doctors/verified` lists approved doctors. `GET /auth/me` returns the logged-in account.
- Admin account creation requires an existing Admin token. The initial Admin account must be provisioned separately.
- Swagger UI is available at `http://localhost:3000/api`.
