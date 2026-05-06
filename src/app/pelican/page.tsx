import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function PelicanApp() {
  return (
    <div className="w-full h-[calc(100vh-48px)] mt-12 flex flex-col items-center justify-center bg-zinc-950 text-white p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="mx-auto w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-2xl">
          <span className="text-4xl">🦤</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-medium tracking-tight">Pellito Hub</h1>
          <p className="text-zinc-400">
            The OS version is currently under active development and may be unstable.
          </p>
        </div>

        <div className="pt-4 space-y-4">
          <Link 
            href="https://github.com/ErnestOfGaia/Pellito-Hub" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full bg-white text-black hover:bg-zinc-200 transition-colors py-3 px-6 rounded-lg font-medium"
          >
            <ExternalLink className="w-5 h-5" />
            View Stable Repository
          </Link>
          <p className="text-xs text-zinc-500">
            Stable deployments will be hosted at pelican.ernestofgaia.xyz
          </p>
        </div>
      </div>
    </div>
  );
}
