import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import IncidentFeed from './IncidentFeed';
import IncidentDetail from './IncidentDetail';
import DeclareIncidentModal from './DeclareIncidentModal';
import { getLlmSettings, setLlmProvider } from '../api/settings';

export default function Dashboard() {
  const { reports, loading, error } = useReports();
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [provider, setProvider] = useState('OLLAMA');

  useEffect(() => {
    getLlmSettings().then(s => setProvider(s.provider)).catch(() => {});
  }, []);

  const handleProviderChange = (e) => {
    const next = e.target.value;
    setLlmProvider(next)
      .then(() => setProvider(next))
      .catch(() => alert('Failed to switch provider. Check that the API key is configured.'));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">InsightOps</h1>
          <p className="text-sm text-gray-400">Intelligent SRE Assistant</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={provider}
            onChange={handleProviderChange}
            className="bg-gray-800 border border-gray-600 text-sm text-white
                       rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500"
            title="LLM Provider"
          >
            <option value="OLLAMA">Ollama</option>
            <option value="GEMINI">Gemini</option>
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-500
                       text-white rounded-lg transition-colors"
          >
            + Declare Incident
          </button>
          <Link to="/postmortems" className="text-sm text-blue-400 hover:underline">
            Post Mortems →
          </Link>
        </div>
      </header>

      {showForm && <DeclareIncidentModal onClose={() => setShowForm(false)} />}

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold">Incident Reports</h2>
        </div>
        {loading && <p className="text-gray-500 text-sm">Loading reports…</p>}
        {error   && <p className="text-red-400 text-sm">Error: {error}</p>}

        {selected ? (
          <IncidentDetail report={selected} onBack={() => setSelected(null)} />
        ) : (
          <IncidentFeed reports={reports} onSelect={setSelected} />
        )}
      </div>
    </div>
  );
}
