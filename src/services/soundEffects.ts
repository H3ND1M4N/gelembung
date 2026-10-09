/**
 * High-performance Web Audio API Sound FX and Cheerful Procedural BGM Synthesizer
 * No external MP3 files needed - 100% reliable, zero network latency, instant playback.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private bgmTimer: number | null = null;
  private currentNoteIndex: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.bgmGainNode = this.ctx.createGain();
      this.bgmGainNode.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.bgmGainNode.connect(this.ctx.destination);

      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.sfxGainNode.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmGainNode && this.ctx) {
      this.bgmGainNode.gain.setValueAtTime(muted ? 0 : 0.18, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsBgmPlaying(): boolean {
    return this.isBgmPlaying;
  }

  /**
   * Bubble Pop Sound (Wet, organic bubble bursting)
   */
  public playBubblePop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Natural bubble frequency pitch sweep
    const baseFreq = 400 + Math.random() * 250;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  /**
   * Correct Answer: Triumphant, cheerful major chord chime with sparkling sparkles
   */
  public playCorrectSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    // C6, E6, G6, C7 bright major chime
    const notes = [1046.5, 1318.5, 1567.98, 2093.0];

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);

      gain.gain.setValueAtTime(0.0, t + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.28, t + i * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.5);
    });
  }

  /**
   * Wrong Answer: Playful gentle low double boing ('o-oh' sound, not abrasive)
   */
  public playWrongSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(160, t + 0.18);
    osc.frequency.setValueAtTime(140, t + 0.2);
    osc.frequency.linearRampToValueAtTime(90, t + 0.4);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.46);
  }

  /**
   * Classroom Bell / Interactive Buzzer Sound
   */
  public playBuzzerSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.setValueAtTime(440, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  /**
   * Water Cannon Shoot Sound (woosh & splash launch)
   */
  public playCannonShootSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(750, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  /**
   * Drag Snap Sound (suction plop into cauldron)
   */
  public playDragSnapSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.09);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Countdown chime for game start / round start
   */
  public playCountdownTick(isFinal: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : 440, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isFinal ? 0.35 : 0.15));

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + (isFinal ? 0.36 : 0.16));
  }

  /**
   * Victory Fanfare: Triumphant celebration fanfare for game over / duel winner
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    // Upbeat celebratory melody: G4, C5, E5, G5, F5, G5, C6
    const fanfareNotes = [
      { f: 392.0, d: 0.12, wait: 0 },
      { f: 523.25, d: 0.12, wait: 0.12 },
      { f: 659.25, d: 0.12, wait: 0.24 },
      { f: 783.99, d: 0.22, wait: 0.36 },
      { f: 659.25, d: 0.12, wait: 0.6 },
      { f: 783.99, d: 0.45, wait: 0.74 },
    ];

    fanfareNotes.forEach((item) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, t + item.wait);

      gain.gain.setValueAtTime(0.0, t + item.wait);
      gain.gain.linearRampToValueAtTime(0.3, t + item.wait + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + item.wait + item.d);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(t + item.wait);
      osc.stop(t + item.wait + item.d + 0.05);
    });
  }

  /**
   * Cheerful, uplifting procedural background music (BGM)
   * Upbeat classroom vibe: gentle marimba plucks and playful pentatonic chords
   */
  public startCheerfulBGM() {
    if (this.isBgmPlaying) return;
    this.initContext();
    this.isBgmPlaying = true;

    // Cheerful, friendly G Major pentatonic sequence
    const melody = [
      // Bar 1
      { note: 392.00, len: 0.2 }, // G4
      { note: 440.00, len: 0.2 }, // A4
      { note: 493.88, len: 0.2 }, // B4
      { note: 587.33, len: 0.35 }, // D5
      { note: 493.88, len: 0.2 }, // B4
      { note: 392.00, len: 0.25 }, // G4
      // Bar 2
      { note: 523.25, len: 0.2 }, // C5
      { note: 587.33, len: 0.2 }, // D5
      { note: 659.25, len: 0.35 }, // E5
      { note: 587.33, len: 0.2 }, // D5
      { note: 493.88, len: 0.35 }, // B4
      // Bar 3
      { note: 440.00, len: 0.2 }, // A4
      { note: 493.88, len: 0.2 }, // B4
      { note: 587.33, len: 0.3 }, // D5
      { note: 783.99, len: 0.4 }, // G5 (bright high note!)
      { note: 659.25, len: 0.25 }, // E5
      { note: 587.33, len: 0.3 }, // D5
      // Bar 4
      { note: 493.88, len: 0.25 }, // B4
      { note: 440.00, len: 0.25 }, // A4
      { note: 392.00, len: 0.45 }, // G4 (home note)
      { note: 0, len: 0.2 }, // rest
    ];

    const bass = [
      196.00, // G3
      220.00, // A3
      130.81, // C3
      146.83, // D3
    ];

    const stepDuration = 240; // ms per beat (upbeat ~125 BPM)
    this.currentNoteIndex = 0;

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGainNode || this.isMuted) {
        if (this.isBgmPlaying) {
          this.bgmTimer = window.setTimeout(playStep, stepDuration);
        }
        return;
      }

      const t = this.ctx.currentTime;
      const noteItem = melody[this.currentNoteIndex % melody.length];

      // Play lead marimba tone
      if (noteItem.note > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine'; // warm soft marimba bell
        osc.frequency.setValueAtTime(noteItem.note, t);

        gain.gain.setValueAtTime(0.0, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + noteItem.len);

        osc.connect(gain);
        gain.connect(this.bgmGainNode);

        osc.start(t);
        osc.stop(t + noteItem.len + 0.02);
      }

      // Play bouncy bass on every 4 beats
      if (this.currentNoteIndex % 4 === 0) {
        const bassFreq = bass[(Math.floor(this.currentNoteIndex / 4)) % bass.length];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, t);

        bassGain.gain.setValueAtTime(0.0, t);
        bassGain.gain.linearRampToValueAtTime(0.15, t + 0.02);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGainNode);

        bassOsc.start(t);
        bassOsc.stop(t + 0.36);
      }

      this.currentNoteIndex = (this.currentNoteIndex + 1) % melody.length;
      this.bgmTimer = window.setTimeout(playStep, stepDuration);
    };

    playStep();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public toggleBGM(): boolean {
    if (this.isBgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startCheerfulBGM();
      return true;
    }
  }
}

export const soundFx = new SoundSystem();
