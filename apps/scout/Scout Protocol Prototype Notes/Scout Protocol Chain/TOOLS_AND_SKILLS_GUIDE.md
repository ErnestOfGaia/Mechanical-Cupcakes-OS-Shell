---
tags: ['projects', 'scout-protocol', 'product', 'guide']
---

# Scout Protocol: Tools, Skills & Plugins Guide
**What to learn and install to build this right | April 2026**

---

## Purpose

This document lists the Claude skills, plugins, and external tools recommended for building Scout Protocol — with safety notes, relevance ratings, and a baby-step walkthrough for the most important one. The goal: maximum adoptability, security, and forward-thinking architecture with minimal wasted effort.

---

## Priority Stack at a Glance

| Tool | Type | Priority | Why |
|---|---|---|---|
| `addyosmani/agent-skills` | External plugin | **P0 — Install first** | Engineering discipline backbone for the whole project |
| `claude-api` skill | Built-in Claude skill | **P0** | Core of the agent loop (Scout agents call Claude) |
| `engineering:*` skills | Built-in Claude skills | **P0** | Architecture, security, debugging, testing |
| `anthropic-skills:schedule` | Built-in Claude skill | **P1** | Automate recurring scout missions |
| `productivity:*` skills | Built-in Claude skills | **P1** | Memory system + task tracking across sessions |
| `engineering:incident-response` | Built-in Claude skill | **P1** | Mainnet incidents need a playbook |
| MCP: Claude in Chrome | Already configured | **P1** | Browser agent — replaces the extension idea |
| `anthropic-skills:skill-creator` | Built-in Claude skill | **P2** | Build custom Scout Protocol skills |

---

## Part 1: addyosmani/agent-skills

**Repo:** https://github.com/addyosmani/agent-skills  
**Author:** Addy Osmani (Google Chrome DevRel Lead)  
**License:** MIT | **Stars:** 13,342 | **Updated:** April 12, 2026 (active)  
**Safety verdict: SAFE** — Markdown-only, no executable code, no external API calls, no dangerous permissions. Prompt injection explicitly guarded against in the browser testing skill. Built-in security awareness throughout.

### What It Is

21 engineering skills that enforce senior-developer practices across the full development lifecycle. Each skill is a structured Markdown workflow that guides Claude through a phase of work: specify → plan → build → test → review → ship. Designed specifically for AI coding agents.

### Why Scout Protocol Needs It

Scout Protocol has three layers where mistakes are expensive: smart contracts (bugs are permanent), the gossip protocol (security flaws spread), and the agent reputation system (wrong data corrupts trust). These skills enforce the discipline to build each layer correctly.

**Most critical for Scout Protocol:**

| Skill | Scout Protocol use |
|---|---|
| `spec-driven-development` | Write the Scout Protocol message spec before any code touches it |
| `api-and-interface-design` | Design contract ABIs and node APIs — Hyrum's Law means every API you ship becomes a permanent commitment |
| `test-driven-development` | Smart contracts must have tests written before implementation — no exceptions |
| `security-and-hardening` | Vault encryption, key management, settlement escrow — all security-critical |
| `documentation-and-adrs` | Capture every protocol decision (why Arbitrum, why gossip vs. DHT, why GAIA tokenomics) as Architecture Decision Records |
| `source-driven-development` | Always pull from official Ethereum/ethers.js docs, not training data — the ecosystem moves too fast |
| `shipping-and-launch` | Staged testnet → mainnet rollout with monitoring and rollback plans |
| `planning-and-task-breakdown` | Decompose each milestone into testable vertical slices |

### Baby-Step Walkthrough: Install and Use

**Step 1 — Clone the repo**
```bash
git clone https://github.com/addyosmani/agent-skills.git
cd agent-skills
```

**Step 2 — Understand the structure**

Each skill lives in its own folder:
```
agent-skills/
├── spec-driven-development/
│   └── SKILL.md          ← the actual skill
├── test-driven-development/
│   └── SKILL.md
├── security-and-hardening/
│   └── SKILL.md
... (21 skills total)
```

Open any `SKILL.md` and read it — they're short, structured, and immediately actionable.

**Step 3 — Install into Claude Code**

Option A: Copy individual skills into your project's `.claude/` folder
```bash
# From your Scout Protocol project root
mkdir -p .claude/skills
cp -r /path/to/agent-skills/spec-driven-development .claude/skills/
cp -r /path/to/agent-skills/test-driven-development .claude/skills/
cp -r /path/to/agent-skills/security-and-hardening .claude/skills/
cp -r /path/to/agent-skills/api-and-interface-design .claude/skills/
cp -r /path/to/agent-skills/documentation-and-adrs .claude/skills/
```

Option B: Reference via CLAUDE.md (simplest)

