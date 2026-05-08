\# Pizza Wars – Game Design Document (Static, No Server)



\## Overview

A client‑side arcade trading game. Buy and sell 15 types of whole pizzas across 7 neighbourhoods over a 30‑day run.  

A \*\*deterministic global price list\*\* is generated from the current 6‑hour UTC time block – everyone playing in that window sees identical prices.  

All scores are stored locally in the browser; a \*\*social sharing system\*\* (import/export strings) lets players compete globally without any central server.



\---



\## 1. Game Rules

\- Start: \*\*$2,000\*\* cash, empty inventory, max \*\*100 pizzas total\*\* across all types.

\- 30 days. Each day you choose \*\*one action\*\*:  

&#x20; - \*\*Buy\*\* – purchase pizzas at current location (must have cash and space).  

&#x20; - \*\*Sell\*\* – sell pizzas from inventory at current location’s prices.  

&#x20; - \*\*Travel\*\* – move to any other neighbourhood (costs 1 day).

\- No debt, no early retirement.

\- After day 30, your entire inventory is \*\*automatically sold\*\* at the current location’s prices. Final cash = your score.

\- If you have $0 and no inventory, you can still skip days (soft fail).



\---



\## 2. Pizza Types (15)

To give trading depth, pizzas have a range of base prices.



| ID | Pizza              | Base Price |

|----|--------------------|------------|

| 1  | Margherita         | 8          |

| 2  | Pepperoni          | 10         |

| 3  | Hawaiian           | 9          |

| 4  | BBQ Chicken        | 11         |

| 5  | Veggie Supreme     | 12         |

| 6  | Meat Lover's       | 13         |

| 7  | White Pizza        | 10         |

| 8  | Dessert Pizza      | 7          |

| 9  | Truffle Mushroom   | 15         |

| 10 | Spicy Diavola      | 12         |

| 11 | Quattro Formaggi   | 11         |

| 12 | Pesto Chicken      | 11         |

| 13 | Vegan Garden       | 9          |

| 14 | Calzone            | 8          |

| 15 | Breakfast Pizza    | 10         |



\---



\## 3. Neighbourhoods \& Map

7 locations, each with a permanent price bias. Travel always costs 1 day, no distance restrictions.  

Display a \*\*clickable map\*\* (can be a simple SVG or grid of areas, eventually a stylised illustration).



| Neighbourhood   | Bias | Character          |

|-----------------|------|--------------------|

| Downtown        | 1.00 | Stable             |

| Suburbs         | 1.10 | Higher demand      |

| University      | 1.00 | High variance      |

| Industrial Park | 0.90 | Cheap, lower profit|

| Beachfront      | 1.20 | Premium, volatile  |

| Old Town        | 0.95 | Predictable        |

| Airport         | 1.00 | Erratic, events    |



\---



\## 4. Deterministic Global Market (No Server)

Every player in a 6‑hour UTC window gets the same price sequence.  

Implementation: the \*\*seed\*\* is the unix timestamp of the start of the current 6‑hour block.



```js

const SEED = Math.floor(Date.now() / (6 \* 3600 \* 1000)) \* (6 \* 3600 \* 1000);

```



\### 4.1 Price Generation

Pre‑compute all 30 days at game start using a seeded PRNG (`seedrandom` library).  

For day `d` (1–30), location `l`, pizza `p`:



```

price = round( base\_price\[p] \* location\_bias\[l] \* fluctuation(l,d) \* event\_multiplier(l,d) )

```



\- `fluctuation(l,d)`: pseudo‑random value in \[0.70, 1.30], deterministic via `seedrandom(seed + l + d + p)`.

\- `event\_multiplier`: 1.0 unless an active event applies (see section 5).

\- Minimum price allowed: $1.



Store result as a 3D lookup table: `prices\[day]\[location]\[pizzaId]`.



```js

function generatePrices(seed, day) {

&#x20; const rng = new seedrandom(seed + day);

&#x20; const prices = {};

&#x20; for (const loc of locations) {

&#x20;   prices\[loc.id] = {};

&#x20;   for (const pizza of pizzas) {

&#x20;     let base = pizza.basePrice;

&#x20;     let bias = loc.bias;

&#x20;     let fluct = 0.7 + rng() \* 0.6; // 0.7 - 1.3

&#x20;     let eventMult = getEventMultiplier(seed, day, loc.id, pizza.id);

&#x20;     let price = Math.round(base \* bias \* fluct \* eventMult);

&#x20;     prices\[loc.id]\[pizza.id] = Math.max(1, price);

&#x20;   }

&#x20; }

&#x20; return prices;

}

```



\---



\## 5. Random Events (Deterministic)

Approximately every 4–5 days an event hits one or more locations, changing prices for that day only.  

Events are derived from the seed, so all players see the same events.  

A banner shows the event description.



Examples:



