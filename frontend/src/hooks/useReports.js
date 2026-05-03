import { useState, useEffect, useCallback } from 'react';
import { fetchReports } from '../api/client';
import { useWebSocket } from './useWebSocket';

export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastMessage = useWebSocket();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchReports();
      setReports(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Prepend new reports arriving via WebSocket
  useEffect(() => {
    if (lastMessage) {
      setReports(prev => [lastMessage, ...prev.filter(r => r.id !== lastMessage.id)]);
    }
  }, [lastMessage]);

  return { reports, loading, error, refresh: load };
}
