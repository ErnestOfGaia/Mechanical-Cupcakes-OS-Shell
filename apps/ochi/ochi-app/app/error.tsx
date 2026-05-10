"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center space-y-6 max-w-md w-full">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
          System Error
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-600">
          {error.message || "An unexpected error occurred."}
        </p>
        {error.digest && (
          <p className="text-[10px] text-gray-400 font-mono">
            Digest: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-4 px-6 py-2 border border-gray-900 bg-white text-gray-900 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
