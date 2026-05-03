import SeverityBadge from './SeverityBadge';

export default function IncidentFeed({ reports, onSelect }) {
  if (reports.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No incidents yet. Send an incident to <code className="text-gray-400">/api/webhook</code>.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {reports.map(report => {
        const inProgress = report.status === 'IN_PROGRESS';
        return (
          <button
            key={report.id}
            onClick={() => onSelect(report)}
            className="w-full text-left bg-gray-900 hover:bg-gray-800 rounded-lg p-3
                       border border-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <SeverityBadge severity={report.severity} />
              <span className="font-mono text-sm text-gray-300">{report.service}</span>
              {inProgress && (
                <span className="flex items-center gap-1.5 text-xs text-yellow-400">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  Analyzing…
                </span>
              )}
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(report.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1 truncate">
              {inProgress ? 'LLM analysis in progress…' : report.message}
            </p>
          </button>
        );
      })}
    </div>
  );
}
