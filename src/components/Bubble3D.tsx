import React from 'react';
import { BubbleItem } from '../types/game';

interface Bubble3DProps {
  bubble: BubbleItem;
  onPop: (bubble: BubbleItem, clientX: number, clientY: number) => void;
  scale?: number;
}

export const Bubble3D: React.FC<Bubble3DProps> = ({ bubble, onPop, scale = 1 }) => {
  if (bubble.popped) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onPop(bubble, e.clientX, e.clientY);
  };

  const themeClass = {
    cyan: 'bubble-3d-cyan',
    emerald: 'bubble-3d-emerald',
    amber: 'bubble-3d-amber',
    indigo: 'bubble-3d-indigo',
    rose: 'bubble-3d-rose',
  }[bubble.colorTheme] || 'bubble-3d-cyan';

  const wobbleStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${bubble.x}%`,
    top: `${bubble.y}%`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    width: `${bubble.size}px`,
    height: `${bubble.size}px`,
    transition: 'top 0.08s linear, left 0.12s ease-out',
    touchAction: 'none',
  };

  return (
    <div
      style={wobbleStyle}
      onPointerDown={handlePointerDown}
      className="cursor-pointer group select-none z-20 flex items-center justify-center"
      role="button"
      tabIndex={0}
      aria-label={`Gelembung jawaban: ${bubble.text}`}
    >
      {/* 3D Glass Bubble Body */}
      <div
        className={`relative w-full h-full rounded-full ${themeClass} animate-bubble-wobble flex items-center justify-center p-4 transition-transform active:scale-90 duration-150`}
        style={{
          animationDuration: `${3.5 + (bubble.wobbleSpeed || 1)}s`,
          animationDelay: `${bubble.wobbleOffset || 0}s`,
        }}
      >
        {/* Specular curved reflection glint (top left shine) */}
        <div className="bubble-specular" />

        {/* Subtle secondary specular dot */}
        <div className="absolute top-[28%] left-[16%] w-2.5 h-2.5 rounded-full bg-white/80 pointer-events-none blur-[0.5px]" />

        {/* Bottom rim refraction light */}
        <div className="bubble-bottom-rim" />

        {/* Answer Text in center */}
        <div className="relative z-10 text-center max-w-[85%] break-words pointer-events-none">
          <span className="font-fredoka font-bold text-white text-base md:text-lg lg:text-xl leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] filter">
            {bubble.text}
          </span>
        </div>

        {/* Ambient Ring Glow on Hover/Touch */}
        <div className="absolute inset-0 rounded-full border-2 border-white/40 opacity-40 group-hover:opacity-90 group-active:scale-95 transition-all duration-200 pointer-events-none" />
      </div>
    </div>
  );
};
