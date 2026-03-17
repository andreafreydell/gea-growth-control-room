"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/ingest", label: "Ingest", icon: "1" },
  { href: "/analysis", label: "Analysis", icon: "2" },
  { href: "/recommendations", label: "Recommendations", icon: "3" },
  { href: "/publish", label: "Publish", icon: "4" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 border-r border-gea-border bg-gea-card p-6 flex flex-col gap-1">
      <div className="mb-8">
        <h1 className="text-lg font-semibold tracking-tight">GEA</h1>
        <p className="text-xs text-gea-muted">Growth Control Room</p>
      </div>
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-gea-accent/10 text-gea-accent font-medium"
                : "text-gea-muted hover:text-gea-text"
            }`}
          >
            <span
              className={`w-5 h-5 flex items-center justify-center text-xs border ${
                active
                  ? "border-gea-accent text-gea-accent"
                  : "border-gea-border text-gea-muted"
              }`}
            >
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
