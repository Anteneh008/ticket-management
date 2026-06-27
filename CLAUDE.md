@AGENTS.md

# Ticket Management System

AI-powered support ticket system. Agents manually reading/classifying hundreds of emails daily; this system automates classification, routing, and AI-generated replies via Claude.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui v4 |
| Database | PostgreSQL (local dev) |
| ORM | **Prisma 6** (pinned — see note below) |
| Auth | NextAuth.js (Phase 2) |
| AI | Anthropic Claude API (Phase 6) |
| Email | Hostinger SMTP/IMAP (Phase 5) |
| Deploy | Vercel |

## Critical: Prisma Version Lock

**Always use Prisma 6, never upgrade to 7.**
Node.js is v20.16.0. Prisma 7 hard-blocks installation on anything below 20.19. Prisma 6.x works fine and covers all project needs.

```bash
# Correct install commands
npm install prisma@6 @prisma/client@6 --save-dev
```

Prisma 6 generates the client to `src/generated/prisma/` with `client.ts` as the entry (not `index.ts`).
Always import as:
```ts
import { PrismaClient } from "@/generated/prisma/client"
```

After any schema change, regenerate the client:
```bash
npx prisma generate
npx prisma migrate dev --name <description>
```

## Project Structure

```
src/
  app/               # Next.js App Router pages and layouts
  components/
    ui/              # shadcn/ui primitives (button, etc.)
  generated/
    prisma/          # Auto-generated Prisma client (gitignored)
  lib/
    prisma.ts        # PrismaClient singleton (hot-reload safe)
    utils.ts         # shadcn cn() utility
prisma/
  schema.prisma      # Database schema
  migrations/        # SQL migration history
prisma.config.ts     # Prisma 6 config (loads .env via dotenv)
.env                 # Local secrets — never commit
.env.example         # Template for all env vars across phases
```

## Domain Model

**Ticket statuses:** Open → Resolved → Closed

**Ticket categories:** General Question, Technical Question, Refund Request

**User roles:**
- `admin` — single seeded account; manages agent accounts
- `agent` — handles assigned tickets

## Common Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npx prisma studio    # Visual DB browser
npx prisma generate  # Regenerate client after schema changes
npx prisma migrate dev --name <name>  # Apply schema migration
```

## Environment Variables

See `.env.example` for a full list. For local dev, `.env` must contain at minimum:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/ticket_management?schema=public"
```

Before running migrations, create the local database:
```sql
CREATE DATABASE ticket_management;
```

## Implementation Phases

| Phase | Status | Description |
|---|---|---|
| 1 | ✅ Done | Project setup — Next.js, Tailwind, shadcn/ui, Prisma, env vars |
| 2 | Pending | Authentication — NextAuth.js, User schema, login page, role-based routes |
| 3 | Pending | User management — agent CRUD (admin only) |
| 4 | Pending | Ticket core — schema, list, detail, status updates, assignment |
| 5 | Pending | Email integration — Hostinger SMTP/IMAP, inbound → ticket, threaded replies |
| 6 | Pending | AI features — classification, summaries, suggested replies, knowledge base |
| 7 | Pending | Dashboard — stats, category breakdown, activity feed |
| 8 | Pending | Polish — loading/error/empty states, mobile, E2E tests, deploy |
