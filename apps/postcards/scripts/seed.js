// Pre-compiled seed — runs with plain `node` in the Docker runner (no tsx needed).
// Prototype originally built on Abacus.ai; this seed is for self-hosted deployment.
"use strict";
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const [ernestPass, katrinaPass] = await Promise.all([
    bcrypt.hash("ernest", 10),
    bcrypt.hash("katrina", 10),
  ]);

  await prisma.user.upsert({
    where: { email: "lotusfuugle@gmail.com" },
    update: {},
    create: {
      username: "ernest",
      email: "lotusfuugle@gmail.com",
      password: ernestPass,
      mailboxScene: "oregon",
      birdImage: "/images/ernest-bird.png",
    },
  });

  await prisma.user.upsert({
    where: { email: "Katrew@gmail.com" },
    update: {},
    create: {
      username: "katrina",
      email: "Katrew@gmail.com",
      password: katrinaPass,
      mailboxScene: "penrith",
      birdImage: "/images/katrina-bird.png",
    },
  });

  console.log("Seeded users: ernest, katrina");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
