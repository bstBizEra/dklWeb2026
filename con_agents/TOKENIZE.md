# TOKENIZE.md — DK LAO Tokenization, Chunking, and Knowledge Context Rules

## 1. Purpose

This file controls how agents break DK LAO information into reusable knowledge chunks for prompts, RAG, content generation, design generation, and implementation planning.

This is not a replacement for `TOKEN.md`. `TOKEN.md` controls design tokens. `TOKENIZE.md` controls information tokenization and context preparation.

## 2. Chunk Categories

Use these knowledge chunk types:

```txt
BRAND
BUSINESS_SCOPE
PRODUCT_CATEGORY
SERVICE_CATEGORY
RENTAL_FLOW
QUOTE_FLOW
SPARE_PARTS_FLOW
MAINTENANCE_FLOW
CLEANING_EQUIPMENT
WAREHOUSE_SOLUTIONS
DESIGN_SYSTEM
COMPONENT_RULE
API_CONTRACT
DATA_MODEL
SEO_CONTENT
QA_RULE
SECURITY_RULE
INFRA_RULE
```

## 3. Chunk Format

Each reusable chunk should follow:

```txt
Chunk ID:
Category:
Source:
Summary:
Usage:
Do:
Do Not:
Related files:
```

## 4. Context Loading Rules

Agents should load only the smallest relevant context set:

```txt
Design task: AGENTS.md + DESIGNS.md + TOKEN.md + ASSETS.md + COMPONENTS.md
Frontend task: AGENTS.md + COMPONENTS.md + TOKEN.md + ROUTES.md + QA_CHECKLIST.md
Backend task: AGENTS.md + ARCHITECTURE.md + DATA_MODEL.md + API_CONTRACTS.md + SECURITY.md
Content task: AGENTS.md + CONTENT.md + ROUTES.md + FORMS_AND_LEADS.md
Infra task: AGENTS.md + TECHNOLOGY_SOFTWARE_INFRA.md + INFRA.md + ENVIRONMENT.md + DEPLOYMENT.md
```

Do not load the whole project unless full-system refactoring is requested.

## 5. Prompt Packing Rules

When preparing prompts for coding/design agents:

1. Include project mission.
2. Include asset paths if visual work is involved.
3. Include relevant source-of-truth files.
4. Include expected output files.
5. Include quality gates.
6. Include prohibited behavior.
7. Keep task scope explicit.

## 6. Noise Reduction Rules

Avoid passing:

- Long unrelated historical discussions
- Duplicate rules
- Outdated versions
- Raw brainstorm text unless needed
- Unverified product claims
- Excessive examples that distract from the current task

## 7. Traceability Rule

Every generated plan, component, route, API, or content module must be traceable to at least one governance category and file.
