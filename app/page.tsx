"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisMessage, setCrisisMessage] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input || input.trim() === "" || isLoading) return;

    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);
    setLogs([]);

    try {
      const payload = {
        messages: [...messages, { role: "user", content: userText }]
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let buffer = "";

      if (reader) {
        // Tambahkan bubble asisten kosong untuk diisi stream
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // simpan sisa potongan baris terakhir

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.type === "log") {
                console.log("[Server Status]:", data.message);
              } else if (data.type === "crisis_intervention") {
                setCrisisMessage(data.message);
                setShowCrisisModal(true);
                // Hapus bubble kosong yang tadi dibuat
                setMessages(prev => prev.slice(0, -1));
                setIsLoading(false);
                return;
              } else if (data.type === "text") {
                assistantText += data.chunk;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantText,
                  };
                  return updated;
                });
              }
            } catch (err) {
              console.error("Parse error line:", line, err);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "Terjadi kesalahan koneksi. Silakan coba lagi." }]);
    } finally {
      setIsLoading(false);
      // Hapus log setelah streaming selesai
      setLogs([]);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3">
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Asmashita</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Pendengar empatik berbasis AI</p>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">Mulai curhat...</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-600"
              }`}
            >
              {msg.role === "assistant" && isLoading && i === messages.length - 1
                ? msg.content.replace(/<think>[\s\S]*?<\/think>/g, "").trim() // Hapus think block juga saat streaming untuk UI rapi
                : msg.content.replace(/<think>[\s\S]*?<\/think>/g, "").trim() || (isLoading && i === messages.length - 1 ? "..." : "")}
            </div>
          </div>
        ))}

        {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
              {/* Animasi Titik Bergelombang (Typing Indicator) */}
              <div className="flex space-x-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan..."
            disabled={isLoading}
            className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 px-4 py-2 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input || input.trim() === ""}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kirim
          </button>
        </form>
      </footer>

      {/* Crisis Modal */}
      {showCrisisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 max-w-md mx-4 shadow-xl">
            <h2 className="text-lg font-bold text-red-600 mb-3">Perhatian Penting</h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap mb-4">
              {crisisMessage}
            </p>
            <button
              onClick={() => setShowCrisisModal(false)}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
