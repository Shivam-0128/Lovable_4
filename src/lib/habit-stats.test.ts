import { describe, it, expect } from "vitest";
import { currentStreak, lastSevenDays } from "./habit-stats";

describe("habit stats", () => {
  it("last 7 days includes today, formatted YYYY-MM-DD", () => {
    const days = lastSevenDays(new Date(2026, 9, 20));
    expect(days).toHaveLength(7);
    expect(days[0]).toBe("2026-10-20");
    expect(days[6]).toBe("2026-10-14");
  });
  it("streak counts back from most recent done day", () => {
    expect(currentStreak(["2026-10-18", "2026-10-17", "2026-10-15"])).toBe(2);
    expect(currentStreak([])).toBe(0);
    expect(currentStreak(["2026-10-01"])).toBe(1);
  });
});
