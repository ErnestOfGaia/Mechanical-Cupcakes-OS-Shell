// Dev seed — run via `npx prisma db seed` (wrapped by scripts/safe-seed.ts).
// Passwords come from the env, never hardcoded: this repo is public, and
// safe-seed.ts warns the dev and production databases may be the same one.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
  const missing = SEEDS
    .filter((s) => !(process.env[s.envVar] || "").trim())
    .map((s) => s.envVar);

  if (missing.length > 0) {
    console.error(
      `Seed aborted: missing required env var(s): ${missing.join(", ")}.`
    );
    process.exit(1);
  }

  for (const s of SEEDS) {
    const password = await bcrypt.hash(process.env[s.envVar]!, 10);
    await prisma.user.upsert({
      where: { email: s.email },
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
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
