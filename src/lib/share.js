import { sha256 } from 'js-sha256';
import { SALT } from '../data/gameData.js';

export function createShareCode(seed, score, name) {
  const seedBase36 = Number(seed).toString(36).toUpperCase();
  const nameStr = (name || '---').toUpperCase().slice(0, 3);
  const payload = `${seed}-${score}-${nameStr}-${SALT}`;
  const hash = sha256(payload).toUpperCase().slice(0, 4);
  return `PD-${seedBase36}-${score}-${nameStr}-${hash}`;
}

export function parseShareCode(str) {
  const trimmed = str.trim();
  if (!trimmed.startsWith('PD-')) return null;

  const parts = trimmed.split('-');
  if (parts.length !== 5) return null;

  const [, seedBase36, scoreStr, nameStr, hash] = parts;
  const seed = parseInt(seedBase36, 36);
  const score = parseInt(scoreStr, 10);
  const name = nameStr.toUpperCase();

  if (isNaN(seed) || isNaN(score)) return null;

  const payload = `${seed}-${score}-${name}-${SALT}`;
  const expectedHash = sha256(payload).toUpperCase().slice(0, 4);
  if (hash !== expectedHash) return null;

  return { seed, score, name };
}
