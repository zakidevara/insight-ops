import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { submitAlert } from '../api/client';

const SEVERITIES = ['P1', 'P2', 'P3', 'P4'];

const SEVERITY_COLORS = {
  P1: 'text-red-400',
  P2: 'text-orange-400',
  P3: 'text-yellow-400',
  P4: 'text-gray-400',
};

export default function DeclareIncidentModal({ onClose }) {
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('P2');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitAlert({
        service,
        message,
        severity,
        timestamp: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to declare incident. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-400" />
            <h2 className="text-base font-semibold text-white">Declare Incident</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Service</label>
            <input
              type="text"
              required
              value={service}
              onChange={e => setService(e.target.value)}
              placeholder="e.g. auth-service"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2
                         text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Message</label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="e.g. Increasing 503 errors on login endpoint"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2
                         text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Severity</label>
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2
                         text-sm focus:border-blue-500 focus:outline-none"
            >
              {SEVERITIES.map(s => (
                <option key={s} value={s} className={SEVERITY_COLORS[s]}>{s}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500
                         disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {submitting ? 'Declaring…' : 'Declare Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
