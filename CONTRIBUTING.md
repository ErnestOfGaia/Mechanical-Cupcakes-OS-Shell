# Contributing to Mechanical Cupcakes OS Shell

## For Jules (AI Contributor)

Read `ARCHITECTURE.md` first. Every time. It is the contract. Then read `CLAUDE.md` in the specific sub-app you are working in (e.g., `apps/scout/scout-app/CLAUDE.md`).

---

### Pre-Flight Checklist

Before starting any issue:

1. **Check open and merged PRs.** If a PR for this issue number already exists (open or merged), do not start — comment on the issue explaining the status instead.
2. **Read the issue acceptance criteria.** They are the contract. Scope is exactly what's listed — nothing more, nothing less.
3. **Confirm the file paths.** Issues name exact files. If a path says `apps/scout/scout-app/src/lib/envelope.ts`, that is the exact path. Do not guess.

---

### Code Conventions

#### General

- All new files must be TypeScript (`.ts` / `.tsx`).
- No `any` types unless the codebase already uses one in that file.
- Interfaces for component props — always name the props type.
- No inline styles (`style={{ ... }}`).
- No placeholder comments referencing issue or ticket numbers.

#### File Naming

- React components: PascalCase (`NetworkActivityLog.tsx`)
- Utilities and helpers: camelCase (`envelope.ts`)
- Types files: camelCase (`scout.ts`)

#### Shell (`src/`)

- Components: `src/components/<feature>/ComponentName.tsx`
- Use Tailwind CSS 4 utility classes for all styling.
- Use `cn()` from `@/lib/utils` for conditional class names.
- Client components: add `"use client"` at the top of the file.
- Server components: no directive needed (default in App Router).

#### Scout App (`apps/scout/scout-app/src/`)

- Components: `src/components/scout/ComponentName.tsx`
- Utilities: `src/lib/utilityName.ts`
- Types: `src/types/typeName.ts`
- Mock data: `src/mock/dataName.ts`
- **No Tailwind utility classes in JSX markup.** Use class names from `src/app/globals.css`.
- **No new npm packages** without Ernest's approval.
- **No API routes, no fetch(), no localStorage, no framer-motion in v0.1.**
- All state lives in `app/page.tsx` via `useState`.

---

### Commit Messages

Format: `type(scope): short description`

Examples:
```
feat(scout): add NetworkActivityLog component
fix(postcards): use lax sameSite for auth cookies
docs: add ARCHITECTURE.md
chore: exclude brain.json from git
security: apply SameSite lax fix to postcards auth cookies
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `security`, `test`

---

### PR Rules

- **Title format:** `[#N] Short description of what you did` — use the GitHub issue number N.
- **Body must include:** `Closes #N` (the GitHub issue number) so the issue auto-closes on merge.
- **No scaffold comments** — remove any `// Jules: implement...` or `{/* placeholder */}` comments before opening your PR.
- **No 0-file PRs** — if your task produced no file changes, comment on the issue explaining why.
- **No new dependencies** without noting them in the PR description and getting Ernest's sign-off.
- **Build must pass** — run `npm run build` (or `npx tsc --noEmit` at minimum) before submitting.

---

### Verification Before Submitting

For the **Scout app** (`apps/scout/scout-app/`):
```bash
npm run build        # must succeed with zero errors
npx tsc --noEmit     # must have zero type errors
```

For the **shell** (root):
```bash
npm run lint         # must pass
npm run build        # must succeed
```

---

## For Human Contributors

- Open an issue before starting significant work.
- Assign yourself to prevent duplicate effort.
- Tag Jules-suitable issues with the `good-for-jules` label.
- Jules-ready issues must specify **exact file paths** — not directory guesses. Include code snippets for the expected interfaces or shapes where helpful.
- If an issue depends on another, state the dependency explicitly in the body.
