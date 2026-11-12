import React, { useEffect, useRef } from 'react';

export default function BackgroundSystem() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle system: subtle dust & micro-nodes
    const particleCount = Math.min(65, Math.floor((width * height) / 25000));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.25 - 0.05,
      alpha: Math.random() * 0.4 + 0.1,
      baseAlpha: Math.random() * 0.35 + 0.1,
      isViolet: Math.random() > 0.65,
    }));

    let mouse = { x: width / 2, y: height / 2, active: false };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse proximity response
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            p.alpha = Math.min(0.8, p.baseAlpha + (1 - dist / 140) * 0.5);
          } else {
            p.alpha = p.baseAlpha;
          }
        }

        ctx.fillStyle = p.isViolet
          ? `rgba(199, 125, 255, ${p.alpha * 0.8})`
          : `rgba(180, 180, 200, ${p.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background canvas for ambient dust particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle fine technical grid */}
      <div className="absolute inset-0 bg-grid-tech opacity-25" />

      {/* Dark radial spotlight with very faint purple core */}
      <div className="absolute inset-0 bg-radial-vignette" />

      {/* Scanline texture */}
      <div className="absolute inset-0 scanlines opacity-20" />

      {/* Corner telemetry HUD details - clean bullet separators */}
      <div className="absolute top-4 left-4 font-mono text-[9px] tracking-widest text-[#424254] select-none hidden md:block">
        SYS.CORE · AUGEAN-Z.NODE [0x01]
      </div>
      <div className="absolute top-4 right-4 font-mono text-[9px] tracking-widest text-[#424254] select-none hidden md:block">
        SPEC · .GRN-IR-V4.2
      </div>
      <div className="absolute bottom-4 left-4 font-mono text-[9px] tracking-widest text-[#353545] select-none hidden md:block">
        STATE · RECONSTRUCTION_MATRIX
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-[9px] tracking-widest text-[#353545] select-none hidden md:block">
        KERNEL · LEAN4.PROVER
      </div>
    </div>
  );
}
