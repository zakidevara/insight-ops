const MAP = {
  P1: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/40',
  P2: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40',
  P3: 'bg-yellow-400/10 text-yellow-200 ring-1 ring-yellow-400/30',
  P4: 'bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/30',
};

export default function SeverityBadge({ severity, size = 'sm' }) {
  const sz = size === 'lg' ? 'px-2 py-0.5 text-xs' : 'px-1.5 py-0.5 text-[10px]';
  return (
    <span className={`inline-flex items-center font-mono font-semibold tracking-wider rounded ${sz} ${MAP[severity] || MAP.P4}`}>
      {severity}
    </span>
  );
}
