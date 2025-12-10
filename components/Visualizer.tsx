import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  volume: number;
  isActive: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ volume, isActive }) => {
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

      // Smooth interpolation for the radius
      // Input volume is roughly 0.0 to 1.0 (sometimes slightly higher)
      // We amp it up a bit for visual effect.
      // We update this even when inactive so the radius decays smoothly to base if we restart.
      const targetRadius = baseRadius + (volumeRef.current * 300); 
      
      // Ease towards target
      currentRadiusRef.current += (targetRadius - currentRadiusRef.current) * 0.1;
      
      // Clear the canvas immediately
      ctx.clearRect(0, 0, width, height);

      if (!isActive) {
        // Draw idle state (breathing circle)
        const breathe = 5 * Math.sin(Date.now() / 1000);
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + breathe, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.2)'; // Indigo 500 low opacity
        ctx.fill();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Draw Active State (Ripples/Blob)
        
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

    // Immediate render call ensures we clear the canvas and draw the correct state (Active or Idle)
    // synchronously with the effect setup, preventing any lingering frames from the previous state.
    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]); // Only re-run loop setup when active state changes

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
          <p className="text-slate-400 font-light tracking-widest text-xs sm:text-sm uppercase">
            Ready to Start
          </p>
        </div>
      )}
    </div>
  );
};

export default Visualizer;