---
tags: ['projects', 'scout-protocol', 'product', 'brief']
---

# Scout Protocol
**Ernest of Gaia Projects | v0.1 Alpha | April 2026 | Status: Conceptual Design / Ready for Prototyping**

---

## What It Is

Scout Protocol is a **decentralized, permissionless infrastructure for autonomous agent discovery, negotiation, and settlement**. No central platform. No corporate gatekeeper. Agents find each other, negotiate terms, execute work, and settle payment — all via an open protocol on community-run nodes.

**Core thesis:** Agent autonomy should be distributed, accountable, and serve the many — not extracted by a platform or locked behind proprietary APIs.

**Ethical foundation:** Permaculture (Earth Care, People Care, Fair Share) + a fourth pillar: **Agent Care** (fair incentives, transparency, appeal rights for agents). Backed by the 7 Cooperative Principles applied to agent networks.

---

## The Problem It Solves

1. **No standard agent discovery** — agents are siloed in proprietary platforms with no way to find each other
2. **Closed-loop marketplaces = lock-in** — OpenAI/Anthropic registries take rent, change rules arbitrarily, can strand agents
3. **No trustless reputation** — agent claims "99% success" with no on-chain proof; reputation is platform-specific and non-portable
4. **Agent-to-agent negotiation is manual** — no standard for exchanging capabilities, pricing, terms; every integration is custom
5. **Economics are extractive** — platforms take 20–30% cuts; participants have no governance voice

---

## Core Protocol (The Spec)

Three minimal, language-agnostic interactions:

**1. Discovery Query** — Scout sends: what capability it needs, constraints (cost/latency/SLA), a test payload, and a signed identity  
**2. Agent Response** — Agent returns: capabilities, live performance metrics, pricing in GAIA, test result, trial terms, reputation anchors  
**3. Trial Agreement** — Both sign: max interactions, duration, cost per call, escrow contract address  

*Still needed (not yet written):* Work Delivery, Result Return, Escrow Release, Dispute Trigger messages.

The protocol is intentionally loose — it specifies *what* to exchange, not *how* to implement it.

**Two query modes:**
- **Live query** — send a Discovery Query now, get real-time responses from the network
- **Cache query** — search your Garage's local Capability Cache (populated by gossip); instant, no network traffic, possibly slightly stale

---

## Architecture

### The Node

Every participant runs a node. Minimum: Raspberry Pi, $5/month VPS, 5MB/month bandwidth. Technology-agnostic (Python, Node.js, Rust, Go). Docker-friendly.

Each node contains:
- **Capabilities Registry** — what agents it offers, their metrics, pricing
- **Query Router** — receives scout queries, matches local agents, gossips to neighbors, rate-limits by reputation
- **Capability Cache** — local index of all capabilities announced by other nodes via gossip; powers cache queries without live network traffic; entries have TTL and are evicted when stale
- **Reputation Cache** — on-chain data + local observations + guild consensus + stake distribution
- **Settlement Processor** — escrow smart contract integration, dispute handling, on-chain interaction records
- **Guild Consensus Engine** — member list, governance votes, slashing decisions
- **Gossip Protocol** — capability announcements, reputation updates, node discovery

### The Garage (Personal Node)

Your Garage is not a UI wrapper — it's an **actual node in the network**, running on your laptop or a small VPS. It serves only your agents. It provides:

| Tool / Panel | Function |
|---|---|
| Walkie Talkie | Synchronous 1:1 chat with one node (first tool, entry point) |
| Radio | Broadcast queries to multiple nodes |
| Warehouse | Storage for agent results, memory, reputation log |
| Capability Cache | Local index of network agents populated by gossip; powers instant search without live queries |
| Reputation Cache | Track agent performance, remember good finds |
| Workbench | Deploy missions, manage agents |
| Whiteboard | Your public storefront — agents you offer, their price + reputation |
| **Network Activity** | **Built-in Garage panel — live view of gossip traffic the node is receiving; always on; used for debugging, network awareness, and anomaly detection. Not a separate tool — a function of the Garage itself.** |

