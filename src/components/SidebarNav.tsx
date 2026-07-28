"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

type SidebarNavProps = {
  items: readonly NavItem[];
  variant?: "sidebar" | "mobile";
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ items, variant = "sidebar" }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={variant === "mobile" ? "brand-mobile-nav" : "brand-nav"} aria-label="Main navigation">
      {items.map((link) => {
        const isActive = isActivePath(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`${variant === "mobile" ? "brand-mobile-nav-link" : "brand-nav-link"} ${isActive ? "brand-nav-link-primary" : ""}`}
          >
            <span className={variant === "mobile" ? "brand-mobile-nav-icon" : "brand-nav-icon"} aria-hidden="true">
              {link.icon}
            </span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
