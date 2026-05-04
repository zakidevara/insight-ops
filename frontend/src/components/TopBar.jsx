export default function TopBar({ title, subtitle, breadcrumbs, actions }) {
  return (
    <div className="h-[52px] shrink-0 border-b border-white/[0.06] bg-[#0c0d10]/60 backdrop-blur px-6 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1 mb-0.5">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-zinc-700">/</span>}
                {b.onClick
                  ? <button onClick={b.onClick} className="hover:text-zinc-300">{b.label}</button>
                  : <span>{b.label}</span>}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-baseline gap-3 min-w-0">
          <h1 className="text-[15px] font-semibold text-zinc-100 truncate">{title}</h1>
          {subtitle && <span className="text-[12px] text-zinc-500 truncate">{subtitle}</span>}
        </div>
      </div>

      {/* Decorative search */}
      <div className="hidden md:flex items-center gap-2 px-2.5 h-8 w-64 rounded-md bg-white/[0.03] ring-1 ring-white/[0.06] text-zinc-500">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
        </svg>
        <span className="text-[12.5px] flex-1 text-zinc-600">Search incidents, runbooks…</span>
        <span className="text-[10px] font-mono">⌘ /</span>
      </div>

      {actions}
    </div>
  );
}
