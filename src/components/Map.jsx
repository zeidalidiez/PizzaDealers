import { LOCATIONS } from '../data/gameData.js';

export default function Map({ currentLocationId, onTravel, disabled }) {
  return (
    <div className="rounded-xl border border-dealer-black bg-dealer-dark p-4">
      <h3 className="mb-3 text-lg font-semibold text-dealer-orange">Map</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {LOCATIONS.map((loc) => {
          const isCurrent = loc.id === currentLocationId;
          return (
            <button
              key={loc.id}
              disabled={disabled || isCurrent}
              onClick={() => onTravel(loc.id)}
              className={[
                'rounded-lg border px-3 py-2 text-left text-sm transition',
                isCurrent
                  ? 'border-dealer-orange bg-dealer-orange/20 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-dealer-orange hover:bg-gray-700',
                disabled && !isCurrent ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
            >
              <div className="font-semibold">{loc.name}</div>
              <div className="text-xs opacity-80">{loc.character}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
