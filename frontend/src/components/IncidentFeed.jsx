import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SeverityBadge from './SeverityBadge';
import StatusPill from './StatusPill';

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.max(1, Math.floor(diff))}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const SEV_FILTERS    = ['All', 'P1', 'P2', 'P3', 'P4'];
const STATUS_FILTERS = ['All', 'Active', 'Resolved'];

function Kpi({ label, value, trend, tone }) {
  const tones = { default: 'text-zinc-100', rose: 'text-rose-300', emerald: 'text-emerald-300', sky: 'text-sky-300' };
  return (
    <div className="rounded-lg bg-[#0c0d10] ring-1 ring-white/[0.06] p-4">
      <div className="text-[10.5px] uppercase tracking-wider text-zinc-500 mb-2">{label}</div>
      <div className={`text-2xl font-semibold tabular-nums tracking-tight ${tones[tone] || tones.default}`}>{value}</div>
      <div className="text-[11px] text-zinc-500 mt-1 font-mono">{trend}</div>
    </div>
  );
}

function FilterChips({ value, options, onChange }) {
  return (
    <div className="flex items-center gap-1 p-0.5 bg-white/[0.03] rounded-md ring-1 ring-white/[0.06]">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-2 h-7 text-[11.5px] font-mono rounded transition-colors ${
            value === o ? 'bg-white/[0.08] text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
          }`}>
          {o}
        </button>
      ))}
    </div>
  );
}

export default function IncidentFeed({ reports }) {
  const navigate = useNavigate();
  const [sev, setSev] = useState('All');
  const [st, setSt]   = useState('All');
  const [q, setQ]     = useState('');

  const filtered = useMemo(() => reports.filter(r => {
    if (sev !== 'All' && r.severity !== sev) return false;
    if (st === 'Active'   && r.status === 'resolved') return false;
    if (st === 'Resolved' && r.status !== 'resolved') return false;
    if (q && !((r.service || '').includes(q) || (r.message || '').toLowerCase().includes(q.toLowerCase()) || (r.id || '').includes(q))) return false;
    return true;
  }), [reports, sev, st, q]);

  const counts = useMemo(() => ({
    open:       reports.filter(r => r.status !== 'resolved').length,
    p1p2:       reports.filter(r => r.status !== 'resolved' && (r.severity === 'P1' || r.severity === 'P2')).length,
    resolved:   reports.filter(r => r.status === 'resolved').length,
    analyzing:  reports.filter(r => r.status === 'IN_PROGRESS').length,
  }), [reports]);

  return (
    <div className="px-6 py-5 space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        <Kpi label="Active incidents"  value={counts.open}     trend="live"               tone="default"/>
        <Kpi label="P1 / P2 open"     value={counts.p1p2}     trend="critical + high"    tone="rose"/>
        <Kpi label="Resolved · today"  value={counts.resolved}  trend="MTTR ~31m"          tone="emerald"/>
        <Kpi label="Reports analyzing" value={counts.analyzing} trend={counts.analyzing ? 'AI in progress' : 'Idle'} tone="sky"/>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <FilterChips value={sev} options={SEV_FILTERS} onChange={setSev}/>
        <FilterChips value={st}  options={STATUS_FILTERS} onChange={setSt}/>
        <div className="flex items-center gap-2 px-2.5 h-8 rounded-md bg-white/[0.03] ring-1 ring-white/[0.06] text-zinc-400 flex-1 max-w-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5h18M6 12h12M10 19h4"/>
          </svg>
          <input value={q} onChange={e => setQ(e.target.value)}
            className="bg-transparent outline-none text-[12.5px] flex-1 placeholder-zinc-600 text-zinc-200"
            placeholder="Filter by service, message, or ID…"/>
        </div>
        <span className="ml-auto text-[11.5px] text-zinc-500 font-mono">{filtered.length} of {reports.length}</span>
      </div>

      {/* Table */}
      <div className="rounded-lg ring-1 ring-white/[0.06] overflow-hidden bg-[#0c0d10]">
        <div className="grid grid-cols-[80px_1fr_160px_130px_110px] gap-3 px-4 py-2.5
                        text-[10.5px] uppercase tracking-wider text-zinc-500 font-medium border-b border-white/[0.06]">
          <span>Sev</span>
          <span>Service · Signal</span>
          <span>Status</span>
          <span>Triggered</span>
          <span>Report</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {filtered.map(r => (
            <button key={r.id} onClick={() => navigate(`/incidents/${r.id}`)}
              className="w-full text-left grid grid-cols-[80px_1fr_160px_130px_110px] gap-3 px-4 py-3
                         items-center hover:bg-white/[0.03] transition-colors group">
              <div><SeverityBadge severity={r.severity}/></div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11.5px] text-zinc-500">{r.id}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="font-mono text-[12px] text-sky-300">{r.service}</span>
                </div>
                <div className="text-[12.5px] text-zinc-300 truncate mt-0.5">{r.message}</div>
              </div>
              <div><StatusPill status={r.status}/></div>
              <div className="text-[12px] text-zinc-400 font-mono">{timeAgo(r.timestamp)}</div>
              <div className="flex items-center gap-1.5 text-[11.5px]">
                {r.status === 'IN_PROGRESS' ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-sky-300 animate-spin">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.4"/>
                      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
                    </svg>
                    <span className="text-sky-300">analyzing…</span>
                  </>
                ) : r.status === 'FAILED' ? (
                  <span className="text-rose-400">failed</span>
                ) : (
                  <><span className="text-emerald-400">✦</span><span className="text-zinc-400">ready</span></>
                )}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                     className="ml-auto text-zinc-600 group-hover:text-zinc-300 transition-colors">
                  <path d="m9 6 6 6-6 6"/>
                </svg>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-zinc-500 text-sm">
              {reports.length === 0 ? 'No incidents yet. Declare one to get started.' : 'No incidents match these filters.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
