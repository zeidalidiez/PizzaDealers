const SCORES_KEY = 'pizzaDealers_scores';
const HISTORY_KEY = 'pizzaDealers_history';
const ACTIVE_RUN_KEY = 'pizzaDealers_activeRun';

export function getScores(seed) {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data[String(seed)] || [];
  } catch {
    return [];
  }
}

export function addScore(seed, entry) {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const key = String(seed);
    if (!data[key]) data[key] = [];

    const existingIndex = data[key].findIndex(
      (s) => s.name === entry.name && s.source === 'local'
    );
    if (existingIndex >= 0) {
      if (entry.score > data[key][existingIndex].score) {
        data[key][existingIndex] = entry;
      }
    } else {
      data[key].push(entry);
    }

    data[key].sort((a, b) => b.score - a.score);
    localStorage.setItem(SCORES_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function addImportedScore(seed, entry) {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const key = String(seed);
    if (!data[key]) data[key] = [];
    data[key].push(entry);
    data[key].sort((a, b) => b.score - a.score);
    localStorage.setItem(SCORES_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(run) {
  try {
    const history = getHistory();
    history.unshift(run);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function saveActiveRun(state) {
  try {
    localStorage.setItem(ACTIVE_RUN_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function loadActiveRun() {
  try {
    const raw = localStorage.getItem(ACTIVE_RUN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearActiveRun() {
  try {
    localStorage.removeItem(ACTIVE_RUN_KEY);
  } catch {
    // ignore
  }
}
