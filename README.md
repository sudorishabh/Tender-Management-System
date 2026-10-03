# TERI eTender Portal

The online tender management system for **TERI (The Energy and Resources Institute)**. Admins create tenders and a super admin approves them. Vendors register, browse live tenders, ask clarification questions and submit bids. Admins then evaluate the bids and award the work.

Production: <https://etender.teri.res.in>

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Database](#database)
- [Deployment notes](#deployment-notes)
- [Further documentation](#further-documentation)

---

## Features

### Public site

- Home page with tender listings, search, filters (availability, department, location, budget range) and sorting, plus portal stats and recently answered clarifications
- Public tender details pages (`/tender/[tenderId]`) with dates, fees, EMD and required documents
- About, FAQ and Terms pages
- SEO: metadata, JSON-LD structured data, `sitemap.xml` and `robots.txt`

### Vendors

- Self-registration with business details and documents (GST, PAN, registration certificate, bank details, MSME certificate)
- Dashboard with live tenders, purchased/bid tenders and awarded tenders
- Bid submission: upload the fee/EMD receipt, technical and financial documents, and any tender-specific documents
- Clarification questions on a tender before its query deadline
- In-app notifications for bid decisions, clarification answers and account updates
- Profile management

### Admins

- Multi-step tender creation, with drafts that can be saved and resumed later
- Submit tenders for super admin review, then edit them if they're sent back
- Edit live tenders
- View the bids on each tender and approve the winning one. The other bids are rejected automatically.
- Answer vendor clarifications
- Manage vendors: view, edit, approve or reject profiles
- Dashboard statistics

### Super admins

- Review submitted tenders, then publish them or send them back with a remark
- Invite new admins by email (token-based invite links)
- Manage admin accounts
- Everything an admin can do

---

## Tech stack

| Area            | Technology                                                   |
| --------------- | ------------------------------------------------------------ |
| Framework       | [Next.js 16](https://nextjs.org) (App Router), React 18       |
| Language        | TypeScript                                                   |
| API             | [tRPC v11](https://trpc.io) + TanStack Query v5, `superjson` |
| Auth            | [NextAuth.js v4](https://next-auth.js.org) (credentials, JWT sessions, bcrypt) |
| Database        | MySQL with [Drizzle ORM](https://orm.drizzle.team) + Drizzle Kit |
| Validation      | Zod, React Hook Form                                         |
| UI              | Tailwind CSS 3, Radix UI primitives (shadcn/ui pattern), lucide-react, sonner toasts |
| Documents       | `@react-pdf-viewer`, `pdfjs-dist`, `mammoth` (DOCX)          |
| Email           | Nodemailer (SMTP)                                            |
| File storage    | Local disk (`uploads/`), served through an API route         |
| Package manager | pnpm 10.15+                                                  |

---

## Getting started

### Prerequisites

- **Node.js 20.9 or newer** (required by Next.js 16)
- **pnpm 10.15+**. Run `corepack enable` and the version pinned in `package.json` is used automatically.
- **MySQL 8**
- An **SMTP account** for outgoing email. Registration and invites send emails, so these flows fail without it.

### 1. Install dependencies

```bash
git clone https://github.com/sudorishabh/Tender-Management-System.git
cd Tender-Management-System
pnpm install
```

> `canvas` is a native module. Prebuilt binaries cover most platforms. If the install fails while compiling it, install your OS's build tools (on Windows, the "Desktop development with C++" workload from Visual Studio Build Tools).

### 2. Configure environment

Create a `.env` file in the project root. See [Environment variables](#environment-variables) for the full list. At minimum:

```env
DATABASE_URL=mysql://user:password@localhost:3306/tender_db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random string, e.g. `openssl rand -base64 32`>
NEXT_PUBLIC_URL=http://localhost:3000

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_FROM=noreply@example.com
EMAIL_PASSWORD=<smtp password>
EMAIL_FROM_NAME=TERI eTender
ADMIN_EMAIL=admin@example.com
APP_NAME=TERI eTender Portal
NEXT_PUBLIC_APP_NAME=TERI eTender Portal
```

`.env*` files are git-ignored. Never commit real credentials.

### 3. Create the database schema

Create an empty MySQL database, then apply the migrations:

```bash
pnpm db:migrate
```

### 4. Seed the required data

The app has no seed script. Two things must exist before it's usable:

**Departments.** The tender form's department dropdown reads from this table:

```sql
INSERT INTO departments (div_code, division_name) VALUES
  ('ADM', 'Administration'),
  ('ITS', 'Information Technology Services');
```

**The first super admin.** Further admins are invited from the app, but the first account has to be inserted by hand. Generate a bcrypt hash (the app uses 10 salt rounds):

```bash
node -e "require('bcrypt').hash('YourStrongPassword', 10).then(console.log)"
```

Then insert the user:

```sql
INSERT INTO users (email, full_name, password, role)
VALUES ('superadmin@example.com', 'Super Admin', '<bcrypt hash>', 'super_admin');
```

### 5. Run the dev server

```bash
pnpm dev
```

Open <http://localhost:3000>. Sign in as the super admin at `/sign-in`, then invite admins from `/super/invite`.

---

## Environment variables

| Variable                | Required | Description |
| ----------------------- | :------: | ----------- |
| `DATABASE_URL`          | ✅ | MySQL connection string, used by the app and Drizzle Kit |
| `NEXTAUTH_URL`          | ✅ | Canonical URL of the app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET`       | ✅ | Secret for signing session JWTs. Also read by `proxy.ts`. |
| `NEXT_PUBLIC_URL`       | ✅ | Public base URL, used to build links in emails |
| `EMAIL_HOST`            | ✅ | SMTP host |
| `EMAIL_PORT`            |    | SMTP port (default `587`, STARTTLS) |
| `EMAIL_FROM`            | ✅ | SMTP username and sender address. Also receives new-vendor alerts. |
| `EMAIL_PASSWORD`        | ✅ | SMTP password |
| `EMAIL_FROM_NAME`       |    | Display name for outgoing email |
| `ADMIN_EMAIL`           |    | Fallback recipient for admin notifications |
| `APP_NAME`              |    | App name used in email templates |
| `NEXT_PUBLIC_APP_NAME`  |    | App name shown in the UI |
| `NEXT_PUBLIC_BASE_URL`  |    | Base URL for SEO metadata, sitemap and robots (default `https://etender.teri.res.in`) |
| `NEXTAUTH_COOKIE_NAME`  |    | Custom session cookie name |
| `ONE_HOUR_MS`, `FIFTEEN_DAYS_MS` | | Token lifetime overrides in `lib/server/constants.ts` (defaults: 1 hour and 15 days) |

> The existing `.env` templates also contain `APP_AWS_*` and `NEXT_PUBLIC_AWS_S3_*` keys. These are left over from when files were stored on S3. The code no longer reads them.

---

## Scripts

| Command            | Description |
| ------------------ | ----------- |
| `pnpm dev`         | Start the dev server (webpack) on port 3000 |
| `pnpm build`       | Production build |
| `pnpm start`       | Serve the production build |
| `pnpm lint`        | Run ESLint |
| `pnpm db:generate` | Generate a SQL migration from changes to `server/db/schema.ts` |
| `pnpm db:migrate`  | Apply pending migrations |
| `pnpm db:studio`   | Open Drizzle Studio to browse the database |

> Tailwind config changes (`tailwind.config.ts`) aren't picked up by a running dev server. Restart `pnpm dev` after editing it.

---

## Project structure

```
├── app/                        Next.js App Router
│   ├── (auth)/                 sign-in, register, accept-invite
│   ├── (dashboards)/
│   │   ├── admin/              tender creation, drafts, live tenders, bids, vendors
│   │   ├── vendor/             vendor dashboard, purchased & awarded tenders, profile
│   │   └── super/              tender review, admin invites, admin management
│   ├── api/
│   │   ├── auth/[...nextauth]/ NextAuth handler
│   │   ├── trpc/[trpc]/        tRPC handler
│   │   ├── upload/             file upload (writes to uploads/)
│   │   └── files/[...key]/     file download (reads from uploads/)
│   ├── tender/                 public tender details and bid pages
│   ├── about/, faq/            public content pages
│   └── sitemap.ts, robots.ts
├── _components/                React components (import as @/components/*)
│   └── ui/                     Radix/shadcn primitives
├── server/
│   ├── db/                     Drizzle schema, connection pool, migrations
│   └── trpc/
│       ├── trpc.ts             procedures: public / protected / admin / vendor / superAdmin
│       └── routers/            auth, tender, bid, vendor, admin, clarification,
│                               notification, department, s3 (file URLs)
├── lib/
│   ├── auth.ts                 NextAuth options
│   ├── auth/                   role → route mapping and permissions
│   ├── server/                 email, templates, errors, file helpers, tender state
│   ├── seo.config.ts           metadata and keywords
│   └── trpc.ts                 tRPC React client
├── context/                    TenderContext, VendorContext
├── hooks/                      upload/delete file, logout, home filters, etc.
├── utils/                      date, currency and formatting helpers
├── _types/, types/             shared TypeScript types
├── docs/                       SEO and tender-state documentation
├── proxy.ts                    route protection (Next.js 16 replacement for middleware.ts)
└── uploads/                    uploaded files (git-ignored)
```

**Import alias:** `@/*` maps to the project root, and `@/components/*` resolves to `_components/` through a webpack alias in `next.config.ts`. Always import components as `@/components/...`.

---

## How it works

### Roles and access control

There are three roles, stored in `users.role`: `vendor`, `admin` and `super_admin`. Access is enforced in two layers:

1. **`proxy.ts`** guards the routes. `/admin/*` needs admin or super admin, `/vendor/*` needs a vendor, and `/super/*` needs a super admin. Unauthenticated users are sent to `/sign-in?callbackUrl=...`, and signed-in users who open an auth page are sent to their own dashboard.
2. **tRPC procedures** (`server/trpc/trpc.ts`) check the session role on every API call. They throw `UNAUTHORIZED` or `FORBIDDEN` when the check fails.

### Tender lifecycle

Approval status lives in `tender_status`:

```
draft ──submit──▶ review ──approve──▶ published
                   │  ▲
         send back │  │ resubmit
      (with remark)▼  │
                rescheduled
```

- **draft**: saved by an admin, not yet submitted
- **review**: waiting for super admin approval
- **rescheduled**: sent back to the admin with a remark to fix and resubmit
- **published**: approved. Sets `tender_is_active = true` and emails any invited vendors.

Once a tender is published, whether it's visible and open for bids is worked out **from its dates only**:

| State     | Condition                        | Vendors see                |
| --------- | -------------------------------- | -------------------------- |
| Scheduled | now < release date               | hidden                     |
| Live      | release date ≤ now < bid deadline | visible, can bid          |
| Closed    | now ≥ bid deadline               | visible, bidding disabled  |

Technical documents stay hidden until the technical bid opening date, and financial documents until the financial bid opening date. See [`docs/TENDER_STATE_MANAGEMENT.md`](docs/TENDER_STATE_MANAGEMENT.md) and `lib/server/tenderStateHelpers.ts`.

### Bidding flow

1. The vendor registers. New profiles default to `approved` at the database level, and admins can reject or re-approve them from **Admin → Vendors**. Only approved vendors can bid.
2. The vendor pays the tender fee and EMD offline, as the tender page explains.
3. The vendor submits the bid with the payment receipt and the required documents before the deadline.
4. The bid starts as `under_review`, and the admin gets an email alert.
5. An admin approves one bid. It becomes `approved` and shows under the vendor's **Awarded** tenders. Every other bid on the tender becomes `rejected`. All bidders get an in-app notification. (The schema also has `ranked` and `selected` statuses, but the current flow doesn't use them.)

### File storage

Uploads are stored on the **local filesystem** under `uploads/<folder>/`:

- `POST /api/upload` saves a file (multipart `file` + `folder`) and returns a unique key
- `GET /api/files/<folder>/<key>` streams it back, with a path-traversal guard
- The `s3` tRPC router and the `useUploadFileToS3` / `useDeleteFileFromS3` hooks keep their old names but now use local storage

### Email

`lib/server/email.ts` configures a Nodemailer SMTP transport. Templates live in `lib/server/email-templates/` and `lib/server/templates/`. They cover vendor registration (to the vendor, plus an alert to the admin), admin invites, tender invitations to invited vendors, and new-bid alerts to the admin.

---

## Database

Schema: [`server/db/schema.ts`](server/db/schema.ts) · Migrations: `server/db/migrations/`

| Table                     | Purpose |
| ------------------------- | ------- |
| `users`                   | Accounts and role |
| `vendor_profiles`         | Vendor status, contacts, PAN/Aadhaar documents |
| `businesses`              | Vendor business details, GST, bank and MSME documents |
| `departments`             | TERI divisions, used on tenders |
| `tenders`                 | Tender details, dates, fees and approval status |
| `tender_email_invites`    | Vendor emails invited to a tender |
| `vendor_doc_requirements` | Documents a tender requires from bidders |
| `bids`                    | Bid submissions and their status |
| `bid_vendor_docs`         | Documents uploaded against each requirement |
| `tender_clarifications`   | Vendor questions and admin answers |
| `notifications`           | In-app notifications |
| `admin_invites`           | One-time admin invite tokens |

**Changing the schema:**

1. Edit `server/db/schema.ts`
2. `pnpm db:generate` to create a migration
3. Review the generated SQL in `server/db/migrations/`
4. `pnpm db:migrate` to apply it

---

## Deployment notes

- Build with `pnpm build` and serve with `pnpm start`. Put a reverse proxy (e.g. Nginx) with HTTPS in front.
- **`uploads/` must be persistent and writable** by the Node process. Back it up together with the database. Stateless or serverless hosts without a persistent disk won't work.
- Set `NEXTAUTH_URL`, `NEXT_PUBLIC_URL` and `NEXT_PUBLIC_BASE_URL` to the public domain.
- `output: "standalone"` is turned off in `next.config.ts` to avoid symlink permission errors on Windows. It can be turned back on for Linux deployments.
- Security headers (CSP, HSTS, X-Frame-Options and others) are set in `next.config.ts`. Update the CSP if you add external scripts, fonts or frames.

---

## Further documentation

- [`docs/TENDER_STATE_MANAGEMENT.md`](docs/TENDER_STATE_MANAGEMENT.md): date-based tender states and document visibility
- [`docs/SEO.md`](docs/SEO.md): SEO implementation guide
- [`docs/SEO-STRATEGY.md`](docs/SEO-STRATEGY.md): SEO strategy and keyword plan
- [`CLAUDE.md`](CLAUDE.md): architecture notes for AI-assisted development
