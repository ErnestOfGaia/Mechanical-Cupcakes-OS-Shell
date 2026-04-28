"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Send, Inbox, BookmarkCheck, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import PostcardFlip from "@/components/postcard-flip";

interface PostcardData {
  id: string;
  imageUrl: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isSaved: boolean;
  sender?: { username: string; email: string };
  recipient?: { username: string; email: string };
}

export default function GalleryView() {
  const router = useRouter();
  const [tab, setTab] = useState("received");
  const [postcards, setPostcards] = useState<PostcardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<PostcardData | null>(null);

  const fetchCards = async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/postcards?type=${type}`);
      const data = await res?.json?.();
      setPostcards(data?.postcards ?? []);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load postcards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCards(tab); }, [tab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/mailbox")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
          <span className="font-display font-bold text-rose-700">Gallery</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="received" onValueChange={(v: string) => setTab(v ?? "received")}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
            <TabsTrigger value="received" className="flex items-center gap-1">
              <Inbox className="w-4 h-4" /> Received
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-1">
              <Send className="w-4 h-4" /> Sent
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-1">
              <BookmarkCheck className="w-4 h-4" /> Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
              </div>
            ) : (postcards?.length ?? 0) === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-display font-semibold text-muted-foreground">No postcards here</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {tab === "sent" ? "Send your first postcard!" : tab === "saved" ? "Save postcards from your inbox" : "No postcards received yet"}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(postcards ?? []).map((pc: PostcardData, idx: number) => (
                  <motion.div
                    key={pc?.id ?? idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedCard(pc)}
                    className="cursor-pointer group"
                  >
                    <div className="relative aspect-[3/2] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border-4 border-white bg-amber-100">
                      {pc?.imageUrl ? (
                        <Image
                          src={pc.imageUrl}
                          alt="Postcard"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300 bg-amber-100"
                          unoptimized
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/katrina-mailbox-scene.png";
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Heart className="w-10 h-10 text-rose-300" />
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white text-xs truncate">
                          {tab === "sent" ? `To ${pc?.recipient?.username ?? "someone"}` : `From ${pc?.sender?.username ?? "someone"}`}
                        </p>
                        <p className="text-white/70 text-xs">
                          {pc?.createdAt ? new Date(pc.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Postcard Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e?.stopPropagation?.()}
              className="w-full max-w-4xl"
            >
              <PostcardFlip
                imageUrl={selectedCard?.imageUrl ?? ""}
                message={selectedCard?.message ?? ""}
                senderName={tab === "sent" ? "you" : (selectedCard?.sender?.username ?? "someone")}
                date={selectedCard?.createdAt ?? ""}
              />
              <div className="flex justify-center mt-4">
                <Button variant="secondary" size="sm" onClick={() => setSelectedCard(null)} className="bg-white/80">
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
