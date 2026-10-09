import React, { useState, useEffect, useCallback } from 'react';
import { Question, BubbleItem, PlayerState } from '../types/game';
import { Bubble3D } from './Bubble3D';
import { QuestionCard } from './QuestionCard';
import { soundFx } from '../services/soundEffects';
import { Bell, Flame, Swords, Shield, Award, Volume2, VolumeX, Music, Clock, Home } from 'lucide-react';

interface BuzzerDuelBoardProps {
  questions: Question[];
  timerSeconds?: number;
  player1Name?: string;
  player2Name?: string;
  onFinishDuel: (winner: PlayerState | null, p1: PlayerState, p2: PlayerState) => void;
  onExit: () => void;
  onEmitParticle: (x: number, y: number, colorTheme: string, isCorrect: boolean) => void;
}

export const BuzzerDuelBoard: React.FC<BuzzerDuelBoardProps> = ({
  questions,
  timerSeconds = 0,
  player1Name = 'Tim Biru (Abu Bakar)',
  player2Name = 'Tim Emas (Umar bin Khattab)',
  onFinishDuel,
  onExit,
  onEmitParticle,
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
  // Buzzer State: 'IDLE' | 'BUZZED' | 'STEAL_CHANCE' | 'RESOLVED'
  const [buzzerState, setBuzzerState] = useState<'IDLE' | 'BUZZED' | 'STEAL_CHANCE' | 'RESOLVED'>('IDLE');
  const [activeBuzzerPlayer, setActiveBuzzerPlayer] = useState<'p1' | 'p2' | null>(null);
  const [answerTimeLeft, setAnswerTimeLeft] = useState<number>(7);
  const [roundFeedback, setRoundFeedback] = useState<{ show: boolean; isCorrect: boolean; text: string } | null>(null);
  const [isMuted, setIsMuted] = useState(soundFx.getIsMuted());
  const [isBgmOn, setIsBgmOn] = useState(soundFx.getIsBgmPlaying());

  const currentQuestion = questions[currentIndex];

  // Spawn bubbles across upper center area
  const spawnBubbles = useCallback((q: Question) => {
    const themes: Array<'cyan' | 'emerald' | 'amber' | 'indigo' | 'rose'> = [
      'cyan', 'emerald', 'amber', 'indigo'
    ];
    const xPos = [18, 38, 62, 82];
    const shuffledX = [...xPos].sort(() => Math.random() - 0.5);

    const newBubbles: BubbleItem[] = q.options.map((opt, idx) => {
      const isCorrect = idx === q.correctIndex;
      return {
        id: `buzz-${q.id}-${idx}-${Date.now()}`,
        text: opt,
        isCorrect,
        x: shuffledX[idx % shuffledX.length],
        y: 52 + (idx % 2 === 0 ? -4 : 6),
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
    setBuzzerState('IDLE');
    setActiveBuzzerPlayer(null);
    setAnswerTimeLeft(7);
    setRoundFeedback(null);
  }, []);

  useEffect(() => {
    if (currentIndex < questions.length) {
      spawnBubbles(questions[currentIndex]);
    } else {
      let winner: PlayerState | null = null;
      if (p1.score > p2.score) winner = p1;
      else if (p2.score > p1.score) winner = p2;
      onFinishDuel(winner, p1, p2);
    }
  }, [currentIndex, questions, spawnBubbles, onFinishDuel, p1, p2]);

  // Answer countdown timer when a player has buzzed
  useEffect(() => {
    let timer: number | null = null;
    if ((buzzerState === 'BUZZED' || buzzerState === 'STEAL_CHANCE') && answerTimeLeft > 0) {
      timer = window.setInterval(() => {
        setAnswerTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [buzzerState, answerTimeLeft]);

  // Hit Buzzer Handler
  const handleHitBuzzer = (playerSide: 'p1' | 'p2') => {
    if (buzzerState !== 'IDLE') return;

    soundFx.playBuzzerSound();
    setActiveBuzzerPlayer(playerSide);
    setBuzzerState('BUZZED');
    setAnswerTimeLeft(7);
  };

  const handleTimeOut = () => {
    soundFx.playWrongSound();

    if (buzzerState === 'BUZZED' && activeBuzzerPlayer) {
      // Penalty for timeout, give opponent a steal chance!
      const opponent = activeBuzzerPlayer === 'p1' ? 'p2' : 'p1';
      if (activeBuzzerPlayer === 'p1') {
        setP1((prev) => ({ ...prev, score: Math.max(0, prev.score - 20) }));
      } else {
        setP2((prev) => ({ ...prev, score: Math.max(0, prev.score - 20) }));
      }

      setActiveBuzzerPlayer(opponent);
      setBuzzerState('STEAL_CHANCE');
      setAnswerTimeLeft(5);

      setRoundFeedback({
        show: true,
        isCorrect: false,
        text: `Waktu habis! Kesempatan merebut untuk ${opponent === 'p1' ? p1.name : p2.name}!`,
      });
    } else {
      // Both failed
      setBuzzerState('RESOLVED');
      setRoundFeedback({
        show: true,
        isCorrect: false,
        text: `Ronde berakhir. Jawaban yang benar adalah: ${currentQuestion.options[currentQuestion.correctIndex]}`,
      });
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 2200);
    }
  };

  // Pop Bubble Handler
  const handlePop = (bubble: BubbleItem, clientX: number, clientY: number) => {
    if (buzzerState === 'IDLE' || buzzerState === 'RESOLVED' || !activeBuzzerPlayer) return;

    soundFx.playBubblePop();
    onEmitParticle(clientX, clientY, bubble.colorTheme, bubble.isCorrect);

    setBubbles((prev) =>
      prev.map((b) => (b.id === bubble.id ? { ...b, popped: true } : b))
    );

    if (bubble.isCorrect) {
      soundFx.playCorrectSound();
      setBuzzerState('RESOLVED');

      if (activeBuzzerPlayer === 'p1') {
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
        text: `${activeBuzzerPlayer === 'p1' ? p1.name : p2.name} MENJAWAB BENAR! ${currentQuestion.explanation}`,
      });

      setTimeout(() => setCurrentIndex((prev) => prev + 1), 2200);
    } else {
      soundFx.playWrongSound();

      if (activeBuzzerPlayer === 'p1') {
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

      if (buzzerState === 'BUZZED') {
        // Pass chance to opponent
        const opponent = activeBuzzerPlayer === 'p1' ? 'p2' : 'p1';
        setActiveBuzzerPlayer(opponent);
        setBuzzerState('STEAL_CHANCE');
        setAnswerTimeLeft(5);

        setRoundFeedback({
          show: true,
          isCorrect: false,
          text: `Salah! Kesempatan merebut poin untuk ${opponent === 'p1' ? p1.name : p2.name}!`,
        });
      } else {
        // Both guessed wrong
        setBuzzerState('RESOLVED');
        setRoundFeedback({
          show: true,
          isCorrect: false,
          text: `Salah! Jawaban yang benar adalah: ${currentQuestion.options[currentQuestion.correctIndex]}`,
        });
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 2200);
      }
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border-2 border-cyan-400 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            🛡️
          </div>
          <div>
            <div className="text-[10px] text-cyan-300 font-bold tracking-wider">PEMAIN 1</div>
            <div className="text-sm md:text-base font-bold font-fredoka text-white truncate max-w-36">
              {p1.name}
            </div>
            <div className="font-mono text-lg font-black text-cyan-300 tabular-nums">
              {p1.score} PTS
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
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
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-fredoka font-black text-xs md:text-sm text-amber-300">
                ADU BEL ROUND {currentIndex + 1}/{questions.length}
              </span>
            </div>
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300"
              title="Suara Efek"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onExit}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-300 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 rounded-xl transition-colors shadow-sm cursor-pointer"
              title="Kembali ke Halaman Awal"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          </div>
          <div className="text-[10px] text-slate-400 font-medium text-center">
            Game dibuat oleh <span className="font-bold text-amber-400">HENDY FIRMANSYAH</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-[10px] text-amber-300 font-bold tracking-wider">PEMAIN 2</div>
            <div className="text-sm md:text-base font-bold font-fredoka text-white truncate max-w-36">
              {p2.name}
            </div>
            <div className="font-mono text-lg font-black text-amber-300 tabular-nums">
              {p2.score} PTS
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-600/30 border-2 border-amber-400 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            ⚔️
          </div>
        </div>
      </header>

      {/* Main Play Area */}
      <main className="relative flex-1 w-full overflow-hidden flex flex-col justify-between">
        {/* Question Card at Top */}
        <div className="absolute top-2 inset-x-0 mx-auto z-20 w-full flex justify-center px-4 pointer-events-none">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            streak={0}
            explanationFeedback={roundFeedback}
          />
        </div>

        {/* Floating Answer Bubbles in Upper Half */}
        <div className="relative w-full h-[62%] pt-28 flex items-center justify-center">
          {bubbles.map((b) => (
            <Bubble3D
              key={b.id}
              bubble={b}
              onPop={(bubble, cx, cy) => handlePop(bubble, cx, cy)}
            />
          ))}
        </div>

        {/* Central Buzzer Notification Banner */}
        <div className="relative z-25 flex justify-center px-4 mb-2">
          {buzzerState === 'IDLE' ? (
            <div className="px-6 py-2 rounded-2xl bg-slate-900/90 border border-amber-400/50 text-amber-300 font-fredoka text-sm md:text-base font-bold animate-pulse shadow-lg">
              ⚡ CEPAT TEKAN BEL DI BAWAH UNTUK MENJAWAB!
            </div>
          ) : (
            <div
              className={`px-6 py-2 rounded-2xl border font-fredoka text-sm md:text-base font-bold flex items-center gap-2 shadow-xl ${
                activeBuzzerPlayer === 'p1'
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200'
                  : 'bg-amber-950/90 border-amber-400 text-amber-200'
              }`}
            >
              <span>
                {activeBuzzerPlayer === 'p1' ? `🔔 ${p1.name} MENEKAN BEL!` : `🔔 ${p2.name} MENEKAN BEL!`}
              </span>
              <span className="flex items-center gap-1 font-mono text-base font-black px-2 py-0.5 rounded bg-black/40">
                <Clock className="w-4 h-4" /> {answerTimeLeft}s
              </span>
            </div>
          )}
        </div>

        {/* Dual Interactive Giant Buzzers at Bottom */}
        <div className="relative z-30 w-full px-8 pb-4 flex items-center justify-between gap-6">
          {/* P1 Left Buzzer */}
          <button
            onClick={() => handleHitBuzzer('p1')}
            disabled={buzzerState !== 'IDLE'}
            className={`flex-1 max-w-xs h-28 md:h-32 rounded-3xl border-4 flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-2xl ${
              buzzerState === 'IDLE'
                ? 'bg-gradient-to-t from-cyan-900 to-cyan-500 border-cyan-300 hover:brightness-110 shadow-cyan-500/50 cursor-pointer animate-pulse'
                : activeBuzzerPlayer === 'p1'
                ? 'bg-cyan-600 border-white shadow-cyan-400/80 scale-105 ring-4 ring-cyan-300'
                : 'bg-slate-900/60 border-slate-700 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="text-3xl md:text-4xl mb-1">🚨</div>
            <div className="font-fredoka text-base md:text-lg font-black text-white tracking-wide">
              BEL TIM BIRU
            </div>
            <div className="text-[11px] text-cyan-100 font-semibold">TEKAN UNTUK MENJAWAB!</div>
          </button>

          {/* VS Badge */}
          <div className="hidden sm:flex flex-col items-center justify-center font-fredoka font-black text-amber-400 text-xl">
            <Swords className="w-7 h-7 text-amber-400" />
            <span>VS</span>
          </div>

          {/* P2 Right Buzzer */}
          <button
            onClick={() => handleHitBuzzer('p2')}
            disabled={buzzerState !== 'IDLE'}
            className={`flex-1 max-w-xs h-28 md:h-32 rounded-3xl border-4 flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-2xl ${
              buzzerState === 'IDLE'
                ? 'bg-gradient-to-t from-amber-900 to-amber-500 border-amber-300 hover:brightness-110 shadow-amber-500/50 cursor-pointer animate-pulse'
                : activeBuzzerPlayer === 'p2'
                ? 'bg-amber-600 border-white shadow-amber-400/80 scale-105 ring-4 ring-amber-300'
                : 'bg-slate-900/60 border-slate-700 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="text-3xl md:text-4xl mb-1">🚨</div>
            <div className="font-fredoka text-base md:text-lg font-black text-white tracking-wide">
              BEL TIM EMAS
            </div>
            <div className="text-[11px] text-amber-100 font-semibold">TEKAN UNTUK MENJAWAB!</div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 px-6 py-2 border-t border-cyan-900/30 bg-slate-950/80 backdrop-blur-md flex items-center justify-between text-xs text-slate-400">
        <div className="text-cyan-300 font-semibold flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>Pemain 1 menekan bel di kiri</span>
        </div>
        <div className="text-slate-300 font-medium">
          Murid tercepat memencet bel di papan berhak memilih gelembung jawaban!
        </div>
        <div className="text-amber-300 font-semibold flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          <span>Pemain 2 menekan bel di kanan</span>
        </div>
      </footer>
    </div>
  );
};
