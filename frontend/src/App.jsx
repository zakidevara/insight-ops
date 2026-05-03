import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PostMortemList from './pages/PostMortemList';
import PostMortemDetail from './pages/PostMortemDetail';
import ChatPanel from './components/ChatPanel';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/postmortems" element={<PostMortemList />} />
        <Route path="/postmortems/:id" element={<PostMortemDetail />} />
      </Routes>
      <ChatPanel />
    </BrowserRouter>
  );
}
