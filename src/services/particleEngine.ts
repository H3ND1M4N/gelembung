import { Particle } from '../types/game';

export class ParticleEngine {
  private particles: Particle[] = [];

  /**
   * Emit a rich, physically-modeled Water Splash (Cipratan Air) effect
   * consisting of:
   * 1. High-speed splash jet droplets (elongated along trajectory)
   * 2. Crystal spherical water beads with specular light glints
   * 3. Fine water mist / vapor expansion puff
   * 4. Micro buoyant water foam bubbles drifting upward
   * 5. Expanding water surface shockwave ripple rings
   * 6. Celebratory golden stars (if correct)
   */
  public emitBubblePop(x: number, y: number, colorTheme: string, isCorrect: boolean) {
    // 1. Crystal Water Splash Beads (3D Shiny Droplets with specular shine)
    const beadCount = isCorrect ? 28 : 18;
    for (let i = 0; i < beadCount; i++) {
      // 360 degree explosion with upward fountain bias
      const angle = (Math.PI * 2 * i) / beadCount + (Math.random() - 0.5) * 0.4;
      const speed = (isCorrect ? 4.5 : 3.5) + Math.random() * 6.0;
      const radius = 2.5 + Math.random() * 5.0;

      let color = 'rgba(56, 189, 248, '; // cyan water
      if (colorTheme === 'emerald' || (isCorrect && Math.random() > 0.4)) {
        color = 'rgba(52, 211, 153, '; // emerald aqua
      } else if (colorTheme === 'amber') {
        color = 'rgba(251, 191, 36, ';
      } else if (colorTheme === 'rose' || (!isCorrect && Math.random() > 0.5)) {
        color = 'rgba(244, 63, 94, ';
      }

      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.8, // upward water fountain burst
        radius,
        alpha: 1.0,
        color,
        life: 0,
        maxLife: 32 + Math.random() * 18,
        type: 'water_bead',
      });
    }

    // 2. High-Speed Water Splash Jets (elongated water tendrils spraying outwards)
    const jetCount = isCorrect ? 14 : 9;
    for (let j = 0; j < jetCount; j++) {
      const angle = (Math.PI * 2 * j) / jetCount + (Math.random() - 0.5) * 0.3;
      const speed = 6.0 + Math.random() * 7.5; // very fast outward shoot
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        radius: 2.0 + Math.random() * 2.5,
        length: 8 + Math.random() * 14,
        alpha: 0.95,
        color: isCorrect ? 'rgba(186, 230, 253, ' : 'rgba(224, 242, 254, ',
        life: 0,
        maxLife: 20 + Math.random() * 10,
        type: 'splash_jet',
      });
    }

    // 3. Expanding Water Vapor / Mist Cloud (Soft puff diffusing at impact)
    const mistCount = 8;
    for (let m = 0; m < mistCount; m++) {
      const mistAngle = Math.random() * Math.PI * 2;
      const mistSpeed = 0.5 + Math.random() * 2.0;
      this.particles.push({
        x,
        y,
        vx: Math.cos(mistAngle) * mistSpeed,
        vy: Math.sin(mistAngle) * mistSpeed - 0.5,
        radius: 8 + Math.random() * 12,
        alpha: 0.65,
        color: 'rgba(224, 242, 254, ',
        life: 0,
        maxLife: 24 + Math.random() * 8,
        type: 'mist',
      });
    }

    // 4. Micro Buoyant Water Foam Bubbles (drifting gently upward)
    const bubbleCount = isCorrect ? 10 : 6;
    for (let b = 0; b < bubbleCount; b++) {
      const bAngle = Math.random() * Math.PI * 2;
      const bSpeed = 1.0 + Math.random() * 2.5;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(bAngle) * bSpeed,
        vy: Math.sin(bAngle) * bSpeed - 1.0,
        radius: 2.0 + Math.random() * 3.5,
        alpha: 0.85,
        color: 'rgba(255, 255, 255, ',
        life: 0,
        maxLife: 35 + Math.random() * 20,
        type: 'bubble',
      });
    }

    // 5. Dual Expanding Water Shockwave Ripple Rings
    // Ring 1: Sharp refractive inner ripple
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 12,
      alpha: 1.0,
      color: 'rgba(255, 255, 255, ',
      life: 0,
      maxLife: 22,
      type: 'ripple',
    });

    // Ring 2: Outer water pressure glow ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 18,
      alpha: 0.8,
      color: isCorrect ? 'rgba(52, 211, 153, ' : 'rgba(56, 189, 248, ',
      life: 0,
      maxLife: 28,
      type: 'ring',
    });

    // 6. Celebratory Golden Stars & Sparkles (for correct answers)
    if (isCorrect) {
      for (let s = 0; s < 14; s++) {
        const starAngle = Math.random() * Math.PI * 2;
        const starSpeed = 2.5 + Math.random() * 5.5;
        this.particles.push({
          x,
          y,
          vx: Math.cos(starAngle) * starSpeed,
          vy: Math.sin(starAngle) * starSpeed - 2.5,
          radius: 3.5 + Math.random() * 3.5,
          alpha: 1.0,
          color: 'rgba(250, 204, 21, ',
          life: 0,
          maxLife: 36 + Math.random() * 16,
          type: 'star',
        });
      }
    }
  }

  public updateAndRender(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;

      const progress = p.life / p.maxLife;
      p.alpha = Math.max(0, 1 - progress);

      // --- 1. WATER BEAD (Crystal 3D Water Droplet) ---
      if (p.type === 'water_bead') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.24; // realistic water gravity
        p.vx *= 0.98; // water surface air resistance

        const currentRadius = Math.max(0.6, p.radius * (1 - progress * 0.35));

        // Droplet outer glow and body
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha * 0.9})`;
        ctx.shadowColor = p.color + '0.7)';
        ctx.shadowBlur = 8;
        ctx.fill();

        // Shiny specular white highlight reflecting light
        const glintR = Math.max(0.4, currentRadius * 0.35);
        ctx.beginPath();
        ctx.arc(p.x - currentRadius * 0.32, p.y - currentRadius * 0.32, glintR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.95})`;
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.restore();
      }

      // --- 2. SPLASH JET (High-Speed Elongated Tendril Droplet) ---
      else if (p.type === 'splash_jet') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16;
        p.vx *= 0.96;

        const currentLength = (p.length || 10) * (1 - progress * 0.5);
        const currentWidth = p.radius * (1 - progress * 0.4);
        const angle = Math.atan2(p.vy, p.vx);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, currentLength, currentWidth, 0, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha * 0.85})`;
        ctx.shadowColor = 'rgba(186, 230, 253, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      // --- 3. MIST (Soft expanding water vapor puff) ---
      else if (p.type === 'mist') {
        p.x += p.vx;
        p.y += p.vy;
        p.radius += 0.75; // expanding puff
        p.vx *= 0.94;
        p.vy *= 0.94;

        ctx.save();
        const mistGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        mistGrad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha * 0.4})`);
        mistGrad.addColorStop(0.6, `${p.color}${p.alpha * 0.2})`);
        mistGrad.addColorStop(1, `${p.color}0)`);
        ctx.fillStyle = mistGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // --- 4. BUBBLE (Buoyant micro foam bubble drifting upward) ---
      else if (p.type === 'bubble') {
        p.x += p.vx + Math.sin(p.life * 0.3) * 0.5;
        p.y += p.vy;
        p.vy -= 0.05; // buoyancy upward drift
        p.vx *= 0.96;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.8})`;
        ctx.lineWidth = 1.0;
        ctx.fillStyle = `rgba(224, 242, 254, ${p.alpha * 0.3})`;
        ctx.fill();
        ctx.stroke();

        // Mini highlight
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.35, p.y - p.radius * 0.35, p.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.9})`;
        ctx.fill();
        ctx.restore();
      }

      // --- 5. RIPPLE & RING (Expanding water surface shockwave) ---
      else if (p.type === 'ripple' || p.type === 'ring') {
        p.radius += p.type === 'ripple' ? 4.5 : 3.8;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(0.8, (p.type === 'ripple' ? 3.5 : 5.0) * (1 - progress));
        ctx.strokeStyle = `${p.color}${p.alpha * (p.type === 'ripple' ? 0.9 : 0.65)})`;
        ctx.shadowColor = p.color + '0.7)';
        ctx.shadowBlur = p.type === 'ripple' ? 6 : 14;
        ctx.stroke();
        ctx.restore();
      }

      // --- 6. CELEBRATORY STAR (Sparkle for correct answers) ---
      else if (p.type === 'star') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.97;

        const r = p.radius * (1 - progress * 0.25);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowColor = 'rgba(250, 204, 21, 0.95)';
        ctx.shadowBlur = 12;

        // Radiant 4-pointed sparkle star
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.6);
        ctx.quadraticCurveTo(0, 0, r * 1.6, 0);
        ctx.quadraticCurveTo(0, 0, 0, r * 1.6);
        ctx.quadraticCurveTo(0, 0, -r * 1.6, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r * 1.6);
        ctx.fill();
        ctx.restore();
      }

      // Fallback for legacy droplet
      else if (p.type === 'droplet') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.vx *= 0.98;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius * (1 - progress * 0.4)), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public clear() {
    this.particles = [];
  }
}
