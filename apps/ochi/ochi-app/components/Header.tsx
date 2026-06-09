"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshIcon } from "./ochi/primitives";

// App bar: OCHI wordmark + region + refresh. Refresh re-runs the data read
// (router.refresh()); until the Postgres seam is live this re-renders the same
// computed reading, so the spinner is the honest visible affordance.
export function Header() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    router.refresh();
    timer.current = setTimeout(() => {
      setRefreshing(false);
      setJustRefreshed(true);
    }, 750);
  }

  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 2px 0" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: "2px 9px 9px 9px", background: "var(--navy)", flex: "none" }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)", letterSpacing: ".02em" }}>OCHI</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--taupe)", marginTop: 3, marginLeft: 17 }}>
          Pacific City, OR · staffing read
        </div>
      </div>
      <button className="ochi-tap" onClick={handleRefresh}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 12px",
          borderRadius: 999, background: "var(--card)", border: "1px solid var(--hairline-strong)",
          color: "var(--action)", font: "inherit", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        }}>
        <RefreshIcon spinning={refreshing} />
        {refreshing ? "Refreshing" : justRefreshed ? "Just now" : "Refresh"}
      </button>
    </header>
  );
}
