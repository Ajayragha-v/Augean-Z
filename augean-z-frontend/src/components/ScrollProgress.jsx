import React, { useState, useEffect } from 'react';

const STAGES = [
  { id: 'scene-void', num: '01', label: 'THE VOID' },
  { id: 'scene-problem', num: '02', label: 'THE CODE' },
  { id: 'scene-break', num: '03', label: 'THE BREAK' },
  { id: 'scene-detective', num: '04', label: 'DETECTIVE & QUERY' },
  { id: 'scene-discovery', num: '05', label: 'MODEL DISCOVERY' },
  { id: 'scene-verification', num: '06', label: 'VERIFICATION' },
  { id: 'scene-reconstruction', num: '07', label: 'RECONSTRUCTION' },
  { id: 'scene-final', num: '08', label: 'STRUCTURE' },
];

export default function ScrollProgress() {
  const [activeStage, setActiveStage] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const percent = totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0;
          setScrollPercent(Math.min(100, Math.max(0, percent)));

          // Detect which section is currently in view
          const elements = STAGES.map((s) => document.getElementById(s.id));
          let current = 0;
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= window.innerHeight * 0.45) {
                current = i;
              }
            }
          }
          setActiveStage(current);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const jumpToStage = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3 select-none pointer-events-auto">
      {/* Vertical track line */}
      <div className="absolute right-[5px] top-0 bottom-0 w-[1px] bg-white/[0.05] -z-10">
        <div
          className="w-full bg-gradient-to-b from-purple-500 to-purple-300 transition-all duration-300 shadow-[0_0_8px_#9d4edd]"
          style={{ height: `${scrollPercent}%` }}
        />
      </div>

      {STAGES.map((stage, idx) => {
        const isActive = activeStage === idx;
        return (
          <button
            key={stage.id}
            onClick={() => jumpToStage(stage.id)}
            className="group flex items-center gap-3 py-1 text-right transition-all duration-300 focus:outline-none"
          >
            {/* Label reveal on hover or active */}
            <span
              className={`font-mono text-[9px] tracking-widest uppercase transition-all duration-300 ${
                isActive
                  ? 'text-purple-300 opacity-100 translate-x-0'
                  : 'text-zinc-500 opacity-0 group-hover:opacity-80 translate-x-2 group-hover:translate-x-0'
              }`}
            >
              <span className="text-zinc-600 mr-1.5">{stage.num}</span>
              {stage.label}
            </span>

            {/* Indicator node */}
            <div
              className={`w-2.5 h-2.5 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? 'bg-purple-500 shadow-[0_0_12px_#c77dff] scale-110 ring-2 ring-purple-400/30'
                  : 'bg-zinc-800 border border-zinc-700/60 group-hover:bg-zinc-600'
              }`}
            >
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
              )}
            </div>
          </button>
        );
      })}
    </aside>
  );
}
