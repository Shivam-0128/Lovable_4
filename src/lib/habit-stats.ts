export function toDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function lastSevenDays(today = new Date()): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    return toDay(d);
  });
}

/** Consecutive done days counting back from the most recent done day. */
export function currentStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  const latest = [...set].sort().at(-1)!;
  const [y, m, d] = latest.split("-").map(Number);
  let streak = 0;
  let cur = new Date(y, m - 1, d);
  while (set.has(toDay(cur))) {
    streak++;
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() - 1);
  }
  return streak;
}
