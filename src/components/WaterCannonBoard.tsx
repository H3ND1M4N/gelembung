import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Question, BubbleItem, PlayerState } from '../types/game';
import { QuestionCard } from './QuestionCard';
import { soundFx } from '../services/soundEffects';
import { Crosshair, Trophy, Music, Volume2, VolumeX, CheckCircle2, XCircle, Home, Clock } from 'lucide-react';

interface WaterCannonBoardProps {
  questions: Question[];
  timerSeconds?: number;
  onFinishGame: (finalScore: number, correctCount: number, totalCount: number) => void;
  onExit: () => void;
  onEmitParticle: (x: number, y: number, colorTheme: string, isCorrect: boolean) => void;
}

interface Projectile {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  targetBubble: BubbleItem;
  progress: number; // 0 to 1
}

export const WaterCannonBoard: React.FC<WaterCannonBoardProps> = ({
  questions,
  timerSeconds = 0,
  onFinishGame,
  onExit,
  onEmitParticle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [player, setPlayer] = useState<PlayerState>({
    id: 'solo',
    name: 'Penembak Jitu PAI',
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    color: '#06b6d4',
  });

  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [cannonAngle, setCannonAngle] = useState<number>(0); // degrees (-60 to +60)
  const [activeProjectile, setActiveProjectile] = useState<Projectile | null>(null);
  const [isAnsweringLocked, setIsAnsweringLocked] = useState(false);
  const [feedback, setFeedback] = useState<{ show: boolean; isCorrect: boolean; text: string } | null>(null);
  const [isMuted, setIsMuted] = useState(soundFx.getIsMuted());
  const [isBgmOn, setIsBgmOn] = useState(soundFx.getIsBgmPlaying());
  const [timeLeft, setTimeLeft] = useState<number>(timerSeconds);

  const currentQuestion = questions[currentIndex];
  const animFrameRef = useRef<number | null>(null);

  // Spawn bubbles in floating row
  const spawnBubbles = useCallback((q: Question) => {
    const themes: Array<'cyan' | 'emerald' | 'amber' | 'indigo' | 'rose'> = [
      'cyan', 'emerald', 'amber', 'indigo'
    ];
    const xPos = [16, 38, 62, 84];
    const shuffledX = [...xPos].sort(() => Math.random() - 0.5);

    const newBubbles: BubbleItem[] = q.options.map((opt, idx) => {
      const isCorrect = idx === q.correctIndex;
      return {
        id: `cannon-${q.id}-${idx}-${Date.now()}`,
        text: opt,
        isCorrect,
        x: shuffledX[idx % shuffledX.length],
        y: 48 + (idx % 2 === 0 ? -3 : 4),
        size: 135,
        speedY: 0,
        speedX: 0,
        wobbleOffset: Math.random() * 3,
        wobbleSpeed: 0.5,
        colorTheme: themes[idx % themes.length],
        popped: false,
      };
    });

    setBubbles(newBubbles);
    setActiveProjectile(null);
    setIsAnsweringLocked(false);
    setFeedback(null);
    if (timerSeconds > 0) {
      setTimeLeft(timerSeconds);
    }
  }, [timerSeconds]);

  // Handle Timeout
  const handleTimeOut = useCallback(() => {
    if (isAnsweringLocked || !currentQuestion) return;
    soundFx.playWrongSound();
    setIsAnsweringLocked(true);

    setPlayer((prev) => ({
      ...prev,
      score: Math.max(0, prev.score - 15),
      streak: 0,
      wrongAnswers: prev.wrongAnswers + 1,
    }));

    setFeedback({
      show: true,
      isCorrect: false,
      text: `⏱️ Waktu habis! Jawaban yang benar: ${currentQuestion.options[currentQuestion.correctIndex]}`,
    });

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 2000);
  }, [isAnsweringLocked, currentQuestion]);

  // Countdown timer effect
  useEffect(() => {
    if (!timerSeconds || timerSeconds <= 0 || isAnsweringLocked) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        if (prev <= 5) {
          soundFx.playCountdownTick(prev === 1);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isAnsweringLocked, timerSeconds, handleTimeOut]);

  useEffect(() => {
    if (currentIndex < questions.length) {
      spawnBubbles(questions[currentIndex]);
    } else {
      onFinishGame(player.score, player.correctAnswers, questions.length);
    }
  }, [currentIndex, questions, spawnBubbles, onFinishGame, player.score, player.correctAnswers]);

  // Projectile flight animation loop
  useEffect(() => {
    if (!activeProjectile) return;

    let p = activeProjectile.progress;

    const step = () => {
      p += 0.08;
      if (p >= 1) {
        // Impact
        handleImpact(activeProjectile.targetBubble, activeProjectile.targetX, activeProjectile.targetY);
        setActiveProjectile(null);
      } else {
        setActiveProjectile((prev) => (prev ? { ...prev, progress: p } : null));
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeProjectile]);

  // Fire cannon towards a chosen bubble
  const handleTargetBubble = (b: BubbleItem) => {
    if (isAnsweringLocked || activeProjectile || b.popped) return;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const cannonX = screenW / 2;
    const cannonY = screenH - 80;

    const targetPx = (b.x * screenW) / 100;
    const targetPy = (b.y * screenH) / 100;

    // Calculate angle in degrees
    const angleRad = Math.atan2(targetPx - cannonX, -(targetPy - cannonY));
    const angleDeg = (angleRad * 180) / Math.PI;
    setCannonAngle(angleDeg);

    soundFx.playCannonShootSound();

    setActiveProjectile({
      x: cannonX,
      y: cannonY,
      targetX: targetPx,
      targetY: targetPy,
      targetBubble: b,
      progress: 0,
    });
  };

  const handleImpact = (bubble: BubbleItem, px: number, py: number) => {
    soundFx.playBubblePop();
    onEmitParticle(px, py, bubble.colorTheme, bubble.isCorrect);

    setBubbles((prev) =>
      prev.map((b) => (b.id === bubble.id ? { ...b, popped: true } : b))
    );

    if (bubble.isCorrect) {
      soundFx.playCorrectSound();
      setIsAnsweringLocked(true);

      const newStreak = player.streak + 1;
      const gained = 100 + (newStreak - 1) * 20;

      setPlayer((prev) => ({
        ...prev,
        score: prev.score + gained,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        correctAnswers: prev.correctAnswers + 1,
      }));

      setFeedback({
        show: true,
        isCorrect: true,
        text: currentQuestion.explanation,
      });

      setTimeout(() => setCurrentIndex((prev) => prev + 1), 1800);
    } else {
      soundFx.playWrongSound();

      setPlayer((prev) => ({
        ...prev,
        score: Math.max(0, prev.score - 30),
        streak: 0,
        wrongAnswers: prev.wrongAnswers + 1,
      }));

      setFeedback({
        show: true,
        isCorrect: false,
        text: `Tembakan meleset dari jawaban yang tepat! Silakan bidik gelembung lainnya!`,
      });

      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFx.setMuted(next);
  };

  const toggleBgm = () => {
    const next = soundFx.toggleBGM();
    setIsBgmOn(next);
  };

  if (!currentQuestion) return null;

  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 700;
  const cannonBaseX = screenW / 2;
  const cannonBaseY = screenH - 75;

  const currentProjX = activeProjectile
    ? cannonBaseX + (activeProjectile.targetX - cannonBaseX) * activeProjectile.progress
    : 0;
  const currentProjY = activeProjectile
    ? cannonBaseY + (activeProjectile.targetY - cannonBaseY) * activeProjectile.progress
    : 0;

  return (
    <div className="relative w-full h-screen overflow-hidden underwater-bg flex flex-col justify-between select-none">
      {/* Top HUD */}
      <header className="relative z-30 flex items-center justify-between px-6 py-2.5 border-b border-cyan-900/40 bg-slate-950/85 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-400 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            🎯
          </div>
          <div>
            <div className="text-[10px] text-cyan-300 font-bold tracking-wider">
              MODEL MERIAM AIR
            </div>
            <div className="text-base font-bold font-fredoka text-white">{player.name}</div>
          </div>
          <div className="h-7 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] text-slate-400">SKOR</div>
            <div className="font-mono text-lg font-black text-amber-300 tabular-nums">
              {player.score}
            </div>
          </div>
        </div>

        {/* Center: Author Credit (di tengah layar bagian atas) */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 shadow-sm pointer-events-none">
          <span className="text-[11px] text-slate-300 font-medium">Game dibuat oleh</span>
          <span className="font-fredoka font-black text-amber-400 text-xs tracking-wide">HENDY FIRMANSYAH</span>
        </div>

        <div className="flex items-center gap-2.5">
          {timerSeconds > 0 && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs md:text-sm ${
                timeLeft <= 5
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-bounce'
                  : timeLeft <= 10
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-cyan-500/50 text-cyan-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
          )}

          <button
            onClick={toggleBgm}
            className={`p-2 rounded-xl border text-xs font-semibold ${
              isBgmOn ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
            title="Musik Latar Ceria"
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300"
            title="Suara Efek"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/50 rounded-xl transition-colors whitespace-nowrap shadow-md cursor-pointer"
            title="Kembali ke Halaman Awal"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <main className="relative flex-1 w-full overflow-hidden flex flex-col items-center">
        {/* Question Card at Top */}
        <div className="absolute top-2 inset-x-0 mx-auto z-20 w-full flex justify-center px-4 pointer-events-none">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            timeLeft={timerSeconds > 0 ? timeLeft : undefined}
            streak={player.streak}
            explanationFeedback={feedback}
          />
        </div>

        {/* Floating Answer Bubbles Targets */}
        <div className="relative w-full h-[65%] pt-28 flex items-center justify-center">
          {bubbles.map((b) => {
            if (b.popped) return null;
            const themeClass = {
              cyan: 'bubble-3d-cyan',
              emerald: 'bubble-3d-emerald',
              amber: 'bubble-3d-amber',
              indigo: 'bubble-3d-indigo',
              rose: 'bubble-3d-rose',
            }[b.colorTheme] || 'bubble-3d-cyan';

            return (
              <div
                key={b.id}
                style={{
                  position: 'absolute',
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => handleTargetBubble(b)}
                className="cursor-pointer group select-none z-20 flex items-center justify-center"
              >
                <div
                  className={`relative w-full h-full rounded-full ${themeClass} animate-bubble-wobble flex items-center justify-center p-3 group-hover:scale-105 active:scale-95 transition-transform`}
                >
                  <div className="bubble-specular" />
                  <div className="bubble-bottom-rim" />

                  <div className="relative z-10 text-center max-w-[88%] pointer-events-none">
                    <span className="font-fredoka font-bold text-white text-sm md:text-base leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                      {b.text}
                    </span>
                  </div>

                  {/* Target Crosshair Badge */}
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-md">
                    <Crosshair className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* In-Flight Water Projectile */}
        {activeProjectile && (
          <div
            style={{
              position: 'fixed',
              left: `${currentProjX}px`,
              top: `${currentProjY}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="w-8 h-8 rounded-full bg-cyan-200 border-2 border-white shadow-[0_0_25px_rgba(56,189,248,1)] z-40 pointer-events-none animate-ping"
          />
        )}

        {/* Giant Bottom Water Cannon / Blaster */}
        <div className="relative z-25 flex flex-col items-center pb-3">
          <div className="text-xs font-semibold text-cyan-300 mb-2 bg-slate-900/80 px-4 py-1 rounded-full border border-cyan-500/40">
            🎯 Ketuk gelembung jawaban di atas untuk menembak meriam air!
          </div>

          <div className="relative w-36 h-28 flex items-center justify-center">
            {/* Cannon Turret Barrel */}
            <div
              style={{
                transform: `rotate(${cannonAngle}deg)`,
                transformOrigin: 'bottom center',
              }}
              className="absolute bottom-6 w-8 h-20 bg-gradient-to-t from-cyan-800 to-cyan-400 rounded-t-xl border-2 border-cyan-200 shadow-2xl transition-transform duration-150 flex items-start justify-center pt-1"
            >
              <div className="w-5 h-2 rounded-full bg-white/80 shadow-[0_0_10px_white]" />
            </div>

            {/* Cannon Dome Mount */}
            <div className="absolute bottom-0 w-24 h-14 bg-gradient-to-t from-slate-900 to-cyan-700 rounded-t-full border-2 border-cyan-300 shadow-2xl flex items-center justify-center text-xl">
              💧
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 px-6 py-2 border-t border-cyan-900/30 bg-slate-950/70 backdrop-blur-md flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Benar: {player.correctAnswers}
          </span>
          <span className="text-rose-400 font-semibold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Salah: {player.wrongAnswers}
          </span>
        </div>

        <div className="text-slate-300 font-medium">
          💡 Cukup sentuh gelembung di papan interaktif, meriam akan otomatis membidik dan meledakkannya!
        </div>

        <div className="font-mono text-cyan-400 font-bold">
          {currentIndex + 1} / {questions.length} Soal
        </div>
      </footer>
    </div>
  );
};
