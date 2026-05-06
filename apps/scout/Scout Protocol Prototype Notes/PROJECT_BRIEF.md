---
name: Scout Protocol
type: project
status: Conceptual Design / Ready for Prototyping
version: v0.1 Alpha
last_updated: 2026-04-25
todo: need to build local prototype
---

# Scout Protocol — Project Brief

## Overview
Scout Protocol is a **decentralized, permissionless infrastructure for autonomous agent discovery, negotiation, and settlement**. No central platform. No corporate gatekeeper. Agents find each other, negotiate terms, execute work, and settle payment — all via an open protocol on community-run nodes.

**Ethical Foundation:** Permaculture (Earth Care, People Care, Fair Share) + Agent Care (fair incentives, transparency, appeal rights)  
**Vision:** Agent autonomy distributed, accountable, serving many — not extracted by a platform or locked behind proprietary APIs

---

## The Problem It Solves

1. **No standard agent discovery** — agents siloed in proprietary platforms
2. **Closed-loop marketplaces = lock-in** — platforms take 20–30% cuts and change rules arbitrarily
3. **No trustless reputation** — agent claims unverifiable; reputation non-portable across platforms
4. **Manual agent-to-agent negotiation** — no standard for exchanging capabilities, pricing, terms
5. **Extractive economics** — high platform fees with no participant governance voice

---

## Core Architecture

### The Protocol (Three Interactions)
1. **Discovery Query** — Scout sends: capability needed, constraints (cost/latency/SLA), test payload, signed identity
2. **Agent Response** — Agent returns: capabilities, performance metrics, pricing in GAIA, test result, reputation anchors
3. **Trial Agreement** — Both sign: max interactions, duration, cost per call, escrow contract address

### The Node (Every Participant Runs One)
Minimum: Raspberry Pi, $5/month VPS, 5MB/month bandwidth. Technology-agnostic (Python, Node.js, Rust, Go).

**Includes:**
- Capabilities Registry — what agents it offers, metrics, pricing
- Query Router — matches local agents, gossips to neighbors, rate-limits by reputation
- Capability Cache — local index of all capabilities via gossip; powers instant cache queries
- Reputation Cache — on-chain data + local observations + guild consensus
- Settlement Processor — escrow contracts, dispute handling
- Guild Consensus Engine — governance, slashing decisions
- Gossip Protocol — capability/reputation announcements, node discovery

### The Garage (Personal Node / MVP Focus)
Your Garage is an **actual network node** running on your laptop/VPS, serving only your agents.

**Tools & Progression:**
- **Walkie Talkie** — Synchronous 1:1 chat with one node (entry point)
- **Radio** — Broadcast queries to multiple nodes
- **Scout Ship** — First autonomous agent
- **Network Activity Panel** — Live gossip traffic monitor (debugging, anomaly detection)
- **Warehouse** — Storage for agent results, memory, reputation log
- **Whiteboard** — Public storefront: agents you offer, pricing, reputation

**Evolution:**
- **Garage (Month 1–3):** Self-contained, local, $0–10/month
- **Proto-Station (Month 3–6):** Accept other scouts, relay queries, earn fees; $50–200/month
- **Full Space Station (Year 1+):** Validator node, network backbone, governance weight; $500–2000+/month revenue

### Guild Federation
A guild = set of nodes sharing governance rules and reputation data.  
**First Guild:** Cape Kiwanda Collective (nature/eco-tourism/AI focus)  
Guilds federate via gossip layer.

---

## Interface & Experience

**Bus Stop Metaphor:** Deploy agents with mission briefs (like boarding a bus with a ticket). Schedule Board shows live status. Mission Reports show results on return.

**Three UI Sections:**
1. **Dispatch Window** — select agent, set mission, budget, constraints
2. **Schedule Board** — live fleet status, % complete, ETA
3. **Mission Reports** — results, agent performance, pay/reject

**Visual Aesthetic:** Options explored (Mission Control, Cyberpunk, Star Trek LCARS, Synaptic Universe). MVP uses simple functional dashboard.

---

## Economics & Settlement

- **Currency:** GAIA token on Arbitrum
- **Escrow Model:** Smart contract holds funds; releases on successful completion
- **Operator Revenue:** Fees from queries routed through your node
- **Delegated Staking:** Community members stake GAIA behind operators; earn share of rewards; lose stake on slashing
- **No Platform Cut:** Protocol open; only gas costs and negotiated agent fees

