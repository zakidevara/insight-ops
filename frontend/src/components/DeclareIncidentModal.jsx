import { useState, useEffect, useRef } from 'react';
import { submitIncident } from '../api/client';

const SERVICES = ['auth-service', 'checkout-api', 'payments-worker', 'recommendations', 'feature-flags', 'order-service', 'inventory-svc'];

const SEVERITIES = [
  { v: 'P1', desc: 'Customer-facing outage', cls: 'rose' },
  { v: 'P2', desc: 'SLO at risk',            cls: 'amber' },
  { v: 'P3', desc: 'Degraded',               cls: 'yellow' },
  { v: 'P4', desc: 'Tracking',               cls: 'zinc' },
];

const SEL_CLS = { rose: 'bg-rose-500/15 ring-rose-500/40 text-rose-200', amber: 'bg-amber-500/15 ring-amber-500/40 text-amber-200', yellow: 'bg-yellow-500/15 ring-yellow-500/40 text-yellow-200', zinc: 'bg-zinc-500/15 ring-zinc-500/30 text-zinc-200' };

export default function DeclareIncidentModal({ onClose }) {
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('P2');
  const [phase, setPhase] = useState('form'); // form | submitting | success
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!service || !message) return;
    setPhase('submitting');
    setError(null);
    try {
      await submitIncident({ service, message, severity, timestamp: new Date().toISOString() });
      setPhase('success');
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to declare incident. Try again.');
      setPhase('form');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[520px] rounded-xl bg-[#0e0f13] ring-1 ring-white/[0.08]
                      shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] animate-pop">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-rose-500/15 ring-1 ring-rose-500/30 grid place-items-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-300">
                <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>
              </svg>
            </div>
            <h2 className="text-[14px] font-medium text-zinc-100">Declare incident</h2>
            <span className="text-[10px] font-mono text-zinc-500 ml-1.5">a new INC will be assigned</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>

        {phase === 'success' ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 grid place-items-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <div className="text-[14px] text-zinc-100 font-medium">Incident declared</div>
            <div className="text-[12px] text-zinc-400 mt-1">Generating AI report…</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Service */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Service</label>
              <input
                ref={inputRef}
                list="svc-list"
                required
                value={service}
                onChange={e => setService(e.target.value)}
                placeholder="e.g. auth-service"
                className="w-full bg-white/[0.03] ring-1 ring-white/[0.06] focus:ring-sky-400/50 outline-none
                           rounded-md px-3 h-9 text-[13px] text-zinc-100 placeholder-zinc-600 font-mono"
              />
              <datalist id="svc-list">{SERVICES.map(s => <option key={s} value={s}/>)}</datalist>
            </div>

            {/* Message */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">What's happening?</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe the symptom — error rate, latency, customer reports…"
                className="w-full bg-white/[0.03] ring-1 ring-white/[0.06] focus:ring-sky-400/50 outline-none
                           rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 resize-none leading-relaxed"
              />
            </div>

            {/* Severity grid */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {SEVERITIES.map(opt => {
                  const sel = severity === opt.v;
                  return (
                    <button key={opt.v} type="button" onClick={() => setSeverity(opt.v)}
                      className={`p-2.5 rounded-md ring-1 text-left transition-all ${
                        sel ? SEL_CLS[opt.cls] : 'bg-white/[0.02] ring-white/[0.06] hover:ring-white/[0.12]'
                      }`}>
                      <div className={`font-mono text-[12.5px] font-semibold ${sel ? '' : 'text-zinc-300'}`}>{opt.v}</div>
                      <div className="text-[10.5px] text-zinc-500 mt-0.5 leading-tight">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI context note */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-sky-500/[0.06] ring-1 ring-sky-500/20">
              <span className="text-sky-300 shrink-0 text-sm">✦</span>
              <p className="text-[11.5px] text-sky-200/90 leading-snug">
                On submit, InsightOps will pull metrics, logs, and recent deploys, then draft a diagnosis and remediation plan referencing prior postmortems.
              </p>
            </div>

            {error && <p className="text-rose-400 text-xs">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="h-8 px-3 rounded-md text-[12px] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]">
                Cancel
              </button>
              <button type="submit"
                disabled={phase === 'submitting' || !service || !message}
                className="h-8 px-3.5 rounded-md bg-rose-500 hover:bg-rose-400 disabled:opacity-40 disabled:cursor-not-allowed
                           text-white text-[12px] font-medium flex items-center gap-1.5">
                {phase === 'submitting'
                  ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="animate-spin"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.4"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg> Declaring…</>
                  : `Declare ${severity}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
