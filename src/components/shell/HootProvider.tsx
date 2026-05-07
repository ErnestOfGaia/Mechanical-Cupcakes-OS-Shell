"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface HootContextType {
  messages: Message[];
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
}

const HootContext = createContext<HootContextType | undefined>(undefined);

export function HootProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <HootContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </HootContext.Provider>
  );
}

export function useHoot() {
  const context = useContext(HootContext);
  if (context === undefined) {
    throw new Error("useHoot must be used within a HootProvider");
  }
  return context;
}
