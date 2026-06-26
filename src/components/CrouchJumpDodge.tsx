import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, Shield, Heart, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Play, ArrowLeft, Award
} from 'lucide-react';

// Retro-style Web Audio synth for the endless runner
class DodgeSynth {
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

  playJump() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playCrouch() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playCoin() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.005, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playHit() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  playStart() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [330, 440, 550, 660];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.1, this.ctx!.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx!.currentTime + idx * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.08);
      osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.15);
    });
  }
}

const synth = new DodgeSynth();

interface Obstacle {
  id: number;
  x: number; // canvas x (e.g. 800 down to -50)
  width: number;
  height: number;
  type: 'low' | 'high'; // 'low' requires JUMP to clear, 'high' requires CROUCH to clear
  color: string;
  passed: boolean;
}

interface Coin {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

interface ScoreFeed {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

interface CrouchJumpDodgeProps {
  onGainXp: (amount: number) => void;
}

export default function CrouchJumpDodge({ onGainXp }: CrouchJumpDodgeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // High score systems
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('runner_highscore');
    return saved ? parseInt(saved, 10) : 1200;
  });

  const [mute, setMute] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Live indicators synced to the React state for HUD
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combatSparks, setCombatSparks] = useState(0); // Coins/Sparks collected
  const [speedLevel, setSpeedLevel] = useState(1);

  // Player action state
  const [playerAction, setPlayerAction] = useState<'run' | 'jump' | 'crouch'>('run');

  // Input states (for styling key indicator buttons)
  const [keyStates, setKeyStates] = useState({ Jump: false, Crouch: false });

  // Game gameplay values kept synchronized on 60fps raf engine loops
  const engineRef = useRef({
    playing: false,
    gameOver: false,
    score: 0,
    lives: 3,
    coinsCollected: 0,
    speed: 7.5,
    maxSpeed: 17.5,
    distanceRun: 0,

    // Player physical representation values
    player: {
      y: 0, // 0 is ground plane touch
      vy: 0,
      gravity: 0.85,
      jumpForce: -13.0,
      width: 45,
      height: 70, // regular height
      crouchHeight: 35, // crouched height
      isCrouching: false,
      isJumping: false,
      groundY: 280, // ground target Y pixel coordinates
    },

    spawnTimer: 0,
    obstacles: [] as Obstacle[],
    coins: [] as Coin[],
    particles: [] as Particle[],
    scoreFeeds: [] as ScoreFeed[],
    nextObstacleId: 1,
    nextCoinId: 1,
    roadOffset: 0,
  });

  // Sync state selectors on change
  useEffect(() => {
    engineRef.current.playing = playing;
    engineRef.current.gameOver = gameOver;
    engineRef.current.score = score;
    engineRef.current.lives = lives;
  }, [playing, gameOver, score, lives]);

  useEffect(() => {
    synth.muted = mute;
  }, [mute]);

  // Jump helper function
  const triggerJump = () => {
    const engine = engineRef.current;
    if (!engine.playing || engine.gameOver) return;
    if (engine.player.isCrouching) return; // cannot jump while crouching

    if (!engine.player.isJumping) {
      engine.player.vy = engine.player.jumpForce;
      engine.player.isJumping = true;
      setPlayerAction('jump');
      synth.playJump();
    }
  };

  // Crouch helper function
  const triggerCrouch = (active: boolean) => {
    const engine = engineRef.current;
    if (!engine.playing || engine.gameOver) return;

    if (active) {
      if (engine.player.isJumping) return; // cannot crouch mid-air
      engine.player.isCrouching = true;
      setPlayerAction('crouch');
      synth.playCrouch();
    } else {
      engine.player.isCrouching = false;
      if (playerAction === 'crouch') {
        setPlayerAction('run');
      }
    }
  };

  // Keep up-to-date trigger functions in a ref so key listeners are initialized only once
  const triggersRef = useRef({ triggerJump, triggerCrouch });
  useEffect(() => {
    triggersRef.current = { triggerJump, triggerCrouch };
  }, [triggerJump, triggerCrouch]);

  // Keyboard monitors
  useEffect(() => {
    if (!playing || gameOver) return;

    const isJumpKey = (e: KeyboardEvent) => {
      const k = (e.key || '').toLowerCase();
      const c = (e.code || '').toLowerCase();
      return (
        ['space', 'arrowup', 'w', 'ц', ' '].includes(k) ||
        ['space', 'arrowup', 'keyw'].includes(c)
      );
    };

    const isCrouchKey = (e: KeyboardEvent) => {
      const k = (e.key || '').toLowerCase();
      const c = (e.code || '').toLowerCase();
      return (
        ['arrowdown', 's', 'ы'].includes(k) ||
        ['arrowdown', 'keys'].includes(c)
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isJumpKey(e)) {
        e.preventDefault();
        setKeyStates(prev => ({ ...prev, Jump: true }));
        triggersRef.current.triggerJump();
      }
      if (isCrouchKey(e)) {
        e.preventDefault();
        setKeyStates(prev => ({ ...prev, Crouch: true }));
        triggersRef.current.triggerCrouch(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isJumpKey(e)) {
        e.preventDefault();
        setKeyStates(prev => ({ ...prev, Jump: false }));
      }
      if (isCrouchKey(e)) {
        e.preventDefault();
        setKeyStates(prev => ({ ...prev, Crouch: false }));
        triggersRef.current.triggerCrouch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    
    // Auto focus the canvas to capture input immediately
    if (canvasRef.current) {
      canvasRef.current.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playing, gameOver]);

  const startNewGame = () => {
    // Reset stats
    setScore(0);
    setLives(3);
    setCombatSparks(0);
    setSpeedLevel(1);
    setGameOver(false);
    setPlaying(true);
    setPlayerAction('run');

    const engine = engineRef.current;
    engine.playing = true;
    engine.gameOver = false;
    engine.score = 0;
    engine.lives = 3;
    engine.coinsCollected = 0;
    engine.speed = 7.5;
    engine.distanceRun = 0;

    engine.player.y = 0;
    engine.player.vy = 0;
    engine.player.isJumping = false;
    engine.player.isCrouching = false;

    engine.obstacles = [];
    engine.coins = [];
    engine.particles = [];
    engine.scoreFeeds = [];
    engine.spawnTimer = 0;

    synth.playStart();

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.focus();
      }
    }, 50);
  };

  // 60FPS loop processing and Canvas animations
  useEffect(() => {
    let animId: number;

    const updateLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const engine = engineRef.current;

      // 1. CLEAR SPACE WITH RETRO NEON ARCADE BACKDROP
      // Linear gradient spanning upwards
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0c0a1c'); // Midnight blue
      skyGrad.addColorStop(0.6, '#180f33'); // Ambient violet
      skyGrad.addColorStop(1, '#05030d'); // Jet black roadbed
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // SUNRISE SUN BURST (Retro Synthwave Style)
      ctx.save();
      const sunGrad = ctx.createLinearGradient(0, 40, 0, 200);
      sunGrad.addColorStop(0, '#ff007f'); // Neon pink center
      sunGrad.addColorStop(1, '#ffaa00'); // Sunset gold
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 190, 85, Math.PI, 0); // half circle on horizon
      ctx.fill();
      
      // Horizontal synthwave lines cutting the sun
      ctx.fillStyle = '#0c0a1c';
      for (let hY = 110; hY < 192; hY += 9) {
        const thickness = Math.max(1, (hY - 110) / 10);
        ctx.fillRect(canvas.width / 2 - 100, hY, 200, thickness);
      }
      ctx.restore();

      // HORIZON MOUNTAIN SILHOUETTES
      ctx.fillStyle = '#100a26';
      ctx.beginPath();
      ctx.moveTo(0, 200);
      ctx.lineTo(80, 160);
      ctx.lineTo(160, 190);
      ctx.lineTo(240, 150);
      ctx.lineTo(310, 185);
      ctx.lineTo(canvas.width / 2 - 120, 200);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(canvas.width, 200);
      ctx.lineTo(canvas.width - 90, 155);
      ctx.lineTo(canvas.width - 170, 180);
      ctx.lineTo(canvas.width - 250, 140);
      ctx.lineTo(canvas.width / 2 + 120, 200);
      ctx.fill();

      // DRAW SUBWAY TUNNEL WALLS & BACKGROUND
      ctx.fillStyle = '#05030f'; // deep tunnel black block
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const groundLineY = 200;

      // Tunnel neon arch lines
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.15)'; // warm pink tunnel arch shadows
      ctx.lineWidth = 2;
      for (let archX = 0; archX < canvas.width; archX += 160) {
        ctx.beginPath();
        ctx.ellipse(archX, groundLineY + 20, 160, 240, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
      }

      // Draw horizontal moving wood ties (sleepers) for animated railway tracks
      engine.roadOffset = (engine.roadOffset - engine.speed) % 40;
      const sleeperOffset = engine.roadOffset < 0 ? engine.roadOffset + 40 : engine.roadOffset;
      ctx.fillStyle = '#3e2723'; // brown wooden railway ties
      
      for (let ty = groundLineY + sleeperOffset; ty < canvas.height; ty += 40) {
        // compute tie width based on depth perspective
        const scale = (ty - groundLineY) / (canvas.height - groundLineY);
        const tieW = 20 + scale * 340;
        const tieH = 3 + scale * 10;
        const tieX = canvas.width / 2 - tieW / 2;
        ctx.fillRect(tieX, ty, tieW, tieH);
      }

      // Draw perspective steel rails
      ctx.strokeStyle = '#90a4ae'; // metallic steel color
      ctx.lineWidth = 4;
      ctx.beginPath();
      // left rail
      ctx.moveTo(canvas.width / 2 - 12, groundLineY);
      ctx.lineTo(canvas.width / 2 - 180, canvas.height);
      // right rail
      ctx.moveTo(canvas.width / 2 + 12, groundLineY);
      ctx.lineTo(canvas.width / 2 + 180, canvas.height);
      ctx.stroke();

      // Side bright yellow security lines
      ctx.strokeStyle = '#facc15'; // subway safety yellow bounds
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 30, groundLineY);
      ctx.lineTo(canvas.width / 2 - 320, canvas.height);
      ctx.moveTo(canvas.width / 2 + 30, groundLineY);
      ctx.lineTo(canvas.width / 2 + 320, canvas.height);
      ctx.stroke();

      // 2. TIMESTEP CALCULATIONS (Run if playing and active)
      if (engine.playing && !engine.gameOver) {
        // Increment run counters
        engine.distanceRun += 0.1;
        
        // Speed up progressively
        engine.speed = Math.min(engine.maxSpeed, 7.5 + (engine.distanceRun * 0.08));
        setSpeedLevel(Math.floor(engine.speed / 2.5));

        // Periodically earn small survival points
        if (Math.round(engine.distanceRun * 10) % 20 === 0) {
          const tickPoints = 5;
          setScore(s => s + tickPoints);
          engine.score += tickPoints;
        }

        // PLAYER Physics logic
        const p = engine.player;
        if (p.isJumping) {
          p.y += p.vy;
          p.vy += p.gravity;

          // Check landing threshold
          if (p.y >= 0) {
            p.y = 0;
            p.vy = 0;
            p.isJumping = false;
            setPlayerAction('run');
          }
        }

        // 3. OBSTACLES SPANNING CONTROLLER
        engine.spawnTimer -= 16.67;
        if (engine.spawnTimer <= 0) {
          // Time to spawn! Randomly spawn a LOW obstacle or HIGH obstacle
          const obstacleType = Math.random() < 0.53 ? 'low' : 'high';
          const isLow = obstacleType === 'low';

          const obstacleColor = isLow ? '#ff0055' : '#00ffff'; // Red spike or Cyan flying forcefield
          const obsHeight = isLow ? 46 : 40;
          const obsWidth = isLow ? 32 : 50;

          engine.obstacles.push({
            id: engine.nextObstacleId++,
            x: canvas.width + 50,
            width: obsWidth,
            height: obsHeight,
            type: obstacleType,
            color: obstacleColor,
            passed: false,
          });

          // Also spawn some floating points stars ahead of or behind the obstacle
          const coinYCoord = isLow ? 175 : 290; // High coin or low coin depending on dodge requirements!
          for (let coinIdx = 0; coinIdx < 3; coinIdx++) {
            engine.coins.push({
              id: engine.nextCoinId++,
              x: canvas.width + 120 + coinIdx * 45,
              y: coinYCoord,
              radius: 7,
              collected: false,
            });
          }

          // Random spawn interval based on current speed
          engine.spawnTimer = Math.max(750, 2100 - (engine.speed * 85) + Math.random() * 500);
        }

        // UPDATE OBSTACLES
        for (let i = engine.obstacles.length - 1; i >= 0; i--) {
          const obs = engine.obstacles[i];
          obs.x -= engine.speed;

          // Remove off-screen obstacles
          if (obs.x < -80) {
            engine.obstacles.splice(i, 1);
            continue;
          }

          // Pass reward triggers
          if (obs.x < 110 && !obs.passed) {
            obs.passed = true;
            // Reward +50 for awesome dodges!
            const bonus = 50;
            setScore(s => s + bonus);
            engine.score += bonus;

            engine.scoreFeeds.push({
              id: Math.random(),
              x: 150,
              y: 200,
              text: '⚡ Бултлаа! +50',
              color: '#10b981',
              alpha: 1
            });
          }

          // COLLISION DETECTION TRIGGER (Bounding boxes match)
          const playerAbsoluteY = p.groundY + p.y; // note physical ground is 280, jump makes y negative
          const playerTop = playerAbsoluteY - (p.isCrouching ? p.crouchHeight : p.height);
          const playerBottom = p.groundY + p.y;
          const playerLeft = 110;
          const playerRight = 110 + p.width;

          // Compute obstacle box limits
          let obsTop = 0;
          let obsBottom = 0;

          if (obs.type === 'low') {
            // Low spike sits on the ground
            obsTop = p.groundY - obs.height;
            obsBottom = p.groundY;
          } else {
            // High beam floating in mid-air (blocks all the way to ceiling, crouch required to pass under)
            obsTop = 0;
            obsBottom = p.groundY - 80 + obs.height;
          }

          const obsLeft = obs.x;
          const obsRight = obs.x + obs.width;

          // Check overlap
          const overlapX = playerRight > obsLeft && playerLeft < obsRight;
          const overlapY = playerBottom > obsTop && playerTop < obsBottom;

          if (overlapX && overlapY) {
            // CRASH HIT COLLISION EVENT TRIGGERED!
            engine.obstacles.splice(i, 1); // remove obstacle so we don't hit it repeatedly
            synth.playHit();

            // Deduct lives
            setLives(l => {
              const nextLives = l - 1;
              engine.lives = nextLives;
              if (nextLives <= 0) {
                // Trigger Game Over
                setGameOver(true);
                setPlaying(false);
                engine.playing = false;
                engine.gameOver = true;

                // Check final high score comparison
                const finalSc = engine.score;
                if (finalSc > highScore) {
                  setHighScore(finalSc);
                  localStorage.setItem('runner_highscore', finalSc.toString());
                  onGainXp(65); // high rewards
                } else {
                  onGainXp(15);
                }
              }
              return nextLives;
            });

            // Flash Screen / Spark Explosion particles
            for (let sIdx = 0; sIdx < 15; sIdx++) {
              engine.particles.push({
                x: 130,
                y: playerAbsoluteY - 30,
                vx: -3 + Math.random() * 6,
                vy: -6 + Math.random() * 8,
                size: Math.random() * 4 + 2,
                color: '#ef4444',
                alpha: 1,
              });
            }

            // Hurt visual float
            engine.scoreFeeds.push({
              id: Math.random(),
              x: 130,
              y: playerAbsoluteY - 60,
              text: '❌ МӨРГӨЛДЛӨӨ! ❤️-1',
              color: '#ef4444',
              alpha: 1.0
            });
          }
        }

        // UPDATE COINS/Floating power SPARK stars
        for (let j = engine.coins.length - 1; j >= 0; j--) {
          const coin = engine.coins[j];
          coin.x -= engine.speed;

          if (coin.x < -30) {
            engine.coins.splice(j, 1);
            continue;
          }

          // Check coin collection collisions
          const playerAbsoluteY = p.groundY + p.y;
          const playerTop = playerAbsoluteY - (p.isCrouching ? p.crouchHeight : p.height);
          const playerBottom = p.groundY + p.y;
          const playerLeft = 110;
          const playerRight = 110 + p.width;

          const coinInsideX = coin.x >= playerLeft && coin.x <= playerRight;
          const coinInsideY = coin.y >= playerTop && coin.y <= playerBottom;

          if (coinInsideX && coinInsideY && !coin.collected) {
            coin.collected = true;
            synth.playCoin();

            setCombatSparks(prev => prev + 1);
            setScore(s => s + 25);
            engine.score += 25;

            // Remove collected coin
            engine.coins.splice(j, 1);

            // Spawn success particles
            for (let cIdx = 0; cIdx < 8; cIdx++) {
              engine.particles.push({
                x: coin.x,
                y: coin.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 3 + 1,
                color: '#fbbf24',
                alpha: 1.0,
              });
            }
            continue;
          }
        }
      }

      // UPDATE PARTICLES
      for (let i = engine.particles.length - 1; i >= 0; i--) {
        const pt = engine.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.035;

        // Draw particle
        if (pt.alpha <= 0) {
          engine.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // UPDATE SCORE FEED FLOATS
      for (let i = engine.scoreFeeds.length - 1; i >= 0; i--) {
        const f = engine.scoreFeeds[i];
        f.y -= 0.6;
        f.alpha -= 0.02;

        if (f.alpha <= 0) {
          engine.scoreFeeds.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = f.color;
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
      }

      // DRAW COINS
      for (const coin of engine.coins) {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fbbf24';
        
        // Shiny rotating coin illusion
        const radiusScale = 1 + Math.sin(Date.now() * 0.01) * 0.25;

        ctx.fillStyle = '#fbbf24'; // Golden core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(coin.x, coin.y, coin.radius * radiusScale, coin.radius, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // DRAW OBSTACLES
      for (const obs of engine.obstacles) {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = obs.color;

        if (obs.type === 'low') {
          // SUBWAY RAILWAY BARRIER
          const baseHeight = engine.player.groundY;
          ctx.fillStyle = '#f97316'; // orange poles
          ctx.fillRect(obs.x, baseHeight - obs.height, 6, obs.height);
          ctx.fillRect(obs.x + obs.width - 6, baseHeight - obs.height, 6, obs.height);
          
          // Cross board with stripes
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(obs.x, baseHeight - obs.height + 8, obs.width, 16);
          
          ctx.fillStyle = '#f97316'; // orange stripes
          for (let sx = obs.x + 4; sx < obs.x + obs.width; sx += 18) {
            ctx.beginPath();
            ctx.moveTo(sx, baseHeight - obs.height + 8);
            ctx.lineTo(sx + 8, baseHeight - obs.height + 8);
            ctx.lineTo(sx, baseHeight - obs.height + 24);
            ctx.lineTo(sx - 8, baseHeight - obs.height + 24);
            ctx.closePath();
            ctx.fill();
          }

          // Blinking hazard alert light on top of barrier
          const flash = Math.floor(Date.now() / 250) % 2 === 0;
          ctx.fillStyle = flash ? '#ef4444' : '#7f1d1d';
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, baseHeight - obs.height, 6, 0, Math.PI * 2);
          ctx.fill();
          
          if (flash) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ef4444';
            ctx.fillStyle = '#fca5a5';
            ctx.beginPath();
            ctx.arc(obs.x + obs.width / 2, baseHeight - obs.height, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        } else {
          // HIGH SUBWAY INCOMING TRAIN - Crouch/Slide to pass under!
          const beamY = engine.player.groundY - 80;
          
          // Train Front Cabin Face
          ctx.fillStyle = '#1e3a8a'; // Deep blue train metallic body
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(obs.x, beamY, obs.width, obs.height, [8, 8, 2, 2]);
          ctx.fill();
          ctx.stroke();

          // Train windshield screen
          ctx.fillStyle = '#0f172a'; // glassy black
          ctx.fillRect(obs.x + 4, beamY + 4, obs.width - 8, obs.height * 0.4);

          // Headlights glow
          const flash = Math.floor(Date.now() / 300) % 2 === 0;
          ctx.fillStyle = '#fef08a'; // yellow light
          
          // Left light
          ctx.beginPath();
          ctx.arc(obs.x + 10, beamY + obs.height - 12, 5, 0, Math.PI * 2);
          ctx.fill();
          
          // Right light
          ctx.beginPath();
          ctx.arc(obs.x + obs.width - 10, beamY + obs.height - 12, 5, 0, Math.PI * 2);
          ctx.fill();

          // RED warning stripe on front
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(obs.x, beamY + obs.height * 0.6, obs.width, 5);

          // Mongolian Train Operator Label (Mongolian Subway lines)
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText("УБМT-🚅", obs.x + obs.width / 2, beamY + 12);
        }
        ctx.restore();
      }

      // 4. DRAW PLAYER HERO MAN (Skateboarder surf pose)
      const p = engine.player;
      const playerAbsoluteY = p.groundY + p.y;
      
      ctx.save();

      if (p.isCrouching) {
        // Draw crouching boarding layout (sliding under train or bridge)
        // Draw yellow sleek hoverboard skateboard
        ctx.fillStyle = '#eab308';
        ctx.fillRect(100, playerAbsoluteY - 6, p.width + 15, 6);

        // Slide dust particles trail
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(90, playerAbsoluteY - 4, 10, 4);

        // Player kneeling silhouette (red hoodie + cap)
        ctx.fillStyle = '#ef4444'; // Red sporty hoodie coat
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(110, playerAbsoluteY - p.crouchHeight, p.width, p.crouchHeight - 4, 8);
        ctx.fill();
        ctx.stroke();

        // Visor cap bill
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(110 + p.width - 6, playerAbsoluteY - p.crouchHeight + 3, 10, 4);

        // Spray-cans trail sparks
        ctx.fillStyle = '#fb7185';
        ctx.fillRect(115, playerAbsoluteY - p.crouchHeight + 12, 10, p.crouchHeight - 18);

      } else {
        // Draw standing run/jump skater profile
        // Skateboard under feet
        ctx.fillStyle = '#eab308'; // Golden skateboard deck
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(102, playerAbsoluteY - 10, p.width + 12, 6, 2);
        ctx.fill();
        ctx.stroke();

        // Skateboard wheels
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(110, playerAbsoluteY - 2, 3, 0, Math.PI * 2);
        ctx.arc(110 + p.width, playerAbsoluteY - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Player body (stylish jumper blue shirt + red cap)
        ctx.fillStyle = '#3b82f6'; // Bright blue dynamic hoodie
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(110, playerAbsoluteY - p.height, p.width, p.height - 8, 10);
        ctx.fill();
        ctx.stroke();

        // Head cap visor bill (looks like a red baseball hat)
        ctx.fillStyle = '#ef4444'; // red cap
        ctx.beginPath();
        ctx.roundRect(110 + 4, playerAbsoluteY - p.height - 4, p.width - 8, 8, 4);
        ctx.fill();
        // Cap peak
        ctx.fillRect(110 + 26, playerAbsoluteY - p.height, 10, 3);

        // Sport glasses
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(110 + 16, playerAbsoluteY - p.height + 10, 14, 5);

        // Spray can backpack bag
        ctx.fillStyle = '#ec4899'; // pink spray pack
        ctx.fillRect(110 - 8, playerAbsoluteY - p.height + 18, 8, 18);

        // Runner active legs (walk/run cycle)
        if (!p.isJumping) {
          const legSwing = Math.sin(Date.now() * 0.016) * 12;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          
          // Leg 1
          ctx.beginPath();
          ctx.moveTo(110 + 10, playerAbsoluteY - 14);
          ctx.lineTo(110 + 10 + legSwing, playerAbsoluteY - 10);
          ctx.stroke();

          // Leg 2
          ctx.beginPath();
          ctx.moveTo(110 + p.width - 10, playerAbsoluteY - 14);
          ctx.lineTo(110 + p.width - 10 - legSwing, playerAbsoluteY - 10);
          ctx.stroke();
        } else {
          // Crouching feet in jump air state
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(110 + 12, playerAbsoluteY - 14);
          ctx.lineTo(110 + 16, playerAbsoluteY - 18);
          ctx.stroke();
        }
      }
      ctx.restore();

      // STATIC DECORATIVE FOREGROUND GROUND LINE STYLE
      ctx.strokeStyle = '#78909c';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, engine.player.groundY);
      ctx.lineTo(canvas.width, engine.player.groundY);
      ctx.stroke();

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [playing, gameOver, highScore, playerAction]);

  return (
    <div className="w-full bg-slate-950 border-4 border-[#df00ff] rounded-3xl overflow-hidden shadow-2xl relative select-none font-sans flex flex-col md:flex-row">
      
      {/* 1. LEFT STATS RAIL PANEL */}
      <div className="w-full md:w-80 bg-[#080517] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#df00ff]/30 text-slate-100 z-10">
        <div className="space-y-6">
          {/* Header Logos */}
          <div className="text-center md:text-left space-y-1 pb-4 border-b border-indigo-500/20">
            <h4 className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-400 via-rose-500 to-yellow-500 bg-clip-text text-transparent uppercase tracking-widest">
              🚅 СУБВЭЙ ГҮЙГЧ
            </h4>
            <p className="text-[10px] text-yellow-400 font-semibold tracking-widest font-mono uppercase">SUBWAY SURFER & RUNNER</p>
          </div>

          {/* Practical Game Guides */}
          <div className="bg-[#120a2a]/90 border border-yellow-500/20 p-3.5 rounded-2xl text-[11px] leading-relaxed text-slate-300 font-sans">
            <span className="font-extrabold text-yellow-400 uppercase block mb-1">🎮 ТОГЛОХ ЗААВАР:</span>
            Гал тэрэг болон саадуудаас бултан гүйгээрэй:
            <div className="mt-2 space-y-1 bg-stone-950/50 p-2 rounded-lg font-mono">
              <p className="text-orange-400 font-bold">🚧 ТӨМӨР ЗАМЫН ХААЛТ: <span className="text-white bg-orange-500/20 px-1 rounded">W / Space / Up</span>-оор <span className="text-white font-bold">Үсрэх</span></p>
              <p className="text-blue-400 font-bold">🚅 ИРЭХ ГАЛ ТЭРЭГ: <span className="text-white bg-blue-500/20 px-1 rounded">S / Down</span>-оор <span className="text-white font-bold">Сууж хэвтэх эсвэл Гулсах</span></p>
            </div>
            Нэмэлт <span className="text-yellow-400 font-bold">Алтан Зоос 🪙</span> цуглуулж <span className="text-yellow-400 font-black">+25 оноо</span> авна!
          </div>

          {/* Current stats display board */}
          <div className="bg-[#0b071a] rounded-2xl border border-indigo-500/10 p-4 space-y-3 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">ОДООГИЙН ОНОО:</span>
              <span className="text-md font-black text-[#00ff88]">{score}</span>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-slate-900 pt-2">
              <span className="text-slate-400">СААДЫН ХУРД:</span>
              <span className="text-cyan-400 font-bold">Lv. {speedLevel}</span>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-slate-900 pt-2">
              <span className="text-slate-400">ЦУГЛУУЛСАН ОД:</span>
              <span className="text-yellow-400 font-black">⭐ {combatSparks}</span>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-slate-900 pt-2">
              <span className="text-slate-400">ҮЛДСЭН АМЬ (LIVES):</span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(heartId => (
                  <span 
                    key={heartId} 
                    className={`text-xs transition-transform ${heartId <= lives ? 'text-red-500 scale-110 drop-shadow-lg' : 'text-slate-700 saturate-0'}`}
                  >
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footers Highscore */}
        <div className="mt-8 space-y-4 pt-4 border-t border-indigo-500/10">
          <div className="flex justify-between items-center text-xs bg-slate-950 p-3 rounded-xl border border-[#df00ff]/20">
            <span className="flex items-center gap-1 text-yellow-400 font-bold">
              <Trophy className="w-4 h-4 text-yellow-400 animate-pulse" /> ДЭЭД АМЖИЛТ:
            </span>
            <span className="font-mono font-extrabold text-yellow-400">{highScore}</span>
          </div>

          {/* Sound elements toggle button */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-400 font-sans">
            <span>Дууны эффект:</span>
            <button
              onClick={() => setMute(!mute)}
              className="px-3 py-1.5 bg-[#120a2a] hover:bg-opacity-85 rounded-xl border border-indigo-500/20 text-slate-200 flex items-center gap-1.5 cursor-pointer font-bold duration-150"
            >
              {mute ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#00ff88]" />}
              <span className="text-[10px] uppercase">{mute ? 'ХАТГАСАН' : 'НЭЭЛТТЭЙ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PLAYFIELD CANVAS BOX */}
      <div 
        ref={containerRef}
        className="flex-1 min-h-[340px] md:min-h-[440px] relative bg-[#0c0a1c] flex items-center justify-center p-0 overflow-hidden border-t md:border-t-0 md:border-l border-[#df00ff]/30"
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          tabIndex={0}
          onClick={() => {
            if (canvasRef.current) {
              canvasRef.current.focus();
            }
            if (playing && !gameOver) {
              triggerJump();
            }
          }}
          className="w-full h-full object-cover block shadow-inner bg-[#0c0a1c] outline-none cursor-pointer"
        />

        {/* Screen Overlay: Welcome Lobby */}
        {!playing && !gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-6 z-10">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border-2 border-yellow-400 flex items-center justify-center text-3xl mx-auto shadow-2xl animate-pulse text-yellow-400">
              🚅
            </div>

            <div className="space-y-1 max-w-sm">
              <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent uppercase tracking-widest">
                СУБВЭЙ ГҮЙГЧ
              </h3>
              <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                Төмөр замаар ирэх хурдны гал тэрэгнээс доош гулсаж бултаад, хаалт дээгүүр оновчтой харайн алтан зоосууд цуглуулах хязгааргүй гүйлтийн сонирхолтой тоглоом!
              </p>
            </div>

            <button
              onClick={startNewGame}
              className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:brightness-110 text-white font-black text-xs px-10 py-3.5 rounded-2xl transform active:scale-95 duration-150 uppercase tracking-widest shadow-lg shadow-orange-500/20 cursor-pointer flex items-center gap-2 border border-white/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>ГҮЙЛТИЙГ ЭХЛЭХ 🏃‍♂️🛹</span>
            </button>
          </div>
        )}

        {/* Screen Overlay: GAME OVER overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-6 z-10 animate-scaleUp">
            <span className="text-4xl">💥🚇</span>
            
            <div className="space-y-1">
              <h3 className="text-2xl md:text-3xl font-black text-red-500 uppercase tracking-widest">ТОГЛООМ ДУУСЛАА</h3>
              <p className="text-xs text-slate-400">Төмөр замын саадад бүдэрч эсвэл гал тэрэг мөргөлөө.</p>
            </div>

            {/* Stats list summary */}
            <div className="grid grid-cols-2 gap-4 max-w-xs w-full bg-[#110a21] border border-yellow-500/20 px-6 py-4 rounded-2xl text-left font-mono">
              <div>
                <span className="text-[10px] text-slate-405 uppercase">Таны оноо:</span>
                <span className="text-lg font-black text-yellow-400 block">{score} 🪙</span>
              </div>
              <div className="border-l border-slate-900 pl-4">
                <span className="text-[10px] text-slate-405 uppercase">АЛТАН ЗООС:</span>
                <span className="text-lg font-black text-yellow-400 block">⭐ {combatSparks}</span>
              </div>
            </div>

            {score >= highScore && score > 0 ? (
              <div className="bg-yellow-500/10 text-yellow-400 border border-yellow-550/30 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-1 animate-bounce">
                <Award className="w-4 h-4 text-yellow-400" /> ШИНЭ ДЭЭД АМЖИЛТ! 🎉
              </div>
            ) : null}

            <div className="flex gap-2 w-full max-w-xs font-sans">
              <button
                onClick={startNewGame}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:brightness-110 text-white font-black text-xs py-3 rounded-xl transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> ДАХИН ТОГЛОХ
              </button>
              
              <button
                onClick={() => {
                  setGameOver(false);
                  setPlaying(false);
                }}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
              >
                БОЛИХ
              </button>
            </div>
          </div>
        )}

        {/* MOBILE GRAPHIC VIRTUAL BUTTONS overlay at the bottom for instant touch accessibility */}
        {playing && !gameOver && (
          <div className="absolute inset-x-0 bottom-4 px-4 flex justify-between gap-4 pointer-events-none z-10">
            {/* Slide Down Crouch Button (Left side of screens) */}
            <button
              onTouchStart={(e) => { e.preventDefault(); setKeyStates(prev => ({ ...prev, Crouch: true })); triggerCrouch(true); }}
              onTouchEnd={(e) => { e.preventDefault(); setKeyStates(prev => ({ ...prev, Crouch: false })); triggerCrouch(false); }}
              onMouseDown={(e) => { e.preventDefault(); setKeyStates(prev => ({ ...prev, Crouch: true })); triggerCrouch(true); }}
              onMouseUp={(e) => { e.preventDefault(); setKeyStates(prev => ({ ...prev, Crouch: false })); triggerCrouch(false); }}
              onMouseLeave={() => { setKeyStates(prev => ({ ...prev, Crouch: false })); triggerCrouch(false); }}
              className={`pointer-events-auto h-16 w-32 rounded-2xl flex flex-col items-center justify-center border transition-all transform active:scale-95 duration-100 cursor-pointer ${
                keyStates.Crouch 
                  ? 'bg-cyan-500 text-slate-950 border-white shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-950/80 text-cyan-400 border-cyan-500/35 backdrop-blur-md'
              }`}
            >
              <span className="text-sm font-extrabold uppercase tracking-wider block font-sans">⬇️ СУУХ / ХЭВТЭХ</span>
              <span className="text-[8px] opacity-70 font-mono">(S / Down)</span>
            </button>

            {/* Jump Button (Right side of screens) */}
            <button
              onTouchStart={(e) => { e.preventDefault(); setKeyStates(prev => ({ ...prev, Jump: true })); triggerJump(); }}
              onTouchEnd={(e) => { e.preventDefault(); setKeyStates(prev => ({ ...prev, Jump: false })); }}
              onMouseDown={(e) => { e.preventDefault(); setKeyStates(prev => ({ ...prev, Jump: true })); triggerJump(); }}
              onMouseUp={(e) => { e.preventDefault(); setKeyStates(prev => ({ ...prev, Jump: false })); }}
              onMouseLeave={() => setKeyStates(prev => ({ ...prev, Jump: false }))}
              className={`pointer-events-auto h-16 w-32 rounded-2xl flex flex-col items-center justify-center border transition-all transform active:scale-95 duration-100 cursor-pointer ${
                keyStates.Jump 
                  ? 'bg-pink-500 text-white border-white scale-95 shadow-lg shadow-pink-500/20' 
                  : 'bg-slate-950/80 text-pink-400 border-pink-500/35 backdrop-blur-md'
              }`}
            >
              <span className="text-sm font-extrabold uppercase tracking-wider block font-sans">⬆️ ҮСРЭХ</span>
              <span className="text-[8px] opacity-70 font-mono">(W / Space / Up)</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
