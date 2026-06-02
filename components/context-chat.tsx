"use client";

import { useEffect, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { ChatRoom } from "@/components/chat-room";

// "Ask in this context" that opens the AI Advisor over the current page
// (no navigation) with the country / industry pre-loaded as context.
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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
      >
        <MessageSquare className="h-4 w-4" /> {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-stretch justify-end"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm"
          />

          {/* slide-over panel */}
          <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden shadow-2xl animate-[slidein_.25s_ease-out]">
            <div aria-hidden className="bg-chat-metal absolute inset-0" />
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/55">
                  <MessageSquare className="h-3.5 w-3.5" /> AI Advisor
                </div>
                <div className="text-lg font-bold">{name} · in context</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative z-10 flex-1 overflow-y-auto p-5 text-white">
              <ChatRoom country={country} industry={industry} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
