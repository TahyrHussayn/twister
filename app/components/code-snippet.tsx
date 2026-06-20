import { useState } from "react";

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
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accent = STRATEGY_ACCENTS[strategy ?? ""]?.hex ?? "#71717a";

  return (
    <div
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-fade-in"
      style={{ animationDelay: "0.1s" }}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{filename}</span>
          )}
          {lang && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider"
              style={{ backgroundColor: accent + "20", color: accent }}
            >
              {lang}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={copy}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

import { STRATEGY_ACCENTS } from "~/lib/theme";
