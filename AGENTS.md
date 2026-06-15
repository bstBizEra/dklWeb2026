# AGENTS.md — DK LAO Root Agent Bridge

## Purpose

This root file exists so agents starting from the DK LAO project root can discover the dedicated control-rule directory.

## Project Root

```txt
/dklao
```

## Windows Development Path

```txt
C:\laragon\www\dklao
```

## Agent Control Path

```txt
/dklao/con_agents
```

Windows equivalent:

```txt
C:\laragon\www\dklao\con_agents
```

## Master Rule File

Agents must load the master control rules from:

```txt
/dklao/con_agents/AGENTS.md
```

Windows equivalent:

```txt
C:\laragon\www\dklao\con_agents\AGENTS.md
```

## Required Behavior

Before doing any implementation, design, content, backend, QA, or deployment work, agents must:

1. Set or infer the project root as `/dklao` or `C:\laragon\www\dklao`.
2. Load `/dklao/con_agents/AGENTS.md`.
3. Load `/dklao/con_agents/AGENT_BOOTSTRAP.md`.
4. Load any relevant companion rule files from `/dklao/con_agents`.
5. Follow `/dklao/con_agents/AGENTS.md` as the authoritative governance file.

## Asset Source Paths

Logo and favicon assets must be discovered from:

```txt
C:\laragon\www\dklao\images\logo & FAV_Icon
```

Slogan graphics and icon assets must be discovered from:

```txt
C:\laragon\www\dklao\Icons for slogan
```

Agents must not invent replacement logos, favicon artwork, or slogan icons unless the project owner explicitly requests a new design option.

## Recommended Environment Variables

For Linux/WSL/macOS-style shells:

```bash
export DKLAO_PROJECT_ROOT=/dklao
export DKLAO_AGENT_CONTROL_PATH=/dklao/con_agents
export DKLAO_WINDOWS_PROJECT_ROOT='C:\laragon\www\dklao'
export DKLAO_LOGO_PATH='C:\laragon\www\dklao\images\logo & FAV_Icon'
export DKLAO_SLOGAN_ICON_PATH='C:\laragon\www\dklao\Icons for slogan'
```

For Windows PowerShell:

```powershell
$env:DKLAO_PROJECT_ROOT="/dklao"
$env:DKLAO_AGENT_CONTROL_PATH="/dklao/con_agents"
$env:DKLAO_WINDOWS_PROJECT_ROOT="C:\laragon\www\dklao"
$env:DKLAO_LOGO_PATH="C:\laragon\www\dklao\images\logo & FAV_Icon"
$env:DKLAO_SLOGAN_ICON_PATH="C:\laragon\www\dklao\Icons for slogan"
```

## Companion Rule Files

After loading the master rule file, agents should load task-relevant companion controls from:

```txt
/dklao/con_agents/ASSETS.md
/dklao/con_agents/DESIGNS.md
/dklao/con_agents/TOKEN.md
/dklao/con_agents/TOKENIZE.md
/dklao/con_agents/TOKEN_MANAGEMENT.md
/dklao/con_agents/TECHNOLOGY_SOFTWARE_INFRA.md
/dklao/con_agents/CONTENT.md
/dklao/con_agents/ARCHITECTURE.md
/dklao/con_agents/ROUTES.md
/dklao/con_agents/COMPONENTS.md
/dklao/con_agents/DATA_MODEL.md
/dklao/con_agents/API_CONTRACTS.md
/dklao/con_agents/FORMS_AND_LEADS.md
/dklao/con_agents/QA_CHECKLIST.md
/dklao/con_agents/SECURITY.md
/dklao/con_agents/DEPLOYMENT.md
/dklao/con_agents/INFRA.md
/dklao/con_agents/ENVIRONMENT.md
/dklao/con_agents/OBSERVABILITY.md
/dklao/con_agents/CHANGELOG.md
```

## Fail-Safe Rule

If `/dklao/con_agents/AGENTS.md` cannot be found, stop implementation work and report:

```txt
DK LAO agent control rules not found. Expected path: /dklao/con_agents/AGENTS.md
```

Agents must not treat `/dklao/con_agents` as application source code. It is the governance and control-rule layer only.
