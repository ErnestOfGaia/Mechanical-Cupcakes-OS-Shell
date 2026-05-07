export type SignalStatus = "HIGH" | "MODERATE" | "LOW";

export interface SignalData {
  id: string;
  label: string;
  value: string;
  status: SignalStatus;
  trend?: "UP" | "DOWN" | "FLAT";
}

export interface MultiplierData {
  value: number;
  label: string;
  status: SignalStatus;
  description: string;
}
