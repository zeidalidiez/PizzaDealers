import { useState } from 'react';
import html2canvas from 'html2canvas';
import { addScore, addToHistory, getScores } from '../lib/storage.js';
import { createShareCode } from '../lib/share.js';
import { MAX_DAYS } from '../data/gameData.js';

export default function EndScreen({ state, onPlayAgain, onViewHistory }) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const seed = state.seed;
  const score = state.finalScore ?? 0;
  const allScores = getScores(seed);
  const rank = allScores.findIndex((s) => s.score <= score) + 1;
  const inTop10 = rank > 0 && rank <= 10;
  const alreadySubmitted = submitted || allScores.some((s) => s.source === 'local' && s.score === score);

  const handleSubmit = () => {
    const clean = name.trim().toUpperCase().slice(0, 3);
    if (clean.length !== 3) return;
    const entry = {
      name: clean,
      score,
      date: new Date().toISOString(),
      source: 'local',
    };
    addScore(seed, entry);
    addToHistory({ seed, score, name: clean, date: entry.date });
    setSubmitted(true);
  };

  const takeScreenshot = async () => {
    const el = document.getElementById('end-screen-overlay');
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 });
    const link = document.createElement('a');
    link.download = 'pizza-dealers-score.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareCode = createShareCode(seed, score, name || '---');

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div
        id="end-screen-overlay"
        className="rounded-2xl border-2 border-dealer-orange bg-gradient-to-br from-dealer-black via-dealer-dark to-dealer-red p-8 text-center shadow-2xl"
      >
        <h1 className="mb-2 text-4xl font-extrabold text-dealer-orange">Pizza Dealers</h1>
        <p className="mb-6 text-gray-300">Run Complete — Day {MAX_DAYS}</p>

        <div className="mb-6">
          <div className="text-sm text-gray-400">Final Score</div>
          <div className="text-6xl font-black text-white">${score.toLocaleString()}</div>
          {state.loan.active && !state.loan.repaid && (
            <div className="mt-2 text-sm text-dealer-red">Loan penalty applied</div>
          )}
        </div>

        <div className="mb-6 text-lg text-gray-200">
          {inTop10 ? (
            <span className="text-green-400">Rank #{rank} on the leaderboard!</span>
          ) : (
            <span>Not in top 10</span>
          )}
        </div>

        {inTop10 && !alreadySubmitted && (
          <div className="mb-6 flex items-center justify-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))}
              placeholder="AAA"
              maxLength={3}
              className="w-24 rounded border border-gray-500 bg-gray-900 px-3 py-2 text-center text-2xl font-bold uppercase text-white"
            />
            <button
              onClick={handleSubmit}
              disabled={name.length !== 3}
              className="rounded bg-dealer-orange px-4 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        )}

        {alreadySubmitted && (
          <div className="mb-4 text-sm text-green-400">Score saved to leaderboard!</div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={takeScreenshot}
            className="rounded border border-dealer-orange px-4 py-2 font-semibold text-dealer-orange hover:bg-dealer-orange/10"
          >
            Take Screenshot
          </button>
          <button
            onClick={onPlayAgain}
            className="rounded bg-dealer-orange px-4 py-2 font-semibold text-white hover:bg-orange-600"
          >
            Play Again
          </button>
          <button
            onClick={onViewHistory}
            className="rounded border border-gray-500 px-4 py-2 font-semibold text-gray-200 hover:bg-gray-800"
          >
            History
          </button>
          <button
            onClick={() => setShowShare((s) => !s)}
            className="rounded border border-gray-500 px-4 py-2 font-semibold text-gray-200 hover:bg-gray-800"
          >
            {showShare ? 'Hide Share' : 'Share'}
          </button>
        </div>

        {showShare && (
          <div className="mt-4">
            <div className="text-xs text-gray-400">Share your score</div>
            <div className="mt-1 select-all rounded bg-gray-900 px-3 py-2 font-mono text-sm text-white">
              {shareCode}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
