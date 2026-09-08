import { type LucideIcon, Terminal, ChefHat, Stamp, Newspaper, BarChart3, Radio, BookOpen, Leaf, Mic, Mountain, Mail, LayoutGrid } from "lucide-react";

/**
 * Where an app appears in the gallery. Added at L3 (2026-09-02); before this the
 * landing page carried its own hardcoded copy of the app list and the two drifted.
 *
 *  root      — the shell itself. Not an exhibit; never rendered as a card.
 *  featured  — the landing grid. ⛔ EXACTLY THREE (SEAM-16b). If you are adding a
 *              fourth, one of the current three has to move to `directory` in the
 *              same edit, and that is a decision rather than a tidy-up.
 *  directory — everything else that is real: parked, deprecating, client-owned,
 *              guest exhibits, and briefs that have no build yet. Navigable, with an
 *              honest status label.
 *  private   — login-gated apps, listed openly so the people who DO have logins can
 *              find them (SEAM-01, which revised the earlier "keep it unlisted" call).
 *              Listed is not the same as reachable.
 */
export type AppTier = "root" | "featured" | "directory" | "private";

export interface AppRegistryEntry {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  route: string;
  isExternal: false;
  /**
   * `queued`      — a brief exists, no build does. The honest public face of the
   *                 queue: it may become a build, but not before the Last Mile bar
   *                 clears (Ernest, 2026-08-30).
   * `deprecating` — development has stopped and the app is being wound down on
   *                 purpose, documented as it goes (SEAM-11).
   */
  status: "operational" | "pilot" | "dev" | "standby" | "queued" | "deprecating";
  tier: AppTier;
  /**
   * False when the card has no app to open — a placard. The card still renders and
   * still tells the truth; it just does not pretend to be a door.
   */
  hasLiveApp: boolean;
  /** One honest clause about the app's situation, shown under the status chip. */
  note?: string;
  /**
   * Longer explainer for a placard page, one string per paragraph.
   *
   * Lives here rather than in the page component for the same reason the landing
   * grid no longer keeps its own app list: one source. A placard's page is a
   * rendering of its registry entry, not a second description of the same thing.
   */
  placardBody?: string[];
  color: string;
  bg: string;
  border: string;
  suggestedPrompts: string[];
  welcomeScript: string;
}

