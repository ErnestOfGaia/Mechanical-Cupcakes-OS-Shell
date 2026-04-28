"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Mail, MailOpen, Bookmark, BookmarkCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

export default function InboxView() {
  const router = useRouter();
  const [postcards, setPostcards] = useState<PostcardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<PostcardData | null>(null);

  const fetchMail = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/postcards?type=received");
      const data = await res?.json?.();
      setPostcards(data?.postcards ?? []);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load mail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMail(); }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/postcards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      setPostcards((prev: PostcardData[]) =>
        (prev ?? []).map((pc: PostcardData) => pc?.id === id ? { ...pc, isRead: true } : pc)
      );
    } catch (e: any) { console.error(e); }
  };

  const toggleSave = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/postcards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSaved: !current }),
      });
      setPostcards((prev: PostcardData[]) =>
        (prev ?? []).map((pc: PostcardData) => pc?.id === id ? { ...pc, isSaved: !current } : pc)
      );
      toast.success(current ? "Removed from saved" : "Postcard saved!");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to update");
    }
  };

  const openCard = (pc: PostcardData) => {
    setSelectedCard(pc);
    if (!pc?.isRead) markAsRead(pc?.id ?? "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/mailbox")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
            <span className="font-display font-bold text-rose-700">Inbox</span>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchMail}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
          </div>
        ) : (postcards?.length ?? 0) === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Mail className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-display font-semibold text-muted-foreground">No postcards yet</h2>
            <p className="text-sm text-muted-foreground mt-2">Your mailbox is empty. Check back soon!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {(postcards ?? []).map((pc: PostcardData, idx: number) => (
              <motion.div
                key={pc?.id ?? idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => openCard(pc)}
                className={`relative cursor-pointer rounded-xl p-4 shadow-sm hover:shadow-md transition-all border ${
                  pc?.isRead
                    ? "bg-white/60 border-rose-100"
                    : "bg-rose-50 border-rose-200 ring-1 ring-rose-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {pc?.isRead ? (
                    <MailOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Mail className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${pc?.isRead ? "text-foreground" : "text-rose-700"}`}>
                      From {pc?.sender?.username ?? "someone"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {(pc?.message ?? "").substring(0, 80)}{(pc?.message?.length ?? 0) > 80 ? "..." : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e: React.MouseEvent) => { e?.stopPropagation?.(); toggleSave(pc?.id ?? "", pc?.isSaved ?? false); }}
                      className="p-1 rounded hover:bg-rose-100 transition-colors"
                    >
                      {pc?.isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {pc?.createdAt ? new Date(pc.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
                senderName={selectedCard?.sender?.username ?? "someone"}
                date={selectedCard?.createdAt ?? ""}
              />
              <div className="flex justify-center gap-3 mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleSave(selectedCard?.id ?? "", selectedCard?.isSaved ?? false)}
                  className="bg-white/80"
                >
                  {selectedCard?.isSaved ? (
                    <><BookmarkCheck className="w-4 h-4 mr-1 text-amber-500" /> Saved</>
                  ) : (
                    <><Bookmark className="w-4 h-4 mr-1" /> Save</>
                  )}
                </Button>
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
