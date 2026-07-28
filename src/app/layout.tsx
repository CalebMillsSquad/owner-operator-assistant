import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgePlus,
  Bot,
  CalendarDays,
  CircleGauge,
  ClipboardCheck,
  ChartLine,
  ChevronDown,
  FileText,
  Fuel,
  Home,
  LifeBuoy,
  Plus,
  Receipt,
  Route,
  History,
  Target,
  Truck,
  Bell,
  Users,
  Wrench,
} from "lucide-react";

import { BrandMark } from "@/components/BrandMark";
import { SidebarNav } from "@/components/SidebarNav";
import { PilotBanner } from "@/components/PilotBanner";
import { PilotFeedbackControl } from "@/components/PilotFeedbackControl";
import { logoutOperatorAction } from "@/app/login/actions";
import { getOperatorSession } from "@/lib/auth";
import { formatWeekRange } from "@/lib/formatters";
import { endOfCurrentWeek, startOfCurrentWeek } from "@/lib/profitability";

import "./globals.css";

export const metadata: Metadata = {
  title: "TRUSTed Dispatching Command Center",
  description: "Premium dispatching and command-center tools for owner-operator trucking business operations.",
};

const nav = [
  { href: "/", label: "Command Center", icon: <Home className="brand-nav-svg" aria-hidden="true" /> },
  { href: "/loads", label: "Loads & Dispatch", icon: <Truck className="brand-nav-svg" aria-hidden="true" /> },
  {
    href: "/load-acquisition",
    label: "Load Board",
    icon: <Target className="brand-nav-svg" aria-hidden="true" />,
  },
  { href: "/freight-intelligence", label: "Freight Intelligence", icon: <Target className="brand-nav-svg" aria-hidden="true" /> },
  {
    href: "/load-acquisition/lanes",
    label: "Lane Intelligence",
    icon: <Route className="brand-nav-svg" aria-hidden="true" />,
  },
  { href: "/load-acquisition/shippers", label: "Customers", icon: <Users className="brand-nav-svg" aria-hidden="true" /> },
  { href: "/load-acquisition/carrier-network", label: "Drivers", icon: <BadgePlus className="brand-nav-svg" aria-hidden="true" /> },
  { href: "/inspections", label: "Fleet & Equipment", icon: <ClipboardCheck className="brand-nav-svg" aria-hidden="true" /> },
  { href: "/expenses", label: "Expenses", icon: <Receipt className="brand-nav-svg" aria-hidden="true" /> },
  { href: "/fuel", label: "Fuel Purchases", icon: <Fuel className="brand-nav-svg" aria-hidden="true" /> },
  { href: "/load-acquisition/fuel-stops", label: "Fuel Planning", icon: <Route className="brand-nav-svg" aria-hidden="true" /> },
  { href: "/maintenance", label: "Maintenance", icon: <Wrench className="brand-nav-svg" aria-hidden="true" /> },
  { href: "/documents", label: "Documents", icon: <FileText className="brand-nav-svg" aria-hidden="true" /> },
  { href: "/profitability", label: "Reports & Analytics", icon: <ChartLine className="brand-nav-svg" aria-hidden="true" /> },
  { href: "/summary", label: "Alerts & Reminders", icon: <CircleGauge className="brand-nav-svg" aria-hidden="true" /> },
  { href: "/assistant", label: "Driver Assistant", icon: <Bot className="brand-nav-svg" aria-hidden="true" /> },
  { href: "/audit-log", label: "Audit Log", icon: <History className="brand-nav-svg" aria-hidden="true" /> },
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const operator = await getOperatorSession();
  const now = new Date();
  const weekRange = formatWeekRange(startOfCurrentWeek(now), endOfCurrentWeek(now));

  return (
    <html lang="en">
      <body>
        <PilotBanner />
        <div className="brand-shell">
          <aside className="brand-sidebar">
            <Link href="/" className="brand-lockup">
              <BrandMark />
              <div className="min-w-0">
                <p className="brand-wordmark">TRUST<span>ed</span></p>
                <p className="brand-wordmark-sub">Dispatching</p>
                <p className="brand-powered">Powered by Owner Operator Assistant OS</p>
              </div>
            </Link>

            <SidebarNav items={nav} />

            <div className="support-card">
              <span className="support-icon">
                <LifeBuoy className="brand-nav-svg" aria-hidden="true" />
              </span>
              <div>
                <p>Open Command Center</p>
                <span>24/7 Dispatch Support</span>
              </div>
            </div>

          </aside>

          <div className="app-frame">
            <header className="topbar">
              <div>
                <p className="topbar-title">COMMAND CENTER</p>
                <p>Your business. Your freedom. Our technology.</p>
              </div>
              <div className="topbar-actions">
                <Link href="/load-acquisition/carrier-network" className="topbar-button">
                  <Users className="topbar-svg" aria-hidden="true" />
                  <span>Invite Driver</span>
                </Link>
                <span className="topbar-icon notification-icon">
                  <Bell className="topbar-svg" aria-hidden="true" />
                  <span>2</span>
                </span>
                {operator ? (
                  <form action={logoutOperatorAction}>
                    <button type="submit" className="user-chip">
                      <span>
                        <strong>{operator.name}</strong>
                        <small>{operator.role === "OWNER" ? "Pilot Owner" : "Pilot Tester"}</small>
                      </span>
                      <span className="avatar-chip">{getInitials(operator.name) || "OO"}</span>
                      <ChevronDown className="topbar-svg" aria-hidden="true" />
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="user-chip">
                    <span>
                      <strong>Sign in</strong>
                      <small>Operator access</small>
                    </span>
                    <span className="avatar-chip">--</span>
                  </Link>
                )}
                <span className="date-chip">
                  <CalendarDays className="topbar-svg" aria-hidden="true" />
                  <span>{weekRange}</span>
                  <ChevronDown className="topbar-svg" aria-hidden="true" />
                </span>
                <Link href="/loads" className="add-load-button">
                  <Plus className="topbar-svg" aria-hidden="true" />
                  <span>Add New Load</span>
                </Link>
              </div>
            </header>
            <SidebarNav items={nav} variant="mobile" />
            <main className="min-w-0 flex-1 overflow-auto">{children}</main>
          </div>
        </div>
        {process.env.PILOT_MODE === "true" && operator ? <PilotFeedbackControl /> : null}
      </body>
    </html>
  );
}
