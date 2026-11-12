import React from 'react';
import { Cpu, ShieldCheck, CheckCircle2, XCircle, Share2, Binary, ChevronDown, ChevronUp } from 'lucide-react';

export default function StageInspector({
  context,
  currentStage,
  stageStatus,
  isExpanded,
  onToggleExpand,
}) {
  const { targetTopos, solutions, metrics } = context || {};

  if (stageStatus === 'idle' && !solutions?.length) {
    return null;
  }

  return (
    <div className="w-full bg-[#08080f] border border-white/[0.06] rounded-lg overflow-hidden select-none">
      {/* Header Bar */}
      <button
        onClick={onToggleExpand}
        className="w-full px-4 py-2 bg-[#0c0c14] border-b border-white/[0.05] flex items-center justify-between text-xs font-mono text-zinc-400 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <Binary className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-semibold text-zinc-300">STAGE ARTIFACTS &amp; MODEL INSPECTION</span>
          {solutions?.length > 0 && (
            <span className="text-[10px] text-purple-300 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30">
              {solutions.length} CANDIDATES
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-zinc-500">
          <span>{isExpanded ? 'COLLAPSE' : 'EXPAND'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Artifact 1: Target Topos Graph */}
          <div className="p-3 rounded bg-black/60 border border-white/[0.05] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 font-semibold flex items-center gap-1.5">
                <Share2 className="w-3 h-3 text-purple-400" /> TARGET TOPOS
              </span>
              <span className="text-[9px] text-purple-400 bg-purple-950/50 px-1.5 py-0.5 rounded">FinSet-Cat</span>
            </div>

            <div className="h-20 w-full flex items-center justify-center bg-[#050508] rounded border border-white/[0.03]">
              <svg viewBox="0 0 160 60" className="w-36 h-14">
                <line x1="25" y1="30" x2="80" y2="30" stroke="#9d4edd" strokeWidth="1.5" />
                <line x1="80" y1="30" x2="135" y2="30" stroke="#9d4edd" strokeWidth="1.5" />
                <circle cx="25" cy="30" r="8" fill="#0c0c16" stroke="#c77dff" strokeWidth="1.5" />
                <circle cx="80" cy="30" r="8" fill="#0c0c16" stroke="#c77dff" strokeWidth="1.5" />
                <circle cx="135" cy="30" r="8" fill="#0c0c16" stroke="#c77dff" strokeWidth="1.5" />
                <text x="21" y="34" fill="#ffffff" fontSize="9" fontFamily="monospace">A</text>
                <text x="76" y="34" fill="#ffffff" fontSize="9" fontFamily="monospace">B</text>
                <text x="131" y="34" fill="#ffffff" fontSize="9" fontFamily="monospace">C</text>
                <text x="48" y="22" fill="#c77dff" fontSize="8" fontFamily="monospace">f</text>
                <text x="104" y="22" fill="#c77dff" fontSize="8" fontFamily="monospace">g</text>
              </svg>
            </div>
            <div className="text-[9px] text-zinc-500 mt-2">Commutative square invariant verified</div>
          </div>

          {/* Artifact 2: Solutions & Lean Verification Table */}
          <div className="p-3 rounded bg-black/60 border border-white/[0.05] md:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> LEAN VERIFICATION STATUS
              </span>
              <span className="text-[9px] text-zinc-500">KERNEL K-3.8</span>
            </div>

            <div className="space-y-1.5">
              {solutions?.length ? (
                solutions.map((sol) => (
                  <div
                    key={sol.id}
                    className="flex items-center justify-between p-1.5 rounded bg-[#0b0b14] border border-white/[0.04] text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{sol.id}</span>
                      <span className="text-zinc-400">{sol.name}</span>
                      <span className="text-[9px] text-zinc-600">({sol.complexity})</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {sol.status === 'verified' && (
                        <span className="text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/40 flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-purple-300" /> VERIFIED
                        </span>
                      )}
                      {sol.status === 'rejected' && (
                        <span className="text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1 text-[10px]">
                          <XCircle className="w-3 h-3 text-red-400" /> REJECTED
                        </span>
                      )}
                      {sol.status === 'candidate' && (
                        <span className="text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded text-[10px]">
                          CANDIDATE
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-zinc-600 text-center py-4">Awaiting solution generation...</div>
              )}
            </div>

            {((metrics?.status === 'VERIFIED' || metrics?.status === 'PASSED') && (context?.testResults?.verified === true || metrics?.solved > 0) && ((context?.testResults?.tests?.passed || context?.testResults?.passed || metrics?.testsRun || 0) > 0) && (context?.testResults?.tests?.failed || context?.testResults?.failed || 0) === 0 && (context?.testResults?.tests?.errors || context?.testResults?.errors || 0) === 0) ? (
              <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>🟢 GREEN FLAG: All {context?.testResults?.tests?.passed ?? context?.testResults?.passed ?? metrics?.testsRun} dynamic test assertions passed with zero structural invariant violations.</span>
              </div>
            ) : metrics?.status === 'FAILED' ? (
              <div className="mt-2 text-[10px] text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>🔴 VERIFICATION FAILED: {context?.testResults?.tests?.failed ?? context?.testResults?.failed ?? 1} test assertion(s) failed.</span>
              </div>
            ) : metrics?.status === 'ERROR' ? (
              <div className="mt-2 text-[10px] text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>⚠️ VERIFICATION ERROR: {context?.testResults?.error || context?.testResults?.message || 'Test execution could not complete.'}</span>
              </div>
            ) : metrics?.status === 'UNVERIFIED' ? (
              <div className="mt-2 text-[10px] text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-500" />
                <span>⚪ UNVERIFIED: No meaningful executable test suite available for this routine.</span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
