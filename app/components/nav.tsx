import { NavLink } from "react-router";

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
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <NavLink
          to="/"
          viewTransition
          className="flex items-center gap-2 font-bold text-gray-900 dark:text-white"
        >
          <span>🌪️</span>
          <span>Twister</span>
        </NavLink>
        <div className="flex items-center gap-1 overflow-x-auto">
          {LINKS.map(({ to, label, emoji }) => (
            <NavLink
              key={to}
              to={to}
              viewTransition
              prefetch="intent"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              <span>{emoji}</span>
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
