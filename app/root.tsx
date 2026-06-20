import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";
import { useEffect, useState } from "react";

import type { Route } from "./+types/root";
import { Nav } from "./components/nav";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400;700&display=swap",
  },
];

function ProgressBar() {
  const navigation = useNavigation();
  const active = navigation.state !== "idle";
  const [complete, setComplete] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      setShow(true);
      setComplete(false);
    } else if (show) {
      setComplete(true);
      const timeout = setTimeout(() => {
        setShow(false);
      }, 400); // Allow time for the bar to hit 100% and fade out
      return () => clearTimeout(timeout);
    }
  }, [active, show]);

  if (!show) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-[2px] z-[100] pointer-events-none transition-opacity duration-300"
      style={{ opacity: complete ? 0 : 1 }}
    >
      <div
        className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] origin-left"
        style={{
          transform: complete ? "scaleX(1)" : "scaleX(0)",
          animation: complete
            ? "none"
            : "progress-bar-loading 10s cubic-bezier(0.075, 0.82, 0.165, 1) forwards",
          transition: complete ? "transform 0.2s ease-out" : "none",
        }}
      />
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Twister</title>
        <Meta />
        <Links />
      </head>
      <body>
        <ProgressBar />
        <div className="elite-bg" />
        <Nav />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <main
      className="max-w-7xl mx-auto px-4 py-8 min-h-screen"
      style={{
        viewTransitionName: "main-content",
        opacity: isLoading ? 0.6 : 1,
        transition: "opacity 0.15s ease-in-out",
      }}
    >
      <Outlet />
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-24">
      <div className="rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-zinc-900 p-8">
        <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">{message}</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto rounded-xl bg-red-50 dark:bg-red-950 text-sm font-mono">
            <code>{stack}</code>
          </pre>
        )}
        <a
          href="/"
          className="inline-block mt-6 text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Go back home
        </a>
      </div>
    </main>
  );
}
