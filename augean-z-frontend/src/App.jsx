import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import BackgroundSystem from './components/BackgroundSystem';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';
import HeroScene from './components/HeroScene';
import ProblemScene from './components/ProblemScene';
import BreakScene from './components/BreakScene';
import DetectiveScene from './components/DetectiveScene';
import DiscoveryScene from './components/DiscoveryScene';
import VerificationScene from './components/VerificationScene';
import ReconstructionScene from './components/ReconstructionScene';
import FinalScene from './components/FinalScene';
import PipelineModal from './components/PipelineModal';
import DebuggerApp from './components/debugger/DebuggerApp';
import AnalysisResultsPage from './components/AnalysisResultsPage';
import InteractiveDotGrid from './components/InteractiveDotGrid';

gsap.registerPlugin(ScrollTrigger);

// Landing Page Experience Wrapper
function LandingPage() {
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);

  useEffect(() => {
    // Refresh ScrollTrigger when landing page mounts
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030305] text-white selection:bg-purple-900 selection:text-purple-100 overflow-x-hidden">
      {/* Dynamic Background System with Canvas Particles & Atmospheric Vignette */}
      <BackgroundSystem />

      {/* Physics-Based Cursor Force Dot Grid Layer (Full Screen, pointer-events: none) */}
      <div className="fixed inset-0 pointer-events-none z-[12] overflow-hidden">
        <InteractiveDotGrid />
      </div>

      {/* Global Minimal Navigation */}
      <Navbar onOpenPipelineModal={() => setPipelineModalOpen(true)} />

      {/* Vertical Narrative Progress Indicator */}
      <ScrollProgress />

      {/* Main Narrative Progression */}
      <main className="relative z-10 flex flex-col w-full">
        {/* 01: THE VOID & AWAKENING */}
        <HeroScene />

        {/* 02: THE CODE & COMPUTATIONAL CHAOS */}
        <ProblemScene />

        {/* 03: THE BREAK (PINNED 3D CUBE DISINTEGRATION) */}
        <BreakScene />

        {/* 04: DETECTIVE AI & .GRN SHAPE QUERY */}
        <div id="pipeline-section">
          <DetectiveScene />
        </div>

        {/* 05: JULIA COMPILER & MODEL DISCOVERY */}
        <DiscoveryScene />

        {/* 06: LEAN 4 FORMAL VERIFICATION & USER CHOICE */}
        <div id="verification-section">
          <VerificationScene />
        </div>

        {/* 07: RECONSTRUCTION & RUNTIME EXECUTION */}
        <div id="reconstruction-section">
          <ReconstructionScene />
        </div>

        {/* 08: THE CLIMAX & RECONSTRUCTED CUBE FINAL STATE */}
        <FinalScene onOpenPipeline={() => setPipelineModalOpen(true)} />
      </main>

      {/* Full Pipeline Architecture Modal */}
      <PipelineModal
        isOpen={pipelineModalOpen}
        onClose={() => setPipelineModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route /: Cinematic Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Route /app: Main Functional Debugger */}
        <Route path="/app" element={<DebuggerApp />} />

        {/* Route /results: Detailed Code Error & Diagnostics Inspection */}
        <Route path="/results" element={<AnalysisResultsPage />} />
        <Route path="/analysis" element={<AnalysisResultsPage />} />
        <Route path="/analysis-results" element={<AnalysisResultsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
