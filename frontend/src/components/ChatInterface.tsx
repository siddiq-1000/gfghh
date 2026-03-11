"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  onQueryResponse: (response: Record<string, unknown>) => void;
  disabled?: boolean;
  initialMessage?: string;
}

export default function ChatInterface({ 
  onQueryResponse, 
  disabled = false, 
  initialMessage = "Data successfully loaded! What would you like to know about it?" 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: initialMessage }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const query = input;
    setInput("");
    
    // Add user message
    const newMessages = [...messages, { role: 'user' as const, text: query }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          chat_history: newMessages.map(m => encodeURIComponent(m.text)) // Simplified history passing
        })
      });
      
      const data = await response.json();
      
      if (data.explanation) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.explanation }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${data.error}` }]);
      }
      
      onQueryResponse(data);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't connect to the analytical engine." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-900/30 rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl backdrop-blur-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-blue-600/90 text-white rounded-br-none shadow-lg shadow-blue-900/20' 
                : 'bg-neutral-800/80 text-neutral-200 rounded-bl-none border border-neutral-700/50 shadow-lg'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-neutral-800/80 rounded-2xl rounded-bl-none p-4 border border-neutral-700/50">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      
      <div className="p-3 bg-neutral-900 border-t border-neutral-800">
        <form onSubmit={handleSubmit} className="flex relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled || loading}
            placeholder={disabled ? "Waiting for data upload..." : "Ask about your data..."}
            className="w-full bg-neutral-800/50 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-neutral-700 transition-all placeholder:text-neutral-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button 
            type="submit" 
            disabled={disabled || !input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-neutral-500 transition-colors text-white disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
