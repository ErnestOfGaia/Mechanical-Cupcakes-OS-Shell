import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import MailboxView from "./_components/mailbox-view";

export const dynamic = "force-dynamic";

export default async function MailboxPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any)?.id ?? "";
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const unreadCount = await prisma.postcard.count({
    where: { recipientId: userId, isRead: false },
  });

  return (
    <MailboxView
      username={user?.username ?? "friend"}
      mailboxScene={user?.mailboxScene ?? "oregon"}
      birdImage={user?.birdImage ?? "/images/ernest-bird.png"}
      unreadCount={unreadCount ?? 0}
    />
  );
}
