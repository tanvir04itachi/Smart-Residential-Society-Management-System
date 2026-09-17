# RSMS API Endpoint Reference

Base URL: `http://localhost:3001/api/v1`
Swagger UI: `http://localhost:3001/api/docs` (interactive, with demo values pre-filled)

## Authentication

All endpoints require a `Authorization: Bearer <accessToken>` header **except** the ones marked
`Public` below. Get a token from `POST /auth/login`, then use it in every subsequent request.

Standard error response shape (applies to every endpoint):

```json
{
  "statusCode": 400,
  "message": "Human readable message",
  "errors": { "fieldName": ["error message"] },
  "timestamp": "2026-09-17T10:00:00.000Z",
  "path": "/api/v1/auth/login"
}
```

## Demo accounts (from the seed script)

Run `npm run seed` inside `rsms-backend/` to populate these. Password for every account: `Passw0rd!123`

| Role | Email |
|---|---|
| MANAGER | manager@rsms.com |
| ACCOUNTANT | accountant@rsms.com |
| GUARD | guard1@rsms.com, guard2@rsms.com |
| MAINTENANCE | maintenance1@rsms.com, maintenance2@rsms.com |
| RESIDENT | resident1@rsms.com ... resident6@rsms.com |

## Table of Contents

1. [Auth](#1-auth)
2. [Users](#2-users)
3. [Residents](#3-residents)
4. [Blocks](#4-blocks)
5. [Flats](#5-flats)
6. [Complaints](#6-complaints)
7. [Visitors](#7-visitors)
8. [Billing](#8-billing)
9. [Announcements](#9-announcements)
10. [Amenities](#10-amenities)
11. [Notifications](#11-notifications)
12. [Reports](#12-reports)

---

## 1. Auth
Base path: `/auth`

### POST /auth/login — `Public`
Login with email + password.

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| email | string (email) | yes | `manager@rsms.com` |
| password | string | yes | `Passw0rd!123` |

```json
{ "email": "manager@rsms.com", "password": "Passw0rd!123" }
```

**Response `201`**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "5b2a6e2e-8c9a-4b6d-9b34-1a2b3c4d5e6f",
  "user": {
    "id": "d1d9ed75-82e0-4133-a48d-b7fce86725ef",
    "fullName": "Ayesha Rahman",
    "email": "manager@rsms.com",
    "role": "MANAGER"
  }
}
```
Errors: `401` invalid credentials, `403` account locked (3 failed attempts → 1 hour lock) or deactivated.

### POST /auth/logout — auth required
Revokes a refresh token.

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| refreshToken | string | yes | `5b2a6e2e-8c9a-4b6d-9b34-1a2b3c4d5e6f` |

**Response `201`**: `{ "success": true }`

### POST /auth/refresh — `Public`
Exchanges a valid, unrevoked refresh token for a new access + refresh token pair (rotation).

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| refreshToken | string | yes | `5b2a6e2e-8c9a-4b6d-9b34-1a2b3c4d5e6f` |

**Response `201`**
```json
{ "accessToken": "eyJhbGciOiJIUzI1NiIs...", "refreshToken": "9f8e7d6c-...-newtoken" }
```

### POST /auth/forgot-password — `Public`
Sends a 6-digit OTP to the user's email (valid 10 minutes). Always returns success to avoid leaking which emails exist.

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| email | string (email) | yes | `resident1@rsms.com` |

**Response `201`**: `{ "success": true }`

### POST /auth/verify-otp — `Public`
Checks whether an OTP is valid/unused/unexpired without consuming it.

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| email | string (email) | yes | `resident1@rsms.com` |
| otp | string (6 digits) | yes | `482913` |

**Response `201`**: `{ "valid": true }`
**Response `400`**: invalid or expired OTP

### POST /auth/reset-password — `Public`
Sets a new password using a valid OTP, then revokes all of the user's refresh tokens.

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| email | string (email) | yes | `resident1@rsms.com` |
| otp | string (6 digits) | yes | `482913` |
| newPassword | string (8-72 chars) | yes | `NewPassw0rd!456` |

**Response `201`**: `{ "success": true }`

### GET /auth/me — auth required
Returns the profile of the currently authenticated user.

**Response `200`**
```json
{
  "id": "d1d9ed75-82e0-4133-a48d-b7fce86725ef",
  "fullName": "Ayesha Rahman",
  "email": "manager@rsms.com",
  "role": "MANAGER",
  "phone": "+8801710000001",
  "lastLoginAt": "2026-09-17T02:11:47.240Z"
}
```

---

## 2. Users
Base path: `/users` — all require `MANAGER` role unless noted.

### GET /users — `MANAGER`
List all users, paginated and filterable.

**Query params**
| Param | Type | Required | Example |
|---|---|---|---|
| page | number | no | `1` |
| limit | number | no | `20` |
| role | enum: `RESIDENT`\|`MANAGER`\|`GUARD`\|`MAINTENANCE`\|`ACCOUNTANT` | no | `RESIDENT` |

**Response `200`**
```json
{
  "data": [ { "id": "...", "fullName": "Tanvir Ahmed", "email": "resident1@rsms.com", "role": "RESIDENT", "isActive": true } ],
  "meta": { "total": 12, "page": 1, "limit": 20, "totalPages": 1 }
}
```

### POST /users — `MANAGER`
Creates a user of any role. If `password` is omitted, a random one is generated and emailed via the welcome email.

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| fullName | string (2-100) | yes | `Nasrin Sultana` |
| email | string (email) | yes | `guard3@rsms.com` |
| role | enum | yes | `GUARD` |
| phone | string | no | `+8801710000009` |
| password | string (8-72) | no | `Passw0rd!123` |

```json
{
  "fullName": "Nasrin Sultana",
  "email": "guard3@rsms.com",
  "role": "GUARD",
  "phone": "+8801710000009",
  "password": "Passw0rd!123"
}
```

**Response `201`**: the created user (without `passwordHash`).

### PATCH /users/me/password — any authenticated user
Change your own password.

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| currentPassword | string | yes | `Passw0rd!123` |
| newPassword | string (8-72) | yes | `NewPassw0rd!456` |

**Response `200`**: `{ "success": true }`

### GET /users/:id — `MANAGER`
**Path param**: `id` (uuid) — example `d1d9ed75-82e0-4133-a48d-b7fce86725ef`

### PATCH /users/:id — `MANAGER`
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| fullName | string (2-100) | no | `Nasrin Sultana Rimi` |
| phone | string | no | `+8801710000010` |

### PATCH /users/:id/deactivate — `MANAGER`
Sets `isActive=false`. No body. Returns `{ "success": true }`.

### PATCH /users/:id/activate — `MANAGER`
Sets `isActive=true` and clears lockout state. No body. Returns `{ "success": true }`.

---

## 3. Residents
Base path: `/residents`

### GET /residents — `MANAGER`
Lists all residents with their user and flat/block relations.

### POST /residents — `MANAGER`
Onboards a resident: creates a `User` (role `RESIDENT`) and a `Resident` profile in one transaction, then emails the welcome message.

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| fullName | string (2-100) | yes | `Tanvir Ahmed` |
| email | string (email) | yes | `resident7@rsms.com` |
| phone | string | no | `+8801710000011` |
| password | string (8-72) | no | `Passw0rd!123` |
| flatId | string (uuid) | no | `cbf26697-85f1-428f-93d3-39a3b54459ca` |
| type | enum: `OWNER`\|`TENANT` | yes | `OWNER` |
| emergencyContact | string | no | `+8801910000000` |
| familyMembers | array of objects | no | `[{ "name": "Rina Ahmed", "relation": "Spouse" }]` |
| moveInDate | string (date) | no | `2026-01-15` |

```json
{
  "fullName": "Tanvir Ahmed",
  "email": "resident7@rsms.com",
  "phone": "+8801710000011",
  "password": "Passw0rd!123",
  "flatId": "cbf26697-85f1-428f-93d3-39a3b54459ca",
  "type": "OWNER",
  "emergencyContact": "+8801910000000",
  "familyMembers": [{ "name": "Rina Ahmed", "relation": "Spouse" }],
  "moveInDate": "2026-01-15"
}
```

### GET /residents/flat/:flatId/history — `MANAGER`
Occupancy history for a flat. **Path param**: `flatId` (uuid).

### GET /residents/:id — `MANAGER`, or `RESIDENT` (own record only)
**Path param**: `id` (uuid) — example `f461022c-164b-49d2-8504-57047a3b9836`

### PATCH /residents/:id — `MANAGER`, or `RESIDENT` (own record only)
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| emergencyContact | string | no | `+8801910000099` |
| familyMembers | array of objects | no | `[{ "name": "Rina Ahmed", "relation": "Spouse" }]` |
| isActive | boolean | no | `true` |

---

## 4. Blocks
Base path: `/blocks` — `MANAGER` only.

### GET /blocks
Lists all blocks.

### POST /blocks
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| name | string (1-50) | yes | `D` |
| description | string (max 500) | no | `Block D - new wing` |

```json
{ "name": "D", "description": "Block D - new wing" }
```

---

## 5. Flats
Base path: `/flats` — `MANAGER` only, except `GET /flats` which also allows `GUARD` (needed to pick a destination flat when logging a walk-in visitor at the gate).

### GET /flats — `MANAGER`, `GUARD`
Lists all flats with their block.

### POST /flats
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| blockId | string (uuid) | yes | `7d009fe7-21cd-405c-a886-99bee9f2ba5f` |
| floorNumber | number | yes | `4` |
| flatNumber | string (1-20) | yes | `A-401` |
| area | number | no | `1350` |
| flatType | string | no | `3BHK` |

```json
{
  "blockId": "7d009fe7-21cd-405c-a886-99bee9f2ba5f",
  "floorNumber": 4,
  "flatNumber": "A-401",
  "area": 1350,
  "flatType": "3BHK"
}
```

### GET /flats/:id
Flat detail + current residents. **Path param**: `id` (uuid).

### PATCH /flats/:id/assign
Assigns a resident to the flat (sets `isOccupied=true`, resident's `flatId`/`moveInDate`).

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| residentId | string (uuid) | yes | `f461022c-164b-49d2-8504-57047a3b9836` |

### PATCH /flats/:id/vacate
Marks the flat vacant and clears `flatId`/sets `moveOutDate` on any resident currently there. No body.

---

## 6. Complaints
Base path: `/complaints`

### GET /complaints — `MANAGER`, `MAINTENANCE`
**Query params**
| Param | Type | Required | Example |
|---|---|---|---|
| page | number | no | `1` |
| limit | number | no | `20` |
| status | enum: `PENDING`\|`ASSIGNED`\|`IN_PROGRESS`\|`RESOLVED`\|`CLOSED`\|`REOPENED` | no | `PENDING` |
| category | enum: `ELECTRICAL`\|`PLUMBING`\|`CIVIL`\|`PEST_CONTROL`\|`OTHER` | no | `PLUMBING` |

### POST /complaints — `RESIDENT`
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| title | string (5-100) | yes | `Leaking kitchen faucet` |
| description | string (10-1000) | yes | `The kitchen faucet has been leaking for two days.` |
| category | enum | yes | `PLUMBING` |
| priority | enum: `LOW`\|`MEDIUM`\|`HIGH`\|`CRITICAL` (default `MEDIUM`) | no | `HIGH` |

```json
{
  "title": "Leaking kitchen faucet",
  "description": "The kitchen faucet has been leaking for two days.",
  "category": "PLUMBING",
  "priority": "HIGH"
}
```

### GET /complaints/my — `RESIDENT`
Your own complaints.

### GET /complaints/assigned — `MAINTENANCE`
Complaints assigned to you.

### GET /complaints/report — `MANAGER`
Summary counts grouped by status, category and assigned staff.

**Query params**
| Param | Type | Required | Example |
|---|---|---|---|
| from | string (date) | no | `2026-09-01` |
| to | string (date) | no | `2026-09-30` |

### GET /complaints/:id — `MANAGER`, `RESIDENT` (own), `MAINTENANCE` (if assigned)
**Path param**: `id` (uuid) — example `e4690af7-0af7-4918-af13-faf4f5b4a74d`

### PATCH /complaints/:id/assign — `MANAGER`
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| assignedToId | string (uuid, must be a `MAINTENANCE` user) | yes | `6a06ec1c-1d2c-4d9b-889d-cff339093219` |

### PATCH /complaints/:id/status — `MAINTENANCE`, `MANAGER`
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| status | enum | yes | `IN_PROGRESS` |

### PATCH /complaints/:id/reopen — `RESIDENT`
Reopens a `RESOLVED` or `CLOSED` complaint you own. No body.

### PATCH /complaints/:id/notes — `MAINTENANCE`
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| staffNotes | string (1-1000) | yes | `Replaced the faucet washer, tested for leaks.` |

---

## 7. Visitors
Base path: `/visitors`

### POST /visitors/pre-register — `RESIDENT`
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| visitorName | string (2-100) | yes | `Dr. Sharmin Akter` |
| phone | string | no | `+8801912345678` |
| purpose | string (max 200) | no | `Family visit` |
| visitorType | enum: `REGULAR`\|`DELIVERY`\|`SUSPICIOUS` (default `REGULAR`) | no | `REGULAR` |
| expectedArrival | string (ISO datetime) | no | `2026-09-20T10:00:00.000Z` |

```json
{
  "visitorName": "Dr. Sharmin Akter",
  "phone": "+8801912345678",
  "purpose": "Family visit",
  "visitorType": "REGULAR",
  "expectedArrival": "2026-09-20T10:00:00.000Z"
}
```

### GET /visitors/my — `RESIDENT`
Your pre-registered visitors.

### GET /visitors/search — `GUARD`
**Query params**
| Param | Type | Required | Example |
|---|---|---|---|
| q | string | yes | `Sharmin` |

### POST /visitors/walk-in — `GUARD`
Logs an unregistered visitor at the gate and notifies every resident of the target flat for approval.

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| visitorName | string (2-100) | yes | `Courier - Pathao` |
| phone | string | no | `+8801812345678` |
| purpose | string (max 200) | no | `Package delivery` |
| visitorType | enum (default `REGULAR`) | no | `DELIVERY` |
| flatId | string (uuid) | yes | `cbf26697-85f1-428f-93d3-39a3b54459ca` |

```json
{
  "visitorName": "Courier - Pathao",
  "phone": "+8801812345678",
  "purpose": "Package delivery",
  "visitorType": "DELIVERY",
  "flatId": "cbf26697-85f1-428f-93d3-39a3b54459ca"
}
```

### GET /visitors/log — `MANAGER`, `GUARD`
Full visitor log.

### GET /visitors/deliveries — `GUARD`, `MANAGER`
Delivery-only visitor log.

### POST /visitors/:id/entry — `GUARD`
Logs entry time and marks `APPROVED`. **Path param**: `id` (uuid). No body.

### POST /visitors/:id/exit — `GUARD`
Logs exit time and marks `EXITED`. No body.

### POST /visitors/:id/approve — `RESIDENT`
Approves a walk-in for your flat. No body.

### POST /visitors/:id/deny — `RESIDENT`
Denies a walk-in for your flat. No body.

### PATCH /visitors/:id/flag — `GUARD`
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| reason | string (max 500) | no | `Could not verify identity at the gate` |

---

## 8. Billing
Base path: `/billing`

### GET /billing/config — `ACCOUNTANT`, `MANAGER`
Lists all billing configs (one per flat type).

### POST /billing/config — `ACCOUNTANT`
Creates or updates (upsert by `flatType`) the billing config.

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| flatType | string | yes | `2BHK` |
| baseAmount | number (> 0) | yes | `5000` |
| extraVehicleCharge | number (default 0) | no | `500` |
| commercialSurcharge | number (default 0) | no | `0` |
| latePenaltyPercent | number 0-100 (default 2) | no | `2` |
| billingDay | number 1-28 (default 1) | no | `1` |

```json
{
  "flatType": "2BHK",
  "baseAmount": 5000,
  "extraVehicleCharge": 500,
  "commercialSurcharge": 0,
  "latePenaltyPercent": 2,
  "billingDay": 1
}
```

### POST /billing/generate — `ACCOUNTANT`
Generates one bill per active resident whose flat's `flatType` has a matching config, for the given month/year (skips residents who already have a bill for that period).

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| month | number 1-12 | yes | `9` |
| year | number | yes | `2026` |

```json
{ "month": 9, "year": 2026 }
```

### GET /billing/bills — `ACCOUNTANT`
**Query params**
| Param | Type | Required | Example |
|---|---|---|---|
| page | number | no | `1` |
| limit | number | no | `20` |
| status | enum: `PENDING`\|`PAID`\|`OVERDUE`\|`PARTIAL` | no | `PENDING` |

### GET /billing/bills/my — `RESIDENT`
Your own bills.

### GET /billing/defaulters — `ACCOUNTANT`, `MANAGER`
Bills past due date that are not paid; auto-flips their status to `OVERDUE`.

### POST /billing/reminders — `ACCOUNTANT`
Sends a reminder notification + email to every resident with an overdue bill. No body.

### GET /billing/dashboard — `ACCOUNTANT`
Financial summary.

**Response `200`**
```json
{ "totalBilled": 18600, "totalCollected": 5000, "pendingCount": 1, "overdueCount": 1 }
```

### GET /billing/bills/:id — `ACCOUNTANT`, `RESIDENT` (own)
**Path param**: `id` (uuid) — example `cd6f464d-a890-4cde-86c8-0d8328729722`

### POST /billing/bills/:id/pay — `RESIDENT`
Simulates a dummy payment — no real payment gateway is called; any `transactionRef` string is accepted.

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| method | enum: `BKASH`\|`NAGAD`\|`CARD` | yes | `BKASH` |
| transactionRef | string (1-100) | yes | `DEMO-TXN-0002` |

```json
{ "method": "BKASH", "transactionRef": "DEMO-TXN-0002" }
```

### GET /billing/bills/:id/receipt — `RESIDENT`
Downloads a PDF receipt for a paid bill (`application/pdf`).

---

## 9. Announcements
Base path: `/announcements`

### GET /announcements — any authenticated user
Managers/staff see all announcements; residents see only `ALL` scope plus announcements targeted at their block/floor.

### POST /announcements — `MANAGER`
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| title | string (3-150) | yes | `Block A lift servicing` |
| body | string (3-5000) | yes | `The lift in Block A will be under maintenance tomorrow from 9am-1pm.` |
| scope | enum: `ALL`\|`BLOCK`\|`FLOOR` | yes | `BLOCK` |
| attachmentUrl | string (url) | no | `https://example.com/notices/lift-servicing.pdf` |
| targets | array of `{ blockId?: uuid, floorNumber?: number }` (required when scope isn't `ALL`) | no | `[{ "blockId": "7d009fe7-21cd-405c-a886-99bee9f2ba5f" }]` |

```json
{
  "title": "Block A lift servicing",
  "body": "The lift in Block A will be under maintenance tomorrow from 9am-1pm.",
  "scope": "BLOCK",
  "attachmentUrl": "https://example.com/notices/lift-servicing.pdf",
  "targets": [{ "blockId": "7d009fe7-21cd-405c-a886-99bee9f2ba5f" }]
}
```

### GET /announcements/:id — any authenticated user
**Path param**: `id` (uuid) — example `ad1d0119-671a-45f7-bc64-1229319520b1`

### PATCH /announcements/:id — `MANAGER`
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| title | string (3-150) | no | `Water supply maintenance (rescheduled)` |
| body | string (3-5000) | no | `Water supply interruption moved to Saturday 10am-2pm.` |
| attachmentUrl | string (url) | no | `https://example.com/notices/updated.pdf` |

### DELETE /announcements/:id — `MANAGER`
No body.

---

## 10. Amenities
Base path: `/amenities`

### GET /amenities — any authenticated user
Lists active amenities with their slots.

### POST /amenities — `MANAGER`
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| name | string (2-100) | yes | `Swimming Pool` |
| description | string (max 500) | no | `Rooftop swimming pool, 6am-9pm` |
| capacity | number | no | `20` |
| location | string (max 100) | no | `Rooftop` |
| slots | array of `{ dayOfWeek: 0-6, startTime: "HH:mm", endTime: "HH:mm" }` | no | see below |

```json
{
  "name": "Swimming Pool",
  "description": "Rooftop swimming pool, 6am-9pm",
  "capacity": 20,
  "location": "Rooftop",
  "slots": [
    { "dayOfWeek": 6, "startTime": "08:00", "endTime": "09:00" },
    { "dayOfWeek": 6, "startTime": "09:00", "endTime": "10:00" }
  ]
}
```

### GET /amenities/bookings/my — `RESIDENT`
Your bookings.

### GET /amenities/bookings — `MANAGER`
All bookings.

### PATCH /amenities/bookings/:id/cancel — `RESIDENT`
**Path param**: `id` (booking uuid). No body.

### PATCH /amenities/:id — `MANAGER`
**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| name | string (2-100) | no | `Swimming Pool` |
| description | string (max 500) | no | `Rooftop swimming pool, 6am-9pm` |
| capacity | number | no | `25` |
| location | string (max 100) | no | `Rooftop` |
| isActive | boolean | no | `true` |

### GET /amenities/:id/slots — `RESIDENT`
Available slots for an amenity. **Path param**: `id` (amenity uuid).

### POST /amenities/:id/book — `RESIDENT`
Blocked with `403` if the resident has any `OVERDUE` bill, or if the slot is already booked for that date.

**Body**
| Field | Type | Required | Example |
|---|---|---|---|
| slotId | string (uuid) | yes | `5a1b2c3d-4e5f-6789-0abc-def123456789` |
| bookingDate | string (date) | yes | `2026-09-26` |

```json
{ "slotId": "5a1b2c3d-4e5f-6789-0abc-def123456789", "bookingDate": "2026-09-26" }
```

---

## 11. Notifications
Base path: `/notifications` — any authenticated user.

### GET /notifications
**Query params**
| Param | Type | Required | Example |
|---|---|---|---|
| page | number | no | `1` |
| limit | number | no | `20` |

### GET /notifications/unread-count
**Response `200`**: `{ "count": 3 }` — poll this every 30s for the bell icon badge.

### PATCH /notifications/:id/read
**Path param**: `id` (uuid). No body.

### PATCH /notifications/read-all
Marks every notification for the current user as read. No body.

---

## 12. Reports
Base path: `/reports`

### GET /reports/dashboard — `MANAGER`
KPI summary.

**Response `200`**
```json
{ "openComplaints": 2, "overdueBills": 1, "todayVisitors": 1, "activeBookings": 0 }
```

### GET /reports/complaints — `MANAGER`
Downloads a complaint summary report.

**Query params**
| Param | Type | Required | Example |
|---|---|---|---|
| format | enum: `pdf`\|`excel` (default `pdf`) | no | `pdf` |

### GET /reports/billing — `ACCOUNTANT`
Downloads a billing report.

**Query params**
| Param | Type | Required | Example |
|---|---|---|---|
| format | enum: `pdf`\|`excel` (default `pdf`) | no | `excel` |

### GET /reports/visitors — `MANAGER`
Downloads a visitor log report.

**Query params**
| Param | Type | Required | Example |
|---|---|---|---|
| format | enum: `pdf`\|`excel` (default `pdf`) | no | `pdf` |

---

*All request/response examples above match the demo data created by `npm run seed`. IDs will differ on your machine — use the ones returned by your own `GET` calls or Swagger UI's "Try it out" against your seeded database.*
