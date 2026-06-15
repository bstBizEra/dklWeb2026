# TOKEN_MANAGEMENT.md — DK LAO Token Budget, Context, Secret, and Credential Rules

## 1. Purpose

This file controls two different meanings of "token" in the DK LAO project:

1. AI/context tokens used by agents and prompts.
2. Access tokens, API keys, session tokens, and credentials used by infrastructure or integrations.

Design tokens are controlled separately in `TOKEN.md`.

## 2. AI Context Token Management

Required loading priority:

```txt
1. /dklao/AGENTS.md
2. /dklao/con_agents/AGENTS.md
3. /dklao/con_agents/AGENT_BOOTSTRAP.md
4. Task-specific control files
5. Current task source files
6. Related business source data
```

Do not load all files by default.

## 3. Context Budget Levels

```txt
Small task:    AGENTS + 1 to 2 companion files
Medium task:   AGENTS + 3 to 5 companion files
Large task:    AGENTS + relevant full control set
System task:   Full con_agents package + architecture/data/API/security files
```

## 4. Context Hygiene

Agents must:

- Summarize long source files before reusing them.
- Remove duplicate context.
- Prefer rule IDs and references over large pasted blocks.
- Keep prompts task-specific.
- Preserve business-critical constraints.

## 5. Credential and Access Token Rules

Never commit or expose:

```txt
API keys
Database URLs
SMTP passwords
CRM webhook secrets
JWT secrets
Session secrets
OAuth client secrets
Cloud storage keys
Analytics secrets
Payment keys
```

## 6. Environment Variable Rules

All secrets must be stored in environment variables.

Example names:

```txt
DATABASE_URL
NEXTAUTH_SECRET
ADMIN_JWT_SECRET
SMTP_HOST
SMTP_USER
SMTP_PASS
CRM_WEBHOOK_URL
CRM_WEBHOOK_SECRET
UPLOAD_STORAGE_KEY
UPLOAD_STORAGE_SECRET
```

## 7. Token Rotation Rules

Access tokens must be rotated when:

- A developer leaves the project.
- A secret is accidentally shared.
- A deployment environment changes.
- A third-party integration is replaced.
- Production incident response requires it.

## 8. Logging Rules

Never log full tokens or secrets.

Allowed:

```txt
Token present: yes/no
Token prefix: first 4 characters only if necessary
Environment: local/staging/production
```

Prohibited:

```txt
Full token value
Database password
Webhook secret
Session secret
Raw authorization header
```
