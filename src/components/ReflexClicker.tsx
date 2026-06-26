import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, Volume2, VolumeX, Award, Crosshair, Target, Zap, ShieldAlert, Sparkles, ChevronRight
} from 'lucide-react';

// Advanced Cyberpunk Audio Synthesizer using Web Audio API
class AimAudioSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch (e) {
        console.warn("AudioContext initialization failed: ", e);
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume();
      } catch (e) {
        console.warn("AudioCtx resume failed: ", e);
      }
    }
  }

  // Gun Shot sound variations
  playShot(weaponType: 'pistol' | 'rifle' | 'sniper') {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const noise = this.ctx.createOscillator(); // custom noise helper
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;

      if (weaponType === 'pistol') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (weaponType === 'rifle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else { // sniper
        // Deep powerful bass cannon shot
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.35);

        const subOsc = this.ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(60, now);
        subOsc.frequency.linearRampToValueAtTime(10, now + 0.4);
        subOsc.connect(gain);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc.start(now);
        subOsc.start(now);
        osc.stop(now + 0.4);
        subOsc.stop(now + 0.4);
      }
    } catch (e) {}
  }

  // Reload mechanical slide sound
  playReload() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // First mechanical click (mag out)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(800, now);
      osc1.frequency.linearRampToValueAtTime(200, now + 0.08);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Second mechanical lock (mag in)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(400, now + 0.15);
      osc2.frequency.linearRampToValueAtTime(900, now + 0.23);
      gain2.gain.setValueAtTime(0.1, now + 0.15);
      gain2.gain.linearRampToValueAtTime(0.001, now + 0.23);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.23);
    } catch (e) {}
  }

  // Dry trigger click when empty magazine
  playDryClick() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }

  // Target hit sound (nice glassy retro sound)
  playHit(isGolden: boolean, isExplosionEvent = false) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (isExplosionEvent) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        return;
      }

      osc.type = 'sine';
      const baseFreq = isGolden ? 1200 : 880;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playMiss() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  playLevelUp() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [293.66, 349.23, 440.00, 587.33, 880]; // D chord progression
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.08, this.ctx!.currentTime + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + idx * 0.06);
        osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.2);
      });
    } catch (e) {}
  }

  playGameOver() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch (e) {}
  }
}

const audioSynth = new AimAudioSynth();

interface Weapon {
  id: string;
  name: string;
  subtitle: string;
  maxAmmo: number;
  reloadTime: number; // ms
  fireDelay: number; // ms
  scoreMultiplier: number;
  icon: string;
  recoil: number;
  sound: 'pistol' | 'rifle' | 'sniper';
}

const WEAPONS_PRESETS: Weapon[] = [
  { id: 'pistol', name: 'Desert Eagle', subtitle: 'Нарийн онолт гар буу', maxAmmo: 7, reloadTime: 1000, fireDelay: 350, scoreMultiplier: 1.0, icon: '🔫', recoil: 12, sound: 'pistol' },
  { id: 'rifle', name: 'M4A4 Cyber', subtitle: 'Маш хурдан автомат буу', maxAmmo: 30, reloadTime: 1800, fireDelay: 130, scoreMultiplier: 1.2, icon: '💥', recoil: 6, sound: 'rifle' },
  { id: 'sniper', name: 'AWP Hyperbeast', subtitle: 'Макс оноот винтов', maxAmmo: 5, reloadTime: 2300, fireDelay: 850, scoreMultiplier: 2.5, icon: '🎯', recoil: 28, sound: 'sniper' }
];

interface AimTarget {
  id: number;
  x: number; // percentage (10 - 90)
  y: number; // percentage (10 - 90)
  vx: number; // bounce movement multiplier
  vy: number;
  size: number;
  maxSize: number;
  isGolden: boolean; 
  isBomb: boolean; // explodes and clears other targets if hit
  spawnTime: number;
  lifeTime: number; // total lifetime MS
  maxLifeTime: number;
  growing: boolean;
}

interface ShootPart {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

interface ScoreTextPop {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

interface LaserTrail {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
  color: string;
}

interface ReflexClickerProps {
  onGainXp: (amount: number) => void;
}

type ModeType = 'classic_arena' | 'speed_grid' | 'survival_flick';

export default function ReflexClicker({ onGainXp }: ReflexClickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Storage and profile systems
  const [highScores, setHighScores] = useState<Record<ModeType, number>>(() => {
    const savedClassic = localStorage.getItem('hs_aim_classic');
    const savedBlitz = localStorage.getItem('hs_aim_grid');
    const savedChase = localStorage.getItem('hs_aim_survival');
    return {
      classic_arena: savedClassic ? parseInt(savedClassic, 10) : 1000,
      speed_grid: savedBlitz ? parseInt(savedBlitz, 10) : 1500,
      survival_flick: savedChase ? parseInt(savedChase, 10) : 1200
    };
  });

  const [mute, setMute] = useState(false);
  const [mode, setMode] = useState<ModeType>('classic_arena');
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Weapon selected
  const [activeWeaponIdx, setActiveWeaponIdx] = useState<number>(0);
  const [ammo, setAmmo] = useState<number>(WEAPONS_PRESETS[0].maxAmmo);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadProgress, setReloadProgress] = useState(0);

  // Score statistics
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [lives, setLives] = useState(3);
  const [averageReaction, setAverageReaction] = useState<number>(0);

