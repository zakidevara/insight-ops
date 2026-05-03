import SeverityBadge from './SeverityBadge';
import ThoughtProcess from './ThoughtProcess';

export default function IncidentDetail({ report, onBack }) {
  let parsed;
  try { parsed = JSON.parse(report.analysis); } catch { parsed = null; }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-blue-400 hover:underline text-sm">
        ← Back to feed
      </button>

      {/* Alert header */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <SeverityBadge severity={report.alertSeverity} />
          <span className="font-mono text-sm text-gray-300">{report.alertService}</span>
          <span className="text-xs text-gray-500 ml-auto">
            {new Date(report.timestamp).toLocaleString()}
          </span>
        </div>
        <p className="text-gray-200">{report.alertMessage}</p>
      </div>

      {/* Thought process */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <h3 className="text-md font-semibold text-white mb-3">Thought Process</h3>
        <ThoughtProcess analysis={report.analysis} />
      </div>

      {/* Diagnosis + Remediation */}
      {parsed && (
        <>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-md font-semibold text-white mb-2">Diagnosis</h3>
            <p className="text-gray-300 text-sm">{parsed.diagnosis}</p>
            <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${
              parsed.confidence === 'high'   ? 'bg-green-800 text-green-200' :
              parsed.confidence === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                                              'bg-red-800 text-red-200'
            }`}>
              Confidence: {parsed.confidence}
            </span>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-md font-semibold text-white mb-2">Recommended Remediation</h3>
            <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
              {parsed.remediation?.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
