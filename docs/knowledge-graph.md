# Codebase Knowledge Graph (Understand-Anything)

The `.ua/` folder holds a knowledge graph of this repository, made with [Understand-Anything](https://github.com/Egonex-AI/Understand-Anything). It maps every file, exported function, import, test link and governance document of the code that runs on preview.dklao.com, groups them into architecture layers, and adds a guided tour for new developers and agents.

It is a developer aid only. Nothing in `.ua/` is loaded by the website, and it changes no page, route or build output.

## What is in `.ua/`

| File | Purpose |
|---|---|
| `knowledge-graph.json` | The graph: 420 nodes, 1,234 edges, 10 layers, 15 tour steps |
| `meta.json` | Commit the graph was built from |
| `fingerprints.json` | Structural fingerprints, so later runs only re-analyse changed files |
| `config.json` | Output language (`en`), auto-update off |
| `.understandignore` | Exclusions: images (`*.webp`), Payload migration JSON snapshots, generated `payload-types.ts` and admin `importMap.ts` |

`.ua/intermediate/`, `.ua/tmp/`, `.ua/.trash-*/` and `.ua/diff-overlay.json` are local scratch files and are ignored by git.

## Layers

Public Site Routes, Mobile Web App, UI Components, Content & Site Data, Payload CMS Backend, Lead Pipeline, Testing, Platform & Build Config, Project Documentation, Agent Governance.

## View the dashboard

Needs Node.js 18 or newer. No API key or AI model is used; files are served read-only from this folder.

```powershell
cd C:\laragon\www\dklao
npx https://github.com/Egonex-AI/Understand-Anything/releases/latest/download/understand-anything-viewer.tgz .
```

The terminal prints a `http://127.0.0.1:5173/?token=...` address and opens it in the browser.

## Update the graph

In Claude Code, install the plugin once and re-run the analysis after code changes. Later runs are incremental.

```text
/plugin marketplace add Egonex-AI/Understand-Anything
/plugin install understand-anything
/understand
```

Other commands: `/understand-chat <question>`, `/understand-diff` (impact of current changes), `/understand-explain <file>`, `/understand-onboard`, `/understand-domain`.

The graph reflects the commit in `meta.json`. Re-run `/understand` before relying on it after larger changes.
