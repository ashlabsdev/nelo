# NELO Architecture

## Overview

NELO uses a serverless full-stack architecture built around Next.js and Supabase.

```text
                       ┌───────────────────┐
                       │      Browser      │
                       └─────────┬─────────┘
                                 │
                                 ▼
                       ┌───────────────────┐
                       │ Next.js / React   │
                       │      Vercel       │
                       └─────────┬─────────┘
                                 │
                                 ▼
                       ┌───────────────────┐
                       │     Supabase      │
                       └─────────┬─────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
         PostgreSQL            Auth             Storage
              │
              ├── Profiles
              ├── Posts
              ├── Comments
              ├── Likes
              ├── Follows
              ├── Favorites
              ├── Conversations
              ├── Messages
              ├── Notifications
              ├── Reports
              └── Moderation Cases
```

## Frontend

NELO uses:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Tiptap

Server Components handle data-driven application pages, while Client Components manage interactive UI.

## Backend

Supabase provides:

- PostgreSQL database
- Authentication
- Storage
- Realtime subscriptions

NELO does not use a traditional persistent application server.

## Authentication

Supabase Auth manages user authentication.

Supported authentication methods include:

- Email and password
- Google
- GitHub

Authenticated users have an associated profile record.

## Authorization

Authorization is enforced primarily through PostgreSQL Row Level Security (RLS).

Examples include:

- Users can edit only their own profiles.
- Users can modify only their own posts.
- Conversation members can access their conversations.
- Admin-only operations verify the administrator role.
- Suspended users are prevented from performing protected write operations.

## Storage

The `post-media` bucket stores:

- Photos
- Audio files

Uploads use user-specific storage paths.

## Realtime

Supabase Realtime supports:

- Chat message updates
- Notification updates

## Moderation

User reports enter an administrator moderation workflow.

A confirmed violation creates a moderation case with a deadline.

If violating content remains after the deadline, the moderation processor can:

- Remove the violating post.
- Issue a warning.
- Suspend the account when applicable.

## Testing

NELO uses three levels of testing:

1. **Unit testing** — Vitest
2. **Component testing** — React Testing Library
3. **End-to-end testing** — Playwright

## CI/CD

GitHub Actions automates the following workflow:

1. Install dependencies using `npm ci`.
2. Run ESLint.
3. Run Vitest tests.
4. Build the Next.js application.
5. Run Playwright end-to-end tests.

Production deployment occurs from the `main` branch using Vercel.