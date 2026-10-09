import React, { useEffect, useRef } from 'react';

interface MarineCharacter {
  id: number;
  character: 'nemo' | 'dory' | 'crush' | 'squirt' | 'mr_ray' | 'gill' | 'bubbles_tang' | 'jellyfish' | 'school';
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseY: number;
  size: number;
  direction: 1 | -1; // 1 = moving right, -1 = moving left
  depth: number; // 0.35 (background) to 1.0 (foreground)
  tailPhase: number;
  tailSpeed: number;
  bobFreq: number;
  bobAmp: number;
  specialPhase: number;
}

interface OceanBubble {
  x: number;
  y: number;
  size: number;
  speedY: number;
  wobblePhase: number;
  wobbleSpeed: number;
  alpha: number;
}

interface MarineSparkle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speedY: number;
  speedX: number;
}

export const UnderwaterBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Seed Pixar Finding Nemo Cast & Marine Life
    const creatures: MarineCharacter[] = [
      // 1. Nemo (Playful Clownfish with distinct "lucky fin")
      {
        id: 1,
        character: 'nemo',
        x: width * 0.25,
        y: height * 0.42,
        baseY: height * 0.42,
        vx: 1.1,
        vy: 0,
        size: 38,
        direction: 1,
        depth: 0.95,
        tailPhase: 0,
        tailSpeed: 0.24,
        bobFreq: 0.04,
        bobAmp: 16,
        specialPhase: 0,
      },
      // 2. Dory (Vibrant Blue Tang with cheerful loop & friendly Disney eyes)
      {
        id: 2,
        character: 'dory',
        x: width * 0.65,
        y: height * 0.36,
        baseY: height * 0.36,
        vx: -1.2,
        vy: 0,
        size: 44,
        direction: -1,
        depth: 0.92,
        tailPhase: 1.5,
        tailSpeed: 0.22,
        bobFreq: 0.035,
        bobAmp: 20,
        specialPhase: 0,
      },
      // 3. Crush (Chill Surfer Sea Turtle gliding gracefully)
      {
        id: 3,
        character: 'crush',
        x: width * 0.15,
        y: height * 0.26,
        baseY: height * 0.26,
        vx: 0.75,
        vy: 0,
        size: 82,
        direction: 1,
        depth: 0.85,
        tailPhase: 0.5,
        tailSpeed: 0.12,
        bobFreq: 0.02,
        bobAmp: 12,
        specialPhase: 0,
      },
      // 4. Squirt (Little baby sea turtle swimming right next to Crush!)
      {
        id: 4,
        character: 'squirt',
        x: width * 0.08,
        y: height * 0.23,
        baseY: height * 0.23,
        vx: 0.8,
        vy: 0,
        size: 36,
        direction: 1,
        depth: 0.88,
        tailPhase: 2.1,
        tailSpeed: 0.20,
        bobFreq: 0.04,
        bobAmp: 14,
        specialPhase: 0,
      },
      // 5. Mr. Ray (Spotted Eagle Ray schoolteacher soaring with wide wings)
      {
        id: 5,
        character: 'mr_ray',
        x: width * 0.8,
        y: height * 0.19,
        baseY: height * 0.19,
        vx: -0.65,
        vy: 0,
        size: 110,
        direction: -1,
        depth: 0.75,
        tailPhase: 0,
        tailSpeed: 0.08,
        bobFreq: 0.015,
        bobAmp: 10,
        specialPhase: 0,
      },
      // 6. Gill (Moorish Idol with long dorsal ribbon)
      {
        id: 6,
        character: 'gill',
        x: width * 0.45,
        y: height * 0.55,
        baseY: height * 0.55,
        vx: 0.9,
        vy: 0,
        size: 48,
        direction: 1,
        depth: 0.82,
        tailPhase: 3.0,
        tailSpeed: 0.18,
        bobFreq: 0.03,
        bobAmp: 15,
        specialPhase: 0,
      },
      // 7. Bubbles (Yellow Tang obsessed with bubbles)
      {
        id: 7,
        character: 'bubbles_tang',
        x: width * 0.85,
        y: height * 0.52,
        baseY: height * 0.52,
        vx: -1.0,
        vy: 0,
        size: 38,
        direction: -1,
        depth: 0.88,
        tailPhase: 1.2,
        tailSpeed: 0.25,
        bobFreq: 0.045,
        bobAmp: 18,
        specialPhase: 0,
      },
      // 8. Bioluminescent Pixar Jellyfish 1
      {
        id: 8,
        character: 'jellyfish',
        x: width * 0.32,
        y: height * 0.62,
        baseY: height * 0.62,
        vx: 0.35,
        vy: 0,
        size: 40,
        direction: 1,
        depth: 0.70,
        tailPhase: 0.8,
        tailSpeed: 0.10,
        bobFreq: 0.025,
        bobAmp: 22,
        specialPhase: 0,
      },
      // 9. Bioluminescent Pixar Jellyfish 2
      {
        id: 9,
        character: 'jellyfish',
        x: width * 0.72,
        y: height * 0.68,
        baseY: height * 0.68,
        vx: -0.3,
        vy: 0,
        size: 48,
        direction: -1,
        depth: 0.72,
        tailPhase: 2.4,
        tailSpeed: 0.09,
        bobFreq: 0.02,
        bobAmp: 25,
        specialPhase: 0,
      },
      // 10. School of little silver moonfish
      {
        id: 10,
        character: 'school',
        x: width * 0.5,
        y: height * 0.32,
        baseY: height * 0.32,
        vx: 1.3,
        vy: 0,
        size: 18,
        direction: 1,
        depth: 0.60,
        tailPhase: 0,
        tailSpeed: 0.28,
        bobFreq: 0.05,
        bobAmp: 12,
        specialPhase: 0,
      },
      // 11. Extra distant clownfish friend (Coral background)
      {
        id: 11,
        character: 'nemo',
        x: width * 0.05,
        y: height * 0.65,
        baseY: height * 0.65,
        vx: -0.7,
        vy: 0,
        size: 26,
        direction: -1,
        depth: 0.55,
        tailPhase: 3.5,
        tailSpeed: 0.20,
        bobFreq: 0.03,
        bobAmp: 10,
        specialPhase: 0,
      },
      // 12. Distant Blue Tang
      {
        id: 12,
        character: 'dory',
        x: width * 0.92,
        y: height * 0.46,
        baseY: height * 0.46,
        vx: 0.85,
        vy: 0,
        size: 30,
        direction: 1,
        depth: 0.58,
        tailPhase: 2.8,
        tailSpeed: 0.20,
        bobFreq: 0.03,
        bobAmp: 12,
        specialPhase: 0,
      },
    ];

    // Pixar Translucent Rising Bubbles
    const bubbles: OceanBubble[] = [];
    for (let i = 0; i < 30; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 3 + Math.random() * 9,
        speedY: 0.4 + Math.random() * 0.8,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.03,
        alpha: 0.25 + Math.random() * 0.45,
      });
    }

    // Marine dust motes / water sparkles
    const sparkles: MarineSparkle[] = [];
    for (let s = 0; s < 45; s++) {
      sparkles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.6,
        speedY: (Math.random() - 0.5) * 0.2,
        speedX: 0.15 + Math.random() * 0.35,
      });
    }

    let animId: number;
    let time = 0;

    // --- CHARACTER RENDERERS (Pixar & Disney Style) ---

    // 1. NEMO (Clownfish with big cute cartoon eyes, white stripes, lucky fin)
    const drawNemo = (f: MarineCharacter) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(f.direction, 1);
      ctx.globalAlpha = 0.55 + f.depth * 0.45;

      const tailWag = Math.sin(f.tailPhase) * 6;
      const s = f.size;

      // Soft character drop-shadow for 3D Pixar feel
      ctx.shadowColor = 'rgba(2, 44, 82, 0.45)';
      ctx.shadowBlur = 10 * f.depth;

      // Caudal Fin (Tail) - Orange with black & white border
      ctx.fillStyle = '#ff6b1a';
      ctx.beginPath();
      ctx.moveTo(-s * 0.7, 0);
      ctx.quadraticCurveTo(-s * 1.0, -s * 0.45 + tailWag, -s * 1.3, -s * 0.5 + tailWag);
      ctx.quadraticCurveTo(-s * 1.15, tailWag, -s * 1.3, s * 0.5 + tailWag);
      ctx.quadraticCurveTo(-s * 1.0, s * 0.45 + tailWag, -s * 0.7, 0);
      ctx.closePath();
      ctx.fill();

      // Tail black and white tip line
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Dorsal Fin (Top wavy fin)
      ctx.fillStyle = '#ff6b1a';
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, -s * 0.4);
      ctx.quadraticCurveTo(-s * 0.1, -s * 0.85, s * 0.25, -s * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Main Round Clownfish Body (Bright Pixar Tangerine)
      const bodyGrad = ctx.createRadialGradient(-s * 0.1, -s * 0.15, s * 0.1, 0, 0, s * 0.9);
      bodyGrad.addColorStop(0, '#ffa040');
      bodyGrad.addColorStop(0.65, '#ff6200');
      bodyGrad.addColorStop(1, '#db4500');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.85, s * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stripe 1: Tail Stripe (White with crisp black outline)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-s * 0.52, 0, s * 0.11, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Stripe 2: Middle Saddle Stripe (Curved, distinctive Nemo shape)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-s * 0.08, -s * 0.52);
      ctx.quadraticCurveTo(-s * 0.2, 0, -s * 0.08, s * 0.52);
      ctx.lineTo(s * 0.06, s * 0.52);
      ctx.quadraticCurveTo(-s * 0.04, 0, s * 0.06, -s * 0.52);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Stripe 3: Head Stripe
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(s * 0.42, 0, s * 0.12, s * 0.44, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Nemo's "Lucky Fin" (Pectoral fin on one side smaller and cute!)
      const finFlutter = Math.sin(time * 8 + f.id) * 0.3;
      ctx.save();
      ctx.translate(s * 0.12, s * 0.16);
      ctx.rotate(0.3 + finFlutter);
      ctx.fillStyle = '#ff7a1a';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.24, s * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // Big Expressive Pixar Cartoon Eye
      ctx.shadowBlur = 0; // sharp eyes
      const eyeX = s * 0.58;
      const eyeY = -s * 0.14;
      const eyeR = s * 0.16;

      // Eye White
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Iris (Warm Amber Orange)
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(eyeX + s * 0.03, eyeY, eyeR * 0.68, 0, Math.PI * 2);
      ctx.fill();

      // Pupil (Deep Black)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(eyeX + s * 0.04, eyeY, eyeR * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Pixar Eye Highlight (Two white glints)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX + s * 0.02, eyeY - s * 0.04, eyeR * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeX + s * 0.06, eyeY + s * 0.03, eyeR * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Cute Disney Smile
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(s * 0.62, s * 0.12, s * 0.12, 0.1 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      ctx.restore();
    };

    // 2. DORY (Regal Blue Tang with yellow fins, black swirl, pink/magenta Disney eyes)
    const drawDory = (f: MarineCharacter) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(f.direction, 1);
      ctx.globalAlpha = 0.55 + f.depth * 0.45;

      const tailWag = Math.sin(f.tailPhase) * 6;
      const s = f.size;

      ctx.shadowColor = 'rgba(2, 44, 82, 0.45)';
      ctx.shadowBlur = 10 * f.depth;

      // Bright Sunny Yellow Tail (with triangular cleft)
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-s * 0.65, 0);
      ctx.lineTo(-s * 1.35, -s * 0.55 + tailWag);
      ctx.lineTo(-s * 1.15, tailWag);
      ctx.lineTo(-s * 1.35, s * 0.55 + tailWag);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Royal Blue Body Gradient
      const doryGrad = ctx.createRadialGradient(-s * 0.1, -s * 0.15, s * 0.15, 0, 0, s * 0.9);
      doryGrad.addColorStop(0, '#3b82f6');
      doryGrad.addColorStop(0.65, '#1d4ed8');
      doryGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = doryGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.88, s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dory's Iconic Black Palette Swoosh Pattern
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = s * 0.18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-s * 0.12, 0, s * 0.46, 0.25 * Math.PI, 1.75 * Math.PI);
      ctx.stroke();

      // Pectoral Yellow Fin
      const finWave = Math.sin(time * 7 + f.id) * 0.35;
      ctx.save();
      ctx.translate(s * 0.15, s * 0.14);
      ctx.rotate(0.3 + finWave);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.32, s * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      // Dory's Big Expressive Magenta/Pink Disney Eyes
      ctx.shadowBlur = 0;
      const eyeX = s * 0.55;
      const eyeY = -s * 0.16;
      const eyeR = s * 0.17;

      // White Sclera
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Magenta Iris (Dory's signature feature!)
      ctx.fillStyle = '#db2777';
      ctx.beginPath();
      ctx.arc(eyeX + s * 0.03, eyeY, eyeR * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(eyeX + s * 0.04, eyeY, eyeR * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Double Glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX + s * 0.02, eyeY - s * 0.05, eyeR * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeX + s * 0.06, eyeY + s * 0.03, eyeR * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Friendly Big Smile
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(s * 0.62, s * 0.14, s * 0.14, 0.1 * Math.PI, 0.75 * Math.PI);
      ctx.stroke();

      ctx.restore();
    };

    // 3. CRUSH & SQUIRT (Sea Turtles gliding on the East Australian Current)
    const drawTurtle = (f: MarineCharacter, isSquirt: boolean) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(f.direction, 1);
      ctx.globalAlpha = 0.5 + f.depth * 0.5;

      const s = f.size;
      const flipperWave = Math.sin(f.tailPhase) * 0.4;

      ctx.shadowColor = 'rgba(2, 44, 82, 0.5)';
      ctx.shadowBlur = 12 * f.depth;

      // Surfer Back Flippers
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.ellipse(-s * 0.6, -s * 0.22, s * 0.25, s * 0.12, -0.4, 0, Math.PI * 2);
      ctx.ellipse(-s * 0.6, s * 0.22, s * 0.25, s * 0.12, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Turtle Shell (Dome with pattern scutes)
      const shellGrad = ctx.createRadialGradient(-s * 0.1, -s * 0.1, s * 0.1, 0, 0, s * 0.7);
      shellGrad.addColorStop(0, '#10b981');
      shellGrad.addColorStop(0.65, '#047857');
      shellGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = shellGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.68, s * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = isSquirt ? 1.4 : 2.2;
      ctx.stroke();

      // Scute Pattern rings inside shell
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
      ctx.lineWidth = 1.5;
      for (let sc = -2; sc <= 2; sc++) {
        ctx.beginPath();
        ctx.arc(sc * (s * 0.2), 0, s * 0.16, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Friendly Head
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(s * 0.8, 0, s * 0.26, s * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Big Calm Cartoon Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s * 0.88, -s * 0.06, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(s * 0.90, -s * 0.06, s * 0.045, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s * 0.89, -s * 0.08, s * 0.02, 0, Math.PI * 2);
      ctx.fill();

      // Cool Dude Smile
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(s * 0.88, s * 0.06, s * 0.08, 0.1 * Math.PI, 0.7 * Math.PI);
      ctx.stroke();

      // Undulating Hydrodynamic Front Flippers (Sweeping strokes)
      ctx.fillStyle = '#10b981';

      // Top Flipper
      ctx.save();
      ctx.translate(s * 0.35, -s * 0.32);
      ctx.rotate(-0.8 + flipperWave);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.55, s * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      // Bottom Flipper
      ctx.save();
      ctx.translate(s * 0.35, s * 0.32);
      ctx.rotate(0.8 - flipperWave);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.55, s * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    };

    // 4. MR. RAY (Spotted Eagle Ray singing & gliding over the reef)
    const drawMrRay = (f: MarineCharacter) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(f.direction, 1);
      ctx.globalAlpha = 0.5 + f.depth * 0.5;

      const s = f.size;
      const wingFlap = Math.sin(f.tailPhase) * (s * 0.12);

      // Long Whip Tail
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, 0);
      ctx.quadraticCurveTo(-s * 1.2, Math.sin(time * 3) * 15, -s * 1.8, 0);
      ctx.stroke();

      // Wide Majestic Ray Wings
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.moveTo(s * 0.55, 0); // rostrum / snout
      ctx.quadraticCurveTo(s * 0.15, -s * 0.7 - wingFlap, -s * 0.35, -s * 0.85 - wingFlap); // Left Wing Tip
      ctx.quadraticCurveTo(-s * 0.25, 0, -s * 0.45, 0);
      ctx.quadraticCurveTo(-s * 0.25, 0, -s * 0.35, s * 0.85 + wingFlap); // Right Wing Tip
      ctx.quadraticCurveTo(s * 0.15, s * 0.7 + wingFlap, s * 0.55, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Mr. Ray's White Polka Dot Spots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      const dots = [
        { dx: -0.15, dy: -0.35, r: 0.04 },
        { dx: -0.05, dy: -0.5, r: 0.035 },
        { dx: 0.1, dy: -0.3, r: 0.04 },
        { dx: -0.15, dy: 0.35, r: 0.04 },
        { dx: -0.05, dy: 0.5, r: 0.035 },
        { dx: 0.1, dy: 0.3, r: 0.04 },
        { dx: -0.05, dy: 0, r: 0.045 },
        { dx: 0.2, dy: 0, r: 0.04 },
      ];
      dots.forEach((d) => {
        ctx.beginPath();
        ctx.arc(d.dx * s, d.dy * s, d.r * s, 0, Math.PI * 2);
        ctx.fill();
      });

      // Friendly Disney Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s * 0.45, -s * 0.14, s * 0.065, 0, Math.PI * 2);
      ctx.arc(s * 0.45, s * 0.14, s * 0.065, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(s * 0.47, -s * 0.14, s * 0.035, 0, Math.PI * 2);
      ctx.arc(s * 0.47, s * 0.14, s * 0.035, 0, Math.PI * 2);
      ctx.fill();

      // Jolly singing smile
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(s * 0.52, 0, s * 0.08, -0.4 * Math.PI, 0.4 * Math.PI);
      ctx.stroke();

      ctx.restore();
    };

    // 5. GILL (Moorish Idol with dramatic dorsal streamer)
    const drawGill = (f: MarineCharacter) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(f.direction, 1);
      ctx.globalAlpha = 0.55 + f.depth * 0.45;

      const s = f.size;
      const tailWag = Math.sin(f.tailPhase) * 5;

      // Long flowing dorsal streamer
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, -s * 0.7);
      ctx.bezierCurveTo(
        -s * 0.5,
        -s * 1.2 + Math.sin(time * 4) * 10,
        -s * 1.1,
        -s * 1.5,
        -s * 1.6,
        -s * 1.2
      );
      ctx.stroke();

      // Triangular Moorish Idol Body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(s * 0.7, 0); // snout
      ctx.lineTo(-s * 0.1, -s * 0.75); // top apex
      ctx.lineTo(-s * 0.55, -s * 0.2);
      ctx.lineTo(-s * 0.9, -s * 0.3 + tailWag);
      ctx.lineTo(-s * 0.9, s * 0.3 + tailWag);
      ctx.lineTo(-s * 0.55, s * 0.2);
      ctx.lineTo(-s * 0.1, s * 0.75); // bottom apex
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bold Black & Sunny Yellow Bands
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(s * 0.4, -s * 0.4);
      ctx.lineTo(s * 0.1, -s * 0.7);
      ctx.lineTo(s * 0.0, s * 0.7);
      ctx.lineTo(s * 0.3, s * 0.4);
      ctx.closePath();
      ctx.fill();

      // Yellow Accent Band
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(-s * 0.25, -s * 0.5);
      ctx.lineTo(-s * 0.1, -s * 0.65);
      ctx.lineTo(-s * 0.1, s * 0.65);
      ctx.lineTo(-s * 0.25, s * 0.5);
      ctx.closePath();
      ctx.fill();

      // Distinct scar & stern serious leader eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s * 0.48, -s * 0.1, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(s * 0.51, -s * 0.1, s * 0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 6. BUBBLES THE YELLOW TANG
    const drawBubblesTang = (f: MarineCharacter) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(f.direction, 1);
      ctx.globalAlpha = 0.55 + f.depth * 0.45;

      const s = f.size;
      const tailWag = Math.sin(f.tailPhase) * 5;

      // Bright Canary Yellow Diamond Body
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(s * 0.75, 0); // snout
      ctx.lineTo(s * 0.1, -s * 0.65);
      ctx.lineTo(-s * 0.5, -s * 0.4);
      ctx.lineTo(-s * 1.0, -s * 0.35 + tailWag);
      ctx.lineTo(-s * 1.0, s * 0.35 + tailWag);
      ctx.lineTo(-s * 0.5, s * 0.4);
      ctx.lineTo(s * 0.1, s * 0.65);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Big Wide Cartoon Eyeballs ("My Bubbles!!")
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s * 0.46, -s * 0.12, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(s * 0.50, -s * 0.12, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s * 0.48, -s * 0.15, s * 0.04, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 7. BIOLUMINESCENT JELLYFISH BLOOM (Pixar Jellyfish Forest scene)
    const drawJellyfish = (f: MarineCharacter) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.globalAlpha = 0.45 + f.depth * 0.4;

      const s = f.size;
      const pulse = 1 + Math.sin(f.tailPhase * 2) * 0.15;

      // Translucent Bioluminescent Dome
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 18;

      const jellyGrad = ctx.createRadialGradient(0, -s * 0.1, s * 0.1, 0, 0, s * 0.6 * pulse);
      jellyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      jellyGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.7)');
      jellyGrad.addColorStop(1, 'rgba(192, 132, 252, 0.3)');
      ctx.fillStyle = jellyGrad;

      ctx.beginPath();
      ctx.arc(0, 0, s * 0.6 * pulse, Math.PI, 0);
      ctx.quadraticCurveTo(0, s * 0.2, -s * 0.6 * pulse, 0);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Wavy glowing tentacles
      ctx.strokeStyle = 'rgba(251, 113, 133, 0.75)';
      ctx.lineWidth = 1.8;
      for (let t = -3; t <= 3; t++) {
        const tx = t * (s * 0.14);
        ctx.beginPath();
        ctx.moveTo(tx, 0);
        ctx.bezierCurveTo(
          tx + Math.sin(time * 3 + t) * 8,
          s * 0.5,
          tx - Math.sin(time * 3 + t) * 10,
          s * 1.0,
          tx + Math.sin(time * 3 + t) * 12,
          s * 1.6
        );
        ctx.stroke();
      }

      ctx.restore();
    };

    // 8. SCHOOL OF LITTLE MOONFISH
    const drawSchool = (f: MarineCharacter) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(f.direction, 1);
      ctx.globalAlpha = 0.5 + f.depth * 0.4;

      const s = f.size;
      const positions = [
        { dx: 0, dy: 0 },
        { dx: -24, dy: -12 },
        { dx: -18, dy: 14 },
        { dx: -42, dy: -6 },
        { dx: -38, dy: 22 },
        { dx: -60, dy: 8 },
        { dx: -54, dy: -18 },
      ];

      positions.forEach((p, idx) => {
        const fishWave = Math.sin(f.tailPhase + idx * 0.5) * 3;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(p.dx, p.dy + fishWave, s * 0.7, s * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tiny yellow tail
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(p.dx - s * 0.5, p.dy + fishWave);
        ctx.lineTo(p.dx - s * 1.1, p.dy - s * 0.3 + fishWave);
        ctx.lineTo(p.dx - s * 1.1, p.dy + s * 0.3 + fishWave);
        ctx.closePath();
        ctx.fill();
      });

      ctx.restore();
    };

    // --- REEF CORAL SEABED & SEA ANEMONES (Pixar Great Barrier Reef) ---
    const drawReefBed = () => {
      // 1. Far Deep Reef Silhouette (Indigo)
      ctx.fillStyle = 'rgba(7, 30, 60, 0.85)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 50) {
        const h = 55 + Math.sin(x * 0.015) * 35 + Math.cos(x * 0.04) * 20;
        ctx.lineTo(x, height - h);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // 2. Midground Colorful Pixar Coral Sponges & Brain Corals
      const corals = [
        { color: '#ec4899', x: width * 0.08, r: 60, shape: 'brain' },
        { color: '#8b5cf6', x: width * 0.22, r: 45, shape: 'tubes' },
        { color: '#f59e0b', x: width * 0.38, r: 55, shape: 'fan' },
        { color: '#06b6d4', x: width * 0.55, r: 50, shape: 'brain' },
        { color: '#10b981', x: width * 0.70, r: 65, shape: 'fan' },
        { color: '#f43f5e', x: width * 0.85, r: 58, shape: 'tubes' },
        { color: '#a855f7', x: width * 0.95, r: 50, shape: 'brain' },
      ];

      corals.forEach((c) => {
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(c.x, height - 15, c.r, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // 3. Iconic Sea Anemone Clumps (Nemo's Home!) with swaying tentacles
      const anemoneClusters = [
        { x: width * 0.14, color: '#fb7185', tipColor: '#fed7aa' },
        { x: width * 0.48, color: '#f472b6', tipColor: '#fef08a' },
        { x: width * 0.78, color: '#c084fc', tipColor: '#a7f3d0' },
      ];

      anemoneClusters.forEach((cl) => {
        for (let t = -7; t <= 7; t++) {
          const tentX = cl.x + t * 8;
          const sway = Math.sin(time * 2.5 + t * 0.4) * 14;
          const tentH = 65 + Math.cos(t) * 20;

          ctx.strokeStyle = cl.color;
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tentX, height - 10);
          ctx.quadraticCurveTo(
            tentX + sway * 0.6,
            height - tentH * 0.6,
            tentX + sway,
            height - tentH
          );
          ctx.stroke();

          // Glowing bulb tip on tentacle
          ctx.fillStyle = cl.tipColor;
          ctx.beginPath();
          ctx.arc(tentX + sway, height - tentH, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Swaying Emerald Green Sea Kelp
      for (let k = 0; k < width; k += 80) {
        const sway = Math.sin(time * 1.8 + k * 0.05) * 22;
        const kelpH = 110 + Math.sin(k) * 45;

        ctx.strokeStyle = k % 2 === 0 ? 'rgba(16, 185, 129, 0.55)' : 'rgba(5, 150, 105, 0.65)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(k, height);
        ctx.quadraticCurveTo(
          k + sway * 0.5,
          height - kelpH * 0.5,
          k + sway,
          height - kelpH
        );
        ctx.stroke();
      }
    };

    // --- MAIN 60FPS ANIMATION LOOP ---
    const render = () => {
      time += 0.016;

      ctx.clearRect(0, 0, width, height);

      // 1. Lush Pixar Great Barrier Reef Ocean Gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
      oceanGrad.addColorStop(0, '#38bdf8'); // Sparkling sunlit cyan-blue
      oceanGrad.addColorStop(0.2, '#0284c7'); // Clear tropical azure
      oceanGrad.addColorStop(0.5, '#0369a1'); // Cobalt reef water
      oceanGrad.addColorStop(0.8, '#075985'); // Deep sea sapphire
      oceanGrad.addColorStop(1, '#020617'); // Dark coral bottom
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Volumetric Disney "God Rays" (Sunlight Caustics through water)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let r = 0; r < 6; r++) {
        const rayAngle = Math.sin(time * 0.35 + r * 1.2) * 0.1;
        const rayX = width * (0.12 + r * 0.16) + Math.sin(time * 0.3 + r) * 35;
        const rayW = 90 + r * 18;

        const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + rayAngle * height, height * 0.9);
        rayGrad.addColorStop(0, 'rgba(224, 242, 254, 0.32)');
        rayGrad.addColorStop(0.35, 'rgba(125, 211, 252, 0.16)');
        rayGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(rayX - 25, 0);
        ctx.lineTo(rayX + rayW + 25, 0);
        ctx.lineTo(rayX + rayW * 2.5, height * 0.9);
        ctx.lineTo(rayX - rayW * 0.6, height * 0.9);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 3. East Australian Current (EAC) Swirl Rings (Pixar current effect)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.8;
      for (let c = 0; c < 3; c++) {
        const ringX = ((time * 60 + c * (width / 3)) % (width + 200)) - 100;
        const ringY = height * (0.2 + c * 0.15) + Math.sin(time * 1.5 + c) * 20;
        ctx.beginPath();
        ctx.ellipse(ringX, ringY, 70, 24, 0.15, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 4. Floating Marine Dust Motes & Glistening Sparkles
      sparkles.forEach((s) => {
        s.x += s.speedX;
        s.y += s.speedY;
        if (s.x > width + 10) s.x = -10;
        if (s.y > height) s.y = 0;
        if (s.y < 0) s.y = height;

        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. Rising Translucent Pixar Sea Bubbles
      bubbles.forEach((b) => {
        b.y -= b.speedY;
        b.wobblePhase += b.wobbleSpeed;
        const wobbleX = Math.sin(b.wobblePhase) * 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x + wobbleX, b.y, b.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.4})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(186, 230, 253, ${b.alpha * 0.8})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Little specular white highlight on bubble
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(b.x + wobbleX - b.size * 0.35, b.y - b.size * 0.35, b.size * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (b.y < -15) {
          b.y = height + 15;
          b.x = Math.random() * width;
        }
      });

      // 6. Update & Render Pixar Marine Characters Swimming Left and Right
      creatures.forEach((f) => {
        // Horizontal movement
        f.x += f.vx;

        // Smooth cartoon bobbing wave
        f.y = f.baseY + Math.sin(time * 2.5 + f.id) * f.bobAmp;

        // Animate tails & fins
        f.tailPhase += f.tailSpeed;

        // Wrap around borders smoothly
        if (f.direction === 1 && f.x > width + 140) {
          f.x = -140;
          f.baseY = height * 0.16 + Math.random() * (height * 0.62);
        } else if (f.direction === -1 && f.x < -140) {
          f.x = width + 140;
          f.baseY = height * 0.16 + Math.random() * (height * 0.62);
        }

        // Draw character based on type
        switch (f.character) {
          case 'nemo':
            drawNemo(f);
            break;
          case 'dory':
            drawDory(f);
            break;
          case 'crush':
            drawTurtle(f, false);
            break;
          case 'squirt':
            drawTurtle(f, true);
            break;
          case 'mr_ray':
            drawMrRay(f);
            break;
          case 'gill':
            drawGill(f);
            break;
          case 'bubbles_tang':
            drawBubblesTang(f);
            break;
          case 'jellyfish':
            drawJellyfish(f);
            break;
          case 'school':
            drawSchool(f);
            break;
          default:
            drawNemo(f);
        }
      });

      // 7. Draw Great Barrier Reef Bed, Sea Anemones & Kelp
      drawReefBed();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
};
