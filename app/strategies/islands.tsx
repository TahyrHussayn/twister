import type { Route } from "./+types/islands";
import { makePosts, makeUser, liveSeed } from "~/lib/seed";
import { createMetrics } from "~/lib/metrics";
import { getEdgeInfo } from "~/lib/edge-info";
import { StrategyPage, SectionDivider } from "~/components/strategy-page";
import { FlowDiagram } from "~/components/flow-diagram";
import { CodeSnippet } from "~/components/code-snippet";
import { ComparisonPanel } from "~/components/comparison-panel";
import { useFetcher } from "react-router";

type Env = {
  DB?: {
    prepare: (sql: string) => {
      bind: (...args: any[]) => any;
      first: <T>() => Promise<T | null>;
      all: <T>() => Promise<{ results?: T[] }>;
      run: () => Promise<void>;
    };
  };
};

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = (context as any)?.cloudflare?.env as Env | undefined;
  const seed = liveSeed();

  let likes = 42;
  let comments: Array<{ id: string; text: string }> = [
    { id: "default1", text: "Islands architecture is fantastic!" },
    { id: "default2", text: "Love how each island hydrates independently." },
  ];

  if (env?.DB) {
    try {
      const likesRow = await env.DB.prepare("SELECT count FROM likes WHERE id = 1").first<{
        count: number;
      }>();
      if (likesRow) likes = likesRow.count;
      const rows = await env.DB.prepare(
        "SELECT id, text FROM comments ORDER BY id DESC LIMIT 5",
      ).all<{ id: string; text: string }>();
      if (rows.results?.length) comments = rows.results;
    } catch {
      /* D1 not available in local dev/fallback */
    }
  }

  return {
    likes,
    comments,
    user: makeUser(seed),
    posts: makePosts(seed, 3),
    edgeInfo: getEdgeInfo(request),
    metrics: createMetrics("Islands"),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const env = (context as any)?.cloudflare?.env as Env | undefined;
  const form = await request.formData();
  const intent = form.get("intent") as string;

  if (env?.DB) {
    try {
      if (intent === "like") {
        await env.DB.prepare("UPDATE likes SET count = count + 1 WHERE id = 1").run();
      }
      if (intent === "comment") {
        const text = (form.get("text") as string)?.trim();
        if (text) {
          const id = Math.random().toString(36).slice(2, 9);
          await env.DB.prepare("INSERT INTO comments (id, text) VALUES (?, ?)")
            .bind(id, text)
            .run();
        }
      }
    } catch {
      /* D1 fallback */
    }
  }
  return null;
}

