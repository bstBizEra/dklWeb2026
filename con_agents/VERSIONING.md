# VERSIONING.md - DK LAO Version Tracking Rules

## 1. Purpose

This file controls how DK LAO tracks major, minor, and patch changes across application code, governance files, release notes, and local preview milestones.

Version tracking exists so agents and owners can quickly understand what changed, why it matters, and whether a change requires migration, QA, or owner review.

## 2. Source of Truth

The current project version must stay aligned across:

```txt
package.json
VERSION.json
con_agents/CHANGELOG.md
con_agents/VERSIONING.md
```

Run this check after every version-impacting change:

```powershell
pnpm version:status
```

## 3. Current Version

```txt
Current version: 0.6.0
Status: local-preview
Change level: minor
Release date: 2026-10-09
```

DK LAO is still in `0.x` pre-production development. Breaking changes can occur before `1.0.0`, but they must still be documented as major changed when they affect routes, data, APIs, deployment, or owner workflows.

## 4. Change Levels

### Major Changed

Use a major version bump for changes that require migration planning, owner approval, or coordinated rollout.

Examples:

- Public route structure changes that break existing URLs.
- API contract changes that break callers or submitted lead handling.
- Data model changes that require migration or data backfill.
- Deployment architecture changes, such as moving from local preview to production VPS or container runtime.
- Brand, design-token, or component-system rewrites that affect most pages.
- Security model changes for admin, forms, uploads, or customer data.

Version rule:

```txt
X.y.z -> X+1.0.0
```

### Minor Changed

Use a minor version bump for new non-breaking capabilities or meaningful platform expansion.

Examples:

- New page groups, product flows, lead workflows, or reusable component families.
- New governance systems, such as version tracking, release workflow, or QA gates.
- New integrations that do not break existing behavior.
- New static assets or media systems that affect presentation broadly.
- New content architecture, SEO metadata structure, or route additions.

Version rule:

```txt
x.Y.z -> x.Y+1.0
```

### Patch Changed

Use a patch version bump for fixes, refinements, and small non-breaking maintenance.

Examples:

- Bug fixes.
- Copy edits.
- Small visual adjustments.
- Asset swaps that preserve layout and behavior.
- Documentation clarifications.
- Local environment fixes that do not alter deployment architecture.

Version rule:

```txt
x.y.Z -> x.y.Z+1
```

## 5. Required Version Update Workflow

For every version-impacting change:

1. Choose `major`, `minor`, or `patch`.
2. Update `package.json`.
3. Update `VERSION.json`.
4. Add a new top entry to `con_agents/CHANGELOG.md`.
5. Use the changelog heading format `## [x.y.z] - YYYY-MM-DD`.
6. Use one of these changelog labels when useful:
   - `### Major Changed`
   - `### Minor Changed`
   - `### Patch Changed`
7. Run `pnpm version:status`.
8. Run the normal project gates before completion.

## 6. Release Notes Requirement

Major and minor changes must include a short note covering:

```txt
Reason
Affected files or workflow
Business impact
QA performed
Migration or rollback note if relevant
```

Patch changes may use a shorter changelog note when the risk is low.

## 7. Fail-Safe Rule

If `package.json`, `VERSION.json`, and the latest `CHANGELOG.md` entry disagree, agents must stop release or push preparation and fix the version records first.
