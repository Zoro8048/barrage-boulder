/**
 * Common Formatting & Math Helpers
 */

export function formatNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString();
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
