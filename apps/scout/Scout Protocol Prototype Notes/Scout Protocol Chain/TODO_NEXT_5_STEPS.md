---
tags: ['projects', 'scout-protocol', 'product', 'brief']
---

# Scout Protocol: Next 5 Steps
**Rough draft — not the whole roadmap, just what's next**  
*April 2026*

---

## Step 1 — Set Up Your Dev Environment & Install Skills
*Before anything else. Takes ~1 hour.*

Get the tools in place so every session from here forward has the right discipline built in.

- [ ] Clone `addyosmani/agent-skills` and copy the 8 priority skills into your project's `.claude/skills/` folder (see `TOOLS_AND_SKILLS_GUIDE.md` baby-step walkthrough)
- [ ] Create a `CLAUDE.md` file at the Scout Protocol project root — this becomes Claude's standing instructions for every session (spec-first, TDD, ADRs for every major decision, no guessing on official docs)
- [ ] Create a `/docs/decisions/` folder — this is where all ADRs will live
- [ ] Set up `/productivity:memory-management` so Scout Protocol context persists across sessions
- [ ] Verify `Claude in Chrome` MCP is working (open a browser session and confirm Claude can see/interact with it)

---

## Step 2 — Write the 5 Irreversible ADRs
*The decisions you can't undo. Do these before any code.*

Use `/engineering:architecture` for each one. One session per ADR, one file per decision in `/docs/decisions/`.

- [ ] **ADR-001** — Gossip protocol choice (HTTP polling for MVP vs. libp2p gossipsub — see `CRITICAL_ASSESSMENT.md` §1.1)
- [ ] **ADR-002** — Agent & Scout identity format (Ethereum address vs. DID vs. custom key — §5)
- [ ] **ADR-003** — Escrow release conditions (exact trigger logic for settlement — §2.4)
- [ ] **ADR-004** — Capability taxonomy approach (open strings vs. registry — §5)
- [ ] **ADR-005** — Smart contract upgradeability (proxy pattern vs. immutable — §4.1)
- [ ] **ADR-006** — Capability Cache hydration strategy (TTL, eviction policy, refresh triggers — how fresh does the local search index need to be?)

Each ADR should record: the decision, the alternatives considered, and why you chose what you chose. Future you and future contributors need to understand the *why*, not just the *what*.

---

## Step 3 — Write the Complete Protocol Spec
*Fill the gaps identified in the critical assessment. This is the project's constitution.*

Use `spec-driven-development` (agent-skills) for each message type. Output goes in `/docs/protocol-spec.md`.

- [ ] Finalize and formalize the three existing messages (Query, Response, Trial Agreement) with exact field definitions, types, and validation rules
- [ ] Write the missing messages: Work Delivery, Result Return, Escrow Release, Dispute Trigger (see `CRITICAL_ASSESSMENT.md` §1.2)
- [ ] Define both query modes: Live Query (real-time network) and Cache Query (local Capability Cache, instant, possibly stale)
- [ ] Define Capability Cache spec (whatever ADR-006 decided: TTL, eviction, refresh)
- [ ] Define the capability string taxonomy (whatever ADR-004 decided)
- [ ] Define agent/scout identity format (whatever ADR-002 decided)
- [ ] Define protocol versioning strategy (how nodes negotiate versions)

This doc becomes the thing any developer — including you after a two-week break — reads to understand exactly what gets built.

---

## Step 4 — Design & Simulate Tokenomics (Local Chain First)
*Design on paper → simulate with Anvil → then commit to numbers.*

**Chain strategy for the whole project:**
```
Stage 1 (now): Anvil local emulator — instant blocks, free tokens, reset anytime
Stage 2 (multi-node testing): Arbitrum Sepolia testnet — persistent state, real network
Stage 3 (launch): Arbitrum mainnet — real GAIA, real money
```
No testnet until you need persistent state across multiple real machines. Everything before that runs on Anvil.

**Install Foundry (includes Anvil):**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
anvil   # starts a local chain at http://localhost:8545, 10 pre-funded accounts
```

**The tokenomics workflow:**
- [ ] Draft the parameter sheet: supply, distribution %, staking minimums, fee splits, slashing amounts (use `/engineering:architecture` to stress-test the model)
- [ ] Answer the "no extraction" framing from `CRITICAL_ASSESSMENT.md` §2.1 — update language in project docs to be honest about distributed fees
- [ ] Decide: GAIA-only settlement or GAIA + USDC option?
- [ ] Deploy a minimal GAIA mock token contract to Anvil (`anvil` + `forge create`)
- [ ] Simulate a full Scout mission lifecycle on Anvil: stake → query → agree → deliver → settle → slash
- [ ] Observe: does the staking minimum actually deter bad actors at this token price? Does the fee split feel fair to operators? Adjust numbers and re-run
- [ ] Repeat simulation with different tokenomics configs until behavior matches intent
- [ ] Write final `/docs/tokenomics.md` from the simulation results — every number now has evidence behind it

Output: `/docs/tokenomics.md` (written *after* simulation, not before)

---

## Step 5 — Build the MVP Garage (First Working Code)
*Only after Steps 1–4 are done. This is the first real prototype.*

Scope is intentionally tiny: a local Node.js process that represents a Garage node, plus a minimal web UI to talk to it.

- [ ] Decide: fork Freedom Browser as the Garage client, or build a separate Next.js UI? (Freedom Browser's address bar + `scout://` handler = free Walkie Talkie; see `CHAT_SUMMARY_freedom_browser_analysis.md`)
- [ ] Scaffold the project (whichever approach above): Node.js Garage backend + UI
- [ ] Port `vault.js` + `derivation.js` from Freedom Browser — agent identity wallet working in Node.js
- [ ] Build the Walkie Talkie: one Garage node can send a Scout Query to one other node (hardcoded address) and receive a response
- [ ] Minimal Garage UI: Dispatch Window + Fleet Status + minimal **Network Activity panel** (log of raw gossip messages received — even if empty at this stage, the panel should exist)
- [ ] Write tests first (TDD via agent-skills) for vault, derivation, and the query/response round-trip

At the end of Step 5 you have: two nodes that can talk to each other using the Scout Protocol message format, with real identity, a working UI, and a Network Activity panel ready to show gossip traffic once the gossip layer is added. No blockchain yet. No gossip yet. Just the core loop proven.

---

## What Comes After These 5

Just for orientation — not the focus yet:

- Step 6: Deploy escrow contract to Anvil + wire settlement to the Walkie Talkie (still local, no testnet yet)
- Step 7: Add gossip (per ADR-001 decision) so nodes discover each other without hardcoded addresses
- Step 8: Graduate to Arbitrum Sepolia — first multi-machine test with Cape Kiwanda Collective operators

---

*Keep this file updated as steps complete. One checkbox at a time.*
