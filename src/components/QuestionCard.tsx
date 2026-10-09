import React from 'react';
import { Question } from '../types/game';
import { HelpCircle, Sparkles } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  timeLeft?: number;
  streak?: number;
  explanationFeedback?: { show: boolean; isCorrect: boolean; text: string } | null;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  timeLeft,
  streak = 0,
  explanationFeedback,
}) => {
  return (
    <div className="relative z-20 w-full max-w-2xl lg:max-w-3xl mx-auto select-none pointer-events-none">
      <div className="relative bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 border-emerald-500/50 py-3 px-5 md:py-4 md:px-7 shadow-[0_10px_30px_rgba(0,0,0,0.7)] text-center transition-all duration-200">
        {/* Decorative Islamic geometric corners */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400" />

        {/* Top Meta Header: Clean unboxed metadata with separators */}
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1.5 pb-1 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">{question.categoryLabel}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Soal {questionNumber} dari {totalQuestions}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {streak >= 2 && (
              <div className="flex items-center gap-1 text-amber-300 font-bold animate-pulse text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Streak x{streak}</span>
              </div>
            )}
            {typeof timeLeft === 'number' && (
              <div className={`font-mono text-xs md:text-sm font-bold ${timeLeft <= 5 ? 'text-rose-400 animate-bounce' : 'text-cyan-300'}`}>
                ⏱ {timeLeft}s
              </div>
            )}
          </div>
        </div>

        {/* Arabic sub-calligraphy if present */}
        {question.arabicText && (
          <div className="font-amiri text-xl md:text-2xl text-amber-200 mb-1 font-bold" dir="rtl">
            {question.arabicText}
          </div>
        )}

        {/* Question Text */}
        <h2 className="text-base md:text-xl lg:text-2xl font-fredoka font-bold text-white tracking-wide leading-snug drop-shadow-md">
          {question.question}
        </h2>

        {/* Instruction cue */}
        <div className="mt-1.5 flex items-center justify-center gap-1 text-[11px] md:text-xs text-cyan-200/90 font-medium">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Pecahkan gelembung jawaban yang benar (Sentuh papan / Arahkan jari ke kamera)!</span>
        </div>

        {/* Instant Answer Explanation Feedback Banner */}
        {explanationFeedback && explanationFeedback.show && (
          <div
            className={`mt-2.5 p-2.5 rounded-xl border text-xs md:text-sm font-medium transition-all transform animate-in fade-in duration-150 ${
              explanationFeedback.isCorrect
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                : 'bg-rose-950/90 border-rose-400 text-rose-200'
            }`}
          >
            <div className="font-bold flex items-center justify-center gap-2 mb-0.5">
              <span>{explanationFeedback.isCorrect ? '✨ MASHA ALLAH, BENAR! (+100)' : '⚠️ YAH, KURANG TEPAT (-30)'}</span>
            </div>
            <p className="text-[11px] md:text-xs text-slate-200/90">{explanationFeedback.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};
