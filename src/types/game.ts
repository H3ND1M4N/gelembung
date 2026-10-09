export type GameMode = 'SOLO' | 'DUEL';

export type InteractiveModel = 
  | 'TAP_POP'        // Model 1: Sentuh & Letuskan Gelembung 3D (Multi-Touch)
  | 'DRAG_DROP'      // Model 2: Tarik & Cocokkan ke Wadah Jawaban (Drag & Drop)
  | 'BUZZER_RACE'    // Model 3: Adu Cepat Bel Buzzer Interaktif (Duel Rebutan)
  | 'WATER_CANNON';  // Model 4: Meriam Air Ketuk & Tembak (Aim & Shoot)

export type GameStatus = 'MENU' | 'PLAYING' | 'ROUND_END' | 'GAME_OVER';

export type InputMode = 'TOUCH' | 'MEDIAPIPE' | 'BOTH';

export type Category = 
  | 'SEMUA'
  | 'RUKUN_ISLAM'
  | 'RUKUN_IMAN'
  | 'NABI_RASUL'
  | 'MALAIKAT'
  | 'SHALAT_WAKTU'
  | 'ASMAUL_HUSNA'
  | 'KITAB_ALLAH'
  | 'AKHLAK_TERPUJI';

export type GradeLevel = 'SEMUA' | 'KELAS_1_2' | 'KELAS_3_4' | 'KELAS_5_6';

export interface Question {
  id: string;
  category: Category;
  categoryLabel: string;
  grade: GradeLevel;
  question: string;
  arabicText?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface BubbleItem {
  id: string;
  text: string;
  isCorrect: boolean;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  targetY?: number;
  size: number; // in pixels (e.g. 110 - 150px for interactive whiteboard touch)
  speedY: number; // float speed
  speedX: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  colorTheme: 'cyan' | 'emerald' | 'amber' | 'indigo' | 'rose';
  playerSide?: 'p1' | 'p2' | 'both';
  popped: boolean;
  poppedBy?: 'p1' | 'p2' | 'solo';
  isWrongPopped?: boolean;
}

export interface PlayerState {
  id: 'p1' | 'p2' | 'solo';
  name: string;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  wrongAnswers: number;
  color: string;
}

export interface HandPoint {
  x: number; // 0 to 1 normalized
  y: number; // 0 to 1 normalized
  prevX?: number;
  prevY?: number;
  isPinching?: boolean;
  confidence: number;
  playerSide?: 'p1' | 'p2';
  allPoints?: Array<{ x: number; y: number }>;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'droplet' | 'star' | 'ring' | 'bubble' | 'splash_jet' | 'water_bead' | 'mist' | 'ripple';
  angle?: number;
  length?: number;
}

export interface ScoreRecord {
  id: string;
  playerName: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  mode: GameMode;
  model: InteractiveModel;
  categoryLabel: string;
  date: string;
  maxStreak: number;
}
