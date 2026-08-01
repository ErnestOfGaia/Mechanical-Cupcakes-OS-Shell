// Pre-compiled seed — runs with plain `node` in the Docker runner (no tsx needed).
// Prototype originally built on Abacus.ai; this seed is for self-hosted deployment.
//
// Passwords come from the VPS .env and are never hardcoded — this repo is public.
// `update: { password }` means rotating the env var and redeploying actually
// rotates the login; with `update: {}` a rotation would be cosmetic.
"use strict";
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SEEDS = [
  {
    envVar: "SEED_ERNEST_PASSWORD",
    email: "lotusfuugle@gmail.com",
    username: "ernest",
    mailboxScene: "oregon",
    birdImage: "/images/ernest-bird.png",
  },
  {
    envVar: "SEED_KATRINA_PASSWORD",
    email: "Katrew@gmail.com",
    username: "katrina",
    mailboxScene: "penrith",
    birdImage: "/images/katrina-bird.png",
  },
];

async function main() {
  // Fail before touching the database, so a misconfigured container stops with
  // an actionable message instead of half-seeding.
  const missing = SEEDS
    .filter((s) => !(process.env[s.envVar] || "").trim())
    .map((s) => s.envVar);

  if (missing.length > 0) {
    console.error(
      `Seed aborted: missing required env var(s): ${missing.join(", ")}.\n` +
        `Add them to apps/postcards/.env on the VPS, then recreate the container.`
    );
    process.exit(1);
  }

  for (const s of SEEDS) {
    const password = await bcrypt.hash(process.env[s.envVar], 10);
    await prisma.user.upsert({
      where: { email: s.email },
      // Only the credential is force-rotated. mailboxScene and birdImage are
      // presentation fields — overwriting them every restart would clobber
      // any customization.
      update: { password },
      create: {
        username: s.username,
        email: s.email,
        password,
        mailboxScene: s.mailboxScene,
        birdImage: s.birdImage,
      },
    });
  }

  console.log(`Seeded users: ${SEEDS.map((s) => s.username).join(", ")}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
