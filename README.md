# Twister 🌪️

Twister is an educational and benchmarking playground that beautifully visualizes modern Web Rendering Strategies at the Edge. Built on top of **React Router v8** and deployed to **Cloudflare Workers**, Twister lets you experience, compare, and benchmark different rendering architectures in real-time.

## ✨ Features

- **Live Edge Benchmarks**: An interactive dashboard that runs live tests measuring Time to First Byte (TTFB) and cache HIT/MISS status for every strategy simultaneously.
- **Premium, Mobile-Ready UI**: Designed with a sleek "elite dark mode", glassmorphism navigation, animated charts, and fully fluid responsive grids that look incredible on mobile devices and desktop screens alike.
- **7 Rendering Strategies Visualized**: Includes dedicated pages breaking down the mechanics, pros, and trade-offs of modern architectures.
- **Powered by Vite+ & Tailwind v4**: Blazing fast builds and cutting-edge utility class styling.

## 🏗️ Supported Rendering Strategies

This project actively implements and demonstrates:

1. **SSR (Server-Side Rendering)**: HTML rendered per-request at the edge, offering perfect SEO and zero client waterfalls.
2. **CSR (Client-Side Rendering)**: Minimal HTML shell delivering a dynamic React application straight to the browser.
3. **SSG (Static Site Generation)**: Pre-rendered HTML at build time for instant edge delivery with zero compute overhead.
4. **Streaming**: Chunk-by-chunk HTML streaming as promises resolve on the server, optimizing perceived load times.
5. **ISR (Incremental Static Regeneration)**: Global edge caching that automatically revalidates stale content in the background.
6. **PPR (Partial Prerendering)**: A hybrid approach merging a static instant shell with dynamic content "holes".
7. **Islands**: Static HTML architecture sprinkled with isolated, interactive React components (progressive hydration).
8. **HTMX**: Hypermedia-driven UI that uses server-rendered HTML fragments and zero client JS frameworks.
9. **Hybrid**: Per-route and mixed rendering strategy that combines static SSG shells with dynamic CSR client fetching.
10. **Edge vs Origin**: Interactive benchmark demonstrating latency differences between Edge compute and centralized origins.

## 🗂️ Project Structure

- `app/root.tsx`: The main application shell and layout, handling CSS imports, metadata, and the global loading progress bar.
- `app/routes.ts`: Configures the file-based routing architecture.
- `app/strategies/*`: Contains the implementations and UI for every individual rendering strategy (e.g., `ssr.tsx`, `csr.tsx`, `isr.tsx`).
- `app/components/*`: Reusable, highly polished UI elements like the responsive `nav.tsx`, dynamic `code-snippet.tsx`, caching `metrics-badge.tsx`, and `comparison-panel.tsx`.
- `app/api/benchmark.ts`: The backend endpoint that parallelizes requests to all strategies to aggregate TTFB metrics.
- `wrangler.jsonc`: Cloudflare configuration for deploying the project to the global edge network.

## 🚀 Getting Started

This project relies on **Vite+** (`vp`), a unified toolchain for runtime management, formatting, and building.

### Installation

Clone the repository and install dependencies using `vp`:

```bash
vp install
```

### Development

Run the development server locally with Hot Module Replacement (HMR):

```bash
vp dev
```

Visit the app at `http://localhost:5173`.

### Benchmarking & Testing locally

```bash
vp check   # Format, lint, and typecheck the codebase
vp test    # Run test suites
```

### Deployment to Cloudflare Edge

Deploying is handled via the Wrangler CLI.

```bash
npm run deploy
```

## 💅 Styling

Twister is styled using **Tailwind CSS v4** seamlessly integrated into Vite. The styles emphasize a futuristic dashboard aesthetic using radial gradients, shimmers, dotted backgrounds, and custom CSS-based view transitions defined inside `app/app.css`.

## 📝 Recent Updates & Changelog

### Phase 1: Cloudflare Native Architecture Refactor

- **Codebase Optimization**: Purged illustrative but non-native strategies (e.g. React Server Components and Qwik) which were unsuitable for a pure Cloudflare Workers environment.
- **Dependency Cleanup**: Removed bloated CSS tokens (`--s-ring`), dead React components (`TableSkeleton`), and stale metrics configurations.

### Phase 2: Core Expansion & Transparency

- **Transparency UI**: Added a `STRATEGY_METADATA` file and a "Native Implementation" vs "Illustrative Demo" badge system to every strategy page, including a dedicated Legend on the dashboard to maximize user understanding.
- **HTMX Playground (`/htmx`)**: Introduced a hypermedia-driven architecture page relying entirely on server-rendered HTML fragments, removing the need for heavy client JS frameworks.
- **Hybrid Rendering (`/hybrid`)**: Demonstrated mixing SSG static shells with dynamic CSR React components, utilizing React Router v8's `prerender` configurations.
- **Edge vs. Origin Benchmark (`/edge-vs-origin`)**: Added a visually stunning, interactive benchmark comparing the low-latency response of edge compute against simulated traditional centralized origin servers.

### Phase 3: Architectural Consistency & Polish

- **Theme Consistency**: Fixed capitalization bugs in the backend benchmarking logic (`api/benchmark.ts`) for HTMX, Hybrid, and Edge-vs-Origin to ensure seamless mapping with CSS accent tokens.
- **UI Integrity**: Added missing `.strat-*` glow variables to `app.css` for the three newest strategies.
- **Documentation Parity**: Updated code snippets (e.g., SSG configuration) to perfectly match the active, deployed `react-router.config.ts`.

_Built with ❤️ utilizing React Router, Cloudflare Workers, and Vite+._
