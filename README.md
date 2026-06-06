# Darion Academy

Darion Academy is an internal LMS for Darion Technologies. It supports course authoring, assignments, quizzes, progress tracking, mentor review, analytics, notifications, and PDF certificates.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Prisma, Supabase Auth/PostgreSQL/Storage, Recharts, Puppeteer, and Vercel.

## Local setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in the pooled database URL, direct database URL, project URL, anon key, and service role key. Project scripts explicitly load `.env.local`.
3. Add `http://localhost:3000/auth/callback` and your production callback URL to Supabase Auth redirect URLs.
4. Install dependencies and initialize infrastructure:

```bash
npm install
npm run db:migrate -- --name init
npm run storage:setup
npm run db:seed
npm run dev
```

Demo accounts use the emails in `prisma/seed.ts` and passwords from the `DEMO_*_PASSWORD` environment variables.

## Storage and security

The setup script creates private `course-files`, `lesson-files`, `submissions`, `certificates`, and `profile-images` buckets. Application downloads use signed URLs. The service role key is server-only and must never use a `NEXT_PUBLIC_` prefix.

Authorization is enforced in server actions and server-rendered routes. Middleware refreshes Supabase sessions and blocks anonymous workspace requests. Admins have global access, mentors are scoped to assigned enrollments, and learners are scoped to their own enrollments and records.

## Database and seed

Prisma migrations use `DIRECT_URL`; application queries use the pooled `DATABASE_URL`. Run:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

The seed creates one account for each role and a published course containing text, assignment, and quiz lessons.

## Certificates

Admins manage structured certificate templates under `/admin/certificate-templates` and assign an active template to each course. Completion approval automatically generates the PDF; failed jobs remain available for admin retry. Templates support colors, typography, borders, text, field visibility, signer details, and per-template logo/signature/background uploads.

Issued certificates store an immutable template snapshot, are rendered with `puppeteer-core` and `@sparticuz/chromium`, uploaded to private storage, and returned through one-hour signed URLs. Every generated certificate includes a QR code linking to the public `/verify/[certificateId]` page. Admins can revoke and reissue credentials while preserving their history. Local environments may set `CHROME_EXECUTABLE_PATH` to an installed Chromium binary.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Vercel deployment

1. Import the repository into Vercel.
2. Configure all values from `.env.example`, replacing `NEXT_PUBLIC_APP_URL` with the production domain.
3. Add the production callback URL in Supabase Auth.
4. Run `npm run db:deploy` during release or from CI.
5. Deploy. The Next.js build already externalizes Chromium/Puppeteer packages for the certificate route.

For production email invitations, configure a custom SMTP provider and email templates in Supabase Auth.
