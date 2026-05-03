export default function ThoughtProcess({ analysis }) {
  let parsed;
  try {
    parsed = JSON.parse(analysis);
  } catch {
    // Fallback if the AI didn't return valid JSON
    return <pre className="text-sm whitespace-pre-wrap text-gray-300">{analysis}</pre>;
  }

  return (
    <div className="space-y-4">
      {parsed.toolsUsed?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Tools Invoked</h4>
          <ul className="space-y-1">
            {parsed.toolsUsed.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="font-mono bg-gray-800 px-1.5 py-0.5 rounded text-green-400">
                  {t.tool}
                </span>
                <span className="text-gray-300">{t.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {parsed.pastIncidents?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Related Past Incidents</h4>
          <ul className="list-disc list-inside text-sm text-gray-300">
            {parsed.pastIncidents.map((inc, i) => <li key={i}>{inc}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
