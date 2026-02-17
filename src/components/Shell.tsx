"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { clearToken, getToken } from "@/lib/token";

function NavItem({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/") || pathname?.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        "rounded-xl px-3 py-2 text-sm font-semibold transition " +
        (active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100")
      }
    >
      {label}
    </Link>
  );
}

export function Shell({
  children,
  userLabel,
}: {
  children: React.ReactNode;
  userLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // ✅ Client-side auth guard (fixes Vercel redirect loops if you rely on localStorage token)
  React.useEffect(() => {
    // Allow login page without token
    if (pathname?.startsWith("/login")) return;

    const token = getToken();
    if (!token) {
      const next = pathname || "/dashboard";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [pathname, router]);

  React.useEffect(() => {
    // Close menu after navigation
    setMobileOpen(false);
  }, [pathname]);

  function onLogout() {
    clearToken();
    setMobileOpen(false);
    router.replace("/login");
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-900 text-white font-black shrink-0">
              IG
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-4">INS Grades Admin</div>
              <div className="text-xs text-slate-500 leading-4 truncate">
                {userLabel || "Superuser panel"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden gap-2 md:flex">
              <NavItem href="/dashboard" label="Matrix" />
              <NavItem href="/superusers" label="Superusers" />
              {/* ✅ Tools removed */}
            </nav>

            {/* Desktop logout */}
            <button
              onClick={onLogout}
              className="hidden md:inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Logout
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile slide-over menu */}
        {mobileOpen ? (
          <div className="md:hidden">
            <div
              className="fixed inset-0 z-30 bg-black/30"
              aria-hidden="true"
              onClick={() => setMobileOpen(false)}
            />

            <div className="fixed right-0 top-0 z-40 h-full w-[84%] max-w-sm border-l border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
                <div className="min-w-0">
                  <div className="font-semibold">Menu</div>
                  {userLabel ? (
                    <div className="mt-1 text-xs text-slate-500 break-all">{userLabel}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-2 p-3">
                <NavItem href="/dashboard" label="Matrix" onClick={() => setMobileOpen(false)} />
                <NavItem href="/superusers" label="Superusers" onClick={() => setMobileOpen(false)} />
                {/* ✅ Tools removed */}

                <div className="mt-2">
                  <button
                    onClick={onLogout}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
