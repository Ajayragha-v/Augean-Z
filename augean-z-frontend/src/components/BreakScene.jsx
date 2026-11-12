import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Layers } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function BreakScene() {
  const containerRef = useRef(null);
  const cubeWrapperRef = useRef(null);
  const cubeImgRef = useRef(null);
  const shardsContainerRef = useRef(null);
  const letterCRef = useRef(null);
  const letterORef = useRef(null);
  const letterDRef = useRef(null);
  const letterERef = useRef(null);
  const energyCoreRef = useRef(null);
  const progressBadgeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // PINNED Master Break Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=200%',
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // 0% - 20%: Subtle internal fissure movement & tremor
      tl.to(
        cubeImgRef.current,
        {
          scale: 1.06,
          rotationY: 10,
          filter: 'brightness(1.25) contrast(1.15) drop-shadow(0 0 50px rgba(157, 78, 221, 0.55))',
          duration: 0.2,
          ease: 'power1.inOut',
        },
        0
      );

      // 20% - 60%: Central cube image separates, fades into dedicated 3D shards
      tl.to(
        cubeImgRef.current,
        {
          opacity: 0.25,
          scale: 1.2,
          duration: 0.4,
          ease: 'power2.inOut',
        },
        0.2
      );

      // Shards expand and disperse outward into the 3D viewport with controlled bounds
      tl.to(
        '.shard-nw',
        { x: -140, y: -90, rotationZ: -20, rotationX: 25, scale: 0.88, opacity: 0.85, duration: 0.6 },
        0.2
      );
      tl.to(
        '.shard-ne',
        { x: 140, y: -90, rotationZ: 22, rotationY: -25, scale: 0.88, opacity: 0.85, duration: 0.6 },
        0.2
      );
      tl.to(
        '.shard-sw',
        { x: -150, y: 100, rotationZ: 18, rotationX: -20, scale: 0.85, opacity: 0.85, duration: 0.6 },
        0.2
      );
      tl.to(
        '.shard-se',
        { x: 150, y: 110, rotationZ: -22, rotationY: 25, scale: 0.85, opacity: 0.85, duration: 0.6 },
        0.2
      );
      tl.to(
        '.shard-center-top',
        { y: -130, z: 60, scale: 0.9, opacity: 0.9, duration: 0.6 },
        0.25
      );
      tl.to(
        '.shard-center-bottom',
        { y: 130, z: -40, scale: 0.9, opacity: 0.9, duration: 0.6 },
        0.25
      );

      // Central purple computational core reveals itself
      tl.to(
        energyCoreRef.current,
        {
          opacity: 1,
          scale: 1.3,
          boxShadow: '0 0 90px rgba(157, 78, 221, 0.75)',
          duration: 0.5,
        },
        0.3
      );

      // Typographic Disintegration: "C · O · D · E" scatter into coordinate space
      tl.to(
        letterCRef.current,
        { x: -110, y: -40, rotation: -16, opacity: 0.5, color: '#c77dff', duration: 0.6 },
        0.15
      );
      tl.to(
        letterORef.current,
        { x: -35, y: 45, rotation: 12, opacity: 0.5, color: '#e0aaff', duration: 0.6 },
        0.18
      );
      tl.to(
        letterDRef.current,
        { x: 45, y: -50, rotation: -10, opacity: 0.5, color: '#a855f7', duration: 0.6 },
        0.22
      );
      tl.to(
        letterERef.current,
        { x: 120, y: 50, rotation: 18, opacity: 0.5, color: '#9d4edd', duration: 0.6 },
        0.25
      );

      // 60% - 100%: Complete computational distribution
      tl.to(
        '.shard-block',
        {
          opacity: 0.95,
          borderColor: 'rgba(199, 125, 255, 0.6)',
          duration: 0.4,
        },
        0.6
      );

      tl.to(
        progressBadgeRef.current,
        {
          color: '#c77dff',
          duration: 0.2,
          onUpdate: function () {
            if (progressBadgeRef.current) {
              const p = this.progress();
              progressBadgeRef.current.textContent =
                p > 0.5
                  ? 'SYSTEM DISASSEMBLED · READY FOR TOPOLOGY MAPPING'
                  : 'DISASSEMBLING LATTICE · READY FOR TOPOLOGY MAPPING';
            }
          },
        },
        0.75
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="scene-break"
      ref={containerRef}
      className="relative w-full h-screen flex flex-col items-center justify-between overflow-hidden bg-[#030306] select-none pt-14 pb-10"
    >
      {/* Background vignette & subtle radial grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(60,20,100,0.22)_0%,rgba(6,6,10,0.92)_60%,#030306_100%)] pointer-events-none" />

      {/* Top Section Header — Cleanly pinned to top with breathing space */}
      <div className="relative z-30 text-center max-w-2xl px-6 pointer-events-none shrink-0 mb-2">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-purple-300 uppercase mb-2">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>PHASE 02 · STRUCTURAL DECONSTRUCTION</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight mb-2">
          THE BREAK
        </h2>
        <p className="font-sans text-xs sm:text-sm text-zinc-400 font-light max-w-lg mx-auto">
          The complex system separates into elementary constituents—not as broken pieces, but as discrete mathematical components.
        </p>
      </div>

      {/* Disintegrating Typographic Vector: C · O · D · E — Positioned as an ambient architectural layer behind the arena */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 flex items-center justify-center gap-16 font-display text-6xl sm:text-7xl md:text-8xl font-black text-white/20 pointer-events-none tracking-widest">
        <span ref={letterCRef} className="inline-block transition-transform">C</span>
        <span ref={letterORef} className="inline-block transition-transform">O</span>
        <span ref={letterDRef} className="inline-block transition-transform">D</span>
        <span ref={letterERef} className="inline-block transition-transform">E</span>
      </div>

      {/* 3D Kinetic Shard Arena */}
      <div
        ref={cubeWrapperRef}
        className="relative z-10 w-[300px] sm:w-[420px] md:w-[500px] aspect-square flex items-center justify-center perspective-1000 shrink-0 my-auto"
      >
        {/* Central Pure Violet Computational Energy Core */}
        <div
          ref={energyCoreRef}
          className="absolute w-24 h-24 rounded-full bg-purple-600/35 blur-[25px] opacity-0 transition-opacity pointer-events-none"
        />

        {/* Base Broken Cube Visual */}
        <img
          ref={cubeImgRef}
          src="/assets/broken-cube.png"
          alt="Deconstructing Cube"
          className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] select-none pointer-events-none will-change-transform"
        />

        {/* Separated 3D Metallic Fragment Shards (Simulated Physical Blocks) */}
        <div ref={shardsContainerRef} className="absolute inset-0 pointer-events-none preserve-3d">
          {/* North-West Block Shard */}
          <div className="shard-nw shard-block absolute top-8 left-8 w-24 h-24 p-2 rounded bg-[#0e0e18]/85 border border-purple-500/30 backdrop-blur-md shadow-2xl flex flex-col justify-between">
            <span className="font-mono text-[8px] text-purple-400">BLOCK_NW[0,0,1]</span>
            <div className="w-full h-1 bg-purple-500/30 rounded" />
            <span className="font-mono text-[8px] text-zinc-500">AST_BRANCH: EXPR</span>
          </div>

          {/* North-East Block Shard */}
          <div className="shard-ne shard-block absolute top-6 right-8 w-28 h-20 p-2 rounded bg-[#0d0d17]/85 border border-purple-500/30 backdrop-blur-md shadow-2xl flex flex-col justify-between">
            <span className="font-mono text-[8px] text-purple-400">BLOCK_NE[1,0,1]</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            </div>
            <span className="font-mono text-[8px] text-zinc-500">TYPE_SPEC: LAMBDA</span>
          </div>

          {/* South-West Block Shard */}
          <div className="shard-sw shard-block absolute bottom-8 left-6 w-28 h-24 p-2.5 rounded bg-[#0c0c16]/85 border border-purple-500/30 backdrop-blur-md shadow-2xl flex flex-col justify-between">
            <span className="font-mono text-[8px] text-purple-400">BLOCK_SW[0,1,0]</span>
            <div className="font-mono text-[9px] text-zinc-400">&Delta; STATE: ISOLATED</div>
            <span className="font-mono text-[8px] text-zinc-500">RELATION: 0x98A</span>
          </div>

          {/* South-East Block Shard */}
          <div className="shard-se shard-block absolute bottom-6 right-6 w-24 h-24 p-2.5 rounded bg-[#0e0e18]/85 border border-purple-500/30 backdrop-blur-md shadow-2xl flex flex-col justify-between">
            <span className="font-mono text-[8px] text-purple-400">BLOCK_SE[1,1,0]</span>
            <div className="w-full h-[1px] bg-purple-500/50" />
            <span className="font-mono text-[8px] text-zinc-500">SUBGRAPH: READY</span>
          </div>

          {/* Center Top */}
          <div className="shard-center-top shard-block absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded bg-[#08080f]/90 border border-purple-500/40 font-mono text-[9px] text-purple-200">
            VERTEX_ARRAY: EXTRACTED
          </div>

          {/* Center Bottom */}
          <div className="shard-center-bottom shard-block absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded bg-[#08080f]/90 border border-purple-500/40 font-mono text-[9px] text-purple-200">
            INVARIANTS: VECTORIZED
          </div>
        </div>
      </div>

      {/* Bottom Telemetry HUD Status — Cleanly grounded */}
      <div className="relative z-30 flex flex-col items-center gap-2 shrink-0">
        <div
          ref={progressBadgeRef}
          className="hud-tag hud-tag-active font-mono text-[10px] tracking-widest"
        >
          DISASSEMBLING LATTICE · READY FOR TOPOLOGY MAPPING
        </div>
      </div>
    </section>
  );
}
