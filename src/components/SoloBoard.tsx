import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Question, BubbleItem, PlayerState, HandPoint } from '../types/game';
import { Bubble3D } from './Bubble3D';
import { QuestionCard } from './QuestionCard';
import { soundFx } from '../services/soundEffects';
import { Trophy, Flame, Volume2, VolumeX, Music, CheckCircle2, XCircle, Home, Clock } from 'lucide-react';

interface SoloBoardProps {
  questions: Question[];
  timerSeconds?: number;
  onFinishGame: (finalScore: number, correctCount: number, totalCount: number) => void;
  onExit: () => void;
  onEmitParticle: (x: number, y: number, colorTheme: string, isCorrect: boolean) => void;
  registerCollisionCallback: (cb: (point: HandPoint) => void) => void;
}

export const SoloBoard: React.FC<SoloBoardProps> = ({
  questions,
  timerSeconds = 0,
  onFinishGame,
  onExit,
  onEmitParticle,
  registerCollisionCallback,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [player, setPlayer] = useState<PlayerState>({
    id: 'solo',
    name: 'Murid Hebat',
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    color: '#06b6d4',
  });

  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [isAnsweringLocked, setIsAnsweringLocked] = useState(false);
  const [feedback, setFeedback] = useState<{ show: boolean; isCorrect: boolean; text: string } | null>(null);
  const [isMuted, setIsMuted] = useState(soundFx.getIsMuted());
  const [isBgmOn, setIsBgmOn] = useState(soundFx.getIsBgmPlaying());
  const [timeLeft, setTimeLeft] = useState<number>(timerSeconds);

  const currentQuestion = questions[currentIndex];
  const animationFrameRef = useRef<number | null>(null);
  const bubblesRef = useRef<BubbleItem[]>([]);
  bubblesRef.current = bubbles;

  // Initialize bubbles for current question
  const spawnBubblesForQuestion = useCallback((q: Question) => {
    const themes: Array<'cyan' | 'emerald' | 'amber' | 'indigo' | 'rose'> = [
      'cyan', 'emerald', 'amber', 'indigo'
    ];

    // Distribute X evenly across screen
    const xPositions = [16, 38, 62, 84];
    const shuffledX = [...xPositions].sort(() => Math.random() - 0.5);

    const newBubbles: BubbleItem[] = q.options.map((opt, idx) => {
      const isCorrect = idx === q.correctIndex;
      return {
        id: `b-${q.id}-${idx}-${Date.now()}`,
        text: opt,
        isCorrect,
        x: shuffledX[idx % shuffledX.length] + (Math.random() * 4 - 2),
        y: 86 + (idx * 5),
        size: 135,
        speedY: 0.20 + Math.random() * 0.10,
        speedX: (Math.random() - 0.5) * 0.08,
        wobbleOffset: Math.random() * 3,
        wobbleSpeed: 0.5 + Math.random() * 0.8,
        colorTheme: themes[idx % themes.length],
        popped: false,
      };
    });

    setBubbles(newBubbles);
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

  // Set up question when index changes
  useEffect(() => {
    if (currentIndex < questions.length) {
      spawnBubblesForQuestion(questions[currentIndex]);
    } else {
      onFinishGame(player.score, player.correctAnswers, questions.length);
    }
  }, [currentIndex, questions, spawnBubblesForQuestion, onFinishGame, player.score, player.correctAnswers]);

  // Main float physics animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 16.66, 2);
      lastTime = currentTime;

      setBubbles((prev) =>
        prev.map((b) => {
          if (b.popped) return b;

          let newY = b.y - b.speedY * dt;
          let newX = b.x + b.speedX * dt;

          // Wrap horizontally inside boundaries
          if (newX < 10) newX = 10;
          if (newX > 90) newX = 90;

          // If bubble floats above screen below question box, respawn smoothly
          if (newY < 20) {
            newY = 92;
            newX = 15 + Math.random() * 70;
          }

          return {
            ...b,
            x: newX,
            y: newY,
          };
        })
      );

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle Bubble Pop
  const handlePop = useCallback(
    (bubble: BubbleItem, clientX?: number, clientY?: number) => {
      if (bubble.popped || isAnsweringLocked) return;

      const px = clientX ?? (bubble.x * window.innerWidth) / 100;
      const py = clientY ?? (bubble.y * window.innerHeight) / 100;

      // Sound
      soundFx.playBubblePop();

      // Particle explosion
      onEmitParticle(px, py, bubble.colorTheme, bubble.isCorrect);

      // Mark popped
      setBubbles((prev) =>
        prev.map((b) => (b.id === bubble.id ? { ...b, popped: true } : b))
      );

      if (bubble.isCorrect) {
        soundFx.playCorrectSound();
        setIsAnsweringLocked(true);

        const newStreak = player.streak + 1;
        const streakBonus = (newStreak - 1) * 20;
        const gainedScore = 100 + streakBonus;

        setPlayer((prev) => ({
          ...prev,
          score: prev.score + gainedScore,
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
          correctAnswers: prev.correctAnswers + 1,
        }));

        setFeedback({
          show: true,
          isCorrect: true,
          text: currentQuestion.explanation,
        });

        // Advance to next question after 1.8s
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 1800);
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
          text: `"${bubble.text}" bukan jawaban yang tepat. Ayo cari gelembung yang benar!`,
        });

        setTimeout(() => {
          setFeedback(null);
        }, 1500);
      }
    },
    [isAnsweringLocked, onEmitParticle, player.streak, currentQuestion]
  );

  const latestHandRef = useRef<HandPoint | null>(null);

  // High-sensitivity trajectory collision calculation
  const testHandCollision = useCallback(
    (handPoint: HandPoint) => {
      if (isAnsweringLocked) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const activeBubbles = bubblesRef.current;

      const currPx = handPoint.x * screenW;
      const currPy = handPoint.y * screenH;
      const prevPx = (handPoint.prevX ?? handPoint.x) * screenW;
      const prevPy = (handPoint.prevY ?? handPoint.y) * screenH;
      const vx = currPx - prevPx;
      const vy = currPy - prevPy;
      const segLenSq = vx * vx + vy * vy;

      for (const b of activeBubbles) {
        if (b.popped) continue;

        const bubblePx = (b.x * screenW) / 100;
        const bubblePy = (b.y * screenH) / 100;
        const radius = b.size / 2;
        const hitThreshold = radius + 25; // highly responsive & sensitive

        // 1. Direct point test
        const dx = currPx - bubblePx;
        const dy = currPy - bubblePy;
        if (dx * dx + dy * dy <= hitThreshold * hitThreshold) {
          handlePop(b, bubblePx, bubblePy);
          return;
        }

        // 2. Continuous swipe trajectory test (zero-miss fast swipes)
        if (segLenSq > 1) {
          const wx = bubblePx - prevPx;
          const wy = bubblePy - prevPy;
          const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / segLenSq));
          const projX = prevPx + t * vx;
          const projY = prevPy + t * vy;
          const distSq = (bubblePx - projX) * (bubblePx - projX) + (bubblePy - projY) * (bubblePy - projY);

          if (distSq <= hitThreshold * hitThreshold) {
            handlePop(b, bubblePx, bubblePy);
            return;
          }
        }
      }
    },
    [isAnsweringLocked, handlePop]
  );

  // Collision listener for single index finger tip
  useEffect(() => {
    registerCollisionCallback((handPoint: HandPoint) => {
      latestHandRef.current = handPoint;
      testHandCollision(handPoint);
    });
  }, [registerCollisionCallback, testHandCollision]);

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

  return (
    <div className="relative w-full h-screen overflow-hidden underwater-bg flex flex-col justify-between select-none">
      {/* Top Black HUD Bar */}
      <header className="relative z-30 flex items-center justify-between px-6 py-3 border-b border-cyan-900/40 bg-slate-950/85 backdrop-blur-md">
        {/* Left: Player Identity & Score */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-400 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              ⭐
            </div>
            <div>
              <div className="text-[11px] text-cyan-300 font-medium tracking-wide">MODE SOLO</div>
              <div className="text-base md:text-lg font-bold font-fredoka text-white">
                {player.name}
              </div>
            </div>
          </div>

          <div className="h-7 w-px bg-slate-800" />

          {/* Score Counter */}
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">SKOR ANDA</div>
              <div className="font-mono text-lg md:text-xl font-black text-amber-300 tabular-nums">
                {player.score}
              </div>
            </div>
          </div>

          {/* Streak indicator */}
          {player.streak > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 font-bold text-xs animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Combo x{player.streak}</span>
            </div>
          )}
        </div>

        {/* Center: Author Credit (di tengah layar bagian atas) */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 shadow-sm pointer-events-none">
          <span className="text-[11px] text-slate-300 font-medium">Game dibuat oleh</span>
          <span className="font-fredoka font-black text-amber-400 text-xs tracking-wide">HENDY FIRMANSYAH</span>
        </div>

        {/* Right: Audio & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Live Timer Indicator if active */}
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
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              isBgmOn
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Musik Latar Ceria"
          >
            <Music className="w-4 h-4" />
            <span className="hidden md:inline">{isBgmOn ? 'BGM' : 'BGM Off'}</span>
          </button>

          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Efek Suara"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Home / Menu Button */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/50 rounded-xl transition-colors whitespace-nowrap shadow-md"
            title="Kembali ke Halaman Awal"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <main className="relative flex-1 w-full overflow-hidden">
        {/* KOTAK SOAL PERSIS DI ATAS / DI BAWAH BAR HITAM */}
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

        {/* Floating 3D Answer Bubbles rising in the open play space */}
        {bubbles.map((bubble) => (
          <Bubble3D
            key={bubble.id}
            bubble={bubble}
            onPop={(b, cx, cy) => handlePop(b, cx, cy)}
          />
        ))}
      </main>

      {/* Bottom Info Footer */}
      <footer className="relative z-20 px-6 py-2.5 border-t border-cyan-900/30 bg-slate-950/70 backdrop-blur-md flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Benar: {player.correctAnswers}</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 font-medium">
            <XCircle className="w-3.5 h-3.5" />
            <span>Salah: {player.wrongAnswers}</span>
          </div>
        </div>

        <div className="text-center font-medium text-slate-300">
          💡 Tips: Sentuh gelembung air di papan interaktif atau kibaskan jari tanganmu di kamera MediaPipe!
        </div>

        <div className="font-mono text-cyan-400 font-bold">
          {currentIndex + 1} / {questions.length} Soal
        </div>
      </footer>
    </div>
  );
};
