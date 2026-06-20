import { NavLink } from "react-router";
import { useState } from "react";

const LINKS = [
  { to: "/", label: "Dashboard", emoji: "📊" },
  { to: "/ssr", label: "SSR", emoji: "⚡" },
  { to: "/csr", label: "CSR", emoji: "🖥️" },
  { to: "/ssg", label: "SSG", emoji: "🏗️" },
  { to: "/streaming", label: "Streaming", emoji: "🌊" },
  { to: "/isr", label: "ISR", emoji: "🔄" },
  { to: "/ppr", label: "PPR", emoji: "🧩" },
  { to: "/islands", label: "Islands", emoji: "🏝️" },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <NavLink
          to="/"
          viewTransition
          className="flex items-center gap-2 font-bold text-lg text-zinc-900 dark:text-white hover:opacity-80 transition-opacity shrink-0"
        >
          <span className="text-xl">🌪️</span>
          <span className="hidden sm:inline">Twister</span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {LINKS.map(({ to, label, emoji }) => (
            <NavLink
              key={to}
              to={to}
              viewTransition
              prefetch="intent"
              className={({ isActive }) =>
                `px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`
              }
            >
              <span>{emoji}</span>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-1 max-w-7xl mx-auto">
            {LINKS.map(({ to, label, emoji }) => (
              <NavLink
                key={to}
                to={to}
                viewTransition
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`
                }
              >
                <span className="mr-2">{emoji}</span>
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
