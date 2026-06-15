# AGENT_BOOTSTRAP.md — DK LAO Agent Startup Procedure

## 1. Purpose

This file defines how every agent must initialize before working on DK LAO.

## 2. Required Path Detection

Agents must detect the project root using this order:

1. Environment variable `DKLAO_PROJECT_ROOT`.
2. Current working directory if it ends with `/dklao` or `C:\laragon\www\dklao`.
3. Nearest parent directory containing `AGENTS.md`.
4. Fail with a clear message if no root is found.

## 3. Required Control Path Detection

Agents must detect the control path using this order:

1. Environment variable `DKLAO_AGENT_CONTROL_PATH`.
2. `/dklao/con_agents`.
3. `C:\laragon\www\dklao\con_agents`.
4. Path declared in root `/dklao/AGENTS.md`.
5. Fail if `/con_agents/AGENTS.md` is not found.

## 4. Required Asset Path Detection

Agents must use these paths as asset sources:

```txt
Logo and favicon:
C:\laragon\www\dklao\images\logo & FAV_Icon

Slogan graphics:
C:\laragon\www\dklao\Icons for slogan
```

If the assets are not visible to the current runtime, the agent must request file access or use placeholders clearly labeled as placeholders. It must not invent final logo assets.

## 5. Load Sequence

Every agent must load files in this order:

```txt
1. /dklao/AGENTS.md
2. /dklao/con_agents/AGENTS.md
3. /dklao/con_agents/AGENT_BOOTSTRAP.md
4. Task-relevant companion files
5. Current implementation files
```

## 6. Task-to-Control Mapping

```txt
Design task            -> DESIGNS.md, TOKEN.md, ASSETS.md, COMPONENTS.md
Content/SEO task       -> CONTENT.md, ROUTES.md
Frontend task          -> COMPONENTS.md, TOKEN.md, ROUTES.md, QA_CHECKLIST.md
Backend/API task       -> ARCHITECTURE.md, DATA_MODEL.md, API_CONTRACTS.md, SECURITY.md
Form/lead task         -> FORMS_AND_LEADS.md, API_CONTRACTS.md, DATA_MODEL.md
Infra/deployment task  -> TECHNOLOGY_SOFTWARE_INFRA.md, INFRA.md, ENVIRONMENT.md, DEPLOYMENT.md, OBSERVABILITY.md
Security task          -> SECURITY.md, TOKEN_MANAGEMENT.md, ENVIRONMENT.md
QA task                -> QA_CHECKLIST.md, OBSERVABILITY.md
```

## 7. Startup Report Format

Before major work, the agent should summarize:

```txt
Project root detected:
Agent control path detected:
Master rules loaded:
Task-specific controls loaded:
Asset paths detected:
Implementation target:
Risks or missing files:
```

## 8. Fail-Safe Rule

If governance files or asset paths are missing, the agent may continue only with clearly marked assumptions and must not finalize production work dependent on missing assets.
