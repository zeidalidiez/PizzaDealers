import { useReducer, useCallback, useEffect } from 'react';
import {
  MAX_WEIGHT,
  STARTING_CASH,
  MAX_DAYS,
  LOAN_AMOUNT,
  LOAN_PENALTY,
  PIZZAS,
  getTotalWeight,
} from '../data/gameData.js';
import { generatePricesForSeed, getCurrentSeed } from '../lib/prices.js';
import { saveActiveRun, clearActiveRun } from '../lib/storage.js';

function createInitialState(seedOverride) {
  const seed = seedOverride ?? getCurrentSeed();
  const { prices, events } = generatePricesForSeed(seed);
  return {
    seed,
    cash: STARTING_CASH,
    day: 1,
    inventory: {},
    currentLocationId: 'downtown',
    prices,
    events,
    loan: { active: false, repaid: false },
    gameOver: false,
    finalScore: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'RESET': {
      const fresh = createInitialState(action.seed);
      saveActiveRun(fresh);
      return fresh;
    }
    case 'RESUME': {
      return action.state;
    }
    case 'TRAVEL': {
      if (state.gameOver) return state;
      if (state.day > MAX_DAYS) return state;
      const next = {
        ...state,
        currentLocationId: action.locationId,
        day: state.day + 1,
      };
      saveActiveRun(next);
      return next;
    }
    case 'SKIP_DAY': {
      if (state.gameOver) return state;
      if (state.day > MAX_DAYS) return state;
      const next = { ...state, day: state.day + 1 };
      const finalized = maybeFinalize(next);
      saveActiveRun(finalized);
      return finalized;
    }
    case 'BUY': {
      if (state.gameOver) return state;
      if (state.day > MAX_DAYS) return state;
      const { pizzaId, qty } = action;
      if (qty <= 0) return state;
      const pizza = PIZZAS.find((p) => p.id === pizzaId);
      if (!pizza) return state;
      const price = state.prices[state.day]?.[state.currentLocationId]?.[pizzaId] ?? 0;
      const cost = price * qty;
      const weight = pizza.weight * qty;
      const currentWeight = getTotalWeight(state.inventory);
      if (cost > state.cash || currentWeight + weight > MAX_WEIGHT) return state;

      const newInv = { ...state.inventory };
      newInv[pizzaId] = (newInv[pizzaId] || 0) + qty;

      const next = {
        ...state,
        cash: state.cash - cost,
        inventory: newInv,
        day: state.day + 1,
      };
      const finalized = maybeFinalize(next);
      saveActiveRun(finalized);
      return finalized;
    }
    case 'SELL': {
      if (state.gameOver) return state;
      if (state.day > MAX_DAYS) return state;
      const { pizzaId, qty } = action;
      if (qty <= 0) return state;
      const owned = state.inventory[pizzaId] || 0;
      if (qty > owned) return state;
      const price = state.prices[state.day]?.[state.currentLocationId]?.[pizzaId] ?? 0;
      const revenue = price * qty;

      const newInv = { ...state.inventory };
      newInv[pizzaId] = owned - qty;
      if (newInv[pizzaId] === 0) delete newInv[pizzaId];

      const next = {
        ...state,
        cash: state.cash + revenue,
        inventory: newInv,
        day: state.day + 1,
      };
      const finalized = maybeFinalize(next);
      saveActiveRun(finalized);
      return finalized;
    }
    case 'SELL_ALL': {
      if (state.gameOver) return state;
      if (state.day > MAX_DAYS) return state;
      let revenue = 0;
      const newInv = { ...state.inventory };
      for (const [pid, qty] of Object.entries(state.inventory)) {
        const price = state.prices[state.day]?.[state.currentLocationId]?.[pid] ?? 0;
        revenue += price * qty;
        delete newInv[pid];
      }
      const next = {
        ...state,
        cash: state.cash + revenue,
        inventory: newInv,
        day: state.day + 1,
      };
      const finalized = maybeFinalize(next);
      saveActiveRun(finalized);
      return finalized;
    }
    case 'TAKE_LOAN': {
      if (state.loan.active) return state;
      const next = {
        ...state,
        cash: state.cash + LOAN_AMOUNT,
        loan: { active: true, repaid: false },
      };
      saveActiveRun(next);
      return next;
    }
    case 'REPAY_LOAN': {
      if (!state.loan.active || state.loan.repaid || state.cash < LOAN_AMOUNT) return state;
      if (state.gameOver) return state;
      if (state.day > MAX_DAYS) return state;
      const next = {
        ...state,
        cash: state.cash - LOAN_AMOUNT,
        loan: { active: false, repaid: true },
        day: state.day + 1,
      };
      const finalized = maybeFinalize(next);
      saveActiveRun(finalized);
      return finalized;
    }
    case 'END_GAME': {
      return finalizeGame(state);
    }
    case 'CLEAR_ACTIVE_RUN': {
      clearActiveRun();
      return state;
    }
    default:
      return state;
  }
}

function maybeFinalize(state) {
  if (state.day > MAX_DAYS) {
    return finalizeGame(state);
  }
  return state;
}

function finalizeGame(state) {
  let finalCash = state.cash;
  const liquidDay = Math.min(MAX_DAYS, state.day);
  for (const [pid, qty] of Object.entries(state.inventory)) {
    const price = state.prices[liquidDay]?.[state.currentLocationId]?.[pid] ?? 0;
    finalCash += price * qty;
  }
  if (state.loan.active && !state.loan.repaid) {
    finalCash -= LOAN_PENALTY;
  }
  finalCash = Math.max(0, Math.round(finalCash));
  const next = {
    ...state,
    gameOver: true,
    finalScore: finalCash,
  };
  clearActiveRun();
  return next;
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, null, () => {
    return createInitialState();
  });

  const reset = useCallback((seed) => dispatch({ type: 'RESET', seed }), []);
  const resume = useCallback((savedState) => dispatch({ type: 'RESUME', state: savedState }), []);
  const travel = useCallback((locationId) => dispatch({ type: 'TRAVEL', locationId }), []);
  const skipDay = useCallback(() => dispatch({ type: 'SKIP_DAY' }), []);
  const buy = useCallback((pizzaId, qty) => dispatch({ type: 'BUY', pizzaId, qty }), []);
  const sell = useCallback((pizzaId, qty) => dispatch({ type: 'SELL', pizzaId, qty }), []);
  const sellAll = useCallback(() => dispatch({ type: 'SELL_ALL' }), []);
  const takeLoan = useCallback(() => dispatch({ type: 'TAKE_LOAN' }), []);
  const repayLoan = useCallback(() => dispatch({ type: 'REPAY_LOAN' }), []);
  const endGame = useCallback(() => dispatch({ type: 'END_GAME' }), []);
  const clearRun = useCallback(() => dispatch({ type: 'CLEAR_ACTIVE_RUN' }), []);

  return {
    state,
    reset,
    resume,
    travel,
    skipDay,
    buy,
    sell,
    sellAll,
    takeLoan,
    repayLoan,
    endGame,
    clearRun,
  };
}
