"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── CONFIGURAÇÕES AJUSTÁVEIS ──────────────────────────────
    const DOT_COUNT = 40;
    const MAX_DIST_DESKTOP = 120;
    const SPEED = 0.15;
    const DOT_RADIUS = 1.4;
    
    // Cores agora buscam dinamicamente das variáveis do CSS
    const computedStyles = getComputedStyle(document.body);
    const DOT_COLOR = computedStyles.getPropertyValue('--particle-color').trim() || "150, 160, 220";
    const LINE_COLOR = computedStyles.getPropertyValue('--line-color').trim() || "108, 92, 231";
    const DOT_ALPHA = parseFloat(computedStyles.getPropertyValue('--particle-alpha').trim() || "0.10");
    const LINE_ALPHA_MULTIPLIER = parseFloat(computedStyles.getPropertyValue('--line-alpha-multiplier').trim() || "0.08");
    
    // Reduz partículas e distância de conexão em mobile
    const isMobile = window.innerWidth < 768;
    const ACTIVE_COUNT = isMobile ? 12 : DOT_COUNT;
    const MAX_DIST = isMobile ? 80 : MAX_DIST_DESKTOP;
    // ──────────────────────────────────────────────────────────

    let width: number, height: number;

    interface Dot {
      x: number;
      y: number;
      vx: number;
      vy: number;
    }

    let dots: Dot[] = [];

    function resize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
    }

    function createDots() {
      dots = [];
      for (let i = 0; i < ACTIVE_COUNT; i++) {
        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * SPEED,
          vy: (Math.random() - 0.5) * SPEED,
        });
      }
    }

    let animationFrameId: number;

    function step() {
      ctx!.clearRect(0, 0, width, height);

      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;

        if (d.x < 0 || d.x > width) d.vx *= -1;
        if (d.y < 0 || d.y > height) d.vy *= -1;

        ctx!.beginPath();
        ctx!.arc(d.x, d.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${DOT_COLOR}, ${DOT_ALPHA})`;
        ctx!.fill();
      });

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * LINE_ALPHA_MULTIPLIER;
            ctx!.beginPath();
            ctx!.moveTo(dots[i].x, dots[i].y);
            ctx!.lineTo(dots[j].x, dots[j].y);
            ctx!.strokeStyle = `rgba(${LINE_COLOR}, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(step);
    }

    resize();
    createDots();
    step();

    const handleResize = () => {
      resize();
      createDots(); // recria pontos para evitar acúmulo fora da tela
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Camada 1: Manchas de luz (glow) — fixas, z-index 0 */}
      <div className="glow glow-purple" />
      <div className="glow glow-blue" />
      <div className="glow glow-purple-2" />

      {/* Camada 2: Rede de pontos (constelação) — fixa, z-index 1 */}
      <canvas ref={canvasRef} id="network" />
    </>
  );
}
