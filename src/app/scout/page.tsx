export default function ScoutApp() {
  return (
    <div className="w-full h-[calc(100vh-48px)] flex flex-col items-center justify-center bg-zinc-950 text-white p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-2xl">
          <span className="text-4xl">📡</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-medium tracking-tight">Scout Protocol</h1>
          <p className="text-zinc-400">
            The Interstellar Garage is currently in active development.
          </p>
        </div>

        <p className="text-xs text-zinc-500 pt-2">
          All interactions are simulated. No real network connections are made.
        </p>
      </div>
    </div>
  );
}