| Event                   | Effect                         |

|-------------------------|--------------------------------|

| Food Critic Visit       | +50% at that location          |

| Rival Pizzeria Opens    | -30% at that location          |

| Ingredient Shortage     | +40% on a specific pizza type  |

| Street Festival         | +20% city‑wide                 |

| Health Scare            | -25% at one location           |



Generate events by iterating days and checking a seeded probability (`rng() < 0.2`). Store event list for the 30 days.



\---



\## 6. Local Scoreboard \& Arcade Name Entry

All data is stored in the browser’s `localStorage`.



\### 6.1 Data Structures



\*\*Scores per seed\*\* (local + imported):  

`pizzaWars\_scores`:  

```json

{

&#x20; "<seed>": \[

&#x20;   { "name": "JOE", "score": 3450, "date": "2026-05-08T12:34:56Z", "source": "local" },

&#x20;   { "name": "ALF", "score": 3200, "date": "2026-05-08T13:00:00Z", "source": "imported" }

&#x20; ]

}

```

`source` = `"local"` (your own runs) or `"imported"` (from sharing).



\*\*Personal run history\*\*:  

`pizzaWars\_history`: array of full run objects (seed, final score, name if entered, date, maybe day‑by‑day log for potential future replay).



\### 6.2 Rankings \& Name Entry

\- After a run, compute the top 10 \*\*merged local+imported\*\* scores for that seed.

\- If the player’s score makes the \*\*top 10\*\* (or fewer than 10 entries exist), show a “NEW HIGH SCORE!” prompt and a 3‑letter input (uppercase letters forced).  

\- If they don’t rank, just show the score and “Play Again”.

\- When a name is submitted, add the score to `pizzaWars\_scores` with `source: "local"` and also to `pizzaWars\_history`.

\- Only \*\*one entry per name per seed\*\* is allowed locally. If the same name already exists and new score is higher, replace it.



\---



\## 7. Sharing \& Importing (Social Leaderboard)

To compete globally without a server, players can encode a run as a short string and share it.



\### 7.1 Export String Format

```

PW-{seedBase36}-{score}-{name}-{shortHash}

```

\- `seedBase36`: seed timestamp (decimal) encoded in base36 (compact).

\- `score`: integer.

\- `name`: 3 letters (if unranked, use `---`).

\- `shortHash`: first 4 hex chars of SHA‑256 of `seed + score + name + SALT`, using a hardcoded salt string inside the game code (e.g., `"PIZZAWARS2024"`).  

&#x20; This provides light verification; not security-grade.



Example: `PW-1A2B3C-11234-JOE-A73F`



\### 7.2 Import

\- A text field on the leaderboard/history page accepts the string.

\- Parse it, recompute the hash, and compare.

\- If valid, add the score to `pizzaWars\_scores\[seed]` with `source: "imported"` and a timestamp.

\- Imported entries are shown distinctly in the leaderboard (e.g., italic or a tiny icon) so players know what’s theirs vs. community.



\---



\## 8. End Screen \& Screenshot

The final screen after day‑30 liquidation shows:

\- Final cash / score

\- Your rank on the merged leaderboard for that seed (or “Not in top 10”)

\- If qualified: 3‑letter name input + submit button

\- \*\*“Take Screenshot”\*\* button (always visible) that uses `html2canvas` to capture the full screen with a \*\*pizza‑themed stylized background\*\* (add an overlay with graphics, stats, name). The image is either downloaded or copied to clipboard.



\---



\## 9. History Page

\- Displays all personal runs from `pizzaWars\_history` (date, score, seed).

\- Clicking a run opens the leaderboard for that seed (merged local+imported).

\- Import text field always accessible.



\---



\## 10. Tech Stack (Static, GitHub Pages)

\- \*\*Frontend\*\*: React (Vite), Tailwind CSS.

\- \*\*Libraries\*\*:

&#x20; - `seedrandom` for deterministic RNG.

&#x20; - `html2canvas` for screenshots.

&#x20; - `js-sha256` or native `SubtleCrypto` for hashing (if available).

\- \*\*Deployment\*\*: build to `dist/`, push to GitHub Pages.

\- \*\*No backend\*\*, no database, no Firebase.



\---



\## 11. Implementation Steps (for coding agent)



1\. \*\*Scaffold\*\* Vite + React + Tailwind project. Install `seedrandom`, `html2canvas`, `js-sha256`.

2\. \*\*Game state\*\* with `useReducer`:

&#x20;  - State: `cash`, `day` (1‑30), `inventory` (object `{ pizzaId: count }`), `currentLocationId`, `prices30` (pre‑computed).

&#x20;  - Actions: `BUY(pizzaId, qty)`, `SELL(pizzaId, qty)`, `TRAVEL(locationId)`, `END\_GAME`.

3\. \*\*Price generation module\*\*:

