import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  opacity: number;
}

interface ParticleBackgroundProps {
  accentHue: number;
  isPlaying: boolean;
  dense?: boolean;
}

const BASE_COUNT = 180;
const DENSE_COUNT = 250;
const BASE_SPEED = 0.3;
const PLAYING_SPEED = 0.45;
const MAX_LINK_DIST = 120;
const GRID_CELL = 60; // cell size = max link distance / 2

/** Deterministic-but-varied initial value from seed, to avoid all particles clustering. */
const seeded = (seed: number, min: number, max: number) => min + ((seed * 2654435761 + 1) % 0xffffffff) / 0xffffffff * (max - min);

const createParticles = (count: number, accentHue: number, width: number, height: number): Particle[] =>
  Array.from({ length: count }, (_, i) => ({
    x: seeded(i * 7, 0, width),
    y: seeded(i * 13, 0, height),
    vx: seeded(i * 3, -0.6, 0.6),
    vy: seeded(i * 11, -0.6, 0.6),
    radius: seeded(i * 5, 1, 3),
    hue: (accentHue + seeded(i * 17, -30, 30) + 720) % 360,
    opacity: seeded(i * 19, 0.3, 0.7),
  }));

export const ParticleBackground = ({ accentHue, isPlaying, dense = false }: ParticleBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);
  const accentRef = useRef(accentHue);
  accentRef.current = accentHue;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-initialize particles on resize with new bounds
      particlesRef.current = createParticles(
        dense ? DENSE_COUNT : BASE_COUNT,
        accentRef.current,
        canvas.width,
        canvas.height,
      );
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);
    resize();

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const particles = particlesRef.current;
      if (particles.length === 0) return;
      const speed = isPlaying ? PLAYING_SPEED : BASE_SPEED;
      const w = canvas.width;
      const h = canvas.height;

      // Update positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // Wrap around edges
        if (p.x < -p.radius) p.x = w + p.radius;
        if (p.x > w + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = h + p.radius;
        if (p.y > h + p.radius) p.y = -p.radius;

        // Subtle hue drift toward accentHue
        p.hue += (accentRef.current - p.hue) * 0.002;
        if (p.hue < 0) p.hue += 360;
        if (p.hue >= 360) p.hue -= 360;
      }

      // -- Spatial hash grid for O(n) neighbour lookup --
      const cols = Math.ceil(w / GRID_CELL);
      const rows = Math.ceil(h / GRID_CELL);
      const grid: number[][] = Array.from({ length: cols * rows }, () => []);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = Math.min(Math.max(0, Math.floor(p.x / GRID_CELL)), cols - 1);
        const cy = Math.min(Math.max(0, Math.floor(p.y / GRID_CELL)), rows - 1);
        grid[cy * cols + cx].push(i);
      }

      // -- Draw lines between nearby particles --
      const linkDistSq = MAX_LINK_DIST * MAX_LINK_DIST;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = Math.floor(p.x / GRID_CELL);
        const cy = Math.floor(p.y / GRID_CELL);

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
            const cell = grid[ny * cols + nx];
            for (let k = 0; k < cell.length; k++) {
              const j = cell[k];
              if (j <= i) continue; // draw each pair once
              const q = particles[j];
              const dx2 = p.x - q.x;
              const dy2 = p.y - q.y;
              const distSq = dx2 * dx2 + dy2 * dy2;
              if (distSq < linkDistSq) {
                const dist = Math.sqrt(distSq);
                const alpha = (1 - dist / MAX_LINK_DIST) * 0.25;
                const avgHue = (p.hue + q.hue) / 2;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
                ctx.strokeStyle = `hsla(${avgHue}, 50%, 55%, ${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            }
          }
        }
      }

      // -- Render particles --
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 60%, 55%, ${p.opacity})`;
        ctx.shadowColor = `hsla(${p.hue}, 70%, 50%, ${p.opacity * 0.6})`;
        ctx.shadowBlur = p.radius * 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
    };
  }, [isPlaying, dense]);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      style={{ opacity: 1 }}
    />
  );
};
