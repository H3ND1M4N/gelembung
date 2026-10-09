import { Question, Category, GradeLevel } from '../types/game';
import { PAI_QUESTIONS, CATEGORY_INFO } from '../data/paiQuestions';

const STORAGE_KEY = 'pai_custom_questions_v1';

export class QuestionStorageService {
  /**
   * Load stored questions from localStorage.
   * If empty or not set, fallback to default PAI_QUESTIONS.
   */
  public static getQuestions(): Question[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [...PAI_QUESTIONS];
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return [...PAI_QUESTIONS];
    } catch {
      return [...PAI_QUESTIONS];
    }
  }

  /**
   * Save questions to localStorage.
   */
  public static saveQuestions(questions: Question[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch (e) {
      console.error('Gagal menyimpan bank soal ke localStorage:', e);
    }
  }

  /**
   * Add a new question.
   */
  public static addQuestion(question: Omit<Question, 'id'> & { id?: string }): Question[] {
    const list = this.getQuestions();
    const newQ: Question = {
      ...question,
      id: question.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      categoryLabel: question.categoryLabel || CATEGORY_INFO[question.category]?.label || 'Umum',
    };
    const updated = [newQ, ...list];
    this.saveQuestions(updated);
    return updated;
  }

  /**
   * Update an existing question.
   */
  public static updateQuestion(updatedQuestion: Question): Question[] {
    const list = this.getQuestions();
    const updated = list.map((q) =>
      q.id === updatedQuestion.id
        ? {
            ...updatedQuestion,
            categoryLabel:
              updatedQuestion.categoryLabel ||
              CATEGORY_INFO[updatedQuestion.category]?.label ||
              q.categoryLabel,
          }
        : q
    );
    this.saveQuestions(updated);
    return updated;
  }

  /**
   * Delete a question by ID.
   */
  public static deleteQuestion(id: string): Question[] {
    const list = this.getQuestions();
    const updated = list.filter((q) => q.id !== id);
    this.saveQuestions(updated);
    return updated;
  }

  /**
   * Reset all questions back to original default PAI_QUESTIONS.
   */
  public static resetToDefault(): Question[] {
    this.saveQuestions(PAI_QUESTIONS);
    return [...PAI_QUESTIONS];
  }

  /**
   * Export all current questions as JSON string.
   */
  public static exportToJson(): string {
    const questions = this.getQuestions();
    return JSON.stringify(questions, null, 2);
  }

  /**
   * Download a text string as a file to user's computer.
   */
  public static downloadFile(filename: string, content: string, mimeType: string = 'application/json') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get clean JSON template with sample questions for teachers.
   */
  public static getTemplateJson(): string {
    const sample: Partial<Question>[] = [
      {
        question: 'Rukun Islam yang pertama adalah mengucapkan dua kalimat...',
        category: 'RUKUN_ISLAM',
        grade: 'KELAS_1_2',
        options: ['Syahadat', 'Tasbih', 'Takbir', 'Tahmid'],
        correctIndex: 0,
        explanation: 'Syahadatain adalah kesaksian bahwa tiada Tuhan selain Allah dan Nabi Muhammad utusan Allah.',
      },
      {
        question: 'Malaikat yang bertugas menyampaikan wahyu kepada para nabi adalah...',
        category: 'MALAIKAT',
        grade: 'KELAS_3_4',
        options: ['Malaikat Jibril', 'Malaikat Mikail', 'Malaikat Israfil', 'Malaikat Izrail'],
        correctIndex: 0,
        explanation: 'Malaikat Jibril bertugas menyampaikan wahyu Allah SWT kepada para nabi dan rasul.',
      },
    ];
    return JSON.stringify(sample, null, 2);
  }

  /**
   * Get clean CSV template for Excel / Google Sheets.
   */
  public static getTemplateCsv(): string {
    return [
      'Pertanyaan;Pilihan A;Pilihan B;Pilihan C;Pilihan D;Kunci Jawaban;Pembahasan;Kategori;Kelas',
      'Siapakah nabi pertama dalam Islam?;Nabi Adam AS;Nabi Nuh AS;Nabi Ibrahim AS;Nabi Musa AS;A;Nabi Adam AS adalah manusia pertama dan nabi pertama yang diciptakan Allah;NABI_RASUL;KELAS_1_2',
      'Shalat wajib lima waktu yang dikerjakan sebanyak 4 rakaat adalah?;Dzuhur, Ashar, Isya;Subuh, Maghrib;Subuh saja;Maghrib saja;A;Dzuhur, Ashar, dan Isya masing-masing 4 rakaat;SHALAT_WAKTU;KELAS_1_2',
    ].join('\n');
  }

  /**
   * Parse category string into valid Category enum.
   */
  private static parseCategory(raw?: string): Category {
    if (!raw) return 'SEMUA';
    const clean = raw.trim().toUpperCase().replace(/\s+/g, '_');
    const valid: Category[] = [
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
    for (const v of valid) {
      if (clean === v || clean.includes(v)) return v;
    }
    // Match common Indonesian words
    if (clean.includes('ISLAM')) return 'RUKUN_ISLAM';
    if (clean.includes('IMAN')) return 'RUKUN_IMAN';
    if (clean.includes('NABI') || clean.includes('RASUL')) return 'NABI_RASUL';
    if (clean.includes('MALAIKAT')) return 'MALAIKAT';
    if (clean.includes('SHALAT') || clean.includes('SOLAT')) return 'SHALAT_WAKTU';
    if (clean.includes('ASMAUL')) return 'ASMAUL_HUSNA';
    if (clean.includes('KITAB')) return 'KITAB_ALLAH';
    if (clean.includes('AKHLAK')) return 'AKHLAK_TERPUJI';
    return 'SEMUA';
  }

  /**
   * Parse grade string into valid GradeLevel enum.
   */
  private static parseGrade(raw?: string): GradeLevel {
    if (!raw) return 'KELAS_1_2';
    const clean = raw.trim().toUpperCase();
    if (clean.includes('5') || clean.includes('6')) return 'KELAS_5_6';
    if (clean.includes('3') || clean.includes('4')) return 'KELAS_3_4';
    return 'KELAS_1_2';
  }

  /**
   * Parse correctIndex from string or number (0, 1, 2, 3 or A, B, C, D).
   */
  private static parseCorrectIndex(raw: unknown): number {
    if (typeof raw === 'number' && raw >= 0 && raw <= 3) {
      return raw;
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim().toUpperCase();
      if (trimmed === 'A' || trimmed === '1') return 0;
      if (trimmed === 'B' || trimmed === '2') return 1;
      if (trimmed === 'C' || trimmed === '3') return 2;
      if (trimmed === 'D' || trimmed === '4') return 3;
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 0 && num <= 3) return num;
      if (!isNaN(num) && num >= 1 && num <= 4) return num - 1;
    }
    return 0;
  }

  /**
   * Import questions from raw text (JSON, CSV, or Text Blocks).
   */
  public static importFromText(
    text: string,
    mode: 'append' | 'replace'
  ): { success: boolean; count: number; error?: string; questions?: Question[] } {
    const trimmed = text.trim();
    if (!trimmed) {
      return { success: false, count: 0, error: 'Teks soal masih kosong. Silakan unggah berkas atau tempelkan data.' };
    }

    let parsedQuestions: Question[] = [];

    // Attempt 1: Try JSON
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const rawJson = JSON.parse(trimmed);
        const arr = Array.isArray(rawJson) ? rawJson : [rawJson];
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i];
          if (!item.question || !Array.isArray(item.options) || item.options.length < 2) {
            continue;
          }

          // ensure 4 options
          const options: string[] = item.options.map((o: unknown) => String(o || '').trim());
          while (options.length < 4) {
            options.push(`Pilihan ${options.length + 1}`);
          }

          const cat = this.parseCategory(item.category);
          parsedQuestions.push({
            id: item.id || `custom-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            question: String(item.question).trim(),
            options: options.slice(0, 4),
            correctIndex: this.parseCorrectIndex(item.correctIndex),
            explanation: item.explanation ? String(item.explanation).trim() : 'Jawaban yang tepat untuk pertanyaan ini.',
            category: cat,
            categoryLabel: CATEGORY_INFO[cat]?.label || 'Umum',
            grade: this.parseGrade(item.grade),
          });
        }
      } catch {
        // Not JSON, continue to other parsers
      }
    }

    // Attempt 2: Try CSV / TSV / Semicolon-delimited if JSON did not produce results
    if (parsedQuestions.length === 0 && (trimmed.includes(';') || trimmed.includes(',') || trimmed.includes('\t'))) {
      const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const delimiter = trimmed.includes(';') ? ';' : trimmed.includes('\t') ? '\t' : ',';

      // Skip header if first line looks like header
      const startIdx = lines[0].toLowerCase().includes('pertanyaan') || lines[0].toLowerCase().includes('soal') ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 5) {
          const questionText = cols[0];
          const optA = cols[1] || 'Pilihan A';
          const optB = cols[2] || 'Pilihan B';
          const optC = cols[3] || 'Pilihan C';
          const optD = cols[4] || 'Pilihan D';
          const keyRaw = cols[5] || 'A';
          const explanation = cols[6] || 'Penjelasan jawaban.';
          const categoryRaw = cols[7] || 'SEMUA';
          const gradeRaw = cols[8] || 'KELAS_1_2';

          if (questionText) {
            const cat = this.parseCategory(categoryRaw);
            parsedQuestions.push({
              id: `custom-csv-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
              question: questionText,
              options: [optA, optB, optC, optD],
              correctIndex: this.parseCorrectIndex(keyRaw),
              explanation,
              category: cat,
              categoryLabel: CATEGORY_INFO[cat]?.label || 'Umum',
              grade: this.parseGrade(gradeRaw),
            });
          }
        }
      }
    }

    // Attempt 3: Try Human Text Block Format
    // Format:
    // Soal: ...
    // A: ...
    // B: ...
    // C: ...
    // D: ...
    // Kunci: A
    // Pembahasan: ...
    if (parsedQuestions.length === 0 && trimmed.toLowerCase().includes('soal:')) {
      const blocks = trimmed.split(/(?=soal\s*:)/i);
      for (let i = 0; i < blocks.length; i++) {
        const blk = blocks[i].trim();
        if (!blk) continue;

        const qMatch = blk.match(/soal\s*:\s*([^\n\r]+)/i);
        const aMatch = blk.match(/a\s*:\s*([^\n\r]+)/i);
        const bMatch = blk.match(/b\s*:\s*([^\n\r]+)/i);
        const cMatch = blk.match(/c\s*:\s*([^\n\r]+)/i);
        const dMatch = blk.match(/d\s*:\s*([^\n\r]+)/i);
        const kMatch = blk.match(/kunci\s*:\s*([^\n\r]+)/i);
        const pMatch = blk.match(/pembahasan\s*:\s*([^\n\r]+)/i);
        const catMatch = blk.match(/kategori\s*:\s*([^\n\r]+)/i);
        const grMatch = blk.match(/kelas\s*:\s*([^\n\r]+)/i);

        if (qMatch && aMatch && bMatch) {
          const cat = this.parseCategory(catMatch ? catMatch[1] : undefined);
          parsedQuestions.push({
            id: `custom-txt-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
            question: qMatch[1].trim(),
            options: [
              aMatch[1].trim(),
              bMatch[1].trim(),
              cMatch ? cMatch[1].trim() : 'Pilihan C',
              dMatch ? dMatch[1].trim() : 'Pilihan D',
            ],
            correctIndex: this.parseCorrectIndex(kMatch ? kMatch[1] : 'A'),
            explanation: pMatch ? pMatch[1].trim() : 'Pembahasan jawaban.',
            category: cat,
            categoryLabel: CATEGORY_INFO[cat]?.label || 'Umum',
            grade: this.parseGrade(grMatch ? grMatch[1] : undefined),
          });
        }
      }
    }

    if (parsedQuestions.length === 0) {
      return {
        success: false,
        count: 0,
        error:
          'Format berkas atau teks tidak dikenali. Pastikan menggunakan format JSON, CSV (titik koma/koma), atau format teks template yang disediakan.',
      };
    }

    // Apply mode (append or replace)
    let finalList: Question[] = [];
    if (mode === 'replace') {
      finalList = parsedQuestions;
    } else {
      const existing = this.getQuestions();
      finalList = [...parsedQuestions, ...existing];
    }

    this.saveQuestions(finalList);

    return {
      success: true,
      count: parsedQuestions.length,
      questions: finalList,
    };
  }
}
