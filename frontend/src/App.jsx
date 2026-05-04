import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import IncidentDetailPage from './pages/IncidentDetailPage';
import PostMortemList from './pages/PostMortemList';
import PostMortemDetail from './pages/PostMortemDetail';
import ChatPanel from './components/ChatPanel';
import Sidebar from './components/Sidebar';
import { fetchPostMortems } from './api/client';

function AppShell() {
  const [showDeclare, setShowDeclare] = useState(false);
  const [postmortemCount, setPostmortemCount] = useState(0);
  useEffect(() => {
    fetchPostMortems().then(data => setPostmortemCount(data.length)).catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowDeclare(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: '#08090b' }}>
      <Sidebar
        incidentCount={null}
        postmortemCount={postmortemCount}
        onDeclare={() => setShowDeclare(true)}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Routes>
          <Route path="/" element={<Dashboard showDeclare={showDeclare} setShowDeclare={setShowDeclare}/>} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
          <Route path="/postmortems" element={<PostMortemList />} />
          <Route path="/postmortems/:id" element={<PostMortemDetail />} />
        </Routes>
      </main>
      <ChatPanel />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
