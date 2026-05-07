import { MultiplierData } from "./types";

export function buildMultiplierData(): MultiplierData {
  return {
    value: 0.82,
    label: "High Vol",
    status: "HIGH",
    description: "Forecasting 82% efficiency for the current period.",
  };
}
