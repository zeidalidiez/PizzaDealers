import { PIZZAS } from '../data/gameData.js';

export default function InventoryPanel({ inventory, onSellAll, disabled }) {
  const entries = Object.entries(inventory)
    .map(([pid, qty]) => {
      const pizza = PIZZAS.find((p) => p.id === Number(pid));
      return pizza ? { ...pizza, qty } : null;
    })
    .filter(Boolean);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dealer-black bg-dealer-dark p-4">
        <h3 className="mb-2 text-lg font-semibold text-dealer-orange">Inventory</h3>
        <p className="text-sm text-gray-400">Your pizza stash is empty.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dealer-black bg-dealer-dark p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dealer-orange">Inventory</h3>
        <button
          disabled={disabled || entries.length === 0}
          onClick={onSellAll}
          className="rounded bg-dealer-red px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
        >
          Sell All
        </button>
      </div>
      <div className="space-y-2">
        {entries.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2"
          >
            <div>
              <div className="font-semibold text-white">{item.name}</div>
              <div className="text-xs text-gray-400">Wt {item.weight} each</div>
            </div>
            <div className="text-lg font-bold text-white">x{item.qty}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