  // Guides
  const [showGuide, setShowGuide] = useState(true);
  const [customAimColor, setCustomAimColor] = useState<'#38bdf8' | '#22c55e' | '#ec4899' | '#eab308'>('#38bdf8');

  // Engine engineRef
  const currentWeapon = WEAPONS_PRESETS[activeWeaponIdx];
  const lastShotTimeRef = useRef<number>(0);
  const isReloadingRef = useRef<boolean>(false);

  // Sync to state to bypass rendering lags
  const stateRef = useRef({
    playing: false,
    gameOver: false,
    ammo: 7,
    maxAmmo: 7,
    score: 0,
    combo: 0,
    lives: 3,
    timeLeft: 30,
    activeWeaponIdx: 0,
    customAimColor: '#38bdf8',
    targets: [] as AimTarget[],
    particles: [] as ShootPart[],
    scorePops: [] as ScoreTextPop[],
    laserTrails: [] as LaserTrail[],
    nextTargetId: 1,
    clicksMade: 0,
    hitsMade: 0,
    totalReaction: 0,
    viewportShake: 0,
    lastCrosshairPos: { x: 50, y: 50 }
  });

  useEffect(() => {
    stateRef.current.playing = playing;
    stateRef.current.gameOver = gameOver;
    stateRef.current.ammo = ammo;
    stateRef.current.score = score;
    stateRef.current.combo = combo;
    stateRef.current.lives = lives;
    stateRef.current.timeLeft = timeLeft;
    stateRef.current.activeWeaponIdx = activeWeaponIdx;
    stateRef.current.customAimColor = customAimColor;
  }, [playing, gameOver, ammo, score, combo, lives, timeLeft, activeWeaponIdx, customAimColor]);

  // Handle Mute setting
  useEffect(() => {
    audioSynth.muted = mute;
  }, [mute]);

  // Target spawner helper
  const spawnTarget = (forceType?: 'bomb' | 'golden' | 'normal') => {
    const s = stateRef.current;
    const paddingX = 15;
    const paddingY = 15;
    const rx = paddingX + Math.random() * (100 - paddingX * 2);
    const ry = paddingY + Math.random() * (100 - paddingY * 2);

    // Randomize velocity for bouncing targets (survival flick has moving targets!)
    const hasVelocity = mode === 'survival_flick';
    const vx = hasVelocity ? (Math.random() - 0.5) * 0.4 : 0;
    const vy = hasVelocity ? (Math.random() - 0.5) * 0.4 : 0;

    let isGold = false;
    let isBomb = false;

    if (forceType === 'golden') {
      isGold = true;
    } else if (forceType === 'bomb') {
      isBomb = true;
    } else {
      const rand = Math.random();
      if (rand < 0.12) isGold = true; // 12% golden targets
      else if (rand < 0.20) isBomb = true; // 8% cyber-bombs targets
    }

    // Reaction timers
    const levelModifier = Math.min(1800, s.score * 1.2);
    const baseLifeTime = mode === 'speed_grid' ? 1400 : 2500;
    const calculatedLife = Math.max(650, baseLifeTime - levelModifier);

    const newTarget: AimTarget = {
      id: s.nextTargetId++,
      x: rx,
      y: ry,
      vx,
      vy,
      size: 4,
      maxSize: isBomb ? 25 : (isGold ? 20 : 28),
      isGolden: isGold,
      isBomb,
      spawnTime: Date.now(),
      lifeTime: calculatedLife,
      maxLifeTime: calculatedLife,
      growing: true
    };

    s.targets.push(newTarget);
  };

  // Main game starter
  const startCyberGame = (selectedMode: ModeType) => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(3);
    setGameOver(false);
    setPlaying(true);
    setAverageReaction(0);
    setIsReloading(false);
    isReloadingRef.current = false;
    setReloadProgress(0);

    const initialWeapon = WEAPONS_PRESETS[activeWeaponIdx];
    setAmmo(initialWeapon.maxAmmo);

    const s = stateRef.current;
    s.playing = true;
    s.gameOver = false;
    s.score = 0;
    s.combo = 0;
    s.maxCombo = 0;
    s.lives = 3;
    s.timeLeft = selectedMode === 'speed_grid' ? 30 : 0;
    s.clicksMade = 0;
    s.hitsMade = 0;
    s.totalReaction = 0;
    s.viewportShake = 0;
    s.targets = [];
    s.particles = [];
    s.scorePops = [];
    s.laserTrails = [];
    s.nextTargetId = 1;

    audioSynth.playLevelUp();

    // Spawn initial target cluster
    const clusterCount = selectedMode === 'speed_grid' ? 4 : 2;
    for (let i = 0; i < clusterCount; i++) {
      spawnTarget();
    }
  };

