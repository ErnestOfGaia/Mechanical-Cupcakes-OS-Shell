import { type LucideIcon, Terminal, ChefHat, Heart, BarChart3, Radio } from "lucide-react";

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
    name: "Pelican",
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
      "How do I use the Pelican agent?",
      "Show other tools",
    ],
    welcomeScript:
      "Welcome to Pelican — the interactive recipe library. Ask me about available recipes or how the agent works.",
  },
  {
    id: "postcards",
    name: "Postcards",
    icon: Heart,
    description: "A digital postcard gallery — browse saved postcards, create new ones, and share visual messages.",
    route: "/postcards",
    isExternal: false,
    status: "standby",
    color: "text-violet",
    bg: "bg-violet/10",
    border: "border-violet/20",
    suggestedPrompts: [
      "How do I create a postcard?",
      "Can I share postcards?",
      "What is in the gallery?",
    ],
    welcomeScript:
      "Welcome to Postcards. Browse the gallery or save a card to your collection. Each postcard is a moment worth keeping.",
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
