export default function ScoutApp() {
  return (
    <div className="w-full h-[calc(100vh-48px)] flex flex-col items-center justify-center bg-zinc-950 text-white p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-2xl">
          <span className="text-4xl">📡</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-medium tracking-tight">Scout Protocol</h1>
          {/* 2026-09-06: this said "currently in active development", which stopped
              being true when SEAM-11 ruled the project deprecated. Development has
              stopped on purpose; the prototype taught what it had to teach. Saying
              "in development" about something being wound down is the kind of small
              untruth the gallery is not allowed. */}
          <p className="text-zinc-400">
            A prototype about agent discovery, now being deprecated on purpose rather
            than quietly abandoned.
          </p>
        </div>

        <p className="text-sm text-zinc-400">
          Development has stopped. What it taught is being written up, the work is
          being archived, and then it will be removed — with the cleanup documented as
          it happens.
        </p>

        <p className="text-xs text-zinc-500 pt-2">
          Everything here was always simulated. No real network connections were ever
          made.
        </p>
      </div>
    </div>
  );
}
