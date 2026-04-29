# Scout Project Preflight Checklist

Use this before starting implementation, local testing, VPS deployment, or agent-backend work. The goal is to catch repeated setup mistakes early and keep every session small, testable, and recoverable.

## 1. Session Intent

- [ ] Name the goal for this session in one sentence.
- [ ] Decide the mode: brainstorm, spec, prototype, test, deploy, or debug.
- [ ] Confirm whether files should be edited in this session.
- [ ] Identify the smallest testable outcome before starting.
- [ ] Check `git status` before edits and avoid touching unrelated changes.

## 2. Workspace Context

- [ ] Scout currently lives inside the Mechanical Cupcakes OS Shell workspace.
- [ ] Treat Mechanical Cupcakes OS Shell as the wrapper/domain layer for branded experiments and non-business projects.
- [ ] Treat the GitHub project as a monorepo: Scout is an app inside the OS Shell repo, not a separate repo.
- [ ] GitHub repo: `https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell`.
- [ ] Scout app path in repo: `apps/scout/scout-app`.
- [ ] Scout planning/docs path should stay under `apps/scout` when mirrored to GitHub.
- [ ] Keep Scout-specific product requirements separate from OS Shell wrapper requirements.
- [ ] Before borrowing OS Shell patterns, confirm they help the local Scout prototype instead of adding branding complexity too early.

## 3. Project Structure

- [ ] Active product/spec docs live under `docs/`, not inside raw notes.
- [ ] Raw imported notes remain source material and are not treated as current requirements.
- [ ] ADRs live in `docs/decisions/`.
- [ ] Process docs live in `docs/process/`.
- [ ] App code lives in `scout-app/`.
- [ ] New docs include a clear status: draft, active, superseded, or archived.

## 4. Next.js App Preflight

- [ ] Confirm the app directory: `scout-app/`.
- [ ] Read local project instructions: `AGENTS.md`, `README.md`, and `CLAUDE.md` if present.
- [ ] Do not assume older Next.js conventions; this project uses Next `15.3.0`.
- [ ] Check the installed package docs/types before using uncertain Next APIs.
- [ ] Confirm scripts in `package.json` before running commands.
- [ ] Local dev target is currently `npm run dev`, port `3004`.
- [ ] Do not add backend assumptions until the local prototype spec defines them.

## 5. Local Prototype Preflight

- [ ] Define what is real and what is simulated for the current slice.
- [ ] Start with one local Garage and one mock peer node.
- [ ] No real blockchain for v0.1 unless a spec explicitly calls for it.
- [ ] No real gossip for v0.1 unless ADR-001 changes that.
- [ ] Use deterministic mock data before connecting external services.
- [ ] Every prototype feature should have a visible test path in the UI.

## 6. Protocol Preflight

- [ ] Message envelope has a version field.
- [ ] Message envelope has sender, recipient, timestamp, type, payload, and signature placeholder.
- [ ] Message types are documented before implementation.
- [ ] Capability strings use the active taxonomy decision.
- [ ] Identity format follows the active identity ADR.
- [ ] Network Activity panel can show raw message events for debugging.

## 7. Mastra / Agent Backend Preflight

Use this only when Scout adds a Mastra-style agent backend.

- [ ] Confirm the project actually needs Mastra for the current slice.
- [ ] Keep tools simple: fetch, search, return. Reasoning belongs in agents.
- [ ] Use deterministic routing first, such as regex or explicit intent switches.
- [ ] Default agent model should be cost-aware; upgrade only for reasoning-heavy work.
- [ ] Keep knowledge retrieval build-time where possible.
- [ ] Store generated vector knowledge in a predictable ignored/build output location.
- [ ] Required environment variables are documented and not committed.
- [ ] `MASTRA_URL` defaults to `http://localhost:4111` unless deployment requires otherwise.

## 8. Environment Variables And Secrets

- [ ] `.env` is gitignored.
- [ ] No API keys, wallet keys, RPC keys, or mnemonic phrases are committed.
- [ ] Local-only mock secrets are clearly marked as mock values.
- [ ] Required variables are listed in a sample file or setup doc.
- [ ] VPS variables are created manually on the server or through a secret manager.

## 9. Docker / VPS Deployment Preflight

Use this only when deploying beyond local development.

- [ ] Decide deployment type: static nginx site, Next server, or separate app/backend services.
- [ ] Ports `80` and `443` are reserved for Nginx Proxy Manager only.
- [ ] App containers do not bind host ports unless explicitly needed.
- [ ] Services join the shared proxy Docker network when proxied by NPM.
- [ ] NPM proxy target uses the Docker service/container hostname, not the VPS public IP.
- [ ] Compose service name matches the hostname intended for NPM.
- [ ] Internal app port is documented in `docker-compose.yml`.
- [ ] Static sites expose `80` inside the container via `nginx:alpine`.
- [ ] Health endpoint exists, usually `GET /health -> 200`.
- [ ] Restart policy is `unless-stopped`.
- [ ] TLS terminates at NPM; app traffic stays HTTP inside Docker.

