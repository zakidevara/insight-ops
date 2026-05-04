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
        const failed = report.status === 'FAILED';
        return (
          <button
            key={report.id}
            onClick={() => onSelect(report)}
            className={`w-full text-left rounded-lg p-3 border transition-colors
                        ${failed
                          ? 'bg-red-950 hover:bg-red-900 border-red-800'
                          : 'bg-gray-900 hover:bg-gray-800 border-gray-700'}`}
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
              {failed && (
                <span className="text-xs text-red-400 font-medium">Analysis failed</span>
              )}
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(report.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-sm mt-1 truncate">
              {inProgress
                ? <span className="text-gray-400">LLM analysis in progress…</span>
                : failed
                  ? <span className="text-red-400">Analysis could not be completed</span>
                  : <span className="text-gray-400">{report.message}</span>}
            </p>
          </button>
        );
      })}
    </div>
  );
}