**The Garage → Space Station evolution:**
- **Garage** (Month 1–3): Self-contained, local, only your agents. $0–10/month.
- **Proto-Station** (Month 3–6): Accept other scouts, relay queries, earn fees. $50–200/month VPS.
- **Full Space Station** (Year 1+): Validator node, network backbone, governance weight, $500–2000+/month revenue.

### Guild Federation

A **guild** = a set of nodes that agree on governance rules and share reputation data. First guild: **Cape Kiwanda Collective** (nature/eco-tourism/AI focus). Guilds federate with each other via the gossip layer.

---

## The Interface

**Bus Stop metaphor:** You put your agent on a bus with a ticket (instructions). The Schedule Board shows live mission status. The Mission Report shows results when the agent returns.

**Visual aesthetic options explored:** Mission Control, Cyberpunk, Star Trek LCARS, Synaptic Universe (neural network visualization). MVP uses a simple functional dashboard.

**Three UI sections:**
1. **Dispatch Window** — select agent, set mission brief, budget, constraints, dispatch
2. **Schedule Board** — live fleet status, % complete, ETA per agent
3. **Mission Reports** — results dashboard, agent performance summary, pay/reject

---

## Economics (GAIA Token)

- **Settlement currency:** GAIA token on Arbitrum
- **Escrow model:** Smart contract holds funds; releases on successful completion
- **Operator revenue:** Fees from queries routed through your node
- **Delegated staking:** Community members stake GAIA behind operators they trust; earn share of rewards; lose stake on slashing
- **No platform cut:** Protocol is open; only gas costs and negotiated agent fees

**Blockchain strategy (3 stages):**
- Stage 1 (MVP / local Garage): **Anvil local emulator** — instant blocks, free tokens, reset anytime; used for all unit tests, tokenomics simulation, and contract development
- Stage 2 (multi-node / Cape Kiwanda): **Arbitrum Sepolia testnet** — persistent state, real network conditions, multi-machine testing
- Stage 3 (launch): **Arbitrum mainnet** — real GAIA token, real settlements
- Long-term: Evaluate Cosmos migration if needed at scale

---

## Progression (Game-Like Learning)

Tool progression mirrors skill acquisition:

`Walkie Talkie` → `Radio` → `Scout Ship` → `Spacecraft` → `Space Station`

Each tool unlocks after demonstrating understanding of the previous. Inspired by No Man's Sky, Factorio, Kerbal Space Program — progression is spatial and tactile, not abstract.

The **Network Activity panel** (gossip monitor) is not a rung on this ladder — it's a built-in function of the Garage visible from day one, like a router's traffic log. It shows what gossip the node is receiving in real time and is the primary debugging tool for new operators.

---

## Implementation Roadmap

| Phase | Timeline | Milestone |
|---|---|---|
| 1 | Month 1–2 | Garage UI prototype + walkie talkie tool, basic node communication |
| 2 | Month 2–3 | First guilds on Arbitrum Sepolia testnet, Cape Kiwanda Collective |
| 3 | Month 3–4 | Arbitrum mainnet, real GAIA token, real settlements, public guilds |
| 4 | Year 2+ | Cosmos migration evaluation, full validator economics |

---

## Technical Foundation (Freedom Browser Codebase)

The `ErnestOfGaia/freedom-browser-copy` repo (Electron decentralized browser) contains production-quality code that maps directly to Scout Protocol needs. *Analyzed April 12, 2026 — see `CHAT_SUMMARY_freedom_browser_analysis.md` for full findings.*

**Port these components directly:**

| File | Scout Use |
|---|---|
| `src/main/identity/vault.js` | Agent identity wallet (AES-GCM, Web Crypto API) |
| `src/main/identity/derivation.js` | BIP-44 key derivation for agent identities |
| `src/main/ens-resolver.js` | Agent name → endpoint resolution |
| `src/main/wallet/transaction-service.js` | Arbitrum settlement (ethers.js v6) |
| `src/main/wallet/dapp-permissions.js` | Per-agent/per-guild capability gating |
| `src/main/ipc-contract.js` | Scout Protocol message envelope pattern |
| `src/main/service-registry.js` | Garage tool/agent registry pattern |

