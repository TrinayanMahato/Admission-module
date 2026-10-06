# Admission Module

A REST API backend for a university admission workflow — applicant registration with email
verification, document upload, department/course management, and automated merit-based
shortlist generation.

Built with Express 5, MongoDB/Mongoose, JWT auth, and Joi request validation.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [How Shortlisting Works](#how-shortlisting-works)
- [Roadmap](#roadmap)

---

## Overview

The module models a full admission cycle across three roles:

| Role | Capabilities |
|---|---|
| **Applicant** | Register (two-step, email-verified), submit an application with documents, check payment status |
| **POC** (department point-of-contact) | View department applications, generate/regenerate merit shortlists, view the final list |
| **Super Admin** | Create admins and POCs, manage departments and courses, browse all applicants |

An application moves through the statuses `submitted` → `shortlisted` → `finalized`, with
timestamps recorded at each transition (`submittedAt`, `shortlistedAt`, `finalizedAt`,
`rejectedAt`).

---

## Tech Stack

- **Runtime:** Node.js, Express 5
- **Database:** MongoDB with Mongoose 9
- **Auth:** JSON Web Tokens, `bcrypt` password hashing
- **Validation:** Joi schemas applied as route middleware
- **File uploads:** Multer (stored on disk, served from `/uploads`)
- **Email:** Nodemailer (registration confirmation codes, shortlist notifications)

---

## Project Structure

```
src/
├── index.js                  # App entry — middleware, route mounting, error handler
├── config/
│   ├── db.js                 # Mongoose connection
│   └── multer.js             # Upload storage + file filtering
├── Models/                   # Mongoose schemas
│   ├── application.js        # The main application document
│   ├── course.js
│   ├── department.js
│   ├── poc.js
│   ├── super_admin.js
│   ├── temp users.js         # Pre-verification signups
│   └── user.js               # Confirmed applicants
├── router/                   # Route definitions (one per role/domain)
│   ├── auth.js
│   ├── applicants.js
│   ├── poc.js
│   ├── super_admin.js
│   └── payment.js
├── controller/               # Request handlers
├── Middlewares/
│   ├── auth.js               # JWT verification (verifyAuth)
│   ├── validator.js          # Joi validation wrapper
│   └── errorHandler.js       # Centralised error responses
├── utils/
│   ├── email.js              # Nodemailer transport + sendMail
│   └── joi/                  # Validation schemas
└── Error_class/
    └── error_class.js        # AppError (message + statusCode)
```

---

## Getting Started

**Prerequisites:** Node.js 18+, a running MongoDB instance.

```bash
git clone https://github.com/TrinayanMahato/Admission-module.git
cd Admission-module
npm install
```

Create a `.env` file (see below), then:

```bash
npm run dev    # nodemon, auto-restart
npm start      # production
```

The server listens on `http://localhost:3000` unless `PORT` says otherwise.

---

## Environment Variables

Create a `.env` in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/admission
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d
EMAIL_USER=<smtp account address>
EMAIL_PASS=<smtp app password>
```

> **Never commit this file.** Add `.env` to `.gitignore` before your next push.

---

## API Reference

All protected routes expect `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Log in as applicant, POC, or super admin; returns a JWT |

### Applicants

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/applicants/register` | — | Step 1: create a pending signup, email a confirmation code |
| `POST` | `/api/applicants/confirm-register` | — | Step 2: verify the code, promote to a real user |
| `POST` | `/api/applicants/submit-application` | ✅ | Submit the application form plus documents (multipart) |

**Document fields accepted** on `submit-application` (one file each):
`marksheet12`, `birthCertificate`, `leavingCertificate`, `aadharCard`,
`profilePhoto`, `signature`, `categoryCertificate`, `disabilityCertificate`.

### POC

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/poc/applications?departmentId=&courseId=` | ✅ | Submitted applications for a department |
| `GET` | `/api/poc/shortlisted?departmentId=&courseId=` | ✅ | Current shortlist |
| `POST` | `/api/poc/generate-shortlist` | ✅ | Generate a merit shortlist for `{ departmentId, courseId, seats }` |
| `POST` | `/api/poc/regenerate-shortlist` | ✅ | Re-run shortlisting (e.g. after withdrawals) |
| `GET` | `/api/poc/final-list?departmentId=&courseId=` | ✅ | Finalised admissions |

### Super Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admin/create/superadmin` | ✅ | Create another super admin / admin |
| `POST` | `/api/admin/create/poc` | ✅ | Create a department POC |
| `GET` | `/api/admin/applicants` | ✅ | List all applicants |
| `GET` | `/api/admin/applicants/:id` | ✅ | One applicant in detail |
| `POST` `GET` | `/api/admin/departments` | ✅ | Create / list departments |
| `GET` `PATCH` `DELETE` | `/api/admin/departments/:id` | ✅ | Read, update, remove a department |
| `POST` `GET` | `/api/admin/courses` | ✅ | Create / list courses |
| `GET` | `/api/admin/courses/by-department/:deptId` | ✅ | Courses in a department |
| `GET` `PATCH` `DELETE` | `/api/admin/courses/:id` | ✅ | Read, update, remove a course |

### Payment

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/payment/check/:userId` | ✅ | Whether the application fee is `paid` or pending |

---

## Data Models

**Application** groups submitted data into sub-documents — `studentDetails`,
`familyDetails`, `educationDetails`, `otherDetails`, `extraCurricular`, and `documents` —
plus `departmentId`, `courseId`, `status`, `fees`, and the lifecycle timestamps.

**Course** carries `name`, `code`, `departmentId`, `duration`, `totalSeats`, `isActive`.
**Department** carries `name`, `code`, `description`, `isActive`.

Registration is deliberately two-phase: a signup first lands in `TempUser` with a
confirmation `code`, and only becomes a `User` once the emailed code is confirmed.

---

## How Shortlisting Works

`POST /api/poc/generate-shortlist` takes `{ departmentId, courseId, seats }` and:

1. Verifies the department and course exist.
2. Loads every application for that department+course with status `submitted`.
3. Reads each applicant's entrance-exam score, checking in order:
   `educationDetails.entranceExam.scores.overall`, then `.scores.totalScore`,
   then `.overallScore`, defaulting to `0`.
4. Sorts by score descending, breaking ties on class-12 percentage descending.
5. Takes the top `seats` applicants, marks them `shortlisted`, stamps `shortlistedAt`,
   and emails them.

Because the score lookup falls back to `0`, applicants with a differently-shaped
`educationDetails` sort to the bottom rather than erroring — worth knowing when you
import data from another source.

---

## Roadmap

- [ ] Add `.env` to `.gitignore` and rotate the previously committed secrets
- [ ] Payment gateway integration (the current endpoint only reads a stored status)
- [ ] Automated tests — `npm test` is still the default placeholder
- [ ] Move uploads to object storage instead of the local `src/public/uploads` directory
- [ ] Add a `LICENSE` file
