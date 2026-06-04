"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MessageSquare, X, Minus, GripVertical } from "lucide-react";
import { ChatRoom } from "@/components/chat-room";

// "Ask in this context" → a solid floating AI Advisor window. Defaults to the
// bottom-right; drag it anywhere by the header. The user never leaves the page.
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
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const winRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    sx: number;
    sy: number;
    baseLeft: number;
    baseTop: number;
  } | null>(null);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    // ignore drags that start on the minimise / close buttons
    if ((e.target as HTMLElement).closest("button")) return;
    const el = winRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    drag.current = { sx: e.clientX, sy: e.clientY, baseLeft: r.left, baseTop: r.top };
    setPos({ left: r.left, top: r.top });
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const el = winRef.current;
    const w = el?.offsetWidth ?? 430;
    const h = el?.offsetHeight ?? 660;
    const left = Math.max(
      8,
      Math.min(d.baseLeft + (e.clientX - d.sx), window.innerWidth - w - 8),
    );
    const top = Math.max(
      8,
      Math.min(d.baseTop + (e.clientY - d.sy), window.innerHeight - h - 8),
    );
    setPos({ left, top });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    drag.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="glass-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
      >
        <MessageSquare className="h-4 w-4" /> {label}
      </button>

      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={winRef}
            className={`fixed z-[60] flex origin-bottom-right flex-col overflow-hidden rounded-2xl border border-white/15 shadow-2xl ${
              dragging ? "" : "transition-[opacity,transform] duration-200 ease-out"
            } ${pos ? "" : "bottom-4 right-4"} ${
              open
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none translate-y-2 scale-95 opacity-0"
            }`}
          style={{
            width: "min(92vw, 430px)",
            height: "min(82vh, 660px)",
            // solid + opaque (no background-attachment:fixed, which leaks the page)
            background: "linear-gradient(155deg, #102a54 0%, #0a1c3a 100%)",
            ...(pos ? { left: pos.left, top: pos.top } : {}),
          }}
          role="dialog"
          aria-modal="false"
          aria-hidden={!open}
        >
          <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#7c5cff]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-[#5ad7e8]/20 blur-3xl" />

          {/* header — drag handle */}
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className={`relative z-10 flex touch-none select-none items-center justify-between border-b border-white/10 px-4 py-3 text-white ${
              dragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <div className="flex min-w-0 items-center gap-1.5">
              <GripVertical className="h-4 w-4 shrink-0 text-white/40" />
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/55">
                  AI Advisor
                </div>
                <div className="truncate text-sm font-bold">
                  {name} · in context
                </div>
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
          </div>,
          document.body,
        )}
    </>
  );
}
