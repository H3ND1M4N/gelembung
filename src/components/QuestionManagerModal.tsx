import React, { useState, useMemo } from 'react';
import { Question, Category, GradeLevel } from '../types/game';
import { CATEGORY_INFO } from '../data/paiQuestions';
import { QuestionStorageService } from '../services/questionStorage';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Upload,
  Download,
  RotateCcw,
  Search,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';

interface QuestionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onQuestionsUpdated: (updatedList: Question[]) => void;
}

type TabType = 'LIST' | 'ADD' | 'UPLOAD';

export const QuestionManagerModal: React.FC<QuestionManagerModalProps> = ({
  isOpen,
  onClose,
  questions,
  onQuestionsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('LIST');

  // Search & Filters in List tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<Category>('SEMUA');
  const [filterGrade, setFilterGrade] = useState<GradeLevel>('SEMUA');

  // Question editing state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form state for Add/Edit
  const [formQuestion, setFormQuestion] = useState<string>('');
  const [formCategory, setFormCategory] = useState<Category>('RUKUN_ISLAM');
  const [formGrade, setFormGrade] = useState<GradeLevel>('KELAS_1_2');
  const [formOptions, setFormOptions] = useState<[string, string, string, string]>([
    '',
    '',
    '',
    '',
  ]);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState<string>('');

  // Upload tab state
  const [uploadText, setUploadText] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'append' | 'replace'>('append');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Deletion confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchCat = filterCategory === 'SEMUA' || q.category === filterCategory;
      const matchGrade = filterGrade === 'SEMUA' || q.grade === filterGrade;
      const matchQuery =
        !searchQuery ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.options.some((o) => o.toLowerCase().includes(searchQuery.toLowerCase())) ||
        q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchGrade && matchQuery;
    });
  }, [questions, filterCategory, filterGrade, searchQuery]);

  if (!isOpen) return null;

  const showNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Open Edit Form
  const handleStartEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormQuestion(q.question);
    setFormCategory(q.category);
    setFormGrade(q.grade);
    const opts: [string, string, string, string] = [
      q.options[0] || '',
      q.options[1] || '',
      q.options[2] || '',
      q.options[3] || '',
    ];
    setFormOptions(opts);
    setFormCorrectIndex(q.correctIndex);
    setFormExplanation(q.explanation);
    setActiveTab('ADD');
  };

  // Reset Add/Edit Form
  const resetForm = () => {
    setEditingQuestion(null);
    setFormQuestion('');
    setFormCategory('RUKUN_ISLAM');
    setFormGrade('KELAS_1_2');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormExplanation('');
  };

  // Handle Save (Add or Update)
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formQuestion.trim()) {
      showNotification('Pertanyaan tidak boleh kosong!', 'error');
      return;
    }

    if (formOptions.some((o) => !o.trim())) {
      showNotification('Semua 4 pilihan jawaban harus diisi!', 'error');
      return;
    }

    if (editingQuestion) {
      // Update existing
      const updatedItem: Question = {
        ...editingQuestion,
        question: formQuestion.trim(),
        category: formCategory,
        categoryLabel: CATEGORY_INFO[formCategory]?.label || 'Umum',
        grade: formGrade,
        options: formOptions.map((o) => o.trim()),
        correctIndex: formCorrectIndex,
        explanation: formExplanation.trim() || 'Pembahasan jawaban.',
      };

      const updatedList = QuestionStorageService.updateQuestion(updatedItem);
      onQuestionsUpdated(updatedList);
      showNotification(`Soal berhasil diperbarui!`, 'success');
      resetForm();
      setActiveTab('LIST');
    } else {
      // Add new
      const newQuestionData: Omit<Question, 'id'> = {
        question: formQuestion.trim(),
        category: formCategory,
        categoryLabel: CATEGORY_INFO[formCategory]?.label || 'Umum',
        grade: formGrade,
        options: formOptions.map((o) => o.trim()),
        correctIndex: formCorrectIndex,
        explanation: formExplanation.trim() || 'Pembahasan jawaban.',
      };

      const updatedList = QuestionStorageService.addQuestion(newQuestionData);
      onQuestionsUpdated(updatedList);
      showNotification(`Soal baru berhasil ditambahkan!`, 'success');
      resetForm();
      setActiveTab('LIST');
    }
  };

  // Handle Delete
  const handleDelete = (id: string) => {
    const updatedList = QuestionStorageService.deleteQuestion(id);
    onQuestionsUpdated(updatedList);
    setDeleteConfirmId(null);
    showNotification('Soal berhasil dihapus dari daftar.', 'info');
  };

  // Handle Reset to Default
  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin mengembalikan bank soal ke 50+ soal bawaan PAI SD? Soal kustom yang belum diekspor akan terhapus.'
      )
    ) {
      const resetList = QuestionStorageService.resetToDefault();
      onQuestionsUpdated(resetList);
      showNotification('Bank soal berhasil dikembalikan ke soal bawaan!', 'success');
    }
  };

  // Handle File Upload from input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setUploadText(content);
        showNotification(`Berkas "${file.name}" berhasil dimuat ke kotak impor.`, 'info');
      }
    };
    reader.readAsText(file);
  };

  // Process Import Text
  const handleProcessImport = () => {
    const res = QuestionStorageService.importFromText(uploadText, uploadMode);
    if (res.success && res.questions) {
      onQuestionsUpdated(res.questions);
      showNotification(
        `Sukses! Berhasil mengimpor ${res.count} soal ke bank soal PAI (${
          uploadMode === 'replace' ? 'Mengganti semua' : 'Menambahkan'
        }).`,
        'success'
      );
      setUploadText('');
      setActiveTab('LIST');
    } else {
      showNotification(res.error || 'Gagal memproses berkas.', 'error');
    }
  };

  // Download Templates & Exports
  const handleDownloadTemplateJson = () => {
    QuestionStorageService.downloadFile('template_soal_pai.json', QuestionStorageService.getTemplateJson());
  };

  const handleDownloadTemplateCsv = () => {
    QuestionStorageService.downloadFile(
      'template_soal_pai_excel.csv',
      QuestionStorageService.getTemplateCsv(),
      'text/csv'
    );
  };

  const handleExportAll = () => {
    QuestionStorageService.downloadFile('bank_soal_pai_cadangan.json', QuestionStorageService.exportToJson());
  };

  const categoriesList: Category[] = [
    'RUKUN_ISLAM',
    'RUKUN_IMAN',
    'NABI_RASUL',
    'MALAIKAT',
    'SHALAT_WAKTU',
    'ASMAUL_HUSNA',
    'KITAB_ALLAH',
    'AKHLAK_TERPUJI',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border-2 border-cyan-500/50 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-cyan-900/50 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-xl shadow-inner">
              📝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-fredoka text-xl sm:text-2xl font-black text-white">
                  Kelola Bank Soal PAI
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
                  {questions.length} Soal Aktif
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upload berkas, edit, tambah, dan kurangi soal kuis interaktif sesuai kebutuhan kelas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 border-b border-slate-800 bg-slate-900/60">
          <button
            onClick={() => {
              setActiveTab('LIST');
              resetForm();
            }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'LIST'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Daftar Soal ({filteredQuestions.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ADD');
              if (!editingQuestion) resetForm();
            }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'ADD'
                ? 'border-amber-400 text-amber-300 bg-amber-950/40 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('UPLOAD');
              resetForm();
            }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'UPLOAD'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/40 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload & Impor Soal</span>
          </button>
        </div>

        {/* Notification Banner */}
        {statusMessage && (
          <div
            className={`mx-5 sm:mx-6 mt-3 px-4 py-2.5 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm font-medium animate-in fade-in duration-150 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                : 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <HelpCircle className="w-4 h-4 shrink-0 text-cyan-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* ================= TAB 1: LIST & SEARCH ================= */}
          {activeTab === 'LIST' && (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                {/* Search query */}
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pertanyaan, opsi jawaban, atau pembahasan..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Kategori */}
                <div className="sm:col-span-3">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="SEMUA">Semua Kategori</option>
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_INFO[cat]?.icon} {CATEGORY_INFO[cat]?.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Kelas */}
                <div className="sm:col-span-3">
                  <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="SEMUA">Semua Tingkat Kelas</option>
                    <option value="KELAS_1_2">Kelas 1 & 2 SD</option>
                    <option value="KELAS_3_4">Kelas 3 & 4 SD</option>
                    <option value="KELAS_5_6">Kelas 5 & 6 SD</option>
                  </select>
                </div>
              </div>

              {/* Action bar (Quick add & export) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-2">
                <span className="text-xs text-slate-400">
                  Menampilkan <strong className="text-cyan-300">{filteredQuestions.length}</strong> dari{' '}
                  <strong className="text-white">{questions.length}</strong> total soal
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab('ADD');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Soal</span>
                  </button>

                  <button
                    onClick={handleExportAll}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Simpan backup seluruh soal ke berkas JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup JSON</span>
                  </button>

                  <button
                    onClick={handleResetToDefault}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Kembalikan ke 50+ soal bawaan PAI SD"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden sm:inline">Reset Bawaan</span>
                  </button>
                </div>
              </div>

              {/* Questions Cards List */}
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40">
                  <div className="text-3xl mb-2">🔍</div>
                  <h4 className="text-base font-bold text-white mb-1">Tidak Ada Soal yang Cocok</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                    Tidak ditemukan soal dengan kata kunci atau filter terpilih. Coba ubah pencarian atau tambahkan soal baru.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('SEMUA');
                      setFilterGrade('SEMUA');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 text-cyan-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuestions.map((q, index) => (
                    <div
                      key={q.id || index}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-sm group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-black flex items-center justify-center font-mono">
                            {index + 1}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-bold text-amber-300">
                            {CATEGORY_INFO[q.category]?.icon || '🕌'} {CATEGORY_INFO[q.category]?.label || q.categoryLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-medium text-slate-400">
                            {q.grade === 'KELAS_1_2'
                              ? 'Kelas 1-2'
                              : q.grade === 'KELAS_3_4'
                              ? 'Kelas 3-4'
                              : 'Kelas 5-6'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleStartEdit(q)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950 hover:text-amber-300 text-slate-300 transition-colors cursor-pointer"
                            title="Edit Soal Ini"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {deleteConfirmId === q.id ? (
                            <div className="flex items-center gap-1 bg-rose-950 border border-rose-500/60 p-1 rounded-lg">
                              <span className="text-[10px] text-rose-300 font-bold px-1">Hapus?</span>
                              <button
                                onClick={() => handleDelete(q.id)}
                                className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-500"
                              >
                                Ya
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(q.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                              title="Hapus Soal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="text-sm font-semibold text-white mb-3 leading-relaxed">
                        {q.question}
                      </p>

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = optIdx === q.correctIndex;
                          const letter = ['A', 'B', 'C', 'D'][optIdx];
                          return (
                            <div
                              key={optIdx}
                              className={`px-3 py-1.5 rounded-xl border text-xs flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-200 font-bold'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-mono font-bold ${
                                    isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isCorrect && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-black">
                                  KUNCI JAWABAN
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-xl border border-slate-800/80 flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">💡 Pembahasan:</span>
                          <span className="leading-normal">{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: ADD & EDIT QUESTION FORM ================= */}
          {activeTab === 'ADD' && (
            <form onSubmit={handleSaveQuestion} className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                    {editingQuestion ? '✏️' : '➕'}
                  </div>
                  <div>
                    <h4 className="font-fredoka text-lg font-bold text-white">
                      {editingQuestion ? 'Edit Pertanyaan PAI' : 'Tambah Pertanyaan PAI Baru'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Masukkan teks soal, pilihan jawaban (A, B, C, D), dan pilih satu jawaban yang benar
                    </p>
                  </div>
                </div>

                {editingQuestion && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              {/* Teks Pertanyaan */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Teks Pertanyaan / Soal <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Contoh: Rukun Islam yang kedua dan merupakan tiang agama adalah ibadah..."
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
                />
              </div>

              {/* Kategori & Tingkat Kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Kategori Materi PAI <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_INFO[cat]?.icon} {CATEGORY_INFO[cat]?.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Tingkat Kelas SD <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="KELAS_1_2">Kelas 1 & 2 SD (Tingkat Dasar)</option>
                    <option value="KELAS_3_4">Kelas 3 & 4 SD (Tingkat Menengah)</option>
                    <option value="KELAS_5_6">Kelas 5 & 6 SD (Tingkat Lanjut)</option>
                  </select>
                </div>
              </div>

              {/* 4 Pilihan Jawaban */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Pilihan Jawaban & Tentukan Kunci Jawaban (Pilih Lingkaran Hijau){' '}
                  <span className="text-rose-400">*</span>
                </label>
                <div className="space-y-2.5">
                  {(['A', 'B', 'C', 'D'] as const).map((letter, idx) => {
                    const isCorrect = formCorrectIndex === idx;
                    return (
                      <div
                        key={letter}
                        onClick={() => setFormCorrectIndex(idx)}
                        className={`p-2.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                          isCorrect
                            ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Radio Check button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormCorrectIndex(idx);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-transform ${
                            isCorrect
                              ? 'bg-emerald-500 text-slate-950 scale-105 shadow-md'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                          title={`Tandai ${letter} sebagai Kunci Jawaban`}
                        >
                          {isCorrect ? <Check className="w-4 h-4 stroke-[3]" /> : letter}
                        </button>

                        {/* Input option text */}
                        <input
                          type="text"
                          required
                          value={formOptions[idx]}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormOptions((prev) => {
                              const next = [...prev] as [string, string, string, string];
                              next[idx] = val;
                              return next;
                            });
                          }}
                          placeholder={`Isi pilihan jawaban ${letter}...`}
                          className="flex-1 bg-transparent border-0 text-sm text-white placeholder-slate-500 focus:outline-none"
                        />

                        {isCorrect && (
                          <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full shrink-0">
                            KUNCI BENAR
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pembahasan / Penjelasan */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Penjelasan / Pembahasan Jawaban (Muncul saat gelembung meletus)
                </label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Contoh: Shalat adalah rukun Islam kedua setelah syahadat dan merupakan tiang penegak agama Islam."
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
                />
              </div>

              {/* Save & Cancel Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('LIST');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingQuestion ? 'Simpan Perubahan Soal' : 'Simpan Soal Baru'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 3: UPLOAD & IMPORT ================= */}
          {activeTab === 'UPLOAD' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              <div className="text-center space-y-1">
                <h4 className="font-fredoka text-xl font-bold text-white">
                  Unggah atau Tempelkan Berkas Soal
                </h4>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  Dukung format berkas <strong>JSON</strong> atau <strong>CSV (Excel/Google Sheets)</strong>.
                  Soal yang diunggah akan otomatis tersimpan di peramban Anda.
                </p>
              </div>

              {/* Templates download card */}
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xl shrink-0">
                    📥
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-cyan-200">Unduh Format Template Soal</h5>
                    <p className="text-xs text-slate-400">
                      Gunakan template ini untuk membuat puluhan soal di Excel atau Notepad dengan mudah
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadTemplateJson}
                    className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-500/50 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Template JSON</span>
                  </button>

                  <button
                    onClick={handleDownloadTemplateCsv}
                    className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-teal-900/60 hover:bg-teal-800 border border-teal-500/50 text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Template Excel (CSV)</span>
                  </button>
                </div>
              </div>

              {/* File upload input & Dropzone */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 text-center hover:border-cyan-400 transition-colors">
                <input
                  type="file"
                  id="question-file-upload"
                  accept=".json,.csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="question-file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl shadow-inner">
                    📁
                  </div>
                  <div>
                    <span className="text-sm font-bold text-cyan-300 hover:underline">
                      Klik untuk memilih berkas soal
                    </span>{' '}
                    <span className="text-xs text-slate-400">(.json, .csv, atau .txt)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Atau salin dan tempelkan teks format soal ke kotak di bawah ini
                  </p>
                </label>
              </div>

              {/* Text Area for Pasting */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Kotak Teks Soal (JSON / CSV / Teks Soal)
                  </label>
                  {uploadText && (
                    <button
                      onClick={() => setUploadText('')}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Bersihkan
                    </button>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder={`Tempelkan data soal di sini. Contoh JSON:\n[\n  {\n    "question": "Berapa jumlah rukun Islam?",\n    "category": "RUKUN_ISLAM",\n    "grade": "KELAS_1_2",\n    "options": ["5", "6", "4", "7"],\n    "correctIndex": 0,\n    "explanation": "Rukun Islam berjumlah lima perkara."\n  }\n]`}
                  className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-700 rounded-2xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 leading-relaxed"
                />
              </div>

              {/* Mode Selection (Append vs Replace) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Metode Penyimpanan Soal:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      uploadMode === 'append'
                        ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="uploadMode"
                      value="append"
                      checked={uploadMode === 'append'}
                      onChange={() => setUploadMode('append')}
                      className="text-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold">➕ Tambahkan ke Soal yang Ada (Append)</div>
                      <div className="text-[10px] text-slate-400">
                        Soal baru akan ditambahkan tanpa menghapus soal lama.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      uploadMode === 'replace'
                        ? 'bg-rose-950/60 border-rose-500/80 text-rose-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="uploadMode"
                      value="replace"
                      checked={uploadMode === 'replace'}
                      onChange={() => setUploadMode('replace')}
                      className="text-rose-500"
                    />
                    <div>
                      <div className="text-xs font-bold">🔄 Ganti Seluruh Soal (Replace)</div>
                      <div className="text-[10px] text-slate-400">
                        Mengganti seluruh bank soal dengan daftar baru ini.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Process Button */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setUploadText('');
                    setActiveTab('LIST');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:text-white"
                >
                  Kembali ke Daftar
                </button>

                <button
                  type="button"
                  onClick={handleProcessImport}
                  disabled={!uploadText.trim()}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all ${
                    uploadText.trim()
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 cursor-pointer shadow-emerald-500/25'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Proses & Simpan ke Bank Soal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
