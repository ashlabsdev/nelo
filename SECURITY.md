# Security Policy

## Reporting Security Issues

Please do not publicly disclose security vulnerabilities through GitHub Issues.

Security reports should include:

- A description of the issue.
- The affected functionality.
- Steps to reproduce the issue.
- The potential impact.

## Security Architecture

NELO uses multiple layers of security to protect application data and user accounts.

### Authentication

Authentication is provided by Supabase Auth.

### Database Authorization

PostgreSQL Row Level Security (RLS) restricts access to application data.

Examples include:

- Users can modify only their own content.
- Users can modify only their own profiles.
- Conversation access is restricted to conversation members.
- Administrative operations are restricted by role.

### Sensitive Profile Fields

Users cannot directly update security-sensitive profile fields, including:

- `role`
- `account_status`
- `warning_count`
- `suspension timestamp`

These fields must be protected by appropriate database policies and trusted server-side operations.

### Moderation

Moderation operations use protected database functions and administrative authorization checks.

### Environment Variables

Secrets must never be committed to the repository.

Files containing local or test environment variables, such as the following, must remain excluded from Git:

```text
.env.local
.env.test.local
```

Only non-sensitive configuration examples should be committed.

### CI Credentials

Playwright test credentials are stored as GitHub Actions repository secrets.

Secrets must not be hardcoded in source code, test files, or workflow configuration.

### Storage

User media uploads are protected by Supabase Storage policies that restrict access according to the application's authorization rules.

## Supported Version

Security fixes currently target the latest production version of NELO.
