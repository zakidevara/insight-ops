import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchPostMortems } from '../api/client';
import SeverityBadge from '../components/SeverityBadge';
import TopBar from '../components/TopBar';
import IngestPanel from '../components/IngestPanel';

function SmallStat({ label, value }) {
  return (
    <div className="rounded-lg bg-[#0c0d10] ring-1 ring-white/[0.06] p-4">
      <div className="text-[10.5px] uppercase tracking-wider text-zinc-500 mb-1.5">{label}</div>
      <div className="text-xl font-semibold tabular-nums text-zinc-100 tracking-tight">{value}</div>
    </div>
  );
}

const SEV_FILTERS = ['All', 'P1', 'P2', 'P3', 'P4'];

export default function PostMortemList() {
  const [postMortems, setPostMortems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sev, setSev] = useState('All');
  const [q, setQ] = useState('');

  useEffect(() => {
    fetchPostMortems()
      .then(data => { setPostMortems(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const filtered = useMemo(() => postMortems.filter(pm => {
    if (sev !== 'All' && pm.severity !== sev) return false;
    if (q && !((pm.title || '').toLowerCase().includes(q.toLowerCase()) || (pm.service || '').includes(q) || (pm.postmortemId || '').includes(q))) return false;
    return true;
  }), [postMortems, sev, q]);

  const stats = useMemo(() => ({
    total: postMortems.length,
    p1: postMortems.filter(p => p.severity === 'P1').length,
    openActions: 0, // action items not stored in API response
  }), [postMortems]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Postmortems"
        subtitle="Searchable corpus · grounds AI suggestions"
        breadcrumbs={null}
        actions={null}
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <SmallStat label="Total postmortems" value={stats.total}/>
          <SmallStat label="P1 incidents" value={stats.p1}/>
          <SmallStat label="Services covered" value={new Set(postMortems.map(p => p.service)).size}/>
          <SmallStat label="Avg MTTR" value="38m"/>
        </div>

        {/* Upload */}
        <div className="rounded-lg bg-[#0c0d10] ring-1 ring-white/[0.06] p-4">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-3">Ingest new postmortem</div>
          <IngestPanel/>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-white/[0.03] rounded-md ring-1 ring-white/[0.06]">
            {SEV_FILTERS.map(s => (
              <button key={s} onClick={() => setSev(s)}
                className={`px-2 h-7 text-[11.5px] font-mono rounded transition-colors ${
                  sev === s ? 'bg-white/[0.08] text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                }`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-2.5 h-8 rounded-md bg-white/[0.03] ring-1 ring-white/[0.06] flex-1 max-w-sm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
            </svg>
            <input value={q} onChange={e => setQ(e.target.value)}
              className="bg-transparent outline-none text-[12.5px] flex-1 placeholder-zinc-600 text-zinc-200"
              placeholder="Search by title, service, PM-id…"/>
          </div>
          <span className="ml-auto text-[11.5px] text-zinc-500 font-mono">{filtered.length} of {postMortems.length}</span>
        </div>

        {loading && <p className="text-zinc-500 text-sm py-4">Loading postmortems…</p>}
        {error && <p className="text-rose-400 text-sm">{error}</p>}

        {/* Cards */}
        <div className="space-y-3">
          {filtered.map(pm => (
            <Link key={pm.id} to={`/postmortems/${pm.id}`}
              className="block rounded-lg ring-1 ring-white/[0.06] bg-[#0c0d10] hover:ring-white/[0.12] hover:bg-[#0e0f13] p-4 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <SeverityBadge severity={pm.severity}/>
                <span className="font-mono text-[11px] text-zinc-500">{pm.postmortemId}</span>
                <span className="font-mono text-[11.5px] text-sky-300">{pm.service}</span>
                <span className="ml-auto text-[11px] text-zinc-500 font-mono flex items-center gap-3">
                  {pm.incidentDate && <span>{pm.incidentDate}</span>}
                </span>
              </div>
              <div className="text-[14.5px] font-medium text-zinc-100 mb-1.5 group-hover:text-white">{pm.title}</div>
              {pm.summary && (
                <p className="text-[12.5px] text-zinc-400 line-clamp-2 mb-3">{pm.summary}</p>
              )}
              <div className="flex items-center gap-3 text-[11.5px] text-zinc-500 font-mono">
                {pm.indicators && (
                  <span className="text-zinc-600 truncate">{pm.indicators.slice(0, 60)}…</span>
                )}
              </div>
            </Link>
          ))}

          {!loading && filtered.length === 0 && (
            <p className="text-zinc-500 text-sm py-4">
              {postMortems.length === 0 ? 'No postmortems yet. Ingest a document above.' : 'No postmortems match the current filters.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
