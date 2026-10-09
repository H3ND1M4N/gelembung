import React, { useState, useEffect } from 'react';
import { ScoreRecord } from '../types/game';
import { getStoredScores, clearAllScores } from '../services/scoreService';
import { Trophy, X, Medal, Flame, Trash2, Calendar, Award } from 'lucide-react';

interface ScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({ isOpen, onClose }) => {
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'SOLO' | 'DUEL'>('ALL');

  useEffect(() => {
    if (isOpen) {
      setScores(getStoredScores());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredScores = scores.filter((s) => {
    if (filterMode === 'ALL') return true;
    return s.mode === filterMode;
  });

  const handleClear = () => {
    if (window.confirm('Yakin ingin mereset seluruh data riwayat skor murid?')) {
      clearAllScores();
      setScores([]);
    }
  };

  const modelLabels: Record<string, string> = {
    TAP_POP: '🫧 Letus',
    DRAG_DROP: '🏺 Wadah',
    BUZZER_RACE: '🚨 Bel Duel',
    WATER_CANNON: '🎯 Meriam',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              🏆
            </div>
            <div>
              <h2 className="font-fredoka text-xl md:text-2xl font-black text-white">
                Papan Skor & Peringkat Murid
              </h2>
              <p className="text-xs text-slate-400">
                Catatan prestasi latihan Pendidikan Agama Islam di kelas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between py-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: 'Semua Mode' },
              { id: 'SOLO', label: 'Mode Solo' },
              { id: 'DUEL', label: 'Mode Duel' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  filterMode === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-850 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {scores.length > 0 && (
            <button
              onClick={handleClear}
              className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
              title="Reset Riwayat Skor"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Score List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1 scrollbar-thin">
          {filteredScores.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Trophy className="w-12 h-12 mx-auto text-slate-600 mb-2 opacity-50" />
              <div className="font-fredoka text-lg font-bold text-slate-300">Belum Ada Skor Tercatat</div>
              <p className="text-xs text-slate-500 mt-1">
                Ayo mainkan kuis sekarang untuk mencatatkan namamu di papan peringkat!
              </p>
            </div>
          ) : (
            filteredScores.map((item, index) => {
              const isTop3 = index < 3;
              const medalIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    index === 0
                      ? 'bg-gradient-to-r from-amber-950/70 to-slate-900 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : isTop3
                      ? 'bg-slate-850 border-amber-500/30'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-fredoka font-black text-sm ${
                        index === 0
                          ? 'bg-amber-400 text-slate-950'
                          : isTop3
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {medalIcon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-fredoka font-bold text-sm md:text-base text-white">
                          {item.playerName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {modelLabels[item.model] || item.model}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-amber-400/90 font-medium">{item.categoryLabel}</span>
                        <span>·</span>
                        <span>Benar {item.correctCount}/{item.totalQuestions}</span>
                        {item.maxStreak > 1 && (
                          <>
                            <span>·</span>
                            <span className="text-amber-300 flex items-center gap-0.5">
                              <Flame className="w-3 h-3" /> x{item.maxStreak}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xl md:text-2xl font-black text-amber-300 tabular-nums">
                      {item.score}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-fredoka font-bold rounded-xl text-sm transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
