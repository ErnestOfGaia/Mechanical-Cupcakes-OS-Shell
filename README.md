This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## For Jules
Jules — read this before starting any issue.

All architectural decisions are locked in `ARCHITECTURE.md`. Read it first. It is the single source of truth for every technical choice in this project. Do not re-decide anything documented there.

Before starting an issue:

1. Read `ARCHITECTURE.md` — decisions are made, not open questions
2. Read `CONTRIBUTING.md` — conventions, naming, do's and don'ts
3. Read the issue carefully — acceptance criteria are the contract
4. Open a PR when done; Ernest reviews and merges

Each issue is scoped to 2–4 hours of focused work. Stay within scope — do not add features not listed in the acceptance criteria. If you notice something out of scope that should be fixed, note it in the PR description rather than doing it.

Do not install packages not in `package.json` without noting why in the PR.

### Branch and PR Rules
Jules creates one branch per task automatically. To keep the repo clean:

- **Before starting:** Check open and merged PRs. If a PR for this issue number already exists (open or merged), do not run the task again — comment on the issue explaining the status instead.
- **PR title:** Use the format `[#N] Short description of what you did` — never use the raw branch name or task ID as the PR title.
- **Closes reference:** Always include `Closes #N` (the GitHub issue number) in the PR description body, where N is the GitHub issue number.
- **No scaffold comments:** Remove any `// Jules: implement...` or `{/* Implemented in Issue #N */}` placeholder comments before opening your PR. Do not add new comments that reference issue or PR numbers — comments should explain why, not what ticket.
- **No empty PRs:** Do not open a PR with 0 files changed. If your task produced no changes, comment on the issue explaining why instead.
