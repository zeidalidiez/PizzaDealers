# Pizza Dealers – Game Design Document (Static, No Server)

## Overview

A client‑side arcade trading game. Buy and sell 15 types of whole pizzas across 7 neighbourhoods over a 30‑day run.

A **deterministic global price list** is generated from the current 6‑hour UTC time block – everyone playing in that window sees identical prices.

All scores are stored locally in the browser; a **social sharing system** (import/export strings) lets players compete globally without any central server.

---

## 1. Game Rules

- **Start**: `$2,000` cash, empty inventory, max **`100` weight capacity** (see Section 2 for per-pizza weights).
- **30 days**. Each day you choose **one action**:
  - **Buy** – purchase pizzas at current location (must have cash and remaining weight capacity).
  - **Sell** – sell pizzas from inventory at current location’s prices.
  - **Travel** – move to any other neighbourhood (costs 1 day).
  - **Skip Day** – do nothing, advance the day.
- **One-Time Loan** (Section 1.1) – optional risk/reward mechanic.
- No early retirement.
- **Day 30**: you get **one final action** (Buy, Sell, Travel, or Skip). After that action resolves, any remaining inventory is **automatically liquidated** at the current location’s prices. Final cash = your score.
- If you have `$0`, no inventory, and no active loan, you can still skip days (soft fail).
- **Mid-run save**: game state is persisted after every action. Players can close the tab and resume later.

### 1.1 One-Time Loan

- Available **once per run** at any time before Day 30.
- **Borrow `$1,000`** instantly added to cash.
- Repay via the **"Repay Loan"** action (counts as your daily action) at any time.
- **Deadline**: end of Day 30 auto-liquidation.
- **Penalty**: if the loan is not repaid by the end of the run, **`$1,500`** is deducted from the final score.
- While the loan is active, you can still buy and sell normally; you cannot go into further debt.

---

## 2. Pizza Types (15)

To give trading depth, pizzas have a range of **base prices**, **weights**, and **volatility profiles**.

| ID | Pizza            | Base Price | Weight | Volatility Range |
|----|------------------|------------|--------|------------------|
| 1  | Margherita       | 8          | 5      | 0.85 – 1.15      |
| 2  | Pepperoni        | 10         | 6      | 0.70 – 1.30      |
| 3  | Hawaiian         | 9          | 5      | 0.70 – 1.30      |
| 4  | BBQ Chicken      | 11         | 7      | 0.70 – 1.30      |
| 5  | Veggie Supreme   | 12         | 7      | 0.70 – 1.30      |
| 6  | Meat Lover's     | 13         | 9      | 0.80 – 1.20      |
| 7  | White Pizza      | 10         | 6      | 0.70 – 1.30      |
| 8  | Dessert Pizza    | 7          | 3      | 0.90 – 1.10      |
| 9  | Truffle Mushroom | 15         | 8      | 0.50 – 1.50      |
| 10 | Spicy Diavola    | 12         | 6      | 0.55 – 1.45      |
| 11 | Quattro Formaggi | 11         | 6      | 0.70 – 1.30      |
| 12 | Pesto Chicken    | 11         | 6      | 0.70 – 1.30      |
| 13 | Vegan Garden     | 9          | 5      | 0.70 – 1.30      |
| 14 | Calzone          | 8          | 8      | 0.80 – 1.20      |
| 15 | Breakfast Pizza  | 10         | 6      | 0.70 – 1.30      |

**Inventory constraint**: `Σ(count[p] * weight[p]) ≤ 100` at all times.

---

## 3. Neighbourhoods & Map

7 locations, each with a permanent price bias. Travel always costs 1 day, no distance restrictions.

Display a **clickable map** (can be a simple SVG or grid of areas, eventually a stylised illustration).

| Neighbourhood   | Bias | Character          |
|-----------------|------|--------------------|
| Downtown        | 1.00 | Stable             |
| Suburbs         | 1.10 | Higher demand      |
| University      | 1.00 | High variance      |
| Industrial Park | 0.90 | Cheap, lower profit|
| Beachfront      | 1.20 | Premium, volatile  |
| Old Town        | 0.95 | Predictable        |
| Airport         | 1.00 | Erratic, events    |

---

## 4. Deterministic Global Market (No Server)

Every player in a 6‑hour UTC window gets the same price sequence.

Implementation: the **seed** is the unix timestamp of the start of the current 6‑hour block.

