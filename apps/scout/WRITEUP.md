# Scout Protocol: a deprecation, done on purpose

## What this page is

This is the headstone for Scout Protocol. There was a prototype here, at `/scout`, from May to
September 2026. Development stopped in August by decision, and in September the code was archived
and removed from this repository. It's gone on purpose. What's left is this document, which is the account of what Scout
was, what got built, why it stopped, what was worth keeping, and how the cleanup was done. The code
itself is in the repository's history, and a link to it is at the bottom.

Almost nobody shows their endings. Feeds are all launches. I wanted to do one deprecation properly
and in public, because deprecate's a real option in the way I work, and a project that ends well
is a competence artifact in the same way a project that ships is.

## What Scout was

Scout Protocol was a design for decentralised, permissionless infrastructure where autonomous agents
could find each other, negotiate terms and settle payment without a platform in the middle. No
central registry, no gatekeeper taking a cut. Every participant would run a node, small enough for
a Raspberry Pi or a five-dollar VPS. Three messages made up the protocol: a discovery query, an
agent's response, and a trial agreement both sides signed. Reputation would be portable. Guilds
would set quality standards. The ethics came from permaculture, Earth Care, People Care, Fair Share,
with a fourth pillar I called Agent Care: fair incentives, transparency, and appeal rights for the
agents themselves.

The user-facing metaphor was a Garage. You'd stand in your Garage with a Walkie Talkie, ask the
network for an agent who could do a job, get candidates back, pin the good ones to a Whiteboard, and
watch the Network Activity log show you what the protocol was doing underneath. It was designed to
feel like a working shop before it felt like a crypto dashboard.

The design corpus ran to about 75,000 words by the end of April 2026, before a line of code
existed: a full vision brief, a node model, a Garage-to-station progression, an interface brainstorm,
a comparison of blockchains, and a tools guide. It was the most documented idea in the gallery and,
by the time of the ruling, the one with the least momentum — that's the whole tension in one line.

## What got built

Less than the corpus, and it's honest about that. Garage v0.1 was a local prototype whose product requirements
said in its first paragraph that it was "a local learning prototype, not a production network node."
Its four architecture decision records all chose the simulated option: an in-process fake peer node
with deterministic responses instead of real gossip, mock Ethereum-style identities instead of
wallets, a message envelope with a version string and a null signature field, and a small capability
taxonomy. The Walkie Talkie query worked against the fake node. The Whiteboard saved a candidate. The
activity log showed the messages. Five tests covered the envelope and the mock data.

The interface shipped with `[ MODE: SIMULATED ]` in the corner and every control disabled, on
purpose. That wasn't a bug or a placeholder, and it isn't now. The interface principles said "simulated data must be
honest," and the prototype was built already knowing how to be paused. When the gallery later
adopted honest state as a rule for everything, Scout was the precedent.

Part of what this prototype was for was trying out coding tools I hadn't used on a real repo. The
history shows branches from two different agent coding tools working the same backlog of eight
issues. That experiment produced the app. It also produced two parallel source trees in one
project, which an audit later flagged and which I never collapsed, because by then the ruling had
been made.

## Why it stopped

The critical assessment was written in April, before any code, and it is the honest counterweight to
a very optimistic vision. It said the gossip protocol was undefined, which mattered because gossip
was the nervous system of the whole design. It said the three-message spec ended before the actual
work: nothing described how a job got delivered, how results came back, or who released the escrow
and when. It said test-payload verification was unspecified, so an agent could return confident
garbage and claim ninety-eight percent. It named a contradiction between "no extraction" and
"operators earn five hundred to two thousand a month." It noted that "Raspberry Pi compatible" and
"runs an Ethereum node" don't fit in the same box. It listed Sybil resistance, privacy on a public
chain, and contract upgradeability as undecided.

