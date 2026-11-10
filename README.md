# BORROWED. – Fashion Rental Club
### Full-Stack Multi-Vendor Fashion Rental Marketplace & Administration System

**Wear it. Love it. Return it.**

BORROWED. is an exclusive peer-to-peer fashion rental marketplace where women can list their luxury dresses for free, other women rent them for special occasions, and the platform coordinates end-to-end doorstep logistics via its dedicated courier fleet while earning a configurable commission.

---

## 1. Key Business Architecture & Features

- **Free Dress Listings**: Dress owners list their luxury dresses at zero cost and set their desired rental prices.
- **3-Day Pre-Event Delivery Window**: Dresses are automatically scheduled for delivery **3 calendar days before the occasion** (e.g., Occasion Dec 20 → Scheduled Delivery Dec 17) to provide stress-free fitting, jewelry matching, and shoe coordination.
- **Doorstep Return Pickup**: Return collection is scheduled **1 calendar day after the occasion** (e.g. Dec 21) directly from the renter's doorstep.
- **Overlap & Buffer Protection**: Intelligent availability calendar prevents overlapping bookings for the same physical dress, factoring in configurable preparation & dry cleaning buffer days.
- **Dynamic Platform Commission**: Configurable in the Admin Console (default 20%). The platform retains the commission and records the owner's net share (80%) in an immutable financial ledger.
- **4-Stage Logistics Pipeline**:
  1. *Stage 1*: Pickup from Dress Owner (`PICKUP_PENDING` → `ASSIGNED` → `COLLECTED`)
  2. *Stage 2*: Deliver to Renter 3 Days Early (`PREPARING` → `OUT_FOR_DELIVERY` → `DELIVERED`)
  3. *Stage 3*: Collect from Renter Post-Occasion (`RETURN_SCHEDULED` → `OUT_FOR_COLLECTION` → `COLLECTED`)
  4. *Stage 4*: Return to Owner (`RETURNING_TO_OWNER` → `RETURNED_TO_OWNER` → `COMPLETED`)
- **Single-Account Role Switching**: A customer can rent dresses and list dresses from the same registered account.
- **1-Click Demo Persona Switcher**: Top announcement bar features an instant role switcher to seamlessly test the application as Admin, Owner, Renter, Courier, or Guest.

---

## 2. Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Zustand, TanStack Query, Canvas Confetti.
- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL, JWT with Refresh Tokens, Role-Based Access Control (RBAC), Swagger OpenAPI.
- **Monorepo**: pnpm workspaces (`apps/web`, `apps/api`, `packages/types`).

---

## 3. Demonstration Accounts & Credentials

All demo accounts share the password: **`Password123!`**

| Persona | Role | Email | Capabilities & Portals |
|---|---|---|---|
| **Camilla Montague** | `ADMIN` | `admin@borrowed.club` | Dress moderation queue, courier dispatch, financials & policy settings (`/admin`) |
| **Sophia El-Khatib** | `OWNER` | `sophia@borrowed.club` | Free dress listings, rental requests, net earnings & payout history (`/owner`) |
| **Yasmin Soliman** | `RENTER` | `yasmin@borrowed.club` | Catalog browsing, rental bag, checkout, and live tracking (`/rentals`) |
| **Tarek Ghoneim** | `DELIVERY` | `tarek@borrowed.club` | Dedicated mobile courier app to execute pickups, deliveries, and returns (`/delivery`) |

---

## 4. Local Setup & Execution Guide

### Prerequisites
- Node.js v20+
- PostgreSQL (running locally on port 5432 or via Docker)

### 1. Install Dependencies
```bash
npx pnpm install
```

### 2. Configure Environment Variables
- `apps/api/.env`:
```env
PORT=4000
DATABASE_URL="postgresql://<user>@localhost:5432/borrowed_db?schema=public"
JWT_SECRET="borrowed-luxury-secret-key-super-secure-2026"
JWT_REFRESH_SECRET="borrowed-luxury-refresh-secret-key-super-secure-2026"
FRONTEND_URL="http://localhost:3000"
```

- `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Database Migration & Luxury Demonstration Seed
```bash
# Push schema to PostgreSQL
npx pnpm --filter @borrowed/api run prisma:push

# Populate 20+ realistic luxury dresses and demo users
npx pnpm --filter @borrowed/api run prisma:seed
```

### 4. Run the Applications
In two terminal tabs:

```bash
# Tab 1: Start Backend API (Port 4000)
npx pnpm --filter @borrowed/api start:dev

# Tab 2: Start Frontend Web (Port 3000)
npx pnpm --filter @borrowed/web dev
```

- **Customer Website**: [http://localhost:3000](http://localhost:3000)
- **Swagger OpenAPI Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 5. Automated Tests

```bash
# Unit tests (Rental calculation engine & commission logic)
npx pnpm --filter @borrowed/api test

# End-to-end integration test (All 4 user journeys)
node tests/e2e-journeys.js
```

---

## 6. Project Monorepo Structure

```
borrowed/
├── apps/
│   ├── web/                    # Next.js 15 App Router Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx            # Editorial Luxury Home Page
│   │   │   │   ├── dresses/            # Catalog with Filters & Pagination
│   │   │   │   ├── dresses/[id]/       # Details & 3-Day Delivery Calculator
│   │   │   │   ├── bag/                # Rental Bag
│   │   │   │   ├── checkout/           # 4-Step Checkout & Payment Simulation
│   │   │   │   ├── list-dress/         # Free Dress Upload Submission
│   │   │   │   ├── rentals/            # My Rentals Dashboard & Timeline
│   │   │   │   ├── owner/              # Dress Owner Portal & Earnings Ledger
│   │   │   │   ├── delivery/           # Courier Driver Task Management
│   │   │   │   ├── admin/              # Super Admin Console & Moderation
│   │   │   │   ├── favorites/          # Wishlist
│   │   │   │   └── how-it-works/       # Comprehensive Rental & Lending Guide
│   │   │   ├── components/             # Reusable UI & Layout Components
│   │   │   └── lib/                    # Zustand Stores (Auth, Bag, Favorites) & API Fetcher
│   └── api/                    # NestJS Backend API
│       ├── prisma/
│       │   ├── schema.prisma   # PostgreSQL Normalized Schema
│       │   └── seed.ts         # 20+ Designer Dresses & Seed Data
│       └── src/
│           ├── auth/           # JWT, Refresh Tokens, Role Guards
│           ├── dresses/        # Moderation, Catalog, Image Management
│           ├── rentals/        # Availability Engine & 3-Day Calculation Logic
│           ├── delivery/       # 4-Stage Logistics Workflows
│           ├── finance/        # Commission Ledger & Payout Approvals
│           ├── settings/       # Configurable Rules & Delivery City Rates
│           └── users/          # Profiles & Addresses
├── packages/
│   └── types/                  # Shared TypeScript Interfaces, Enums & DTOs
├── tests/
│   └── e2e-journeys.js         # Automated E2E User Journey Test Suite
├── docker-compose.yml          # PostgreSQL Container Service
└── pnpm-workspace.yaml
```

