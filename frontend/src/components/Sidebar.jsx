import { Link, useLocation } from 'react-router-dom';
import Avatar from './Avatar';

function NavItem({ to, icon, label, badge, active }) {
  return (
    <Link
      to={to}
      className={`group w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
        active
          ? 'bg-white/[0.06] text-white'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]'
      }`}
    >
      <span className={`text-[15px] ${active ? 'text-sky-300' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {badge != null && (
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
          active ? 'bg-sky-400/20 text-sky-200' : 'bg-white/[0.04] text-zinc-400'
        }`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar({ incidentCount, postmortemCount, onDeclare }) {
  const { pathname } = useLocation();
  const is = (p) => pathname === p || pathname.startsWith(p + '/');

  return (
    <aside className="w-[232px] shrink-0 border-r border-white/[0.06] bg-[#0c0d10] flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <div className="relative w-7 h-7 rounded-md bg-gradient-to-br from-sky-400 to-violet-500 grid place-items-center shadow-[0_0_18px_-2px_rgba(56,189,248,0.5)]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-950">
            <path d="M3 12h4l3-8 4 16 3-8h4"/>
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-zinc-100 tracking-tight">InsightOps</div>
          <div className="text-[10px] text-zinc-500 font-mono">acme · prod</div>
        </div>
      </div>

      {/* Declare CTA */}
      <div className="px-3 pb-3">
        <button
          onClick={onDeclare}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md
                     bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500
                     text-white text-[12.5px] font-medium
                     shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_8px_24px_-12px_rgba(244,63,94,0.7)]
                     ring-1 ring-rose-400/30 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>
          </svg>
          Declare Incident
          <span className="ml-auto text-[10px] font-mono opacity-70">⌘ K</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 space-y-0.5">
        <div className="px-2 pb-1.5 text-[10px] uppercase tracking-[0.14em] text-zinc-600 font-medium">Workspace</div>
        <NavItem
          to="/"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>}
          label="Incidents"
          badge={incidentCount}
          active={pathname === '/' || is('/incidents') || pathname.startsWith('/incidents')}
        />
        <NavItem
          to="/postmortems"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5z"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>}
          label="Postmortems"
          badge={postmortemCount}
          active={is('/postmortems')}
        />

        <div className="px-2 pt-3 pb-1.5 text-[10px] uppercase tracking-[0.14em] text-zinc-600 font-medium">Saved views</div>
        <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block"/>Open P1 / P2
        </button>
        <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block"/>Assigned to me
        </button>
        <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block"/>auth-service · 30d
        </button>
      </nav>

      {/* User pill */}
      <div className="mt-auto p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-1.5 py-1 rounded-md hover:bg-white/[0.03]">
          <Avatar name="Priya Shah" size={26}/>
          <div className="leading-tight flex-1 min-w-0">
            <div className="text-[12px] text-zinc-200 truncate">Priya Shah</div>
            <div className="text-[10px] text-zinc-500 font-mono">on-call · primary</div>
          </div>
          <span className="text-[9px] font-mono text-emerald-300 bg-emerald-400/10 ring-1 ring-emerald-400/20 rounded px-1.5 py-0.5">
            ON
          </span>
        </div>
      </div>
    </aside>
  );
}
