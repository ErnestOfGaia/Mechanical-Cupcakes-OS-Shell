import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import ComposeView from "./_components/compose-view";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  return <ComposeView />;
}
