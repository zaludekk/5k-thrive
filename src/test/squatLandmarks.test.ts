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

  it("fills the gap between Everest and Olympus Mons with real space peaks", () => {
    const beyondEarth = SQUAT_LANDMARKS.filter(l => l.planet !== "Earth");
    expect(beyondEarth).toContainEqual(
      expect.objectContaining({ name: "Euboea Montes", height: 10000, planet: "Io (Jupiter)" })
    );
    expect(beyondEarth).toContainEqual(
      expect.objectContaining({ name: "Maxwell Montes", height: 11000, planet: "Venus" })
    );
    expect(beyondEarth).toContainEqual(
      expect.objectContaining({ name: "Pavonis Mons", height: 14000, planet: "Mars" })
    );
    expect(beyondEarth).toContainEqual(
      expect.objectContaining({ name: "Arsia Mons", height: 17700, planet: "Mars" })
    );
    expect(beyondEarth).toContainEqual(
      expect.objectContaining({ name: "Ascraeus Mons", height: 18200, planet: "Mars" })
    );
    expect(beyondEarth).toContainEqual(
      expect.objectContaining({ name: "Rheasilvia", height: 20500, planet: "Vesta (asteroid)" })
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
