import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import InboxView from "./_components/inbox-view";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  return <InboxView />;
}
