import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Question, BubbleItem, PlayerState } from '../types/game';
import { QuestionCard } from './QuestionCard';
import { soundFx } from '../services/soundEffects';
import { Sparkles, Trophy, Music, Volume2, VolumeX, Move, CheckCircle2, XCircle, Home, Clock } from 'lucide-react';

interface DragDropBoardProps {
  questions: Question[];
  timerSeconds?: number;
  onFinishGame: (finalScore: number, correctCount: number, totalCount: number) => void;
  onExit: () => void;
  onEmitParticle: (x: number, y: number, colorTheme: string, isCorrect: boolean) => void;
}

export const DragDropBoard: React.FC<DragDropBoardProps> = ({
  questions,
  timerSeconds = 0,
  onFinishGame,
  onExit,
  onEmitParticle,
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
  const [draggingBubbleId, setDraggingBubbleId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDropZoneActive, setIsDropZoneActive] = useState<boolean>(false);
  const [isAnsweringLocked, setIsAnsweringLocked] = useState(false);
  const [feedback, setFeedback] = useState<{ show: boolean; isCorrect: boolean; text: string } | null>(null);
  const [isMuted, setIsMuted] = useState(soundFx.getIsMuted());
  const [isBgmOn, setIsBgmOn] = useState(soundFx.getIsBgmPlaying());
  const [timeLeft, setTimeLeft] = useState<number>(timerSeconds);

  const currentQuestion = questions[currentIndex];
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  // Spawn bubbles for Drag & Drop
  const spawnBubbles = useCallback((q: Question) => {
    const themes: Array<'cyan' | 'emerald' | 'amber' | 'indigo' | 'rose'> = [
      'cyan', 'emerald', 'amber', 'indigo'
    ];

    // Position bubbles along bottom half in a friendly arc
    const positions = [
      { x: 18, y: 72 },
      { x: 38, y: 76 },
      { x: 62, y: 76 },
      { x: 82, y: 72 },
    ];

    const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);

    const newBubbles: BubbleItem[] = q.options.map((opt, idx) => {
      const isCorrect = idx === q.correctIndex;
      const pos = shuffledPositions[idx % shuffledPositions.length];
      return {
        id: `drag-${q.id}-${idx}-${Date.now()}`,
        text: opt,
        isCorrect,
        x: pos.x,
        y: pos.y,
        size: 135,
        speedY: 0,
        speedX: 0,
        wobbleOffset: Math.random() * 3,
        wobbleSpeed: 0.6,
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

  useEffect(() => {
    if (currentIndex < questions.length) {
      spawnBubbles(questions[currentIndex]);
    } else {
      onFinishGame(player.score, player.correctAnswers, questions.length);
    }
  }, [currentIndex, questions, spawnBubbles, onFinishGame, player.score, player.correctAnswers]);

  // Touch & Pointer Drag Handlers
  const handlePointerDown = (bubbleId: string, e: React.PointerEvent) => {
    if (isAnsweringLocked) return;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const rect = target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - (rect.left + rect.width / 2),
      y: e.clientY - (rect.top + rect.height / 2),
    });
    setDraggingBubbleId(bubbleId);
    soundFx.playBubblePop();
    onEmitParticle(e.clientX, e.clientY, 'cyan', false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingBubbleId || isAnsweringLocked) return;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const newX = Math.max(8, Math.min(92, ((e.clientX - dragOffset.x) / screenW) * 100));
    const newY = Math.max(15, Math.min(90, ((e.clientY - dragOffset.y) / screenH) * 100));

    setBubbles((prev) =>
      prev.map((b) => (b.id === draggingBubbleId ? { ...b, x: newX, y: newY } : b))
    );

    // Check hover over central Drop Zone
    if (dropZoneRef.current) {
      const dropRect = dropZoneRef.current.getBoundingClientRect();
      const inDrop =
        e.clientX >= dropRect.left &&
        e.clientX <= dropRect.right &&
        e.clientY >= dropRect.top &&
        e.clientY <= dropRect.bottom;
      setIsDropZoneActive(inDrop);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingBubbleId) return;
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);

    const draggedBubble = bubbles.find((b) => b.id === draggingBubbleId);
    setDraggingBubbleId(null);
    setIsDropZoneActive(false);

    if (!draggedBubble || isAnsweringLocked) return;

    // Check if released inside Drop Zone
    if (dropZoneRef.current) {
      const dropRect = dropZoneRef.current.getBoundingClientRect();
      const inDrop =
        e.clientX >= dropRect.left &&
        e.clientX <= dropRect.right &&
        e.clientY >= dropRect.top &&
        e.clientY <= dropRect.bottom;

      if (inDrop) {
        // Evaluate Drop
        evaluateDrop(draggedBubble, dropRect.left + dropRect.width / 2, dropRect.top + dropRect.height / 2);
      }
    }
  };

  const evaluateDrop = (bubble: BubbleItem, dropX: number, dropY: number) => {
    soundFx.playDragSnapSound();

    if (bubble.isCorrect) {
      soundFx.playCorrectSound();
      setIsAnsweringLocked(true);
      onEmitParticle(dropX, dropY, 'emerald', true);

      // Pop the bubble
      setBubbles((prev) => prev.map((b) => (b.id === bubble.id ? { ...b, popped: true } : b)));

      const newStreak = player.streak + 1;
      const streakBonus = (newStreak - 1) * 25;
      const gained = 100 + streakBonus;

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

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 1800);
    } else {
      soundFx.playWrongSound();
      onEmitParticle(dropX, dropY, 'rose', false);

      setPlayer((prev) => ({
        ...prev,
        score: Math.max(0, prev.score - 30),
        streak: 0,
        wrongAnswers: prev.wrongAnswers + 1,
      }));

      setFeedback({
        show: true,
        isCorrect: false,
        text: `"${bubble.text}" bukan jawaban yang tepat. Coba tarik gelembung lain!`,
      });

      // Animate bubble back down
      setBubbles((prev) =>
        prev.map((b) =>
          b.id === bubble.id
            ? { ...b, y: 78 }
            : b
        )
      );

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

  return (
    <div className="relative w-full h-screen overflow-hidden underwater-bg flex flex-col justify-between select-none">
      {/* Top HUD */}
      <header className="relative z-30 flex items-center justify-between px-6 py-2.5 border-b border-cyan-900/40 bg-slate-950/85 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            ✨
          </div>
          <div>
            <div className="text-[10px] text-emerald-300 font-bold tracking-wider">
              MODEL TARIK & COCOKKAN
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

      {/* Main Play Space */}
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

        {/* Central Sacred Drop Urn / Cauldron Target */}
        <div
          ref={dropZoneRef}
          style={{ top: '48%' }}
          className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-72 h-44 md:w-88 md:h-52 rounded-3xl border-3 border-dashed flex flex-col items-center justify-center p-4 transition-all duration-200 ${
            isDropZoneActive
              ? 'scale-105 bg-amber-950/80 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.6)]'
              : 'bg-slate-900/70 border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
          }`}
        >
          <div className="text-3xl mb-1 animate-bounce">🏺</div>
          <div className="font-fredoka text-lg md:text-xl font-bold text-amber-300 text-center">
            {isDropZoneActive ? 'LEPASKAN DI SINI!' : 'WADAH JAWABAN BENAR'}
          </div>
          <div className="text-xs text-slate-300 text-center font-medium mt-1">
            Sentuh & geser gelembung pilihanmu ke dalam wadah ini
          </div>
        </div>

        {/* Draggable 3D Answer Bubbles */}
        {bubbles.map((b) => {
          if (b.popped) return null;
          const isDragging = draggingBubbleId === b.id;
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
                transform: `translate(-50%, -50%) scale(${isDragging ? 1.15 : 1})`,
                zIndex: isDragging ? 50 : 25,
                touchAction: 'none',
                cursor: 'grab',
              }}
              onPointerDown={(e) => handlePointerDown(b.id, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="select-none flex items-center justify-center active:cursor-grabbing transition-transform"
            >
              <div
                className={`relative w-full h-full rounded-full ${themeClass} ${
                  isDragging ? 'shadow-[0_0_35px_rgba(255,255,255,0.7)]' : 'animate-bubble-wobble'
                } flex items-center justify-center p-3`}
              >
                <div className="bubble-specular" />
                <div className="bubble-bottom-rim" />

                <div className="relative z-10 text-center max-w-[88%] pointer-events-none">
                  <span className="font-fredoka font-bold text-white text-sm md:text-base leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                    {b.text}
                  </span>
                </div>

                {/* Hand Grab icon indicator */}
                <div className="absolute -top-2 right-1 w-6 h-6 rounded-full bg-slate-900/80 border border-white/60 flex items-center justify-center text-xs text-amber-300">
                  <Move className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
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
          💡 Gunakan jari untuk menarik (*drag*) gelembung ke dalam wadah di tengah layar!
        </div>

        <div className="font-mono text-cyan-400 font-bold">
          {currentIndex + 1} / {questions.length} Soal
        </div>
      </footer>
    </div>
  );
};
