import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Cpu, Clock } from 'lucide-react';

export default function BottomStatusBar({ metrics, isAnalyzing, currentStage }) {
  const { problems = 0, solved = 0, testsRun = 0, status = 'IDLE' } = metrics || {};

  return (
    <footer className="h-7 w-full bg-[#050508] border-t border-white/[0.06] px-4 flex items-center justify-between text-[11px] font-mono text-zinc-400 select-none z-30">
      {/* Left Metrics */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-zinc-600">PROBLEMS</span>
          <span className="text-zinc-300 font-semibold">{problems}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-600">SOLVED</span>
          <span className="text-purple-300 font-semibold">{solved}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-600">TESTS RUN</span>
          <span className="text-zinc-300 font-semibold">{testsRun}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-600">STATUS</span>
          {status === 'VERIFIED' || status === 'PASSED' ? (
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ● VERIFIED
            </span>
          ) : status === 'FAILED' ? (
            <span className="text-red-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              ✕ FAILED
            </span>
          ) : status === 'ERROR' ? (
            <span className="text-amber-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              ⚠ ERROR
            </span>
          ) : status === 'UNVERIFIED' ? (
            <span className="text-zinc-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              ○ UNVERIFIED
            </span>
          ) : isAnalyzing ? (
            <span className="text-purple-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              PROCESSING [{currentStage}]
            </span>
          ) : (
            <span className="text-zinc-500">STANDBY</span>
          )}
        </div>
      </div>

      {/* Right Environment Metadata */}
      <div className="hidden sm:flex items-center gap-4 text-zinc-600 text-[10px]">
        <span>LEAN 4.2 PROVER</span>
        <span>&bull;</span>
        <span>JULIA SOLVER</span>
        <span>&bull;</span>
        <span>PYTHON 3.12</span>
        <span>&bull;</span>
        <span>UTF-8</span>
      </div>
    </footer>
  );
}