```js
const SEED = Math.floor(Date.now() / (6 * 3600 * 1000)) * (6 * 3600 * 1000);
```

### 4.1 Price Generation

Pre‑compute all 30 days at game start using a seeded PRNG (`seedrandom` library).

For day `d` (1–30), location `l`, pizza `p`:

```
price = round( base_price[p] * location_bias[l] * fluctuation(p) * event_multiplier(l,d) )
```

- `fluctuation(p)`: pseudo‑random value drawn from the pizza’s **Volatility Range** (Section 2). Deterministic via `seedrandom(seed + d + l + p)`.
- `event_multiplier`: `1.0` unless one or more active events apply. Multiple events on the same location/pizza are **multiplied together** (see Section 5).
- Minimum price allowed: `$1`.

Store result as a 3D lookup table: `prices[day][location][pizzaId]`.

```js
function generatePrices(seed, day) {
  const rng = new seedrandom(seed + day);
  const prices = {};
  for (const loc of locations) {
    prices[loc.id] = {};
    for (const pizza of pizzas) {
      let base = pizza.basePrice;
      let bias = loc.bias;
      let minF = pizza.volMin;
      let maxF = pizza.volMax;
      let fluct = minF + rng() * (maxF - minF);
      let eventMult = getEventMultiplier(seed, day, loc.id, pizza.id);
      let price = Math.round(base * bias * fluct * eventMult);
      prices[loc.id][pizza.id] = Math.max(1, price);
    }
  }
  return prices;
}
```

---

## 5. Random Events (Deterministic)

Approximately every 4–5 days an event hits one or more locations, changing prices for that day only. **Multiple events can affect the same location on the same day**; their multipliers stack multiplicatively.

Events are derived from the seed, so all players see the same events. A banner shows active event descriptions for the current day.

| Event                   | Effect                         |
|-------------------------|--------------------------------|
| Food Critic Visit       | +50% at that location          |
| Rival Pizzeria Opens    | -30% at that location          |
| Ingredient Shortage     | +40% on a specific pizza type  |
| Street Festival         | +20% city‑wide                 |
| Health Scare            | -25% at one location           |

**Event generation rules**:
- Iterate each day `d`. Roll `rng() < 0.25` for an event occurring.
- If an event occurs, pick a random event type, then pick target location(s) / pizza type as applicable.
- Up to **2 events** may fire on the same day (reroll once if the first succeeds).
- Store the full event list for the 30 days; the UI displays any events relevant to the player’s current location.

---

## 6. Local Scoreboard, History & Active Run

All data is stored in the browser’s `localStorage`.

### 6.1 Data Structures

**Scores per seed** (local + imported):
`pizzaDealers_scores`:
```json
{
  "<seed>": [
    { "name": "JOE", "score": 3450, "date": "2026-05-08T12:34:56Z", "source": "local" },
    { "name": "ALF", "score": 3200, "date": "2026-05-08T13:00:00Z", "source": "imported" }
  ]
}
```
`source` = `"local"` (your own runs) or `"imported"` (from sharing).

**Personal run history**:
`pizzaDealers_history`: array of full run objects (seed, final score, name if entered, date, maybe day‑by‑day log for potential future replay).

**Active run (resume)**:
`pizzaDealers_activeRun`: serialized game state (cash, day, inventory, location, prices, loan status, etc.). Updated after every player action. Cleared when the run ends or the player abandons it.

### 6.2 Rankings & Name Entry

- After a run, compute the top 10 **merged local+imported** scores for that seed.
- If the player’s score makes the **top 10** (or fewer than 10 entries exist), show a “NEW HIGH SCORE!” prompt and a 3‑letter input (uppercase letters forced).
- If they don’t rank, just show the score and “Play Again”.
- When a name is submitted, add the score to `pizzaDealers_scores` with `source: "local"` and also to `pizzaDealers_history`.
- Only **one entry per name per seed** is allowed locally. If the same name already exists and new score is higher, replace it.

### 6.3 Resume Flow

- On app load, check `pizzaDealers_activeRun`.
- If present and `day ≤ 30`, show a modal: **"Resume run (Day X at Location)"** vs **"Abandon"**.
- If the player chooses "Abandon", clear the key and return to the title screen.
- If the player resumes, restore full state from the saved object.

---

## 7. Sharing & Importing (Social Leaderboard)

To compete globally without a server, players can encode a run as a short string and share it.

### 7.1 Export String Format

