import Link from "next/link";

export function PilotBanner() {
  if (process.env.PILOT_MODE !== "true") return null;
  return <div className="sticky top-0 z-50 flex min-h-10 items-center justify-center gap-3 bg-amber-300 px-4 py-2 text-center text-sm font-bold text-amber-950 shadow-sm"><span>Mills Trucking Pilot - Test Data Only</span><Link href="/pilot" className="underline underline-offset-2">Pilot home</Link></div>;
}
