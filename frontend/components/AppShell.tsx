"use client";

import {
  FileUp,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  LogOut,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { clearSession } from "@/lib/api";
import type { User } from "@/types/finance";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "CSV Upload", icon: FileUp },
  { href: "/transactions", label: "Transactions", icon: ListChecks },
  { href: "/insights", label: "Insights", icon: Lightbulb },
];

type Props = {
  children: ReactNode;
  user: User | null;
};

export function AppShell({ children, user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <WalletCards size={22} />
          </span>
          Finance Analyzer
        </Link>

        <nav className="nav" aria-label="Primary navigation">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link className={`nav-link ${active ? "active" : ""}`} href={link.href} key={link.href}>
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span>{user?.full_name ?? "Signed in"}</span>
          <span>{user?.email}</span>
          <button className="logout-button" type="button" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <section className="content">{children}</section>
    </main>
  );
}

