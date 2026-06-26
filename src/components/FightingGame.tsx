import React, { useEffect, useRef, useState } from 'react';
import { 
  Shield, Heart, Zap, Play, RotateCcw, Volume2, VolumeX, 
  Swords, Sparkles, Coins, ShoppingBag, Compass
} from 'lucide-react';

// Web Audio API Synthesizer to generate high-quality sound effects procedurally without static assets.
class GameSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  constructor() {}

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

  // Jump slide sweep sound
  playJump() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Double jump quick spark
  playDoubleJump() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  // Slash swipe whoosh sound
  playSwordWhoosh() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  // Destruction / Drone explosion metallic clash sound
  playSlashImpact() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.12);

    gain1.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start();
    osc1.stop(this.ctx.currentTime + 0.12);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.2);

    gain2.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start();
    osc2.stop(this.ctx.currentTime + 0.2);
  }

  // Coins pick up ring sound
  playCoinRing() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5 note
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6 note

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  // Player crash hurt glitch explosion sound
  playPlayerHurt() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

   // Shop item bought ascending sound
  playBuyJingle() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx!.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx!.currentTime + idx * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.08);
      osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.15);
    });
  }

  // Bubble deflection sound effect
  playShieldBuyBackSound() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }
}

const synth = new GameSynth();

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity?: number;
}

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'spike' | 'laser' | 'drone';
  passed: boolean;
  shakenY?: number;
  hoverDir?: number;
}

interface GameCoin {
  x: number;
  y: number;
  size: number;
  collected: boolean;
  angle: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  vy: number;
  alpha: number;
}

interface FightingGameProps {
  onGainXp: (amount: number) => void;
}

