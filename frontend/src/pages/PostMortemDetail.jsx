import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPostMortem } from '../api/client';
import SeverityBadge from '../components/SeverityBadge';

function Section({ title, content }) {
  if (!content) return null;
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
      <h3 className="text-md font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm whitespace-pre-wrap">{content}</p>
    </div>
  );
}

export default function PostMortemDetail() {
  const { id } = useParams();
  const [pm, setPm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchPostMortem(id)
      .then(data => { setPm(data); setLoading(false); })
      .catch(err => {
        setLoading(false);
        if (err.response?.status === 404) setNotFound(true);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (notFound || !pm) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-lg">Post mortem not found.</p>
        <Link to="/postmortems" className="text-blue-400 hover:underline text-sm">← Back to Post Mortems</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/postmortems" className="text-blue-400 hover:underline text-sm">← Back to Post Mortems</Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{pm.title}</h1>
            {pm.severity && <SeverityBadge severity={pm.severity} />}
          </div>
          <p className="text-sm text-gray-400">
            {pm.service && <span className="font-mono mr-3">{pm.service}</span>}
            {pm.incidentDate && <span>{pm.incidentDate}</span>}
            <span className="ml-3 text-gray-600 text-xs">{pm.postmortemId}</span>
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        <Section title="Summary"    content={pm.summary} />
        <Section title="Root Cause" content={pm.rootCause} />
        <Section title="Detection"  content={pm.detection} />
        <Section title="Resolution" content={pm.resolution} />
        <Section title="Indicators" content={pm.indicators} />
      </div>
    </div>
  );
}
