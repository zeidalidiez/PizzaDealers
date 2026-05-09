import { getHistory } from '../lib/storage.js';
import { parseShareCode } from '../lib/share.js';
import { addImportedScore } from '../lib/storage.js';
import { useState } from 'react';

export default function HistoryPage({ onBack, onViewLeaderboard }) {
  const history = getHistory();
  const [importStr, setImportStr] = useState('');
  const [importMsg, setImportMsg] = useState('');

  const handleImport = () => {
    const parsed = parseShareCode(importStr);
    if (!parsed) {
      setImportMsg('Invalid share code.');
      return;
    }
    addImportedScore(parsed.seed, {
      name: parsed.name,
      score: parsed.score,
      date: new Date().toISOString(),
      source: 'imported',
    });
    setImportMsg('Score imported!');
    setImportStr('');
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="rounded-xl border border-dealer-black bg-dealer-dark p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-dealer-orange">Run History</h2>
          <button
            onClick={onBack}
            className="rounded border border-gray-600 px-3 py-1 text-sm text-gray-200 hover:bg-gray-800"
          >
            Back
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-gray-400">No past runs yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((run, i) => (
              <button
                key={i}
                onClick={() => onViewLeaderboard(run.seed)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-left hover:border-dealer-orange"
              >
                <div>
                  <div className="font-semibold text-white">${run.score.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(run.date).toLocaleDateString()} — Seed {run.seed}
                  </div>
                </div>
                <span className="text-sm text-dealer-orange">Leaderboard →</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 border-t border-gray-700 pt-4">
          <label className="mb-1 block text-sm text-gray-400">Import score code</label>
          <div className="flex gap-2">
            <input
              value={importStr}
              onChange={(e) => setImportStr(e.target.value)}
              placeholder="PD-..."
              className="flex-1 rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white"
            />
            <button
              onClick={handleImport}
              className="rounded bg-dealer-orange px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Import
            </button>
          </div>
          {importMsg && <p className="mt-1 text-xs text-gray-300">{importMsg}</p>}
        </div>
      </div>
    </div>
  );
}
