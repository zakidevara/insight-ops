const PALETTE = [
  'bg-sky-500/30 text-sky-200',
  'bg-fuchsia-500/30 text-fuchsia-200',
  'bg-emerald-500/30 text-emerald-200',
  'bg-amber-500/30 text-amber-200',
  'bg-violet-500/30 text-violet-200',
];

export default function Avatar({ name = '', size = 22 }) {
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0;
  const color = PALETTE[Math.abs(h) % PALETTE.length];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium ${color}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initials || '·'}
    </span>
  );
}
