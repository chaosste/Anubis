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
        // Slower cycle (dividing by 2500ms) for a relaxed pace
        const time = Date.now() / 2500;
        const breathe = 4 * Math.sin(time); // Gentle radius variance (+/- 4px)
        const opacity = 0.1 + 0.08 * Math.sin(time); // Soft opacity pulse (0.02 to 0.18)

        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + breathe, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(99, 102, 241, ${opacity})`; // Indigo 500 with variable low opacity
        ctx.fill();
        
        // Very subtle ring
        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity + 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();

      } else {
        // Active State (Dynamic Audio Reactive)
        
        // Smooth interpolation for the radius
        const targetRadius = baseRadius + (volumeRef.current * 300); 
        currentRadiusRef.current += (targetRadius - currentRadiusRef.current) * 0.1;

        // Inner Core
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#6366f1'; // Indigo 500
        ctx.fill();

        // Dynamic Outer Ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(currentRadiusRef.current, maxRadius), 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.fill();
        
        // Second Outer Ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(currentRadiusRef.current * 0.7 + 30, maxRadius), 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(165, 180, 252, 0.5)'; // Indigo 300
        ctx.lineWidth = 1;
        ctx.stroke();
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