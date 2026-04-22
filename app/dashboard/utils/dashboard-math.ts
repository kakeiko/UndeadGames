export const toHours = (min: number) => Math.floor(min / 60);

export const clamp = (v: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, v));

export const pct = (cur: number, tar: number) =>
  clamp(Math.round((cur / tar) * 100));
