import type { Metadata } from "next";
import { Placard } from "@/components/shell/Placard";

export const metadata: Metadata = {
  title: "The New Cascadia — Mechanical Cupcakes OS",
};

// Thin by design: the content is the registry entry. See components/shell/Placard.
export default function Page() {
  return <Placard id="cascadia" />;
}