## 10. VPS Session Stability

- [ ] Prefer Chrome for Hostinger terminal sessions if the browser terminal is used.
- [ ] After reconnecting, verify state before continuing:

```bash
node --version && pwd && git status
```

- [ ] Re-check whether the previous command completed before rerunning it.
- [ ] Confirm containers after reconnecting with `docker ps`.
- [ ] Confirm proxy health with `curl` before changing config again.

## 11. Test Before Advancing

- [ ] Run the smallest relevant check first.
- [ ] For docs, verify links and file paths.
- [ ] For UI, run local dev and inspect the target screen.
- [ ] For protocol code, test message creation and parsing before network transport.
- [ ] For deployment, test container health before proxy/domain changes.
- [ ] Record any repeated failure in the Issues Encountered section below.

## Issues Encountered

Add new items here whenever an issue repeats or costs more than a few minutes. Each item should include the symptom, likely cause, fix, and future prevention.

### NPM Bad Gateway From Container Target

- Symptom: Domain shows bad gateway even though the app container is running.
- Likely cause: Nginx Proxy Manager points to the VPS IP or wrong host/port instead of the service hostname on the shared Docker network.
- Fix: Put NPM and the app container on the same Docker network, then proxy to the service/container hostname and internal port.
- Prevention: Make the compose service name match the desired NPM hostname and document the internal port in the compose file.

### App Container Uses Reserved Host Ports

- Symptom: Deployment conflicts with NPM, TLS, or another app.
- Likely cause: App compose file maps `80` or `443` directly.
- Fix: Remove host port mappings for proxied services; let NPM own public ports.
- Prevention: Treat `80` and `443` as proxy-only ports.

### Hostinger Terminal Freezes Or Drops

- Symptom: Browser terminal stops responding or loses session state.
- Likely cause: Unstable browser terminal session.
- Fix: Reopen in Chrome, reconnect, and verify state before continuing.
- Prevention: Use the verification command after every reconnect.

### Next.js Version Assumption Risk

- Symptom: Code follows outdated Next.js conventions or uses missing APIs.
- Likely cause: Assuming framework behavior from memory instead of checking this installed version.
- Fix: Inspect installed package docs/types and current project structure before coding.
- Prevention: Keep Next.js checks in preflight until the app structure is stable.

### PowerShell Blocks npm.ps1

- Symptom: Running `npm run ...` fails with `npm.ps1 cannot be loaded because running scripts is disabled on this system`.
- Likely cause: Windows PowerShell execution policy blocks the PowerShell npm shim.
- Fix: Use `npm.cmd run ...` from PowerShell.
- Prevention: Prefer `npm.cmd` commands in Scout walkthroughs on this machine.

### Next Build Spawn EPERM

- Symptom: `next build` fails with `spawn EPERM`.
- Likely cause: The sandbox or local permissions blocked Next from spawning its compiler process.
- Fix: Rerun the build with the needed permission and verify it completes.
- Prevention: Treat this as a verification-environment issue before assuming app code is broken.

### Scope Creep Into Full Protocol

- Symptom: Local prototype work drifts into blockchain, gossip, or tokenomics before the UI loop works.
- Likely cause: The broader Scout vision is available but v0.1 boundaries are not visible.
- Fix: Reconfirm the current slice: local Garage, mock peer node, Walkie Talkie query, saved agent, Network Activity log.
- Prevention: Maintain a v0.1 PRD and acceptance criteria before implementation.

### Secrets Or Environment Assumptions Missing

- Symptom: Agent backend, RPC, or embedding flow fails only at runtime.
- Likely cause: Required variables were not listed or were assumed to exist.
- Fix: Add required variables to setup docs and create real values outside git.
- Prevention: Check env requirements before running agent/backend commands.

### Confusing Scout With The OS Shell Wrapper

- Symptom: Requirements drift toward branded shell features before Scout has a local test loop.
- Likely cause: Scout lives inside Mechanical Cupcakes OS Shell, which is a broader wrapper/domain for experiments.
- Fix: Separate Scout prototype requirements from wrapper integration requirements.
- Prevention: Build and test Scout locally first, then decide how deeply it should use OS Shell branding or shell-level navigation.

### Scout Is A Sub-App In The OS Shell Monorepo

- Symptom: Workflow assumes Scout has a separate repository or repo root.
- Likely cause: Scout lives inside the Mechanical Cupcakes OS Shell monorepo at `apps/scout/scout-app`.
- Fix: Write GitHub issues and file paths relative to the OS Shell repo, with Scout paths clearly scoped.
- Prevention: Use labels like `app: scout`, `area: garage`, and `good-for-jules` when creating future GitHub issues.

### GitHub Connector Cannot Create Issues

- Symptom: GitHub connector returns `403 Resource not accessible by integration` when creating an issue.
- Likely cause: The installed GitHub app can read repository metadata but lacks issue creation permission.
- Fix: Use the authenticated GitHub CLI with `gh issue create`.
- Prevention: If issue creation fails through the connector, check `gh auth status` and create issues through `gh`.