export const APP_REGISTRY: AppRegistryEntry[] = [
  {
    id: "shell",
    name: "Hoot Dashboard",
    icon: Terminal,
    description: "System Entry & Control",
    route: "/",
    isExternal: false,
    tier: "root",
    hasLiveApp: true,
    status: "operational",
    color: "text-warm-white",
    bg: "bg-white/5",
    border: "border-white/10",
    suggestedPrompts: [
      "What is MCOS?",
      "What apps are available?",
      "Show other tools",
    ],
    welcomeScript:
      "Welcome to the Mechanical Cupcakes OS. I'm Hoot. Ask me anything about the system or its apps.",
  },
  {
    id: "pellito",
    name: "Pellito Hub",
    icon: ChefHat,
    description: "Interactive Recipe Library",
    route: "/pelican",
    isExternal: false,
    tier: "directory",
    hasLiveApp: true,
    note:
      "Client deployment, login-gated. Kept deliberately \u2014 the public sibling is The Family Recipe App.",
    status: "operational",
    color: "text-teal",
    bg: "bg-teal/10",
    border: "border-teal/20",
    suggestedPrompts: [
      "What recipes are here?",
      "How do I use the Pellito Hub agent?",
      "Show other tools",
    ],
    welcomeScript:
      "Welcome to Pellito Hub — the interactive recipe library. Ask me about available recipes or how the agent works.",
  },
  {
    // The Penny Post keeps the /postcards gallery slot (decision 2026-08-01) —
    // it is the public descendant of the private postcards app, which stays
    // login-gated on its own subdomain and out of the gallery.
    //
    // 2026-09-01: status "pilot" → "operational" (Ernest's call, Last Mile L1).
    // The app is live, complete, does everything it claims, and is one of the
    // interim featured three (SEAM-16b). "pilot" understated a finished app, and
    // the gallery's standing rule is that displayed status matches reality.
    // ⚠️ The landing grid keeps its own copy of this in src/app/page.tsx — change
    // both until L3 deletes that array.
    id: "pennypost",
    name: "The Penny Post",
    icon: Stamp,
    description: "Write a postcard and watch it travel — stamp, cancellation, transit, arrival. Everything stays in your browser; nothing is sent or stored.",
    route: "/postcards",
    isExternal: false,
    tier: "featured",
    hasLiveApp: true,
    status: "operational",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    suggestedPrompts: [
      "What is The Penny Post?",
      "Why is it named after an 1840 reform?",
      "Does it really send nothing?",
    ],
    welcomeScript:
      "Welcome to The Penny Post. Write a postcard, stamp it, and watch it travel — then take your card home as a picture. It all happens in your own browser; open your developer tools and check for yourself.",
  },
  {
    // Registered 2026-09-02 (Last Mile L2). Live at recipes.mechanicalcupcakes.fun.
    //
    // The public sibling of Pellito Hub: same codebase lineage, entirely different
    // product. This one has NO auth at all — no login route, no session, no admin —
    // and its recipes are invented, so it can be forked and made somebody's own.
    // Pellito Hub itself stays login-gated, client-only, and off the gallery.
    //
    // ⚠️ Two copies again: the landing grid holds its own entry in src/app/page.tsx.
    // Change both until L3 deletes that array.
    id: "recipes",
    name: "The Family Recipe App",
    icon: BookOpen,
    description: "A bilingual recipe book you can cook from and then take. Browse by station, drill into the steps, quiz yourself — in English or Spanish. No account, nothing stored.",
    route: "/recipes",
    isExternal: false,
    tier: "featured",
    hasLiveApp: true,
    status: "operational",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
    suggestedPrompts: [
      "What is The Family Recipe App?",
      "Why are the recipes made up?",
      "How do I make it my family's?",
    ],
    welcomeScript:
      "Welcome to The Family Recipe App. Thirteen invented recipes from a coastal kitchen that does not exist, in English and Spanish, with a quiz on each one. There is no account here. The recipes are fictional on purpose — fork the repository and put your own family's in.",
  },
  {
    // SEAM-13 (grill, 2026-08-05): News Hub World is a GUEST EXHIBIT and Ernest owns
    // the card. Minimal-but-honest registration only — a registry entry, a status and
    // one paragraph. ⛔ No L4 writeup: its canon stays home. Hoot may eventually
    // explain its development and purpose, never its lore.
    //
    // Copy below is the seam's own draft, with Ernest's phrasing kept verbatim.
    // 2026-09-02: moved featured → directory when The Family Recipe App cleared its
    // bar, which is the swap SEAM-16b made mandatory.
    id: "newshub",
    name: "News Hub World",
    icon: Newspaper,
    description: "A Solar Punk news world, and a study of drift in comics and AI.",
    route: "/newshub",
    isExternal: false,
    tier: "directory",
    hasLiveApp: true,
    note:
      "Guest exhibit — a separate world Ernest also builds, at news.ernestofgaia.xyz. It keeps its own canon and its own backoffice.",
    status: "operational",
    color: "text-violet",
    bg: "bg-violet/10",
    border: "border-violet/20",
    suggestedPrompts: [
      "What is News Hub World?",
      "Who is Newsy?",
      "Show other tools",
    ],
    welcomeScript:
      "Welcome to News Hub World — Newsy's Comic Book of Comic Strips. Ask me what's new or how the comic works.",
  },
  {
    id: "ochi",
    name: "OCHI Dashboard",
    icon: BarChart3,
    description: "Oregon Coastal Hospitality Intelligence — a predictive dashboard for Pacific City coastal tourism.",
    route: "/ochi",
    isExternal: false,
    tier: "featured",
    hasLiveApp: true,
    note:
      "Reads real weekly signals since September 2026, collect-forward, one row a week. Writeup at /under-the-hood.",
    // 2026-09-07: "pilot" → "operational" — Ernest's call on tape (session 08, seam 8):
    // "we are now operational as OCHI stands." Real data, one week deep, routine scheduled.
    status: "operational",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    suggestedPrompts: [
      "What is the Master Multiplier?",
      "What does a High Volume reading mean?",
      "What is the Hwy 6 signal?",
    ],
    welcomeScript:
      "Welcome to OCHI — Oregon Coastal Hospitality Intelligence. This is a raw, utilitarian instrument of prediction. Five Gatekeeper signals feed a single Master Multiplier score between 0.00 and 1.00. Above 0.70 is high volume. Below 0.40 means stay lean. The Forecast Annotation explains why.",
  },
  {
    id: "scout",
    name: "Scout Protocol",
    icon: Radio,
    description: "A local-first agent coordination system — the Garage is where you query the network, send missions, and manage agent candidates.",
    route: "/scout",
    isExternal: false,
    tier: "directory",
    hasLiveApp: true,
    note:
      "Deprecation in progress, documented as it happens. The prototype taught what it had to teach.",
    status: "deprecating",
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/20",
    suggestedPrompts: [
      "What is Scout Protocol?",
      "What is the Garage?",
      "What is a Walkie Talkie query?",
    ],
    welcomeScript:
      "Welcome to the Scout Protocol Garage. This is a local prototype — all interactions are simulated. Send a mission to query the mock peer network and receive agent candidates.",
  },
  // ---------------------------------------------------------------- placards
  // Registered at L3 (2026-09-02). These are REAL projects with briefs and, in two
  // cases, working code — they are simply not deployed exhibits. Registering and
  // placarding something that exists elsewhere is explicitly NOT "adding an app"
  // (Ernest, 2026-08-30); the no-new-apps fence bars building, not registering.
  //
  // ⭐ A placard MAY become a build, but not before the Last Mile bar clears. That
  // is the guard, and `queued` is the honest label for the queue itself.
  {
    id: "workshop",
    name: "Campaign Workshop",
    icon: LayoutGrid,
    description: "The commitment gate for marketing campaigns — arcs, drops, cadence and a placement check, worked on a board before anything ships.",
    route: "/workshop",
    isExternal: false,
    tier: "directory",
    hasLiveApp: false,
    note:
      "Built, tested and deliberately never deployed. Backoffice tooling rather than a gallery exhibit, and its vault fail-safe refuses to run in production.",
    placardBody: [
      "The Campaign Workshop is where a rough marketing note becomes something worth committing to. You lay a campaign out as an arc of drops, argue with it, run a placement check, and only then decide whether it ships at all. It is the commitment gate rather than a publishing tool.",
      "It is finished software. It builds, its tests pass, and it is used. It is also deliberately not deployed anywhere, and that is the interesting part: it reads from a private vault of working notes, so a public deployment would either serve somebody else's half-formed plans or serve nothing at all. It has a fail-safe that refuses to run in production for exactly that reason.",
      "So there is no link on this card. It is here because the gallery should be honest about what exists, and this exists — it just is not a thing a stranger can open.",
    ],
    status: "standby",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    suggestedPrompts: [
      "What is the Campaign Workshop?",
      "Why is it not deployed?",
      "Show other tools",
    ],
    welcomeScript:
      "The Campaign Workshop is where a rough campaign note becomes something worth committing to. It runs locally only, on purpose — it is backoffice tooling, not an exhibit, so there is nothing here to open.",
  },
  {
    id: "ocms",
    name: "OCMS Dashboard",
    icon: Leaf,
    description: "Oregon cannabis market data, read from the state's own public API rather than scraped or bought.",
    route: "/ocms",
    isExternal: false,
    tier: "directory",
    hasLiveApp: false,
    note:
      "Queued. The data layer is built and tested against the live API; the interface deliberately is not, because building it is the show.",
    placardBody: [
      "OCMS reads Oregon's public cannabis licence and market data straight from the state's own open-data API. No scraping, no purchased dataset, no key required — the state publishes it, and the app reads it.",
      "The data layer is built and tested against the live API, including guards for the two traps that make this data lie if you are careless: partial months and partial years, either of which will show you a catastrophic decline that is really just a month that has not finished yet.",
      "The interface is deliberately unbuilt. Building it is the show, so building it privately first would be missing the point.",
    ],
    status: "queued",
    color: "text-lime-400",
    bg: "bg-lime-400/10",
    border: "border-lime-400/20",
    suggestedPrompts: [
      "What is OCMS?",
      "Where does the data come from?",
      "Show other tools",
    ],
    welcomeScript:
      "OCMS reads Oregon's public cannabis licence and market data straight from the state's API. The data layer exists and is tested; the dashboard is deliberately unbuilt, because building it in public is the point.",
  },
  {
    id: "homegrownai",
    name: "HomegrownAI",
    icon: Mic,
    description: "A livestream about building your own tools rather than renting them — Oregon homegrown cannabis, and homegrown software.",
    route: "/homegrownai",
    isExternal: false,
    tier: "directory",
    hasLiveApp: false,
    note:
      "Queued, and a working name rather than a settled one. The show, not the app — OCMS is the thing being built on it.",
    placardBody: [
      "HomegrownAI is a show about building your own tools instead of renting them. Oregon homegrown cannabis, and homegrown software — the name is the joke and also the thesis.",
      "OCMS is what gets built on it. The two are separate things that keep being confused: one is a programme, one is an application.",
      "The name is a working one. It has been reversed once already and nothing about it is trademarked or settled, so treat it as a label rather than a brand.",
    ],
    status: "queued",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    suggestedPrompts: [
      "What is HomegrownAI?",
      "How is it different from OCMS?",
      "Show other tools",
    ],
    welcomeScript:
      "HomegrownAI is a show about building your own tools instead of renting them. OCMS is what gets built on it. The name is a working one and may still change.",
  },
  {
    id: "cascadia",
    name: "The New Cascadia",
    icon: Mountain,
    description: "A shared-world climate-fiction atlas set after an event called The Rise.",
    route: "/cascadiaworld",
    isExternal: false,
    tier: "directory",
    hasLiveApp: false,
    note:
      "Queued, and a working name — the path is deliberately cheap to rename and no subdomain exists until the name settles. Built elsewhere, deliberately separate from the business.",
    placardBody: [
      "The New Cascadia is a shared-world climate-fiction atlas. It is built around an event called The Rise — the event is The Rise, the world is The New Cascadia, and those two names get swapped often enough to be worth stating plainly.",
      "It is being built somewhere else, on purpose. It is deliberately isolated from the business so that another fictional world does not start leaking into work that has to stay factual, and it doubles as a testbed for infrastructure that has nothing to do with this gallery.",
      "The name has not settled. That is why this is a path and not a subdomain: a path is cheap to rename while nothing links to it, and committing an address to a working title is how a working title quietly becomes permanent.",
    ],
    status: "queued",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    suggestedPrompts: [
      "What is The New Cascadia?",
      "What is The Rise?",
      "Show other tools",
    ],
    welcomeScript:
      "The New Cascadia is a shared-world climate-fiction atlas. The Rise is the event it is built around, not the name of the project. Both the name and the home are still unsettled, which is why this is a placard rather than a door.",
  },
  // ----------------------------------------------------------------- private
  // Listed openly, gated on arrival. SEAM-01 revised the earlier "keep it unlisted"
  // call to listed-but-gated, so the people who DO have logins can find them.
  // ⛔ Listed is not reachable: there is nothing here for a stranger to get into.
  {
    id: "lovepostcards",
    name: "Love Postcards",
    icon: Mail,
    description: "A private postcard mailbox for two people. The lab the Penny Post came out of.",
    route: "/love",
    isExternal: false,
    tier: "private",
    hasLiveApp: true,
    note:
      "Private and login-gated. Listed here so the two people with logins can find it, not as an invitation.",
    status: "operational",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
    suggestedPrompts: [
      "What is Love Postcards?",
      "Why is it private?",
      "Show other tools",
    ],
    welcomeScript:
      "Love Postcards is private — a mailbox for two people, gated on arrival. Its public descendant is The Penny Post, which you can use freely.",
  },
];

