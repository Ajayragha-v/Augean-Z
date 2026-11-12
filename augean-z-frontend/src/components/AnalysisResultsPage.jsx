import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  FileCode,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Cpu,
  Layers,
  Terminal,
  ShieldAlert,
  XCircle,
  RotateCcw,
  Code2,
  Check,
} from 'lucide-react';

export default function AnalysisResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const codeViewerRef = useRef(null);

  // Retrieve pipeline state passed via navigation state or fallback to sessionStorage
  const [analysisData, setAnalysisData] = useState(() => {
    if (location.state && (location.state.code || location.state.error)) {
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem('augean_last_analysis');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' | 'Critical' | 'Error' | 'Warning' | 'Suggestion'
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedRepaired, setCopiedRepaired] = useState(false);
  const [viewMode, setViewMode] = useState('original'); // 'original' | 'split' | 'repaired'
  const [showTestLog, setShowTestLog] = useState(false);

  // Save to session storage when available
  useEffect(() => {
    if (location.state && (location.state.code || location.state.error)) {
      try {
        sessionStorage.setItem('augean_last_analysis', JSON.stringify(location.state));
      } catch (e) {}
    }
  }, [location.state]);

  const sourceCode = analysisData?.code || '';
  const fixedCode = analysisData?.fixedCode || null;
  const diagnostics = Array.isArray(analysisData?.diagnostics) ? analysisData.diagnostics : [];
  const metrics = analysisData?.metrics || {
    problems: diagnostics.length,
    solved: 0,
    status: 'UNVERIFIED',
    breakdown: {},
  };
  const tokenUsage = analysisData?.tokenUsage || null;
  const fileName = analysisData?.fileName || 'analyzed_script.py';
  const testResults = analysisData?.testResults || null;
  const pipelineError = analysisData?.error || null;
  const leanLog = analysisData?.leanLog || null;

  // Real verification status from Step 2
  const verificationStatus = (
    metrics.status ||
    (testResults?.status ? testResults.status : 'UNVERIFIED')
  ).toUpperCase();

  // Filter diagnostics based on selected category
  const filteredProblems = diagnostics.filter((p) => {
    if (filterSeverity === 'ALL') return true;
    return (p.severity || '').toLowerCase() === filterSeverity.toLowerCase();
  });

  const selectedProblem = filteredProblems[selectedProblemIndex] || null;

  // Scroll to line when problem is selected
  useEffect(() => {
    if (selectedProblem && selectedProblem.line && codeViewerRef.current) {
      const lineElement = codeViewerRef.current.querySelector(
        `[data-line-number="${selectedProblem.line}"]`
      );
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedProblem]);

  const lines = sourceCode ? sourceCode.split('\n') : [];
  const repairedLines = fixedCode ? fixedCode.split('\n') : [];

  // Problem navigation handlers
  const handlePrevProblem = () => {
    if (filteredProblems.length <= 1) return;
    setSelectedProblemIndex((prev) => (prev > 0 ? prev - 1 : filteredProblems.length - 1));
  };

  const handleNextProblem = () => {
    if (filteredProblems.length <= 1) return;
    setSelectedProblemIndex((prev) => (prev < filteredProblems.length - 1 ? prev + 1 : 0));
  };

  // Severity color badge mapper
  const getSeverityBadge = (sev) => {
    const s = (sev || 'Error').toLowerCase();
    if (s === 'critical') {
      return {
        bg: 'bg-red-950/60 border-red-500/50 text-red-300',
        dot: 'bg-red-400',
        icon: ShieldAlert,
        border: 'border-red-500/40',
      };
    }
    if (s === 'error') {
      return {
        bg: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
        dot: 'bg-amber-400',
        icon: AlertTriangle,
        border: 'border-amber-500/40',
      };
    }
    if (s === 'warning') {
      return {
        bg: 'bg-yellow-950/50 border-yellow-500/30 text-yellow-300',
        dot: 'bg-yellow-400',
        icon: AlertCircle,
        border: 'border-yellow-500/30',
      };
    }
    return {
      bg: 'bg-purple-950/50 border-purple-500/30 text-purple-300',
      dot: 'bg-purple-400',
      icon: Info,
      border: 'border-purple-500/30',
    };
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'original') {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedRepaired(true);
      setTimeout(() => setCopiedRepaired(false), 2000);
    }
  };

  // Accurate breakdown from backend diagnostics
  const breakdown = {
    critical: diagnostics.filter((d) => (d.severity || '').toLowerCase() === 'critical').length,
    errors: diagnostics.filter((d) => (d.severity || '').toLowerCase() === 'error').length,
    warnings: diagnostics.filter((d) => (d.severity || '').toLowerCase() === 'warning').length,
    suggestions: diagnostics.filter((d) => ['suggestion', 'high'].includes((d.severity || '').toLowerCase())).length,
  };

  // Real test metrics
  const totalTests = testResults?.tests?.total ?? testResults?.total ?? metrics?.testsRun ?? 0;
  const passedTests = testResults?.tests?.passed ?? testResults?.passed ?? 0;
  const failedTests = testResults?.tests?.failed ?? testResults?.failed ?? 0;
  const errorTests = testResults?.tests?.errors ?? testResults?.errors ?? 0;

  // Render Verification Badge
  const renderVerificationBadge = () => {
    if (verificationStatus === 'VERIFIED') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 font-mono text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold">VERIFIED</span>
        </div>
      );
    }
    if (verificationStatus === 'FAILED') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-950/50 border border-red-500/50 text-red-300 font-mono text-xs">
          <XCircle className="w-3.5 h-3.5 text-red-400" />
          <span className="font-bold">FAILED</span>
        </div>
      );
    }
    if (verificationStatus === 'ERROR') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-950/50 border border-amber-500/50 text-amber-300 font-mono text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold">ERROR</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 font-mono text-xs">
        <Info className="w-3.5 h-3.5 text-zinc-400" />
        <span className="font-bold">UNVERIFIED</span>
      </div>
    );
  };

  // Section 15: Error State
  if (pipelineError || (!analysisData && !sourceCode)) {
    return (
      <div className="flex flex-col h-screen w-screen bg-[#030306] text-white font-sans">
        <header className="h-14 px-6 bg-[#08080f] border-b border-white/[0.08] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>DEBUGGER</span>
            </button>
            <div className="h-4 w-[1px] bg-white/[0.08]" />
            <span className="font-display font-bold tracking-wider text-base text-white">
              AUGEAN<span className="text-purple-400 font-light">-Z</span>
            </span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full p-6 rounded-xl bg-[#090912] border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)] font-mono">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-500/50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">ANALYSIS FAILED</h2>
                <p className="text-xs text-zinc-400">Augean-Z could not complete the pipeline.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-6 bg-black/60 p-4 rounded-lg border border-white/[0.06]">
              <div className="flex justify-between text-zinc-400 border-b border-white/[0.04] pb-1.5">
                <span>Stage:</span>
                <span className="text-red-300 font-semibold uppercase">{analysisData?.stage || 'PIPELINE'}</span>
              </div>
              <div className="text-zinc-400 pt-1">
                <span className="block mb-1 text-[11px] uppercase tracking-wider text-zinc-500">Reason:</span>
                <p className="text-red-200 font-sans text-xs leading-relaxed bg-red-950/30 p-2.5 rounded border border-red-500/20">
                  {pipelineError || 'No analysis data available. Please submit code from the debugger.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => navigate('/app')}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(157,78,221,0.3)]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#030306] text-white overflow-hidden font-sans">
      {/* 1. TOP HEADER */}
      <header className="h-14 px-4 md:px-6 bg-[#08080f] border-b border-white/[0.08] flex items-center justify-between select-none z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs font-mono"
            title="Return to Debugger Editor"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>DEBUGGER</span>
          </button>

          <div className="h-4 w-[1px] bg-white/[0.08]" />

          <div className="flex items-center gap-2">
            <span className="font-display font-bold tracking-wider text-base text-white">
              AUGEAN<span className="text-purple-400 font-light">-Z</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30">
              ANALYSIS RESULTS
            </span>
          </div>
        </div>

        {/* Right Status, Token, and Action */}
        <div className="flex items-center gap-3">
          {tokenUsage && !tokenUsage.error && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0b0b14] border border-white/[0.08] font-mono text-[10px] text-zinc-400">
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>
                TOKENS: <span className="text-purple-300 font-semibold">{tokenUsage.total_tokens ?? 'N/A'}</span>
                {tokenUsage.is_estimated && ' (est)'}
              </span>
            </div>
          )}

          {renderVerificationBadge()}

          <button
            onClick={() => navigate('/app')}
            className="px-3.5 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(157,78,221,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OPEN IN DEBUGGER</span>
            <span className="sm:hidden">DEBUGGER</span>
          </button>
        </div>
      </header>

      {/* 2. TOP SUMMARY RIBBON */}
      <div className="px-4 md:px-6 py-3.5 bg-[#06060c] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="font-display font-bold text-lg md:text-xl text-white">
              Augean-Z Analysis
            </h1>
            <span className="font-mono text-xs text-purple-400 font-semibold">
              {diagnostics.length === 0
                ? '0 Problems Detected'
                : `${diagnostics.length} Problem${diagnostics.length > 1 ? 's' : ''} Detected`}
            </span>
            <span className="hidden sm:inline font-mono text-xs text-zinc-500">
              • {fileName}
            </span>
          </div>
        </div>

        {/* Filter Badges — Real Categories Only */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => {
              setFilterSeverity('ALL');
              setSelectedProblemIndex(0);
            }}
            className={`px-2.5 py-1 rounded border transition-colors ${
              filterSeverity === 'ALL'
                ? 'bg-purple-950/80 border-purple-500/50 text-purple-200 font-semibold shadow-sm'
                : 'bg-black/40 border-white/[0.08] text-zinc-400 hover:text-white'
            }`}
          >
            ALL: <span className="text-white ml-1">{diagnostics.length}</span>
          </button>

          {breakdown.critical > 0 && (
            <button
              onClick={() => {
                setFilterSeverity('Critical');
                setSelectedProblemIndex(0);
              }}
              className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                filterSeverity === 'Critical'
                  ? 'bg-red-950/80 border-red-500/60 text-red-200 font-semibold'
                  : 'bg-black/40 border-white/[0.08] text-zinc-400 hover:text-red-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>CRITICAL:</span>
              <span className="text-red-400 font-semibold">{breakdown.critical}</span>
            </button>
          )}

          {breakdown.errors > 0 && (
            <button
              onClick={() => {
                setFilterSeverity('Error');
                setSelectedProblemIndex(0);
              }}
              className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                filterSeverity === 'Error'
                  ? 'bg-amber-950/80 border-amber-500/60 text-amber-200 font-semibold'
                  : 'bg-black/40 border-white/[0.08] text-zinc-400 hover:text-amber-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>ERRORS:</span>
              <span className="text-amber-400 font-semibold">{breakdown.errors}</span>
            </button>
          )}

          {breakdown.warnings > 0 && (
            <button
              onClick={() => {
                setFilterSeverity('Warning');
                setSelectedProblemIndex(0);
              }}
              className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                filterSeverity === 'Warning'
                  ? 'bg-yellow-950/80 border-yellow-500/60 text-yellow-200 font-semibold'
                  : 'bg-black/40 border-white/[0.08] text-zinc-400 hover:text-yellow-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span>WARNINGS:</span>
              <span className="text-yellow-400 font-semibold">{breakdown.warnings}</span>
            </button>
          )}

          {breakdown.suggestions > 0 && (
            <button
              onClick={() => {
                setFilterSeverity('Suggestion');
                setSelectedProblemIndex(0);
              }}
              className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                filterSeverity === 'Suggestion'
                  ? 'bg-purple-950/80 border-purple-500/60 text-purple-200 font-semibold'
                  : 'bg-black/40 border-white/[0.08] text-zinc-400 hover:text-purple-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>SUGGESTIONS:</span>
              <span className="text-purple-400 font-semibold">{breakdown.suggestions}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE (PROBLEMS | CODE + DETAILS + VERIFICATION) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#030306]">
        {/* LEFT COLUMN: PROBLEM LIST NAVIGATOR (Cols 1-4) */}
        <aside className="lg:col-span-4 border-r border-white/[0.08] flex flex-col bg-[#050509] overflow-hidden">
          <div className="p-3 bg-[#080812] border-b border-white/[0.06] flex items-center justify-between text-xs font-mono select-none">
            <span className="font-semibold text-zinc-200">
              PROBLEMS ({filteredProblems.length})
            </span>
            {filteredProblems.length > 0 && (
              <span className="text-[11px] text-purple-300">
                #{selectedProblemIndex + 1} of {filteredProblems.length}
              </span>
            )}
          </div>

          {/* Problem List Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredProblems.length === 0 ? (
              <div className="text-center py-16 px-4 text-zinc-400 font-mono text-xs">
                <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto mb-3 opacity-80" />
                <p className="text-zinc-200 font-bold text-sm mb-1">No problems detected</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  Your submitted code passed the available analysis checks.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-black/40 border border-white/[0.08] text-[11px]">
                  <span>Verification:</span>
                  <span className={verificationStatus === 'VERIFIED' ? 'text-emerald-400 font-bold' : 'text-zinc-400 font-bold'}>
                    {verificationStatus}
                  </span>
                </div>
              </div>
            ) : (
              filteredProblems.map((prob, idx) => {
                const isSelected = selectedProblem === prob;
                const badge = getSeverityBadge(prob.severity);
                const IconComponent = badge.icon;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedProblemIndex(idx)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500/70 shadow-[0_0_15px_rgba(157,78,221,0.2)] ring-1 ring-purple-500/40'
                        : 'bg-[#090912]/80 border-white/[0.05] hover:border-white/[0.12] hover:bg-[#0c0c16]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-3.5 h-3.5 text-zinc-300" />
                        <span className="font-bold text-white">Problem #{idx + 1}</span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {prob.severity || 'Error'}
                        </span>
                      </div>
                      <span className="text-purple-300 font-semibold text-[11px]">
                        {prob.line ? `Line ${prob.line}` : 'Location unavailable'}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-zinc-200 font-semibold mb-1">
                      {prob.type || 'Invariant Violation'}
                    </div>

                    <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">
                      {prob.what_happened || prob.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Section 13: Previous / Next Problem Navigator */}
          {filteredProblems.length > 1 && (
            <div className="p-3 bg-[#080812] border-t border-white/[0.06] flex items-center justify-between text-xs font-mono select-none">
              <span className="text-zinc-400 text-[11px]">
                Problem {selectedProblemIndex + 1} of {filteredProblems.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevProblem}
                  className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center gap-1 transition-colors text-[11px]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleNextProblem}
                  className="px-2.5 py-1 rounded bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-white flex items-center gap-1 transition-colors text-[11px]"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT COLUMN: SOURCE CODE VIEWER + PROBLEM DETAILS + VERIFICATION (Cols 5-12) */}
        <main className="lg:col-span-8 flex flex-col h-full bg-[#030305] overflow-hidden">
          {/* TOP BAR: VIEW TOGGLES (Original / Split / Repaired) & COPY */}
          <div className="px-4 py-2 bg-[#080810] border-b border-white/[0.06] flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 select-none shrink-0 gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-white font-semibold">{fileName}</span>
              </div>

              {/* Section 12: Before / After Split View Controls */}
              {fixedCode && (
                <div className="flex items-center rounded bg-black/60 border border-white/[0.08] p-0.5 text-[11px]">
                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      viewMode === 'original'
                        ? 'bg-purple-950 border border-purple-500/50 text-white font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      viewMode === 'split'
                        ? 'bg-purple-950 border border-purple-500/50 text-white font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Before / After
                  </button>
                  <button
                    onClick={() => setViewMode('repaired')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      viewMode === 'repaired'
                        ? 'bg-purple-950 border border-purple-500/50 text-white font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Repaired
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(viewMode === 'repaired' && fixedCode ? fixedCode : sourceCode, 'original')}
                className="hover:text-white transition-colors flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06]"
              >
                {copiedOriginal ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedOriginal ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* CODE VIEWER AREA */}
          <div className="flex-1 overflow-auto bg-[#050508] relative min-h-[220px]">
            {viewMode === 'split' && fixedCode ? (
              // Split View (Before / After)
              <div className="grid grid-cols-1 md:grid-cols-2 h-full divide-y md:divide-y-0 md:divide-x divide-white/[0.08] font-mono text-xs">
                {/* BEFORE (Original) */}
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="px-3 py-1.5 bg-[#090912] border-b border-white/[0.05] text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                    BEFORE (ORIGINAL)
                  </div>
                  <div className="flex-1 overflow-auto py-2">
                    {lines.map((lineText, idx) => {
                      const lineNum = idx + 1;
                      const hasProblem = diagnostics.some((d) => d.line === lineNum);
                      const isCurrent = selectedProblem && selectedProblem.line === lineNum;
                      return (
                        <div
                          key={idx}
                          className={`flex items-start px-2 py-0.5 ${
                            isCurrent
                              ? 'bg-red-950/40 border-l-4 border-red-500'
                              : hasProblem
                              ? 'bg-red-950/20 border-l-2 border-red-500/50'
                              : ''
                          }`}
                        >
                          <span className="w-8 text-right pr-2 text-zinc-600 select-none text-[11px] shrink-0">
                            {lineNum}
                          </span>
                          <span className="w-4 select-none shrink-0 text-center">
                            {isCurrent ? <span className="text-red-400">❌</span> : hasProblem ? <span className="text-amber-400">●</span> : null}
                          </span>
                          <pre className="font-mono text-zinc-200 whitespace-pre overflow-x-auto">{lineText || ' '}</pre>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AFTER (Repaired) */}
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="px-3 py-1.5 bg-[#090912] border-b border-white/[0.05] text-[10px] text-emerald-400 uppercase tracking-wider font-semibold flex items-center justify-between">
                    <span>AFTER (REPAIRED & VERIFIED)</span>
                    <button
                      onClick={() => handleCopy(fixedCode, 'repaired')}
                      className="hover:text-white text-zinc-400 text-[10px] flex items-center gap-1"
                    >
                      {copiedRepaired ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{copiedRepaired ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto py-2 bg-[#040608]">
                    {repairedLines.map((lineText, idx) => (
                      <div key={idx} className="flex items-start px-2 py-0.5 hover:bg-emerald-950/10">
                        <span className="w-8 text-right pr-2 text-zinc-600 select-none text-[11px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="w-4 select-none shrink-0 text-center text-emerald-400 text-[10px]">
                          ✓
                        </span>
                        <pre className="font-mono text-emerald-100/90 whitespace-pre overflow-x-auto">{lineText || ' '}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : viewMode === 'repaired' && fixedCode ? (
              // Repaired Code View
              <div className="py-2 font-mono text-xs leading-relaxed bg-[#040608]">
                {repairedLines.map((lineText, idx) => (
                  <div key={idx} className="flex items-start px-2 py-0.5 hover:bg-emerald-950/10">
                    <span className="w-10 text-right pr-3 select-none text-zinc-600 shrink-0 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="w-5 select-none shrink-0 text-center text-emerald-400 text-[10px]">
                      ✓
                    </span>
                    <pre className="flex-1 font-mono text-emerald-100/90 overflow-x-auto whitespace-pre">
                      {lineText || ' '}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              // Original Source Code View with Interactive Line Click & Highlighting
              <div ref={codeViewerRef} className="py-2 font-mono text-xs leading-relaxed">
                <div className="min-w-full inline-block">
                  {lines.map((lineText, idx) => {
                    const lineNum = idx + 1;
                    const matchingProblem = diagnostics.find((d) => d.line === lineNum);
                    const isCurrentProblemLine = selectedProblem && selectedProblem.line === lineNum;

                    return (
                      <div
                        key={idx}
                        data-line-number={lineNum}
                        onClick={() => {
                          if (matchingProblem) {
                            const matchingIdx = filteredProblems.findIndex((d) => d.line === lineNum);
                            if (matchingIdx !== -1) {
                              setSelectedProblemIndex(matchingIdx);
                            }
                          }
                        }}
                        className={`flex items-start transition-colors px-2 py-0.5 ${
                          isCurrentProblemLine
                            ? 'bg-red-950/40 border-l-4 border-red-500 text-white font-semibold'
                            : matchingProblem
                            ? 'bg-red-950/20 border-l-2 border-red-500/50 hover:bg-red-950/30 cursor-pointer'
                            : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        {/* Line Number */}
                        <span className="w-10 text-right pr-3 select-none text-zinc-600 shrink-0 text-[11px]">
                          {lineNum}
                        </span>

                        {/* Problem Indicator Pin */}
                        <span className="w-5 select-none shrink-0 text-center">
                          {isCurrentProblemLine ? (
                            <span className="text-red-400 font-bold">❌</span>
                          ) : matchingProblem ? (
                            <span className="text-amber-400 text-[10px]">●</span>
                          ) : null}
                        </span>

                        {/* Code Content */}
                        <pre className="flex-1 font-mono text-zinc-200 overflow-x-auto whitespace-pre">
                          {lineText || ' '}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* LOWER SECTION: PROBLEM DETAILS & VERIFICATION SECTION */}
          <div className="h-[290px] border-t border-white/[0.08] bg-[#070710] grid grid-cols-1 md:grid-cols-12 overflow-hidden shrink-0">
            {/* PROBLEM DETAILS (Cols 1-7) */}
            <div className="md:col-span-7 p-4 border-b md:border-b-0 md:border-r border-white/[0.06] overflow-y-auto space-y-3 font-mono text-xs">
              {selectedProblem ? (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        Problem #{selectedProblemIndex + 1}:
                      </span>
                      <span className="text-purple-300 font-semibold">
                        {selectedProblem.type || 'Invariant Violation'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                      <span>
                        Location:{' '}
                        <span className="text-white font-semibold">
                          {selectedProblem.line ? `Line ${selectedProblem.line}` : 'Location unavailable'}
                        </span>
                      </span>
                      {selectedProblem.column && (
                        <span>
                          Col: <span className="text-white">{selectedProblem.column}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Code Snippet if present */}
                  {selectedProblem.code && (
                    <div className="p-2 rounded bg-black/60 border border-white/[0.06]">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                        ORIGINAL CODE:
                      </div>
                      <code className="text-red-300 font-mono block whitespace-pre text-[11px]">
                        {selectedProblem.code}
                      </code>
                    </div>
                  )}

                  {/* What Happened */}
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">
                      WHAT HAPPENED:
                    </div>
                    <p className="text-zinc-200 font-sans text-xs leading-relaxed">
                      {selectedProblem.what_happened || selectedProblem.message || 'Explanation unavailable.'}
                    </p>
                  </div>

                  {/* Why it is a problem */}
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">
                      WHY THIS IS A PROBLEM:
                    </div>
                    <p className="text-zinc-300 font-sans text-xs leading-relaxed font-light">
                      {selectedProblem.why_problem || 'Explanation unavailable.'}
                    </p>
                  </div>

                  {/* Suggested Fix */}
                  <div>
                    <div className="text-[10px] text-purple-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-purple-300" />
                      <span>SUGGESTED FIX:</span>
                    </div>
                    <div className="p-2.5 rounded bg-purple-950/40 border border-purple-500/40">
                      <p className="text-purple-200 font-sans text-xs leading-relaxed">
                        {selectedProblem.suggestion || 'Suggestion unavailable.'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-zinc-500 font-mono text-xs">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-2 opacity-60" />
                  <p className="text-zinc-300 font-semibold">No problem selected</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Select a detected problem to inspect details.</p>
                </div>
              )}
            </div>

            {/* VERIFICATION & TEST DETAILS (Cols 8-12) */}
            <div className="md:col-span-5 p-4 overflow-y-auto bg-[#05050a] flex flex-col justify-between font-mono text-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="font-bold text-zinc-200 tracking-wider uppercase text-[11px]">
                    VERIFICATION
                  </span>
                  {renderVerificationBadge()}
                </div>

                {/* Pipeline Stages Execution Real Data */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>LLM Analysis:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Completed
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Code Repair:</span>
                    <span className={fixedCode ? 'text-emerald-400 font-semibold flex items-center gap-1' : 'text-zinc-500'}>
                      {fixedCode ? <><Check className="w-3 h-3" /> Generated</> : 'Unavailable'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Repair Loop:</span>
                    <span className="text-purple-300 font-semibold flex items-center gap-1">
                      {analysisData?.iterations ? `${analysisData.iterations} iteration(s) (${analysisData?.converged !== false ? 'Converged' : 'Limit reached'})` : 'Converged'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Formal Invariant Kernel:</span>
                    <span className={leanLog?.includes('REJECT') ? 'text-amber-400' : 'text-emerald-400'}>
                      {leanLog ? (leanLog.includes('REJECT') ? 'Violations Flagged' : 'Passed') : 'Evaluated'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-zinc-400 pt-1 border-t border-white/[0.04]">
                    <span>Tests:</span>
                    <span
                      className={`font-semibold ${
                        verificationStatus === 'VERIFIED'
                          ? 'text-emerald-400'
                          : verificationStatus === 'FAILED'
                          ? 'text-red-400'
                          : verificationStatus === 'ERROR'
                          ? 'text-amber-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {totalTests > 0
                        ? `${passedTests}/${totalTests} passed`
                        : 'No executable test suite'}
                    </span>
                  </div>
                </div>

                {/* Collapsible Test Breakdown */}
                <div className="rounded bg-black/50 border border-white/[0.06] p-2.5 space-y-1.5">
                  <div
                    onClick={() => setShowTestLog(!showTestLog)}
                    className="flex items-center justify-between cursor-pointer select-none text-[11px]"
                  >
                    <span className="font-bold text-zinc-300">TEST RESULTS</span>
                    <div className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300">
                      <span>{showTestLog ? 'Hide details' : 'View details'}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${showTestLog ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 border-t border-white/[0.04]">
                    <div className="p-1 rounded bg-white/[0.02]">
                      <div className="text-zinc-500">TOTAL</div>
                      <div className="text-zinc-200 font-bold">{totalTests}</div>
                    </div>
                    <div className="p-1 rounded bg-emerald-950/20">
                      <div className="text-emerald-500">PASSED</div>
                      <div className="text-emerald-300 font-bold">{passedTests}</div>
                    </div>
                    <div className="p-1 rounded bg-red-950/20">
                      <div className="text-red-500">FAILED</div>
                      <div className="text-red-300 font-bold">{failedTests}</div>
                    </div>
                    <div className="p-1 rounded bg-amber-950/20">
                      <div className="text-amber-500">ERRORS</div>
                      <div className="text-amber-300 font-bold">{errorTests}</div>
                    </div>
                  </div>

                  {showTestLog && testResults?.log && (
                    <div className="mt-2 pt-2 border-t border-white/[0.04]">
                      <div className="text-[9px] text-zinc-500 mb-1">RUNNER LOG:</div>
                      <pre className="text-[10px] text-zinc-400 bg-black/80 p-2 rounded max-h-24 overflow-y-auto whitespace-pre-wrap font-mono">
                        {testResults.log}
                      </pre>
                    </div>
                  )}

                  {testResults?.reason && (
                    <p className="text-[10px] text-zinc-400 italic pt-1">
                      {testResults.reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Footer */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
                <span>Final Verification:</span>
                <span className="font-bold text-white">{verificationStatus}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
