import { ScoreRecord, GameMode, InteractiveModel } from '../types/game';

const STORAGE_KEY = 'gelembung_pai_scores';

const INITIAL_SCORES: ScoreRecord[] = [
  {
    id: 's-1',
    playerName: 'Fatih Al-Ayyubi',
    score: 1320,
    correctCount: 10,
    totalQuestions: 10,
    mode: 'SOLO',
    model: 'TAP_POP',
    categoryLabel: 'Rukun Islam',
    date: 'Hari ini',
    maxStreak: 10,
  },
  {
    id: 's-2',
    playerName: 'Aisyah Humaira',
    score: 1180,
    correctCount: 9,
    totalQuestions: 10,
    mode: 'SOLO',
    model: 'DRAG_DROP',
    categoryLabel: '25 Nabi & Rasul',
    date: 'Hari ini',
    maxStreak: 7,
  },
  {
    id: 's-3',
    playerName: 'Tim Salman Al-Farisi',
    score: 1050,
    correctCount: 8,
    totalQuestions: 10,
    mode: 'DUEL',
    model: 'BUZZER_RACE',
    categoryLabel: 'Malaikat Allah',
    date: 'Kemarin',
    maxStreak: 6,
  },
  {
    id: 's-4',
    playerName: 'Fatimah Az-Zahra',
    score: 980,
    correctCount: 8,
    totalQuestions: 10,
    mode: 'SOLO',
    model: 'WATER_CANNON',
    categoryLabel: 'Asmaul Husna',
    date: 'Kemarin',
    maxStreak: 5,
  },
  {
    id: 's-5',
    playerName: 'Bilal bin Rabah',
    score: 850,
    correctCount: 7,
    totalQuestions: 10,
    mode: 'SOLO',
    model: 'TAP_POP',
    categoryLabel: 'Shalat 5 Waktu',
    date: '2 hari lalu',
    maxStreak: 4,
  },
];

export const getStoredScores = (): ScoreRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SCORES));
      return INITIAL_SCORES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read scores from localStorage:', e);
    return INITIAL_SCORES;
  }
};

export const saveNewScore = (newScore: {
  playerName: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  mode: GameMode;
  model: InteractiveModel;
  categoryLabel: string;
  maxStreak: number;
}): ScoreRecord[] => {
  try {
    const current = getStoredScores();
    const entry: ScoreRecord = {
      ...newScore,
      id: `score-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: 'Baru saja',
    };

    const updated = [entry, ...current]
      .sort((a, b) => b.score - a.score)
      .slice(0, 25); // keep top 25

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Could not save score:', e);
    return [];
  }
};

export const clearAllScores = (): ScoreRecord[] => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
  return [];
};
