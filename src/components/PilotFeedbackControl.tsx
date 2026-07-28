"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { MessageSquare, X } from "lucide-react";

import { submitPilotFeedbackAction } from "@/app/pilot-actions";

export function PilotFeedbackControl() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const width = typeof window === "undefined" ? "" : String(window.innerWidth);
  const height = typeof window === "undefined" ? "" : String(window.innerHeight);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed bottom-4 right-4 z-50 inline-flex h-11 items-center gap-2 rounded-md bg-[#0a3fa7] px-4 text-sm font-semibold text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0a3fa7]" aria-haspopup="dialog">
        <MessageSquare className="h-4 w-4" aria-hidden="true" /> Feedback
      </button>
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="pilot-feedback-title">
          <section className="w-full max-w-lg rounded-md bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 id="pilot-feedback-title" className="text-lg font-bold text-[#0a2342]">Pilot feedback</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded p-2 text-slate-600 hover:bg-slate-100" aria-label="Close feedback form"><X className="h-5 w-5" /></button>
            </div>
            <form action={submitPilotFeedbackAction} className="mt-4 space-y-4">
              <input type="hidden" name="route" value={pathname} />
              <input type="hidden" name="viewportWidth" value={width} />
              <input type="hidden" name="viewportHeight" value={height} />
              <p className="text-xs text-slate-500">Route: {pathname}. Viewport details are included automatically.</p>
              <label className="block text-sm font-medium text-slate-700">Category
                <select name="category" className="input mt-1 w-full" required defaultValue="BUG">
                  <option value="BUG">Something is broken</option><option value="CONFUSING">Something is confusing</option><option value="IDEA">Idea or suggestion</option><option value="DATA_ISSUE">Test data issue</option><option value="ACCESSIBILITY">Accessibility</option><option value="OTHER">Other</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">Description
                <textarea name="description" className="input mt-1 min-h-32 w-full" minLength={5} maxLength={4000} required placeholder="What happened, what did you expect, and what were you trying to do?" />
              </label>
              <fieldset disabled className="opacity-70"><label className="block text-sm font-medium text-slate-700">Screenshot (temporarily disabled)<input type="file" accept="image/png,image/jpeg,image/webp" className="mt-1 block w-full text-sm" /></label><p className="mt-1 text-xs text-slate-500">Screenshots stay disabled until isolated pilot object storage is approved.</p></fieldset>
              <button type="submit" className="btn-primary w-full">Send feedback</button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
