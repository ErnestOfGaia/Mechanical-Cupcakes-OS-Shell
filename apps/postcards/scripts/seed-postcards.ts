import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ernest = await prisma.user.findUnique({ where: { email: "lotusfuugle@gmail.com" } });
  const katrina = await prisma.user.findUnique({ where: { email: "Katrew@gmail.com" } });

  if (!ernest || !katrina) {
    console.log("Users not found. Run seed.ts first.");
    return;
  }

  // Delete old broken postcards to clean up the UI
  await prisma.postcard.deleteMany({});

  await prisma.postcard.create({
    data: {
      imageUrl: "/images/katrina-mailbox-scene.png",
      message: "Hey Ernest! Just sending a quick test postcard to make sure the gallery works. The weather in Penrith is lovely today! 🇦🇺",
      senderId: katrina.id,
      recipientId: ernest.id,
      isRead: true,
      isSaved: true,
    },
  });

  await prisma.postcard.create({
    data: {
      imageUrl: "/images/ernest-mailbox-scene.png",
      message: "Hey Katrina! Sending one right back from Oregon. It's pouring rain here, as usual! 🌲🌧️",
      senderId: ernest.id,
      recipientId: katrina.id,
      isRead: true,
      isSaved: true,
    },
  });

  console.log("Generated test postcards with valid local images!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
