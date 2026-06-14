@AGENTS.md

# Demo Seed Factory

Project memory for Claude Code sessions in this repository.

## Project

- Name: Demo Seed Factory
- Slug: demo-seed-factory
- Type: Blank Next.js
- Dev port: 3034
- Path: D:\dev\demo-seed-factory

## Working style

- Make the smallest correct change. No speculative refactors.
- Prefer editing existing files over creating new ones.
- Read before you write. Search before you read. Ask before you guess.
- Do not commit, push, deploy, or stage files unless the user explicitly asks.
- Do not run `git add .` or `git add -A`. Stage specific paths.
- If you spot a problem outside the task, mention it; do not fix it.

## Default build rhythm

1. Confirm the task in one sentence in your own words.
2. Read the files you expect to change.
3. Propose a short plan: files to touch, what to add or remove.
4. Implement with targeted edits.
5. Hand off to the tester or auditor.
6. Write a final report.

## Useful commands

Run from the project root.

```
npm run dev -- -p 3034
npm run build
npm run lint
```

Add project-specific commands here as they appear.

## Reusable Dev Centre prompt library

Reusable Dev Centre prompt library:
D:\dev\prompt-library

When Ben asks for a build, audit, fix, debug, handover, UI review,
Supabase/RLS review, or deployment-prep workflow, use the relevant
prompt pattern from the prompt library.

## Final report required

Every major work pass ends with a final report containing:

1. Files changed
2. What was built or reviewed
3. Commands run
4. Validation result
5. Manual test steps
6. Risks / unfinished items
7. Recommended next Claude prompt

The "Recommended next Claude prompt" must be copy-paste ready and
include this project's name and path so Ben does not need to
re-explain the project.

Keep each section tight. The report is the handover.
