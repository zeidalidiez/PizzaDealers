import { useState } from 'react';
import { PIZZAS, MAX_WEIGHT, getTotalWeight } from '../data/gameData.js';

export default function PriceTable({
  day,
  prices,
  locationId,
  inventory,
  cash,
  onBuy,
  onSell,
  disabled,
}) {
  const [qtyMap, setQtyMap] = useState({});
  const currentPrices = prices[day]?.[locationId] || {};
  const prevPrices = day > 1 ? prices[day - 1]?.[locationId] || {} : {};

  const setQty = (id, val) => {
    const n = Math.max(0, parseInt(val || '0', 10));
    setQtyMap((m) => ({ ...m, [id]: n }));
  };

  return (
    <div className="rounded-xl border border-dealer-black bg-dealer-dark p-4">
      <h3 className="mb-3 text-lg font-semibold text-dealer-orange">Market Prices</h3>
      <div className="space-y-2">
        {PIZZAS.map((p) => {
          const price = currentPrices[p.id] || 0;
          const prev = prevPrices[p.id];
          const owned = inventory[p.id] || 0;
          const qty = qtyMap[p.id] || 0;
          const currentWeight = getTotalWeight(inventory);
          const maxBuyQty = price > 0 ? Math.floor(cash / price) : 0;
          const maxByWeight = Math.floor((MAX_WEIGHT - currentWeight) / p.weight);
          const canBuy = Math.min(maxBuyQty, maxByWeight);
          const canSell = owned;

          let trend = null;
          if (prev !== undefined) {
            if (price > prev) trend = '▲';
            else if (price < prev) trend = '▼';
            else trend = '‑';
          }

          return (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2"
            >
              <div className="min-w-[10rem] flex-1">
                <div className="font-semibold text-white">{p.name}</div>
                <div className="text-xs text-gray-400">
                  Wt {p.weight} | Owned: {owned}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">${price}</div>
                {trend !== null && (
                  <div
                    className={`text-xs ${
                      trend === '▲' ? 'text-green-400' : trend === '▼' ? 'text-red-400' : 'text-gray-400'
                    }`}
                  >
                    {trend} {prev !== undefined ? `$${prev}` : ''}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={Math.max(canBuy, canSell)}
                  value={qty}
                  onChange={(e) => setQty(p.id, e.target.value)}
                  className="w-16 rounded border border-gray-600 bg-gray-900 px-2 py-1 text-center text-white"
                />
                <button
                  disabled={disabled || qty <= 0 || qty > canBuy}
                  onClick={() => {
                    onBuy(p.id, qty);
                    setQty(p.id, 0);
                  }}
                  className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-40"
                >
                  Buy
                </button>
                <button
                  disabled={disabled || qty <= 0 || qty > canSell}
                  onClick={() => {
                    onSell(p.id, qty);
                    setQty(p.id, 0);
                  }}
                  className="rounded bg-dealer-red px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
                >
                  Sell
                </button>
                <button
                  disabled={disabled || canBuy <= 0}
                  onClick={() => {
                    onBuy(p.id, canBuy);
                    setQty(p.id, 0);
                  }}
                  className="rounded border border-green-600 px-2 py-1 text-xs font-semibold text-green-400 hover:bg-green-900 disabled:opacity-40"
                >
                  Max
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