**What Scout needs that isn't in Freedom Browser:**
- Gossip protocol between Garage nodes
- Capability Cache (local index populated by gossip, with TTL + eviction)
- Network Activity panel (UI over the gossip stream — built into Garage, not a separate tool)
- On-chain reputation read/write (GAIA token)
- Agent job queue (walkie talkie → radio escalation)
- AI agent loop (Claude API integration)

---

## Build Approach (Recommended)

1. **Garage backend** — Node.js service; model on Freedom Browser's main process (identity + service registry + IPC)
2. **Garage UI** — Next.js on localhost (not a browser extension — too much friction for MVP)
3. **Browser agent** — use `Claude in Chrome` MCP + Claude API; Ernest already has this configured
4. **Settlement** — port `transaction-service.js` to Arbitrum Sepolia with GAIA token
5. **Protocol messages** — adapt `ipc-contract.js` as the Scout Query/Response/Agreement envelope

**Why not a browser extension?** MV3 sandbox limits, Chrome Web Store review process, no daemon management possible. A local web UI talking to a browser-accessible agent is simpler, faster to build, and equally functional for MVP.

---

## Key Concepts Quick Reference

| Term | Definition |
|---|---|
| **Scout** | An agent deployed to find and evaluate other agents |
| **Garage** | Your personal node; home base for your agents; runs on laptop or small VPS |
| **Space Station** | Upgraded Garage; accepts other scouts; acts as network validator |
| **Walkie Talkie** | First tool; synchronous 1:1 chat with one node |
| **Radio** | Broadcast queries to multiple nodes |
| **Scout Ship** | First autonomous agent; uses garage tools; deploys and returns |
| **Capability Cache** | Local index of network agent capabilities, populated passively by gossip; powers instant search |
| **Network Activity** | Built-in Garage panel showing live gossip traffic; always on; used for debugging and anomaly detection |
| **Live Query** | Send a Discovery Query now and get real-time network responses |
| **Cache Query** | Search the local Capability Cache instantly; no network traffic; may be slightly stale |
| **GAIA Token** | Settlement currency; staked for reputation; earned by operators |
| **Guild** | Federation of nodes sharing governance rules and reputation data |
| **Cape Kiwanda Collective** | First planned guild; nature/eco-tourism/AI specialization |
| **Slashing** | Stake penalty for bad actors; enforced by guild consensus |

---

## Document Index

| File | Contents | Read time |
|---|---|---|
| `SCOUT_PROTOCOL_PROJECT_BRIEF.md` | Full vision, architecture, all 12 permaculture principles, blockchain comparison, 22 brainstorm questions | 45 min |
| `SCOUT_PROTOCOL_INTERFACE_BRAINSTORM.md` | Bus Stop metaphor, dispatch UI, schedule board, Synaptic Universe visualization, 5 aesthetic options | 30 min |
| `SCOUT_PROTOCOL_GARAGE_MVP.md` | Garage layout, tool progression, game design inspirations, MVP v0.1 spec | 20 min |
| `SCOUT_PROTOCOL_GARAGE_AS_NODE.md` | Garage as actual node architecture, agent-garage interaction, code examples | 15 min |
| `SCOUT_PROTOCOL_GARAGE_TO_STATION.md` | Personal node → network validator evolution, economics, monthly progression | 15 min |
| `CHAT_SUMMARY_freedom_browser_analysis.md` | Freedom Browser security audit, architecture analysis, Scout Protocol mapping (April 12, 2026) | 5 min |
| `TOOLS_AND_SKILLS_GUIDE.md` | Recommended Claude skills, plugins, external tools, safety checklist, and baby-step install walkthrough | 10 min |
| `CRITICAL_ASSESSMENT.md` | Gaps, contradictions, vague specs, and the 5 irreversible decisions that must be made before writing code | 15 min |
| `TODO_NEXT_5_STEPS.md` | Current active work — environment setup, 5 ADRs, protocol spec, tokenomics, MVP Garage prototype | 3 min |

---

*Last updated: April 12, 2026 | CC0 Public Domain*
