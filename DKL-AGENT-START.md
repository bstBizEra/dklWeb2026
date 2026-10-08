# DK LAO Agent — repository-first delivery, suite v1.1

Owner's target: `C:\laragon\www\dklAgent`. Foundation: https://github.com/bstBizEra/dklWeb2026, baseline commit `29057c6435f65c3f8448532c094f9604542b43d8` (`[TASK-008] Add About DK LAO page`). The repository's earlier `dklao` paths are overridden for this derivative checkout by the owner's explicit instruction; set `DKLAO_PROJECT_ROOT` and `DKLAO_AGENT_CONTROL_PATH`. Preserve the canonical remote and original control files.

## Start in Windows PowerShell
The repository is already at `C:\laragon\www\dklAgent`. Open a fresh PowerShell window and run:

```powershell
Set-Location 'C:\laragon\www\dklAgent'
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000/`. Staff sign-in and durable public intake require a configured database; without it, the public form saves only to the local development file. For a fresh setup on another machine, the bootstrap script lives at `C:\laragon\www\dklAgent-suite\scripts\Start-DklAgent.ps1`, outside this checkout. The script is not needed again for this checkout.

If Git cannot authenticate, sign in to the appropriate GitHub account with Git Credential Manager or run `gh auth login` followed by `gh auth setup-git` using the GitHub CLI. Do not put a personal access token in the script or remote URL.

## Continue implementation
1. Load root `AGENTS.md`, `con_agents/AGENTS.md`, `con_agents/AGENT_BOOTSTRAP.md`, then `docs/dkl-agent/07-Agent-Team-Operating-Model.md` and the task work package.
2. Inventory existing source before adding modules. Follow `00-README.md` and the six specifications.
3. Use the existing Next.js/React/TypeScript/pnpm/Vitest stack. Add staff identity and authorization before CRM data or AI write tools. Do not carry the abandoned Eve-only prototype into this repository.
4. Complete work package DKLA-002 identity/isolation before dependent CRM/AI work. Each package has acceptance conditions and test evidence.
5. Run repository gates, record actual results, request independent review, and publish a feature branch PR when credentials and checks permit. Merge authority follows repository governance; user authorization to implement does not remove tested-release gates.

```powershell
cd C:\laragon\www\dklAgent
$env:DKLAO_PROJECT_ROOT = (Get-Location).Path
$env:DKLAO_AGENT_CONTROL_PATH = Join-Path $env:DKLAO_PROJECT_ROOT 'con_agents'
pnpm install --frozen-lockfile
pnpm test -- --run
pnpm lint
pnpm typecheck
pnpm build
pnpm version:status
pnpm dev
```

Browser QA origin: http://localhost:3000/. Keep `main` unchanged while delivery is verified. A newer upstream main must be inspected and merged/rebased before publishing subsequent code. Do not force-push.

## Current truthful status
On 2026-10-09, the canonical repository was cloned locally to C:\laragon\www\dklAgent at the recorded baseline. Development continues on feature/DKLA-production-build as local preview 0.6.0. Current checks and unresolved production dependencies are recorded in docs/dkl-agent/10-Verification-Record.md. No live Supabase or Vercel project, PR, merge, deployment, live AI run, or customer records are claimed.

Suite layout: docs/dkl-agent contains PRD, TDD, FSD, QA, release plan and user documentation; UX, ERD and security are supporting specifications. Release flags and guide workflows remain proposals until application tests prove them.
