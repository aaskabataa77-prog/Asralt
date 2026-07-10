import React, { useEffect, useRef, useState } from 'react';
import { 
  Shield, Heart, Zap, Crosshair, RefreshCw, ShoppingCart, 
  Play, RotateCcw, Volume2, VolumeX, Award, Gamepad2, Skull
} from 'lucide-react';

// Web Audio API Synthesizer to generate real retro sounds for gunfire, zombie screams, and power-ups without external files.
class SoundSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  constructor() {
    // Lazy initialized
  }

  private initCtx() {
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch (e) {
        console.warn("AudioContext setup failed or is restricted: ", e);
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume();
      } catch (e) {
        console.warn("AudioContext resume failed: ", e);
      }
    }
  }

  playLaser() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playHeavyLaser() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playAwp() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.55);

    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.55);
  }

  playZombieHurt() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playPlayerHurt() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playBuy() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc1.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, this.ctx.currentTime); // G5
    osc2.frequency.setValueAtTime(1046.50, this.ctx.currentTime + 0.08); // C6

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.2);
    osc2.stop(this.ctx.currentTime + 0.2);
  }

  playUpgrade() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
}

const soundManager = new SoundSynth();

type Weapon = {
  id: string;
  name: string;
  damage: number;
  fireRate: number; // Ms delay between shots
  clipSize: number;
  reloadTime: number; // Ms to reload
  cost: number;
  unlocked: boolean;
  color: string;
  laserColor: string;
  soundType: 'pistol' | 'rifle' | 'awp';
  isMelee?: boolean;
};

const INITIAL_WEAPONS: Weapon[] = [
  // MELEE WEAPONS (Шууд тулааны зэвсэг)
  { id: 'knife', name: 'Karambit Knife 🔪', damage: 130, fireRate: 200, clipSize: 1, reloadTime: 0, cost: 0, unlocked: true, color: '#f43f5e', laserColor: '#f43f5e', soundType: 'pistol', isMelee: true },
  { id: 'katana', name: 'Katana Sword ⚔️', damage: 240, fireRate: 350, clipSize: 1, reloadTime: 0, cost: 1600, unlocked: false, color: '#a855f7', laserColor: '#a855f7', soundType: 'rifle', isMelee: true },

  // HAND GUNS (Гар буу)
  { id: 'usp', name: 'USP-S Pistol 🔫', damage: 32, fireRate: 320, clipSize: 12, reloadTime: 1250, cost: 300, unlocked: true, color: '#94a3b8', laserColor: '#fbbf24', soundType: 'pistol' },
  { id: 'deagle', name: 'Desert Eagle 🦅', damage: 110, fireRate: 480, clipSize: 7, reloadTime: 1400, cost: 700, unlocked: false, color: '#eab308', laserColor: '#facc15', soundType: 'awp' },

  // AUTOMATIC RIFLES (Автомат буу)
  { id: 'm4a1', name: 'M4A4 Carbine 🔱', damage: 55, fireRate: 140, clipSize: 30, reloadTime: 1800, cost: 2100, unlocked: false, color: '#10b981', laserColor: '#10b981', soundType: 'rifle' },
  { id: 'ak47', name: 'AK-47 Beast 🐆', damage: 90, fireRate: 170, clipSize: 30, reloadTime: 2000, cost: 2900, unlocked: false, color: '#f97316', laserColor: '#f97316', soundType: 'rifle' },
  
  // HEAVY LMG MACHINE GUNS (Хүнд пулемёт)
  { id: 'm249', name: 'M249 Heavy LMG 🌋', damage: 70, fireRate: 85, clipSize: 100, reloadTime: 3800, cost: 4200, unlocked: false, color: '#ec4899', laserColor: '#f43f5e', soundType: 'rifle' },

  // SNIPER (Мэргэн буудагч)
  { id: 'awp', name: 'AWP Dragon Lore 🐉', damage: 360, fireRate: 1400, clipSize: 5, reloadTime: 2400, cost: 5500, unlocked: false, color: '#af40ff', laserColor: '#af40ff', soundType: 'awp' },

  // FUTURISTIC HEAVY WEAPONS (Хэт хүчирхэг ирээдүйн зэвсгүүд)
  { id: 'raygun', name: 'Cosmic Ray Gun 🌀', damage: 180, fireRate: 180, clipSize: 20, reloadTime: 1500, cost: 6800, unlocked: false, color: '#06b6d4', laserColor: '#22d3ee', soundType: 'pistol' },
  { id: 'minigun', name: 'Vulcan Minigun 🔥', damage: 75, fireRate: 45, clipSize: 200, reloadTime: 4500, cost: 8500, unlocked: false, color: '#ef4444', laserColor: '#fca5a5', soundType: 'rifle' },
  { id: 'plasma', name: 'Tesla Plasma Rifle ⚡', damage: 500, fireRate: 1000, clipSize: 10, reloadTime: 2500, cost: 9800, unlocked: false, color: '#3b82f6', laserColor: '#60a5fa', soundType: 'awp' },
  { id: 'bfg', name: 'BFG 9000 Overlord ☄️', damage: 1200, fireRate: 2000, clipSize: 3, reloadTime: 5000, cost: 15000, unlocked: false, color: '#22c55e', laserColor: '#4ade80', soundType: 'awp' },
];

interface ZombieGameProps {
  onGainXp?: (amount: number) => void;
}

