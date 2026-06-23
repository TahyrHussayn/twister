import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import { Nav } from "~/components/nav";
import stylesheet from "~/app.css?url";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: stylesheet },
];

export function meta() {
  return [
    { title: "Twister — Web Rendering Strategy Playground" },
    {
      name: "description",
      content:
        "Explore SSR, CSR, SSG, Streaming, ISR, Islands, HTMX and more — all running live on Cloudflare Workers with React Router v8.",
    },
    { name: "theme-color", content: "#070810" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const matchLatency = cookieHeader.match(/twister_latency=(\d+)/);
  const latency = matchLatency ? parseInt(matchLatency[1], 10) : 0;

  const matchTheme = cookieHeader.match(/twister_theme=(light|dark)/);
  const theme = matchTheme ? matchTheme[1] : "dark";

  return { latency, theme };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const theme = data?.theme ?? "dark";
  const latency = data?.latency ?? 0;

  return (
    <html lang="en" className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Nav theme={theme} latency={latency} />
        <main>{children}</main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Something went wrong";
  let message = "An unexpected error occurred.";
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title = `${error.status} — ${error.statusText}`;
    message = typeof error.data === "string" ? error.data : "This page doesn't exist.";
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div
          className="text-7xl font-black mb-4"
          style={{ fontFamily: "var(--font-display)", color: "#6366f1" }}
        >
          {status}
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
        <p className="text-[var(--color-fg-dim)] mb-8 text-sm leading-relaxed">{message}</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-80"
          style={{ background: "#6366f1" }}
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
