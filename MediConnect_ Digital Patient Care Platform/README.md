<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Coordinator API

Copy `.env.example` to `.env`, configure a local PostgreSQL database and set
`JWT_SECRET` to a random secret of at least 32 bytes. Create the PostgreSQL
database, then build and run the migrations before starting the app.

```powershell
npm.cmd run build
npm.cmd run migration:run
npm.cmd run start:dev
```

Swagger UI is available at `/api/docs` and `/docs`. Use **Authorize** with an
access token for protected routes. Add `X-Response-Envelope: true` for
`{ "success": true, "message": "...", "data": ... }` with pagination metadata
on list responses. Normal responses retain their original shape. Response
headers include `X-Request-Id` and, for handler execution, `Server-Timing`.

If your existing database was created with schema synchronization, first run
`npm.cmd exec -- typeorm schema:log -d dist/database/data-source.js` against it.
If TypeORM reports that the schema already matches and only the initial
migration is pending, record that migration with
`npm.cmd run migration:run -- --fake`. If there are schema differences, use a
fresh demo database or review an upgrade migration for the existing data.

The `AUDIT_LOG` table records inserts, updates and deletes on Coordinator
workflow tables. Changes and audit rows commit or roll back together.
Audit snapshots include record identifiers and workflow fields. They omit
passwords, contact details, free-text notes and medical report contents.
Application and Admin approval writes can be located by their response
`X-Request-Id` value.

Configure `SMTP_HOST`, `SMTP_PORT`, `MAIL_FROM` and, if the SMTP server needs
authentication, `SMTP_USER` and `SMTP_PASSWORD`. Coordinator approval sends
an approval notice after the account transaction commits. The notice never
includes the password. A delivery failure is logged, and Admin can still
give the credentials to the coordinator. Use a sandbox mailbox for demos.

For a local demo, populate `ADMIN`, `DOCTOR`, `PATIENT` and
`DIAGNOSTIC_CENTER` with test accounts before signing in. Store lowercase
emails and bcrypt hashes in their `password` columns. For the case workflow,
also populate `PATIENT_CASE` and its `PAYMENT` with
`payment_status = 'paid'`. The case's `doctor_id` uses the existing doctor's
ID as a string.

Use `POST /auth/login` with `email`, `password` and `role`.
Coordinator is the default role. Send the returned access token as
`Authorization: Bearer <token>` on protected routes. All paths in the table
are relative to `/coordinator`. Lists accept `page` and `limit`.

| Role | Workflow |
| --- | --- |
| Coordinator applicant | Submit `fullName` and `phone` to `POST /applications`. The response includes an `applicationId`. |
| Admin | List pending applications with `GET /applications`. Approve one with `POST /applications/:applicationId/approve` using the assigned `email`, `password` and `staffId`. Give the credentials to the coordinator. Assign a paid case with `PATCH /cases/:caseId/assignment` using `coordinatorId`. |
| Coordinator | After login, update `fullName`, `phone` or `email` at `PATCH /profile`. An updated email becomes the login email. |
| Doctor | Submit `testType` and `notes` to `POST /cases/:caseId/test-requests`. Read the decision and forwarded report at `GET /test-requests/:requestId`. |
| Coordinator | List assigned tasks at `GET /tasks`. Record contact at `POST /tasks/:taskId/activities` and set `decision` to `accepted` or `declined` at `PATCH /tasks/:taskId/decision`. |
| Patient | Find the request and center via `GET /patient/test-requests` and `GET /diagnostic-centers`. Select the center at `PATCH /test-requests/:requestId/center` using `centerId`. |
| Coordinator | Arrange the accepted test at `PATCH /tasks/:taskId/arrange`. Read or review the report at `GET` or `PATCH /tasks/:taskId/report` using `checkStatus` for review. Forward a verified report at `PATCH /tasks/:taskId/report/forward`. |
| Diagnostic center | List arranged requests at `GET /center/test-requests`. Submit `result` and a `reportFile` reference to `POST /test-requests/:requestId/report`. |
| Coordinator | Create a follow-up at `POST /follow-ups` with `caseId`, `followupDate` (YYYY-MM-DD), `followupTime` (HH:mm) and `note`. Create a reminder under `/follow-ups/:followupId/reminders`, then update its `responseStatus` to `sent` to publish it to the patient's dashboard. |
| Patient | Read published reminders at `GET /patient/reminders`. |

