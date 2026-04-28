# Scout Protocol — The Garage Prototype

Scout Protocol is a decentralized, permissionless infrastructure for autonomous agent discovery, negotiation, and settlement.

## 🛠 Project Core
- **Identity**: Decentralized Agent Discovery (No Gatekeepers).
- **Metaphor**: The "Bus Stop" (Dispatch, Schedule, Reports).
- **Garage MVP**: A personal node serving as your local entry point to the network.

## 🏗 Prototype Architecture
1. **Garage UI (Next.js)**: 
    - **Dispatch Window**: Select agent, set mission/budget.
    - **Schedule Board**: Live fleet status & ETAs.
    - **Mission Reports**: Performance logs and settlement status.
2. **Garage Node (Node.js/TS)**:
    - Capabilities Registry.
    - Gossip Protocol (Capability/Reputation sharing).
    - Settlement Processor (Arbitrum/GAIA tokens).

## 🧩 Heritage (Freedom Browser Ports)
The prototype will port key modules from the Freedom Browser codebase:
- `vault.js`: Agent identity wallet.
- `transaction-service.js`: Arbitrum settlement.
- `ipc-contract.js`: Protocol message envelopes.

## 🚀 Build Instructions
1. **Scaffolding**: Next.js 15+ and Tailwind 4.
2. **Blockchain**: Configure `ethers.js` for Arbitrum Sepolia testnet.
3. **MCOS Shell**: Prepare to adopt the Mechanical Cupcakes OS Shell overlay via `ShellWrapper` in Phase 2.

## 📅 Roadmap
- **Phase 1**: Local Garage UI Prototype + Walkie Talkie Tool.
- **Phase 2**: Multi-Node Gossip + Arbitrum Sepolia Guilds.
- **Phase 3**: Mainnet Launch + GAIA Settlement.
