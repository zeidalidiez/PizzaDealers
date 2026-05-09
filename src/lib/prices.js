import seedrandom from 'seedrandom';
import { PIZZAS, LOCATIONS, EVENT_TYPES, MAX_DAYS } from '../data/gameData.js';

export function getCurrentSeed() {
  const now = Date.now();
  const block = 6 * 3600 * 1000;
  return Math.floor(now / block) * block;
}

export function generatePricesForSeed(seed) {
  const prices = {}; // prices[day][locationId][pizzaId]
  const events = {}; // events[day] = array of event objects

  for (let day = 1; day <= MAX_DAYS; day++) {
    prices[day] = {};
    const dayEvents = generateDayEvents(seed, day);
    events[day] = dayEvents;

    for (const loc of LOCATIONS) {
      prices[day][loc.id] = {};
      const rng = new seedrandom(`${seed}-${day}-${loc.id}`);

      for (const pizza of PIZZAS) {
        let fluct = pizza.volMin + rng() * (pizza.volMax - pizza.volMin);
        let eventMult = 1.0;

        for (const ev of dayEvents) {
          if (ev.scope === 'global') {
            eventMult *= ev.multiplier;
          } else if (ev.scope === 'location' && ev.locationId === loc.id) {
            eventMult *= ev.multiplier;
          } else if (ev.scope === 'pizza' && ev.pizzaId === pizza.id) {
            eventMult *= ev.multiplier;
          }
        }

        let price = Math.round(pizza.basePrice * loc.bias * fluct * eventMult);
        price = Math.max(1, price);
        prices[day][loc.id][pizza.id] = price;
      }
    }
  }

  return { prices, events };
}

function generateDayEvents(seed, day) {
  const rng = new seedrandom(`${seed}-events-${day}`);
  const dayEvents = [];

  for (let roll = 0; roll < 2; roll++) {
    if (rng() < 0.25) {
      const evType = EVENT_TYPES[Math.floor(rng() * EVENT_TYPES.length)];
      const ev = { ...evType };

      if (ev.scope === 'location' || ev.scope === 'pizza') {
        const targetLoc = LOCATIONS[Math.floor(rng() * LOCATIONS.length)];
        if (ev.scope === 'location') {
          ev.locationId = targetLoc.id;
        } else {
          ev.locationId = targetLoc.id;
          const targetPizza = PIZZAS[Math.floor(rng() * PIZZAS.length)];
          ev.pizzaId = targetPizza.id;
        }
      }

      dayEvents.push(ev);
    }
  }

  return dayEvents;
}

export function getEventsForLocation(events, day, locationId) {
  if (!events[day]) return [];
  return events[day].filter((ev) => {
    if (ev.scope === 'global') return true;
    if (ev.scope === 'location' && ev.locationId === locationId) return true;
    if (ev.scope === 'pizza' && ev.locationId === locationId) return true;
    return false;
  });
}