const STATUS_LABELS: Record<AppRegistryEntry["status"], string> = {
  operational: "Operational",
  pilot: "Pilot",
  dev: "Dev",
  standby: "Standby",
  queued: "Queued",
  deprecating: "Deprecating",
};

export function getStatusLabel(status: AppRegistryEntry["status"]): string {
  return STATUS_LABELS[status];
}

export function getAppByRoute(pathname: string): AppRegistryEntry {
  const match = APP_REGISTRY.find(
    (entry) => entry.route !== "/" && pathname.startsWith(entry.route)
  );
  return match ?? APP_REGISTRY[0];
}

/** Everything in one tier, in registry order. */
export function getAppsByTier(tier: AppTier): AppRegistryEntry[] {
  return APP_REGISTRY.filter((entry) => entry.tier === tier);
}

/**
 * The landing grid. ⛔ EXACTLY THREE, by SEAM-16b — a "featured" list that grows to
 * fit whatever exists stops meaning anything, and the point is that promoting one
 * thing demotes another.
 *
 * ⚠️ THE COUNT IS ENFORCED IN `src/scripts/check-registry.ts`, WIRED TO `prebuild`,
 * NOT HERE. This function deliberately does NOT throw, and that is the second
 * version of this guard rather than the first.
 *
 * The first version threw from right here, on the reasoning that the landing page
 * imports it so a bad registry would fail the build. It did not: the landing page is
 * `force-dynamic`, so it is never prerendered, this is only called per request, and a
 * planted fourth featured app built completely cleanly. The guard was decorative and
 * the only reason I know is that I planted the defect and watched the build pass.
 *
 * Throwing here is also actively wrong for a dynamic page: it would turn a registry
 * typo into a 500 on the public gallery instead of a failed build. So the assertion
 * moved to a script that runs before the build, where failing is the entire job, and
 * this function just reports what it finds.
 */
export const FEATURED_COUNT = 3;

export function getFeaturedApps(): AppRegistryEntry[] {
  return getAppsByTier("featured");
}
