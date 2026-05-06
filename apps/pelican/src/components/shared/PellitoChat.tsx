'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';

interface Message {
  from: 'user' | 'pellito';
  text: string;
}

interface Props {
  defaultPrompt?: string;
}

export default function PellitoChat({ defaultPrompt = '' }: Props) {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState(defaultPrompt);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { from: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        from: 'pellito',
        text: data.reply || data.error || 'No response.',
      }]);
    } catch {
      setMessages(prev => [...prev, { from: 'pellito', text: 'Network error — try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => { setOpen(o => !o); setInput(defaultPrompt); }}
        className="mt-4 bg-[#526a8d] text-white px-4 py-2 rounded-md
                   hover:bg-[#1B3A5C] transition-colors flex items-center gap-2"
      >
        <span>⚓</span>
        {open ? 'Close Pellito' : 'Ask Pellito'}
      </button>

      {open && (
        <div className="mt-3 border border-[#526a8d]/30 rounded-xl bg-white shadow-md
                        flex flex-col" style={{ height: '320px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.length === 0 && (
              <p className="text-xs text-[#aaa] text-center mt-8">
                ⚓ Ask Pellito anything about this dish or station.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap ${
                  m.from === 'user'
                    ? 'bg-[#526a8d] text-white self-end'
                    : 'bg-[#f0f4f8] text-[#333] self-start border border-[#ddd]'
                }`}
              >
                {m.from === 'pellito' && (
                  <span className="text-[#526a8d] font-bold mr-1">Pellito:</span>
                )}
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="text-sm bg-[#f0f4f8] text-[#888] self-start rounded-lg
                              px-3 py-2 border border-[#ddd]">
                Pellito is thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} className="border-t border-[#eee] flex">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a question…"
              className="flex-1 px-3 py-2 text-sm rounded-bl-xl focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#526a8d] text-white px-4 py-2 rounded-br-xl text-sm
                         hover:bg-[#1B3A5C] transition-colors disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
