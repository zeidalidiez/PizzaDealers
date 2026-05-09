export const MAX_WEIGHT = 100;
export const STARTING_CASH = 2000;
export const MAX_DAYS = 30;
export const LOAN_AMOUNT = 1000;
export const LOAN_PENALTY = 1500;
export const SALT = 'PIZZADEALERS2025';

export const PIZZAS = [
  { id: 1, name: 'Margherita', basePrice: 8, weight: 5, volMin: 0.85, volMax: 1.15 },
  { id: 2, name: 'Pepperoni', basePrice: 10, weight: 6, volMin: 0.70, volMax: 1.30 },
  { id: 3, name: 'Hawaiian', basePrice: 9, weight: 5, volMin: 0.70, volMax: 1.30 },
  { id: 4, name: 'BBQ Chicken', basePrice: 11, weight: 7, volMin: 0.70, volMax: 1.30 },
  { id: 5, name: 'Veggie Supreme', basePrice: 12, weight: 7, volMin: 0.70, volMax: 1.30 },
  { id: 6, name: "Meat Lover's", basePrice: 13, weight: 9, volMin: 0.80, volMax: 1.20 },
  { id: 7, name: 'White Pizza', basePrice: 10, weight: 6, volMin: 0.70, volMax: 1.30 },
  { id: 8, name: 'Dessert Pizza', basePrice: 7, weight: 3, volMin: 0.90, volMax: 1.10 },
  { id: 9, name: 'Truffle Mushroom', basePrice: 15, weight: 8, volMin: 0.50, volMax: 1.50 },
  { id: 10, name: 'Spicy Diavola', basePrice: 12, weight: 6, volMin: 0.55, volMax: 1.45 },
  { id: 11, name: 'Quattro Formaggi', basePrice: 11, weight: 6, volMin: 0.70, volMax: 1.30 },
  { id: 12, name: 'Pesto Chicken', basePrice: 11, weight: 6, volMin: 0.70, volMax: 1.30 },
  { id: 13, name: 'Vegan Garden', basePrice: 9, weight: 5, volMin: 0.70, volMax: 1.30 },
  { id: 14, name: 'Calzone', basePrice: 8, weight: 8, volMin: 0.80, volMax: 1.20 },
  { id: 15, name: 'Breakfast Pizza', basePrice: 10, weight: 6, volMin: 0.70, volMax: 1.30 },
];

export const LOCATIONS = [
  { id: 'downtown', name: 'Downtown', bias: 1.00, character: 'Stable' },
  { id: 'suburbs', name: 'Suburbs', bias: 1.10, character: 'Higher demand' },
  { id: 'university', name: 'University', bias: 1.00, character: 'High variance' },
  { id: 'industrial', name: 'Industrial Park', bias: 0.90, character: 'Cheap, lower profit' },
  { id: 'beachfront', name: 'Beachfront', bias: 1.20, character: 'Premium, volatile' },
  { id: 'oldtown', name: 'Old Town', bias: 0.95, character: 'Predictable' },
  { id: 'airport', name: 'Airport', bias: 1.00, character: 'Erratic, events' },
];

export const EVENT_TYPES = [
  { id: 'critic', name: 'Food Critic Visit', multiplier: 1.50, scope: 'location' },
  { id: 'rival', name: 'Rival Pizzeria Opens', multiplier: 0.70, scope: 'location' },
  { id: 'shortage', name: 'Ingredient Shortage', multiplier: 1.40, scope: 'pizza' },
  { id: 'festival', name: 'Street Festival', multiplier: 1.20, scope: 'global' },
  { id: 'health', name: 'Health Scare', multiplier: 0.75, scope: 'location' },
];

export function getPizzaById(id) {
  return PIZZAS.find((p) => p.id === id);
}

export function getLocationById(id) {
  return LOCATIONS.find((l) => l.id === id);
}

export function getTotalWeight(inventory) {
  let total = 0;
  for (const [pid, qty] of Object.entries(inventory)) {
    const pizza = PIZZAS.find((p) => p.id === Number(pid));
    if (pizza) total += pizza.weight * qty;
  }
  return total;
}
