import React from "react";

export function SignalTimestamp() {
  const signalTimestamp = "10:42 AM"; // Hardcoded to prevent hydration mismatch

  return (
    <span className="ml-2 px-1 py-0.5 bg-gray-200 text-gray-700" aria-label={`Timestamp: ${signalTimestamp}`}>
      {signalTimestamp}
    </span>
  );
}
