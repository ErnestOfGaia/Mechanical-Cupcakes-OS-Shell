"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Send, X, Bot, User, Sparkles } from "lucide-react";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface HootPanelProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
}

export const HootPanel: React.FC<HootPanelProps> = ({ isOpen, onClose, appName = "Postcards" }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      // In Phase 1, we assume each app has a proxy to the central Hoot or its own local Mastra
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble connecting to the OS layer right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[950]" onClick={onClose} />
      <div className="fixed top-14 left-4 w-[360px] max-h-[70vh] glass-panel glass-shadow rounded-2xl z-[1000] flex flex-col border border-white/10 animate-in fade-in slide-in-from-left-2 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/5 bg-[#7C5CFF]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-[#7C5CFF] rounded-lg shadow-lg shadow-[#7C5CFF]/20 text-lg">🦉</div>
            <div>
              <h3 className="text-sm font-bold text-[#EAEAF0]">Hoot</h3>
              <p className="text-[10px] text-[#7C5CFF]/70 font-medium uppercase tracking-widest">Global OS Agent</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-md text-[#EAEAF0]/40 hover:text-[#EAEAF0] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
          {messages.length === 0 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm text-[#EAEAF0]/90 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                  Welcome to <span className="text-[#7C5CFF] font-semibold">{appName}</span>. I'm Hoot, your guide to Mechanical Cupcakes OS.
                </p>
                <p className="text-xs text-[#EAEAF0]/40 px-1">How can I help you today?</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {["What is this app?", "How do I send a card?", "Show other tools"].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); }}
                    className="text-left text-xs p-3 rounded-lg bg-white/5 border border-white/5 hover:border-[#7C5CFF]/30 hover:bg-[#7C5CFF]/5 text-[#EAEAF0]/60 hover:text-[#7C5CFF] transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs",
                msg.role === "assistant" ? "bg-[#7C5CFF] text-white" : "bg-white/10 text-[#EAEAF0]/40"
              )}>
                {msg.role === "assistant" ? "🦉" : <User className="w-4 h-4" />}
              </div>
              <div className={cn(
                "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                msg.role === "assistant" ? "bg-white/5 text-[#EAEAF0] border border-white/5" : "bg-[#7C5CFF] text-white"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#7C5CFF] text-white flex items-center justify-center text-xs">🦉</div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#EAEAF0]/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#EAEAF0]/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#EAEAF0]/20 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 bg-white/5">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Hoot anything..."
              className="w-full bg-[#0F1115] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-[#EAEAF0] placeholder:text-[#EAEAF0]/20 focus:outline-none focus:border-[#7C5CFF]/50 focus:ring-1 focus:ring-[#7C5CFF]/20 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#7C5CFF] rounded-lg text-white hover:bg-[#7C5CFF]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
