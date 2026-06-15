# ENVIRONMENT.md — DK LAO Local, Staging, and Production Environment Rules

## 1. Purpose

This file controls environment setup, variable naming, configuration separation, and environment-specific behavior.

## 2. Environment Types

```txt
local
staging
production
```

## 3. Local Path Standards

```txt
Windows root: C:\laragon\www\dklao
Control path: C:\laragon\www\dklao\con_agents
Logo path: C:\laragon\www\dklao\images\logo & FAV_Icon
Slogan icon path: C:\laragon\www\dklao\Icons for slogan
```

## 4. Environment Isolation

Each environment must use separate:

```txt
Database
Upload storage
SMTP credentials
CRM webhook
Admin session secret
Analytics configuration
```

## 5. Required Variables

```txt
APP_ENV
APP_URL
DATABASE_URL
ADMIN_JWT_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
CRM_WEBHOOK_URL
CRM_WEBHOOK_SECRET
UPLOAD_MAX_SIZE_MB
```

## 6. Environment File Rules

- `.env.local` may exist locally.
- `.env.example` may be committed with placeholder values only.
- Real `.env` files must not be committed.
- Production secrets must be stored in the hosting provider secret manager or server environment.
