import React, { useState, useRef, useCallback, useMemo } from 'react';
import { GameMode, GameStatus, Category, GradeLevel, InteractiveModel, PlayerState, HandPoint, Question } from './types/game';
import { PAI_QUESTIONS, CATEGORY_INFO } from './data/paiQuestions';
import { SoloBoard } from './components/SoloBoard';
import { DuelBoard } from './components/DuelBoard';
import { DragDropBoard } from './components/DragDropBoard';
import { BuzzerDuelBoard } from './components/BuzzerDuelBoard';
import { WaterCannonBoard } from './components/WaterCannonBoard';
import { UnderwaterBackground } from './components/UnderwaterBackground';
import { CameraTrackerOverlay } from './components/CameraTrackerOverlay';
import { ParticleCanvas, ParticleCanvasRef } from './components/ParticleCanvas';
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { ScoreboardModal } from './components/ScoreboardModal';
import { QuestionManagerModal } from './components/QuestionManagerModal';
import { QuestionStorageService } from './services/questionStorage';
import { soundFx } from './services/soundEffects';
import { saveNewScore } from './services/scoreService';
import {
  Settings,
  Music,
  Camera,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Monitor,
  Home,
  Trophy,
  Clock,
  FileEdit,
} from 'lucide-react';

export default function App() {
  // Game Navigation State
  const [gameStatus, setGameStatus] = useState<GameStatus>('MENU');
  const [gameMode, setGameMode] = useState<GameMode>('SOLO');
  const [interactiveModel, setInteractiveModel] = useState<InteractiveModel>('TAP_POP');

  // Custom & Persistent Questions Bank
  const [allQuestions, setAllQuestions] = useState<Question[]>(() => QuestionStorageService.getQuestions());
  const [isQuestionManagerOpen, setIsQuestionManagerOpen] = useState<boolean>(false);

  // Curriculum & Timer Settings
  const [selectedCategory, setSelectedCategory] = useState<Category>('SEMUA');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('SEMUA');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timerSeconds, setTimerSeconds] = useState<number>(20);
  const [p1Name, setP1Name] = useState<string>('Pemain 1 (Abu Bakar)');
  const [p2Name, setP2Name] = useState<string>('Pemain 2 (Umar bin Khattab)');

  // Hardware & Camera Vision State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isScoreboardOpen, setIsScoreboardOpen] = useState<boolean>(false);
  const [isBgmOn, setIsBgmOn] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // End Game Modal State
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [finalSoloScore, setFinalSoloScore] = useState<number>(0);
  const [finalSoloCorrect, setFinalSoloCorrect] = useState<number>(0);
  const [duelWinner, setDuelWinner] = useState<PlayerState | null>(null);
  const [finalP1, setFinalP1] = useState<PlayerState | undefined>(undefined);
  const [finalP2, setFinalP2] = useState<PlayerState | undefined>(undefined);

  // Particle Canvas Ref
  const particleCanvasRef = useRef<ParticleCanvasRef | null>(null);

  // Hand collision subscriber ref
  const collisionCallbackRef = useRef<((point: HandPoint) => void) | null>(null);

  const registerCollisionCallback = useCallback((cb: (point: HandPoint) => void) => {
    collisionCallbackRef.current = cb;
  }, []);

  const handleHandCollision = useCallback((point: HandPoint) => {
    if (collisionCallbackRef.current) {
      collisionCallbackRef.current(point);
    }
  }, []);

  const handleQuestionsUpdated = useCallback((updatedList: Question[]) => {
    setAllQuestions(updatedList);
  }, []);

  // Filtered & Shuffled Questions pool
  const activeQuestions = useMemo(() => {
    let pool = allQuestions;

    if (selectedCategory !== 'SEMUA') {
      pool = pool.filter((q) => q.category === selectedCategory);
    }

    if (selectedGrade !== 'SEMUA') {
      pool = pool.filter((q) => q.grade === selectedGrade);
    }

    if (pool.length === 0) {
      pool = allQuestions;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(questionCount, shuffled.length));
  }, [allQuestions, selectedCategory, selectedGrade, questionCount]);

  // Start Solo Game
  const handleStartSolo = (modelOverride?: InteractiveModel) => {
    if (modelOverride) setInteractiveModel(modelOverride);
    soundFx.playCountdownTick(true);
    if (!isBgmOn) {
      soundFx.startCheerfulBGM();
      setIsBgmOn(true);
    }
    setGameMode('SOLO');
    setGameStatus('PLAYING');
  };

  // Start Duel Game
  const handleStartDuel = (modelOverride?: InteractiveModel) => {
    if (modelOverride) setInteractiveModel(modelOverride);
    soundFx.playCountdownTick(true);
    if (!isBgmOn) {
      soundFx.startCheerfulBGM();
      setIsBgmOn(true);
    }
    setGameMode('DUEL');
    setGameStatus('PLAYING');
  };

  // Finish Solo Game & Save Score
  const handleFinishSolo = (score: number, correct: number, total: number) => {
    setFinalSoloScore(score);
    setFinalSoloCorrect(correct);
    setIsGameOverModalOpen(true);

    saveNewScore({
      playerName: p1Name || 'Murid Hebat PAI',
      score,
      correctCount: correct,
      totalQuestions: total,
      mode: 'SOLO',
      model: interactiveModel,
      categoryLabel: CATEGORY_INFO[selectedCategory]?.label || 'Umum',
      maxStreak: Math.max(1, correct),
    });
  };

  // Finish Duel Game & Save Score
  const handleFinishDuel = (winner: PlayerState | null, p1: PlayerState, p2: PlayerState) => {
    setDuelWinner(winner);
    setFinalP1(p1);
    setFinalP2(p2);
    setIsGameOverModalOpen(true);

    if (winner) {
      saveNewScore({
        playerName: `${winner.name} (Juara Duel)`,
        score: winner.score,
        correctCount: winner.correctAnswers,
        totalQuestions: activeQuestions.length,
        mode: 'DUEL',
        model: interactiveModel,
        categoryLabel: CATEGORY_INFO[selectedCategory]?.label || 'Umum',
        maxStreak: winner.maxStreak || 1,
      });
    }
  };

  const handlePlayAgain = () => {
    setIsGameOverModalOpen(false);
    setGameStatus('PLAYING');
  };

  const handleGoHome = () => {
    setIsGameOverModalOpen(false);
    setGameStatus('MENU');
  };

  const toggleBgm = () => {
    const next = soundFx.toggleBGM();
    setIsBgmOn(next);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFx.setMuted(next);
  };

  const handleEmitParticle = (x: number, y: number, colorTheme: string, isCorrect: boolean) => {
    if (particleCanvasRef.current) {
      particleCanvasRef.current.emitPop(x, y, colorTheme, isCorrect);
    }
  };

  const interactiveModelsList: Array<{
    id: InteractiveModel;
    title: string;
    subtitle: string;
    icon: string;
  }> = [
    {
      id: 'TAP_POP',
      title: 'Sentuh & Letuskan',
      subtitle: 'Ketuk gelembung 3D melayang langsung di layar sentuh pintar (0ms lag)',
      icon: '🫧',
    },
    {
      id: 'DRAG_DROP',
      title: 'Tarik & Lepas (Wadah)',
      subtitle: 'Geser gelembung jawaban dengan jari ke wadah bercahaya di tengah',
      icon: '🏺',
    },
    {
      id: 'BUZZER_RACE',
      title: 'Adu Bel Buzzer',
      subtitle: 'Dua murid adu cepat menekan tombol bel besar di layar sebelum menjawab',
      icon: '🚨',
    },
    {
      id: 'WATER_CANNON',
      title: 'Meriam Air Tembak',
      subtitle: 'Sentuh gelembung untuk membidik & menembakkan meriam air penghancur',
      icon: '🎯',
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 font-sans">
      {/* Living Realistic Underwater Ocean Background with animated marine life */}
      <UnderwaterBackground />

      {/* Particle Canvas for 60fps explosions */}
      <ParticleCanvas ref={particleCanvasRef} />

      {/* MediaPipe Camera Vision Tracker Overlay (Optional) */}
      <CameraTrackerOverlay
        isActive={isCameraActive}
        onToggleActive={() => setIsCameraActive(!isCameraActive)}
        onHandCollision={handleHandCollision}
      />

      {/* Top Bar Header for Main Navigation (Menu Home, Skor, Timer, Controls) */}
      {gameStatus === 'MENU' && (
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-cyan-900/40 bg-slate-950/85 backdrop-blur-md">
          {/* Zone 1: Wordmark & Home */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 text-left group cursor-pointer"
              title="Halaman Awal (Home)"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5 shadow-md flex items-center justify-center">
                <span className="text-base">🫧</span>
              </div>
              <span className="font-fredoka text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 tracking-tight group-hover:brightness-110 transition-all">
                Gelembung PAI
              </span>
            </button>
          </div>

          {/* Center: Author Credit (di tengah layar bagian atas) */}
          <div className="hidden lg:flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 shadow-sm pointer-events-none">
            <span className="text-[11px] text-slate-300 font-medium">Game dibuat oleh</span>
            <span className="font-fredoka font-black text-amber-400 text-xs tracking-wide">HENDY FIRMANSYAH</span>
          </div>

          {/* Zone 2: Navigation Links (Menu Home, Skor, Timer) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Menu Home */}
            <button
              onClick={handleGoHome}
              className="px-3 py-1.5 rounded-xl border border-cyan-500/50 bg-cyan-950/60 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
              title="Menu Home / Kembali ke Halaman Awal"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>Home</span>
            </button>

            {/* Menu Skor */}
            <button
              onClick={() => setIsScoreboardOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-amber-500/50 bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
              title="Buka Papan Skor & Peringkat Murid"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Papan</span>
              <span>Skor</span>
            </button>

            {/* Menu Timer */}
            <button
              onClick={() => {
                const cycle = [20, 30, 0, 15];
                const curIdx = cycle.indexOf(timerSeconds);
                const next = cycle[(curIdx + 1) % cycle.length];
                setTimerSeconds(next);
                soundFx.playCountdownTick(false);
              }}
              className="px-3 py-1.5 rounded-xl border border-rose-500/50 bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.25)] transition-all cursor-pointer"
              title="Ubah Timer Soal (Klik untuk beralih 20s, 30s, Bebas, 15s)"
            >
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>Timer: {timerSeconds === 0 ? 'Bebas' : `${timerSeconds}s`}</span>
            </button>

            {/* Menu Kelola Soal (Upload, Edit, Tambah/Kurang) */}
            <button
              onClick={() => setIsQuestionManagerOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-teal-500/50 bg-teal-950/60 hover:bg-teal-900/70 text-teal-300 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(20,184,166,0.25)] transition-all cursor-pointer"
              title="Kelola Bank Soal: Upload berkas, edit, tambah, atau kurangi soal kuis"
            >
              <FileEdit className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Kelola</span>
              <span>Soal</span>
              <span className="text-[10px] bg-teal-500/25 border border-teal-400/40 text-teal-200 px-1.5 rounded-full font-mono font-bold">
                {allQuestions.length}
              </span>
            </button>
          </div>

          {/* Zone 3: Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCameraActive(!isCameraActive)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                isCameraActive
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Kamera MediaPipe (Opsional)"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kamera:</span>
              <span>{isCameraActive ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={toggleBgm}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isBgmOn
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Musik Latar Ceria"
            >
              <Music className="w-4 h-4" />
            </button>

            <button
              onClick={toggleMute}
              className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white cursor-pointer"
              title="Suara Efek"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Pengaturan Pembelajaran & Game"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* Screen View: MENU */}
      {gameStatus === 'MENU' && (
        <div className="relative w-full h-full underwater-bg flex flex-col items-center justify-center px-4 pt-16 pb-6 overflow-y-auto">
          <div className="relative z-10 max-w-5xl w-full text-center flex flex-col items-center">
            {/* Top Center Author Credit Badge */}
            <div className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-amber-300 bg-amber-950/70 border-2 border-amber-400/60 px-5 py-1.5 rounded-full mb-2.5 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
              <span className="text-amber-400">⭐</span>
              <span>Game dibuat oleh <strong className="font-fredoka font-black text-amber-400 text-sm md:text-base tracking-wider uppercase">HENDY FIRMANSYAH</strong></span>
              <span className="text-amber-400">⭐</span>
            </div>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/40 px-4 py-1 rounded-full mb-2">
              <span>🕌</span>
              <span>Game Edukasi PAI SD untuk Papan Tulis Interaktif Digital</span>
              <span>⭐</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-fredoka font-black text-white tracking-wide leading-tight mb-2">
              Pilihan Model Permainan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300">
                Papan Interaktif Seru & Bebas Lag
              </span>
            </h1>

            <p className="max-w-2xl text-xs sm:text-sm text-slate-300 mb-4 font-medium leading-relaxed">
              Pilih model interaksi layar yang paling menyenangkan untuk murid di kelas: sentuh letus, tarik ke wadah, adu bel buzzer, atau tembak meriam air!
            </p>

            {/* Quick Navigation Cards: Menu Skor, Timer, & Kelola Soal */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Menu Skor Banner */}
              <button
                onClick={() => setIsScoreboardOpen(true)}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 to-slate-900/80 border border-amber-500/40 hover:border-amber-400 flex items-center justify-between shadow-lg hover:shadow-amber-500/20 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    🏆
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span>Papan Skor</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200">Juara</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Lihat daftar juara & riwayat murid
                    </div>
                  </div>
                </div>
                <span className="text-amber-400 text-sm font-bold group-hover:translate-x-1 transition-transform">→</span>
              </button>

              {/* Menu Timer Quick Selector */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/50 to-slate-900/80 border border-rose-500/40 flex items-center justify-between shadow-lg text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-xl">
                    ⏱️
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-300">
                      Timer: {timerSeconds === 0 ? 'Bebas' : `${timerSeconds}s / Soal`}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {[
                        { val: 0, label: 'Bebas' },
                        { val: 15, label: '15s' },
                        { val: 20, label: '20s' },
                        { val: 30, label: '30s' },
                      ].map((t) => (
                        <button
                          key={t.val}
                          onClick={() => {
                            setTimerSeconds(t.val);
                            soundFx.playCountdownTick(false);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            timerSeconds === t.val
                              ? 'bg-rose-500 text-slate-950 shadow-sm font-black'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Kelola Bank Soal Banner (Upload, Edit, Tambah/Kurang) */}
              <button
                onClick={() => setIsQuestionManagerOpen(true)}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/60 to-slate-900/80 border border-teal-500/40 hover:border-teal-400 flex items-center justify-between shadow-lg hover:shadow-teal-500/20 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    📝
                  </div>
                  <div>
                    <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                      <span>Kelola Bank Soal</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200">
                        {allQuestions.length} Soal
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Upload JSON/Excel, edit & tambah soal
                    </div>
                  </div>
                </div>
                <span className="text-teal-400 text-sm font-bold group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {/* 4 INTERACTIVE GAME MODELS GRID */}
            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 text-left">
              {interactiveModelsList.map((m) => {
                const isSelected = interactiveModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setInteractiveModel(m.id)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/70 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-102 ring-2 ring-amber-400'
                        : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="text-3xl mb-2">{m.icon}</div>
                      <div className={`font-fredoka font-bold text-base ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                        {m.title}
                      </div>
                      <div className="text-[11px] text-slate-300 leading-snug mt-1">
                        {m.subtitle}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                        {isSelected ? '✓ Terpilih' : 'Pilih Model'}
                      </span>
                      <span className="text-xs">👉</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Topic Selector */}
            <div className="w-full max-w-4xl mb-5 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1.5 px-2">
                <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Materi: {CATEGORY_INFO[selectedCategory]?.label}
                </span>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-amber-400 hover:underline text-[11px] cursor-pointer"
                >
                  Ubah Materi & Kelas
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {(['SEMUA', 'RUKUN_ISLAM', 'RUKUN_IMAN', 'NABI_RASUL', 'SHALAT_WAKTU', 'MALAIKAT', 'ASMAUL_HUSNA', 'KITAB_ALLAH', 'AKHLAK_TERPUJI'] as Category[]).map((cat) => {
                  const info = CATEGORY_INFO[cat];
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
                      }`}
                    >
                      <span>{info?.icon}</span>
                      <span>{info?.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Buttons: SOLO vs DUEL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
              {/* SOLO START */}
              <button
                onClick={() => handleStartSolo()}
                className="group p-5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white flex items-center justify-between shadow-xl shadow-cyan-950/60 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    ⭐
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-cyan-200 font-bold">1 Murid</div>
                    <div className="font-fredoka text-xl font-bold">Mainkan Mode Solo</div>
                    <div className="text-[11px] text-cyan-100">Latihan mandiri & kuis interaktif</div>
                  </div>
                </div>
                <Play className="w-6 h-6 fill-white" />
              </button>

              {/* DUEL START */}
              <button
                onClick={() => handleStartDuel()}
                className="group p-5 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white flex items-center justify-between shadow-xl shadow-amber-950/60 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                    ⚔️
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-amber-200 font-bold">2 Murid / Tim</div>
                    <div className="font-fredoka text-xl font-bold">Mainkan Mode Duel</div>
                    <div className="text-[11px] text-amber-100">Adu cepat di layar papan interaktif</div>
                  </div>
                </div>
                <Play className="w-6 h-6 fill-white" />
              </button>
            </div>

            {/* Support Information */}
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>Dioptimalkan 100% untuk Layar Sentuh Smartboard / IFP Papan Tulis Interaktif Digital</span>
            </div>
          </div>
        </div>
      )}

      {/* Screen View: PLAYING */}
      {gameStatus === 'PLAYING' && (
        <>
          {/* Model 1: TAP & POP (Sentuh Langsung) */}
          {interactiveModel === 'TAP_POP' && gameMode === 'SOLO' && (
            <SoloBoard
              questions={activeQuestions}
              timerSeconds={timerSeconds}
              onFinishGame={handleFinishSolo}
              onExit={handleGoHome}
              onEmitParticle={handleEmitParticle}
              registerCollisionCallback={registerCollisionCallback}
            />
          )}

          {interactiveModel === 'TAP_POP' && gameMode === 'DUEL' && (
            <DuelBoard
              questions={activeQuestions}
              timerSeconds={timerSeconds}
              player1Name={p1Name}
              player2Name={p2Name}
              onFinishDuel={handleFinishDuel}
              onExit={handleGoHome}
              onEmitParticle={handleEmitParticle}
              registerCollisionCallback={registerCollisionCallback}
            />
          )}

          {/* Model 2: DRAG & DROP (Tarik & Lepas ke Wadah) */}
          {interactiveModel === 'DRAG_DROP' && (
            <DragDropBoard
              questions={activeQuestions}
              timerSeconds={timerSeconds}
              onFinishGame={handleFinishSolo}
              onExit={handleGoHome}
              onEmitParticle={handleEmitParticle}
            />
          )}

          {/* Model 3: BUZZER RACE (Adu Cepat Bel Pintar) */}
          {interactiveModel === 'BUZZER_RACE' && (
            <BuzzerDuelBoard
              questions={activeQuestions}
              timerSeconds={timerSeconds}
              player1Name={p1Name}
              player2Name={p2Name}
              onFinishDuel={handleFinishDuel}
              onExit={handleGoHome}
              onEmitParticle={handleEmitParticle}
            />
          )}

          {/* Model 4: WATER CANNON (Meriam Air Tembak) */}
          {interactiveModel === 'WATER_CANNON' && (
            <WaterCannonBoard
              questions={activeQuestions}
              timerSeconds={timerSeconds}
              onFinishGame={handleFinishSolo}
              onExit={handleGoHome}
              onEmitParticle={handleEmitParticle}
            />
          )}
        </>
      )}

      {/* Teacher / Curriculum Settings Modal */}
      <TeacherSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedModel={interactiveModel}
        onSelectModel={setInteractiveModel}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedGrade={selectedGrade}
        onSelectGrade={setSelectedGrade}
        questionCount={questionCount}
        onChangeQuestionCount={setQuestionCount}
        timerSeconds={timerSeconds}
        onChangeTimerSeconds={setTimerSeconds}
        isCameraActive={isCameraActive}
        onToggleCamera={() => setIsCameraActive(!isCameraActive)}
        isBgmOn={isBgmOn}
        onToggleBgm={toggleBgm}
        p1Name={p1Name}
        onChangeP1Name={setP1Name}
        p2Name={p2Name}
        onChangeP2Name={setP2Name}
        onOpenQuestionManager={() => setIsQuestionManagerOpen(true)}
      />

      {/* Kelola Bank Soal (Upload, Edit, Tambah, Kurangi Soal) Modal */}
      <QuestionManagerModal
        isOpen={isQuestionManagerOpen}
        onClose={() => setIsQuestionManagerOpen(false)}
        questions={allQuestions}
        onQuestionsUpdated={handleQuestionsUpdated}
      />

      {/* Papan Skor / Leaderboard Modal */}
      <ScoreboardModal
        isOpen={isScoreboardOpen}
        onClose={() => setIsScoreboardOpen(false)}
      />

      {/* Game Over / Victory Modal */}
      <GameOverModal
        isOpen={isGameOverModalOpen}
        mode={gameMode}
        soloScore={finalSoloScore}
        soloCorrect={finalSoloCorrect}
        totalQuestions={activeQuestions.length}
        duelWinner={duelWinner}
        p1={finalP1}
        p2={finalP2}
        onPlayAgain={handlePlayAgain}
        onGoHome={handleGoHome}
        onViewScoreboard={() => setIsScoreboardOpen(true)}
      />
    </div>
  );
}