Every one of those was a decision, not a build, and they're still decisions. The prototype proved the loop could be built, and it
proved that everything under the loop was still a set of questions. Six blocked the MVP by the
assessment's own count. Meanwhile the site Scout sat on had become a public gallery of finished
work, and Scout occupied a Directory slot next to apps that were done. In August I ruled on it: keep
everything for now, stop development, turn the remaining tasks into assessments, back the work up,
archive the corpus, delete the code, and document the cleanup as it happened. Every open code fix
closed as won't-fix, deprecated. It was the largest single deletion of planned work in the whole
last-mile plan, and it didn't cost a thing.

## What was worth keeping

The harvest, which is what the assessment tasks were for:

- **"Simulated data must be honest."** The one-line principle from Scout's interface notes became a
  gallery-wide rule. OCHI ran for four months with a banner saying its signals were sample values.
  Cards for projects with no build render as placards that say "nothing to open." Scout got there
  first.
- **Write the critique before the code.** The critical assessment did its job. It's the reason the
  deprecation was a calm decision rather than a discovery. Every project since has had an honest
  counterweight document, and I read that one before scoping.
- **Decision records before irreversible decisions.** Scout's four ADRs were small, but the habit of
  writing the decision down with its consequences carried forward.
- **The envelope shape.** A versioned message with an id, sender, recipient, timestamp, payload and
  a signature slot is a reasonable pattern for any two things that need to talk. It's in the archive
  if it's ever needed.
- **The accessibility pattern.** Scout's Garage had proper labels on its controls when the shell
  didn't. The shell copied that up.
- **The ethics frame.** Permaculture principles applied to agent networks, with Agent Care as a
  fourth pillar, is still an idea I hold. It doesn't need this codebase to survive.

## The cleanup, as it happened

The moral of this whole page, stated once here and once at the end: back up your work. If you learn
nothing else from a deprecation, learn that.

1. **Backed up, and verified on disk before anything was touched.** Two archives, dated, with a
   manifest recording file counts, byte sizes and SHA-256 hashes, each zip integrity-tested and
   spot-checked by reading a known document out of it. The repository's tracked Scout files came
   from `git archive` at the last commit that contained them. The vault design corpus, which had
   drifted from the copy inside the repo, was zipped separately. The verification's a receipt, not a
   feeling.
2. **Deleted from the repository.** The app folder, the working docs, and the repo's copy of the
   design corpus, including a three-megabyte audio memo that should never have been in git. What
   remains under `apps/scout/` is this file and a short README pointing at it.
3. **Removed from the development compose file.** The `mcos-scout` service is gone. It was never in
   CI and never deployed, which was itself a finding from the audit.
4. **Local images removed** once Docker was up, listed before and after.
5. **The card changed twice.** In September it went from "currently in active development," which
   had stopped being true, to "deprecation in progress." Now it says deprecated, and it opens this
   page instead of an app.

Two house stories belong here as the reason for step one. A container in this gallery once
crash-looped every six seconds for two months and nobody noticed, because it wasn't in anyone's
view. And twice the copy of an app that looked stale was the live one, and the copy that looked
current was dead. Deleting the right thing is a skill. Backing up first is what makes a mistake
recoverable, and you won't know which mistake until you've made it.

## What is not finished

The idea isn't dead — the codebase is. If Scout ever returns it returns as its own project, started
from the critical assessment rather than the vision brief, with the six blocking decisions made
first. The archive in the vault holds everything, including the audio memo on how agents would be
paid directly. Nothing about tokenomics or settlement was ever built or audited, and nothing here
should be read as if it were. It wasn't.

Back up your work.

## Provenance

Repo: [github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell](https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell).
The code as it was before removal:
[apps/scout at bf58e94](https://github.com/ErnestOfGaia/Mechanical-Cupcakes-OS-Shell/tree/bf58e94/apps/scout).
Written by Ernest (they/them), September 2026.

This file is also the page at `/scout`. One copy, rendered at build time.
