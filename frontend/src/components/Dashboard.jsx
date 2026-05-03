import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import AlertFeed from './AlertFeed';
import IncidentDetail from './IncidentDetail';

export default function Dashboard() {
  const { reports, loading, error } = useReports();
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">InsightOps</h1>
          <p className="text-sm text-gray-400">Intelligent SRE Assistant</p>
        </div>
        <Link to="/postmortems" className="text-sm text-blue-400 hover:underline">
          Post Mortems →
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold">Incident Reports</h2>
        </div>
        {loading && <p className="text-gray-500 text-sm">Loading reports…</p>}
        {error   && <p className="text-red-400 text-sm">Error: {error}</p>}

        {selected ? (
          <IncidentDetail report={selected} onBack={() => setSelected(null)} />
        ) : (
          <AlertFeed reports={reports} onSelect={setSelected} />
        )}
      </div>
    </div>
  );
}
