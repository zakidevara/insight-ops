import { useState, useEffect } from 'react';
import { useReports } from '../hooks/useReports';
import IncidentFeed from './IncidentFeed';
import DeclareIncidentModal from './DeclareIncidentModal';
import TopBar from './TopBar';
import { getLlmSettings, setLlmProvider } from '../api/settings';

function ModelDropdown({ provider, onChange }) {
  const [open, setOpen] = useState(false);

  const PROVIDERS = [
    { id: 'OLLAMA', name: 'Ollama', sub: 'deepseek-r1:8b · local', dotCls: 'bg-emerald-400' },
    { id: 'GEMINI', name: 'Gemini', sub: 'gemini-2.0-flash · Google', dotCls: 'bg-sky-400' },
  ];

  const current = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 h-7 px-2 rounded-md bg-white/[0.03] hover:bg-white/[0.06]
                   ring-1 ring-white/[0.08] text-zinc-200 text-[11px] font-mono transition-colors"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dotCls}`}/>
        {current.name}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500">
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-[240px] p-1 rounded-lg bg-[#0e0f13] ring-1 ring-white/[0.1]
                        shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] animate-pop">
          <div className="px-2 pt-1.5 pb-1 text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
            Model provider
          </div>
          {PROVIDERS.map(p => {
            const sel = p.id === current.id;
            return (
              <button key={p.id}
                onClick={() => { onChange(p.id); setOpen(false); }}
                className={`w-full text-left p-2 rounded-md flex items-center gap-2.5 transition-colors ${sel ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${p.dotCls}`}/>
                <span>
                  <span className="text-[12.5px] font-medium text-zinc-100">{p.name}</span>
                  {sel && <span className="ml-1.5 text-[9px] font-mono uppercase px-1 py-px rounded bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">active</span>}
                  <span className="block text-[10.5px] font-mono text-zinc-500">{p.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ showDeclare, setShowDeclare }) {
  const { reports, loading, error } = useReports();
  const [provider, setProvider] = useState('OLLAMA');

  useEffect(() => {
    getLlmSettings().then(s => setProvider(s.provider)).catch(() => {});
  }, []);

  const handleProviderChange = (next) => {
    setLlmProvider(next).then(() => setProvider(next)).catch(() => {});
  };

  const topActions = (
    <div className="flex items-center gap-2">
      <ModelDropdown provider={provider} onChange={handleProviderChange}/>
      <button
        onClick={() => setShowDeclare(true)}
        className="h-8 px-3 rounded-md bg-rose-500/15 hover:bg-rose-500/25 ring-1 ring-rose-500/30
                   text-[12px] text-rose-200 flex items-center gap-1.5"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>
        </svg>
        Declare
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Incidents"
        subtitle="Live signals · AI-generated reports"
        actions={topActions}
      />

      <div className="flex-1 overflow-y-auto">
        {loading && !reports.length && (
          <div className="flex items-center justify-center h-48">
            <p className="text-zinc-500 text-sm">Loading reports…</p>
          </div>
        )}
        {error && (
          <div className="px-6 py-4">
            <p className="text-rose-400 text-sm">Error: {error}</p>
          </div>
        )}
        <IncidentFeed reports={reports}/>
      </div>

      {showDeclare && <DeclareIncidentModal onClose={() => setShowDeclare(false)}/>}
    </div>
  );
}