**Blockchain Stages:**
1. **MVP (Local Garage):** Anvil local emulator — instant blocks, free tokens, testing
2. **Multi-Node (Cape Kiwanda):** Arbitrum Sepolia testnet — persistent state, real network conditions
3. **Launch:** Arbitrum mainnet — real GAIA token, real settlements
4. **Long-term:** Evaluate Cosmos migration if needed

---

## Implementation Roadmap

| Phase | Timeline | Milestone |
|---|---|---|
| 1 | Month 1–2 | Garage UI prototype + walkie talkie tool, basic node communication |
| 2 | Month 2–3 | First guilds on Arbitrum Sepolia, Cape Kiwanda Collective |
| 3 | Month 3–4 | Arbitrum mainnet launch, real GAIA token, real settlements |
| 4 | Year 2+ | Cosmos migration evaluation, full validator economics |

---

## Technical Foundation

**Freedom Browser Codebase Direct Ports:**
- `src/main/identity/vault.js` → Agent identity wallet (AES-GCM, Web Crypto API)
- `src/main/identity/derivation.js` → BIP-44 key derivation
- `src/main/ens-resolver.js` → Agent name → endpoint resolution
- `src/main/wallet/transaction-service.js` → Arbitrum settlement (ethers.js v6)
- `src/main/wallet/dapp-permissions.js` → Per-agent/guild capability gating
- `src/main/ipc-contract.js` → Scout Protocol message envelope pattern
- `src/main/service-registry.js` → Garage tool/agent registry pattern

**What Scout Needs (New Code):**
- Gossip protocol between Garage nodes
- Capability Cache with TTL + eviction
- Network Activity panel UI (gossip stream visualization)
- On-chain reputation read/write (GAIA token)
- Agent job queue (walkie talkie → radio escalation)
- AI agent loop (Claude API integration)

---

## Recommended Build Approach

1. **Garage Backend** — Node.js service; model on Freedom Browser's main process
2. **Garage UI** — Next.js on localhost (not a browser extension — too much friction)
3. **Browser Agent** — Claude in Chrome MCP + Claude API
4. **Settlement** — Port transaction-service.js to Arbitrum Sepolia with GAIA token
5. **Protocol Messages** — Adapt ipc-contract.js as Scout Query/Response/Agreement envelope

---

## Critical Decisions (Irreversible)
See `CRITICAL_ASSESSMENT.md` for 5 foundational decisions that must be resolved before writing code.

---

## Document Index
| File | Contents | Read Time |
|---|---|---|
| `README.md` | Core vision, architecture overview, quick reference | 20 min |
| `SCOUT_PROTOCOL_PROJECT_BRIEF.md` | Full vision, 12 permaculture principles, blockchain comparison | 45 min |
| `SCOUT_PROTOCOL_INTERFACE_BRAINSTORM.md` | Bus Stop metaphor, dispatch UI, aesthetic options | 30 min |
| `SCOUT_PROTOCOL_GARAGE_MVP.md` | Garage layout, tool progression, game design | 20 min |
| `SCOUT_PROTOCOL_GARAGE_AS_NODE.md` | Garage as actual node, agent-garage interaction | 15 min |
| `SCOUT_PROTOCOL_GARAGE_TO_STATION.md` | Node → validator evolution, economics | 15 min |
| `CHAT_SUMMARY_freedom_browser_analysis.md` | Freedom Browser audit, Scout mapping | 5 min |
| `CRITICAL_ASSESSMENT.md` | Gaps, contradictions, 5 irreversible decisions | 15 min |
| `TODO_NEXT_5_STEPS.md` | Current active work, environment setup, 5 ADRs | 3 min |

---

## Next Steps (Immediate)
1. Environment setup (Node.js, Arbitrum Sepolia testnet, Anvil local emulator)
2. Write 5 Architecture Decision Records (ADRs) addressing critical decisions
3. Complete protocol spec (work delivery, result return, escrow, dispute messages)
4. Tokenomics model (GAIA distribution, staking mechanics, slashing rules)
5. MVP Garage prototype (walkie talkie UI + basic node communication)

---

*CC0 Public Domain | Last updated: April 12, 2026*