```
PD-{seedBase36}-{score}-{name}-{shortHash}
```

- `seedBase36`: seed timestamp (decimal) encoded in base36 (compact).
- `score`: integer.
- `name`: 3 letters (if unranked, use `---`).
- `shortHash`: first 4 hex chars of SHA‑256 of `seed + score + name + SALT`, using a hardcoded salt string inside the game code (e.g., `"PIZZADEALERS2025"`).
  This provides light verification; not security-grade.

Example: `PD-1A2B3C-11234-JOE-A73F`

### 7.2 Import

- A text field on the leaderboard/history page accepts the string.
- Parse it, recompute the hash, and compare.
- If valid, add the score to `pizzaDealers_scores[seed]` with `source: "imported"` and a timestamp.
- Imported entries are shown distinctly in the leaderboard (e.g., italic or a tiny icon) so players know what’s theirs vs. community.

---

## 8. End Screen & Screenshot

The final screen after day‑30 liquidation shows:
- Final cash / score
- Loan penalty applied (if any)
- Your rank on the merged leaderboard for that seed (or “Not in top 10”)
- If qualified: 3‑letter name input + submit button
- **“Take Screenshot”** button (always visible) that uses `html2canvas` to capture the full screen with a **pizza‑themed stylized background** in the **Pizza Dealers brand palette: orange, red, and black**. The image is either downloaded or copied to clipboard.

---

## 9. History Page

- Displays all personal runs from `pizzaDealers_history` (date, score, seed).
- Clicking a run opens the leaderboard for that seed (merged local+imported).
- Import text field always accessible.

---

## 10. Tech Stack (Static, GitHub Pages)

- **Frontend**: React (Vite), Tailwind CSS.
- **Libraries**:
  - `seedrandom` for deterministic RNG.
  - `html2canvas` for screenshots.
  - `js-sha256` or native `SubtleCrypto` for hashing (if available).
- **Deployment**: build to `dist/`, push to GitHub Pages.
- **No backend**, no database, no Firebase.
- **Theme / Branding**: Tailwind config should define custom colors:
  - `dealer-orange` (e.g., `#F97316`)
  - `dealer-red` (e.g., `#DC2626`)
  - `dealer-black` (e.g., `#111827`)
  - Use these for UI accents, map highlights, event banners, and screenshot overlay.

---

## 11. Implementation Steps (for coding agent)

1. **Scaffold** Vite + React + Tailwind project. Install `seedrandom`, `html2canvas`, `js-sha256`.
2. **Game state** with `useReducer`:
   - State: `cash`, `day` (1‑30), `inventory` (object `{ pizzaId: count }`), `currentLocationId`, `prices30` (pre‑computed), `loan` (`{ active: boolean, repaid: boolean }`), `maxWeight: 100`.
   - Actions: `BUY(pizzaId, qty)`, `SELL(pizzaId, qty)`, `TRAVEL(locationId)`, `SKIP_DAY`, `REPAY_LOAN`, `END_GAME`.
3. **Price generation module**:
   - Determine seed from current time.
   - Pre‑compute all 30 days of prices using the seed and `generatePrices()`.
   - Pre‑generate event list (up to 2 events per day, multiplicative stacking).
4. **UI Layout**:
   - **Map** component: clickable locations (CSS grid or SVG). Highlights current location.
   - **Day panel**: “Day X/30”.
   - **Prices table**: shows all pizzas at current location with buy/sell prices, **previous day price**, and a **trend indicator** (▲ / ▼ / ‑).
   - **Inventory** panel: list of owned pizzas with sell buttons, total weight used / 100.
   - **Buy/Sell** interface: number input or +/- for each pizza, **“Max”** and **“Sell All”** shortcuts, action buttons.
   - **Event banner**: appears on event days, describing active events for the current location.
   - **Loan panel**: visible if loan is available or active. Shows status and repay button.
   - **Cash display**.
5. **Game loop**:
   - On mount, check `pizzaDealers_activeRun`. Offer resume if valid.
   - If starting fresh: generate prices → set initial state.
   - Handle travel (update location, day +1).
   - Handle buy/sell (check cash, weight constraints, update cash/inventory, day +1).
   - Handle skip day (day +1).
   - Handle repay loan (counts as daily action; day +1).
   - **After day reaches 31**, trigger auto‑liquidate: sell all inventory at current location’s prices, apply loan penalty if needed → compute final score.
   - **Persist state** to `pizzaDealers_activeRun` after every action.
