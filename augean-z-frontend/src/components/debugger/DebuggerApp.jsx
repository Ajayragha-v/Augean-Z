import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Upload, ArrowLeft, RotateCcw, AlertTriangle, Loader2, CheckCircle2, ListTree, Sparkles, Info } from 'lucide-react';
import CodeEditor from './CodeEditor';
import BottomStatusBar from './BottomStatusBar';
import {
  runPipelineAnalysis,
  SAMPLE_BUGGY_CODE,
  PIPELINE_STAGES,
} from '../../services/analysisService';

export default function DebuggerApp() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Core Code State
  const [code, setCode] = useState(SAMPLE_BUGGY_CODE);
  const [fixedCode, setFixedCode] = useState(null);
  const [fileName, setFileName] = useState('lattice_closure.py');
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'diff' | 'fixed'
  const [lastAnalysis, setLastAnalysis] = useState(null);

  // Pipeline Execution State (operates behind the interface)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStageName, setCurrentStageName] = useState('');
  const [stageStatus, setStageStatus] = useState('idle'); // 'idle' | 'processing' | 'completed' | 'failed'
  const [pipelineMetrics, setPipelineMetrics] = useState({
    problems: 3,
    solved: 0,
    testsRun: 0,
    status: 'IDLE',
  });

  // Error simulation toggle for testing failure handling
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Handle Native File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCode(content);
        setFixedCode(null);
        setLastAnalysis(null);
        setStageStatus('idle');
        setPipelineMetrics({
          problems: 3,
          solved: 0,
          testsRun: 0,
          status: 'IDLE',
        });
        setViewMode('editor');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Run Analysis Pipeline
  const handleRunAnalysis = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setStageStatus('processing');
    setFixedCode(null);

    try {
      const result = await runPipelineAnalysis(
        code,
        {
          simulateFailure,
          failAtStage: 'LEAN',
        },
        (progress) => {
          const currentStage = PIPELINE_STAGES[progress.stageIndex]?.label || progress.stage;
          setCurrentStageName(currentStage);
          if (progress.context?.metrics) {
            setPipelineMetrics(progress.context.metrics);
          }
          if (progress.status === 'completed' && progress.context?.fixedCode) {
            setFixedCode(progress.context.fixedCode);
          }
        }
      );

      // Analysis pipeline finished
      const isVerified = result.metrics?.status === 'VERIFIED' || result.metrics?.status === 'PASSED';
      const isUnverified = result.metrics?.status === 'UNVERIFIED';
      setStageStatus(isVerified ? 'completed' : isUnverified ? 'unverified' : 'failed');
      setLastAnalysis(result);
      if (result.fixedCode) {
        setFixedCode(result.fixedCode);
        setViewMode('diff'); // Automatically switch to side-by-side diff
      }
      if (result.metrics) {
        setPipelineMetrics(result.metrics);
      }
    } catch (err) {
      setStageStatus('failed');
      setPipelineMetrics((prev) => ({
        ...prev,
        status: 'FAILED',
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Navigate to detailed Analysis Results Page
  const handleViewAnalysis = () => {
    navigate('/results', {
      state: {
        code,
        fileName,
        fixedCode: fixedCode || lastAnalysis?.fixedCode,
        diagnostics: lastAnalysis?.diagnostics || [],
        metrics: pipelineMetrics,
        tokenUsage: lastAnalysis?.tokenUsage || null,
        solutions: lastAnalysis?.solutions || [],
        testResults: lastAnalysis?.testResults || null,
        verified: lastAnalysis?.verified ?? (pipelineMetrics?.status === 'VERIFIED'),
        leanLog: lastAnalysis?.leanLog || null,
        error: lastAnalysis?.error || null,
        iterations: lastAnalysis?.iterations || 1,
        maxRetries: lastAnalysis?.maxRetries || 5,
        converged: lastAnalysis?.converged ?? true,
        repairHistory: lastAnalysis?.repairHistory || [],
        remainingDiagnostics: lastAnalysis?.remainingDiagnostics || [],
      },
    });
  };

  // Apply fix directly into original code
  const handleApplyFix = () => {
    if (fixedCode) {
      setCode(fixedCode);
      setViewMode('editor');
    }
  };

  // Reset to default sample
  const handleResetSample = () => {
    setCode(SAMPLE_BUGGY_CODE);
    setFixedCode(null);
    setFileName('lattice_closure.py');
    setStageStatus('idle');
    setPipelineMetrics({
      problems: 3,
      solved: 0,
      testsRun: 0,
      status: 'IDLE',
    });
    setViewMode('editor');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#040407] text-white overflow-hidden font-sans">
      {/* TOP NAVBAR */}
      <header className="h-14 px-4 md:px-6 bg-[#08080f] border-b border-white/[0.07] flex items-center justify-between select-none z-20 shrink-0">
        {/* Left: Brand Identity & Route Back */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs font-mono"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LANDING</span>
          </button>

          <div className="h-4 w-[1px] bg-white/[0.08]" />

          <div className="flex items-center gap-2">
            <span className="font-display font-bold tracking-wider text-base text-white">
              AUGEAN<span className="text-purple-400 font-light">-Z</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30">
              DEBUGGER
            </span>
          </div>
        </div>

        {/* Center: Ephemeral Pipeline State (Only visible while analyzing or on status update) */}
        <div className="flex items-center">
          {isAnalyzing && (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-purple-950/40 border border-purple-500/30 text-purple-200 font-mono text-[11px] animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span className="text-zinc-400">ANALYZING:</span>
              <span className="text-purple-300 font-semibold">{currentStageName}</span>
            </div>
          )}

          {!isAnalyzing && stageStatus === 'completed' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>VERIFIED</span>
            </div>
          )}

          {!isAnalyzing && (stageStatus === 'unverified' || pipelineMetrics?.status === 'UNVERIFIED') && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900/80 border border-white/[0.12] text-zinc-300 font-mono text-[11px]">
              <Info className="w-3.5 h-3.5 text-zinc-400" />
              <span>UNVERIFIED (NO TEST SUITE)</span>
            </div>
          )}

          {!isAnalyzing && stageStatus === 'failed' && pipelineMetrics?.status !== 'UNVERIFIED' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>{simulateFailure ? 'VERIFICATION FAILED: LEAN' : pipelineMetrics?.status === 'ERROR' ? 'VERIFICATION ERROR' : 'TESTS FAILED'}</span>
            </div>
          )}
        </div>

        {/* Right: Upload & Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Hidden Native File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".py,.txt"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>+ Upload Python</span>
          </button>

          <button
            onClick={handleResetSample}
            className="p-1.5 rounded bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors"
            title="Reset Sample Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Test Error Handling Switch */}
          <button
            onClick={() => setSimulateFailure(!simulateFailure)}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono border transition-colors ${
              simulateFailure
                ? 'bg-red-950/40 border-red-500/40 text-red-300'
                : 'bg-black/40 border-white/[0.06] text-zinc-500 hover:text-zinc-300'
            }`}
            title="Simulate formal verification failure"
          >
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>Fail Test: {simulateFailure ? 'ON' : 'OFF'}</span>
          </button>

          {/* View Analysis Results Button */}
          {lastAnalysis && (
            <button
              onClick={handleViewAnalysis}
              className="px-3 py-1.5 rounded bg-purple-950/70 hover:bg-purple-900 border border-purple-500/50 text-xs font-mono text-purple-200 hover:text-white flex items-center gap-1.5 transition-colors shadow-sm"
              title="Inspect detected problems, code locations, and suggestions"
            >
              <ListTree className="w-3.5 h-3.5 text-purple-300" />
              <span>View Analysis</span>
            </button>
          )}

          {/* Primary Action Button */}
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className={`px-4 py-2 rounded font-mono text-xs font-medium tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${
              isAnalyzing
                ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(157,78,221,0.4)] border border-purple-400'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isAnalyzing ? 'animate-pulse' : ''}`} />
            <span>{isAnalyzing ? 'ANALYZING...' : 'RUN ANALYSIS'}</span>
          </button>
        </div>
      </header>

      {/* CODE WORKSPACE — Dominant Centerpiece with Maximized Vertical Space */}
      <main className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden bg-[#030305]">
        <CodeEditor
          code={code}
          onChange={setCode}
          fixedCode={fixedCode}
          isAnalyzing={isAnalyzing}
          viewMode={viewMode}
          setViewMode={setViewMode}
          fileName={fileName}
          onApplyFix={handleApplyFix}
        />
      </main>

      {/* BOTTOM STATUS BAR */}
      <BottomStatusBar
        metrics={pipelineMetrics}
        isAnalyzing={isAnalyzing}
        currentStage={currentStageName}
      />
    </div>
  );
}
