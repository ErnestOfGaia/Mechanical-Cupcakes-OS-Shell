import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { normalise } from "./board";
import { fieldIdentical } from "./compare";
import type { Board, Workspace } from "./types";

/**
 * Integration test against the real 2026-08-03 migration payload — not a copy in the
 * repo (it can't be: it's unreleased campaign content). Only runs when
 * WORKSHOP_VAULT_ROOT is set, same gate as vault.integration.test.ts.
 *
 * The handoff ( 07 - CampaignWorkshopMiniapp.md §5 ) calls this file "not just a
 * fixture — the migration payload" and sets an exact bar: import it and the counts
 * come back exactly, including Katrina's one verdict. This test proves normalise()
 * clears that bar before Phase 3 ever writes anything.
 *
 * Run: WORKSHOP_VAULT_ROOT="…\EOG Backoffice\Marketing" npx vitest run lib/roundtrip.integration
 */
const ROOT = process.env.WORKSHOP_VAULT_ROOT;
const maybe = ROOT ? describe : describe.skip;

maybe("the real migration fixture round-trips losslessly", () => {
  const fixturePath = path.join(ROOT ?? "", "Campaign, Channels, & Content", "_workshop-backups", "workshop-2026-08-03.json");

  function load(): Workspace {
    const raw = fs.readFileSync(fixturePath, "utf8");
    return JSON.parse(raw) as Workspace;
  }

  function campaign(ws: Workspace, id: string): Board {
    const found = ws.campaigns.find((c) => c.id === id);
    if (!found) throw new Error(`fixture is missing campaign "${id}" — has the file moved or changed shape?`);
    return normalise(found);
  }

  it("is on disk where the handoff says it is", () => {
    expect(fs.existsSync(fixturePath)).toBe(true);
  });

  it("holds exactly the counts recorded in the handoff (§5)", () => {
    const ws = load();
    const lastMile = campaign(ws, "last-mile-value-propositions");
    const loop = campaign(ws, "av-unfinished-loop");

    // Evidence, printed so a green tick is never the only thing reported.
    console.log(
      `Last Mile: ${lastMile.ideas.length} ideas, ${lastMile.arc.length} arc, ` +
        `${lastMile.seams.length} seams, ${lastMile.gate.length} gate`,
    );
    console.log(
      `Unfinished Loop: ${loop.ideas.length} ideas, ${loop.arc.length} arc, ` +
        `${loop.seams.length} seams, ${loop.gate.length} gate`,
    );

    expect(lastMile.ideas).toHaveLength(15);
    expect(lastMile.ideas.filter((i) => i.v.E === "in")).toHaveLength(9);
    expect(lastMile.ideas.filter((i) => i.v.E === "hold")).toHaveLength(1);
    expect(lastMile.ideas.filter((i) => i.v.E === "cut")).toHaveLength(3);
    expect(lastMile.ideas.filter((i) => i.v.E === null)).toHaveLength(2);
    expect(lastMile.arc).toHaveLength(5);
    expect(lastMile.seams).toHaveLength(12);
    expect(lastMile.gate).toHaveLength(22);

    expect(loop.ideas).toHaveLength(18);
    expect(loop.ideas.filter((i) => i.v.E === "in")).toHaveLength(2);
    expect(loop.arc).toHaveLength(6);
    expect(loop.seams).toHaveLength(9);
    expect(loop.gate).toHaveLength(20);
  });

  it("keeps Katrina's one verdict — Last Mile IDEA-02 — through normalise", () => {
    const ws = load();
    const lastMile = campaign(ws, "last-mile-value-propositions");
    const idea02 = lastMile.ideas.find((i) => i.id === "IDEA-02");
    expect(idea02?.v.K).toBe("in");
  });

  it("keeps the strip array — the field the app used to drop silently on save", () => {
    const ws = load();
    const lastMile = campaign(ws, "last-mile-value-propositions");
    console.log(`Last Mile strip rows: ${lastMile.strip.length}`);
    expect(lastMile.strip.length).toBeGreaterThan(0);
  });

  it("survives normalise → envelope → JSON round-trip → normalise field-identically", () => {
    const ws = load();
    const original = campaign(ws, "last-mile-value-propositions");
    const enveloped = {
      version: 3,
      identity: "E",
      activeId: original.id,
      campaigns: [{ ...original, sourcePath: undefined }],
    };
    const reparsed = JSON.parse(JSON.stringify(enveloped)) as Workspace;
    const reloaded = normalise(reparsed.campaigns[0]);
    expect(fieldIdentical(original, reloaded)).toBe(true);
  });
});
