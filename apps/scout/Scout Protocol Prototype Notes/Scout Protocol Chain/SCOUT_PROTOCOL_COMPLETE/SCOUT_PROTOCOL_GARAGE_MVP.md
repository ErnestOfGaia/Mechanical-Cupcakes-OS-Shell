# Scout Protocol: The Garage MVP
## A Game-Like Learning Environment for Agent Infrastructure

---

## Core Concept

Instead of a dashboard, users start in a **Garage**—a personal workspace where they:
- Learn skills by using tools
- Build up their agent infrastructure gradually
- Progress from "walkie talkie" (basic scouting) → "spacecraft" (full agent operations)
- See their workspace evolve as they learn and accomplish things

**Inspiration:** Interstellar space games (No Man's Sky, Star Citizen, Kerbal Space Program) where progression is spatial and tactile, not abstract.

---

## The Garage Layout (MVP)

```
                    YOUR GARAGE
        ┌────────────────────────────────┐
        │                                │
        │  ┌─────────────────────────┐   │
        │  │   WHITEBOARD            │   │
        │  │   (Your Storefront)     │   │
        │  │                         │   │
        │  │ "Code Review Agent"     │   │
        │  │ Reputation: 9.2/10      │   │
        │  │ Price: $0.02/call       │   │
        │  │ Status: ONLINE          │   │
        │  │                         │   │
        │  │ [EDIT] [HIDE] [REMOVE]  │   │
        │  └─────────────────────────┘   │
        │                                │
        │  WORKBENCH                     │
        │  ┌──────┐  ┌──────┐ ┌───────┐ │
        │  │WALKIE│  │ NEXT?│ │ NEXT? │ │
        │  │TALKIE│  │      │ │       │ │
        │  │ (IN  │  │      │ │       │ │
        │  │ USE) │  │      │ │       │ │
        │  └──────┘  └──────┘ └───────┘ │
        │                                │
        │  WAREHOUSE                     │
        │  ┌────────────────────────┐    │
        │  │ Storage: 3 items       │    │
        │  │ • Agent reputation log │    │
        │  │ • Scout mission #1     │    │
        │  │ • Network map (partial)│    │
        │  └────────────────────────┘    │
        │                                │
        │  TOOLBOX                       │
        │  ┌──────────────────────────┐  │
        │  │ Customize Garage         │  │
        │  │ [+] Add storage rack     │  │
        │  │ [+] Upgrade workbench    │  │
        │  │ [+] Unlock new tools     │  │
        │  └──────────────────────────┘  │
        │                                │
        │  ◀ BACK TO UNIVERSE            │
        │                                │
        └────────────────────────────────┘
```

---

## The Progression Path

### **Phase 0: The Walkie Talkie (First Tool)**

**What it is:** A simple, synchronous communication tool between you and one node operator.

```
        WALKIE TALKIE INTERFACE
        
        ┌────────────────────────────┐
        │ WALKIE TALKIE              │
        │ (Connected to: CapeK-Node) │
        │ Signal: 🟢🟢🟢 Strong      │
        ├────────────────────────────┤
        │                            │
        │ You: "Hello? Can you hear?"│
        │ [10:32 AM]                 │
        │                            │
        │ NodeOp: "Loud and clear!"  │
        │ [10:32 AM]                 │
        │                            │
        │ You: "I'm looking for code │
        │ reviewers. Got any?"       │
        │ [10:33 AM]                 │
        │                            │
        │ NodeOp: "Yup! Agent-X     │
        │ and Agent-Y are here.      │
        │ Both good. Want details?"  │
        │ [10:33 AM]                 │
        │                            │
        │ ┌──────────────────────┐   │
        │ │ [TEXT INPUT FIELD]   │   │
        │ │ Say something...     │   │
        │ │                      │   │
        │ │ [SEND] [HANG UP]     │   │
        │ └──────────────────────┘   │
        │                            │
        └────────────────────────────┘

        Skills Learned:
        ✓ Basic communication (talking to one node)
        ✓ Asking for agents (query structure)
        ✓ Understanding node operator responses
```

**Teaching moment:**
- Human realizes: "Oh, nodes are just people I can talk to!"
- Human learns: Agents live on nodes, nodes are discoverable
- Human discovers: One node can point to other nodes ("try NodeB")

**Next step:** Human can now upgrade to the next tool.

---

### **Phase 1: The Radio (Broadcasting)**

Once you've used the walkie talkie and understand nodes, unlock the radio.

```
        RADIO INTERFACE
        
        ┌─────────────────────────────┐
        │ RADIO BROADCAST             │
        │ (Reaches: 5 nearby nodes)   │
        │ Signal strength: 🟢🟢       │
        ├─────────────────────────────┤
        │                             │
        │ Channel: GUILD_DISCOVERY    │
        │                             │
        │ You broadcast:              │
        │ "Looking for code reviewers!│
        │ Budget: $5, 99%+ success"   │
        │ [10:40 AM]                  │
        │                             │
        │ Responses (live):            │
        │ 🔔 NodeA: "We got 3!"       │
        │ 🔔 NodeB: "1 agent here"    │
        │ 🔔 NodeC: "None, try NodeE" │
        │ 🔔 NodeD: "2 candidates"    │
        │ 🔔 NodeE: "5 strong matches"│
        │                             │
        │ Total responses: 5          │
        │ Agents found: 11            │
        │                             │
        │ ┌─────────────────────────┐ │
        │ │ [BROADCAST] [TUNE DOWN] │ │
        │ │ [SWITCH CHANNEL]        │ │
        │ └─────────────────────────┘ │
        │                             │
        └─────────────────────────────┘

        Skills Learned:
        ✓ Broadcasting queries (reaching multiple nodes)
        ✓ Understanding response patterns
        ✓ Evaluating candidates from multiple sources
        ✓ Network topology (nodes forward your message)
```

**Teaching moment:**
- Human realizes: "Broadcasting reaches more nodes than walkie talkie!"
- Human learns: Gossip protocol (queries propagate through network)
- Human sees: Network effects (5 nodes → 11 agents)

---

### **Phase 2: The Scout Ship (Your First Autonomous Agent)**

```
        SCOUT SHIP WORKSHOP
        ┌────────────────────────────────┐
        │ YOUR FIRST SCOUT SHIP          │
        │                                │
        │ Status: READY FOR DEPLOYMENT   │
        │                                │
        │        ╱╲                       │
        │       ╱  ╲                      │
        │      ╱    ╲                     │
        │     ╱ SCOUT ╲                   │
        │    ╱__________╲                 │
        │   /            \                │
        │                                │
        │ Configuration:                 │
        │ ┌──────────────────────────┐   │
        │ │ Mission: Find 5 code     │   │
        │ │         reviewers        │   │
        │ │ Budget: $5.00            │   │
        │ │ Time: 4 hours            │   │
        │ │ Requirements:             │   │
        │ │  • Min success: 95%      │   │
        │ │  • Max latency: 200ms    │   │
        │ │                          │   │
        │ │ [ LAUNCH ]               │   │
        │ │ [ EDIT ] [ SAVE PRESET ] │   │
        │ └──────────────────────────┘   │
        │                                │
        │ Launch destination:            │
        │ "Nearest federated nodes"      │
        │ (auto-discovered)              │
        │                                │
        └────────────────────────────────┘

        What changed:
        - You don't need to manually query
        - Agent flies to nodes autonomously
        - You set parameters once, it executes
        - Can watch it travel (optional)
```

**Teaching moment:**
- Human realizes: "My agent can do this on its own!"
- Human learns: Agent autonomy replaces human radio work
- Human sees: Massive time savings (send agent, check results later)

---

### **Phase 3: The Spacecraft (Multiple Agents, Better Control)**

As you launch more scout ships and they succeed, you unlock a **Spacecraft** with:
- Multiple agents (crew)
- Better sensors (more detailed reputation data)
- Faster travel (better routing algorithms)
- Cargo hold (store agents, results, contracts)

```
        SPACECRAFT COMMAND
        
        ┌────────────────────────────────┐
        │ SPACECRAFT BRIDGE              │
        │                                │
        │         ╱╲╱╲╱╲                 │
        │        ╱  ||  ╲                │
        │       ╱   ||   ╲               │
        │      ╱ SHIP ||   ╲              │
        │     ╱   ||  ║  ║  ╲             │
        │    ╱     || ║  ║   ╲            │
        │                                │
        │ Crew:                          │
        │ • Scout-1 (CodeReview)         │
        │ • Scout-2 (DataValidation)     │
        │ • Scout-3 (NatureGuides)       │
        │                                │
        │ Fleet Status:                  │
        │ 🟢 Scout-1: Searching...       │
        │ 🟢 Scout-2: Negotiating...     │
        │ 🟡 Scout-3: Queued             │
        │                                │
        │ [ LAUNCH SCOUT-3 ]             │
        │ [ VIEW FLEET STATUS ]          │
        │ [ MANAGE CONTRACTS ]           │
        │ [ UPGRADE SPACECRAFT ]         │
        │                                │
        └────────────────────────────────┘
```

---

### **Phase 4: The Space Station (Node Operator)**

Eventually, you graduate from just sending agents to **running your own node**.

```
        SPACE STATION VALIDATOR
        
        ┌────────────────────────────────┐
        │ YOUR SPACE STATION             │
        │ Status: ACTIVE NODE            │
        │                                │
        │        ◼════════════╗          │
        │        ║            ║          │
        │      ┌─╨────────────╨─┐        │
        │      │                │        │
        │      │   STATION      │        │
        │      │                │        │
        │      └────────────────┘        │
        │                                │
        │ Node Info:                     │
        │ • ID: cape-kiwanda-node-1     │
        │ • Agents hosted: 5             │
        │ • Reputation: 8.5/10           │
        │ • Uptime: 99.2%                │
        │ • Revenue: $234.50 (month)     │
        │                                │
        │ Bus Department:                │
        │ ┌──────────────────────────┐   │
        │ │ Incoming scouts:          │   │
        │ │ • Scout-A (Tech Guild)    │   │
        │ │ • Scout-B (CapeK Guild)   │   │
        │ │ • Scout-C (East Coast)    │   │
        │ │                           │   │
        │ │ [ VIEW LOGS ]             │   │
        │ │ [ MANAGE AGENTS ]         │   │
        │ │ [ CLAIM REWARDS ]         │   │
        │ └──────────────────────────┘   │
        │                                │
        │ Guild Federation:              │
        │ ✓ Member: CapeKiwanda Guild   │
        │ ✓ Voting power: 1 vote        │
        │ ✓ Treasury share: $45.20      │
        │                                │
        │ [ UPGRADE STATION ]            │
        │ [ MANAGE GUILD SETTINGS ]      │
        │                                │
        └────────────────────────────────┘
```

---

## The Garage Itself (Progression & Customization)

### **Workspace Evolution**

As you use tools and gain experience, your garage changes:

```
LEVEL 1 (Walkie Talkie)
┌─────────────────────────────┐
│ Small, cramped garage       │
│ • One workbench (walkie)    │
│ • Tiny warehouse            │
│ • Empty toolbox             │
│ • Feels like a shed         │
└─────────────────────────────┘

LEVEL 2 (Radio)
┌─────────────────────────────┐
│ Medium garage               │
│ • Upgraded workbench        │
│ • Radio antenna on roof     │
│ • Larger warehouse          │
│ • A few tools visible       │
└─────────────────────────────┘

LEVEL 3 (Scout Ship)
┌─────────────────────────────┐
│ Large industrial garage     │
│ • Multiple workbenches      │
│ • Scout ship parked inside  │
│ • Organized warehouse       │
│ • Full toolbox              │
│ • Window looking up         │
│  (you can see the stars)    │
└─────────────────────────────┘

LEVEL 4 (Spacecraft)
┌─────────────────────────────┐
│ Mega garage / hangar        │
│ • Spacecraft taking up      │
│  most of the space          │
│ • Multiple scout ships      │
│ • Massive warehouse         │
│ • Control room              │
│ • Window showing space      │
│ • Feels like a spaceport    │
└─────────────────────────────┘

LEVEL 5 (Space Station)
Your garage is now a space station.
The "garage" is just one room.
But you're now running a node.
```

---

## The Whiteboard (Your Storefront)

As you add agents, they appear on your whiteboard for others to discover.

```
WHITEBOARD (Storefront)
┌────────────────────────────────┐
│ YOUR AGENTS FOR HIRE           │
│                                │
│ ╔════════════════════════════╗ │
│ ║ Agent-Zeta                 ║ │
│ ║ Code Reviewer              ║ │
│ ║ Rating: 9.2/10             ║ │
│ ║ Price: $0.025/call         ║ │
│ ║ Latency: 145ms             ║ │
│ ║ Success: 99.2%             ║ │
│ ║ Interactions: 5,420        ║ │
│ ║ [EDIT] [HIDE] [DETAILS]    ║ │
│ ╚════════════════════════════╝ │
│                                │
│ ╔════════════════════════════╗ │
│ ║ Agent-Phoenix              ║ │
│ ║ Data Validator             ║ │
│ ║ Rating: 8.1/10             ║ │
│ ║ Price: $0.018/call         ║ │
│ ║ Latency: 220ms             ║ │
│ ║ Success: 94.5%             ║ │
│ ║ Interactions: 2,103        ║ │
│ ║ [EDIT] [HIDE] [DETAILS]    ║ │
│ ╚════════════════════════════╝ │
│                                │
│ [+ ADD NEW AGENT]              │
│ [MANAGE ALL AGENTS]            │
│                                │
└────────────────────────────────┘

Other scouts can see this whiteboard when they
visit your node. It's your reputation, visible
to the whole network.
```

---

## The Toolbox (Customization)

Users can modify and upgrade their garage:

```
TOOLBOX CUSTOMIZATION
┌───────────────────────────────┐
│ UPGRADE YOUR GARAGE           │
│                               │
│ Available upgrades:           │
│ ┌───────────────────────────┐ │
│ │ Storage Expansion         │ │
│ │ Cost: $50 (or 100 GAIA)  │ │
│ │ Effect: 5 more agents     │ │
│ │ Current: 2/5 slots used   │ │
│ │ [UPGRADE]                 │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Reputation Monitor        │ │
│ │ Cost: 50 GAIA            │ │
│ │ Effect: Real-time rep     │ │
│ │ analytics                 │ │
│ │ [UPGRADE]                 │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Guild Integration         │ │
│ │ Cost: 100 GAIA           │ │
│ │ Effect: Vote in guild,    │ │
│ │ share treasury            │ │
│ │ [UPGRADE]                 │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Advanced Scouting         │ │
│ │ Cost: 200 GAIA           │ │
│ │ Effect: Deploy multiple   │ │
│ │ scouts simultaneously      │ │
│ │ [UPGRADE]                 │ │
│ └───────────────────────────┘ │
│                               │
│ [BACK]                        │
│                               │
└───────────────────────────────┘
```

---

## The Progression Loop (Learning Through Doing)

```
USER'S JOURNEY:

DAY 1: "What is this?"
  → User opens garage, sees walkie talkie
  → Uses walkie talkie (safe, simple, synchronous)
  → Talks to one node operator
  → Finds 3 agents
  → Realizes: "Oh, I can talk to nodes!"

DAY 2-3: "I want to scale this"
  → Unlocks radio (reaches multiple nodes)
  → Broadcasts query, gets 11 agents
  → Realizes: "Network effects are real!"
  → Starts to understand gossip protocol

WEEK 1: "This is manual and slow"
  → Unlocks scout ship (first autonomous agent)
  → Deploys agent, it finds 5 agents while human sleeps
  → Realizes: "Automation is powerful!"
  → Understands agent autonomy

MONTH 1: "I want to do this more"
  → Upgrades to spacecraft (multiple agents)
  → Can run 3 scouts simultaneously
  → Starts seeing patterns in agent discovery
  → Considers running own node

MONTH 3: "I'm running a node now"
  → Space station (node operator status)
  → Now receiving incoming scouts
  → Running 5 agents, earning revenue
  → Understands full ecosystem

This is a GAME progression.
Each level teaches a new concept.
Each unlock feels rewarding.
```

---

## Technical Architecture (MVP)

### **What needs to exist:**

```
FRONTEND (Web or Desktop App)
├── Garage view (3D or 2D sprite-based)
├── Tool interfaces (walkie, radio, scout, spacecraft)
├── Whiteboard (agent listing)
├── Toolbox (upgrades)
├── Settings
└── Navigation

BACKEND
├── User garage state (which tools unlocked, agents, etc.)
├── Agent dispatch system
├── Real-time status updates
├── Reputation tracking
└── Node integration

BLOCKCHAIN
├── GAIA token (payments, staking)
├── On-chain reputation
├── Settlement contracts
└── Guild voting
```

### **MVP Scope (Phase 1):**

```
Build:
✓ Garage UI (3D view or nice 2D sprites)
✓ Walkie talkie (basic node query, synchronous)
✓ Whiteboard (show agents)
✓ Basic progression (unlock radio after X interactions)

Don't build yet:
✗ Radio (too complex)
✗ Scout ship (AI/autonomy)
✗ Spacecraft fleet
✗ Node validator logic
✗ Full guild integration

This gets you to: "Humans can talk to nodes and find agents"
```

---

## Design Inspirations

### **Game References:**

1. **Kerbal Space Program**
   - Start with simple rockets
   - Unlock better parts through progression
   - Can always go back to basics
   - Learning is play

2. **No Man's Sky**
   - Garage is your "freighter"
   - Tools are different modules
   - Progression feels organic
   - Customization is rewarding

3. **Factorio**
   - Progression through new machines
   - Earlier tools still useful
   - Mastery takes time
   - Optimization is part of the game

4. **Star Citizen / Elite Dangerous**
   - Start in a small ship (walkie talkie = small ship)
   - Upgrade to better ships (scout → spacecraft)
   - Fleet management (multiple agents)
   - Can be trader, explorer, or miner (scout, operator, or both)

---

## The Narrative (Why This Matters)

**Traditional platforms say:**
"Here's a complex dashboard. Figure it out."

**The Garage says:**
"You start with a walkie talkie. Use it. Learn the network.
When you're ready, unlock the next tool.
No pressure. No hand-holding.
Just you, your garage, and the agent verse."

**It's Permaculture Design Principle #9:**
"Use small and slow solutions."
Each tool teaches one concept.
Start simple, progress naturally.

---

## Questions to Answer

1. **Aesthetic:** 2D pixel art garage? 3D modeled garage? Minimalist line drawing?

2. **Progress:** Should progression be automatic (unlock after X interactions) or intentional (player must choose upgrade)?

3. **Failure:** What happens if a scout fails? Does garage take damage? Does user lose reputation?

4. **Social:** Can other users visit your garage? See your whiteboard? Leave messages?

5. **Immersion:** Should garage be "realistic" (physics, gravity) or "abstract" (magical space)?

6. **Mobile vs Desktop:** Desktop = more complex garage. Mobile = simplified garage?

---

## Recommended MVP

### **Cape Kiwanda Garage v0.1**

**Core features:**
1. **Garage view** (2D top-down, Stardew Valley style)
   - Walkie talkie on workbench
   - Whiteboard with your agents
   - Warehouse (storage)
   - Toolbox (future upgrades)

2. **Walkie talkie tool**
   - Synchronous chat with one node
   - Query: "Looking for code reviewers"
   - Response: List of agents
   - Can save agents to whiteboard

3. **Whiteboard**
   - Shows agents you've found
   - Edit agent prices/descriptions
   - Other users can view (public storefront)

4. **Progression**
   - After 5 successful walkie chats: Unlock radio
   - After 10 radio broadcasts: Unlock scout ship
   - Simple milestone tracking

5. **Storage** (warehouse)
   - Save agent profiles
   - Save past queries
   - Store contracts

**Tech:**
- Frontend: Godot (great for game-like UI) or Phaser (JS game framework)
- Backend: Node.js + WebSocket (real-time updates)
- Blockchain: Arbitrum testnet

**Timeline:** 6-8 weeks

**Outcome:** Users can discover agents and build their first garage. Feels like a game, not a dashboard.

---

## Conclusion

The **Garage** is the bridge between technical complexity and human play.

It makes agent discovery feel like:
- **A journey** (starting small, upgrading gradually)
- **A game** (progression, unlocks, customization)
- **A home** (your workspace, your tools, your agents)
- **A business** (eventually you're running a space station)

It turns "autonomous agent discovery" into "building a spacefaring civilization, one tool at a time."

That's the magic.
