"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { cn } from "@/lib/utils";
import { Send, X, Bot, User, Sparkles } from "lucide-react";
import { HootContext } from "./HootProvider";

interface HootPanelProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
}

export const HootPanel: React.FC<HootPanelProps> = ({ isOpen, onClose, appName = "Hoot Dashboard" }) => {
  const { messages, addMessage } = useContext(HootContext)!;
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
    addMessage({ role: "user", content: userMsg });
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await response.json();
      addMessage({ role: "assistant", content: data.text });
    } catch (error) {
      addMessage({ role: "assistant", content: "Sorry, I'm having trouble connecting right now." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[950]" onClick={onClose} />
      <div className="fixed top-14 left-4 w-[360px] max-h-[70vh] bg-white/90 backdrop-blur-xl glass-shadow rounded-2xl z-[1000] flex flex-col border border-white/20 animate-in fade-in slide-in-from-left-2 duration-250 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-black/5 bg-violet/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-violet rounded-lg shadow-lg shadow-violet/20 text-lg">🦉</div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hoot</h3>
              <p className="text-[10px] text-violet/70 font-bold uppercase tracking-widest">Global OS Agent</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-md text-slate-400 hover:text-slate-900 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
          {messages.length === 0 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-700 font-medium leading-relaxed bg-black/5 p-4 rounded-2xl border border-black/5 inline-block typewriter">
                  Welcome to <span className="text-violet font-bold">{appName}</span>. I'm Hoot.
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1">Suggested Prompts</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {(appName === "Pelican" 
                  ? ["What recipes are here?", "How do I use the Pelican agent?", "Show other tools"]
                  : appName === "Postcards"
                  ? ["How do I create a postcard?", "Can I share these?", "Show other tools"]
                  : appName === "OCHI Dashboard"
                  ? ["What is the Master Multiplier?", "How is data collected?", "Show other tools"]
                  : ["What is this app?", "How do I use this?", "Show other tools"]
                ).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); }}
                    className="text-left text-xs p-3 rounded-xl bg-white border border-black/5 hover:border-violet/30 hover:bg-violet/5 text-slate-600 hover:text-violet transition-all group font-medium shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-sm",
                msg.role === "assistant" ? "bg-violet text-white" : "bg-slate-200 text-slate-500"
              )}>
                {msg.role === "assistant" ? "🦉" : <User className="w-4 h-4" />}
              </div>
              <div className={cn(
                "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed font-medium shadow-sm",
                msg.role === "assistant" ? "bg-white text-slate-800 border border-black/5" : "bg-violet text-white"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-violet text-white flex items-center justify-center text-xs shadow-sm">🦉</div>
              <div className="bg-white p-3 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-black/5 bg-black/[0.02]">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Hoot anything..."
              className="w-full bg-white border border-black/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all shadow-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-violet rounded-lg text-white hover:bg-violet/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
