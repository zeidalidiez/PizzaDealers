import { useState } from 'react';
import { getScores, addImportedScore } from '../lib/storage.js';
import { parseShareCode } from '../lib/share.js';

export default function Leaderboard({ seed, onBack }) {
  const [importStr, setImportStr] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const scores = getScores(seed);

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

  const dateStr = new Date(seed).toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="rounded-xl border border-dealer-black bg-dealer-dark p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-dealer-orange">Leaderboard</h2>
            <p className="text-xs text-gray-400">
              Seed {seed} ({dateStr})
            </p>
          </div>
          <button
            onClick={onBack}
            className="rounded border border-gray-600 px-3 py-1 text-sm text-gray-200 hover:bg-gray-800"
          >
            Back
          </button>
        </div>

        {scores.length === 0 ? (
          <p className="text-sm text-gray-400">No scores yet.</p>
        ) : (
          <ol className="space-y-2">
            {scores.slice(0, 10).map((s, i) => (
              <li
                key={i}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                  s.source === 'imported'
                    ? 'border-dashed border-gray-600 bg-gray-800/40 italic text-gray-300'
                    : 'border-gray-700 bg-gray-800/80 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-dealer-orange">{i + 1}</span>
                  <span className="font-mono font-bold">{s.name}</span>
                  {s.source === 'imported' && (
                    <span className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-300">
                      IMPORTED
                    </span>
                  )}
                </div>
                <span className="font-bold">${s.score.toLocaleString()}</span>
              </li>
            ))}
          </ol>
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
