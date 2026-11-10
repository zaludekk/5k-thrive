import { describe, it, expect } from "vitest";
import { SQUAT_LANDMARKS } from "@/components/activity/StrengthMetrics";

describe("Squat Climb Challenge landmarks", () => {
  it("keeps the peaks in ascending height order", () => {
    const heights = SQUAT_LANDMARKS.map(l => l.height);
    expect(heights).toEqual([...heights].sort((a, b) => a - b));
  });

  it("still ends the Earth tier at Mount Everest (8849 m)", () => {
    const earth = SQUAT_LANDMARKS.filter(l => l.planet === "Earth");
    expect(earth[earth.length - 1]).toMatchObject({ name: "Mount Everest", height: 8849 });
  });

  it("adds Boösaule Montes on Io at 18,000 m after Everest", () => {
    expect(SQUAT_LANDMARKS).toContainEqual(
      expect.objectContaining({ name: "Boösaule Montes", height: 18000, planet: "Io (Jupiter)" })
    );
  });

  it("makes Olympus Mons on Mars the final goal at 22,000 m", () => {
    expect(SQUAT_LANDMARKS[SQUAT_LANDMARKS.length - 1]).toMatchObject({
      name: "Olympus Mons",
      height: 22000,
      planet: "Mars",
    });
  });
});
