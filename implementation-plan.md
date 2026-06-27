# Implementation Plan

## Phase 1: Project Setup & Infrastructure
- Initialize Next.js app with TypeScript
- Configure Tailwind CSS and shadcn/ui
- Set up PostgreSQL database (local)
- Initialize Prisma and connect to the database
- Configure environment variables

## Phase 2: Authentication
- Design the User schema (id, name, email, password, role)
- Seed the initial admin account
- Set up NextAuth.js with credentials provider
- Build login page
- Protect routes based on role (admin vs. agent)

## Phase 3: User Management
- Build agent list page (admin only)
- Build create agent form (admin only)
- Build delete/deactivate agent (admin only)

## Phase 4: Ticket Core
- Design the Ticket schema (subject, body, status, category, assignedTo, createdAt, etc.)
- Build ticket list page with filtering (status, category) and sorting
- Build ticket detail view
- Add ability to update ticket status
- Add ability to assign ticket to an agent

## Phase 5: Email Integration
- Configure Hostinger SMTP for sending replies
- Set up IMAP polling to receive inbound emails
- Auto-create a ticket from each inbound email
- Send reply from the ticket detail view
- Link replies to the original email thread

## Phase 6: AI Features
- Set up Anthropic Claude API client
- Define the knowledge base (documents/FAQs used for response generation)
- Auto-classify ticket category on creation
- Generate AI summary for each ticket
- Generate AI-suggested reply for each ticket
- Auto-generate an initial response using the knowledge base

## Phase 7: Dashboard
- Ticket stats overview (counts by status)
- Ticket breakdown by category
- Recent activity feed

## Phase 8: Polish & Launch
- Add loading and error states throughout the app
- Add empty states for lists
- Ensure mobile responsiveness
- End-to-end testing of critical flows
- Production deployment and smoke testing
