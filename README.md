# 🍕 Pizza Dealers

> *Dope Wars, but with pizza.* A 30-day browser-based market simulation where everyone competes against the same prices.

**[▶ Play it live](https://zeidalidiez.github.io/PizzaDealers/)**

---

## What is it?

A trading game inspired by the classic *Dope Wars*. Buy low, sell high, survive 30 in-game days, get on the leaderboard.

The catch: **everyone playing during the same 6-hour window competes against the exact same market.** Prices are deterministically generated from a date/time-based seed that regenerates every 6 hours — so your run is judged against the same conditions as everyone else's during that window. Fair fight.

## Features

- 🎲 **Deterministic 6-hour market** — same seed for everyone in the window
- 🍕 **15 pizza types**, each with its own volatility profile (so prices don't all move together)
- 🏙️ **Multiple neighborhoods** with location-based price biases
- 🎯 **Weight-based inventory cap** — can't carry infinite stock
- ⏭️ **Skip Day** action available from turn one
- 💸 **One-time loan** mechanic
- 📊 **Local leaderboard** — best run per seed window, stored in browser `localStorage`
- 🏆 **3-letter arcade-style score entry** when you rank
- 🎉 **Random events** (street festivals, market shocks, etc.) that swing local prices
- 📸 **Screenshot-shareable end screen**

## How to play

1. Buy pizzas cheap in one neighborhood
2. Travel and sell them somewhere they're scarce
3. Watch for random events that swing prices
4. Manage your inventory weight and your loan
5. Survive 30 in-game days. Maximize cash. Enter your initials.

## Tech stack

- **Vite** + **React** + **Tailwind CSS**
- 100% client-side — no backend, no database, no auth
- Deployed via **GitHub Actions** → **GitHub Pages**
- Scores persisted to browser `localStorage`

## Run locally

```bash
git clone https://github.com/zeidalidiez/PizzaDealers.git
cd PizzaDealers
npm install
npm run dev
```

Open whatever port Vite picks (usually `http://localhost:5173`).

## How this was built

Pizza Dealers was built in about 30 minutes using a workflow I call **non-vibe coding** — a lightly structured handoff between an AI cofounder, a coding agent, and GitHub Pages.

- ▶️ **Watch the build:** [YouTube video](https://youtu.be/QbEphYXgzy0)
- 📖 **Read the writeup:** [Non-vibe coding article](https://zeiddiez.substack.com/p/non-vibe-coding-how-to-build-a-real)
- 🛠️ **Tools used:** [DeepSeek](https://chat.deepseek.com/) (design doc) · [OpenCode](https://opencode.ai/) + Kimi K2.6 (coding agent) · GitHub Desktop · GitHub Pages

## License

MIT — see [LICENSE](LICENSE).
