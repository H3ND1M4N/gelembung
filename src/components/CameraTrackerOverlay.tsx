import React, { useEffect, useRef, useState } from 'react';
import { mediaPipeTracker, MediaPipeStatus } from '../services/mediaPipeHands';
import { HandPoint } from '../types/game';
import { RefreshCw, Hand } from 'lucide-react';

interface CameraTrackerOverlayProps {
  isActive: boolean;
  onToggleActive: () => void;
  onHandCollision: (point: HandPoint) => void;
}

export const CameraTrackerOverlay: React.FC<CameraTrackerOverlayProps> = ({
  isActive,
  onToggleActive,
  onHandCollision,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [handPoints, setHandPoints] = useState<HandPoint[]>([]);
  const [status, setStatus] = useState<MediaPipeStatus>({
    isSupported: true,
    isLoading: false,
    isActive: false,
    hasPermission: false,
    detectedHandsCount: 0,
    fps: 0,
  });
  const [showVideoPreview, setShowVideoPreview] = useState<boolean>(true);

  // Status and hands subscriber
  useEffect(() => {
    mediaPipeTracker.setStatusListener((newStatus) => {
      setStatus(newStatus);
    });

    mediaPipeTracker.setHandsListener((points) => {
      setHandPoints(points);
      // Immediately test collision for detected index finger tip
      points.forEach((pt) => {
        onHandCollision(pt);
      });
    });
  }, [onHandCollision]);

  // Start or stop tracker
  useEffect(() => {
    if (isActive && videoRef.current) {
      mediaPipeTracker.start(videoRef.current);
    } else {
      mediaPipeTracker.stop();
      setHandPoints([]);
    }

    return () => {
      mediaPipeTracker.stop();
    };
  }, [isActive]);

  // Draw clean, compact single-finger pointer dot on screen (no giant skeleton)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isActive || handPoints.length === 0) return;

    const width = canvas.width;
    const height = canvas.height;

    handPoints.forEach((hand) => {
      const isP1 = hand.playerSide === 'p1';
      const themeColor = isP1 ? 'rgba(56, 189, 248, ' : 'rgba(251, 191, 36, ';
      const solidColor = isP1 ? '#38bdf8' : '#fbbf24';

      const px = hand.x * width;
      const py = hand.y * height;

      // 1. Compact soft ambient glow halo
      ctx.beginPath();
      ctx.arc(px, py, 22, 0, Math.PI * 2);
      ctx.fillStyle = `${themeColor}0.25)`;
      ctx.fill();

      // 2. Crisp target pointer ring (compact 16px radius)
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = solidColor;
      ctx.shadowColor = solidColor;
      ctx.shadowBlur = 12;
      ctx.stroke();

      // 3. Inner translucent fill
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fillStyle = `${themeColor}0.5)`;
      ctx.fill();

      // 4. Center bright pinpoint touch dot
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fill();

      // 5. Clean, compact label above fingertip
      ctx.font = 'bold 11px Fredoka, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#000000';
      ctx.fillText(isP1 ? '👆 Jari P1' : '👆 Jari P2', px, py - 20);
    });

    ctx.shadowBlur = 0;
  }, [handPoints, isActive]);

  // Window resize handler
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <>
      {/* Video element positioned off-screen to guarantee active decoding */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '640px',
          height: '480px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      {/* Full screen canvas for single-finger pointer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-30 w-full h-full"
      />

      {/* Floating Webcam Picture-In-Picture Monitor */}
      {isActive && (
        <div className="fixed bottom-3 right-3 z-40 bg-slate-900/95 backdrop-blur-md p-2.5 rounded-2xl border-2 border-cyan-400/60 shadow-2xl flex flex-col gap-1.5 transition-all">
          <div className="flex items-center justify-between gap-3 px-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Deteksi Jari Telunjuk</span>
            </div>
            <div className="flex items-center gap-2">
              {status.fps > 0 && (
                <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {status.fps} FPS
                </span>
              )}
              <button
                onClick={() => setShowVideoPreview(!showVideoPreview)}
                className="text-slate-400 hover:text-white transition-colors text-[11px] underline"
              >
                {showVideoPreview ? 'Tutup' : 'Buka'}
              </button>
            </div>
          </div>

          {showVideoPreview && (
            <div className="relative w-44 h-32 md:w-52 md:h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-700">
              {/* Mirrored video display */}
              <video
                ref={(el) => {
                  if (el && videoRef.current && videoRef.current.srcObject) {
                    el.srcObject = videoRef.current.srcObject;
                    el.play().catch(() => {});
                  }
                }}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover transform -scale-x-100 opacity-85"
              />

              {status.isLoading && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-2 text-center p-3">
                  <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                  <span className="text-xs text-slate-200 font-semibold">Memuat MediaPipe...</span>
                </div>
              )}

              {/* Hand Detection Counter Badge */}
              <div className="absolute bottom-1 left-1.5 flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-slate-950/85 px-1.5 py-0.5 rounded border border-emerald-500/40">
                <Hand className="w-3 h-3 text-emerald-400" />
                <span>{status.detectedHandsCount > 0 ? `${status.detectedHandsCount} Jari Aktif` : 'Arahkan Jari'}</span>
              </div>
            </div>
          )}

          {status.error ? (
            <div className="text-[11px] text-amber-300 max-w-52 leading-tight bg-amber-950/60 p-1.5 rounded-lg border border-amber-500/50">
              {status.error}
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 leading-tight">
              Arahkan 1 jari telunjuk ke gelembung untuk memecahkannya.
            </div>
          )}
        </div>
      )}
    </>
  );
};
