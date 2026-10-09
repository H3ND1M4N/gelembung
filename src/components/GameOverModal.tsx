import React, { useEffect } from 'react';
import { PlayerState, GameMode } from '../types/game';
import { soundFx } from '../services/soundEffects';
import { Trophy, RotateCcw, Home, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  mode: GameMode;
  soloScore?: number;
  soloCorrect?: number;
  totalQuestions?: number;
  duelWinner?: PlayerState | null;
  p1?: PlayerState;
  p2?: PlayerState;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onViewScoreboard?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  mode,
  soloScore = 0,
  soloCorrect = 0,
  totalQuestions = 10,
  duelWinner,
  p1,
  p2,
  onPlayAgain,
  onGoHome,
  onViewScoreboard,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundFx.playVictoryFanfare();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 md:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.25)]">
        {/* Islamic Corner Filigree */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-400" />

        {/* Big Trophy Emblem */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl flex items-center justify-center">
          <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-4xl">
            🏆
          </div>
        </div>

        {mode === 'SOLO' ? (
          <>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">
              PERMAINAN SELESAI
            </div>
            <h2 className="text-3xl md:text-4xl font-fredoka font-black text-white mb-2">
              Masha Allah, Hebat Sekali!
            </h2>
            <p className="text-slate-300 text-sm mb-6">
              Kamu telah menyelesaikan latihan Pendidikan Agama Islam dengan luar biasa.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <div className="text-[11px] text-slate-400">Total Skor</div>
                <div className="font-mono text-2xl font-black text-amber-400 tabular-nums">
                  {soloScore}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Jawaban Benar</div>
                <div className="font-mono text-2xl font-black text-emerald-400 tabular-nums">
                  {soloCorrect} / {totalQuestions}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Akurasi</div>
                <div className="font-mono text-2xl font-black text-cyan-400 tabular-nums">
                  {Math.round((soloCorrect / Math.max(1, totalQuestions)) * 100)}%
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">
              DUEL PAPAN INTERAKTIF SELESAI
            </div>
            <h2 className="text-3xl md:text-4xl font-fredoka font-black text-white mb-2">
              {duelWinner ? `Selamat Kepada ${duelWinner.name}!` : 'Pertandingan Seri yang Luar Biasa!'}
            </h2>
            <p className="text-slate-300 text-sm mb-6">
              Kedua murid telah berjuang menjawab soal-soal PAI dengan cepat dan tepat!
            </p>

            {/* Duel Score Comparison */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div
                className={`p-4 rounded-2xl border text-center ${
                  duelWinner?.id === 'p1'
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="text-xs text-cyan-400 font-bold mb-1">PEMAIN 1</div>
                <div className="font-fredoka text-lg font-bold text-white truncate mb-1">
                  {p1?.name}
                </div>
                <div className="font-mono text-3xl font-black text-cyan-300">
                  {p1?.score}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Benar: {p1?.correctAnswers}
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border text-center ${
                  duelWinner?.id === 'p2'
                    ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="text-xs text-amber-400 font-bold mb-1">PEMAIN 2</div>
                <div className="font-fredoka text-lg font-bold text-white truncate mb-1">
                  {p2?.name}
                </div>
                <div className="font-mono text-3xl font-black text-amber-300">
                  {p2?.score}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Benar: {p2?.correctAnswers}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons for Interactive Whiteboard */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-fredoka font-bold rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Main Lagi</span>
          </button>
          {onViewScoreboard && (
            <button
              onClick={onViewScoreboard}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-fredoka font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all active:scale-95 cursor-pointer"
            >
              <Trophy className="w-5 h-5" />
              <span>Lihat Skor</span>
            </button>
          )}
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-fredoka font-bold rounded-2xl text-base flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