Coordinators can change their password at `PATCH /auth/profile/password` and
log out at `POST /auth/logout`. Both revoke existing sessions for that account.
The original `/coordinator` authentication URLs are supported as aliases.
Diagnostic report submission stores the report reference supplied by the
center. Reminder publishing is in-app.

## Admin API

Sign in with `POST /auth/login` and `role: "admin"`. Use the returned Bearer
token for `GET /admins/me`, `PATCH /admins/me`, `PATCH /admins/me/password`
and `POST /admins`. The first Admin must already exist in the shared
`ADMIN` table. Admin profile fields in request and response bodies use
`full_name`, `email` and `phone`.

Use `GET /admins/doctor-profiles` to list profiles by verification status,
and `PATCH /admins/doctor-profiles/:id/verification` to approve or reject a
pending profile. Run the migrations before using these endpoints.

Applicants submit `fullName` and `phone` to
`POST /coordinator/applications`. Admins can then:

- List pending applications with `GET /admins/coordinator-applications`.
- Approve one with `POST /admins/coordinator-applications/:applicationId/approve`
  and the assigned `email`, `password` and `staffId`. Give the credentials to
  the coordinator, who can use `POST /auth/login` with `role: "coordinator"`.
- List accounts with `GET /admins/coordinators`.
- Assign a paid case with `PATCH /admins/cases/:caseId/coordinator` and
  `coordinatorId`. The coordinator can then see it at `GET /coordinator/cases`.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Observability

In production applications, observability is essential for understanding how your system behaves, detecting issues early, and maintaining reliable performance.

[NestJS Observe](https://observe.nestjs.com) automatically instruments your NestJS application, giving you deep visibility into your system with minimal setup:

- **Distributed tracing:** Follow requests across services and understand how they flow through your system.
- **Waterfall analysis:** Visualize request execution and identify slow operations, bottlenecks, and unexpected delays.
- **Performance analysis:** Analyze application performance in real time and quickly pinpoint areas that need optimization.
- **Metrics:** Track key application and infrastructure metrics to understand system health and performance trends.
- **Logging:** Centralize and correlate logs with traces and other telemetry to make debugging easier.
- **Error tracking:** Detect errors quickly and investigate their root causes with the surrounding context.
- **SLA monitoring:** Track service-level objectives and identify when your application is approaching or exceeding defined thresholds.
- **Alarms and alerts:** Set up alerts for critical errors, performance degradation, SLA violations, and other anomalies so your team can react quickly.

To add it to this project, run this and approve the code it prints at [observe.nestjs.com/link](https://observe.nestjs.com/link) - signing up for free if you have no account:

```bash
$ npx @nestjs/observe link
```

It installs `@nestjs/observe`, wires it into `AppModule` and `main.ts`, and writes the app key and secret into `.env`, which every `nest start` script (`start`, `start:dev`, `start:debug`) then loads. In production, set `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` in the environment instead.

Or do it by hand:

```bash
$ npm install @nestjs/observe
```

Then follow the [setup guide](https://docs.nestjs.com/observability/sdk) - it takes a single import and an app key.

The free plan needs no payment details and covers 300,000 events a month. You can also browse the [live demo](https://www.observe-demo.nestjs.com/dashboard) first - the whole dashboard over a busy service's data, with nothing to install.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Auto-instrument your application with [NestJS Observe](https://observe.nestjs.com). Distributed tracing, metrics, and logging made easy. Error tracking and performance monitoring for your NestJS applications.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
