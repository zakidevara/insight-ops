export default function SeverityBadge({ severity }) {
  const colors = {
    P1: 'bg-red-600 text-white',
    P2: 'bg-orange-500 text-white',
    P3: 'bg-yellow-400 text-black',
    P4: 'bg-gray-400 text-white',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors[severity] || colors.P4}`}>
      {severity}
    </span>
  );
}
