# Backend Implementation Plan — Vertical.AI CRM

## Overview
Build a production-ready REST API for the existing frontend using **Node.js + Express + Prisma + PostgreSQL**. The backend is designed using a 5-layer architecture with JWT auth, role-based access, and a seeder to import the 1014-row Excel file.

---

## Phase 1 — Project Setup & Database

### Step 1.1 — Initialize the Project
Inside `e:\lendkraft-lms\backend`, scaffold the project:
```bash
npm init -y
npm install express @prisma/client zod jsonwebtoken bcryptjs morgan cors dotenv xlsx
npm install -D prisma typescript tsx @types/express @types/node @types/jsonwebtoken @types/bcryptjs @types/morgan @types/cors
npx prisma init
npx tsc --init
```

### Step 1.2 — Configure `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Step 1.3 — Configure `.env`
```
DATABASE_URL="postgresql://USER:PASS@localhost:5432/verticalai_crm"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=5000
```

### Step 1.4 — Prisma Schema (Aligned to Frontend Types)

> [!IMPORTANT]
> The Roles are **SUPER_ADMIN, SALES_ADMIN, TEAM_LEAD, BDE** — matching the frontend `Role` type in `types.ts`.

Create `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  SUPER_ADMIN
  SALES_ADMIN
  TEAM_LEAD
  BDE
}

enum LeadStage {
  DEFAULT
  LOST
  YET_TO_CALL
  NOT_INTERESTED
  DNP
  CALL_BACK
  DND
  SWITCHED_OFF
  MEETING_SCHEDULED
  MEETING_POSTPONED
  PROPOSAL_SHARED
  HANDED_OVER
  PAYMENT_COMPLETED
}

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(BDE)
  teamId       String?
  avatar       String?
  leads        Lead[]   @relation("AssignedLeads")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@map("users")
}

model Lead {
  id             String    @id @default(cuid())
  name           String
  phone          String
  email          String?
  designation    String?
  industry       String?
  source         String?
  value          Float     @default(0)
  stage          LeadStage @default(YET_TO_CALL)
  remarks        String?
  linkedIn       String?
  location       String?
  companyName    String?
  companyWebsite String?
  product        String?
  state          String?
  city           String?
  assignedToId   String
  assignedTo     User      @relation("AssignedLeads", fields: [assignedToId], references: [id])
  teamId         String
  nextFollowUp   DateTime?
  lastFollowUp   DateTime?
  activities     Activity[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  @@index([stage])
  @@index([assignedToId])
  @@map("leads")
}

model Activity {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  type      String   // NOTE, TASK, STAGE_CHANGE, ATTACHMENT
  content   String
  createdBy String
  createdAt DateTime @default(now())
  @@index([leadId])
  @@map("activities")
}
```

---

## Phase 2 — Folder Structure & Core Files

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                ← imports Excel data
├── src/
│   ├── app.ts                 ← Express app + middleware
│   ├── server.ts              ← entry point
│   ├── prisma.ts              ← singleton PrismaClient
│   ├── middleware/
│   │   ├── auth.middleware.ts ← JWT verification
│   │   └── error.middleware.ts
│   └── modules/
│       ├── auth/              ← login, register, me
│       ├── leads/             ← CRUD + stage transitions
│       ├── users/             ← user management
│       └── analytics/         ← dashboard stats
├── .env
├── tsconfig.json
└── package.json
```

---

## Phase 3 — API Endpoints

| Method | Path | Role Required | Description |
|--------|------|--------------|-------------|
| POST | `/api/v1/auth/login` | Public | Login → JWT |
| GET | `/api/v1/auth/me` | All | Current user |
| GET | `/api/v1/leads` | All | List leads (filtered by role) |
| POST | `/api/v1/leads` | BDE+ | Create lead |
| GET | `/api/v1/leads/:id` | All | Get lead details |
| PUT | `/api/v1/leads/:id` | BDE+ | Update lead |
| DELETE | `/api/v1/leads/:id` | SALES_ADMIN+ | Delete lead |
| PATCH | `/api/v1/leads/:id/stage` | BDE+ | Update lead stage |
| GET | `/api/v1/leads/:id/activities` | All | Activity timeline |
| POST | `/api/v1/leads/:id/activities` | BDE+ | Log activity |
| GET | `/api/v1/users` | SALES_ADMIN+ | List users |
| POST | `/api/v1/users` | SUPER_ADMIN | Create user |
| GET | `/api/v1/analytics/dashboard` | SALES_ADMIN+ | Dashboard stats |

---

## Phase 4 — Seeding the 1014 Leads from Excel

> [!IMPORTANT]
> The Excel file at `backend/Copy of Zoominfo - 1014 Leads.xlsx` will be read by a Prisma seed script to populate the database.

The seed script will:
1. Read all rows from the `.xlsx` file.
2. Map column headers to the Lead model (name, phone, company, designation, industry, etc.).
3. Create a default `BDE` user as the assigned executive.
4. Insert all leads with `YET_TO_CALL` as the default stage.

---

## Phase 5 — Frontend Integration

Update `AuthContext.tsx` and API calls to point to the real backend:
- Replace mock `login()` with `POST /api/v1/auth/login`.
- Replace mock data with `GET /api/v1/leads`, etc.
- Store the JWT in `localStorage` and send it in `Authorization: Bearer <token>` headers.

---

## Verification Plan

1. **Unit**: Run API endpoints in Postman to verify CRUD.
2. **Seed**: Run `npm run seed` and confirm 1014 leads appear in the DB.
3. **Integration**: Connect the frontend to the backend and verify the login, leads list, and dashboard all load real data.
