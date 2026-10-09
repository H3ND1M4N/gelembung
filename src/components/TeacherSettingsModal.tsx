import React from 'react';
import { Category, GradeLevel, InteractiveModel } from '../types/game';
import { CATEGORY_INFO } from '../data/paiQuestions';
import { X, BookOpen, GraduationCap, Camera, Music, Users, Gamepad2, Move, Bell, Crosshair, Sparkles } from 'lucide-react';

interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: InteractiveModel;
  onSelectModel: (model: InteractiveModel) => void;
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  selectedGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  questionCount: number;
  onChangeQuestionCount: (count: number) => void;
  timerSeconds: number;
  onChangeTimerSeconds: (seconds: number) => void;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  isBgmOn: boolean;
  onToggleBgm: () => void;
  p1Name: string;
  onChangeP1Name: (name: string) => void;
  p2Name: string;
  onChangeP2Name: (name: string) => void;
  onOpenQuestionManager?: () => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
  selectedCategory,
  onSelectCategory,
  selectedGrade,
  onSelectGrade,
  questionCount,
  onChangeQuestionCount,
  timerSeconds,
  onChangeTimerSeconds,
  isCameraActive,
  onToggleCamera,
  isBgmOn,
  onToggleBgm,
  p1Name,
  onChangeP1Name,
  p2Name,
  onChangeP2Name,
  onOpenQuestionManager,
}) => {
  if (!isOpen) return null;

  const categories: Category[] = [
    'SEMUA',
    'RUKUN_ISLAM',
    'RUKUN_IMAN',
    'NABI_RASUL',
    'MALAIKAT',
    'SHALAT_WAKTU',
    'ASMAUL_HUSNA',
    'KITAB_ALLAH',
    'AKHLAK_TERPUJI',
  ];

  const models: Array<{ id: InteractiveModel; title: string; desc: string; icon: string }> = [
    {
      id: 'TAP_POP',
      title: 'Sentuh & Letuskan',
      desc: 'Ketuk gelembung 3D langsung di layar pintar (100% instan, 0ms lag)',
      icon: '🫧',
    },
    {
      id: 'DRAG_DROP',
      title: 'Tarik & Lepas (Wadah)',
      desc: 'Seret gelembung jawaban dengan jari ke wadah bercahaya',
      icon: '🏺',
    },
    {
      id: 'BUZZER_RACE',
      title: 'Adu Bel Buzzer',
      desc: 'Duel seru memukul bel tombol di layar sebelum menjawab',
      icon: '🚨',
    },
    {
      id: 'WATER_CANNON',
      title: 'Meriam Air Interaktif',
      desc: 'Sentuh gelembung untuk membidik & menembakkan peluru air',
      icon: '🎯',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <div>
              <h3 className="font-fredoka text-xl font-bold text-white">
                Pengaturan Model Permainan & Pembelajaran PAI
              </h3>
              <p className="text-xs text-slate-400">
                Pilih model interaksi layar digital, materi PAI, dan konfigurasi kelas
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

        <div className="py-4 space-y-6">
          {/* Quick Bank Soal Button */}
          {onOpenQuestionManager && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/70 to-teal-950/70 border border-cyan-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5 text-left w-full sm:w-auto">
                <span className="text-2xl">📝</span>
                <div>
                  <h4 className="text-sm font-bold text-cyan-200">Kelola Bank Soal PAI</h4>
                  <p className="text-xs text-slate-300">
                    Upload file JSON/Excel, edit teks soal, tambah atau kurangi soal kuis kelas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQuestionManager();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shrink-0 transition-all cursor-pointer shadow-md"
              >
                Buka Kelola Soal →
              </button>
            </div>
          )}

          {/* Interactive Game Model Selector */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300 mb-2.5">
              <Gamepad2 className="w-4 h-4" />
              <span>Model Interaksi Layar Papan Digital</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {models.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectModel(m.id)}
                    className={`p-3 text-left rounded-2xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-amber-950/70 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                        : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-2xl mt-0.5">{m.icon}</div>
                    <div>
                      <div className={`font-fredoka font-bold text-sm ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                        {m.title}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        {m.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300 mb-2.5">
              <BookOpen className="w-4 h-4" />
              <span>Topik Materi PAI SD</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const info = CATEGORY_INFO[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    className={`p-2.5 text-left rounded-xl border transition-all text-xs flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>{info?.icon}</span>
                      <span className="truncate">{info?.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{info?.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grade Level Selector */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300 mb-2.5">
              <GraduationCap className="w-4 h-4" />
              <span>Tingkat Kelas SD</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'SEMUA', label: 'Semua Kelas' },
                { id: 'KELAS_1_2', label: 'Kelas 1 - 2 (Dasar)' },
                { id: 'KELAS_3_4', label: 'Kelas 3 - 4 (Menengah)' },
                { id: 'KELAS_5_6', label: 'Kelas 5 - 6 (Mahir)' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => onSelectGrade(g.id as GradeLevel)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    selectedGrade === g.id
                      ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <div className="text-sm font-semibold text-amber-300 mb-2">
              Jumlah Soal Per Ronde
            </div>
            <div className="flex items-center gap-2">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => onChangeQuestionCount(num)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    questionCount === num
                      ? 'bg-amber-950/80 border-amber-400 text-amber-200'
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {num} Soal
                </button>
              ))}
            </div>
          </div>

          {/* Timer Setup */}
          <div>
            <div className="text-sm font-semibold text-rose-300 mb-2 flex items-center justify-between">
              <span>⏱️ Batas Waktu (Timer) Per Soal</span>
              <span className="text-xs text-slate-400">
                {timerSeconds === 0 ? 'Santai (Tanpa Batas)' : `${timerSeconds} Detik`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 0, label: 'Tanpa Timer (Santai)' },
                { val: 15, label: '15 Detik (Cepat)' },
                { val: 20, label: '20 Detik (Standar)' },
                { val: 30, label: '30 Detik (Panjang)' },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => onChangeTimerSeconds(t.val)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                    timerSeconds === t.val
                      ? 'bg-rose-950/80 border-rose-400 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duel Names Setup */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-300 mb-2">
              <Users className="w-4 h-4" />
              <span>Nama Murid / Tim Mode Duel</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Pemain 1 (Sisi Kiri):</label>
                <input
                  type="text"
                  value={p1Name}
                  onChange={(e) => onChangeP1Name(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Nama Siswa 1 / Tim Biru"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Pemain 2 (Sisi Kanan):</label>
                <input
                  type="text"
                  value={p2Name}
                  onChange={(e) => onChangeP2Name(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Nama Siswa 2 / Tim Emas"
                />
              </div>
            </div>
          </div>

          {/* Device Hardware & MediaPipe Toggles */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={onToggleCamera}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isCameraActive
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                  : 'bg-slate-850 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Kamera MediaPipe (Opsional): {isCameraActive ? 'AKTIF' : 'NONAKTIF'}</span>
            </button>

            <button
              onClick={onToggleBgm}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isBgmOn
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                  : 'bg-slate-850 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Musik Latar Ceria: {isBgmOn ? 'NYALA' : 'MATI'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-fredoka font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-900/30"
          >
            Simpan & Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
