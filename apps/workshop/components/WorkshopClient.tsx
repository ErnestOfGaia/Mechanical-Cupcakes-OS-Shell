"use client";

import dynamic from "next/dynamic";
import type { Board } from "@/lib/types";

/**
 * The board reads browser storage to decide its initial state, which the server
 * cannot know. Rendering it on the server would either produce a hydration mismatch
 * or force a setState-in-effect. Skipping SSR for this one component lets the state
 * initialise synchronously and correctly instead.
 *
 * The vault read still happens on the server and arrives here as props — the client
 * never touches the filesystem or sees a path.
 */
const Workshop = dynamic(() => import("./Workshop"), {
  ssr: false,
  loading: function Loading() {
    return (
      <main style={{ padding: 40 }} className="eyebrow">
        Setting out the bench…
      </main>
    );
  },
});

export default function WorkshopClient(props: {
  initialBoards: Board[];
  vault: { enabled: boolean; writable: boolean; reason?: string };
  loadErrors: string[];
}) {
  return <Workshop {...props} />;
}
