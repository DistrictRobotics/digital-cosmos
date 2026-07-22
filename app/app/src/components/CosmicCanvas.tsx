'use client';

import { useEffect, useRef } from "react";

interface Star {
  x: number; y: number; z: number;
  size: number; opacity: number; speed: number;
  twinkleSpeed: number; twinklePhase: number;
}

export default function CosmicCanvas({
  mouseSensitivity = 0.02,
  starCount = 400,
  shootingStarRate = 0.003,
}: {
  mouseSensitivity?: number;
  starCount?: number;
  shootingStarRate?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<{ x: number; y: number; dx: number; dy: number; life: number; maxLife: number }[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init stars
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 3 + 0.5,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.3 + 0.05,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / canvas.width - 0.5) * 2,
        y: (e.clientY / canvas.height - 0.5) * 2,
      };
    };
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("scroll", handleScroll);

    let animId: number;

    const draw = () => {
      frameRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      for (const star of stars) {
        const parallaxX = mouseRef.current.x * star.z * mouseSensitivity * canvas.width;
        const parallaxY = mouseRef.current.y * star.z * mouseSensitivity * canvas.height;
        const scrollOffset = scrollRef.current * star.speed * 0.1;

        // Twinkle
        const twinkle = Math.sin(frameRef.current * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
        const alpha = star.opacity * twinkle;

        const x = star.x + parallaxX;
        const y = star.y + parallaxY - scrollOffset;

        // Wrap
        const wrappedY = ((y % canvas.height) + canvas.height) % canvas.height;

        ctx.beginPath();
        ctx.arc(x, wrappedY, star.size * star.z * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 232, 240, ${alpha})`;
        ctx.fill();

        // Glow for brighter stars
        if (star.z > 2) {
          ctx.beginPath();
          ctx.arc(x, wrappedY, star.size * star.z, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 212, 255, ${alpha * 0.15})`;
          ctx.fill();
        }
      }

      // Shooting stars
      if (Math.random() < shootingStarRate) {
        shootingStarsRef.current.push({
          x: Math.random() * canvas.width * 1.5,
          y: Math.random() * canvas.height * 0.3,
          dx: (Math.random() * 6 + 4) * (Math.random() > 0.5 ? 1 : -1),
          dy: Math.random() * 4 + 2,
          life: 0,
          maxLife: 30 + Math.random() * 40,
        });
      }

      shootingStarsRef.current = shootingStarsRef.current.filter((s) => {
        s.life++;
        const progress = s.life / s.maxLife;
        const alpha = 1 - progress;
        if (alpha <= 0) return false;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.dx * 2, s.y - s.dy * 2);
        ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx.lineWidth = 2 * (1 - progress) + 0.5;
        ctx.stroke();

        // Glow tip
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2 * (1 - progress) + 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 232, 240, ${alpha})`;
        ctx.fill();

        s.x += s.dx;
        s.y += s.dy;
        return true;
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mouseSensitivity, starCount, shootingStarRate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