6. **LocalStorage helpers**:
   - `getScores(seed)`, `addScore(seed, { name, score, source })`.
   - `getHistory()`, `addToHistory(run)`.
   - `getImportedScores(seed)`.
   - `saveActiveRun(state)`, `loadActiveRun()`, `clearActiveRun()`.
7. **End screen component**:
   - Display score (and loan penalty if applied).
   - Compute ranking.
   - Show name entry if qualified.
   - On submit, save to localStorage and clear active run.
   - Screenshot button (`html2canvas` captures an overlay with decorative background in orange/red/black).
8. **Leaderboard UI** (accessible from end screen and history page):
   - Show top 10 scores for the seed, merged local+imported.
   - Mark imported entries with a distinct style.
   - Show “Export” button for any local high score.
9. **Share/Import**:
   - Encode function: `createShareCode(seed, score, name)`.
   - Decode function: `parseShareCode(str)` with hash validation.
   - Import UI: input → parse → add to imported scores → refresh leaderboard.
10. **History page**:
    - Render list from `getHistory()`.
    - Clickable to see leaderboard for that seed.
    - Import field always visible.
11. **Deploy** to GitHub Pages.

---

## 12. Example pseudo‑code snippets (guidance)

### State reducer sketch

```js
function gameReducer(state, action) {
  switch(action.type) {
    case 'TRAVEL':
      return { ...state, currentLocation: action.locationId, day: state.day + 1 };
    case 'BUY': {
      const cost = state.prices[state.day][state.currentLocation][action.pizzaId] * action.qty;
      const weight = PIZZAS[action.pizzaId].weight * action.qty;
      if (cost > state.cash || totalWeight(state.inventory) + weight > state.maxWeight) return state;
      const newInv = { ...state.inventory, [action.pizzaId]: (state.inventory[action.pizzaId]||0) + action.qty };
      return { ...state, cash: state.cash - cost, inventory: newInv, day: state.day + 1 };
    }
    case 'SELL': {
      const revenue = state.prices[state.day][state.currentLocation][action.pizzaId] * action.qty;
      const newInv = { ...state.inventory, [action.pizzaId]: state.inventory[action.pizzaId] - action.qty };
      return { ...state, cash: state.cash + revenue, inventory: newInv, day: state.day + 1 };
    }
    case 'SKIP_DAY':
      return { ...state, day: state.day + 1 };
    case 'TAKE_LOAN':
      if (state.loan.active) return state;
      return { ...state, cash: state.cash + 1000, loan: { active: true, repaid: false } };
    case 'REPAY_LOAN': {
      if (!state.loan.active || state.loan.repaid || state.cash < 1000) return state;
      return { ...state, cash: state.cash - 1000, loan: { active: false, repaid: true }, day: state.day + 1 };
    }
    case 'END_GAME': {
      // liquidation logic + loan penalty
      let finalCash = state.cash;
      for (const [pid, qty] of Object.entries(state.inventory)) {
        finalCash += state.prices[30][state.currentLocation][pid] * qty;
      }
      if (state.loan.active && !state.loan.repaid) finalCash -= 1500;
      return { ...state, cash: Math.max(0, finalCash), day: 31 };
    }
    default: return state;
  }
}
```

### Screenshot handler

```js
const takeScreenshot = async () => {
  const element = document.getElementById('screenshot-overlay');
  const canvas = await html2canvas(element, { backgroundColor: null });
  const link = document.createElement('a');
  link.download = 'pizza-dealers-score.png';
  link.href = canvas.toDataURL();
  link.click();
};
```

---

## 13. Acceptance Criteria

- Game loads on GitHub Pages, no 404.
- Seed changes every 6 hours, prices are deterministic and identical across browsers in same window.
- Weight-based inventory is enforced; players cannot exceed 100 total weight.
- Volatility profiles produce different price ranges per pizza type.
- Local scoreboard saves and displays top 10.
- Arcade name entry works when ranking in top 10.
- Share string can be generated and imported, showing imported scores on leaderboard.
- Screenshot captures stylized end screen in orange/red/black.
- History shows past runs.
- Active run is saved to localStorage and can be resumed after closing the browser.
- Skip Day and Loan mechanics function correctly.
- Price trends (previous-day comparison) are visible in the UI.
- Multiple events can stack on the same day/location.

---

This document is now ready for your coding agent. Good luck, and happy dealing! 🍕
