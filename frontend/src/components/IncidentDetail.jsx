import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SeverityBadge from './SeverityBadge';
import StatusPill from './StatusPill';
import ConfidenceTag from './ConfidenceTag';
import { fetchPostMortemsForIncident } from '../api/client';

function fmtTime(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Card({ title, icon, right, accent, children }) {
  return (
    <div className={`rounded-lg bg-[#0c0d10] ring-1 ${accent === 'sky' ? 'ring-sky-500/15' : 'ring-white/[0.06]'}`}>
      {title && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.05]">
          {icon && <span className="shrink-0">{icon}</span>}
          <h3 className="text-[12px] font-medium text-zinc-200 uppercase tracking-wider">{title}</h3>
          {right && <div className="ml-auto">{right}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

function ShimmerLines({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-3.5 rounded animate-pulse bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04]"
             style={{ width: `${85 - i * 10}%` }}/>
      ))}
    </div>
  );
}

const TRACE_TOOLS = ['metrics.query', 'logs.search', 'deploys.recent', 'postmortems.similar'];

function StreamingTrace() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= TRACE_TOOLS.length) return;
    const t = setTimeout(() => setStep(s => s + 1), 900);
    return () => clearTimeout(t);
  }, [step]);
  return (
    <div className="space-y-2.5">
      {TRACE_TOOLS.slice(0, step + 1).map((tool, i) => (
        <div key={i} className="flex items-start gap-3 text-[12.5px]">
          {i < step
            ? <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
            : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-sky-300 animate-spin mt-1 shrink-0">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.4"/>
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>}
          <span className="font-mono text-[11.5px] px-1.5 py-0.5 rounded bg-white/[0.04] text-emerald-300 shrink-0">{tool}</span>
          <span className="text-zinc-400">Running analysis…</span>
        </div>
      ))}
    </div>
  );
}

