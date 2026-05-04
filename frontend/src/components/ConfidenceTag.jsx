const MAP = {
  high:   'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-200 ring-amber-500/30',
  low:    'bg-rose-500/10 text-rose-300 ring-rose-500/30',
};

export default function ConfidenceTag({ value }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded ring-1 ${MAP[value] || MAP.medium}`}>
      ✦ {value} confidence
    </span>
  );
}