  // Blitz or Survival countdown core timer
  useEffect(() => {
    if (!playing || gameOver) return;

    const timer = setInterval(() => {
      if (mode === 'speed_grid') {
        setTimeLeft(t => {
          const next = t - 1;
          if (next <= 5 && next > 0) {
            audioSynth.playShot('pistol'); // light caution ticks
          }
          if (next <= 0) {
            clearInterval(timer);
            triggerGameOver();
            return 0;
          }
          return next;
        });
      } else {
        // Survival or Classic count upwards
        setTimeLeft(t => t + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [playing, gameOver, mode]);

  const triggerGameOver = () => {
    setGameOver(true);
    setPlaying(false);
    audioSynth.playGameOver();

    const s = stateRef.current;
    s.playing = false;
    s.gameOver = true;

    // Persist HighScores
    const hsKey = mode;
    const finalScore = s.score;
    const currentHs = highScores[hsKey];

    if (finalScore > currentHs) {
      setHighScores(prev => {
        const next = { ...prev, [hsKey]: finalScore };
        // Save using distinct key names
        if (hsKey === 'classic_arena') localStorage.setItem('hs_aim_classic', finalScore.toString());
        if (hsKey === 'speed_grid') localStorage.setItem('hs_aim_grid', finalScore.toString());
        if (hsKey === 'survival_flick') localStorage.setItem('hs_aim_survival', finalScore.toString());
        return next;
      });
      onGainXp(75);
    } else {
      onGainXp(20);
    }
  };

  // Weapon manual & automatic reloads
  const triggerReload = () => {
    if (isReloading || ammo === currentWeapon.maxAmmo) return;
    setIsReloading(true);
    isReloadingRef.current = true;
    setReloadProgress(0);
    audioSynth.playReload();

    const duration = currentWeapon.reloadTime;
    const steps = 20;
    const intervalTime = duration / steps;
    let currentStep = 0;

    const reloadTimer = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, Math.floor((currentStep / steps) * 100));
      setReloadProgress(progress);

      if (currentStep >= steps) {
        clearInterval(reloadTimer);
        setAmmo(currentWeapon.maxAmmo);
        setIsReloading(false);
        isReloadingRef.current = false;
        setReloadProgress(0);
      }
    }, intervalTime);
  };

  // Collision and Bullet firing interactions
  const handleWeaponShoot = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !playing || gameOver) return;

    if (isReloadingRef.current) {
      audioSynth.playDryClick();
      return;
    }

    const now = Date.now();
    if (now - lastShotTimeRef.current < currentWeapon.fireDelay) {
      return; // fire rate restriction
    }

    lastShotTimeRef.current = now;

    // Check ammo
    if (stateRef.current.ammo <= 0) {
      audioSynth.playDryClick();
      triggerReload();
      return;
    }

    // Fire weapon! Decrease ammo
    setAmmo(a => {
      const next = a - 1;
      if (next <= 0) {
        setTimeout(() => triggerReload(), 100);
      }
      return next;
    });
    stateRef.current.ammo--;

    audioSynth.playShot(currentWeapon.sound);

    // Viewport impact recoil screen kick back
    stateRef.current.viewportShake = currentWeapon.recoil;

    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const pctX = (clickX / rect.width) * 100;
    const pctY = (clickY / rect.height) * 100;

    // Save target tracking reference
    stateRef.current.lastCrosshairPos = { x: pctX, y: pctY };

    // sniper laser ray trail
    if (currentWeapon.id === 'sniper') {
      stateRef.current.laserTrails.push({
        x1: 50,
        y1: 100, // shooting from central bottom
        x2: pctX,
        y2: pctY,
        alpha: 1.0,
        color: '#ff2a5f'
      });
    }

    stateRef.current.clicksMade++;

    let isHit = false;
    let hitIdx = -1;
    const allowedRadiusPct = 6.8;

    // Find first collision
    for (let i = stateRef.current.targets.length - 1; i >= 0; i--) {
      const tgt = stateRef.current.targets[i];
      const dist = Math.sqrt(Math.pow(tgt.x - pctX, 2) + Math.pow(tgt.y - pctY, 2));

      if (dist <= allowedRadiusPct) {
        hitIdx = i;
        isHit = true;
        break;
      }
    }

    if (isHit && hitIdx !== -1) {
      // TARGET CRASHED SUCCESS!
      const target = stateRef.current.targets[hitIdx];
      const speedMs = Date.now() - target.spawnTime;

      stateRef.current.hitsMade++;
      stateRef.current.totalReaction += speedMs;
      setAverageReaction(Math.round(stateRef.current.totalReaction / stateRef.current.hitsMade));

      // Check Target special characteristics
      if (target.isBomb) {
        // Explode: Clear multiple targets in proximity + bonus
        audioSynth.playHit(false, true);
        stateRef.current.viewportShake += 18;

        // Clear targets that are close (within 28% screen range)
        const clearedList: number[] = [hitIdx];
        stateRef.current.targets.forEach((other, otherIdx) => {
          if (otherIdx !== hitIdx) {
            const dist = Math.sqrt(Math.pow(target.x - other.x, 2) + Math.pow(target.y - other.y, 2));
            if (dist < 28) {
              clearedList.push(otherIdx);
            }
          }
        });

        // Earn multi exploded scores
        const count = clearedList.length;
        const totalBonus = count * 90 * currentWeapon.scoreMultiplier;
        setScore(s => s + Math.floor(totalBonus));
        stateRef.current.score += Math.floor(totalBonus);

        // Explosion text bubble
        stateRef.current.scorePops.push({
          id: Math.random(),
          x: target.x,
          y: target.y - 12,
          text: `💥 КИБЕР ДЭЛБЭРЭЛТ +${Math.floor(totalBonus)} (x${count})`,
          color: '#ef4444',
          alpha: 1.0
        });

        // Spawn dense reddish fire particles
        for (let j = 0; j < 35; j++) {
          stateRef.current.particles.push({
            x: target.x + (Math.random() - 0.5) * 6,
            y: target.y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            color: j % 3 === 0 ? '#ef4444' : (j % 3 === 1 ? '#f97316' : '#fde047'),
            size: Math.random() * 5 + 1.5,
            alpha: 1.0
          });
        }

        // Remove targets descending sequence
        clearedList.sort((a, b) => b - a).forEach(remIdx => {
          stateRef.current.targets.splice(remIdx, 1);
        });

        // Spawn back new targets to maintain gameplay
        const spawnRestore = Math.max(1, count);
        for (let k = 0; k < spawnRestore; k++) {
          spawnTarget();
        }

      } else {
        // Normal or Golden single target hit
        audioSynth.playHit(target.isGolden);

        // Combo system
        const nextC = stateRef.current.combo + 1;
        setCombo(nextC);
        stateRef.current.combo = nextC;
        if (nextC > stateRef.current.maxCombo) {
          setMaxCombo(nextC);
          stateRef.current.maxCombo = nextC;
        }

        const baseVal = target.isGolden ? 180 : 80;
        const speedMultiplierVal = Math.max(0.5, (1.8 - (speedMs / 1000))); // faster is more points
        const calculatedVal = Math.floor(baseVal * speedMultiplierVal * currentWeapon.scoreMultiplier * (1 + nextC * 0.05));

        setScore(s => s + calculatedVal);
        stateRef.current.score += calculatedVal;

        // Floating popup animation
        stateRef.current.scorePops.push({
          id: Math.random(),
          x: target.x,
          y: target.y - 8,
          text: `+${calculatedVal} ${target.isGolden ? '⭐ АЛТ' : ''} (${speedMs}мс)`,
          color: target.isGolden ? '#f39c12' : '#2ecc71',
          alpha: 1.0
        });

        // Confetti feedback particles
        const piecesCount = target.isGolden ? 22 : 12;
        const themeColor = target.isGolden ? '#fcd34d' : '#38bdf8';
        for (let pIdx = 0; pIdx < piecesCount; pIdx++) {
          stateRef.current.particles.push({
            x: target.x,
            y: target.y,
            vx: (Math.random() - 0.5) * 4.5,
            vy: (Math.random() - 0.5) * 4.5,
            color: pIdx % 3 === 0 ? themeColor : (pIdx % 3 === 1 ? '#ffffff' : '#ec4899'),
            size: Math.random() * 4 + 1.2,
            alpha: 1.0
          });
        }

        // Remove single hit element
        stateRef.current.targets.splice(hitIdx, 1);
        spawnTarget();
      }

    } else {
      // MISSED CLICK ACTION - Penalty!
      audioSynth.playMiss();
      setCombo(0);
      stateRef.current.combo = 0;

      // Draw splash miss sparks on canvas click spots
      for (let mIdx = 0; mIdx < 6; mIdx++) {
        stateRef.current.particles.push({
          x: pctX,
          y: pctY,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
          color: '#94a3b8',
          size: Math.random() * 2 + 1,
          alpha: 0.8
        });
      }

      // Survival mode life losing penalty
      if (mode === 'survival_flick') {
        setLives(l => {
          const nextL = l - 1;
          if (nextL <= 0) {
            triggerGameOver();
          }
          return nextL;
        });
        stateRef.current.lives--;
      }
    }
  };

