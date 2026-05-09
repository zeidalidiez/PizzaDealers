import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState.js';
import { loadActiveRun, clearActiveRun } from './lib/storage.js';
import Map from './components/Map.jsx';
import PriceTable from './components/PriceTable.jsx';
import InventoryPanel from './components/InventoryPanel.jsx';
import EventBanner from './components/EventBanner.jsx';
import DayPanel from './components/DayPanel.jsx';
import EndScreen from './components/EndScreen.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import HistoryPage from './components/HistoryPage.jsx';
import ResumeModal from './components/ResumeModal.jsx';
import { MAX_DAYS, MAX_WEIGHT, getTotalWeight } from './data/gameData.js';

function App() {
  const game = useGameState();
  const { state, reset, resume, travel, skipDay, buy, sell, sellAll, takeLoan, repayLoan, clearRun } = game;

  const [view, setView] = useState('game'); // 'game' | 'leaderboard' | 'history'
  const [leaderboardSeed, setLeaderboardSeed] = useState(null);
  const [resumeState, setResumeState] = useState(null);

  useEffect(() => {
    const saved = loadActiveRun();
    if (saved && saved.day <= MAX_DAYS && !saved.gameOver) {
      setResumeState(saved);
    }
  }, []);

  const handleResume = () => {
    if (resumeState) {
      resume(resumeState);
    }
    setResumeState(null);
  };

  const handleAbandon = () => {
    clearActiveRun();
    clearRun();
    setResumeState(null);
  };

  const isActionDisabled = state.gameOver || state.day > MAX_DAYS;

  if (view === 'leaderboard' && leaderboardSeed != null) {
    return (
      <div className="min-h-screen bg-dealer-black text-white">
        <header className="border-b border-dealer-black bg-dealer-dark p-4 text-center">
          <h1 className="text-2xl font-extrabold text-dealer-orange">Pizza Dealers</h1>
        </header>
        <Leaderboard
          seed={leaderboardSeed}
          onBack={() => {
            setView('game');
            setLeaderboardSeed(null);
          }}
        />
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="min-h-screen bg-dealer-black text-white">
        <header className="border-b border-dealer-black bg-dealer-dark p-4 text-center">
          <h1 className="text-2xl font-extrabold text-dealer-orange">Pizza Dealers</h1>
        </header>
        <HistoryPage
          onBack={() => setView('game')}
          onViewLeaderboard={(seed) => {
            setLeaderboardSeed(seed);
            setView('leaderboard');
          }}
        />
      </div>
    );
  }

  if (state.gameOver) {
    return (
      <div className="min-h-screen bg-dealer-black text-white">
        <header className="border-b border-dealer-black bg-dealer-dark p-4 text-center">
          <h1 className="text-2xl font-extrabold text-dealer-orange">Pizza Dealers</h1>
        </header>
        <EndScreen
          state={state}
          onPlayAgain={() => {
            reset();
            setView('game');
          }}
          onViewHistory={() => setView('history')}
        />
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setLeaderboardSeed(state.seed);
              setView('leaderboard');
            }}
            className="rounded border border-dealer-orange px-4 py-2 text-sm font-semibold text-dealer-orange hover:bg-dealer-orange/10"
          >
            View Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dealer-black text-white">
      {resumeState && (
        <ResumeModal savedState={resumeState} onResume={handleResume} onAbandon={handleAbandon} />
      )}

      <header className="border-b border-dealer-black bg-dealer-dark p-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-2xl font-extrabold text-dealer-orange">Pizza Dealers</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setLeaderboardSeed(state.seed);
                setView('leaderboard');
              }}
              className="rounded border border-gray-600 px-3 py-1 text-sm text-gray-200 hover:bg-gray-800"
            >
              Leaderboard
            </button>
            <button
              onClick={() => setView('history')}
              className="rounded border border-gray-600 px-3 py-1 text-sm text-gray-200 hover:bg-gray-800"
            >
              History
            </button>
            <button
              onClick={() => {
                if (confirm('Abandon current run and start a new one?')) {
                  clearActiveRun();
                  reset();
                }
              }}
              className="rounded border border-dealer-red px-3 py-1 text-sm text-dealer-red hover:bg-dealer-red/10"
            >
              New Run
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <div className="mb-4">
          <DayPanel
            day={state.day}
            cash={state.cash}
            totalWeight={getTotalWeight(state.inventory)}
            maxWeight={MAX_WEIGHT}
            loan={state.loan}
            onSkip={skipDay}
            onTakeLoan={takeLoan}
            onRepayLoan={repayLoan}
            disabled={isActionDisabled}
          />
        </div>

        <div className="mb-4">
          <EventBanner events={state.events} day={state.day} locationId={state.currentLocationId} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Map
              currentLocationId={state.currentLocationId}
              onTravel={travel}
              disabled={isActionDisabled}
            />
            <PriceTable
              day={state.day}
              prices={state.prices}
              locationId={state.currentLocationId}
              inventory={state.inventory}
              cash={state.cash}
              onBuy={buy}
              onSell={sell}
              disabled={isActionDisabled}
            />
          </div>
          <div>
            <InventoryPanel
              inventory={state.inventory}
              onSellAll={sellAll}
              disabled={isActionDisabled}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
