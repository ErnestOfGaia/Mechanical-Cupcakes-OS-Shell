"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, BookOpen, LogOut, Heart, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MailboxViewProps {
  username: string;
  mailboxScene: string;
  birdImage: string;
  unreadCount: number;
}

export default function MailboxView({ username, mailboxScene, birdImage, unreadCount }: MailboxViewProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const hasNewMail = (unreadCount ?? 0) > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const sceneImage = mailboxScene === "penrith"
    ? "/images/katrina-mailbox-scene.png"
    : "/images/ernest-mailbox-scene.png";

  const greeting = mailboxScene === "penrith"
    ? "G'day from Penrith 🇦🇺"
    : "Hello from Oregon 🌲";

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-rose-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" fill="currentColor" />
            <span className="font-display font-bold text-rose-700 text-lg">Love Mailbox</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Hi, {username ?? "friend"} 💌</span>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12 flex flex-col md:flex-row gap-8 lg:gap-12 items-center md:items-start">
        
        {/* Left Column: Greeting & Action Buttons */}
        <div className="w-full md:w-1/3 flex flex-col gap-8 md:sticky md:top-24">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center md:text-left"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-foreground leading-tight">
              {greeting}
            </h1>
            <p className="text-muted-foreground mt-3 text-base">
              Look outside your window...
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <Button
              onClick={() => router.push("/mailbox/inbox")}
              className="h-auto py-5 px-6 bg-[#0F1115]/90 hover:bg-[#0F1115] text-white border border-[#EAEAF0]/10 rounded-xl shadow-md hover:shadow-xl transition-all flex items-center justify-start gap-4 relative backdrop-blur-md"
            >
              <Inbox className="w-7 h-7" />
              <span className="font-semibold text-lg">Check Mail</span>
              {hasNewMail && mounted && (
                <span className="absolute top-1/2 -translate-y-1/2 right-4 bg-amber-400 text-amber-900 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Button>

            <Button
              onClick={() => router.push("/mailbox/compose")}
              className="h-auto py-5 px-6 bg-[#0F1115]/90 hover:bg-[#0F1115] text-white border border-[#EAEAF0]/10 rounded-xl shadow-md hover:shadow-xl transition-all flex items-center justify-start gap-4 backdrop-blur-md"
            >
              <Send className="w-7 h-7" />
              <span className="font-semibold text-lg">Send Postcard</span>
            </Button>

            <Button
              onClick={() => router.push("/mailbox/gallery")}
              className="h-auto py-5 px-6 bg-[#0F1115]/90 hover:bg-[#0F1115] text-white border border-[#EAEAF0]/10 rounded-xl shadow-md hover:shadow-xl transition-all flex items-center justify-start gap-4 backdrop-blur-md"
            >
              <BookOpen className="w-7 h-7" />
              <span className="font-semibold text-lg">Gallery</span>
            </Button>
          </motion.div>
        </div>

        {/* Right Column: Window Scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-2/3 relative rounded-3xl shadow-2xl border border-white/10 bg-[#0F1115] p-3 sm:p-4"
        >
          {/* Scene Image (aspect-[2/1] makes it roughly 10-15% shorter than aspect-video) */}
          <div className="relative aspect-[2/1] w-full rounded-2xl overflow-hidden bg-amber-100">
            <Image
              src={sceneImage}
              alt={`${mailboxScene === "penrith" ? "Penrith suburbs" : "Oregon landscape"} view from window`}
              fill
              className="object-cover"
              priority
            />

            {/* Mail indicator badge */}
            {hasNewMail && mounted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 bg-rose-500 text-white rounded-full px-4 py-1.5 text-sm font-bold shadow-xl flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {unreadCount} new {unreadCount === 1 ? "postcard" : "postcards"}!
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
