import SeverityBadge from './SeverityBadge';

export default function PostMortemCard({ postMortem: pm }) {
  return (
    <div className="bg-gray-900 hover:bg-gray-800 rounded-lg p-4 border border-gray-700 transition-colors">
      <div className="flex items-center gap-3 mb-1">
        {pm.severity && <SeverityBadge severity={pm.severity} />}
        <span className="font-semibold text-white text-sm">{pm.title}</span>
        <span className="text-xs text-gray-500 ml-auto">{pm.incidentDate}</span>
      </div>
      <div className="flex items-center gap-3">
        {pm.service && (
          <span className="font-mono text-xs text-gray-400">{pm.service}</span>
        )}
        <span className="text-xs text-gray-600">{pm.postmortemId}</span>
      </div>
      {pm.summary && (
        <p className="text-gray-400 text-sm mt-2 line-clamp-2">{pm.summary}</p>
      )}
    </div>
  );
}