  // Keyboard weapon change bindings trigger
  useEffect(() => {
    // Only bind keyboard shooting/selection in this active area
    if (!playing || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = (e.key || '').toLowerCase();
      
      if (k === '1') {
        e.preventDefault();
        setActiveWeaponIdx(0);
        setAmmo(WEAPONS_PRESETS[0].maxAmmo);
        audioSynth.playReload();
      } else if (k === '2') {
        e.preventDefault();
        setActiveWeaponIdx(1);
        setAmmo(WEAPONS_PRESETS[1].maxAmmo);
        audioSynth.playReload();
      } else if (k === '3') {
        e.preventDefault();
        setActiveWeaponIdx(2);
        setAmmo(WEAPONS_PRESETS[2].maxAmmo);
        audioSynth.playReload();
      } else if (k === 'r') {
        e.preventDefault();
        triggerReload();
      } else if ([' ', 'z', 'x', 'я', 'ч'].includes(k)) {
        // space bar shoots target directly at cursor coordinates
        e.preventDefault();
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          // use previous tracking of pointer coordinates if keyboard triggered
          const worldX = rect.left + (stateRef.current.lastCrosshairPos.x / 100) * rect.width;
          const worldY = rect.top + (stateRef.current.lastCrosshairPos.y / 100) * rect.height;
          handleWeaponShoot(worldX, worldY);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playing, gameOver, activeWeaponIdx, ammo, isReloading]);

  // Main Canvas Real-time Animation Loop running at 60fps
  useEffect(() => {
    let animFrameId: number;

    const renderLoop = () => {
      const s = stateRef.current;
      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // ----------------------------------------------------
      // 1. UPDATE TARGETS SIZES AND LIFETIME
      // ----------------------------------------------------
      if (s.playing && !s.gameOver) {
        s.targets.forEach((tgt, tIdx) => {
          // Bouncing in survival flick mode
          if (mode === 'survival_flick') {
            tgt.x += tgt.vx;
            tgt.y += tgt.vy;

            // Bounce back limits
            if (tgt.x <= 12 || tgt.x >= 88) tgt.vx *= -1;
            if (tgt.y <= 12 || tgt.y >= 88) tgt.vy *= -1;
          }

          // Size scaling animations
          if (tgt.growing) {
            tgt.size += 0.8;
            if (tgt.size >= tgt.maxSize) {
              tgt.size = tgt.maxSize;
              tgt.growing = false;
            }
          }

          // Shrink towards expiration
          tgt.lifeTime -= 16.6; // ~1 frame at 60Hz

          // If expired
          if (tgt.lifeTime <= 0) {
            // Target expired penalty
            s.targets.splice(tIdx, 1);
            audioSynth.playMiss();
            setCombo(0);
            s.combo = 0;

            if (mode === 'survival_flick') {
              setLives(l => {
                const nl = l - 1;
                if (nl <= 0) triggerGameOver();
                return nl;
              });
              s.lives--;
            }

            // Spawn replacement
            spawnTarget();
          }
        });
      }

      // Update particle physics
      s.particles.forEach((part, pIdx) => {
        part.x += part.vx;
        part.y += part.vy;
        part.alpha -= 0.035;
        if (part.alpha <= 0) {
          s.particles.splice(pIdx, 1);
        }
      });

      // Update text pops
      s.scorePops.forEach((pop, pIdx) => {
        pop.y -= 0.45; // float upwards
        pop.alpha -= 0.025;
        if (pop.alpha <= 0) {
          s.scorePops.splice(pIdx, 1);
        }
      });

      // Update laser rails
      s.laserTrails.forEach((trail, trIdx) => {
        trail.alpha -= 0.08;
        if (trail.alpha <= 0) {
          s.laserTrails.splice(trIdx, 1);
        }
      });

      // Decay screen shake
      if (s.viewportShake > 0) {
        s.viewportShake *= 0.88;
        if (s.viewportShake < 0.2) s.viewportShake = 0;
      }

      // ----------------------------------------------------
      // 2. CANVAS RENDERING CODES (CYBERPUNK NEON SPECTRAL)
      // ----------------------------------------------------
      ctx.save();

      // Implement Screen shake offset
      if (s.viewportShake > 0) {
        const shakeX = (Math.random() - 0.5) * s.viewportShake;
        const shakeY = (Math.random() - 0.5) * s.viewportShake;
        ctx.translate(shakeX, shakeY);
      }

      // Clean slate with dark cyberpunk space grid
      ctx.fillStyle = '#060410';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber Matrix Grid Lines Background
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.075)';
      ctx.lineWidth = 1.2;
      const gridSize = 45;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Render Laser lines (Sniper specific)
      s.laserTrails.forEach(trail => {
        ctx.strokeStyle = trail.color;
        ctx.lineWidth = 3 * trail.alpha;
        ctx.shadowColor = trail.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo((trail.x1 / 100) * canvas.width, (trail.y1 / 100) * canvas.height);
        ctx.lineTo((trail.x2 / 100) * canvas.width, (trail.y2 / 100) * canvas.height);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      });

      // Render Targets
      s.targets.forEach(tgt => {
        const trgX = (tgt.x / 100) * canvas.width;
        const trgY = (tgt.y / 100) * canvas.height;
        const pctLife = Math.max(0, tgt.lifeTime / tgt.maxLifeTime);

        // Glow layer matching elements
        ctx.save();
        ctx.shadowBlur = 15;
        if (tgt.isBomb) {
          ctx.shadowColor = '#f43f5e';
          ctx.fillStyle = `rgba(244, 63, 94, ${0.2 + (1.0 - pctLife) * 0.4})`;
        } else if (tgt.isGolden) {
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = `rgba(251, 191, 36, ${0.2 + (1.0 - pctLife) * 0.4})`;
        } else {
          ctx.shadowColor = '#6366f1';
          ctx.fillStyle = `rgba(99, 102, 241, ${0.25})`;
        }

        // Draw background rings circle progress
        ctx.beginPath();
        ctx.arc(trgX, trgY, tgt.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw lifetime indicator border ring
        ctx.strokeStyle = tgt.isBomb ? '#ef4444' : (tgt.isGolden ? '#eab308' : '#818cf8');
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(trgX, trgY, tgt.size + 3, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2) * pctLife);
        ctx.stroke();

        // Inner solid core
        ctx.fillStyle = tgt.isBomb ? '#f43f5e' : (tgt.isGolden ? '#fbbf24' : '#6366f1');
        ctx.beginPath();
        ctx.arc(trgX, trgY, tgt.size * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Crosshairs inner lines inside the targets
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(trgX - tgt.size * 0.8, trgY);
        ctx.lineTo(trgX + tgt.size * 0.8, trgY);
        ctx.moveTo(trgX, trgY - tgt.size * 0.8);
        ctx.lineTo(trgX, trgY + tgt.size * 0.8);
        ctx.stroke();

        // Bomb alert icons representation
        if (tgt.isBomb) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💣', trgX, trgY);
        } else if (tgt.isGolden) {
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⭐', trgX, trgY);
        }

        ctx.restore();
      });

      // Render Particles
      s.particles.forEach(part => {
        const pX = (part.x / 100) * canvas.width;
        const pY = (part.y / 100) * canvas.height;
        ctx.save();
        ctx.fillStyle = part.color;
        ctx.globalAlpha = part.alpha;
        ctx.shadowColor = part.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pX, pY, part.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Pop Texts
      s.scorePops.forEach(pop => {
        const pX = (pop.x / 100) * canvas.width;
        const pY = (pop.y / 100) * canvas.height;
        ctx.save();
        ctx.fillStyle = pop.color;
        ctx.globalAlpha = pop.alpha;
        ctx.font = 'bold 13px "JetBrains Mono", sans-serif';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'center';
        ctx.fillText(pop.text, pX, pY);
        ctx.restore();
      });

      // Render cursor crosshair visual assistance in real-time
      if (s.playing && !s.gameOver) {
        const crossX = (s.lastCrosshairPos.x / 100) * canvas.width;
        const crossY = (s.lastCrosshairPos.y / 100) * canvas.height;
        
        ctx.strokeStyle = s.customAimColor;
        ctx.lineWidth = 1.5;
        // visual outer ring
        ctx.beginPath();
        ctx.arc(crossX, crossY, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        // inner green/blue dot
        ctx.fillStyle = s.customAimColor;
        ctx.beginPath();
        ctx.arc(crossX, crossY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animFrameId = requestAnimationFrame(renderLoop);
    };

    animFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animFrameId);
  }, [mode]);

  // Track pointers coords inside Canvas naturally
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    stateRef.current.lastCrosshairPos = {
      x: (px / rect.width) * 100,
      y: (py / rect.height) * 100
    };
  };

  const currentHighScore = highScores[mode];

  return (
    <div id="cyber-aim-panel" className="w-full flex flex-col relative text-slate-200">
      
      {/* HEADER HUD BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#090717]/85 border border-white/5 mb-4">
        
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-xl shadow-lg">
            🎯
          </div>
          <div>
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wide">🎯 CS: Cyber Aim Arena</h4>
            <span className="text-[10px] text-indigo-400 font-bold block">Рефлекс ба хамгийн хурдан амьд үлдэх сорилт</span>
          </div>
        </div>

        {/* STATS CONTROLLER METERS */}
        {playing && !gameOver && (
          <div className="flex items-center gap-4 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-[#03020c] border border-emerald-500/10 text-emerald-400 font-mono text-center">
              <span className="text-[10px] text-slate-500 block">ОНОО</span>
              <span className="font-extrabold text-sm">{score}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#03020c] border border-amber-500/10 text-amber-400 font-mono text-center">
              <span className="text-[10px] text-slate-500 block">КОМБО</span>
              <span className="font-extrabold text-sm">x{combo}</span>
            </div>

            {mode === 'speed_grid' ? (
              <div className="px-3 py-1.5 rounded-xl bg-[#03020c] border border-pink-500/10 text-pink-400 font-mono text-center">
                <span className="text-[10px] text-slate-500 block">ЦАГ</span>
                <span className="font-extrabold text-sm">{timeLeft}с</span>
              </div>
            ) : mode === 'survival_flick' ? (
              <div className="px-3 py-1.5 rounded-xl bg-[#03020c] border border-rose-500/10 text-rose-450 font-mono text-center">
                <span className="text-[10px] text-slate-500 block">АМЬ</span>
                <span className="font-extrabold text-sm">❤️ {lives}</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-[#03020c] border border-indigo-500/10 text-indigo-400 font-mono text-center">
                <span className="text-[10px] text-slate-500 block">ХУГАЦАА</span>
                <span className="font-extrabold text-sm">{timeLeft}с</span>
              </div>
            )}

            <div className="px-3 py-1.5 rounded-xl bg-[#03020c] border border-cyan-500/10 text-cyan-400 font-mono text-center">
              <span className="text-[10px] text-slate-500 block">РЕФЛЕКС (AVG)</span>
              <span className="font-extrabold text-sm">{averageReaction || '---'}мс</span>
            </div>
          </div>
        )}

        {/* GENERAL ACTIONS */}
        <div className="flex items-center gap-2">
          {/* MUTE SENSITIVE OPTIONS */}
          <button 
            onClick={() => setMute(!mute)}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            title={mute ? "Дуу нээх" : "Дуу хаах"}
          >
            {mute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {playing && (
            <button 
              onClick={() => {
                setPlaying(false);
                setGameOver(false);
                stateRef.current.playing = false;
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-extrabold uppercase hover:bg-rose-500/25 transition-all cursor-pointer"
            >
              Буцах
            </button>
          )}
        </div>
      </div>

      {/* THREE INTERACTIVE PLAYING CONFIGURATION CARDS */}
      {!playing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          
          {/* CLASSIC TARGET PRACTICE */}
          <div className="p-4 rounded-2.5xl bg-[#090717]/60 border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl font-bold text-indigo-400 mb-3">
                🎯
              </div>
              <h5 className="font-extrabold text-white text-xs uppercase">Classic Practice</h5>
              <p className="text-[10.5px] text-slate-400 pt-1 leading-relaxed">
                Тайван бэлтгэл хийх талбай. Ямар нэгэн хугацааний дарамт, амь алдах шийтгэл байхгүй тул аим дасгалжуулахад нэн тохиромжтой.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
              <span className="text-[10px] font-mono text-indigo-400">Дээд оноо: {highScores.classic_arena}</span>
              <button 
                onClick={() => {
                  setMode('classic_arena');
                  startCyberGame('classic_arena');
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-500 text-white font-extrabold text-[10px] hover:bg-indigo-600 transition-all cursor-pointer flex items-center gap-1 uppercase"
              >
                Тоглох <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* GRID SHOT SPEED BLITZ */}
          <div className="p-4 rounded-2.5xl bg-[#090717]/60 border border-white/5 hover:border-pink-500/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-xl font-bold text-pink-400 mb-3">
                ⚡
              </div>
              <h5 className="font-extrabold text-white text-xs uppercase">Speed Grid Shot</h5>
              <p className="text-[10.5px] text-slate-400 pt-1 leading-relaxed">
                Яг 30 секундын хурц урсгалт сорилт! Оновчтой онолт бүр секунд нэмж, алдалт бүр секундыг хасах ширүүн рефлексийг шалгана.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
              <span className="text-[10px] font-mono text-pink-400">Дээд оноо: {highScores.speed_grid}</span>
              <button 
                onClick={() => {
                  setMode('speed_grid');
                  startCyberGame('speed_grid');
                }}
                className="px-3 py-1.5 rounded-xl bg-pink-500 text-white font-extrabold text-[10px] hover:bg-pink-600 transition-all cursor-pointer flex items-center gap-1 uppercase"
              >
                Тоглох <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* SURVIVAL TRACKING BOX */}
          <div className="p-4 rounded-2.5xl bg-[#090717]/60 border border-white/5 hover:border-yellow-500/30 transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center text-xl font-bold text-yellow-400 mb-3">
                💀
              </div>
              <h5 className="font-extrabold text-white text-xs uppercase">Survival Flick</h5>
              <p className="text-[10.5px] text-slate-400 pt-1 leading-relaxed">
                Хиберпанкийн хөдөлгөөнт байнууд дундаас амьд гарах сорилт! Байнууд талбар дунд хурдтай ойж хөдлөх бөгөөд 3 товч алдвал шууд дуусна.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
              <span className="text-[10px] font-mono text-yellow-400">Дээд оноо: {highScores.survival_flick}</span>
              <button 
                onClick={() => {
                  setMode('survival_flick');
                  startCyberGame('survival_flick');
                }}
                className="px-3 py-1.5 rounded-xl bg-yellow-500 text-white font-extrabold text-[10px] hover:bg-yellow-600 transition-all cursor-pointer flex items-center gap-1 uppercase relative"
              >
                Тоглох <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* CORE CANVAS GAMEPLAY FIELD */}
      <div 
        ref={containerRef}
        className="w-full relative rounded-3xl bg-[#03010a] border border-white/5 overflow-hidden flex flex-col items-center justify-center"
        style={{ minHeight: '380px' }}
      >
        
        {playing && !gameOver ? (
          <div className="w-full relative h-[400px]">
            {/* Realtime Canvas Rendering stage */}
            <canvas 
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full h-full block cursor-crosshair"
              onPointerDown={(e) => handleWeaponShoot(e.clientX, e.clientY)}
              onPointerMove={handlePointerMove}
            />

            {/* WEAPONS MAGAZINE AMMO FLOATING METERS */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none select-none">
              
              {/* Ammo system feedback */}
              <div className="p-3.5 rounded-2xl bg-[#05030e]/90 border border-white/10 backdrop-blur-md flex items-center gap-4">
                <div className="text-left">
                  <span className="text-[11px] text-pink-400 font-extrabold uppercase block">{currentWeapon.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{currentWeapon.subtitle}</span>
                </div>

                <div className="h-9 w-[1px] bg-white/10"></div>

                <div className="flex items-center gap-2">
                  <div className="text-right font-mono">
                    <span className="font-extrabold text-lg text-white">{ammo}</span>
                    <span className="text-slate-500 font-bold text-xs">/{currentWeapon.maxAmmo}</span>
                  </div>
                  
                  {isReloading ? (
                    <div className="w-12 h-2.5 rounded-full bg-slate-800 border border-white/5 overflow-hidden relative">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-300" 
                        style={{ width: `${reloadProgress}%` }}
                      ></div>
                    </div>
                  ) : (
                    <span className="text-xl">{currentWeapon.icon}</span>
                  )}
                </div>
              </div>

              {/* Aiming Custom Color controller */}
              <div className="flex gap-2 p-2 rounded-2xl bg-[#05030e]/95 border border-white/5 backdrop-blur-md pointer-events-auto">
                <span className="text-[9px] text-slate-500 font-bold uppercase self-center px-1">Залуурын Өнгө</span>
                {(['#38bdf8', '#22c55e', '#ec4899', '#eab308'] as const).map((clr) => (
                  <button
                    key={clr}
                    onClick={() => {
                      setCustomAimColor(clr);
                      audioSynth.playShot('pistol');
                    }}
                    className={`w-5.5 h-5.5 rounded-lg border-2 cursor-pointer transition-all ${
                      customAimColor === clr ? 'border-white scale-110' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: clr }}
                  />
                ))}
              </div>

            </div>

            {/* RELOAD WARNING MECHANICS */}
            {ammo <= 0 && !isReloading && (
              <div className="absolute inset-x-0 top-12 flex justify-center pointer-events-none select-none animate-pulse">
                <div className="px-4 py-2 rounded-2xl bg-rose-500/80 border border-rose-400 shadow-xl text-white font-extrabold text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> [R] ДАРЖ СУМАА ЦЭНЭГЛЭДЭГ ШҮҮ!
                </div>
              </div>
            )}

            {/* RELOADING TEXT SPLASH OVERLAY */}
            {isReloading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col justify-center items-center pointer-events-none select-none">
                <div className="px-5 py-4 rounded-3xl bg-[#0a071d] border border-indigo-500/20 shadow-2xl flex flex-col items-center gap-2">
                  <span className="text-xl animate-spin">🔫</span>
                  <span className="text-white font-extrabold text-xs uppercase tracking-widest">ЦЭНЭГЛЭЖ БАЙНА ({reloadProgress}%)</span>
                  <div className="w-40 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
                    <div className="h-full bg-indigo-500" style={{ width: `${reloadProgress}%` }}></div>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : gameOver ? (
          
          /* GAME OVER RESULTS OVERLAY CONTAINER SCREEN */
          <div className="text-center p-8 space-y-5 max-w-md w-full relative z-10">
            <div className="w-14 h-14 rounded-full bg-pink-500/10 border border-pink-400/20 flex items-center justify-center text-3xl mx-auto shadow-inner animate-pulse">
              🏆
            </div>
            
            <div className="space-y-1">
              <h4 className="text-white font-black text-lg uppercase tracking-wide">СОРИЛТ ДУУСЛАА</h4>
              <p className="text-xs text-slate-400">Таны кибер хариу үйлдэл маш гайхалтай байлаа!</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2.5xl bg-indigo-950/10 border border-white/5 font-mono">
              <div className="text-center">
                <span className="text-[10px] text-slate-500 block">ЭЦСИЙН ОНОО</span>
                <span className="text-lg font-black text-indigo-400">{score}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-500 block">ДУНДАЖ РЕФЛЕКС</span>
                <span className="text-lg font-black text-cyan-400">{averageReaction ? `${averageReaction}мс` : '---'}</span>
              </div>
              <div className="text-center col-span-2 pt-2 border-t border-white/5">
                <span className="text-[10px] text-slate-500 block">ДЭЭД ОНОО (HS)</span>
                <span className="text-xs font-bold text-white">{currentHighScore}</span>
              </div>
            </div>

            <button
              onClick={() => startCyberGame(mode)}
              className="w-full py-3.5 rounded-2xl bg-indigo-500 text-white font-extrabold text-xs uppercase hover:bg-indigo-650 transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> ДАХИН ТОГЛОХ
            </button>
          </div>

        ) : (
          
          /* INITIAL LAUNCH BANNER & USER GUIDE SCREEN */
          <div className="text-center p-8 space-y-6 max-w-lg w-full relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-4xl mx-auto shadow-xl">
              🎯
            </div>

            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-white font-black text-sm uppercase tracking-wider">🎯 CS: Cyber Aim Arena - Руу Шижирнэ</h4>
              <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans">
                Аим онолтыг төгс сайжруулах нарийн дадлага бэлтгэл. Дээд цэснээс сорилтын загварыг сонгон тоглоно.
              </p>
            </div>

            {/* IN-GAME KEYS HUD GUIDE CHIPS */}
            <div className="p-4 rounded-2.5xl bg-[#090717]/65 border border-white/5 space-y-3.5">
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block">🕹️ КОМПЬЮТЕР УДИРДАМЖ:</span>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-xs bg-slate-800 border border-white/10 px-1.5 py-0.5 rounded-md font-mono text-white">LeftClick</span>
                  <span className="text-[10.5px] text-slate-300">Байг устгаж буудна</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-xs bg-slate-800 border border-white/10 px-1.5 py-0.5 rounded-md font-mono text-white">R</span>
                  <span className="text-[10.5px] text-slate-300">Сумаа цэнэглэнэ</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-xs bg-slate-800 border border-white/10 px-1.5 py-0.5 rounded-md font-mono text-white">1, 2, 3</span>
                  <span className="text-[10.5px] text-slate-300">Зэвсэг солих</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-xs bg-slate-800 border border-white/10 px-1.5 py-0.5 rounded-md font-mono text-white">Space / Z</span>
                  <span className="text-[10.5px] text-slate-300">Авто онолт буудах</span>
                </div>
              </div>
            </div>

            {/* CHOOSE WEAPON FROM PANEL BEFORE LAUNCH */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Тоглолт эхлүүлэх зэвсэг сонгоно уу:</span>
              <div className="grid grid-cols-3 gap-2">
                {WEAPONS_PRESETS.map((weap, idx) => (
                  <button
                    key={weap.id}
                    onClick={() => {
                      setActiveWeaponIdx(idx);
                      audioSynth.playReload();
                    }}
                    className={`p-2.5 rounded-xl border transition-all text-center cursor-pointer flex flex-col justify-center items-center ${
                      activeWeaponIdx === idx 
                        ? 'border-indigo-400 bg-indigo-950/20 text-white' 
                        : 'border-white/5 bg-black/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{weap.icon}</span>
                    <span className="font-extrabold text-[10px] block pt-1">{weap.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => startCyberGame('classic_arena')}
                className="px-6 py-3 rounded-2xl bg-indigo-500 text-white font-extrabold text-xs uppercase hover:bg-indigo-600 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Тоглож эхлэх
              </button>
            </div>
          </div>

        )}

      </div>

    </div>
  );
}
