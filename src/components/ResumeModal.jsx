import { getLocationById } from '../data/gameData.js';

export default function ResumeModal({ savedState, onResume, onAbandon }) {
  const loc = getLocationById(savedState.currentLocationId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-dealer-orange bg-dealer-dark p-6 text-center shadow-2xl">
        <h2 className="mb-2 text-2xl font-bold text-dealer-orange">Welcome Back</h2>
        <p className="mb-4 text-gray-300">
          You have an active run on <strong>Day {savedState.day}</strong> at{' '}
          <strong>{loc?.name || 'Unknown'}</strong>.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onResume}
            className="rounded bg-dealer-orange px-4 py-2 font-semibold text-white hover:bg-orange-600"
          >
            Resume Run
          </button>
          <button
            onClick={onAbandon}
            className="rounded border border-dealer-red px-4 py-2 font-semibold text-dealer-red hover:bg-dealer-red/10"
          >
            Abandon Run
          </button>
        </div>
      </div>
    </div>
  );
}
