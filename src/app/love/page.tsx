import type { Metadata } from "next";
import { Placard } from "@/components/shell/Placard";

export const metadata: Metadata = {
  title: "Love Postcards — Mechanical Cupcakes OS",
};

// L11 (2026-09-12): the private-tier card linked here and the route did not exist,
// so the one card in the gallery that says "listed, not reachable" 404'd instead of
// saying so. Rendered from the registry like every placard; the entry's tier makes
// the page say "private" rather than "nothing to open".
export default function Page() {
  return <Placard id="lovepostcards" />;
}
