import { HandPoint } from '../types/game';

// Define global MediaPipe window interfaces
declare global {
  interface Window {
    Hands?: any;
    Camera?: any;
  }
}

export interface MediaPipeStatus {
  isSupported: boolean;
  isLoading: boolean;
  isActive: boolean;
  hasPermission: boolean;
  error?: string;
  detectedHandsCount: number;
  fps: number;
}

export class MediaPipeService {
  private videoElement: HTMLVideoElement | null = null;
  private mediaStream: MediaStream | null = null;
  private handsInstance: any = null;
  private animFrameId: number | null = null;
  private isProcessingFrame: boolean = false;
  private onHandsDetectedCallback: ((points: HandPoint[]) => void) | null = null;
  private statusCallback: ((status: MediaPipeStatus) => void) | null = null;

  private frameCount: number = 0;
  private lastFpsTime: number = performance.now();
  private currentFps: number = 0;

  // Track previous coordinates for trajectory interpolation & zero-miss swipes
  private prevPositions: Map<number, { x: number; y: number }> = new Map();

  private status: MediaPipeStatus = {
    isSupported: true,
    isLoading: false,
    isActive: false,
    hasPermission: false,
    detectedHandsCount: 0,
    fps: 0,
  };

  private notifyStatus() {
    if (this.statusCallback) {
      this.statusCallback({ ...this.status, fps: this.currentFps });
    }
  }

  public setStatusListener(cb: (status: MediaPipeStatus) => void) {
    this.statusCallback = cb;
    this.notifyStatus();
  }

  public setHandsListener(cb: (points: HandPoint[]) => void) {
    this.onHandsDetectedCallback = cb;
  }

  /**
   * Load MediaPipe Scripts dynamically from CDN
   */
  public async loadScripts(): Promise<boolean> {
    if (window.Hands) {
      return true;
    }

    this.status.isLoading = true;
    this.status.error = undefined;
    this.notifyStatus();

    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.crossOrigin = 'anonymous';
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Gagal memuat ${src}`));
        document.head.appendChild(s);
      });
    };

    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.min.js');
      this.status.isLoading = false;
      this.notifyStatus();
      return true;
    } catch (err: any) {
      console.warn('Fallback to unpkg for MediaPipe hands...', err);
      try {
        await loadScript('https://unpkg.com/@mediapipe/hands@0.4.1675469240/hands.min.js');
        this.status.isLoading = false;
        this.notifyStatus();
        return true;
      } catch (e2) {
        console.error('All MediaPipe CDNs failed:', e2);
        this.status.isLoading = false;
        this.status.error = 'Kamera Vision MediaPipe tidak dapat diunduh. Mode sentuh papan interaktif tetap berfungsi penuh!';
        this.notifyStatus();
        return false;
      }
    }
  }

  /**
   * Initialize Camera and Hands Tracking
   */
  public async start(videoEl: HTMLVideoElement): Promise<boolean> {
    this.videoElement = videoEl;

    const scriptsLoaded = await this.loadScripts();
    if (!scriptsLoaded || !window.Hands) {
      this.status.error = 'Komponen MediaPipe belum siap.';
      this.notifyStatus();
      return false;
    }

    try {
      this.status.isLoading = true;
      this.notifyStatus();

      // Acquire camera stream with high FPS request and optimal resolution for ultra-low latency
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 480, max: 640 },
          height: { ideal: 360, max: 480 },
          frameRate: { ideal: 60, min: 30 },
          facingMode: 'user',
        },
        audio: false,
      });

      this.mediaStream = stream;
      this.videoElement.srcObject = stream;

      await new Promise<void>((resolve) => {
        if (!this.videoElement) return resolve();
        this.videoElement.onloadedmetadata = () => {
          this.videoElement?.play().then(() => resolve()).catch(() => resolve());
        };
      });

      // Initialize Hands with LITE model complexity for 0-delay response
      this.handsInstance = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
        },
      });

      // Ultra-fast Lite Model (complexity: 0) and sensitive thresholds (0.3)
      this.handsInstance.setOptions({
        maxNumHands: 2,
        modelComplexity: 0, // 0 = LITE model (sub-15ms inference, zero lag!)
        minDetectionConfidence: 0.3, // High sensitivity
        minTrackingConfidence: 0.3,  // Keeps track smoothly during fast motion
      });

      this.handsInstance.onResults((results: any) => {
        this.processResults(results);
      });

      this.status.isActive = true;
      this.status.hasPermission = true;
      this.status.isLoading = false;
      this.status.error = undefined;
      this.notifyStatus();

      // Start custom smooth frame pump loop
      this.startFrameLoop();
      return true;
    } catch (err: any) {
      console.error('Camera/MediaPipe start error:', err);
      this.status.isActive = false;
      this.status.isLoading = false;
      this.status.error = 'Izin kamera belum diberikan atau webcam tidak terdeteksi. Sentuh layar langsung untuk bermain!';
      this.notifyStatus();
      return false;
    }
  }

  private startFrameLoop() {
    this.frameCount = 0;
    this.lastFpsTime = performance.now();

    const loop = async () => {
      if (!this.status.isActive) return;

      const now = performance.now();
      this.frameCount++;
      if (now - this.lastFpsTime >= 1000) {
        this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
        this.frameCount = 0;
        this.lastFpsTime = now;
        this.notifyStatus();
      }

      if (
        this.videoElement &&
        this.videoElement.readyState >= 2 &&
        this.handsInstance &&
        !this.isProcessingFrame
      ) {
        this.isProcessingFrame = true;
        try {
          await this.handsInstance.send({ image: this.videoElement });
        } catch (e) {
          // ignore transient frame drop
        } finally {
          this.isProcessingFrame = false;
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private processResults(results: any) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      this.status.detectedHandsCount = 0;
      this.prevPositions.clear();
      this.notifyStatus();
      if (this.onHandsDetectedCallback) {
        this.onHandsDetectedCallback([]);
      }
      return;
    }

    this.status.detectedHandsCount = results.multiHandLandmarks.length;
    this.notifyStatus();

    const handPoints: HandPoint[] = [];

    results.multiHandLandmarks.forEach((landmarks: any[], handIndex: number) => {
      // Landmark 8 is the tip of the index finger
      const indexTip = landmarks[8];

      if (indexTip) {
        // Mirrored coordinate: webcam is mirrored so moving right hand moves right on screen
        const currX = 1 - indexTip.x;
        const currY = indexTip.y;

        const prev = this.prevPositions.get(handIndex);
        const prevX = prev ? prev.x : currX;
        const prevY = prev ? prev.y : currY;

        this.prevPositions.set(handIndex, { x: currX, y: currY });

        handPoints.push({
          x: currX,
          y: currY,
          prevX,
          prevY,
          confidence: 0.95,
          playerSide: currX < 0.5 ? 'p1' : 'p2',
          allPoints: [{ x: currX, y: currY }],
        });
      }
    });

    if (this.onHandsDetectedCallback) {
      this.onHandsDetectedCallback(handPoints);
    }
  }

  public stop() {
    this.status.isActive = false;
    this.status.detectedHandsCount = 0;
    this.currentFps = 0;
    this.prevPositions.clear();

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    if (this.handsInstance) {
      try {
        this.handsInstance.close();
      } catch (e) {
        // ignore
      }
      this.handsInstance = null;
    }

    this.notifyStatus();
  }
}

export const mediaPipeTracker = new MediaPipeService();