In your project's `CLAUDE.md`, add a section:
```markdown
## Engineering Skills

This project uses the following agent-skills workflow disciplines:
- Spec-driven: write spec before code
- TDD: failing test before implementation
- ADRs: document every architectural decision in /docs/decisions/
- Source-driven: always verify against official docs, never rely on training data
- Security-first: apply three-tier enforcement (Always Do / Ask First / Never Do)
```

**Step 4 — Use your first skill (Spec-Driven Development)**

When starting any new Scout Protocol feature, open a Claude Code session and say:

> "Use the spec-driven-development skill to write the spec for [feature]"

Claude will walk you through: defining success criteria, listing assumptions, identifying edge cases, and writing the spec before a single line of code is written.

**Step 5 — Use for the protocol message spec**

The Scout Protocol Query/Response/Agreement messages are your most important API surface. Run spec-driven-development on each message type before implementing. Example prompt:

> "Use spec-driven-development to write the full spec for the Scout Discovery Query message. It must define: required fields, optional fields, validation rules, signing requirements, failure modes, and versioning strategy."

**Step 6 — Use security-and-hardening on every PR**

Before merging any code that touches the vault, key derivation, settlement, or gossip layer:

> "Use security-and-hardening to review this diff. Focus on: secrets handling, input validation, cryptographic operations, and trust boundaries between the Garage node and connected agents."

**Step 7 — Use documentation-and-adrs for every major decision**

Create a `/docs/decisions/` folder. When you choose Arbitrum over Cosmos, or gossip over DHT, or AES-GCM over another encryption scheme, run:

> "Use documentation-and-adrs to write an ADR for: why we chose [X] over [Y]."

This becomes your project memory — why things are the way they are, readable by future contributors.

---

## Part 2: Built-in Claude Skills

These come pre-installed in Claude Code. Use the `/skill-name` syntax to invoke them.

### P0 — Use on Every Session

**`/claude-api`**  
Trigger when: writing any code that calls the Anthropic API or Agent SDK — which is the core of every Scout agent. This skill loads the correct, current SDK patterns so you don't build against outdated API shapes. Every Scout agent, every Garage AI loop, every mission dispatcher uses this.

**`/engineering:architecture`**  
Use to write Architecture Decision Records (ADRs) for every major Scout Protocol design choice. Also use when choosing between implementation approaches (gossip protocol design, token economics, state management). Returns a full ADR document you can commit to `/docs/decisions/`.

**`/engineering:code-review`**  
Run on every PR before merge. Point it at a diff or PR URL. Critical for security-sensitive code (vault, settlement, key derivation). Will catch what you miss when you're deep in context.

**`/engineering:debug`**  
Structure: reproduce → isolate → diagnose → fix. Use when blockchain calls fail, when gossip messages are dropped, when agent connections time out. Prevents the "change random things until it works" trap.

**`/engineering:testing-strategy`**  
Run before writing tests for any new Scout Protocol component. Returns a full test plan: unit, integration, and end-to-end test cases. Especially important for smart contracts and the gossip layer.

### P1 — Use Regularly

**`/anthropic-skills:schedule`**  
Create scheduled agents that run on a cron schedule. Use for: automated health checks of Garage nodes, periodic reputation sync from chain, testnet deployment jobs, monitoring alerts. This is how the always-on side of Scout Protocol gets built without babysitting it.

**`/productivity:memory-management`**  
Two-tier memory system that makes Claude remember Scout Protocol context across sessions — project decisions, agent names, guild structures, current sprint. Prevents re-explaining context every conversation.

**`/productivity:task-management`**  
Shared `TASKS.md` file for tracking work. Use for sprint planning across the four Scout Protocol phases. Keeps current work visible in every session.

**`/engineering:incident-response`**  
When something breaks on testnet or mainnet: triage, communicate, write postmortem. Build the playbook now, before you need it. A Garage node going offline or a settlement contract bug hitting mainnet needs a practiced response.

**`/engineering:deploy-checklist`**  
Run before every testnet and mainnet deployment. Critical when deploying smart contracts — no takebacks on-chain. Also use for Garage node software releases.

**`/engineering:standup`**  
Generates a standup from recent git activity. Useful for keeping momentum visible and communicating project state to early community members.

### P2 — Use When Needed

**`/anthropic-skills:skill-creator`**  
Once you have Scout Protocol patterns solidified (how to test a gossip message, how to verify a settlement, how to audit a guild vote), encode them as custom skills. Future you — and future contributors — will thank you.

**`/engineering:documentation`**  
Write technical docs, README files, and protocol specs. Use for the public-facing Scout Protocol spec document that third-party node operators will implement against.

**`/engineering:system-design`**  
Design systems, services, and architectures. Use when scoping new Scout Protocol subsystems: the reputation oracle, the guild consensus engine, the agent job queue.

