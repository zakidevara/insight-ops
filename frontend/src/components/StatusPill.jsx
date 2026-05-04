const STATUS_MAP = {
  IN_PROGRESS: { label: 'Analyzing',    cls: 'bg-sky-500/15 text-sky-300 ring-sky-500/40',       dot: 'bg-sky-400 animate-pulse' },
  READY:       { label: 'Investigating',cls: 'bg-rose-500/15 text-rose-300 ring-rose-500/40',    dot: 'bg-rose-400 animate-pulse' },
  FAILED:      { label: 'Failed',       cls: 'bg-zinc-500/15 text-zinc-400 ring-zinc-500/30',    dot: 'bg-zinc-500' },
  investigating:{ label: 'Investigating',cls: 'bg-rose-500/15 text-rose-300 ring-rose-500/40',   dot: 'bg-rose-400 animate-pulse' },
  mitigated:   { label: 'Mitigated',   cls: 'bg-amber-500/15 text-amber-200 ring-amber-500/40', dot: 'bg-amber-400' },
  resolved:    { label: 'Resolved',    cls: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30', dot: 'bg-emerald-400' },
  generating:  { label: 'Analyzing',   cls: 'bg-sky-500/15 text-sky-300 ring-sky-500/40',       dot: 'bg-sky-400 animate-pulse' },
};

export default function StatusPill({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.investigating;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] rounded-full ring-1 ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
