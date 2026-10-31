import { describe, expect, it } from "vitest";
import { deliveryProgress, formatRemaining, fromLocalInput, toLocalInput } from "./session-format";

describe("session-format", () => {
  it("round-trips a deadline through the datetime-local input", () => {
    const iso = "2026-10-31T15:30:00.000Z";
    expect(fromLocalInput(toLocalInput(iso))).toBe(iso);
  });

  it("treats an empty or invalid input as no deadline", () => {
    expect(fromLocalInput("")).toBeNull();
    expect(fromLocalInput("no es una fecha")).toBeNull();
    expect(toLocalInput(null)).toBe("");
  });

  it("formats the time left and returns null once the deadline passed", () => {
    const now = new Date("2026-10-31T12:00:00Z").getTime();
    expect(formatRemaining("2026-10-31T12:12:30Z", now)).toBe("12:30");
    expect(formatRemaining("2026-10-31T13:05:00Z", now)).toBe("1 h 05 min");
    expect(formatRemaining("2026-10-31T12:00:00Z", now)).toBeNull();
    expect(formatRemaining("2026-10-31T11:00:00Z", now)).toBeNull();
  });

  it("computes delivery progress only when the expected number is known", () => {
    expect(deliveryProgress(3, 12)).toBe(25);
    expect(deliveryProgress(15, 12)).toBe(100);
    expect(deliveryProgress(3, 0)).toBeNull();
  });
});
