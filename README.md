# RSMS — Smart Residential Society Management System

A role-governed web platform for managing a residential apartment complex — replacing paper-based
and spreadsheet workflows with a single digital system for residents, management, security, maintenance
staff, and accountants.

**Backend:** NestJS · TypeScript · TypeORM · PostgreSQL · JWT
**Frontend:** Next.js (App Router) · TypeScript · Tailwind CSS · next-intl

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Demo accounts](#demo-accounts)
- [API documentation](#api-documentation)
- [User roles](#user-roles)
- [Documentation](#documentation)
- [Scripts reference](#scripts-reference)

---

## Features

- **Authentication & security** — JWT access/refresh tokens, account lockout after failed logins, e-mail OTP password reset
- **User & resident management** — account provisioning for all roles, resident onboarding, block/flat inventory and occupancy tracking
- **Complaints** — submission, assignment, status lifecycle, work notes, reopen, and summary reporting
- **Visitor management** — pre-registration, gate verification, resident-approved walk-ins, suspicious-visitor flagging
- **Billing & payments** — configurable billing rules, monthly bill generation, simulated payment, PDF receipts, defaulter tracking and reminders
- **Announcements** — society-wide or block/floor-targeted notices with in-app and e-mail delivery
- **Amenities** — slot-based booking with conflict prevention and dues-based restrictions
- **Notifications** — in-app notification feed with unread-count badge
- **Reports & dashboard** — manager/accountant KPIs and PDF/Excel exports
- **Profile management** — self-service profile editing, password change, and profile picture upload for every role
- **Internationalisation** — full English and Bangla UI support

## Tech stack

| Layer | Technology |
|---|---|
| Backend framework | NestJS 11 (TypeScript) |
| ORM / database | TypeORM · PostgreSQL |
| Authentication | JWT (access + rotating refresh tokens) |
| Validation | Zod |
| API docs | Swagger / OpenAPI |
| E-mail | Nodemailer (Gmail SMTP) |
| File uploads | Multer (local disk storage) |
| Frontend framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| State management | Zustand · TanStack Query |
| Internationalisation | next-intl (English, Bangla) |

## Project structure

```
SRE Project/
├── rsms-backend/     NestJS REST API
├── rsms-frontend/    Next.js web app
└── README/           Detailed docs (API reference, SRS PDF)
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A Gmail account with an [app password](https://myaccount.google.com/apppasswords) (for outgoing e-mail)

## Getting started

### 1. Clone and create the database

```bash
git clone <this-repo-url>
cd "SRE Project"
createdb rsms_db
```

### 2. Backend

```bash
cd rsms-backend
npm install
```

Create `rsms-backend/.env`:

```env
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-db-password
DB_NAME=rsms_db

JWT_SECRET=replace-with-a-long-random-string
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=youremail@gmail.com
MAIL_PASS=your-gmail-app-password
MAIL_FROM="RSMS System <youremail@gmail.com>"

FRONTEND_URL=http://localhost:3000
OTP_EXPIRY_MINUTES=10
ACCOUNT_LOCKOUT_ATTEMPTS=3
ACCOUNT_LOCKOUT_DURATION_HOURS=1
LATE_PENALTY_PERCENT=2
BILLING_DAY=1
```

Seed demo data, then start the server:

```bash
npm run seed
npm run start:dev
```

The API is now live at `http://localhost:3001/api/v1`, with interactive docs at
`http://localhost:3001/api/docs`.

### 3. Frontend

```bash
cd ../rsms-frontend
npm install
```

Create `rsms-frontend/.env.local` (or copy `.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=RSMS
```

```bash
npm run dev
```

The app is now live at `http://localhost:3000`.

## Demo accounts

Created by `npm run seed` inside `rsms-backend/`. Password for every account: `Passw0rd!123`

| Role | Email |
|---|---|
| Manager | manager@rsms.com |
| Accountant | accountant@rsms.com |
| Guard | guard1@rsms.com, guard2@rsms.com |
| Maintenance | maintenance1@rsms.com, maintenance2@rsms.com |
| Resident | resident1@rsms.com … resident6@rsms.com |

## API documentation

- **Swagger UI** (interactive, with demo values pre-filled): `http://localhost:3001/api/docs`
- **Full REST reference**: [`README/APIEndpoint.md`](README/APIEndpoint.md)

## User roles

RSMS recognises five roles, enforced by a role-based guard on every protected endpoint:

| Role | Responsibilities |
|---|---|
| **Resident** | Submit complaints, pre-register visitors, view/pay bills, book amenities |
| **Manager** | Manage accounts, residents, blocks/flats, assign complaints, publish announcements, view reports |
| **Guard** | Verify pre-registered visitors, log entries/exits and walk-ins, flag suspicious visitors |
| **Maintenance** | Work assigned complaints, update status, record notes |
| **Accountant** | Configure billing, generate bills, track defaulters, export billing reports |

## Documentation

- [`README/APIEndpoint.md`](README/APIEndpoint.md) — full REST API reference with request/response examples
- [`README/RSMS_Software_Requirements_Specification.pdf`](README/RSMS_Software_Requirements_Specification.pdf) — full SRS: functional/non-functional requirements, data model, architecture


## Scripts reference

| Command (run inside `rsms-backend/`) | Description |
|---|---|
| `npm run start:dev` | Start the API in watch mode |
| `npm run build` | Compile for production |
| `npm run seed` | Populate the database with demo data |
| `npm run test` | Run unit tests |
| `npm run lint` | Lint the codebase |

| Command (run inside `rsms-frontend/`) | Description |
|---|---|
| `npm run dev` | Start the frontend in development mode |
| `npm run build` | Build for production |
| `npm run lint` | Lint the codebase |