**`/engineering:tech-debt`**  
Run periodically to identify, categorize, and prioritize technical debt. Scout Protocol will accumulate debt fast in early phases — this keeps it from becoming a liability before mainnet.

---

## Part 3: MCP Tools (Already Configured)

These are live in your Claude Code environment right now.

### Claude in Chrome MCP
**Status:** Already configured  
**Use for:** Browser agent automation — this replaces the browser extension idea entirely for MVP. Instead of building and publishing an extension, use this to control a browser, interact with dApp UIs, run automated tests against the Garage web interface, and monitor the Schedule Board.

Example uses:
- Automated testing of the Dispatch Window UI
- Monitor Garage node dashboard for status changes
- Interact with Arbitrum testnet block explorers
- Scrape agent capability listings from network nodes

### Google Calendar + Gmail MCP
**Status:** Already configured  
**Use for:** Coordinating with guild members, scheduling testnet launches, sending status updates to early operators. Useful once Cape Kiwanda Collective node operators need coordination.

---

## Part 4: External Tools to Add (Not Yet Configured)

These are tools worth setting up before you reach the relevant phase.

### Blockchain Development
| Tool | Use | Install |
|---|---|---|
| **Hardhat** | Smart contract development, testing, deployment | `npm install --save-dev hardhat` |
| **Foundry** | Faster contract testing, fuzzing, formal verification | `curl -L https://foundry.paradigm.xyz \| bash` |
| **ethers.js v6** | Already in Freedom Browser codebase — use same version | Already available |
| **Arbitrum SDK** | Arbitrum-specific deployment and bridging | `npm install @arbitrum/sdk` |
| **OpenZeppelin Contracts** | Battle-tested escrow, token, and governance contracts | `npm install @openzeppelin/contracts` |

### Node Infrastructure
| Tool | Use | Install |
|---|---|---|
| **libp2p** | Peer-to-peer gossip protocol for Garage nodes | `npm install libp2p` |
| **better-sqlite3** | Already in Freedom Browser — use for Garage local storage | Already available |
| **Docker** | Container-friendly Garage node deployment | docker.com |
| **PM2** | Process manager for always-on Garage node | `npm install -g pm2` |

### Testing & Quality
| Tool | Use | Install |
|---|---|---|
| **Vitest** | Fast unit testing for Node.js Garage backend | `npm install -D vitest` |
| **Playwright** | End-to-end browser testing for Garage UI | `npm install -D @playwright/test` |
| **Slither** | Static analysis for Solidity smart contracts | `pip install slither-analyzer` |
| **Mythril** | Smart contract security analysis | `pip install mythril` |

### Monitoring & Observability
| Tool | Use | Install |
|---|---|---|
| **Grafana + Prometheus** | Garage node metrics dashboard | docker compose |
| **Sentry** | Error tracking for Garage node software | `npm install @sentry/node` |
| **Alchemy / QuickNode** | Reliable Arbitrum RPC with monitoring | API key (free tier available) |

---

## Recommended Learning Order

If you're starting from zero on any of these, here's the sequence that builds on itself:

1. **Install agent-skills** (Step 1–3 in the walkthrough above) — 15 minutes
2. **Run `/engineering:architecture`** on the Scout Protocol node design — produces your first ADR
3. **Read** `spec-driven-development/SKILL.md` — 10 minutes — then write the Scout Protocol message spec using it
4. **Set up Hardhat** + write one test for a mock settlement escrow — proves the TDD flow works
5. **Run `/claude-api`** skill and build a minimal Scout agent that calls Claude — this is your first working agent
6. **Use `/anthropic-skills:schedule`** to run a daily health check on your Garage node
7. **Set up `/productivity:memory-management`** so every future session has Scout Protocol context loaded
8. **Use `/anthropic-skills:skill-creator`** to encode your first Scout-specific skill (e.g., "how to validate a Scout Protocol message")

---

## Safety Checklist

Before going to mainnet, verify you've used these skills at least once on production code:

- [ ] `security-and-hardening` on vault + key derivation code
- [ ] `security-and-hardening` on smart contract escrow
- [ ] `security-and-hardening` on gossip message parsing (injection risk)
- [ ] `test-driven-development` on all settlement contract functions
- [ ] `api-and-interface-design` on every public-facing protocol message
- [ ] `documentation-and-adrs` for: blockchain choice, token economics, gossip design, guild governance model
- [ ] `engineering:deploy-checklist` before every mainnet deployment
- [ ] Slither + Mythril run on all Solidity contracts
- [ ] `/engineering:code-review` on all security-critical PRs

---

*Last updated: April 12, 2026 | Part of Scout Protocol documentation suite*
