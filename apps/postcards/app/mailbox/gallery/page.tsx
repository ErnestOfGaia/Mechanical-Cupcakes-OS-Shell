import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import GalleryView from "./_components/gallery-view";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  return <GalleryView />;
}
