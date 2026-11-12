import React, { useEffect, useRef } from 'react';

/**
 * InteractiveDotGrid
 *
 * Full-screen physics-based dot grid for the Augean-Z landing page.
 *
 * Physics model:
 * - Full grid covering viewport with fixed spacing (26-32px)
 * - Dots store original grid coordinates (originX, originY) and current coordinates (x, y)
 * - Mouse cursor exerts an invisible circular force field of radius R (~180px)
 * - Hollow circular force zone: Maximum radial repulsion peaks at ~45% radius, then smoothly tapers
 * - Cursor velocity (mouseVx, mouseVy) imparts directional dragging inertia
 * - Spring restoring force: a = -k * (x - originX) - damping * vx
 * - pointer-events: none ensures zero interference with scrolling, clicks, or text
 * - Honors prefers-reduced-motion: renders static dot grid without physics loop
 * - Automatically pauses when window/tab is hidden
 */
export default function InteractiveDotGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Respect user's reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Grid configuration
    let spacing = 28;
    let cols = 0;
    let rows = 0;

    // Dot memory storage
    // Using flat Float32Arrays for cache locality and 60fps performance with 0 GC pauses
    let dotCount = 0;
    let originX = new Float32Array(0);
    let originY = new Float32Array(0);
    let posX = new Float32Array(0);
    let posY = new Float32Array(0);
    let velX = new Float32Array(0);
    let velY = new Float32Array(0);
    let baseAlpha = new Float32Array(0);

    // Mouse tracking & physics variables
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
      active: false,
      influence: 0, // Smooth transition when entering/leaving window
    };

    // Force field parameters
    const forceRadius = 190;
    const forceRadiusSq = forceRadius * forceRadius;
    const springStrength = 0.055; // Natural return spring stiffness
    const damping = 0.84; // Friction damping
    const maxDisplacement = 42; // Maximum physical displacement clamp

    // Setup and resize grid
    const setupGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for mobile & 4K displays

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Adaptive spacing: wider on smaller viewports, denser on large displays
      if (width < 640) {
        spacing = 34; // Mobile
      } else if (width < 1024) {
        spacing = 30; // Tablet
      } else {
        spacing = 28; // Desktop
      }

      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;
      dotCount = cols * rows;

      // Allocate contiguous memory buffers
      originX = new Float32Array(dotCount);
      originY = new Float32Array(dotCount);
      posX = new Float32Array(dotCount);
      posY = new Float32Array(dotCount);
      velX = new Float32Array(dotCount);
      velY = new Float32Array(dotCount);
      baseAlpha = new Float32Array(dotCount);

      let idx = 0;
      for (let r = 0; r < rows; r++) {
        const y = r * spacing;
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          originX[idx] = x;
          originY[idx] = y;
          posX[idx] = x;
          posY[idx] = y;
          velX[idx] = 0;
          velY[idx] = 0;
          // Very subtle baseline opacity with subtle cadence
          baseAlpha[idx] = (c % 2 === 0 && r % 2 === 0) ? 0.28 : 0.20;
          idx++;
        }
      }

      // If reduced motion, draw once and exit
      if (prefersReducedMotion) {
        drawStaticGrid();
      }
    };

    const drawStaticGrid = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < dotCount; i++) {
        ctx.fillStyle = `rgba(180, 180, 205, ${baseAlpha[i]})`;
        ctx.beginPath();
        ctx.arc(originX[i], originY[i], 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Event listeners
    const handleMouseMove = (e) => {
      const currentX = e.clientX;
      const currentY = e.clientY;

      if (!mouse.active) {
        mouse.x = currentX;
        mouse.y = currentY;
        mouse.prevX = currentX;
        mouse.prevY = currentY;
        mouse.active = true;
      }

      mouse.targetX = currentX;
      mouse.targetY = currentY;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleMouseEnter = (e) => {
      mouse.active = true;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('resize', setupGrid);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    setupGrid();

    // If reduced motion, we stop here (static grid drawn)
    if (prefersReducedMotion) {
      return () => {
        window.removeEventListener('resize', setupGrid);
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('mouseenter', handleMouseEnter);
      };
    }

    // Main animation loop
    let lastTime = performance.now();
    let isTabVisible = true;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastTime = performance.now();
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(tick);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const tick = (now) => {
      if (!isTabVisible) {
        animationFrameId = null;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.033); // Cap dt to avoid explosion on hitch
      lastTime = now;

      // 1. Update cursor tracking, velocity & smooth influence transition
      if (mouse.active) {
        // Smooth mouse position interpolation
        const lerpFactor = 0.35;
        mouse.x += (mouse.targetX - mouse.x) * lerpFactor;
        mouse.y += (mouse.targetY - mouse.y) * lerpFactor;

        // Compute mouse instantaneous velocity
        const rawVx = (mouse.x - mouse.prevX);
        const rawVy = (mouse.y - mouse.prevY);
        mouse.vx = mouse.vx * 0.7 + rawVx * 0.3;
        mouse.vy = mouse.vy * 0.7 + rawVy * 0.3;
        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;

        // Smoothly fade in influence to 1
        mouse.influence = Math.min(1, mouse.influence + 0.08);
      } else {
        // Smoothly fade out influence to 0 when mouse leaves
        mouse.influence = Math.max(0, mouse.influence - 0.04);
        mouse.vx *= 0.8;
        mouse.vy *= 0.8;
      }

      const mX = mouse.x;
      const mY = mouse.y;
      const mVx = mouse.vx;
      const mVy = mouse.vy;
      const mInfluence = mouse.influence;
      const mSpeed = Math.sqrt(mVx * mVx + mVy * mVy);

      ctx.clearRect(0, 0, width, height);

      // Batch rendering: 2 color buckets for drawing efficiency
      // Standard dots and near-force-field highlighted dots
      const standardIndices = [];
      const energizedIndices = [];

      for (let i = 0; i < dotCount; i++) {
        const ox = originX[i];
        const oy = originY[i];
        let px = posX[i];
        let py = posY[i];
        let vx = velX[i];
        let vy = velY[i];

        // 2. Cursor circular force field calculation
        if (mInfluence > 0.001) {
          const dx = px - mX;
          const dy = py - mY;
          const distSq = dx * dx + dy * dy;

          if (distSq < forceRadiusSq && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const normDist = dist / forceRadius; // 0 (at cursor) to 1 (at outer edge)

            // Smooth bell curve / hollow force zone profile:
            // Peaks at around normDist ~ 0.42, giving the hollow circular displacement feel
            // smoothFalloff vanishes cleanly at normDist = 1.0 without hard cutoffs
            const falloff = Math.sin(normDist * Math.PI) * Math.pow(1 - normDist, 0.45);

            // Directional unit vector away from mouse center (radial push)
            const dirX = dx / dist;
            const dirY = dy / dist;

            // Radial force magnitude
            const radialPush = falloff * 5.2 * mInfluence;

            // Directional momentum drag: fast cursor movement drags dots in velocity direction
            const dragCoeff = Math.min(mSpeed * 0.18, 4.0) * falloff * mInfluence;
            const dragX = mVx * 0.22 * dragCoeff;
            const dragY = mVy * 0.22 * dragCoeff;

            vx += dirX * radialPush + dragX;
            vy += dirY * radialPush + dragY;

            if (normDist < 0.75) {
              energizedIndices.push(i);
            } else {
              standardIndices.push(i);
            }
          } else {
            standardIndices.push(i);
          }
        } else {
          standardIndices.push(i);
        }

        // 3. Spring restoring physics towards (originX, originY) + damping
        const dispX = px - ox;
        const dispY = py - oy;

        const springAx = -dispX * springStrength;
        const springAy = -dispY * springStrength;

        vx = (vx + springAx) * damping;
        vy = (vy + springAy) * damping;

        px += vx;
        py += vy;

        // Clamp extreme displacement for stability
        const currentDispSq = (px - ox) * (px - ox) + (py - oy) * (py - oy);
        if (currentDispSq > maxDisplacement * maxDisplacement) {
          const disp = Math.sqrt(currentDispSq);
          px = ox + (dispX / disp) * maxDisplacement;
          py = oy + (dispY / disp) * maxDisplacement;
          vx *= 0.5;
          vy *= 0.5;
        }

        // Settle micro-vibrations when virtually stopped
        if (Math.abs(vx) < 0.004 && Math.abs(vy) < 0.004 && currentDispSq < 0.01) {
          px = ox;
          py = oy;
          vx = 0;
          vy = 0;
        }

        posX[i] = px;
        posY[i] = py;
        velX[i] = vx;
        velY[i] = vy;
      }

      // 4. Efficient Batched Drawing
      // Pass 1: Standard dots (clean, crisp futuristic dot matrix)
      ctx.fillStyle = 'rgba(180, 180, 215, 0.42)';
      ctx.beginPath();
      for (let k = 0; k < standardIndices.length; k++) {
        const i = standardIndices[k];
        ctx.moveTo(posX[i] + 1.6, posY[i]);
        ctx.arc(posX[i], posY[i], 1.6, 0, Math.PI * 2);
      }
      ctx.fill();

      // Pass 2: Energized dots (within active circular force field - vibrant violet core)
      if (energizedIndices.length > 0) {
        ctx.fillStyle = 'rgba(215, 140, 255, 0.95)';
        ctx.beginPath();
        for (let k = 0; k < energizedIndices.length; k++) {
          const i = energizedIndices[k];
          ctx.moveTo(posX[i] + 2.2, posY[i]);
          ctx.arc(posX[i], posY[i], 2.2, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', setupGrid);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      style={{ pointerEvents: 'none' }}
    />
  );
}
