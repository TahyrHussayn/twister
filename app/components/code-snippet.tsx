import { useState, useEffect } from "react";
import { STRATEGY_ACCENTS } from "~/lib/theme";

export function CodeSnippet({
  code,
  lang = "typescript",
  filename,
  strategy,
}: {
  code: string;
  lang?: string;
  filename?: string;
  strategy?: string;
}) {
  const accent = strategy ? STRATEGY_ACCENTS[strategy]?.hex : undefined;

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const id = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(id);
    }
  }, [copied]);

  const copy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
  };

  return (
    <div
      className="relative rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden shadow-sm bg-white dark:bg-[#050505]"
      style={{ animationDelay: "0.1s" }}
    >
      {/* Accent gradient top border */}
      {accent && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />
      )}

      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800/80"
        style={{
          backgroundColor: accent
            ? `${accent}08`
            : "var(--tw-bg-opacity, rgba(244, 244, 245, 0.5))",
        }}
      >
        <div className="flex items-center gap-3">
          {filename && (
            <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-300">
              {filename}
            </span>
          )}
          {lang && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
              style={
                accent
                  ? { backgroundColor: `${accent}20`, color: accent }
                  : { backgroundColor: "rgba(161, 161, 170, 0.2)", color: "#71717a" }
              }
            >
              {lang}
            </span>
          )}
        </div>
        <button
          onClick={copy}
          className="text-xs font-semibold px-2.5 py-1 rounded transition-all"
          style={
            copied
              ? {
                  color: accent || "#10b981",
                  backgroundColor: accent ? `${accent}15` : "rgba(16, 185, 129, 0.1)",
                }
              : { color: "#71717a", backgroundColor: "transparent" }
          }
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-5 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
