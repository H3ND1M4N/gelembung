import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { ParticleEngine } from '../services/particleEngine';

export interface ParticleCanvasRef {
  emitPop: (x: number, y: number, colorTheme: string, isCorrect: boolean) => void;
}

export const ParticleCanvas = forwardRef<ParticleCanvasRef, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ParticleEngine>(new ParticleEngine());

  useImperativeHandle(ref, () => ({
    emitPop: (x: number, y: number, colorTheme: string, isCorrect: boolean) => {
      engineRef.current.emitBubblePop(x, y, colorTheme, isCorrect);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      if (canvas && ctx) {
        engineRef.current.updateAndRender(ctx, canvas.width, canvas.height);
      }
      animId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-35 w-full h-full"
    />
  );
});

ParticleCanvas.displayName = 'ParticleCanvas';
