import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchReport } from '../api/client';
import { useReports } from '../hooks/useReports';
import IncidentDetail from '../components/IncidentDetail';
import TopBar from '../components/TopBar';
import { getLlmSettings } from '../api/settings';

export default function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports } = useReports();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState('OLLAMA');

  useEffect(() => {
    getLlmSettings().then(s => setProvider(s.provider)).catch(() => {});
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchReport(id)
      .then(data => { setReport(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  // Keep report live via WebSocket push
  useEffect(() => {
    const updated = reports.find(r => r.id === id);
    if (updated) setReport(updated);
  }, [reports, id]);

  const breadcrumbs = [
    { label: 'Incidents', onClick: () => navigate('/') },
    { label: report?.id || id },
  ];

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title={id} breadcrumbs={breadcrumbs}/>
        <div className="flex items-center justify-center flex-1">
          <p className="text-zinc-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <TopBar title="Not Found" breadcrumbs={breadcrumbs}/>
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <p className="text-zinc-400">Incident not found.</p>
          <button onClick={() => navigate('/')} className="text-sky-400 hover:underline text-sm">← Back to Incidents</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title={report.id}
        subtitle={report.service}
        breadcrumbs={breadcrumbs}
      />
      <div className="flex-1 overflow-y-auto">
        <IncidentDetail report={report} onBack={() => navigate('/')} provider={provider}/>
      </div>
    </div>
  );
}
