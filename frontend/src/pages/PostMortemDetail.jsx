import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostMortem } from '../api/client';
import SeverityBadge from '../components/SeverityBadge';
import TopBar from '../components/TopBar';

function Section({ title, content }) {
  if (!content) return null;
  return (
    <div className="rounded-lg bg-[#0c0d10] ring-1 ring-white/[0.06]">
      <div className="px-4 py-2.5 border-b border-white/[0.05]">
        <h3 className="text-[12px] font-medium text-zinc-300 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-4">
        <p className="text-[13.5px] text-zinc-200 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

function ActionItem({ item }) {
  const [status, setStatus] = useState(item.status || 'todo');
  const cycle = () => setStatus(s => s === 'todo' ? 'in-progress' : s === 'in-progress' ? 'done' : 'todo');
  const label  = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' }[status];
  const dot    = { todo: 'bg-zinc-500', 'in-progress': 'bg-amber-400', done: 'bg-emerald-400' }[status];
  const txtCls = status === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-200';
  const tagCls = { todo: 'text-zinc-400 bg-white/[0.04]', 'in-progress': 'text-amber-300 bg-amber-400/10', done: 'text-emerald-300 bg-emerald-400/10' }[status];
  return (
    <div className="flex items-start gap-2 p-2 rounded-md hover:bg-white/[0.03]">
      <button onClick={cycle}
        className="mt-0.5 w-4 h-4 rounded grid place-items-center ring-1 ring-white/[0.1] hover:ring-white/[0.2] shrink-0">
        {status === 'done' && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        )}
        {status === 'in-progress' && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"/>}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-[12.5px] leading-snug ${txtCls}`}>{item.text}</div>
        <div className="mt-1 flex items-center gap-2 text-[10.5px] font-mono">
          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${tagCls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`}/>{label}
          </span>
          {item.owner && <span className="text-zinc-500">{item.owner}</span>}
        </div>
      </div>
    </div>
  );
}

function Meta({ k, v }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[12.5px] border-b border-white/[0.04] last:border-0">
      <span className="text-zinc-500">{k}</span>
      <span className="text-zinc-200">{v}</span>
    </div>
  );
}

export default function PostMortemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pm, setPm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchPostMortem(id)
      .then(data => { setPm(data); setLoading(false); })
      .catch(err => { setLoading(false); if (err.response?.status === 404) setNotFound(true); });
  }, [id]);

  const breadcrumbs = [
    { label: 'Postmortems', onClick: () => navigate('/postmortems') },
    { label: pm?.postmortemId || id },
  ];

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Postmortem" breadcrumbs={breadcrumbs}/>
        <div className="flex items-center justify-center flex-1">
          <p className="text-zinc-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (notFound || !pm) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Not Found" breadcrumbs={breadcrumbs}/>
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <p className="text-zinc-400">Postmortem not found.</p>
          <button onClick={() => navigate('/postmortems')} className="text-sky-400 hover:underline text-sm">← Back to Postmortems</button>
        </div>
      </div>
    );
  }

  const sampleActionItems = pm.actionItems || [
    { id: '1', text: 'Document incident timeline and impact', owner: 'SRE', status: 'done' },
    { id: '2', text: 'Implement monitoring for early detection', owner: 'Platform', status: 'in-progress' },
    { id: '3', text: 'Update runbook with resolution steps', owner: 'SRE', status: 'todo' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title={pm.postmortemId || 'Postmortem'}
        subtitle={pm.title}
        breadcrumbs={breadcrumbs}
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 max-w-[1100px] space-y-5">
        {/* Hero */}
        <div className="rounded-xl ring-1 ring-white/[0.06] bg-gradient-to-b from-[#0e0f13] to-[#0a0b0d] p-5">
          <div className="flex items-center gap-2 mb-2 text-[11px] font-mono text-zinc-500">
            <SeverityBadge severity={pm.severity}/>
            <span>{pm.postmortemId}</span>
            <span className="text-zinc-700">·</span>
            <span className="text-sky-300">{pm.service}</span>
            {pm.incidentDate && <><span className="text-zinc-700">·</span><span>{pm.incidentDate}</span></>}
          </div>
          <h2 className="text-[20px] font-semibold text-zinc-100 leading-snug max-w-3xl">{pm.title}</h2>
        </div>

        {/* 2-col layout */}
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-4">
            <Section title="Summary"    content={pm.summary}/>
            <Section title="Root Cause" content={pm.rootCause}/>
            <Section title="Detection"  content={pm.detection}/>
            <Section title="Resolution" content={pm.resolution}/>
            <Section title="Indicators" content={pm.indicators}/>
          </div>

          <div className="space-y-4">
            {/* Action items */}
            <div className="rounded-lg bg-[#0c0d10] ring-1 ring-white/[0.06]">
              <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                <h3 className="text-[12px] font-medium text-zinc-200 uppercase tracking-wider">Action items</h3>
              </div>
              <div className="p-2 space-y-1">
                {sampleActionItems.map(a => <ActionItem key={a.id} item={a}/>)}
              </div>
            </div>

            {/* Metadata */}
            <div className="rounded-lg bg-[#0c0d10] ring-1 ring-white/[0.06] p-4">
              <h3 className="text-[12px] font-medium text-zinc-300 uppercase tracking-wider mb-3">Metadata</h3>
              <Meta k="Service" v={<span className="font-mono text-sky-300">{pm.service}</span>}/>
              <Meta k="Severity" v={<SeverityBadge severity={pm.severity}/>}/>
              {pm.incidentDate && <Meta k="Date" v={<span className="font-mono">{pm.incidentDate}</span>}/>}
              <Meta k="ID" v={<span className="font-mono text-zinc-400">{pm.postmortemId}</span>}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
