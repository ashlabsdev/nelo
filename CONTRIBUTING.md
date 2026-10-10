# Contributing to NELO

Thank you for your interest in contributing to NELO.

## Development Branch

Active development happens on the `dev` branch.

The `main` branch contains production-ready code.

**Do not push directly to `main`.**

## Development Workflow

1. Start from `dev`.
2. Create or modify the feature.
3. Run local quality checks.
4. Push your changes.
5. Open a pull request targeting `main`.
6. Wait for GitHub Actions checks to pass.
7. Merge only after the required checks are successful.

## Setup

Enter the application directory:

```bash
cd nelo
npm install
```

Create `.env.local` using `.env.example` and configure the required environment variables.

Start the development server:

```bash
npm run dev
```

## Required Checks

Before submitting a pull request, run:

```bash
npm run lint
npm run test:run
npm run test:e2e
npm run build
```

All checks should pass before submitting your changes.

## Code Style

- Use TypeScript.
- Follow the existing project structure.
- Prefer clear and descriptive component names.
- Keep server-side and client-side responsibilities separated.
- Never expose server-side secrets.
- Follow existing Supabase Row Level Security (RLS) patterns.
- Avoid bypassing database ownership rules.

## Database Changes

Database changes must consider:

- Row Level Security (RLS).
- Data ownership rules.
- Authenticated user permissions.
- Administrator permissions.
- Suspended user restrictions.

Never rely solely on client-side authorization. Enforce access control on the server or at the database level.

## Tests

New features should include appropriate tests where practical.

NELO uses the following testing tools:

- **Vitest** — unit testing.
- **React Testing Library** — component testing.
- **Playwright** — end-to-end testing.

## Pull Requests

Every pull request should describe:

- What changed.
- Why the change was necessary.
- How the changes were tested.
- Any required database or environment changes.

Keep pull requests focused, clearly documented, and easy to review.