function LikeIsland({ likes }: { likes: number }) {
  const fetcher = useFetcher();
  const optimisticLikes = fetcher.formData?.get("intent") === "like" ? likes + 1 : likes;
  const isPending = fetcher.state !== "idle";

  return (
    <div className="island p-6" data-island="island:1 — Like Counter">
      <p className="eyebrow mb-3" style={{ color: "#14b8a6" }}>
        Interactive Island
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span className="metric-value" style={{ fontSize: "2.25rem", color: "var(--s-accent)" }}>
          {optimisticLikes}
        </span>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="like" />
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-80 active:scale-95"
            style={{
              background: "var(--s-accent)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {isPending ? "..." : "♥ Like"}
          </button>
        </fetcher.Form>
      </div>
      <p className="text-xs text-[var(--color-subtle)] mt-3">
        Hydrates & binds state independently.
      </p>
    </div>
  );
}

function CommentIsland({ comments }: { comments: Array<{ id: string; text: string }> }) {
  const fetcher = useFetcher();
  const isPending = fetcher.state !== "idle";
  const optimisticComment = fetcher.formData?.get("text") as string | null;
  const allComments = optimisticComment
    ? [{ id: "optimistic", text: optimisticComment }, ...comments]
    : comments;

  return (
    <div
      className="island p-6"
      data-island="island:2 — Comment Form"
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <p className="eyebrow mb-2" style={{ color: "#14b8a6" }}>
        Interactive Island
      </p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {allComments.map((c) => (
          <li
            key={c.id}
            style={{
              fontSize: 13,
              color: "var(--color-fg-dim)",
              padding: 8,
              borderRadius: 8,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {c.text}
          </li>
        ))}
      </ul>
      <fetcher.Form method="post" style={{ display: "flex", gap: 8 }}>
        <input type="hidden" name="intent" value="comment" />
        <input
          name="text"
          type="text"
          placeholder="Add a comment..."
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: 13,
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            background: "var(--s-accent)",
            color: "#fff",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {isPending ? "..." : "Post"}
        </button>
      </fetcher.Form>
    </div>
  );
}

export default function IslandsPage({ loaderData }: Route.ComponentProps) {
  const { likes, comments, user, posts, edgeInfo: _edgeInfo, metrics } = loaderData;

  const flowSteps = [
    { icon: "📄", label: "SSR Page", active: true },
    { icon: "🏝️", label: "Island 1: Like", active: true },
    { icon: "🏝️", label: "Island 2: Comments", active: true },
    { icon: "🧱", label: "Island 3: Static" },
    { icon: "🧱", label: "Island 4: Static" },
  ];

  return (
    <StrategyPage
      strategy="islands"
      title="React Islands"
      icon="🏝️"
      description="HTML is generated completely on the server. The client only downloads and runs JS for isolated interactive components (islands). Static zones incur zero hydration or client bundle overhead."
      metrics={metrics}
    >
      <section style={{ marginBottom: 48 }}>
        <div className="eyebrow" style={{ color: "#64748b", marginBottom: 12 }}>
          Lifecycle
        </div>
        <FlowDiagram steps={flowSteps} />
      </section>

      <SectionDivider label="Mental Model" />
      <section style={{ marginBottom: 48 }}>
        <div className="glass-card p-6">
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              color: "var(--color-fg-dim)",
              lineHeight: 1.6,
            }}
          >
            In traditional React, hydration is all-or-nothing (monolithic). In an Islands
            architecture, the page is a static HTML page containing placeholders for dynamic
            content. Only those designated placeholders (represented with <code>.island</code>{" "}
            borders below) are hydrated on the client.
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
            Note: React Router v8 implements this conceptually in Twister using isolated Client
            components and fetcher hooks to simulate separate island-based rendering.
          </p>
        </div>
      </section>

      <SectionDivider label="Visual Observatory Grid" />

      {/* Islands Demo Grid */}
      <section
        style={{
          marginBottom: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
        }}
      >
        {/* Island 1: Likes */}
        <LikeIsland likes={likes} />

        {/* Island 2: Comments */}
        <CommentIsland comments={comments} />

        {/* Island 3: Static Profile */}
        <div
          className="island p-6"
          data-island="island:3 — Static Profile"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <p className="eyebrow mb-2" style={{ color: "#475569" }}>
            Static Island
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="avatar" style={{ background: user.avatarColor }}>
              {user.initials}
            </div>
            <div>
              <h4 style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700 }}>{user.name}</h4>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
                {user.role} · {user.city}
              </p>
            </div>
          </div>
          <p className="text-xs text-[var(--color-subtle)] mt-2">
            Zero Client JS — pure server-rendered markup.
          </p>
        </div>

        {/* Island 4: Static Posts */}
        <div
          className="island p-6"
          data-island="island:4 — Static Posts"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <p className="eyebrow mb-2" style={{ color: "#475569" }}>
            Static Island
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {posts.map((p) => (
              <li key={p.id} style={{ fontSize: 12, color: "var(--color-fg-dim)" }}>
                ⚡ <strong>{p.title}</strong>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--color-subtle)] mt-2">
            Zero Client JS — pure server-rendered markup.
          </p>
        </div>
      </section>

      <SectionDivider label="How it works" />
      <section style={{ marginBottom: 48 }}>
        <CodeSnippet code={ISLANDS_CODE} filename="app/strategies/islands.tsx" />
      </section>

      <SectionDivider label="Strategy Assessment" />
      <ComparisonPanel
        pros={[
          "Optimizes hydration bundle sizes",
          "Interactive slots in static page",
          "No client framework cost for static content",
        ]}
        cons={[
          "Requires specialized router or build system",
          "Complex state sharing between islands",
          "Data synchronization issues",
        ]}
        related={[
          { to: "/ssr", label: "SSR" },
          { to: "/ppr", label: "Stream+Cache" },
          { to: "/ssg", label: "SSG" },
        ]}
      />
    </StrategyPage>
  );
}

const ISLANDS_CODE = `// Island 1: Independent hydrated component
function LikeIsland({ initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);

  // Client-side hydration executes only for this island
  return (
    <div className="island" data-island="likes">
      <button onClick={() => setLikes(l => l + 1)}>
        ♥ {likes}
      </button>
    </div>
  );
}

// Entire page structure contains mostly static HTML:
export default function Page() {
  return (
    <html>
      <body>
        <StaticHeader />
        
        {/* Hydrates only this chunk! */}
        <LikeIsland initialLikes={42} />
        
        <StaticFooter />
      </body>
    </html>
  );
}`;
