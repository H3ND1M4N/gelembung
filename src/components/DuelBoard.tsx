import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Question, BubbleItem, PlayerState, HandPoint } from '../types/game';
import { Bubble3D } from './Bubble3D';
import { QuestionCard } from './QuestionCard';
import { soundFx } from '../services/soundEffects';
import { Swords, Trophy, Flame, Music, Volume2, VolumeX, Shield, Award, Home, Clock } from 'lucide-react';

interface DuelBoardProps {
  questions: Question[];
  timerSeconds?: number;
  player1Name?: string;
  player2Name?: string;
  onFinishDuel: (winner: PlayerState | null, p1: PlayerState, p2: PlayerState) => void;
  onExit: () => void;
  onEmitParticle: (x: number, y: number, colorTheme: string, isCorrect: boolean) => void;
  registerCollisionCallback: (cb: (point: HandPoint) => void) => void;
}

export const DuelBoard: React.FC<DuelBoardProps> = ({
  questions,
  timerSeconds = 0,
  player1Name = 'Tim Biru (Bilal)',
  player2Name = 'Tim Emas (Salman)',
  onFinishDuel,
  onExit,
  onEmitParticle,
  registerCollisionCallback,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [p1, setP1] = useState<PlayerState>({
    id: 'p1',
    name: player1Name,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    color: '#0284c7',
  });

  const [p2, setP2] = useState<PlayerState>({
    id: 'p2',
    name: player2Name,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    color: '#d97706',
  });

  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [roundWinner, setRoundWinner] = useState<'p1' | 'p2' | null>(null);
  const [roundFeedback, setRoundFeedback] = useState<{ show: boolean; isCorrect: boolean; text: string } | null>(null);
  const [isMuted, setIsMuted] = useState(soundFx.getIsMuted());
  const [isBgmOn, setIsBgmOn] = useState(soundFx.getIsBgmPlaying());
  const [timeLeft, setTimeLeft] = useState<number>(timerSeconds);

  const currentQuestion = questions[currentIndex];
  const animationFrameRef = useRef<number | null>(null);
  const bubblesRef = useRef<BubbleItem[]>([]);
  bubblesRef.current = bubbles;

  // Spawn separate bubble streams for Player 1 (left) and Player 2 (right)
  const spawnDuelBubbles = useCallback((q: Question) => {
    const leftPositions = [12, 24, 36, 44];
    const rightPositions = [56, 68, 80, 88];

    const shuffledLeft = [...leftPositions].sort(() => Math.random() - 0.5);
    const shuffledRight = [...rightPositions].sort(() => Math.random() - 0.5);

    const duelBubbles: BubbleItem[] = [];

    // P1 bubbles (Left half)
    q.options.forEach((opt, idx) => {
      const isCorrect = idx === q.correctIndex;
      duelBubbles.push({
        id: `p1-b-${q.id}-${idx}-${Date.now()}`,
        text: opt,
        isCorrect,
        x: shuffledLeft[idx % shuffledLeft.length],
        y: 86 + idx * 5,
        size: 130,
        speedY: 0.20 + Math.random() * 0.1,
        speedX: (Math.random() - 0.5) * 0.05,
        wobbleOffset: Math.random() * 3,
        wobbleSpeed: 0.6 + Math.random() * 0.8,
        colorTheme: idx % 2 === 0 ? 'cyan' : 'indigo',
        playerSide: 'p1',
        popped: false,
      });
    });

    // P2 bubbles (Right half)
    q.options.forEach((opt, idx) => {
      const isCorrect = idx === q.correctIndex;
      duelBubbles.push({
        id: `p2-b-${q.id}-${idx}-${Date.now()}`,
        text: opt,
        isCorrect,
        x: shuffledRight[idx % shuffledRight.length],
        y: 86 + idx * 5,
        size: 130,
        speedY: 0.20 + Math.random() * 0.1,
        speedX: (Math.random() - 0.5) * 0.05,
        wobbleOffset: Math.random() * 3,
        wobbleSpeed: 0.6 + Math.random() * 0.8,
        colorTheme: idx % 2 === 0 ? 'amber' : 'emerald',
        playerSide: 'p2',
        popped: false,
      });
    });

    setBubbles(duelBubbles);
    setIsRoundLocked(false);
    setRoundWinner(null);
    setRoundFeedback(null);
    if (timerSeconds > 0) {
      setTimeLeft(timerSeconds);
    }
  }, [timerSeconds]);

  // Handle Timeout in Duel
  const handleTimeOut = useCallback(() => {
    if (isRoundLocked || !currentQuestion) return;
    soundFx.playWrongSound();
    setIsRoundLocked(true);

    setRoundFeedback({
      show: true,
      isCorrect: false,
      text: `⏱️ Waktu habis! Jawaban benar: ${currentQuestion.options[currentQuestion.correctIndex]}`,
    });

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 2200);
  }, [isRoundLocked, currentQuestion]);

  // Countdown timer effect
  useEffect(() => {
    if (!timerSeconds || timerSeconds <= 0 || isRoundLocked) return;

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
  }, [currentIndex, isRoundLocked, timerSeconds, handleTimeOut]);

  // Update question when index shifts
  useEffect(() => {
    if (currentIndex < questions.length) {
      spawnDuelBubbles(questions[currentIndex]);
    } else {
      let overallWinner: PlayerState | null = null;
      if (p1.score > p2.score) overallWinner = p1;
      else if (p2.score > p1.score) overallWinner = p2;
      onFinishDuel(overallWinner, p1, p2);
    }
  }, [currentIndex, questions, spawnDuelBubbles, onFinishDuel, p1, p2]);

  // Main float physics animation
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

          // Boundaries based on player side
          if (b.playerSide === 'p1') {
            if (newX < 8) newX = 8;
            if (newX > 45) newX = 45;
          } else {
            if (newX < 55) newX = 55;
            if (newX > 92) newX = 92;
          }

          // Respawn at bottom when floating up
          if (newY < 20) {
            newY = 92;
            newX = b.playerSide === 'p1' ? 12 + Math.random() * 30 : 58 + Math.random() * 30;
          }

          return { ...b, x: newX, y: newY };
        })
      );

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Handle Bubble Pop in Duel Mode
  const handlePop = useCallback(
    (bubble: BubbleItem, clientX?: number, clientY?: number, detectedSide?: 'p1' | 'p2') => {
      if (bubble.popped || isRoundLocked) return;

      const px = clientX ?? (bubble.x * window.innerWidth) / 100;
      const py = clientY ?? (bubble.y * window.innerHeight) / 100;

      const popperSide: 'p1' | 'p2' = detectedSide || (bubble.playerSide === 'p1' ? 'p1' : 'p2');

      soundFx.playBubblePop();
      onEmitParticle(px, py, bubble.colorTheme, bubble.isCorrect);

      // Pop the bubble
      setBubbles((prev) =>
        prev.map((b) => (b.id === bubble.id ? { ...b, popped: true } : b))
      );

      if (bubble.isCorrect) {
        soundFx.playCorrectSound();
        setIsRoundLocked(true);
        setRoundWinner(popperSide);

        if (popperSide === 'p1') {
          setP1((prev) => ({
            ...prev,
            score: prev.score + 100 + prev.streak * 20,
            streak: prev.streak + 1,
            maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
            correctAnswers: prev.correctAnswers + 1,
          }));
          setP2((prev) => ({ ...prev, streak: 0 }));
        } else {
          setP2((prev) => ({
            ...prev,
            score: prev.score + 100 + prev.streak * 20,
            streak: prev.streak + 1,
            maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
            correctAnswers: prev.correctAnswers + 1,
          }));
          setP1((prev) => ({ ...prev, streak: 0 }));
        }

        setRoundFeedback({
          show: true,
          isCorrect: true,
          text: `${popperSide === 'p1' ? p1.name : p2.name} menjawab benar! ${currentQuestion.explanation}`,
        });

        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 2000);
      } else {
        soundFx.playWrongSound();

        if (popperSide === 'p1') {
          setP1((prev) => ({
            ...prev,
            score: Math.max(0, prev.score - 30),
            streak: 0,
            wrongAnswers: prev.wrongAnswers + 1,
          }));
        } else {
          setP2((prev) => ({
            ...prev,
            score: Math.max(0, prev.score - 30),
            streak: 0,
            wrongAnswers: prev.wrongAnswers + 1,
          }));
        }

        setRoundFeedback({
          show: true,
          isCorrect: false,
          text: `"${bubble.text}" salah! Kesempatan terbuka untuk lawan!`,
        });

        setTimeout(() => {
          setRoundFeedback(null);
        }, 1300);
      }
    },
    [isRoundLocked, onEmitParticle, p1.name, p2.name, currentQuestion]
  );

  // High-sensitivity trajectory collision calculation for Duel Mode
  const testHandCollision = useCallback(
    (handPoint: HandPoint) => {
      if (isRoundLocked) return;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const handSide: 'p1' | 'p2' = handPoint.x < 0.5 ? 'p1' : 'p2';

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
        if (b.playerSide !== handSide) continue;

        const bubblePx = (b.x * screenW) / 100;
        const bubblePy = (b.y * screenH) / 100;
        const radius = b.size / 2;
        const hitThreshold = radius + 25; // sensitive & responsive

        // 1. Direct point test
        const dx = currPx - bubblePx;
        const dy = currPy - bubblePy;
        if (dx * dx + dy * dy <= hitThreshold * hitThreshold) {
          handlePop(b, bubblePx, bubblePy, handSide);
          return;
        }

        // 2. Continuous swipe trajectory test
        if (segLenSq > 1) {
          const wx = bubblePx - prevPx;
          const wy = bubblePy - prevPy;
          const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / segLenSq));
          const projX = prevPx + t * vx;
          const projY = prevPy + t * vy;
          const distSq = (bubblePx - projX) * (bubblePx - projX) + (bubblePy - projY) * (bubblePy - projY);

          if (distSq <= hitThreshold * hitThreshold) {
            handlePop(b, bubblePx, bubblePy, handSide);
            return;
          }
        }
      }
    },
    [isRoundLocked, handlePop]
  );

  // Collision detection for single index finger tip
  useEffect(() => {
    registerCollisionCallback((handPoint: HandPoint) => {
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
      {/* Center Dividing Field Line */}
      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gradient-to-b from-cyan-500/10 via-amber-500/30 to-cyan-500/10 z-5 pointer-events-none" />

      {/* Top Black HUD Bar */}
      <header className="relative z-30 flex items-center justify-between px-6 py-2.5 border-b border-cyan-900/40 bg-slate-950/85 backdrop-blur-md">
        {/* P1 Zone (Blue) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border-2 border-cyan-400 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            🛡️
          </div>
          <div>
            <div className="text-[10px] text-cyan-300 font-bold tracking-wider">PEMAIN 1 (KIRI)</div>
            <div className="text-sm md:text-base font-bold font-fredoka text-white truncate max-w-36">
              {p1.name}
            </div>
            <div className="font-mono text-lg md:text-xl font-black text-cyan-300 tabular-nums">
              {p1.score} <span className="text-[10px] text-slate-400 font-normal">PTS</span>
            </div>
          </div>

          {p1.streak > 1 && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-300 text-[11px] font-bold animate-pulse">
              <Flame className="w-3 h-3" />
              <span>x{p1.streak}</span>
            </div>
          )}
        </div>

        {/* Center: Duel VS Emblem, Live Timer & Audio */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            {/* Live Timer in Duel */}
            {timerSeconds > 0 && (
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border font-mono font-bold text-xs ${
                  timeLeft <= 5
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-bounce'
                    : timeLeft <= 10
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-cyan-500/50 text-cyan-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            )}

            <button
              onClick={toggleBgm}
              className={`p-1.5 rounded-xl border text-xs ${
                isBgmOn ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
              title="Musik Latar Ceria"
            >
              <Music className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-inner">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-fredoka font-black text-xs md:text-sm text-amber-300">
                DUEL ROUND {currentIndex + 1}/{questions.length}
              </span>
            </div>
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300"
              title="Suara"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Home button in Duel */}
            <button
              onClick={onExit}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 rounded-xl transition-colors shadow-sm"
              title="Kembali ke Halaman Awal"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-400 font-medium text-center">
            Game dibuat oleh <span className="font-bold text-amber-400">HENDY FIRMANSYAH</span>
          </div>
        </div>

        {/* P2 Zone (Gold) */}
        <div className="flex items-center gap-3 text-right">
          {p2.streak > 1 && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-300 text-[11px] font-bold animate-pulse">
              <Flame className="w-3 h-3" />
              <span>x{p2.streak}</span>
            </div>
          )}
          <div>
            <div className="text-[10px] text-amber-300 font-bold tracking-wider">PEMAIN 2 (KANAN)</div>
            <div className="text-sm md:text-base font-bold font-fredoka text-white truncate max-w-36">
              {p2.name}
            </div>
            <div className="font-mono text-lg md:text-xl font-black text-amber-300 tabular-nums">
              {p2.score} <span className="text-[10px] text-slate-400 font-normal">PTS</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-600/30 border-2 border-amber-400 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            ⚔️
          </div>
        </div>
      </header>

      {/* Main Duel Battlefield Area */}
      <main className="relative flex-1 w-full overflow-hidden">
        {/* KOTAK SOAL PERSIS DI ATAS / DI BAWAH BAR HITAM */}
        <div className="absolute top-2 inset-x-0 mx-auto z-20 w-full flex justify-center px-4 pointer-events-none">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            timeLeft={timerSeconds > 0 ? timeLeft : undefined}
            streak={0}
            explanationFeedback={roundFeedback}
          />
        </div>

        {/* Floating 3D Bubbles for both players */}
        {bubbles.map((bubble) => (
          <Bubble3D
            key={bubble.id}
            bubble={bubble}
            onPop={(b, cx, cy) => handlePop(b, cx, cy, b.playerSide === 'p1' ? 'p1' : 'p2')}
          />
        ))}
      </main>

      {/* Duel Footer Status */}
      <footer className="relative z-20 px-6 py-2 border-t border-cyan-900/30 bg-slate-950/70 backdrop-blur-md flex items-center justify-between text-xs text-slate-400">
        <div className="text-cyan-300 font-semibold flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>Zona Pemain 1: Pecahkan gelembung di sisi KIRI layar!</span>
        </div>

        <div className="text-slate-300 font-medium text-[11px]">
          Cepat & Tepat: Murid yang pertama memecahkan jawaban benar mendapat poin!
        </div>

        <div className="text-amber-300 font-semibold flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          <span>Zona Pemain 2: Pecahkan gelembung di sisi KANAN layar!</span>
        </div>
      </footer>
    </div>
  );
};
