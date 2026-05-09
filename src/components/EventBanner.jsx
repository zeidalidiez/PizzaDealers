import { getEventsForLocation } from '../lib/prices.js';

export default function EventBanner({ events, day, locationId }) {
  const dayEvents = getEventsForLocation(events, day, locationId);
  if (dayEvents.length === 0) return null;

  return (
    <div className="rounded-lg border border-dealer-red bg-dealer-red/10 p-3 text-sm text-red-100">
      <div className="mb-1 font-semibold text-dealer-red">Events Today</div>
      <ul className="list-disc space-y-1 pl-5">
        {dayEvents.map((ev, idx) => (
          <li key={idx}>
            {ev.name}
            {ev.scope === 'pizza' && ev.pizzaId ? ` (Pizza #${ev.pizzaId})` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
