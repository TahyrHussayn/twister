import { NavLink } from "react-router";
import { useState } from "react";
import { STRATEGY_ACCENTS } from "~/lib/theme";

const LINKS = [
  { to: "/", label: "Dashboard", key: "Dashboard" },
  { to: "/ssr", label: "SSR", key: "SSR" },
  { to: "/csr", label: "CSR", key: "CSR" },
  { to: "/ssg", label: "SSG", key: "SSG" },
  { to: "/streaming", label: "Streaming", key: "Streaming" },
  { to: "/isr", label: "ISR", key: "ISR" },
  { to: "/ppr", label: "PPR", key: "PPR" },
  { to: "/islands", label: "Islands", key: "Islands" },
  { to: "/htmx", label: "HTMX", key: "HTMX" },
  { to: "/hybrid", label: "Hybrid", key: "HYBRID" },
  { to: "/edge-vs-origin", label: "Edge vs Origin", key: "EDGE-VS-ORIGIN" },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="elite-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <NavLink
          to="/"
          className="flex items-center gap-2 font-bold text-lg text-white hover:opacity-80 transition-opacity shrink-0 tracking-tight"
        >
          Twister
        </NavLink>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map(({ to, label, key }) => {
            const accentColor = key !== "Dashboard" ? STRATEGY_ACCENTS[key]?.hex : undefined;
            return (
              <NavLink
                key={to}
                to={to}
                prefetch="intent"
                viewTransition
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-200 flex items-center gap-2 ${
                    isActive
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                  }`
                }
              >
                {accentColor && (
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}80` }}
                  />
                )}
                {label}
              </NavLink>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
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
      </div>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 border-b border-zinc-800/60 bg-[#050505]/95 backdrop-blur-lg shadow-xl shadow-black/50">
          <div className="px-4 py-3 space-y-1 max-w-7xl mx-auto max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            {LINKS.map(({ to, label, key }) => {
              const accentColor = key !== "Dashboard" ? STRATEGY_ACCENTS[key]?.hex : undefined;
              return (
                <NavLink
                  key={to}
                  to={to}
                  viewTransition
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                      isActive
                        ? "bg-white text-black"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`
                  }
                >
                  {accentColor && (
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{
                        backgroundColor: accentColor,
                        boxShadow: `0 0 8px ${accentColor}80`,
                      }}
                    />
                  )}
                  {label}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
