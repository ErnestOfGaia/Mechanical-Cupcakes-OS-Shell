import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const ernestPass = await bcrypt.hash("ernest", 10);
  const katrinaPass = await bcrypt.hash("katrina", 10);
  const johnPass = await bcrypt.hash("johndoe123", 10);

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

  await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: {
      username: "admin",
      email: "john@doe.com",
      password: johnPass,
      mailboxScene: "oregon",
      birdImage: "/images/ernest-bird.png",
    },
  });

  console.log("Seeded users: ernest, katrina, admin");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
