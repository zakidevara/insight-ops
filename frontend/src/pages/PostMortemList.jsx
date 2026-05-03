import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPostMortems } from '../api/client';
import PostMortemCard from '../components/PostMortemCard';

export default function PostMortemList() {
  const [postMortems, setPostMortems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPostMortems()
      .then(data => { setPostMortems(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-blue-400 hover:underline text-sm">← Back to Dashboard</Link>
        <div>
          <h1 className="text-xl font-bold">Post Mortems</h1>
          <p className="text-sm text-gray-400">Historical incident analysis</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {loading && <p className="text-gray-500 text-sm">Loading post mortems…</p>}
        {error   && <p className="text-red-400 text-sm">Error: {error}</p>}

        {!loading && !error && postMortems.length === 0 && (
          <p className="text-gray-500 text-sm">No post mortems found.</p>
        )}

        <div className="space-y-3">
          {postMortems.map(pm => (
            <Link key={pm.id} to={`/postmortems/${pm.id}`} className="block">
              <PostMortemCard postMortem={pm} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
