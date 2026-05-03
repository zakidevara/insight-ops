import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SeverityBadge from './SeverityBadge';
import ThoughtProcess from './ThoughtProcess';
import { fetchPostMortemsForIncident } from '../api/client';

function PostMortemLink({ incidentId, title }) {
  const [postMortems, setPostMortems] = useState(null);

  useEffect(() => {
    fetchPostMortemsForIncident(incidentId).then(setPostMortems).catch(() => setPostMortems([]));
  }, [incidentId]);

  const match = postMortems?.find(
    pm => pm.title?.toLowerCase() === title?.toLowerCase()
  );

  if (!postMortems) {
    return <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">{title}</span>;
  }

  if (match) {
    return (
      <Link
        to={`/postmortems/${match.id}`}
        className="text-xs bg-blue-900 hover:bg-blue-800 text-blue-200 px-2 py-1 rounded transition-colors"
      >
        📄 {title}
      </Link>
    );
  }

  return <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">{title}</span>;
}

export default function IncidentDetail({ report, onBack }) {
  const inProgress = report.status === 'IN_PROGRESS';

  let parsed;
  try { parsed = inProgress ? null : JSON.parse(report.analysis); } catch { parsed = null; }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-blue-400 hover:underline text-sm">
        ← Back to feed
      </button>

      {/* Incident header */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <SeverityBadge severity={report.severity} />
          <span className="font-mono text-sm text-gray-300">{report.service}</span>
          {inProgress && (
            <span className="flex items-center gap-1.5 text-xs text-yellow-400 ml-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Analyzing
            </span>
          )}
          <span className="text-xs text-gray-500 ml-auto">
            {new Date(report.timestamp).toLocaleString()}
          </span>
        </div>
        <p className="text-gray-200">{report.message}</p>
      </div>

      {/* Analysis loading state */}
      {inProgress && (
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">LLM analysis in progress…</p>
          <p className="text-gray-600 text-xs">This may take a minute. The page will update automatically.</p>
        </div>
      )}

      {/* Thought process */}
      {!inProgress && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h3 className="text-md font-semibold text-white mb-3">Thought Process</h3>
          <ThoughtProcess analysis={report.analysis} />
        </div>
      )}

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

          {parsed.pastIncidents?.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h3 className="text-md font-semibold text-white mb-3">Referenced Post Mortems</h3>
              <div className="flex flex-wrap gap-2">
                {parsed.pastIncidents.map((title, i) => (
                  <PostMortemLink key={i} incidentId={report.id} title={title} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
