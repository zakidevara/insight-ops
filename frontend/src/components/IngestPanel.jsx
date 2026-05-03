import { useState } from 'react';
import { ingestFile } from '../api/client';

export default function IngestPanel() {
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatus(null);

    try {
      const type = file.name.endsWith('.pdf') ? 'pdf' : 'markdown';
      const result = await ingestFile(file, type);
      setStatus(`Ingested ${result.chunks} chunks from ${result.filename}`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-uploaded
      e.target.value = '';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Ingest Post-Mortem</h3>
      <input
        type="file"
        accept=".md,.txt,.pdf"
        onChange={handleUpload}
        disabled={uploading}
        className="text-sm text-gray-300"
      />
      {uploading && <p className="text-xs text-yellow-400 mt-1">Uploading…</p>}
      {status && (
        <p className={`text-xs mt-1 ${status.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {status}
        </p>
      )}
    </div>
  );
}
