"use client";

import { useEffect, useState } from "react";
import { MessageSquare, X, Minus } from "lucide-react";
import { ChatRoom } from "@/components/chat-room";

// "Ask in this context" → opens the AI Advisor as a floating window docked to
// the bottom-right of the page (like a chat widget), so the user never leaves
// the current country / industry page. Minimisable, not a full-page takeover.
export function ContextChat({
  country,
  industry,
  name,
  label = "Ask in this context",
}: {
  country?: string;
  industry?: string;
  name: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Keep the chat mounted once opened (preserve conversation) but allow hiding.
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="glass-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
      >
        <MessageSquare className="h-4 w-4" /> {label}
      </button>

      {mounted && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-white/15 shadow-2xl transition-all duration-300 ${
            open
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0"
          }`}
          style={{
            width: "min(92vw, 430px)",
            height: "min(82vh, 660px)",
          }}
          role="dialog"
          aria-modal="false"
          aria-hidden={!open}
        >
          <div aria-hidden className="bg-chat-metal absolute inset-0" />

          {/* header */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-4 py-3 text-white">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/55">
                <MessageSquare className="h-3 w-3" /> AI Advisor
              </div>
              <div className="truncate text-sm font-bold">
                {name} · in context
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Minimise"
                title="Minimise"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setMounted(false);
                }}
                className="grid h-8 w-8 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* chat body */}
          <div className="relative z-10 min-h-0 flex-1 p-3 text-white">
            <ChatRoom country={country} industry={industry} compact />
          </div>
        </div>
      )}
    </>
  );
}