export default function FightingGame({ onGainXp }: FightingGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High score persisted in localStorage
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('samurai_run_highscore');
    return saved ? parseInt(saved, 10) : 1000;
  });

  // Dual controls support
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [mute, setMute] = useState(false);

  // HUD and Economy
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(() => {
    const savedCoins = localStorage.getItem('samurai_run_coins');
    return savedCoins ? parseInt(savedCoins, 10) : 50;
  });

  // Shop Upgrades stats
  const [shieldTier, setShieldTier] = useState(1); // Starts with 3 shield lives. Max tier 5.
  const [magnetTier, setMagnetTier] = useState(0); // If > 0, pulls coins from distance. Max tier 3.
  const [unlockedDoubleJump, setUnlockedDoubleJump] = useState(false); // Unlocks double jumping!
  const [activeReviveShield, setActiveReviveShield] = useState(false); // Has single absorption bubble
  const [activeSkin, setActiveSkin] = useState<'cyan' | 'amber' | 'rainbow' | 'standard'>('standard');

  // Custom fighter stats
  const [activeStyle, setActiveStyle] = useState<'wind' | 'lightning' | 'fire' | 'shadow'>(() => {
    const saved = localStorage.getItem('samurai_style');
    return (saved as 'wind' | 'lightning' | 'fire' | 'shadow') || 'wind';
  });
  const [unlockedStyles, setUnlockedStyles] = useState<string[]>(() => {
    const saved = localStorage.getItem('samurai_unlocked_styles');
    return saved ? JSON.parse(saved) : ['wind'];
  });
  const [unlockedWeapons, setUnlockedWeapons] = useState<string[]>(() => {
    const saved = localStorage.getItem('samurai_unlocked_weapons');
    return saved ? JSON.parse(saved) : ['standard'];
  });
  const [fighterLevel, setFighterLevel] = useState(() => {
    const saved = localStorage.getItem('samurai_fighter_level');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [fighterXp, setFighterXp] = useState(() => {
    const saved = localStorage.getItem('samurai_fighter_xp');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Multi-touch visual buttons states
  const [btnStates, setBtnStates] = useState({
    Jump: false,
    Slide: false,
    Slash: false
  });

  // Direct ref representation of all mutable parameters updated in 60fps loop 
  const loopRef = useRef({
    playing: false,
    gameOver: false,
    score: 0,
    coins: 50,
    gameSpeed: 5.8,
    maxSpeed: 12.0,
    screenShake: 0,
    parallaxBgX1: 0, // distant sky details
    parallaxBgX2: 0, // cyber city towers
    parallaxBgX3: 0, // road structures
    fighterLevel: 1,
    activeStyle: 'wind' as 'wind' | 'lightning' | 'fire' | 'shadow',
    player: {
      y: 310,
      vy: 0,
      w: 40,
      h: 60,
      targetH: 60,
      isGrounded: true,
      jumpForces: -12.5,
      jumpsLeft: 1,
      sliding: false,
      slideTimer: 0,
      slashingActive: false,
      slashTimer: 0,
      activeSkin: 'standard' as 'standard' | 'cyan' | 'amber' | 'rainbow',
      unlockedDoubleJump: false,
      magnetTier: 0,
      reviveBubbleActive: false,
      hurtFlicker: 0,
      hp: 3
    },
    obstacles: [] as Obstacle[],
    coinsList: [] as GameCoin[],
    particles: [] as Particle[],
    floatTexts: [] as FloatingText[],
    spawnTimer: 0,
    coinSpawnTimer: 0,
    controls: {
      jump: false,
      slide: false,
      slash: false
    }
  });

  // Synchronize component state to looping reference hook
  useEffect(() => {
    loopRef.current.playing = playing;
    loopRef.current.gameOver = gameOver;
    loopRef.current.score = score;
    loopRef.current.coins = coins;
    loopRef.current.fighterLevel = fighterLevel;
    loopRef.current.activeStyle = activeStyle;
    loopRef.current.player.activeSkin = activeSkin;
    loopRef.current.player.unlockedDoubleJump = unlockedDoubleJump || activeStyle === 'shadow';
    loopRef.current.player.magnetTier = magnetTier + (activeStyle === 'lightning' ? 1 : 0);
    loopRef.current.player.reviveBubbleActive = activeReviveShield;
    loopRef.current.player.hp = shieldTier + 2; // Tier 1 = 3 hearts, Tier 2 = 4 hearts...
  }, [playing, gameOver, score, coins, activeSkin, unlockedDoubleJump, magnetTier, activeReviveShield, shieldTier, fighterLevel, activeStyle]);

  // Handle Mute setting of synth
  useEffect(() => {
    synth.muted = mute;
  }, [mute]);

  // Instant response callback key bindings mapped
  const triggerJumpAction = () => {
    const state = loopRef.current;
    if (!state.playing || state.gameOver) return;

    const player = state.player;
    if (player.sliding) {
      // Cancel slide instantly to jump
      player.sliding = false;
      player.h = 60;
      player.targetH = 60;
    }

    if (player.isGrounded) {
      player.vy = player.jumpForces;
      player.isGrounded = false;
      player.jumpsLeft = player.unlockedDoubleJump ? 1 : 0;
      synth.playJump();
    } else if (player.jumpsLeft > 0) {
      // Double jump
      player.vy = player.jumpForces * 0.95;
      player.jumpsLeft--;
      synth.playDoubleJump();

      // Spawn double jump smoke rings
      for (let i = 0; i < 15; i++) {
        state.particles.push({
          x: 120 + player.w / 2,
          y: player.y + player.h,
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() * 2 + 1,
          color: 'rgba(251, 191, 36, 0.75)',
          size: Math.random() * 4 + 2,
          alpha: 1.0,
          decay: 0.05
        });
      }
    }
  };

  const triggerSlideAction = (active: boolean) => {
    const state = loopRef.current;
    if (!state.playing || state.gameOver) return;

    const player = state.player;
    if (active) {
      player.sliding = true;
      player.vy = Math.max(player.vy, 4); // force slide slam downwards fast
      // visual shrink
      player.targetH = 26;
    } else {
      player.sliding = false;
      player.targetH = 60;
    }
  };

  const triggerSlashAction = () => {
    const state = loopRef.current;
    if (!state.playing || state.gameOver) return;

    const player = state.player;
    if (player.slashingActive) return; // Prevent double slash frames overlapping

    player.slashingActive = true;
    
    // Lightning Strike Style increases fire rate / decreases cooldown
    player.slashTimer = state.activeStyle === 'lightning' ? 9 : 14; 
    synth.playSwordWhoosh();

    // Determine strike color and range based on equipped Weapon
    let strikeRange = 120;
    let arcColor = '#94a3b8'; // grey katana
    let weaponName = 'КАТАНА';

    if (player.activeSkin === 'cyan') {
      strikeRange = 175;
      arcColor = '#22d3ee'; // cyan laser sabre
      weaponName = 'ГЭРЛЭН СЭЛЭМ';
    } else if (player.activeSkin === 'amber') {
      strikeRange = 230;
      arcColor = '#f59e0b'; // amber dragon blade
      weaponName = 'ЛУУГИЙН ИЛД';
    } else if (player.activeSkin === 'rainbow') {
      strikeRange = 290;
      arcColor = `hsl(${Math.floor(Date.now() / 3) % 360}, 100%, 60%)`; // infinity blade
      weaponName = 'ХЯЗГААРГҮЙ ИЛД';
    }

    // Spawn slice energy arcs particles
    for (let i = 0; i < 15; i++) {
      state.particles.push({
        x: 140 + player.w + Math.random() * (strikeRange * 0.4),
        y: player.y + player.h / 2 + (Math.random() - 0.5) * 55,
        vx: Math.random() * 9 + 5,
        vy: (Math.random() - 0.5) * 4,
        color: arcColor,
        size: Math.random() * 4 + 1.5,
        alpha: 1.0,
        decay: 0.07
      });
    }

    // Check collision check with incoming enemies inside the striking radius
    state.obstacles.forEach(obs => {
      if (!obs.passed) {
        const dx = obs.x - (120 + player.w);
        // If the enemy is within our weapon's strike range
        if (dx > -30 && dx < strikeRange) {
          obs.passed = true;
          synth.playSlashImpact();
          state.screenShake = 15;

          // Reward coins and score
          const bonusCoins = player.activeSkin === 'rainbow' ? 5 : 3;
          let enemyLable = 'ДАЙСАН';
          if (obs.type === 'spike') enemyLable = 'ШОРООН НИНЖА';
          if (obs.type === 'laser') enemyLable = 'ГҮЙДЭЛТЭН';
          if (obs.type === 'drone') enemyLable = 'ХАРУУЛЫН ДРОН';

          setCoins(c => {
            const sum = c + bonusCoins;
            localStorage.setItem('samurai_run_coins', sum.toString());
            return sum;
          });

          const killScore = 400 + (state.fighterLevel * 100);
          setScore(s => s + killScore);

          // Earn Fighter XP (Fiery Rage grants more XP per kill!)
          const xpGain = state.activeStyle === 'fire' ? 35 : 20;
          let currentXp = fighterXp + xpGain;
          let nextLevel = fighterLevel;

          if (currentXp >= 100) {
            nextLevel += 1;
            currentXp = currentXp % 100;
            synth.playBuyJingle(); // epic level up fanfare
            
            state.floatTexts.push({
              id: Math.random() + 2,
              x: 120,
              y: player.y - 45,
              text: `🥋 ТҮВШИН АХИЛАА! LV. ${nextLevel} 🎉`,
              color: '#00ff88',
              vy: -2.5,
              alpha: 1.0
            });

            // Giant spark shower for level up
            for (let ls = 0; ls < 40; ls++) {
              state.particles.push({
                x: 140,
                y: player.y + player.h / 2,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.6) * 16,
                color: `hsl(${ls * 15}, 100%, 65%)`,
                size: Math.random() * 6 + 2,
                alpha: 1.0,
                decay: 0.03,
                gravity: 0.15
              });
            }
          }

          setFighterLevel(nextLevel);
          setFighterXp(currentXp);
          localStorage.setItem('samurai_fighter_level', nextLevel.toString());
          localStorage.setItem('samurai_fighter_xp', currentXp.toString());

          state.floatTexts.push({
            id: Math.random(),
            x: obs.x,
            y: obs.y,
            text: `⚔️ ${enemyLable} +${bonusCoins}🪙 [${xpGain} XP]`,
            color: arcColor,
            vy: -3,
            alpha: 1.0
          });

          // Colorful sparks blast
          for (let j = 0; j < 25; j++) {
            state.particles.push({
              x: obs.x + obs.w / 2,
              y: obs.y + obs.h / 2,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.4) * 12,
              color: j % 2 === 0 ? '#ffffff' : arcColor,
              size: Math.random() * 5 + 2,
              alpha: 1.0,
              decay: 0.04,
              gravity: 0.18
            });
          }
        }
      }
    });
  };

  // Upgrades shop transactional functions
  const tryEquipWeapon = (weaponType: 'standard' | 'cyan' | 'amber' | 'rainbow') => {
    if (unlockedWeapons.includes(weaponType)) {
      setActiveSkin(weaponType);
      synth.playJump();
    } else {
      let cost = 100;
      if (weaponType === 'cyan') cost = 100;
      else if (weaponType === 'amber') cost = 250;
      else if (weaponType === 'rainbow') cost = 500;

      if (coins >= cost) {
        setCoins(c => {
          const remaining = c - cost;
          localStorage.setItem('samurai_run_coins', remaining.toString());
          return remaining;
        });
        const nextList = [...unlockedWeapons, weaponType];
        setUnlockedWeapons(nextList);
        localStorage.setItem('samurai_unlocked_weapons', JSON.stringify(nextList));
        setActiveSkin(weaponType);
        synth.playBuyJingle();
        onGainXp(40);
      }
    }
  };

  const tryEquipStyle = (styleType: 'wind' | 'lightning' | 'fire' | 'shadow') => {
    if (unlockedStyles.includes(styleType)) {
      setActiveStyle(styleType);
      synth.playJump();
    } else {
      let cost = 150;
      if (styleType === 'lightning') cost = 150;
      else if (styleType === 'fire') cost = 300;
      else if (styleType === 'shadow') cost = 450;

      if (coins >= cost) {
        setCoins(c => {
          const remaining = c - cost;
          localStorage.setItem('samurai_run_coins', remaining.toString());
          return remaining;
        });
        const nextList = [...unlockedStyles, styleType];
        setUnlockedStyles(nextList);
        localStorage.setItem('samurai_unlocked_styles', JSON.stringify(nextList));
        setActiveStyle(styleType);
        synth.playBuyJingle();
        onGainXp(45);
      }
    }
  };

  const buyShieldCapacity = () => {
    const price = shieldTier * 30 + 30; // Starts from 60 
    if (coins >= price && shieldTier < 5) {
      setCoins(c => {
        const remaining = c - price;
        localStorage.setItem('samurai_run_coins', remaining.toString());
        return remaining;
      });
      setShieldTier(t => t + 1);
      synth.playBuyJingle();
      onGainXp(25);
    }
  };

  const buyDoubleJump = () => {
    const price = 80;
    if (coins >= price && !unlockedDoubleJump) {
      setCoins(c => {
        const remaining = c - price;
        localStorage.setItem('samurai_run_coins', remaining.toString());
        return remaining;
      });
      setUnlockedDoubleJump(true);
      synth.playBuyJingle();
      onGainXp(35);
    }
  };

  const buyMagnetPower = () => {
    const price = (magnetTier + 1) * 45; // 45, 90, 135
    if (coins >= price && magnetTier < 3) {
      setCoins(c => {
        const remaining = c - price;
        localStorage.setItem('samurai_run_coins', remaining.toString());
        return remaining;
      });
      setMagnetTier(t => t + 1);
      synth.playBuyJingle();
      onGainXp(30);
    }
  };

  const buyReviveShield = () => {
    const price = 25;
    if (coins >= price && !activeReviveShield) {
      setCoins(c => {
        const remaining = c - price;
        localStorage.setItem('samurai_run_coins', remaining.toString());
        return remaining;
      });
      setActiveReviveShield(true);
      synth.playBuyJingle();
    }
  };

  // PC key controller listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playing || gameOver) return;
      const key = (e.key || '').toLowerCase();

      if (key === ' ' || key === 'arrowup' || key === 'w') {
        e.preventDefault();
        triggerJumpAction();
        setBtnStates(prev => ({ ...prev, Jump: true }));
      }
      if (key === 's' || key === 'arrowdown') {
        e.preventDefault();
        triggerSlideAction(true);
        setBtnStates(prev => ({ ...prev, Slide: true }));
      }
      if (key === 'j' || key === 'f' || key === 'enter') {
        e.preventDefault();
        triggerSlashAction();
        setBtnStates(prev => ({ ...prev, Slash: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = (e.key || '').toLowerCase();
      if (key === 's' || key === 'arrowdown') {
        triggerSlideAction(false);
        setBtnStates(prev => ({ ...prev, Slide: false }));
      }
      if (key === ' ' || key === 'arrowup' || key === 'w') {
        setBtnStates(prev => ({ ...prev, Jump: false }));
      }
      if (key === 'j' || key === 'f' || key === 'enter') {
        setBtnStates(prev => ({ ...prev, Slash: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playing, gameOver, unlockedDoubleJump, activeSkin]);

  // Master Game Session Initializer
  const handleStartGame = () => {
    setScore(0);
    setGameOver(false);
    setPlaying(true);

    const state = loopRef.current;
    state.playing = true;
    state.gameOver = false;
    state.score = 0;
    state.gameSpeed = 6.2;
    state.screenShake = 0;
    state.parallaxBgX1 = 0;
    state.parallaxBgX2 = 0;
    state.parallaxBgX3 = 0;

    // Reset loop player object values
    state.player.y = 310;
    state.player.vy = 0;
    state.player.h = 60;
    state.player.targetH = 60;
    state.player.isGrounded = true;
    state.player.sliding = false;
    state.player.slideTimer = 0;
    state.player.slashingActive = false;
    state.player.slashTimer = 0;
    state.player.hp = shieldTier + 2; // Total lives
    state.player.hurtFlicker = 0;
    state.player.reviveBubbleActive = activeReviveShield;

    state.obstacles = [];
    state.coinsList = [];
    state.particles = [];
    state.floatTexts = [];
    state.spawnTimer = 20; // instantly spawn soon
    state.coinSpawnTimer = 0;
  };

  // Main Loop logic animation at solid 60fps frame request
  useEffect(() => {
    let animId: number;

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = loopRef.current;

      // Handle custom screen shake values
      if (state.screenShake > 0) {
        state.screenShake *= 0.88;
        if (state.screenShake < 0.4) state.screenShake = 0;
      }

      ctx.save();
      if (state.screenShake > 0) {
        const dx = (Math.random() - 0.5) * state.screenShake;
        const dy = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(dx, dy);
      }

      // ----------------------------------------------------
      // BACKGROUND RENDER (Cyberpunk Parallax Space & Grid)
      // ----------------------------------------------------
      // Outer deep cosmic glow
      const bgGlow = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGlow.addColorStop(0, '#060a12');
      bgGlow.addColorStop(0.5, '#0c1424');
      bgGlow.addColorStop(1, '#020508');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Star constellations scrolling
      if (state.playing && !state.gameOver) {
        state.parallaxBgX1 -= 0.15;
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 40; i++) {
        const starX = (Math.abs(state.parallaxBgX1 * 0.4 + i * 95) % (canvas.width + 100)) - 50;
        const starY = (i * 123) % (canvas.height - 150);
        ctx.fillRect(starX, starY, (i % 3 === 0) ? 2.5 : 1.2, (i % 3 === 0) ? 2.5 : 1.2);
      }

      // Parallax Layer 2: Neon Skyline Cyber Tower silhouettes
      if (state.playing && !state.gameOver) {
        state.parallaxBgX2 -= 0.65;
      }
      ctx.fillStyle = 'rgba(12, 18, 33, 0.65)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 15; i++) {
        const blockW = 80 + (i % 3) * 35;
        const blockH = 140 + (i % 2) * 90;
        const blockX = (Math.abs(state.parallaxBgX2 + i * 110) % (canvas.width + blockW)) - blockW;
        const blockY = 370 - blockH;

        // Draw skyscraper body
        ctx.fillRect(blockX, blockY, blockW, blockH);
        ctx.strokeRect(blockX, blockY, blockW, blockH);

        // Tower neon antenna spikes
        if (i % 2 === 0) {
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
          ctx.beginPath();
          ctx.moveTo(blockX + blockW / 2, blockY);
          ctx.lineTo(blockX + blockW / 2, blockY - 25);
          ctx.stroke();
          ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
          ctx.beginPath();
          ctx.arc(blockX + blockW / 2, blockY - 25, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(12, 18, 33, 0.65)';
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
        }
      }

      // Parallax Grid Floor Road
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 370, canvas.width, canvas.height - 370);

      // Perspective Grid Lines scrolling
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.16)';
      ctx.lineWidth = 2;
      const gridLineOffset = state.playing && !state.gameOver ? (state.parallaxBgX3 % 40) : 0;
      if (state.playing && !state.gameOver) {
        state.parallaxBgX3 -= state.gameSpeed;
      }

      // Horizontal ground lines
      for (let y = 370; y < canvas.height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Vertical converging lines
      for (let x = -200; x < canvas.width + 200; x += 65) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + (x - canvas.width / 2) * 0.1, 370);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Glowing Divider Line
      const divGrad = ctx.createLinearGradient(0, 370, canvas.width, 370);
      divGrad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
      divGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.8)');
      divGrad.addColorStop(1, 'rgba(251, 191, 36, 0.8)');
      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, 370);
      ctx.lineTo(canvas.width, 370);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset blur

      if (state.playing) {
        // ----------------------------------------------------
        // PLAYER RENDER & LIFECYCLE MECHANICS
        // ----------------------------------------------------
        const player = state.player;

        // Accelerate game speed slightly as run goes further!
        if (!state.gameOver) {
          state.gameSpeed = Math.min(state.maxSpeed, state.gameSpeed + 0.0006);
          // Auto add score on moving forward
          const rawScore = state.score + Math.floor(state.gameSpeed * 0.45);
          setScore(rawScore);
          state.score = rawScore;
        }

        // Apply visual height transitions (e.g. crouching) smoothly
        const heightDiff = player.targetH - player.h;
        player.h += heightDiff * 0.35;

        // Apply physics gravity action
        player.vy += 0.58; // heavy gravity
        player.y += player.vy;

        // Floor ground checking limit
        const playerGroundY = 370 - player.h;
        if (player.y >= playerGroundY) {
          player.y = playerGroundY;
          player.vy = 0;
          player.isGrounded = true;
          player.jumpsLeft = player.unlockedDoubleJump ? 1 : 0;
        }

        // Increment timers and flicker logic
        if (player.hurtFlicker > 0) player.hurtFlicker--;
        if (player.slashTimer > 0) {
          player.slashTimer--;
          if (player.slashTimer <= 0) {
            player.slashingActive = false;
          }
        }

        // Draw friction trail spark particles when sliding/running on neon soil
        if (!state.gameOver && player.isGrounded) {
          let trailColor = player.sliding ? 'rgba(236, 72, 153, 0.65)' : 'rgba(34, 211, 238, 0.45)';
          
          if (state.activeStyle === 'lightning') {
            trailColor = 'rgba(234, 179, 8, 0.8)'; // Yellow lightning spark
          } else if (state.activeStyle === 'fire') {
            trailColor = 'rgba(239, 68, 68, 0.8)'; // Red flame spark
          } else if (state.activeStyle === 'shadow') {
            trailColor = 'rgba(168, 85, 247, 0.6)'; // Purple trail
          }

          const numParticles = player.sliding ? 4 : 2;
          for (let pi = 0; pi < numParticles; pi++) {
            state.particles.push({
              x: 120 + Math.random() * 10,
              y: player.y + player.h - (player.sliding ? 2 : 0),
              vx: -(state.gameSpeed * 0.5 + Math.random() * 3),
              vy: -(Math.random() * (state.activeStyle === 'fire' ? 4 : 2)),
              color: trailColor,
              size: Math.random() * (state.activeStyle === 'fire' ? 5 : 3) + 1,
              alpha: 0.85,
              decay: 0.04
            });
          }
        }

        // Render Shadow Clones if Shadow Step style is active
        if (state.activeStyle === 'shadow' && !state.gameOver) {
          ctx.save();
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = '#a855f7'; // Purple shadow duplicate 1
          ctx.beginPath();
          ctx.roundRect(100, player.y + 4, player.w, player.h - 4, 10);
          ctx.fill();

          ctx.fillStyle = '#d8b4fe'; // Purple shadow duplicate 2
          ctx.beginPath();
          ctx.roundRect(80, player.y + 8, player.w, player.h - 8, 10);
          ctx.fill();
          ctx.restore();
        }

        // Render Lightning shield / glow if Lightning Style is active
        if (state.activeStyle === 'lightning' && !state.gameOver && Math.floor(Date.now() / 80) % 2 === 0) {
          ctx.save();
          ctx.strokeStyle = '#f59e0b';
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 12;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(120 + player.w / 2, player.y + player.h / 2, 38 + Math.random() * 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Render Player Avatar
        ctx.save();
        if (player.hurtFlicker > 0 && Math.floor(Date.now() / 70) % 2 === 0) {
          ctx.globalAlpha = 0.25; // hurting flashing visual indicators
        }

        // Aesthetic dynamic color based on skin purchased (Weapons)
        let primaryNeonColor = '#94a3b8'; // grey default saber
        if (player.activeSkin === 'cyan') primaryNeonColor = '#22d3ee';
        else if (player.activeSkin === 'amber') primaryNeonColor = '#f59e0b';
        else if (player.activeSkin === 'rainbow') primaryNeonColor = `hsl(${Math.floor(Date.now() / 6) % 360}, 100%, 65%)`;

        const secondaryContrastColor = player.activeSkin === 'rainbow' ? '#ffffff' : '#f43f5e';

        // 1. Shadow beneath player
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(140, 368, 22, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Sliding Leaned Jetpack or glowing spine
        if (player.sliding) {
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = primaryNeonColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(100, player.y + 4, 38, player.h - 4, [10, 4, 4, 10]);
          ctx.fill();
          ctx.stroke();

          // Spark fires exhaust jets
          ctx.fillStyle = secondaryContrastColor;
          ctx.fillRect(84 + Math.sin(Date.now() / 50) * 4, player.y + 11, 16, 6);
        } else {
          // Regular Running neon posture body suits
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = primaryNeonColor;
          ctx.lineWidth = 3;
          ctx.shadowColor = primaryNeonColor;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.roundRect(120, player.y, player.w, player.h, 12);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0; // reset glow shadow

          // Glowing energy belt core
          ctx.fillStyle = secondaryContrastColor;
          ctx.beginPath();
          ctx.roundRect(120, player.y + player.h / 1.7, player.w, 4.5, 2);
          ctx.fill();
        }

        // 3. Cyber Shield barrier bubble if Revive shield still active
        if (player.reviveBubbleActive) {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
          ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 18;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(120 + player.w / 2, player.y + player.h / 2, 48, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // 4. Drawing the glowing Epic Laser Saber / Sword
        ctx.save();
        ctx.translate(120 + player.w / 1.5, player.y + player.h / 2.3);

        if (player.slashingActive) {
          // Swift swiveling swing angle
          const slashAngle = -Math.PI / 4 + ((14 - player.slashTimer) / 14) * Math.PI * 1.5;
          ctx.rotate(slashAngle);
        } else {
          // Rest position pointing up and back
          ctx.rotate(Math.PI / 3.5);
        }

        // Laser blade length
        ctx.fillStyle = primaryNeonColor;
        ctx.shadowColor = primaryNeonColor;
        ctx.shadowBlur = 12;
        ctx.fillRect(0, -42, 4.5, 42); // blade glowing core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(1, -40, 2.5, 38);
        ctx.shadowBlur = 0;

        // Sword handle
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-1.5, 0, 7.5, 12);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-4, 0, 12.5, 3);
        ctx.restore();

        ctx.restore(); // restore player state canvas

        // ----------------------------------------------------
        // INCOMING OBSTACLES GENERATION & TESTING
        // ----------------------------------------------------
        state.spawnTimer++;
        if (state.spawnTimer > Math.max(48, 120 - state.gameSpeed * 8)) {
          state.spawnTimer = 0;

          // Decide class of obstacle: Spikes or Hanging laser beam or Caster drones
          const pick = Math.random();
          if (pick < 0.38) {
            // Floor laser spikers
            state.obstacles.push({
              x: canvas.width + 50,
              y: 370 - 42,
              w: 32,
              h: 42,
              type: 'spike',
              passed: false
            });
          } else if (pick < 0.68) {
            // High neon laser gates (must crouch slide)
            state.obstacles.push({
              x: canvas.width + 50,
              y: 210,
              w: 26,
              h: 110,
              type: 'laser',
              passed: false
            });
          } else {
            // Flapping attack defense droid drones (crouch slide or JUMP SLASH to explode)
            state.obstacles.push({
              x: canvas.width + 50,
              y: 250 + Math.sin(Date.now() / 150) * 15,
              w: 42,
              h: 42,
              type: 'drone',
              passed: false,
              hoverDir: 1
            });
          }
        }

        // ----------------------------------------------------
        // HIGH PERFORMANCE COINS SPAWNER GRID
        // ----------------------------------------------------
        state.coinSpawnTimer++;
        if (state.coinSpawnTimer > 60) {
          state.coinSpawnTimer = Math.random() * -40; // randomized gaps
          const coinPatternLength = 3 + Math.floor(Math.random() * 4);
          const patternY = Math.random() > 0.5 ? 310 : 220; // easy to jump, or slide

          for (let ci = 0; ci < coinPatternLength; ci++) {
            state.coinsList.push({
              x: canvas.width + ci * 32,
              y: patternY - Math.sin(ci * 0.6) * 15,
              size: 8,
              collected: false,
              angle: Math.random() * Math.PI
            });
          }
        }

        // Render Coins List
        for (let idx = state.coinsList.length - 1; idx >= 0; idx--) {
          const coin = state.coinsList[idx];
          coin.x -= state.gameSpeed;
          coin.angle += 0.08;

          // Magnet Pulling Effect logic
          if (player.magnetTier > 0 && !coin.collected && !state.gameOver) {
            // Check distance
            const px = 120 + player.w / 2;
            const py = player.y + player.h / 2;
            const dx = px - coin.x;
            const dy = py - coin.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Pull trigger distance based on upgrade tiers: 100px, 160px, 250px
            const pullRadius = player.magnetTier * 75 + 40;
            if (dist < pullRadius) {
              const pullSpeed = 9.5;
              coin.x += (dx / dist) * pullSpeed;
              coin.y += (dy / dist) * pullSpeed;
            }
          }

          if (coin.x < -40) {
            state.coinsList.splice(idx, 1);
            continue;
          }

          if (!coin.collected) {
            // Canvas Draw coin visually shiny with metallic highlights
            ctx.save();
            ctx.translate(coin.x, coin.y);
            ctx.scale(Math.abs(Math.sin(coin.angle)), 1.0); // Spin 3D mock effect

            ctx.fillStyle = '#fbbf24'; // beautiful gold
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Inner shiny star center
            ctx.fillStyle = '#fffbeb';
            ctx.fillRect(-1.5, -coin.size / 2.5, 3, coin.size * 0.8);
            ctx.restore();

            // Collision check coin pickings with player body
            const px = 120;
            const py = player.y;
            const pw = player.w;
            const ph = player.h;

            const isCoinInside = coin.x + coin.size > px &&
                               coin.x - coin.size < px + pw &&
                               coin.y + coin.size > py &&
                               coin.y - coin.size < py + ph;

            if (isCoinInside) {
              coin.collected = true;
              synth.playCoinRing();

              // Add monetary values
              const coinVal = 1;
              setCoins(c => {
                const total = c + coinVal;
                localStorage.setItem('samurai_run_coins', total.toString());
                return total;
              });

              // Sparks burst on pickup
              for (let cp = 0; cp < 6; cp++) {
                state.particles.push({
                  x: coin.x,
                  y: coin.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  color: '#fbbf24',
                  size: Math.random() * 3 + 1,
                  alpha: 1.0,
                  decay: 0.08
                });
              }

              state.coinsList.splice(idx, 1);
            }
          }
        }

        // Update and Render Obstacles
        for (let idx = state.obstacles.length - 1; idx >= 0; idx--) {
          const obs = state.obstacles[idx];
          obs.x -= state.gameSpeed;

          // Drone hover floating sway animations
          if (obs.type === 'drone') {
            if (!obs.hoverDir) obs.hoverDir = 1;
            obs.y += Math.sin(Date.now() / 200 + idx) * 0.75;
          }

          if (obs.x < -100) {
            state.obstacles.splice(idx, 1);
            continue;
          }

          // Render Obstacles Neon Vectors
          if (!obs.passed) {
            ctx.save();
            ctx.shadowBlur = 8;

            if (obs.type === 'spike') {
              // GROUND NINJA WARRIOR (Run & slash pose)
              ctx.shadowColor = '#f43f5e';
              ctx.fillStyle = '#1e1b4b'; // dark outfit
              ctx.strokeStyle = '#ef4444'; // red outline
              ctx.lineWidth = 2;

              // Draw crouching ninja trunk
              ctx.beginPath();
              ctx.roundRect(obs.x, obs.y + 4, obs.w, obs.h - 4, [6, 6, 2, 2]);
              ctx.fill();
              ctx.stroke();

              // Red head bandana
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(obs.x + 2, obs.y + 8, obs.w - 4, 8);
              // Bandana tails fluttering backward
              ctx.beginPath();
              ctx.moveTo(obs.x + obs.w, obs.y + 12);
              ctx.lineTo(obs.x + obs.w + 12 + Math.sin(Date.now() / 80) * 4, obs.y + 8);
              ctx.lineTo(obs.x + obs.w + 8, obs.y + 16);
              ctx.closePath();
              ctx.fill();

              // Glowing angry slit eyes
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(obs.x + 4, obs.y + 11, 6, 2);

              // Ninja sword katana drawn forward
              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(obs.x + 4, obs.y + 24);
              ctx.lineTo(obs.x - 14, obs.y + 20 + Math.sin(Date.now() / 60) * 4);
              ctx.stroke();

              // Little moving ninja feet
              const swing = Math.sin(Date.now() * 0.02) * 8;
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 3.5;
              ctx.beginPath();
              ctx.moveTo(obs.x + 8, obs.y + obs.h);
              ctx.lineTo(obs.x + 8 - swing, obs.y + obs.h + 2);
              ctx.moveTo(obs.x + obs.w - 8, obs.y + obs.h);
              ctx.lineTo(obs.x + obs.w - 8 + swing, obs.y + obs.h + 2);
              ctx.stroke();

            } else if (obs.type === 'laser') {
              // FLOATING SPECTER / ELECTRIC DEMON - crouch slide to avoid!
              ctx.shadowColor = '#d946ef'; // Fuchsia magical glow
              
              // Demon spirit body
              ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
              ctx.strokeStyle = '#d946ef';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 10);
              ctx.fill();
              ctx.stroke();

              // Floating electric core
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2.3, 7, 0, Math.PI * 2);
              ctx.fill();

              // Energy horns
              ctx.fillStyle = '#f472b6';
              ctx.beginPath();
              ctx.moveTo(obs.x + 4, obs.y);
              ctx.lineTo(obs.x - 4, obs.y - 12);
              ctx.lineTo(obs.x + 10, obs.y + 2);
              ctx.closePath();
              ctx.fill();

              ctx.beginPath();
              ctx.moveTo(obs.x + obs.w - 4, obs.y);
              ctx.lineTo(obs.x + obs.w + 4, obs.y - 12);
              ctx.lineTo(obs.x + obs.w - 10, obs.y + 2);
              ctx.closePath();
              ctx.fill();

              // Electric crackling sparks inside barrier
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(obs.x + obs.w / 2 + (Math.random() - 0.5) * 10, obs.y + 10);
              ctx.lineTo(obs.x + obs.w / 2 + (Math.random() - 0.5) * 10, obs.y + obs.h / 2);
              ctx.lineTo(obs.x + obs.w / 2 + (Math.random() - 0.5) * 10, obs.y + obs.h - 10);
              ctx.stroke();

            } else if (obs.type === 'drone') {
              // PATROL GUARDIAN DRONE (flying high or mid-height)
              ctx.shadowColor = '#38bdf8'; // Blue futuristic robo scan
              ctx.fillStyle = '#1e293b';
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 2.5;

              // Outer circular capsule body
              ctx.beginPath();
              ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              // Scanning glass eye visor blinking
              const flash = Math.floor(Date.now() / 150) % 2 === 0;
              ctx.fillStyle = flash ? '#ef4444' : '#38bdf8';
              ctx.beginPath();
              ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h / 2, 10, 5, 0, 0, Math.PI * 2);
              ctx.fill();

              // Side rotary helicopters blades
              ctx.fillStyle = '#64748b';
              ctx.fillRect(obs.x - 8, obs.y + obs.h / 2 - 3, 8, 5);
              ctx.fillRect(obs.x + obs.w, obs.y + obs.h / 2 - 3, 8, 5);

              // Spinning lines representing propellers
              ctx.strokeStyle = '#e2e8f0';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(obs.x - 14, obs.y + obs.h / 2 - 1);
              ctx.lineTo(obs.x - 2, obs.y + obs.h / 2 - 1);
              ctx.moveTo(obs.x + obs.w + 2, obs.y + obs.h / 2 - 1);
              ctx.lineTo(obs.x + obs.w + 14, obs.y + obs.h / 2 - 1);
              ctx.stroke();
            }

            ctx.restore();

            // Collision check math logic
            const px = 120;
            const py = player.y;
            const pw = player.w;
            const ph = player.h;

            const oxMin = obs.x;
            const oxMax = obs.x + obs.w;
            const oyMin = obs.y;
            const oyMax = obs.y + obs.h;

            const isCollided = px < oxMax && px + pw > oxMin &&
                              py < oyMax && py + ph > oyMin;

            if (isCollided && player.hurtFlicker <= 0 && !state.gameOver) {
              // Trigger Screen Shake
              state.screenShake = 22;

              // Check if revive shield absorbed the crush
              if (player.reviveBubbleActive) {
                player.reviveBubbleActive = false;
                setActiveReviveShield(false);
                player.hurtFlicker = 70; // temporary invulnerable flicker
                synth.playShieldBuyBackSound(); // shield explosion pop sound
                synth.playSlashImpact();

                state.floatTexts.push({
                  id: Math.random(),
                  x: 120,
                  y: player.y - 15,
                  text: '🛡️ БАМБАЙ ШИНГЭЭВ!',
                  color: '#10b981',
                  vy: -3,
                  alpha: 1.0
                });

                // Spawn neon shield shards particles
                for (let si = 0; si < 30; si++) {
                  state.particles.push({
                    x: px + pw / 2,
                    y: py + ph / 2,
                    vx: (Math.random() - 0.5) * 14,
                    vy: (Math.random() - 0.5) * 14,
                    color: '#10b981',
                    size: Math.random() * 4 + 1.5,
                    alpha: 1.0,
                    decay: 0.04
                  });
                }
                obs.passed = true; // remove collision liability
              } else {
                // Suffer damage point
                player.hp--;
                player.hurtFlicker = 70;
                synth.playPlayerHurt();

                state.floatTexts.push({
                  id: Math.random(),
                  x: 120,
                  y: player.y - 12,
                  text: '💥 МӨРГӨЛДӨЛ -1 СУУДАЛ!',
                  color: '#ef4444',
                  vy: -3,
                  alpha: 1.0
                });

                // Spark red blood drops
                for (let rx = 0; rx < 20; rx++) {
                  state.particles.push({
                    x: px + pw / 2,
                    y: py + ph / 2,
                    vx: (Math.random() - 0.5) * 9 - state.gameSpeed * 0.4,
                    vy: (Math.random() - 0.5) * 9,
                    color: '#f43f5e',
                    size: Math.random() * 5 + 1.5,
                    alpha: 1.0,
                    decay: 0.05
                  });
                }

                // Check death conditions
                if (player.hp <= 0) {
                  state.gameOver = true;
                  setGameOver(true);

                  // Update the local storage persistent high scores if beaten!
                  if (state.score > highScore) {
                    setHighScore(state.score);
                    localStorage.setItem('samurai_run_highscore', state.score.toString());
                  }

                  // Feed xp reward backwards
                  onGainXp(20);
                }
              }
            }
          }
        }
      }

      // ----------------------------------------------------
      // PARTICLES ENGINE RENDERER GRID
      // ----------------------------------------------------
      for (let pIdx = state.particles.length - 1; pIdx >= 0; pIdx--) {
        const p = state.particles[pIdx];
        p.x += p.vx;
        p.y += p.vy;

        if (p.gravity) {
          p.vy += p.gravity;
        }

        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          state.particles.splice(pIdx, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      }

      // ----------------------------------------------------
      // FLOATING ACTIONS NOTIFICATIONS RENDERER
      // ----------------------------------------------------
      for (let fIdx = state.floatTexts.length - 1; fIdx >= 0; fIdx--) {
        const ft = state.floatTexts[fIdx];
        ft.y += ft.vy;
        ft.alpha -= 0.02;

        if (ft.alpha <= 0) {
          state.floatTexts.splice(fIdx, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore(); // restores shake translational context

      // Trigger standard frame loop request
      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [playing, gameOver, activeSkin, unlockedDoubleJump, magnetTier, activeReviveShield, shieldTier, highScore]);

  return (
    <div className="w-full bg-slate-950 border border-yellow-400/20 rounded-3xl overflow-hidden shadow-2xl relative select-none">
      
      {/* Top HUD Stats Indicators list bar */}
      <div className="bg-slate-900/90 border-b border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 relative">
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-yellow-400 text-slate-950 px-3.5 py-1.5 rounded-full font-black text-xs uppercase tracking-wider animate-pulse flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            <span>КИБЕР САМУРАЙ</span>
          </div>

          {/* Core Player Level Display */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-indigo-500/35">
            <span className="text-[10px] text-cyan-400 font-extrabold uppercase">ЦОЛ:</span>
            <span className="font-mono font-black text-[#00ff88] text-xs">LV. {fighterLevel}</span>
            <div className="w-12 h-2 rounded bg-slate-850 overflow-hidden relative ml-1">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300" 
                style={{ width: `${fighterXp}%` }}
              />
            </div>
            <span className="text-[8px] text-slate-400 font-mono">{fighterXp}%</span>
          </div>

          {/* Core Player Lives (Shield icons display) */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-950/70 border border-white/5">
            <span className="text-[10px] text-slate-400 font-extrabold mr-1 uppercase">АМЬ:</span>
            {playing && !gameOver ? (
              Array.from({ length: Math.max(0, loopRef.current.player.hp) }).map((_, li) => (
                <Heart key={li} className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse mt-0.5" />
              ))
            ) : (
              <span className="text-slate-500 text-xs font-bold font-mono">---</span>
            )}
          </div>

          {/* Score tracker meter */}
          <div className="text-left font-mono">
            <span className="text-[9px] text-slate-400 block uppercase leading-none font-sans font-black">ТУЛААНЫ ОНОО</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              {playing ? Math.floor(score) : 0} <span className="text-[10px] text-slate-500 font-sans">ОНОО</span>
            </span>
          </div>
        </div>

        {/* Local Storage persistence records */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 block uppercase font-black leading-none">Рекорд</span>
            <span className="text-xs font-black text-yellow-400 font-mono">🏆 {highScore} м</span>
          </div>

          {/* Sound click control */}
          <button 
            type="button"
            onClick={() => setMute(!mute)} 
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Дуу хаах/нээх"
          >
            {mute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Primary Video Game Frame Canvas viewport container */}
      <div className="relative w-full overflow-hidden bg-slate-950 flex justify-center items-center">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={400} 
          className="w-full max-w-[800px] h-auto block aspect-[80/40] bg-slate-900" 
        />

        {/* 1. INITIAL GREETING SCREEN OVERLAYS */}
        {!playing && (
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-400 via-indigo-600 to-rose-500 flex items-center justify-center text-3xl shadow-xl border border-white/10 transform hover:scale-105 transition-all animate-bounce">
              ⚔️
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xl md:text-2xl font-black bg-gradient-to-r from-cyan-300 via-yellow-400 to-rose-400 bg-clip-text text-transparent uppercase tracking-wider">
                АСРАЛТ: КИБЕР САМУРАЙ ⚔️🏃‍♂️
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-semibold">
                Утас ба компьютерын hoyulan дээр хоцрогдолгүй, асар хурдтай тоглоход тохиромжтой шинэ үеийн Кибер сэлэмт саадтай гүйгч тоглоом!
              </p>
            </div>

            {/* Quick control panel cards */}
            <div className="bg-slate-900/60 border border-white/5 p-3.5 rounded-2xl max-w-sm w-full grid grid-cols-2 gap-3 text-left">
              <div className="space-y-1">
                <span className="text-[10px] text-yellow-400 font-extrabold uppercase tracking-wider block">💻 Компьютерт:</span>
                <span className="text-[10px] text-slate-400 block font-bold">Space / Up - ҮСҮРЭХ</span>
                <span className="text-[10px] text-slate-400 block font-bold">S / Down - ХЭВТЭХ</span>
                <span className="text-[10px] text-slate-400 block font-bold">J / Enter - ЦАВЧИХ (🗡️)</span>
              </div>
              <div className="border-l border-white/5 pl-3 space-y-1">
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider block">📱 Гар утсанд:</span>
                <span className="text-[10px] text-slate-400 block font-bold">Доох том товчнууд:</span>
                <span className="text-[10px] text-slate-500 block leading-tight">Баруун талын "ЦАВЧИХ" товчоор дайсны нисдэг дроныг сэлмээр зад цохиж устгаарай!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartGame}
              className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-500 hover:from-cyan-300 hover:to-rose-400 text-slate-950 font-black text-xs px-10 py-3.5 rounded-2xl transition-all duration-300 transform active:scale-95 shadow-xl uppercase tracking-widest flex items-center gap-2 cursor-pointer animate-pulse"
            >
              <Swords className="w-4 h-4 text-slate-950 animate-bounce" />
              <span>ГУЙЖ ТУЛАЛДАХ ⚔️🔥</span>
            </button>
          </div>
        )}

        {/* 2. GAME OVER OVERLAY SCREEN */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-transparent border-2 border-rose-500 flex items-center justify-center text-4xl animate-pulse">
              ☠️
            </div>
            <div className="space-y-1">
              <h4 className="text-xl md:text-2xl font-black text-rose-500 uppercase tracking-widest">ТУЛААН ДУУСЛАА</h4>
              <p className="text-xs text-slate-400">Чи амжилттай зугтсаар {Math.floor(score)} оноо цуглуулж дээд амжилт тогтоолоо!</p>
              <div className="bg-slate-900 inline-block px-4 py-1.5 border border-white/5 rounded-xl text-neutral-400 font-bold text-[10px] font-mono leading-none mt-2">
                Сагсны рекорд: {score > highScore ? 'Шинэ рекорд 🌟' : `Рекорд: ${highScore} м`}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartGame}
              className="bg-red-500 hover:bg-red-400 text-white font-black text-xs px-8 py-3.5 rounded-2xl transition-all duration-200 transform active:scale-95 shadow-lg shadow-red-950/30 uppercase tracking-widest flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ДАХИН ЭХЛЭХ 🔄</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. PERMANENT POWER UPGRADES SHOP (Coin exchange) */}
      {playing && !gameOver && (
        <div className="bg-slate-900 border-t border-white/5 p-4 space-y-4 relative z-20">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs text-slate-300 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-yellow-400" />
              <span>Зэвсэг & Чадварын Танхим</span>
            </span>
            <span className="text-[11px] text-amber-300 font-black bg-amber-950/35 border border-amber-900/35 px-3 py-1 rounded-full flex items-center gap-1 font-mono">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              {coins} 🪙
            </span>
          </div>

          {/* Core Upgrades */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Upgrade maximum shields capacities */}
            <button
              type="button"
              onClick={buyShieldCapacity}
              disabled={coins < (shieldTier * 30 + 30) || shieldTier >= 5}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                coins >= (shieldTier * 30 + 30) && shieldTier < 5
                  ? 'bg-slate-950 border-rose-500/30 hover:border-rose-500 hover:bg-slate-950/80 text-white'
                  : 'bg-slate-950/20 border-white/5 text-slate-600 opacity-50'
              }`}
            >
              <div>
                <span className="text-[11px] font-black block text-rose-400 uppercase leading-tight">Зүрх Нэмэх</span>
                <span className="text-[9px] text-slate-400 block leading-tight mt-0.5">Суурь амь +1 өсгөх (Max 5)</span>
              </div>
              <span className="text-[9px] font-mono text-slate-300 mt-2 block font-black">
                {shieldTier >= 5 ? 'MAX TIER' : `ҮНЭ: ${shieldTier * 30 + 30} 🪙`}
              </span>
            </button>

            {/* Unlock Double Jumping feature */}
            <button
              type="button"
              onClick={buyDoubleJump}
              disabled={coins < 80 || unlockedDoubleJump}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                coins >= 80 && !unlockedDoubleJump
                  ? 'bg-slate-950 border-yellow-500/30 hover:border-yellow-500 hover:bg-slate-950/80 text-white'
                  : 'bg-slate-950/20 border-white/5 text-slate-600 opacity-50'
              }`}
            >
              <div>
                <span className="text-[11px] font-black block text-yellow-400 uppercase leading-tight">Үсрэлтийн Чадвар</span>
                <span className="text-[9px] text-slate-400 block leading-tight mt-0.5">Агаарт 2 дахь удаа үсрэх</span>
              </div>
              <span className="text-[9px] font-mono text-slate-300 mt-2 block font-black">
                {unlockedDoubleJump ? 'ИДЭВХЖИВ ✅' : 'ҮНЭ: 80 🪙'}
              </span>
            </button>

            {/* Upgrade Magnetic attraction coil */}
            <button
              type="button"
              onClick={buyMagnetPower}
              disabled={coins < (magnetTier + 1) * 45 || magnetTier >= 3}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                coins >= (magnetTier + 1) * 45 && magnetTier < 3
                  ? 'bg-slate-950 border-cyan-500/30 hover:border-cyan-500 hover:bg-slate-950/80 text-white'
                  : 'bg-slate-950/20 border-white/5 text-slate-600 opacity-50'
              }`}
            >
              <div>
                <span className="text-[11px] font-black block text-cyan-400 uppercase leading-tight">Алтанд Соронз</span>
                <span className="text-[9px] text-slate-400 block leading-tight mt-0.5">Зоосыг алсаас татна</span>
              </div>
              <span className="text-[9px] font-mono text-slate-300 mt-2 block font-black">
                {magnetTier >= 3 ? 'MAX TIER' : `ҮНЭ: ${(magnetTier + 1) * 45} 🪙`}
              </span>
            </button>

            {/* Revive bubble shield cover */}
            <button
              type="button"
              onClick={buyReviveShield}
              disabled={coins < 25 || activeReviveShield}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                coins >= 25 && !activeReviveShield
                  ? 'bg-slate-950 border-emerald-500/30 hover:border-emerald-500 hover:bg-slate-950/80 text-white'
                  : 'bg-slate-950/20 border-white/5 text-slate-600 opacity-50'
              }`}
            >
              <div>
                <span className="text-[11px] font-black block text-emerald-400 uppercase leading-tight">Хамгаалалтын Бамбай</span>
                <span className="text-[9px] text-slate-400 block leading-tight mt-0.5">Нэг амь эрсдэхийг шингээнэ</span>
              </div>
              <span className="text-[9px] font-mono text-slate-300 mt-2 block font-black">
                {activeReviveShield ? 'ИДЭВХТЭЙ ✅' : 'ҮНЭ: 25 🪙'}
              </span>
            </button>
          </div>

          {/* 1. WEAPONS DEPOT (сэвт илдүүд) */}
          <div className="flex flex-col space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">🗡️ Сургуулийн ба Цахилгаан сэлмүүд:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'standard', name: 'ТӨМӨР КАТАНА', cost: 0, desc: 'Үндсэн ба энгийн илд' },
                { id: 'cyan', name: 'ГЭРЛЭН СЭЛЭМ', cost: 100, desc: 'Урт цасах радиустай сэлэм' },
                { id: 'amber', name: 'ЛУУГИЙН ИЛД', cost: 250, desc: 'Том калибрт галт илд' },
                { id: 'rainbow', name: 'ХЯЗГААРГҮЙ ИЛД', cost: 500, desc: 'Зоос сорох & маш урт тусгал' }
              ].map(weapon => {
                const isUnlocked = unlockedWeapons.includes(weapon.id);
                const isEquipped = activeSkin === weapon.id;
                const canAfford = coins >= weapon.cost;

                return (
                  <button
                    key={weapon.id}
                    type="button"
                    onClick={() => tryEquipWeapon(weapon.id as any)}
                    className={`p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isEquipped 
                        ? 'bg-indigo-600 text-white border-white' 
                        : isUnlocked 
                          ? 'bg-slate-950 text-slate-300 border-white/10 hover:bg-slate-900' 
                          : canAfford 
                            ? 'bg-slate-950/60 text-slate-400 border-yellow-500/20 hover:border-yellow-500' 
                            : 'bg-slate-950/20 border-white/5 text-slate-600 opacity-50'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold block">{weapon.name}</span>
                      <span className="text-[8px] text-slate-450 text-slate-400 block leading-tight mt-0.5">{weapon.desc}</span>
                    </div>
                    <span className="text-[8px] font-mono mt-1 block text-right font-black">
                      {isEquipped ? 'ЭРҮҮЛЭВ ⚔️' : isUnlocked ? 'СОНГОХ' : `АВБАР: ${weapon.cost} 🪙`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. MARTIAL ARTS STYLE LABS */}
          <div className="flex flex-col space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider">🥋 Шинэ Тулааны Урлагууд:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'wind', name: '🌀 САЛХИНЫ УРСГАЛ', cost: 0, desc: 'Үндсэн ба уян хатан' },
                { id: 'lightning', name: '⚡ АЯНГЫН ХУРД', cost: 150, desc: 'Хурдан цавчиж, соронзон нэмнэ' },
                { id: 'fire', name: '🔥 ГАЛТ ГАЛЗУУРАЛ', cost: 300, desc: 'Алах тутамд +1.5х XP өгнө' },
                { id: 'shadow', name: '👥 СҮҮДЭР АЛХАМ', cost: 450, desc: '2 үсрэлт үнэгүй өгөх увдис сүүдэр' }
              ].map(style => {
                const isUnlocked = unlockedStyles.includes(style.id);
                const isEquipped = activeStyle === style.id;
                const canAfford = coins >= style.cost;

                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => tryEquipStyle(style.id as any)}
                    className={`p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isEquipped 
                        ? 'bg-emerald-600 text-white border-white' 
                        : isUnlocked 
                          ? 'bg-slate-950 text-slate-300 border-white/10 hover:bg-slate-900' 
                          : canAfford 
                            ? 'bg-slate-950/60 text-slate-400 border-cyan-500/20 hover:border-cyan-500' 
                            : 'bg-slate-950/20 border-white/5 text-slate-600 opacity-50'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold block">{style.name}</span>
                      <span className="text-[8px] text-slate-450 text-slate-400 block leading-tight mt-0.5">{style.desc}</span>
                    </div>
                    <span className="text-[8px] font-mono mt-1 block text-right font-black">
                      {isEquipped ? 'ИДЭВХИТ ✅' : isUnlocked ? 'СОНГОХ' : `АВБАР: ${style.cost} 🪙`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. EXPLICIT GIANT MOBILE ACTION D-PAD TAP ZONES */}
      {playing && !gameOver && (
        <div className="bg-slate-900 border-t border-white/10 p-4 grid grid-cols-3 gap-3 select-none touch-none relative z-20">
          
          {/* JUMP ACTION ZONE */}
          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); triggerJumpAction(); setBtnStates(prev => ({ ...prev, Jump: true })); }}
            onTouchEnd={(e) => { e.preventDefault(); setBtnStates(prev => ({ ...prev, Jump: false })); }}
            onMouseDown={(e) => { e.preventDefault(); triggerJumpAction(); setBtnStates(prev => ({ ...prev, Jump: true })); }}
            onMouseUp={(e) => { e.preventDefault(); setBtnStates(prev => ({ ...prev, Jump: false })); }}
            onMouseLeave={() => setBtnStates(prev => ({ ...prev, Jump: false }))}
            className={`h-16 rounded-2xl flex flex-col items-center justify-center border transition-all transform duration-150 cursor-pointer ${
              btnStates.Jump 
                ? 'bg-cyan-500 text-slate-950 border-white scale-95 shadow-lg shadow-cyan-500/20' 
                : 'bg-slate-950 text-slate-300 border-white/5'
            }`}
          >
            <span className="text-sm font-extrabold uppercase tracking-wider block font-sans">⬆️ ҮСРЭХ</span>
            <span className="text-[8px] text-slate-500 font-bold block">(Space / Up)</span>
          </button>

          {/* CROUCH SLIDE ZONE */}
          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); triggerSlideAction(true); setBtnStates(prev => ({ ...prev, Slide: true })); }}
            onTouchEnd={(e) => { e.preventDefault(); triggerSlideAction(false); setBtnStates(prev => ({ ...prev, Slide: false })); }}
            onMouseDown={(e) => { e.preventDefault(); triggerSlideAction(true); setBtnStates(prev => ({ ...prev, Slide: true })); }}
            onMouseUp={(e) => { e.preventDefault(); triggerSlideAction(false); setBtnStates(prev => ({ ...prev, Slide: false })); }}
            onMouseLeave={() => { triggerSlideAction(false); setBtnStates(prev => ({ ...prev, Slide: false })); }}
            className={`h-16 rounded-2xl flex flex-col items-center justify-center border transition-all transform duration-150 cursor-pointer ${
              btnStates.Slide 
                ? 'bg-rose-500 text-white border-white scale-95 shadow-lg shadow-rose-500/20' 
                : 'bg-slate-950 text-slate-300 border-white/5'
            }`}
          >
            <span className="text-sm font-extrabold uppercase tracking-wider block font-sans">⬇️ ХЭВТЭХ</span>
            <span className="text-[8px] text-slate-500 font-bold block">(S / Down)</span>
          </button>

          {/* ATTACK SWORD SLASH ZONE */}
          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); triggerSlashAction(); setBtnStates(prev => ({ ...prev, Slash: true })); }}
            onTouchEnd={(e) => { e.preventDefault(); setBtnStates(prev => ({ ...prev, Slash: false })); }}
            onMouseDown={(e) => { e.preventDefault(); triggerSlashAction(); setBtnStates(prev => ({ ...prev, Slash: true })); }}
            onMouseUp={(e) => { e.preventDefault(); setBtnStates(prev => ({ ...prev, Slash: false })); }}
            onMouseLeave={() => setBtnStates(prev => ({ ...prev, Slash: false }))}
            className={`h-16 rounded-2xl flex flex-col items-center justify-center border transition-all transform duration-150 cursor-pointer ${
              btnStates.Slash 
                ? 'bg-yellow-500 text-slate-950 border-white scale-95 shadow-md shadow-yellow-500/20 font-black' 
                : 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border-yellow-300'
            }`}
          >
            <span className="text-sm font-black uppercase tracking-widest block flex items-center justify-center gap-1 font-sans">
              ⚔️ ЦАВЧИХ
            </span>
            <span className="text-[8px] text-slate-705 text-slate-700 font-black block font-sans">(J / Enter)</span>
          </button>

        </div>
      )}

    </div>
  );
}