export default function ZombieGame({ onGainXp }: ZombieGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [money, setMoney] = useState(800); // CS starting cash
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [bestScore, setBestScore] = useState(() => {
    return Number(localStorage.getItem('cs_zombie_best') || 0);
  });

  // Weapon systems
  const [weapons, setWeapons] = useState<Weapon[]>(INITIAL_WEAPONS);
  const [activeWeaponIdx, setActiveWeaponIdx] = useState(0);
  const [currentClip, setCurrentClip] = useState(INITIAL_WEAPONS[0].clipSize);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadProgress, setReloadProgress] = useState(0);
  const [unlimitedAmmo, setUnlimitedAmmo] = useState(false);

  // Shop System
  const [shopOpen, setShopOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Auto detect touch capabilities & screen size on initial load
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmall = window.innerWidth <= 1024;
    setIsMobileDevice(isTouch || isSmall);
    if (isTouch || isSmall) {
      setShowMobileControls(true);
    }
  }, []);
  
  // Controls reference for loop
  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef({ x: 0, y: 0 });
  const playerRef = useRef({ x: 400, y: 300, radius: 18, angle: 0, speed: 4.5 });
  
  // Game Entities inside refs to avoid re-renders causing lag
  const bulletsRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; damage: number; color: string; size: number }>>([]);
  const zombiesRef = useRef<Array<{ x: number; y: number; hp: number; maxHp: number; speed: number; radius: number; color: string; scoreVal: number; moneyVal: number; isBoss: boolean }>>([]);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number; decay: number }>>([]);
  const damageTextsRef = useRef<Array<{ x: number; y: number; text: string; alpha: number; color: string }>>([]);

  const lastShotTimeRef = useRef<number>(0);

  useEffect(() => {
    soundManager.muted = isMuted;
  }, [isMuted]);

  // Load and save high scores
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('cs_zombie_best', score.toString());
    }
  }, [score, bestScore]);

  // Add blood splash particle effect on hit
  const spawnParticles = (x: number, y: number, color: string, count: number = 8) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 4 + 2,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  };

  // Flying DMG Indicators on game board
  const spawnDamageText = (x: number, y: number, text: string, color: string = '#ef4444') => {
    damageTextsRef.current.push({
      x,
      y: y - 10,
      text,
      alpha: 1,
      color
    });
  };

  // Keyboard controls listener setup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = (e.key || '').toLowerCase();
      if (k) {
        keysRef.current[k] = true;
      }
      
      // Counter Strike weapon shortcuts 1 to 12 (including numeric 9, 0, -, =)
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='].includes(e.key || '')) {
        let weaponIdx = -1;
        if (e.key === '0') weaponIdx = 9;
        else if (e.key === '-') weaponIdx = 10;
        else if (e.key === '=') weaponIdx = 11;
        else weaponIdx = parseInt(e.key || '') - 1;

        if (weapons[weaponIdx] && weapons[weaponIdx].unlocked) {
          setActiveWeaponIdx(weaponIdx);
          setCurrentClip(weapons[weaponIdx].clipSize);
          setIsReloading(false);
          soundManager.playBuy();
        }
      }

      // R for Quick Reload
      if (k === 'r') {
        const activeWeapon = weapons[activeWeaponIdx];
        if (currentClip < activeWeapon.clipSize && !isReloading) {
          triggerReload();
        }
      }

      // B to open Counter Strike Buy Menu Shopping cart
      if (k === 'b') {
        setShopOpen(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = (e.key || '').toLowerCase();
      if (k) {
        keysRef.current[k] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [weapons, activeWeaponIdx, currentClip, isReloading]);

  // Main Loop logic running at approximately 60fps on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      if (!isPlaying || isGameOver || shopOpen) {
        // Just keep drawing scenery and game UI if paused/shop open
        drawGame(ctx, canvas);
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      updateGame(canvas);
      drawGame(ctx, canvas);

      animationId = requestAnimationFrame(gameLoop);
    };

    if (isPlaying && !isGameOver) {
      animationId = requestAnimationFrame(gameLoop);
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, isGameOver, shopOpen, activeWeaponIdx, weapons]);

  // Handle active firing mechanism logic based on click triggers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isGameOver || shopOpen) return;
    triggerFire();
  };

  // Bullet production trigger
  const triggerFire = () => {
    const activeWeapon = weapons[activeWeaponIdx];
    const now = Date.now();

    if (isReloading && !activeWeapon.isMelee) return;

    if (!activeWeapon.isMelee && currentClip <= 0) {
      triggerReload();
      return;
    }

    if (now - lastShotTimeRef.current < activeWeapon.fireRate) {
      return;
    }

    lastShotTimeRef.current = now;
    
    // Play sound synthetically
    if (activeWeapon.isMelee) {
      soundManager.playHeavyLaser(); // swing sound
    } else {
      if (activeWeapon.soundType === 'pistol') soundManager.playLaser();
      else if (activeWeapon.soundType === 'rifle') soundManager.playHeavyLaser();
      else if (activeWeapon.soundType === 'awp') soundManager.playAwp();
    }

    // Subtract bullet count if not unlimited
    if (!unlimitedAmmo && !activeWeapon.isMelee) {
      setCurrentClip(prev => prev - 1);
    }

    const player = playerRef.current;

    if (activeWeapon.isMelee) {
      // Swing melee - short-range fast slash reach (75px) with wide splash area (35px)
      const swingSpeed = 12;
      bulletsRef.current.push({
        x: player.x + Math.cos(player.angle) * player.radius,
        y: player.y + Math.sin(player.angle) * player.radius,
        vx: Math.cos(player.angle) * swingSpeed,
        vy: Math.sin(player.angle) * swingSpeed,
        damage: activeWeapon.damage,
        color: activeWeapon.laserColor,
        size: 35, // Wide slash arc collision range
        rangeRemaining: 75, // Travels custom distance before fading
        isMelee: true
      } as any);

      // Slash particles
      spawnParticles(
        player.x + Math.cos(player.angle) * (player.radius + 15),
        player.y + Math.sin(player.angle) * (player.radius + 15),
        activeWeapon.laserColor,
        6
      );
    } else {
      // Shoot single vector project bullets
      const bulletSpeed = 15;
      bulletsRef.current.push({
        x: player.x + Math.cos(player.angle) * player.radius,
        y: player.y + Math.sin(player.angle) * player.radius,
        vx: Math.cos(player.angle) * bulletSpeed,
        vy: Math.sin(player.angle) * bulletSpeed,
        damage: activeWeapon.damage,
        color: activeWeapon.laserColor,
        size: activeWeapon.id === 'bfg' ? 14 : activeWeapon.id === 'plasma' ? 9 : activeWeapon.id === 'raygun' ? 7 : activeWeapon.soundType === 'awp' ? 6 : 4
      } as any);

      // Muzzle flash particles
      spawnParticles(
        player.x + Math.cos(player.angle) * (player.radius + 10),
        player.y + Math.sin(player.angle) * (player.radius + 10),
        activeWeapon.laserColor, 
        4
      );
    }
  };

  // Active Reloading setup
  const triggerReload = () => {
    const activeWeapon = weapons[activeWeaponIdx];
    setIsReloading(true);
    setReloadProgress(0);

    let reloadElapsed = 0;
    const reloadTimer = setInterval(() => {
      if (!isPlaying || isGameOver || shopOpen) return;

      reloadElapsed += 100;
      const progress = Math.min(100, (reloadElapsed / activeWeapon.reloadTime) * 100);
      setReloadProgress(progress);

      if (reloadElapsed >= activeWeapon.reloadTime) {
        clearInterval(reloadTimer);
        setCurrentClip(activeWeapon.clipSize);
        setIsReloading(false);
      }
    }, 100);
  };

  // Setup wave spawning strategy
  const startNextWave = () => {
    setWave(prev => {
      const nextWave = prev + 1;
      spawnWaveZombies(nextWave);
      return nextWave;
    });
  };

  // Spawns multiple customizable zombie entities on wave triggers
  const spawnWaveZombies = (currentWave: number) => {
    soundManager.playUpgrade();
    const count = 5 + currentWave * 4;
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 800;
    const h = canvas ? canvas.height : 600;

    for (let i = 0; i < count; i++) {
      // Spawn at outer border of game screen randomly
      let x, y;
      if (Math.random() > 0.5) {
        x = Math.random() > 0.5 ? -30 : w + 30;
        y = Math.random() * h;
      } else {
        x = Math.random() * w;
        y = Math.random() > 0.5 ? -30 : h + 30;
      }

      // Zombie stats scale layout based on current wave level
      const isBoss = i === 0 && currentWave % 3 === 0; // Boss Zombs every 3 levels!
      const maxHp = isBoss ? 150 + currentWave * 50 : 35 + currentWave * 12;
      const speed = isBoss ? 1.5 : 1.2 + Math.random() * 1.5;
      const radius = isBoss ? 30 : 14 + Math.random() * 5;
      const color = isBoss ? '#c084fc' : `hsl(${100 + Math.random() * 30}, 80%, ${30 + Math.random() * 15}%)`;

      zombiesRef.current.push({
        x,
        y,
        hp: maxHp,
        maxHp,
        speed,
        radius,
        color,
        scoreVal: isBoss ? 200 : 25,
        moneyVal: isBoss ? 600 : 150,
        isBoss
      });
    }

    spawnDamageText(w / 2, h / 2 - 50, `WAVE ${currentWave} - DAЙРАЛТ ЭХЭЛЛЭЭ!`, '#fbbf24');
  };

  // State Updates inside ticking loops
  const updateGame = (canvas: HTMLCanvasElement) => {
    const player = playerRef.current;

    // 1. Calculate player vector rotation based on mouse layout coordinates
    const dx = mouseRef.current.x - player.x;
    const dy = mouseRef.current.y - player.y;
    player.angle = Math.atan2(dy, dx);

    // 2. Playable Hero Movement WASD and arrows
    let mx = 0;
    let my = 0;
    if (keysRef.current['w'] || keysRef.current['arrowup']) my -= 1;
    if (keysRef.current['s'] || keysRef.current['arrowdown']) my += 1;
    if (keysRef.current['a'] || keysRef.current['arrowleft']) mx -= 1;
    if (keysRef.current['d'] || keysRef.current['arrowright']) mx += 1;

    // Normalizing vectors on diagonal movements to ensure uniform velocity layout
    if (mx !== 0 && my !== 0) {
      mx *= 0.7071;
      my *= 0.7071;
    }

    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x + mx * player.speed));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y + my * player.speed));

    // 3. Update bullets
    const bullets = bulletsRef.current;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i] as any;
      b.x += b.vx;
      b.y += b.vy;

      // Handle melee attack range countdown
      if (b.rangeRemaining !== undefined) {
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        b.rangeRemaining -= speed;
        if (b.rangeRemaining <= 0) {
          bullets.splice(i, 1);
          continue;
        }
      }

      // Remove out of bounds bullets
      if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
        bullets.splice(i, 1);
      }
    }

    // 4. Update zombies
    const zombies = zombiesRef.current;
    
    // Automatically trigger next wave if all zombies are eliminated
    if (zombies.length === 0 && !isGameOver && isPlaying) {
      startNextWave();
    }

    for (let i = zombies.length - 1; i >= 0; i--) {
      const zm = zombies[i];

      // Track player vector speed
      const zDx = player.x - zm.x;
      const zDy = player.y - zm.y;
      const dist = Math.sqrt(zDx * zDx + zDy * zDy);

      if (dist > 5) {
        zm.x += (zDx / dist) * zm.speed;
        zm.y += (zDy / dist) * zm.speed;
      }

      // Check collision with playable Player
      const collisionDist = player.radius + zm.radius;
      if (dist < collisionDist) {
        // Player hurt!
        soundManager.playPlayerHurt();
        setHealth(prev => {
          const nextHealth = Math.max(0, prev - (zm.isBoss ? 1 : 0.4)); // tick damage
          if (nextHealth <= 0) {
            setIsGameOver(true);
            setIsPlaying(false);
          }
          return nextHealth;
        });

        // Bounce player slightly away
        zm.x -= (zDx / dist) * 10;
        zm.y -= (zDy / dist) * 10;
        spawnParticles(player.x, player.y, '#ef4444', 3);
      }

      // Check bullet collisions with zombie
      for (let j = bullets.length - 1; j >= 0; j--) {
        const b = bullets[j];
        const bDx = b.x - zm.x;
        const bDy = b.y - zm.y;
        const bulletDist = Math.sqrt(bDx * bDx + bDy * bDy);

        if (bulletDist < zm.radius + b.size) {
          // Hit! Damage Zombie
          zm.hp -= b.damage;
          soundManager.playZombieHurt();
          spawnParticles(zm.x, zm.y, '#22c55e', 4); // Green zombie blood
          spawnDamageText(zm.x, zm.y - 12, `-${b.damage}`);

          // Remove bullet
          bullets.splice(j, 1);

          // Check if zombie died
          if (zm.hp <= 0) {
            spawnParticles(zm.x, zm.y, '#84cc16', 12);
            spawnDamageText(zm.x, zm.y - 30, `+$${zm.moneyVal}`, '#eab308');
            setScore(s => s + zm.scoreVal);
            setMoney(m => m + zm.moneyVal);
            if (onGainXp) onGainXp(12); // gain XP for kills!
            zombies.splice(i, 1);
            break;
          }
        }
      }
    }

    // 5. Update dust particles
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    // 6. Update text popups
    const texts = damageTextsRef.current;
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      t.y -= 1;
      t.alpha -= 0.02;

      if (t.alpha <= 0) {
        texts.splice(i, 1);
      }
    }
  };

  // Draw scenery to canvas element frame
  const drawGame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Clear canvas
    ctx.fillStyle = '#090d16'; // deep dark apocalyptic layout bg
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid map lines for battlefield aesthetic
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 40;
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

    // Draw safe zone indicator boundary lines on battlefield (CS2 site vibe)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // 1. Render all bullet projectiles / melee slashes
    bulletsRef.current.forEach(b => {
      const anyB = b as any;
      if (anyB.isMelee) {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 12;
        ctx.shadowColor = b.color;
        
        ctx.beginPath();
        const angle = Math.atan2(b.vy, b.vx);
        // Draw a beautiful circular sweep arc
        ctx.arc(b.x - b.vx * 0.4, b.y - b.vy * 0.4, 25, angle - 0.75, angle + 0.75);
        ctx.stroke();
        
        ctx.shadowBlur = 0; // reset
      } else {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();

        // glowing trail lines
        ctx.shadowBlur = 10;
        ctx.shadowColor = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    });

    // 2. Render all zombie entities
    zombiesRef.current.forEach(zm => {
      // Body shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.arc(zm.x, zm.y + 4, zm.radius, 0, Math.PI * 2);
      ctx.fill();

      // Corpse base body
      ctx.fillStyle = zm.color;
      ctx.beginPath();
      ctx.arc(zm.x, zm.y, zm.radius, 0, Math.PI * 2);
      ctx.fill();

      // Glowing dangerous red eyes on monsters
      ctx.fillStyle = zm.isBoss ? '#f43f5e' : '#ef4444';
      const eyeOffset = zm.radius * 0.35;
      const eyeSize = zm.isBoss ? 4.5 : 2.5;

      ctx.beginPath();
      ctx.arc(zm.x + eyeOffset, zm.y - eyeOffset, eyeSize, 0, Math.PI * 2);
      ctx.arc(zm.x + eyeOffset, zm.y + eyeOffset, eyeSize, 0, Math.PI * 2);
      ctx.fill();

      // Inner skull design on Boss zombie models
      if (zm.isBoss) {
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(zm.x - 6, zm.y - 6, 12, 12);
      }

      // Small health indicator bar on top of monsters
      const barW = zm.radius * 1.8;
      const barH = 4;
      const barX = zm.x - barW / 2;
      const barY = zm.y - zm.radius - 8;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barX, barY, barW, barH);

      const hpPercent = Math.max(0, zm.hp / zm.maxHp);
      ctx.fillStyle = zm.isBoss ? '#a855f7' : '#ef4444';
      ctx.fillRect(barX, barY, barW * hpPercent, barH);
    });

    // 3. Draw Hero player avatar package
    const p = playerRef.current;
    
    // Player soft shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(p.x, p.y + 4, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Body armor skin (Counter Terrorist Blue vibe)
    const ctGradient = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.radius);
    ctGradient.addColorStop(0, '#60a5fa');
    ctGradient.addColorStop(1, '#1d4ed8');

    ctx.fillStyle = ctGradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Helmet mask outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Hands projecting out towards barrel rotation vector
    ctx.fillStyle = '#3b82f6';
    const handX1 = p.x + Math.cos(p.angle + 0.5) * p.radius;
    const handY1 = p.y + Math.sin(p.angle + 0.5) * p.radius;
    const handX2 = p.x + Math.cos(p.angle - 0.5) * p.radius;
    const handY2 = p.y + Math.sin(p.angle - 0.5) * p.radius;

    ctx.beginPath();
    ctx.arc(handX1, handY1, 6, 0, Math.PI * 2);
    ctx.arc(handX2, handY2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Weapon Barrel Line being held in active hands direction
    const activeWeapon = weapons[activeWeaponIdx];
    ctx.strokeStyle = activeWeapon.laserColor;
    ctx.lineWidth = activeWeapon.id === 'awp' ? 5 : 3.5;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(p.angle) * (p.radius + 15), p.y + Math.sin(p.angle) * (p.radius + 15));
    ctx.stroke();

    // Custom tactical flash emitter center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x + Math.cos(p.angle) * (p.radius + 15), p.y + Math.sin(p.angle) * (p.radius + 15), 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Laser Sight indicator dot line if using sniper or futuristic model
    if (activeWeapon.id === 'awp' || activeWeapon.id === 'plasma' || activeWeapon.id === 'raygun' || activeWeapon.id === 'bfg') {
      ctx.strokeStyle = activeWeapon.id === 'awp' 
        ? 'rgba(239, 68, 68, 0.4)' 
        : activeWeapon.id === 'plasma'
          ? 'rgba(59, 130, 246, 0.4)'
          : activeWeapon.id === 'raygun'
            ? 'rgba(6, 182, 212, 0.4)'
            : 'rgba(34, 197, 94, 0.4)';
      ctx.lineWidth = activeWeapon.id === 'bfg' ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(p.x + Math.cos(p.angle) * (p.radius + 15), p.y + Math.sin(p.angle) * (p.radius + 15));
      ctx.lineTo(p.x + Math.cos(p.angle) * 450, p.y + Math.sin(p.angle) * 450);
      ctx.stroke();
    }

    // 4. Render all visual dust particles
    particlesRef.current.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.alpha;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1; // reset alpha

    // 5. Render damage text popup indicators
    damageTextsRef.current.forEach(t => {
      ctx.fillStyle = t.color;
      ctx.globalAlpha = t.alpha;
      ctx.font = 'bold 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
    });
    ctx.globalAlpha = 1; // reset alpha
  };

  // Launch initial game sequence
  const handleStartGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setMoney(800);
    setHealth(100);
    setMaxHealth(100);
    setWave(1);
    window.focus();
    
    // Clear lists
    bulletsRef.current = [];
    zombiesRef.current = [];
    particlesRef.current = [];
    damageTextsRef.current = [];

    // Reset initial weapon unlocks (Karambit Knife and USP-S Pistol are unlocked by default)
    const resetWeapons = INITIAL_WEAPONS.map((w, idx) => ({ 
      ...w, 
      unlocked: w.id === 'knife' || w.id === 'usp' 
    }));
    setWeapons(resetWeapons);
    setActiveWeaponIdx(2); // USP-S Pistol index
    setCurrentClip(resetWeapons[2].clipSize);
    
    // Position player in center of board
    playerRef.current.x = 400;
    playerRef.current.y = 300;

    // Spawn first round
    spawnWaveZombies(1);
    soundManager.playUpgrade();
  };

  // Mouse vector tracking listener triggers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const canvas = canvasRef.current;
    if (!canvas) return;
    mouseRef.current = {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isGameOver || shopOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas || !touch) return;

    mouseRef.current = {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height)
    };

    const player = playerRef.current;
    const dx = mouseRef.current.x - player.x;
    const dy = mouseRef.current.y - player.y;
    player.angle = Math.atan2(dy, dx);

    triggerFire();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isGameOver || shopOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas || !touch) return;

    mouseRef.current = {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height)
    };

    const player = playerRef.current;
    const dx = mouseRef.current.x - player.x;
    const dy = mouseRef.current.y - player.y;
    player.angle = Math.atan2(dy, dx);

    triggerFire();
  };

  const handleNextWeapon = () => {
    let checkedCount = 0;
    let nextIdx = activeWeaponIdx;
    while (checkedCount < weapons.length) {
      nextIdx = (nextIdx + 1) % weapons.length;
      checkedCount++;
      if (weapons[nextIdx].unlocked) {
        setActiveWeaponIdx(nextIdx);
        setCurrentClip(weapons[nextIdx].clipSize);
        setIsReloading(false);
        soundManager.playBuy();
        break;
      }
    }
  };

  // Buy weapon and ammo mechanism
  const buyWeapon = (wId: string) => {
    const weaponIdx = weapons.findIndex(w => w.id === wId);
    if (weaponIdx === -1) return;

    const targetWeapon = weapons[weaponIdx];

    if (targetWeapon.unlocked) {
      // Weapon already unlocked! Select it automatically
      setActiveWeaponIdx(weaponIdx);
      setCurrentClip(targetWeapon.clipSize);
      soundManager.playBuy();
      return;
    }

    if (money >= targetWeapon.cost) {
      setMoney(m => m - targetWeapon.cost);
      setWeapons(prev => {
        const next = [...prev];
        next[weaponIdx].unlocked = true;
        return next;
      });
      setActiveWeaponIdx(weaponIdx);
      setCurrentClip(targetWeapon.clipSize);
      soundManager.playBuy();
      if (onGainXp) onGainXp(100); // Level bonus XP for purchasing power
    }
  };

  const buyHeal = () => {
    const cost = 250;
    if (money >= cost && health < maxHealth) {
      setMoney(m => m - cost);
      setHealth(prev => Math.min(maxHealth, prev + 40));
      soundManager.playBuy();
      spawnDamageText(playerRef.current.x, playerRef.current.y, "+40 HP HEAL!", '#10b981');
    }
  };

  const buyMaxHpUpgrade = () => {
    const cost = 800;
    if (money >= cost) {
      setMoney(m => m - cost);
      setMaxHealth(prev => prev + 25);
      setHealth(prev => prev + 25);
      soundManager.playBuy();
      if (onGainXp) onGainXp(75);
    }
  };

  return (
    <div id="zombie-arcade-zone" className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      
      {/* Decorative Arcade Cabin Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 to-red-500 flex items-center justify-center text-2xl shadow-lg">
            🎮
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">CS: Zombie Outbreak 💀</h2>
            <p className="text-xs text-slate-400">Асралтын бүтээсэн 2D зомби бууддаг тоглоом</p>
          </div>
        </div>

        {/* Action Controls & Sound State keys */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowMobileControls(!showMobileControls)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
              showMobileControls
                ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
            title="Утасны мэдрэгчтэй удирдлага харуулах/нуух"
          >
            <Gamepad2 className="w-4 h-4 animate-bounce" />
            <span>Утасны удирдлага: {showMobileControls ? "Асаалттай" : "Унтраастай"}</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-bold transition-all"
            title="Дуу хаах/нээх"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? "Дуу Хаалттай" : "Дуутай"}</span>
          </button>

          <div className="bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 text-xs">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-slate-400">Шилдэг Оноо:</span>
            <span className="text-yellow-400 font-bold">{bestScore}</span>
          </div>
        </div>
      </div>

      {/* Arcade cabinet viewport body */}
      <div className="relative flex flex-col xl:flex-row gap-8 items-stretch">
        
        {/* Left Side: Interactive Tactical Canvas Display Area */}
        <div className="relative flex-1 bg-slate-950 border-4 border-slate-950 rounded-2xl overflow-hidden min-h-[400px] shadow-2xl">
          
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-auto cursor-crosshair bg-slate-950 block select-none touch-none"
            onMouseMove={handleMouseMove}
            onMouseDown={(e) => { window.focus(); handleCanvasMouseDown(e); }}
            onTouchStart={(e) => { window.focus(); handleTouchStart(e); }}
            onTouchMove={handleTouchMove}
          />

          {/* Virtual On-screen Mobile Controller HUD Overlay */}
          {isPlaying && showMobileControls && (
            <div className="absolute inset-x-0 bottom-4 pointer-events-none flex justify-between items-end px-4 z-20">
              {/* Virtual D-pad for running (Movement keys simulations) */}
              <div className="flex flex-col items-center gap-1.5 pointer-events-auto select-none scale-90 sm:scale-100 origin-bottom-left pb-2">
                {/* W - Up */}
                <button
                  onTouchStart={() => { keysRef.current['w'] = true; }}
                  onTouchEnd={() => { keysRef.current['w'] = false; }}
                  onMouseDown={() => { keysRef.current['w'] = true; }}
                  onMouseUp={() => { keysRef.current['w'] = false; }}
                  onMouseLeave={() => { keysRef.current['w'] = false; }}
                  className="w-12 h-12 bg-slate-950/90 active:bg-orange-500 active:text-white border border-white/20 rounded-2xl flex items-center justify-center text-white text-base font-black transition-all shadow-2xl shrink-0"
                >
                  W
                </button>
                <div className="flex gap-1.5">
                  {/* A - Left */}
                  <button
                    onTouchStart={() => { keysRef.current['a'] = true; }}
                    onTouchEnd={() => { keysRef.current['a'] = false; }}
                    onMouseDown={() => { keysRef.current['a'] = true; }}
                    onMouseUp={() => { keysRef.current['a'] = false; }}
                    onMouseLeave={() => { keysRef.current['a'] = false; }}
                    className="w-12 h-12 bg-slate-950/90 active:bg-orange-500 active:text-white border border-white/20 rounded-2xl flex items-center justify-center text-white text-base font-black transition-all shadow-2xl shrink-0"
                  >
                    A
                  </button>
                  {/* S - Down */}
                  <button
                    onTouchStart={() => { keysRef.current['s'] = true; }}
                    onTouchEnd={() => { keysRef.current['s'] = false; }}
                    onMouseDown={() => { keysRef.current['s'] = true; }}
                    onMouseUp={() => { keysRef.current['s'] = false; }}
                    onMouseLeave={() => { keysRef.current['s'] = false; }}
                    className="w-12 h-12 bg-slate-950/90 active:bg-orange-500 active:text-white border border-white/20 rounded-2xl flex items-center justify-center text-white text-base font-black transition-all shadow-2xl shrink-0"
                  >
                    S
                  </button>
                  {/* D - Right */}
                  <button
                    onTouchStart={() => { keysRef.current['d'] = true; }}
                    onTouchEnd={() => { keysRef.current['d'] = false; }}
                    onMouseDown={() => { keysRef.current['d'] = true; }}
                    onMouseUp={() => { keysRef.current['d'] = false; }}
                    onMouseLeave={() => { keysRef.current['d'] = false; }}
                    className="w-12 h-12 bg-slate-950/90 active:bg-orange-500 active:text-white border border-white/20 rounded-2xl flex items-center justify-center text-white text-base font-black transition-all shadow-2xl shrink-0"
                  >
                    D
                  </button>
                </div>
              </div>

              {/* Action buttons on the right side */}
              <div className="flex gap-2.5 pointer-events-auto select-none scale-90 sm:scale-100 origin-bottom-right pb-2">
                {/* RELOAD */}
                <button
                  onClick={() => {
                    const activeWeapon = weapons[activeWeaponIdx];
                    if (currentClip < activeWeapon.clipSize && !isReloading) {
                      triggerReload();
                    }
                  }}
                  className="w-12 h-12 bg-slate-950/90 active:bg-yellow-500 active:text-slate-950 border border-white/20 rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-black transition-all shadow-2xl shrink-0 gap-0.5"
                  title="Reload (R)"
                >
                  <RefreshCw className="w-4 h-4 text-yellow-400" />
                  <span>RELOAD</span>
                </button>

                {/* SWITCH WEAPON */}
                <button
                  onClick={handleNextWeapon}
                  className="w-12 h-12 bg-slate-950/90 active:bg-yellow-500 active:text-slate-950 border border-white/20 rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-black transition-all shadow-2xl shrink-0 gap-0.5"
                  title="Дараагийн буу"
                >
                  <span className="text-sm">🔫</span>
                  <span>WEAPON</span>
                </button>

                {/* SHOOT */}
                <button
                  onTouchStart={(e) => { e.preventDefault(); triggerFire(); }}
                  onMouseDown={(e) => { e.preventDefault(); triggerFire(); }}
                  className="w-16 h-16 bg-red-600 active:bg-orange-500 border-2 border-white/30 rounded-full flex flex-col items-center justify-center text-white text-xs font-black transition-all shadow-2xl shrink-0"
                  title="Буудах"
                >
                  <span>FIRE</span>
                  <span className="text-[8px] text-red-200">SHOOT</span>
                </button>

                {/* TACTICAL BUY SHOP MENU FOR MOBILE */}
                <button
                  onClick={() => setShopOpen(prev => !prev)}
                  className="w-12 h-12 bg-emerald-600/90 active:bg-emerald-500 border border-white/20 rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-black transition-all shadow-2xl shrink-0 gap-0.5"
                  title="Дэлгүүр (B)"
                >
                  <span className="text-sm">🛒</span>
                  <span>SHOP</span>
                </button>
              </div>
            </div>
          )}

          {/* Starting Overlay panel */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 space-y-6">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-5xl animate-pulse">
                💀
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">CS Zombie Outbreak</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Бууддаг тоглоомд тавтай морил! Та гар утас дээр тоглож байвал зүүн талын удирдлагаар хөдөлж, дэлгэц дээр дарж чиглүүлж буудах эсвэл баруун талын FIRE товчийг дарж хамгаалаарай.
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 max-w-sm space-y-2 text-[11px] text-left text-slate-300 w-full">
                <div className="flex justify-between"><strong>Хөдлөх:</strong> <span>W, A, S, D эсвэл Утасны сум</span></div>
                <div className="flex justify-between"><strong>Буудах:</strong> <span>Хулгана эсвэл Дэлгэц дээр дарах / FIRE товч</span></div>
                <div className="flex justify-between"><strong>Сум цэнэглэх:</strong> <span>R товчлуур / RELOAD</span></div>
                <div className="flex justify-between"><strong>Дэлгүүр:</strong> <span>B товчлуур / SHOP</span></div>
              </div>

              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white font-black px-8 py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-base flex items-center gap-2 border border-white/15 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>ТОГЛООМЫГ ЭХЛҮҮЛЭХ</span>
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center text-center p-6 space-y-6">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-4xl animate-bounce">
                ☠️
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-white tracking-widest uppercase">Тоглоом дууслаа</h3>
                <p className="text-sm text-red-300">Та зомбины дайралтаас амьд үлдэж чадсангүй!</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-xs w-full bg-slate-950/60 p-4 rounded-2xl border border-red-500/20 text-center">
                <div>
                  <div className="text-xs text-slate-400">Оноо</div>
                  <div className="text-2xl font-black text-white">{score}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Шат (Wave)</div>
                  <div className="text-2xl font-black text-yellow-400">{wave}</div>
                </div>
              </div>

              <button
                onClick={handleStartGame}
                className="bg-white hover:bg-slate-100 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ДАХИН ТОГЛОХ</span>
              </button>
            </div>
          )}

          {/* Real-time HUD elements displaying stats over canvas element */}
          {isPlaying && (
            <div className="absolute top-4 left-4 right-4 pointer-events-none flex justify-between items-start gap-4">
              
              {/* Top Left Vital HP HUD */}
              <div className="flex flex-col gap-2 bg-slate-950/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl w-44">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse" /> ЭРҮҮЛ МЭНД
                  </span>
                  <span className="text-white font-black">{Math.ceil(health)}/{maxHealth}</span>
                </div>
                {/* Healthbar fill slider */}
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300" 
                    style={{ width: `${(health / maxHealth) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Top Center Statistics block */}
              <div className="bg-slate-950/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-6 justify-center">
                <div className="text-center">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ШАТ (WAVE)</div>
                  <div className="text-lg font-black text-yellow-400">{wave}</div>
                </div>
                <div className="h-6 w-[1px] bg-white/10"></div>
                <div className="text-center">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ОНОО</div>
                  <div className="text-lg font-black text-white">{score}</div>
                </div>
              </div>

              {/* Top Right Cash HUD */}
              <div className="bg-slate-950/90 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl shadow-xl w-32 text-right">
                <div className="text-[9px] text-slate-405 font-bold uppercase">ТӨСӨВ / CASH</div>
                <div className="text-xl font-black text-emerald-400">${money}</div>
              </div>

            </div>
          )}

          {/* Bottom Right Reload Info & Weapon Ammo Overlay */}
          {isPlaying && (
            <div className="absolute bottom-4 right-4 pointer-events-none bg-slate-950/95 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
              
              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">ИДЭВХТЭЙ БУУ</span>
                <span className="text-sm font-black text-white">{weapons[activeWeaponIdx].name}</span>
              </div>
              
              <div className="h-8 w-[1px] bg-white/10"></div>

              <div className="text-center">
                <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider block">СУМ</span>
                <span className="text-lg font-black text-yellow-400">
                  {currentClip} <span className="text-xs text-slate-400">/ {weapons[activeWeaponIdx].clipSize}</span>
                </span>
              </div>

              {/* Floating reloading spinner overlay hud */}
              {isReloading && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-slate-950 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-lg animate-pulse border border-yellow-300">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>ЦЭНЭГЛЭЖ БАЙНА ({Math.round(reloadProgress)}%)</span>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Side: CS-Style Tactical Buy Menu & Shopping Catalog */}
        <div className="w-full xl:w-80 bg-slate-950 border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">CS ДЭЛГҮҮР (B цэс)</h3>
            </div>

            {/* Heal & Utilities buy pack */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-405 font-extrabold uppercase block tracking-wider">Аврах Хэрэгсэл</span>
              
              <button
                disabled={!isPlaying || money < 250 || health >= maxHealth}
                onClick={buyHeal}
                className="w-full bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 p-2.5 rounded-xl transition-all flex items-center justify-between text-xs font-bold text-slate-300 hover:text-emerald-400 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                  <span>Амь Нэмэх (+40 HP)</span>
                </div>
                <span className="text-emerald-400 font-extrabold">$250</span>
              </button>

              <button
                disabled={!isPlaying || money < 800}
                onClick={buyMaxHpUpgrade}
                className="w-full bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 p-2.5 rounded-xl transition-all flex items-center justify-between text-xs font-bold text-slate-300 hover:text-indigo-400 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Дээд Амь Сэргээлт (+25 Max HP)</span>
                </div>
                <span className="text-indigo-400 font-extrabold">$800</span>
              </button>
            </div>

            {/* Heavy weapons pack buy slots */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-slate-405 font-extrabold uppercase block tracking-wider">Арсенал Буунууд</span>
              
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                {weapons.map((w, idx) => {
                  const canBuy = money >= w.cost;
                  const isEquipped = activeWeaponIdx === idx && isPlaying;
                  
                  return (
                    <div 
                      key={w.id}
                      className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between whitespace-nowrap ${
                        isEquipped 
                          ? 'bg-yellow-400/5 border-yellow-400 text-yellow-300' 
                          : w.unlocked 
                            ? 'bg-white/5 border-white/10 text-slate-300' 
                            : 'bg-white/5 border-white/5 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-extrabold pb-1">
                        <span>{idx + 1}. {w.name}</span>
                        {w.unlocked ? (
                          <span className="text-xs text-yellow-400 uppercase tracking-widest font-black">Нээлттэй</span>
                        ) : (
                          <span className="text-emerald-400 font-black">${w.cost}</span>
                        )}
                      </div>

                      {/* Small metadata stats per gun */}
                      <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                        Гэмтэл: {w.damage} • Хурд: {Math.round(1000 / w.fireRate)}/сек • Сум: {w.clipSize}
                      </span>

                      {/* Click trigger buttons to purchase or equip */}
                      <button
                        disabled={!isPlaying || (!w.unlocked && !canBuy)}
                        onClick={() => buyWeapon(w.id)}
                        className={`mt-2 w-full text-center py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isEquipped 
                            ? 'bg-yellow-400 text-slate-950 font-black' 
                            : w.unlocked 
                              ? 'bg-white/10 text-white hover:bg-white/20' 
                              : canBuy 
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md' 
                                : 'bg-white/5 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isEquipped ? "СОНГОГДСОН" : w.unlocked ? "СУУРИЛУУЛАХ" : "ХУДАЛДАЖ АВАХ"}
                      </button>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick CS tip block */}
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
            <span className="text-[10px] text-yellow-400 font-bold block uppercase tracking-wide">💡 CS-Шиг Зөвлөмж</span>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Нэг дор олон зомбиг дагуулан тойрог үүсгэж гүйнгээ буудах нь (Kiting) амьд үлдэх хамгийн шилдэг тактик юм шүү, Асралт аа! 🏆
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
