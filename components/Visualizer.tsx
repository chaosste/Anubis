import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  volume: number;
  isActive: boolean;
  voiceName: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ volume, isActive, voiceName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const currentRadiusRef = useRef<number>(50);
  const volumeRef = useRef(volume);

  // Sync volume ref with prop to avoid restarting the effect loop on every volume change
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Setup canvas
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) / 2 - 20;
      const baseRadius = 60;

      // Clear the canvas immediately
      ctx.clearRect(0, 0, width, height);

      if (!isActive) {
        // Draw idle state (Subtle, calming "breathing" effect)
        const time = Date.now() / 2500;
        const breathe = 4 * Math.sin(time);
        const opacity = 0.1 + 0.05 * Math.sin(time);

        // Glow
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius + 40);
        gradient.addColorStop(0, `rgba(99, 102, 241, ${opacity})`);
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + 40, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + breathe, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(99, 102, 241, ${opacity + 0.05})`;
        ctx.fill();

      } else {
        // Active State (Dynamic Audio Reactive)
        const time = Date.now() / 1000;

        // Smooth interpolation for the radius
        const volumeEffect = volumeRef.current;
        const targetRadius = baseRadius + (volumeEffect * 180);
        currentRadiusRef.current += (targetRadius - currentRadiusRef.current) * 0.15;

        const dynamicRadius = currentRadiusRef.current;

        // Outer Glow (Aura)
        const auraGradient = ctx.createRadialGradient(centerX, centerY, baseRadius, centerX, centerY, dynamicRadius + 60);
        auraGradient.addColorStop(0, `rgba(99, 102, 241, ${0.2 + volumeEffect * 0.3})`);
        auraGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx.beginPath();
        ctx.arc(centerX, centerY, dynamicRadius + 60, 0, 2 * Math.PI);
        ctx.fillStyle = auraGradient;
        ctx.fill();

        // Main Reactive Pulse
        ctx.beginPath();
        ctx.arc(centerX, centerY, dynamicRadius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(99, 102, 241, ${0.3 + volumeEffect * 0.4})`;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + (volumeEffect * 10), 0, 2 * Math.PI);
        ctx.fillStyle = '#818cf8'; // Indigo 400
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#6366f1';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset

        // Floating Orbs (Organic presence)
        for (let i = 0; i < 3; i++) {
          const angle = time + (i * Math.PI * 2 / 3);
          const orbitRadius = baseRadius + 20 + (volumeEffect * 40);
          const x = centerX + Math.cos(angle) * orbitRadius;
          const y = centerY + Math.sin(angle) * orbitRadius;

          ctx.beginPath();
          ctx.arc(x, y, 4 + (volumeEffect * 6), 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(165, 180, 252, 0.6)';
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    // Immediate render call
    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <div className="relative w-full h-48 sm:h-64 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="w-full h-full object-contain"
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-slate-500/80 font-light tracking-widest text-xs sm:text-sm uppercase animate-pulse-slow">
            {voiceName} is Ready
          </p>
        </div>
      )}
    </div>
  );
};

export default Visualizer;