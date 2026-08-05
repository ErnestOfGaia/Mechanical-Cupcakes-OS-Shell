import { type LucideIcon, Terminal, ChefHat, Stamp, Newspaper, BarChart3, Radio } from "lucide-react";

export interface AppRegistryEntry {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  route: string;
  isExternal: false;
  status: "operational" | "pilot" | "dev" | "standby";
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
    id: "pennypost",
    name: "The Penny Post",
    icon: Stamp,
    description: "Write a postcard and watch it travel — stamp, cancellation, transit, arrival. Everything stays in your browser; nothing is sent or stored.",
    route: "/postcards",
    isExternal: false,
    status: "pilot",
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
    id: "newshub",
    name: "News Hub World",
    icon: Newspaper,
    description: "Newsy's Comic Book of Comic Strips",
    route: "/newshub",
    isExternal: false,
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
    status: "pilot",
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
    status: "dev",
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
];

const STATUS_LABELS: Record<AppRegistryEntry["status"], string> = {
  operational: "Operational",
  pilot: "Pilot",
  dev: "Dev",
  standby: "Standby",
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
