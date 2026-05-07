import { describe, it, expect } from "vitest";
import { buildMultiplierData } from "../lib/multiplier";

describe("buildMultiplierData", () => {
  it("should return the hardcoded 0.82 multiplier data", () => {
    const data = buildMultiplierData();
    expect(data.value).toBe(0.82);
    expect(data.label).toBe("High Vol");
    expect(data.status).toBe("HIGH");
    expect(data.description).toBe("Forecasting 82% efficiency for the current period.");
  });
});