&#x20;  - Determine seed from current time.

&#x20;  - Pre‑compute all 30 days of prices using the seed and `generatePrices()`.

&#x20;  - Pre‑generate event list (can be a separate function).

4\. \*\*UI Layout\*\*:

&#x20;  - \*\*Map\*\* component: clickable locations (CSS grid or SVG). Highlights current location.

&#x20;  - \*\*Day panel\*\*: “Day X/30”.

&#x20;  - \*\*Prices table\*\*: shows all pizzas at current location with buy/sell prices.

&#x20;  - \*\*Inventory\*\* panel: list of owned pizzas with sell buttons.

&#x20;  - \*\*Buy/Sell\*\* interface: number input or +/- for each pizza, action buttons.

&#x20;  - \*\*Event banner\*\*: appears on event days, describing the event.

&#x20;  - \*\*Cash display\*\*.

5\. \*\*Game loop\*\*:

&#x20;  - On mount, generate prices → set initial state.

&#x20;  - Handle travel (update location, day +1).

&#x20;  - Handle buy/sell (check constraints, update cash/inventory, day +1).

&#x20;  - After day reaches 31, trigger auto‑liquidate: sell all inventory at current location’s prices → compute final score.

6\. \*\*LocalStorage helpers\*\*:

&#x20;  - `getScores(seed)`, `addScore(seed, { name, score, source })`.

&#x20;  - `getHistory()`, `addToHistory(run)`.

&#x20;  - `getImportedScores(seed)`.

7\. \*\*End screen component\*\*:

&#x20;  - Display score, compute ranking.

&#x20;  - Show name entry if qualified.

&#x20;  - On submit, save to localStorage.

&#x20;  - Screenshot button (`html2canvas` captures an overlay with decorative background).

8\. \*\*Leaderboard UI\*\* (accessible from end screen and history page):

&#x20;  - Show top 10 scores for the seed, merged local+imported.

&#x20;  - Mark imported entries with a distinct style.

&#x20;  - Show “Export” button for any local high score.

9\. \*\*Share/Import\*\*:

&#x20;  - Encode function: `createShareCode(seed, score, name)`.

&#x20;  - Decode function: `parseShareCode(str)` with hash validation.

&#x20;  - Import UI: input → parse → add to imported scores → refresh leaderboard.

10\. \*\*History page\*\*:

&#x20;   - Render list from `getHistory()`.

&#x20;   - Clickable to see leaderboard for that seed.

&#x20;   - Import field always visible.

11\. \*\*Deploy\*\* to GitHub Pages.



\---



\## 12. Example pseudo‑code snippets (guidance)



\### State reducer sketch

```js

function gameReducer(state, action) {

&#x20; switch(action.type) {

&#x20;   case 'TRAVEL':

&#x20;     return { ...state, currentLocation: action.locationId, day: state.day + 1 };

&#x20;   case 'BUY': {

&#x20;     const cost = state.prices\[state.day]\[state.currentLocation]\[action.pizzaId] \* action.qty;

&#x20;     if (cost > state.cash || totalInv(state) + action.qty > 100) return state;

&#x20;     const newInv = { ...state.inventory, \[action.pizzaId]: (state.inventory\[action.pizzaId]||0) + action.qty };

&#x20;     return { ...state, cash: state.cash - cost, inventory: newInv, day: state.day + 1 };

&#x20;   }

&#x20;   case 'SELL': {

&#x20;     const revenue = state.prices\[state.day]\[state.currentLocation]\[action.pizzaId] \* action.qty;

&#x20;     const newInv = { ...state.inventory, \[action.pizzaId]: state.inventory\[action.pizzaId] - action.qty };

&#x20;     return { ...state, cash: state.cash + revenue, inventory: newInv, day: state.day + 1 };

&#x20;   }

&#x20;   case 'END\_GAME':

&#x20;     // liquidation logic

&#x20;     return state;

&#x20;   default: return state;

&#x20; }

}

```



\### Screenshot handler

```js

const takeScreenshot = async () => {

&#x20; const element = document.getElementById('screenshot-overlay');

&#x20; const canvas = await html2canvas(element, { backgroundColor: null });

&#x20; const link = document.createElement('a');

&#x20; link.download = 'pizza-wars-score.png';

&#x20; link.href = canvas.toDataURL();

&#x20; link.click();

};

```



\---



\## 13. Acceptance Criteria

\- Game loads on GitHub Pages, no 404.

\- Seed changes every 6 hours, prices are deterministic and identical across browsers in same window.

\- Local scoreboard saves and displays top 10.

\- Arcade name entry works when ranking in top 10.

\- Share string can be generated and imported, showing imported scores on leaderboard.

\- Screenshot captures stylized end screen.

\- History shows past runs.



\---



This document is now ready for your coding agent. Good luck, and happy pizza wars! 🍕



