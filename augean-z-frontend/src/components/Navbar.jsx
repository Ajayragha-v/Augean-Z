import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function Navbar({ onOpenPipelineModal }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let lastScrolled = false;
    const handleScroll = () => {
      const isScrolled = window.scrollY > 40;
      if (isScrolled !== lastScrolled) {
        lastScrolled = isScrolled;
        setScrolled(isScrolled);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#050508]/85 backdrop-blur-md border-b border-white/[0.06] py-3.5 shadow-2xl shadow-black/80'
          : 'bg-transparent border-b border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-4 h-4 flex items-center justify-center">
            <div className="w-2 h-2 bg-purple-500 rounded-sm rotate-45 group-hover:scale-125 transition-transform duration-300 shadow-[0_0_10px_#9d4edd]" />
            <div className="absolute inset-0 border border-purple-500/30 rounded-sm rotate-45 animate-ping opacity-25" />
          </div>
          <span className="font-display font-bold tracking-[0.22em] text-sm md:text-base text-white/95 group-hover:text-purple-300 transition-colors">
            AUGEAN<span className="text-purple-400 font-light">-Z</span>
          </span>
          <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-widest text-zinc-500 px-2 py-0.5 border border-zinc-800 rounded bg-zinc-950/60 ml-1">
            v0.9.4-rc
          </span>
        </div>

        {/* Right: Minimal Actions */}
        <nav className="flex items-center gap-6 md:gap-8">
          <button
            onClick={() => scrollToSection('pipeline-section')}
            className="text-xs font-mono tracking-widest text-zinc-400 hover:text-white transition-colors duration-200 hidden md:flex items-center gap-1.5"
          >
            PIPELINE
          </button>
          <button
            onClick={() => scrollToSection('verification-section')}
            className="text-xs font-mono tracking-widest text-zinc-400 hover:text-white transition-colors duration-200 hidden md:flex items-center gap-1.5"
          >
            LEAN 4
          </button>
          <button
            onClick={() => scrollToSection('reconstruction-section')}
            className="text-xs font-mono tracking-widest text-zinc-400 hover:text-white transition-colors duration-200 hidden sm:flex items-center gap-1.5"
          >
            SYNTHESIS
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono tracking-widest text-zinc-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            GITHUB
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>

          {/* Direct CTA routing to /app */}
          <button
            onClick={() => navigate('/app')}
            className="relative px-3.5 py-1.5 md:px-4 md:py-2 rounded font-mono text-[11px] tracking-widest text-purple-200 bg-purple-950/40 border border-purple-500/40 hover:border-purple-400 hover:bg-purple-900/40 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(157,78,221,0.2)] flex items-center gap-2 cursor-pointer"
          >
            <span>OPEN APP</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </nav>
      </div>
    </header>
  );
}