function ReportPane({ report, parsed, isGenerating, isFailed, postmortems, provider }) {
  if (isFailed) {
    return (
      <div className="bg-rose-950 rounded-lg p-6 border border-rose-800 flex items-start gap-3">
        <span className="text-rose-400 text-lg mt-0.5">✕</span>
        <div>
          <p className="text-rose-300 text-sm font-medium">Analysis failed</p>
          <p className="text-rose-400 text-xs mt-1">
            The LLM could not complete the analysis. Check backend logs for details, then re-declare if needed.
          </p>
        </div>
      </div>
    );
  }

  const providerLabel = provider === 'GEMINI' ? 'Gemini · gemini-2.0-flash' : 'Ollama · qwen2.5:7b';
  const providerDot = provider === 'GEMINI' ? 'bg-sky-400' : 'bg-emerald-400';

  return (
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-2 space-y-4">
        {/* Shell tool calls — only shown while generating or when MCP tools were actually invoked */}
        {(isGenerating || parsed?.toolsUsed?.length > 0) && (
          <Card title="Shell tool calls" accent="sky"
                right={
                  <span className="flex items-center gap-1.5 text-[10.5px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-white/[0.03] ring-1 ring-white/[0.06]">
                    <span className={`w-1.5 h-1.5 rounded-full ${providerDot}`}/>
                    via {providerLabel}
                  </span>
                }>
            {isGenerating ? <StreamingTrace/> : (
              <div className="space-y-3">
                {parsed.toolsUsed.map((t, i) => (
                  <div key={i} className="rounded-md bg-black/30 ring-1 ring-white/[0.06] overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.02]">
                      <span className="text-emerald-400 text-[11px]">✓</span>
                      <span className="font-mono text-[11.5px] text-emerald-300 flex-1">{t.tool}</span>
                    </div>
                    {t.output && (
                      <pre className="px-3 py-2 text-[11px] font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed">
                        {t.output}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Diagnosis */}
        <Card title="Diagnosis"
              right={!isGenerating && parsed?.confidence && <ConfidenceTag value={parsed.confidence}/>}>
          {isGenerating ? <ShimmerLines lines={3}/> : (
            parsed?.diagnosis
              ? <p className="text-[13.5px] text-zinc-200 leading-relaxed">{parsed.diagnosis}</p>
              : <p className="text-[12.5px] text-zinc-500">No diagnosis available.</p>
          )}
        </Card>

        {/* Remediation */}
        <Card title="Suggested remediation">
          {isGenerating ? <ShimmerLines lines={4}/> : (
            parsed?.remediation?.length > 0 ? (
              <ol className="space-y-2.5">
                {parsed.remediation.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-5 h-5 grid place-items-center rounded-md bg-white/[0.04] ring-1 ring-white/[0.06] text-[11px] font-mono text-zinc-300">
                      {i + 1}
                    </span>
                    <span className="text-[13px] text-zinc-200 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[12.5px] text-zinc-500">No remediation steps available.</p>
            )
          )}
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <LinkedPostmortems incidentId={report.id} pastIncidents={parsed?.pastIncidents} postmortems={postmortems}/>
        <Card title="Quick actions">
          <div className="space-y-1">
            {['Open runbook', 'View deploys', 'Continue in chat'].map(label => (
              <button key={label} className="flex items-center gap-2 px-2 py-1.5 w-full rounded-md text-[12.5px] text-zinc-300 hover:bg-white/[0.04] hover:text-zinc-100">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
                {label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function LinkedPostmortems({ incidentId, pastIncidents, postmortems }) {
  const [pms, setPms] = useState(postmortems || []);
  useEffect(() => {
    if (postmortems?.length) return;
    fetchPostMortemsForIncident(incidentId).then(setPms).catch(() => {});
  }, [incidentId]);

  return (
    <Card title="Referenced postmortems">
      {(!pastIncidents || pastIncidents.length === 0) ? (
        <div className="text-[12px] text-zinc-500">No prior incidents referenced.</div>
      ) : (
        <div className="space-y-2">
          {pastIncidents.map((title, i) => {
            const pm = pms.find(p => p.title?.toLowerCase() === title?.toLowerCase() || p.postmortemId === title);
            return pm ? (
              <Link key={i} to={`/postmortems/${pm.id}`}
                className="block p-3 rounded-md bg-white/[0.02] ring-1 ring-white/[0.06] hover:bg-white/[0.05] transition-all group">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={pm.severity}/>
                  <span className="font-mono text-[10.5px] text-zinc-500">{pm.postmortemId}</span>
                  <span className="ml-auto text-[10.5px] text-zinc-500 font-mono">{pm.incidentDate}</span>
                </div>
                <div className="text-[12.5px] text-zinc-200 line-clamp-2 group-hover:text-zinc-50">{pm.title}</div>
              </Link>
            ) : (
              <div key={i} className="px-3 py-2 rounded-md bg-white/[0.02] ring-1 ring-white/[0.06]">
                <span className="text-[12px] text-zinc-400">{title}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

const TABS = [
  { id: 'report',   label: 'AI Report' },
  { id: 'related',  label: 'Related Postmortems' },
  { id: 'timeline', label: 'Timeline' },
];

export default function IncidentDetail({ report, onBack, provider }) {
  const [activeTab, setActiveTab] = useState('report');
  const [postmortems, setPostmortems] = useState([]);

  const isGenerating = report.status === 'IN_PROGRESS';
  const isFailed = report.status === 'FAILED';

  let parsed = null;
  if (!isGenerating && !isFailed && report.analysis) {
    try {
      let s = report.analysis.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      s = s.replace(/```(?:json)?\s*/g, '').trim();
      const start = s.indexOf('{');
      const end   = s.lastIndexOf('}');
      if (start >= 0 && end > start) parsed = JSON.parse(s.slice(start, end + 1));
    } catch { parsed = null; }
  }

  useEffect(() => {
    fetchPostMortemsForIncident(report.id).then(setPostmortems).catch(() => {});
  }, [report.id]);

  const timelineEvents = [
    { label: 'Triggered',      dot: 'bg-rose-400' },
    { label: 'AI Report',      dot: isGenerating ? 'bg-sky-400 animate-pulse' : 'bg-sky-400' },
    { label: 'Acknowledged',   dot: 'bg-zinc-500' },
    { label: 'Mitigation',     dot: report.status === 'resolved' ? 'bg-amber-400' : 'bg-zinc-700' },
    { label: 'Resolved',       dot: report.status === 'resolved' ? 'bg-emerald-400' : 'bg-zinc-700' },
  ];

  return (
    <div className="px-6 py-5 space-y-5 max-w-[1200px]">
      {/* Hero */}
      <div className="rounded-xl ring-1 ring-white/[0.06] bg-gradient-to-b from-[#0e0f13] to-[#0a0b0d] p-5">
        <div className="flex items-start gap-4">
          <div className="mt-0.5">
            <SeverityBadge severity={report.severity} size="lg"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-[11.5px] text-zinc-500">{report.id}</span>
              <span className="text-zinc-700">·</span>
              <span className="font-mono text-[12.5px] text-sky-300">{report.service}</span>
              <StatusPill status={report.status}/>
            </div>
            <h2 className="text-[18px] font-semibold text-zinc-100 leading-snug">{report.message}</h2>
            <div className="mt-2 flex items-center gap-4 text-[12px] text-zinc-400">
              <span>Triggered {fmtTime(report.timestamp)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="h-8 px-3 rounded-md bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/[0.06] text-[12px] text-zinc-200">
              ← Back
            </button>
            <button className="h-8 px-3 rounded-md bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/[0.06] text-[12px] text-zinc-200">
              Mitigate
            </button>
            <button className="h-8 px-3 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 ring-1 ring-emerald-500/30 text-[12px] text-emerald-200">
              Resolve
            </button>
          </div>
        </div>

        {/* Lifecycle timeline */}
        <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center gap-1">
          {timelineEvents.map((e, i) => (
            <span key={i} className="flex items-center gap-1 flex-1">
              <span className="flex flex-col items-center gap-1.5 shrink-0">
                <span className={`w-2 h-2 rounded-full ${e.dot}`}/>
                <span className="text-[10.5px] text-zinc-500 whitespace-nowrap">{e.label}</span>
              </span>
              {i < timelineEvents.length - 1 && <span className="flex-1 h-px bg-white/[0.06] mb-4"/>}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.06]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`h-9 px-3.5 text-[12.5px] -mb-px border-b-2 transition-colors ${
              activeTab === t.id
                ? 'border-sky-400 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}>
            {t.label}
            {t.id === 'related' && (parsed?.pastIncidents?.length > 0) && (
              <span className="ml-1.5 text-[10px] font-mono px-1 rounded bg-white/[0.04]">{parsed.pastIncidents.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'report' && (
        <ReportPane
          report={report}
          parsed={parsed}
          isGenerating={isGenerating}
          isFailed={isFailed}
          postmortems={postmortems}
          provider={provider}
        />
      )}

      {activeTab === 'related' && (
        <div className="space-y-3">
          {(parsed?.pastIncidents || []).length === 0 ? (
            <p className="text-zinc-500 text-sm">No related postmortems referenced.</p>
          ) : (
            (parsed?.pastIncidents || []).map((title, i) => {
              const pm = postmortems.find(p => p.title?.toLowerCase() === title?.toLowerCase());
              return pm ? (
                <Link key={i} to={`/postmortems/${pm.id}`}
                  className="block rounded-lg ring-1 ring-white/[0.06] bg-[#0c0d10] hover:ring-white/[0.12] hover:bg-[#0e0f13] p-4 transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <SeverityBadge severity={pm.severity}/>
                    <span className="font-mono text-[11px] text-zinc-500">{pm.postmortemId}</span>
                    <span className="ml-auto text-[11px] text-zinc-500 font-mono">{pm.incidentDate}</span>
                  </div>
                  <div className="text-[14px] font-medium text-zinc-100 mb-1">{pm.title}</div>
                  <p className="text-[12.5px] text-zinc-400 line-clamp-2">{pm.summary}</p>
                </Link>
              ) : (
                <div key={i} className="rounded-lg ring-1 ring-white/[0.06] bg-[#0c0d10] p-4">
                  <span className="text-[12.5px] text-zinc-400">{title}</span>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <Card title="Timeline">
          <ol className="relative space-y-5 pl-5 before:absolute before:left-1 before:top-1 before:bottom-1 before:w-px before:bg-white/[0.08]">
            {[
              { t: fmtTime(report.timestamp), label: `Incident declared — ${report.service}`, dot: 'bg-rose-400' },
              { t: fmtTime(report.timestamp), label: 'AI analysis queued', dot: 'bg-sky-400' },
              { t: fmtTime(report.timestamp), label: !isGenerating ? 'AI report generated' : 'AI report generating…', dot: isGenerating ? 'bg-sky-400 animate-pulse' : 'bg-sky-400' },
            ].map((e, i) => (
              <li key={i} className="relative">
                <span className={`absolute -left-[16px] top-1 w-2 h-2 rounded-full ${e.dot}`}/>
                <div className="font-mono text-[10.5px] text-zinc-500">{e.t}</div>
                <div className="text-[12.5px] text-zinc-200">{e.label}</div>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}
