export function TransparencyLegend() {
  return (
    <div className="mt-12 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
        Transparency Legend
      </h3>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Native Implementation
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            This strategy is fully implemented using Cloudflare Workers native APIs and features. It
            reflects a genuine production-ready approach for edge rendering.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <div className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Illustrative Demo
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            This strategy relies on Node.js specific features or adds excessive bundle weight, which
            isn't suitable for native Cloudflare Workers. It is included for educational comparison
            but runs in a simulated or proxy environment.
          </p>
        </div>
      </div>
    </div>
  );
}
