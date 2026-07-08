import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Award, Gamepad2, Compass, Layers, CheckCircle } from 'lucide-react';

interface ObbyGameProps {
  onGainXp?: (amount: number) => void;
}

// Simple synth sound generator using Web Audio API to prevent dependency loading
class ObbySoundManager {
  private ctx: AudioContext | null = null;
  public isMuted = false;
  private bgmInterval: any = null;
  private bgmStep = 0;

  // A vibrant, nostalgic arcade chiptune melody (Roblox inspired progression)
  private melody = [
    261.63, 329.63, 392.00, 523.25, // C Major: C, E, G, C
    293.66, 349.23, 440.00, 587.33, // D minor: D, F, A, D
    329.63, 392.00, 493.88, 659.25, // E minor: E, G, B, E
    349.23, 440.00, 523.25, 698.46, // F Major: F, A, C, F
    392.00, 493.88, 587.33, 783.99, // G Major: G, B, D, G
    440.00, 523.25, 659.25, 880.00, // A minor: A, C, E, A
    349.23, 440.00, 523.25, 698.46, // F Major: F, A, C, F
    392.00, 493.88, 587.33, 783.99  // G Major: G, B, D, G
  ];

  private init() {
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
  }

  startBgm() {
    this.init();
    if (this.bgmInterval) return; // already running

    this.bgmStep = 0;
    this.bgmInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;

      const freq = this.melody[this.bgmStep % this.melody.length];
      this.bgmStep++;

      try {
        // Soft synth pulse melody
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Very soft backing level for premium vibe
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      } catch (err) {
        // Safe fail
      }
    }, 180); // Upbeat speed
  }

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  playJump() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playCoin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playCheckpoint() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, this.ctx.currentTime); // E4
    osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playDeath() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    // Roblox "Oof!" sound synthesis
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(135, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(85, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 0.15);
    osc2.stop(this.ctx.currentTime + 0.15);
  }

  playWin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(261.63, this.ctx.currentTime); // C4
    osc.frequency.setValueAtTime(329.63, this.ctx.currentTime + 0.1); // E4
    osc.frequency.setValueAtTime(392.00, this.ctx.currentTime + 0.2); // G4
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime + 0.3); // C5

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }
}

const sound = new ObbySoundManager();

// Level Definitions
interface LevelBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'normal' | 'lava' | 'checkpoint' | 'jumpPad' | 'speedBoost' | 'disappearing' | 'winPad';
  color: string;
  activated?: boolean;
  opacity?: number;
  cooldown?: number; // for disappearing blocks
  originalOpacity?: number;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
  radius: number;
}

interface Level {
  name: string;
  color: string;
  startX: number;
  startY: number;
  blocks: LevelBlock[];
  coins: Coin[];
}

const LEVEL_DATA: Level[] = [
  {
    name: 'Түвшин 1: Саадын Эхлэл (Урт)',
    color: 'from-cyan-500 to-blue-500',
    startX: 50,
    startY: 380,
    blocks: [
      { x: 0, y: 420, w: 180, h: 80, type: 'normal', color: '#10b981' }, // start pad
      { x: 240, y: 390, w: 60, h: 20, type: 'normal', color: '#3b82f6' },
      { x: 350, y: 350, w: 60, h: 20, type: 'normal', color: '#3b82f6' },
      { x: 450, y: 450, w: 200, h: 50, type: 'lava', color: '#ef4444' }, // lava trap
      { x: 460, y: 320, w: 80, h: 180, type: 'normal', color: '#475569' },
      { x: 485, y: 280, w: 30, h: 40, type: 'checkpoint', color: '#ef4444', activated: false }, // checkpoint 1
      { x: 600, y: 300, w: 50, h: 20, type: 'normal', color: '#3b82f6' },
      { x: 700, y: 280, w: 80, h: 15, type: 'speedBoost', color: '#eab308' }, // speedBoost intro
      { x: 700, y: 295, w: 80, h: 200, type: 'normal', color: '#475569' },
      { x: 840, y: 280, w: 40, h: 20, type: 'normal', color: '#3b82f6' },
      { x: 940, y: 320, w: 100, h: 180, type: 'normal', color: '#475569' },
      { x: 975, y: 280, w: 30, h: 40, type: 'checkpoint', color: '#ef4444', activated: false }, // checkpoint 2
      { x: 1100, y: 380, w: 50, h: 15, type: 'jumpPad', color: '#ec4899' }, // jump pad intro
      { x: 1100, y: 395, w: 50, h: 100, type: 'normal', color: '#475569' },
      { x: 1100, y: 180, w: 120, h: 20, type: 'normal', color: '#8b5cf6' },
      { x: 1280, y: 220, w: 60, h: 20, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 0 },
      { x: 1400, y: 260, w: 150, h: 240, type: 'winPad', color: '#eab308' }, // win pad
    ],
    coins: [
      { x: 270, y: 340, collected: false, radius: 8 },
      { x: 380, y: 300, collected: false, radius: 8 },
      { x: 740, y: 230, collected: false, radius: 8 },
      { x: 1160, y: 130, collected: false, radius: 8 },
    ]
  },
  {
    name: 'Түвшин 2: Лава ба Нарийн Гүүр',
    color: 'from-orange-500 to-red-600',
    startX: 50,
    startY: 380,
    blocks: [
      { x: 0, y: 420, w: 120, h: 80, type: 'normal', color: '#10b981' },
      { x: 120, y: 450, w: 800, h: 50, type: 'lava', color: '#ef4444' }, // long initial lava lake
      { x: 180, y: 350, w: 40, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 280, y: 300, w: 40, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 385, y: 340, w: 40, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 490, y: 290, w: 40, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 570, y: 320, w: 100, h: 180, type: 'normal', color: '#475569' },
      { x: 605, y: 280, w: 30, h: 40, type: 'checkpoint', color: '#ef4444', activated: false }, // checkpoint 1
      { x: 720, y: 360, w: 30, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 800, y: 320, w: 30, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 880, y: 360, w: 30, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 960, y: 320, w: 50, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 0 },
      { x: 1060, y: 280, w: 50, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 90 },
      { x: 1160, y: 320, w: 50, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 45 },
      { x: 1260, y: 300, w: 100, h: 200, type: 'normal', color: '#475569' },
      { x: 1295, y: 260, w: 30, h: 40, type: 'checkpoint', color: '#ef4444', activated: false }, // checkpoint 2
      { x: 1360, y: 450, w: 500, h: 50, type: 'lava', color: '#ef4444' }, // next lava trap
      { x: 1400, y: 410, w: 40, h: 15, type: 'jumpPad', color: '#ec4899' },
      { x: 1400, y: 425, w: 40, h: 75, type: 'normal', color: '#475569' },
      { x: 1500, y: 210, w: 80, h: 15, type: 'speedBoost', color: '#eab308' },
      { x: 1500, y: 225, w: 80, h: 275, type: 'normal', color: '#475569' },
      { x: 1680, y: 250, w: 30, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 1780, y: 290, w: 30, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 1880, y: 260, w: 150, h: 240, type: 'winPad', color: '#eab308' }, // Finish
    ],
    coins: [
      { x: 200, y: 310, collected: false, radius: 8 },
      { x: 300, y: 260, collected: false, radius: 8 },
      { x: 620, y: 240, collected: false, radius: 8 },
      { x: 1085, y: 230, collected: false, radius: 8 },
      { x: 1540, y: 150, collected: false, radius: 8 },
    ]
  },
  {
    name: 'Түвшин 3: Үл Үзэгдэх Тэнгэрийн Зам',
    color: 'from-purple-600 to-indigo-700',
    startX: 50,
    startY: 380,
    blocks: [
      { x: 0, y: 420, w: 100, h: 80, type: 'normal', color: '#10b981' },
      { x: 150, y: 390, w: 120, h: 15, type: 'speedBoost', color: '#eab308' },
      { x: 150, y: 405, w: 120, h: 95, type: 'normal', color: '#475569' },
      { x: 270, y: 430, w: 350, h: 70, type: 'lava', color: '#ef4444' }, // huge lava spike
      { x: 620, y: 370, w: 80, h: 130, type: 'normal', color: '#475569' },
      { x: 645, y: 330, w: 30, h: 40, type: 'checkpoint', color: '#ef4444', activated: false }, // checkpoint 1
      { x: 740, y: 320, w: 45, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 0 },
      { x: 830, y: 270, w: 45, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 60 },
      { x: 920, y: 220, w: 45, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 120 },
      { x: 1010, y: 170, w: 45, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 180 },
      { x: 1100, y: 350, w: 120, h: 150, type: 'normal', color: '#475569' },
      { x: 1145, y: 310, w: 30, h: 40, type: 'checkpoint', color: '#ef4444', activated: false }, // checkpoint 2
      { x: 1260, y: 410, w: 40, h: 15, type: 'jumpPad', color: '#ec4899' },
      { x: 1260, y: 425, w: 40, h: 75, type: 'normal', color: '#475569' },
      { x: 1350, y: 240, w: 40, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 1440, y: 360, w: 40, h: 15, type: 'jumpPad', color: '#ec4899' },
      { x: 1440, y: 375, w: 40, h: 125, type: 'normal', color: '#475569' },
      { x: 1540, y: 190, w: 50, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 1480, y: 460, w: 600, h: 40, type: 'lava', color: '#ef4444' }, // Giant lava floor
      { x: 1650, y: 390, w: 40, h: 15, type: 'jumpPad', color: '#ec4899' },
      { x: 1650, y: 405, w: 40, h: 95, type: 'normal', color: '#475569' },
      { x: 1750, y: 220, w: 80, h: 15, type: 'speedBoost', color: '#eab308' },
      { x: 1750, y: 235, w: 80, h: 265, type: 'normal', color: '#475569' },
      { x: 1900, y: 280, w: 50, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 2020, y: 240, w: 180, h: 260, type: 'winPad', color: '#eab308' },
    ],
    coins: [
      { x: 200, y: 340, collected: false, radius: 8 },
      { x: 852, y: 220, collected: false, radius: 8 },
      { x: 1160, y: 260, collected: false, radius: 8 },
      { x: 1370, y: 190, collected: false, radius: 8 },
      { x: 1790, y: 160, collected: false, radius: 8 },
    ]
  },
  {
    name: 'Түвшин 4: Хий Үзэгдэл ба Хурд',
    color: 'from-yellow-500 to-amber-600',
    startX: 50,
    startY: 380,
    blocks: [
      { x: 0, y: 420, w: 100, h: 80, type: 'normal', color: '#10b981' },
      { x: 150, y: 370, w: 50, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 10 },
      { x: 260, y: 320, w: 50, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 100 },
      { x: 370, y: 370, w: 50, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 10 },
      { x: 480, y: 340, w: 120, h: 160, type: 'normal', color: '#475569' },
      { x: 525, y: 300, w: 30, h: 40, type: 'checkpoint', color: '#ef4444', activated: false }, // checkpoint 1
      { x: 640, y: 310, w: 100, h: 15, type: 'speedBoost', color: '#eab308' },
      { x: 640, y: 325, w: 100, h: 175, type: 'normal', color: '#475569' },
      { x: 740, y: 430, w: 80, h: 70, type: 'lava', color: '#ef4444' }, // lava spike 1
      { x: 820, y: 310, w: 100, h: 15, type: 'speedBoost', color: '#eab308' },
      { x: 820, y: 325, w: 100, h: 175, type: 'normal', color: '#475569' },
      { x: 920, y: 430, w: 80, h: 70, type: 'lava', color: '#ef4444' }, // lava spike 2
      { x: 1000, y: 310, w: 100, h: 15, type: 'speedBoost', color: '#eab308' },
      { x: 1000, y: 325, w: 100, h: 175, type: 'normal', color: '#475569' },
      { x: 1140, y: 260, w: 120, h: 240, type: 'normal', color: '#475569' },
      { x: 1185, y: 220, w: 30, h: 40, type: 'checkpoint', color: '#ef4444', activated: false }, // checkpoint 2
      { x: 1260, y: 450, w: 1000, h: 50, type: 'lava', color: '#ef4444' }, // massive lava lake bottom
      { x: 1320, y: 400, w: 45, h: 15, type: 'jumpPad', color: '#ec4899' },
      { x: 1320, y: 415, w: 45, h: 85, type: 'normal', color: '#475569' },
      { x: 1450, y: 320, w: 40, h: 180, type: 'normal', color: '#475569' },
      { x: 1560, y: 390, w: 45, h: 15, type: 'jumpPad', color: '#ec4899' },
      { x: 1560, y: 405, w: 45, h: 95, type: 'normal', color: '#475569' },
      { x: 1680, y: 230, w: 60, h: 15, type: 'normal', color: '#8b5cf6' },
      { x: 1800, y: 210, w: 45, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 65 },
      { x: 1920, y: 240, w: 45, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 125 },
      { x: 2045, y: 270, w: 35, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 2130, y: 310, w: 50, h: 190, type: 'normal', color: '#475569' },
      { x: 2140, y: 270, w: 30, h: 40, type: 'checkpoint', color: '#ef4444', activated: false }, // checkpoint 3
      { x: 2220, y: 410, w: 40, h: 15, type: 'jumpPad', color: '#ec4899' },
      { x: 2220, y: 425, w: 40, h: 75, type: 'normal', color: '#475569' },
      { x: 2340, y: 220, w: 160, h: 280, type: 'winPad', color: '#eab308' },
    ],
    coins: [
      { x: 540, y: 290, collected: false, radius: 8 },
      { x: 690, y: 240, collected: false, radius: 8 },
      { x: 1470, y: 270, collected: false, radius: 8 },
      { x: 1822, y: 150, collected: false, radius: 8 },
      { x: 2062, y: 210, collected: false, radius: 8 },
    ]
  },
  {
    name: 'Түвшин 5: Бурхдын Хэцүү Сорилт (Pro Expert)',
    color: 'from-rose-600 to-neutral-900',
    startX: 50,
    startY: 380,
    blocks: [
      { x: 0, y: 420, w: 80, h: 80, type: 'normal', color: '#10b981' },
      { x: 80, y: 460, w: 600, h: 40, type: 'lava', color: '#ef4444' }, // Lava starting pool
      { x: 130, y: 380, w: 25, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 200, y: 330, w: 25, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 270, y: 380, w: 25, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 340, y: 330, w: 25, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 0 },
      { x: 410, y: 290, w: 25, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 90 },
      { x: 480, y: 335, w: 25, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 550, y: 280, w: 80, h: 220, type: 'normal', color: '#475569' },
      { x: 575, y: 240, w: 30, h: 40, type: 'checkpoint', color: '#ef4444', activated: false }, // checkpoint 1
      { x: 660, y: 260, w: 120, h: 15, type: 'speedBoost', color: '#eab308' },
      { x: 660, y: 275, w: 120, h: 225, type: 'normal', color: '#475569' },
      { x: 780, y: 450, w: 600, h: 50, type: 'lava', color: '#ef4444' }, // Giant gap 2
      { x: 840, y: 390, w: 40, h: 15, type: 'jumpPad', color: '#ec4899' },
      { x: 840, y: 405, w: 40, h: 95, type: 'normal', color: '#475569' },
      { x: 940, y: 180, w: 120, h: 15, type: 'normal', color: '#8b5cf6' },
      { x: 1110, y: 220, w: 40, h: 15, type: 'jumpPad', color: '#ec4899' },
      { x: 1110, y: 235, w: 40, h: 265, type: 'normal', color: '#475569' },
      { x: 1220, y: 240, w: 60, h: 260, type: 'normal', color: '#475569' },
      { x: 1235, y: 200, w: 30, h: 40, type: 'checkpoint', color: '#ef4444', activated: false }, // checkpoint 2
      { x: 1340, y: 300, w: 35, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 0 },
      { x: 1430, y: 260, w: 35, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 45 },
      { x: 1520, y: 220, w: 35, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 90 },
      { x: 1610, y: 185, w: 35, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 135 },
      { x: 1700, y: 150, w: 35, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 180 },
      { x: 1790, y: 220, w: 110, h: 280, type: 'normal', color: '#475569' },
      { x: 1830, y: 180, w: 30, h: 40, type: 'checkpoint', color: '#ef4444', activated: false }, // checkpoint 3
      { x: 1940, y: 250, w: 100, h: 15, type: 'speedBoost', color: '#eab308' },
      { x: 1940, y: 265, w: 100, h: 235, type: 'normal', color: '#475569' },
      { x: 2040, y: 450, w: 800, h: 50, type: 'lava', color: '#ef4444' }, // Chaos lava ending
      { x: 2100, y: 300, w: 25, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 2190, y: 260, w: 25, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 2280, y: 220, w: 25, h: 15, type: 'normal', color: '#3b82f6' },
      { x: 2370, y: 380, w: 40, h: 15, type: 'jumpPad', color: '#ec4899' },
      { x: 2370, y: 395, w: 40, h: 105, type: 'normal', color: '#475569' },
      { x: 2470, y: 200, w: 140, h: 15, type: 'speedBoost', color: '#eab308' },
      { x: 2470, y: 215, w: 140, h: 285, type: 'normal', color: '#475569' },
      { x: 2670, y: 230, w: 30, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 30 },
      { x: 2760, y: 270, w: 30, h: 15, type: 'disappearing', color: '#f43f5e', opacity: 1, originalOpacity: 1, cooldown: 110 },
      { x: 2850, y: 220, w: 150, h: 280, type: 'winPad', color: '#eab308' },
    ],
    coins: [
      { x: 145, y: 330, collected: false, radius: 8 },
      { x: 590, y: 230, collected: false, radius: 8 },
      { x: 990, y: 120, collected: false, radius: 8 },
      { x: 1845, y: 130, collected: false, radius: 8 },
      { x: 2220, y: 170, collected: false, radius: 8 },
      { x: 2920, y: 150, collected: false, radius: 8 },
    ]
  }
];

export default function ObbyGame({ onGainXp }: ObbyGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [levelIdx, setLevelIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [time, setTime] = useState(0);
  const [mute, setMute] = useState(false);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([0]);
  const [checkpointCoords, setCheckpointCoords] = useState<{ x: number, y: number } | null>(null);
  const checkpointCoordsRef = useRef<{ x: number, y: number } | null>(null);
  const [showWinMessage, setShowWinMessage] = useState(false);

  // Game Object Properties
  const gravity = 0.5;
  const initialSpeed = 4;
  const initialJumpForce = 11;

  // Player physics ref
  const playerRef = useRef({
    x: 50,
    y: 350,
    vx: 0,
    vy: 0,
    w: 24,
    h: 36,
    isGrounded: false,
    jumpsLeft: 2, // Support Double Jumps!
    speed: initialSpeed,
    jumpForce: initialJumpForce,
    facingRight: true,
    color: '#38bdf8', // custom avatar color
    skinColor: '#fde047',
    shirtColor: '#ef4444',
    particles: [] as Array<{ x: number, y: number, vx: number, vy: number, color: string, size: number, alpha: number }>
  });

  const deathFreezeFrames = useRef(0);

  // Controls map
  const keysRef = useRef<Record<string, boolean>>({});
  const lastStateRef = useRef<Level[]>(JSON.parse(JSON.stringify(LEVEL_DATA)));

  // Setup levels and mutable fields
  const currentLevel = lastStateRef.current[levelIdx];

  useEffect(() => {
    sound.isMuted = mute;
    if (isPlaying && !isGameOver && !showWinMessage && !mute) {
      sound.startBgm();
    } else {
      sound.stopBgm();
    }
    return () => {
      sound.stopBgm();
    };
  }, [mute, isPlaying, isGameOver, showWinMessage]);

  // Game timer loop
  useEffect(() => {
    let timer: any;
    if (isPlaying && !isGameOver && !showWinMessage) {
      timer = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, showWinMessage]);

  // Load level configuration
  const loadLevel = (idx: number) => {
    const freshLevels = JSON.parse(JSON.stringify(LEVEL_DATA));
    lastStateRef.current = freshLevels;
    
    const lvl = freshLevels[idx];
    setLevelIdx(idx);
    
    playerRef.current.x = lvl.startX;
    playerRef.current.y = lvl.startY;
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;
    playerRef.current.speed = initialSpeed;
    playerRef.current.jumpForce = initialJumpForce;
    playerRef.current.isGrounded = false;
    playerRef.current.jumpsLeft = 2;
    playerRef.current.particles = [];
    
    // reset level checkpoint
    setCheckpointCoords(null);
    checkpointCoordsRef.current = null;
    lvl.blocks.forEach((b: LevelBlock) => {
      if (b.type === 'checkpoint') {
        b.activated = false;
        b.color = '#ef4444'; // Red
      }
    });

    setIsGameOver(false);
    setShowWinMessage(false);
  };

  const handleStartGame = () => {
    setIsPlaying(true);
    loadLevel(levelIdx);
  };

  const resetAllStats = () => {
    setScore(0);
    setDeaths(0);
    setTime(0);
    loadLevel(0);
  };

  const handleDieRef = useRef<() => void>(() => {});
  useEffect(() => {
    handleDieRef.current = handleDie;
  });

  // Keyboard binding logic
  useEffect(() => {
    if (!isPlaying || isGameOver || showWinMessage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = (e.key || '').toLowerCase();
      if (k) {
        keysRef.current[k] = true;
      }

      // 'R' key to respawn/restart
      if (k === 'r' || k === 'к') {
        e.preventDefault();
        handleDieRef.current();
      }

      // Space or ArrowUp to Jump
      if ([' ', 'arrowup', 'w', 'ц'].includes(k)) {
        e.preventDefault();
        keysRef.current['jump'] = true;
      }
      if (['arrowdown', 's', 'ы'].includes(k)) {
        e.preventDefault();
      }
      if (['arrowleft', 'a', 'ф'].includes(k)) {
        e.preventDefault();
        keysRef.current['left'] = true;
      }
      if (['arrowright', 'd', 'в'].includes(k)) {
        e.preventDefault();
        keysRef.current['right'] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = (e.key || '').toLowerCase();
      if (k) {
        keysRef.current[k] = false;
      }

      if ([' ', 'arrowup', 'w', 'ц'].includes(k)) {
        e.preventDefault();
        keysRef.current['jump'] = false;
      }
      if (['arrowleft', 'a', 'ф'].includes(k)) {
        e.preventDefault();
        keysRef.current['left'] = false;
      }
      if (['arrowright', 'd', 'в'].includes(k)) {
        e.preventDefault();
        keysRef.current['right'] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isGameOver, showWinMessage]);

  // Main high-frequency rendering and physics calculation loop
  useEffect(() => {
    let animId: number;

    const gameLoop = () => {
      if (!isPlaying || isGameOver || showWinMessage) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      const player = playerRef.current;
      const lvl = lastStateRef.current[levelIdx];
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      // ----------------------------------------------------
      // 1. UPDATE DISAPPEARING PLATFORMS TIMERS
      // ----------------------------------------------------
      lvl.blocks.forEach(b => {
        if (b.type === 'disappearing') {
          // cycle platform appearance with standard modulo
          if (b.cooldown === undefined) b.cooldown = 0;
          b.cooldown = (b.cooldown + 1.5) % 180;
          
          if (b.cooldown < 90) {
            b.opacity = 1.0;
          } else if (b.cooldown < 110) {
            // fading out
            b.opacity = Math.max(0, 1.0 - (b.cooldown - 90) / 20);
          } else if (b.cooldown < 160) {
            b.opacity = 0.0;
          } else {
            // fading in
            b.opacity = Math.min(1.0, (b.cooldown - 160) / 20);
          }
        }
      });

      // Calculate dynamic level bounds depending on blocks
      const levelWidth = lvl.blocks.reduce((max, b) => Math.max(max, b.x + b.w), 900) + 200;

      // ----------------------------------------------------
      // 2. APPLY CONTROLS & PHYSICS
      // ----------------------------------------------------
      if (deathFreezeFrames.current > 0) {
        deathFreezeFrames.current--;
        
        // When freeze ends, actually teleport the player to spawn / checkpoint
        if (deathFreezeFrames.current === 0) {
          const p = playerRef.current;
          const cp = checkpointCoordsRef.current;
          if (cp) {
            p.x = cp.x - p.w / 2;
            p.y = cp.y - p.h;
          } else {
            p.x = lvl.startX;
            p.y = lvl.startY;
          }
          p.vx = 0;
          p.vy = 0;
        }
      } else {
        const acceleration = 0.42;
        const friction = 0.82;
        let targetVx = 0;
        if (keysRef.current['left'] || keysRef.current['a']) {
          targetVx = -player.speed;
          player.facingRight = false;
        }
        if (keysRef.current['right'] || keysRef.current['d']) {
          targetVx = player.speed;
          player.facingRight = true;
        }

        // Smooth horizontal velocity transitioning
        if (targetVx !== 0) {
          player.vx += (targetVx - player.vx) * acceleration;
          
          // Spawn slide/running dust particles on blocks
          if (player.isGrounded && Math.random() < 0.35) {
            player.particles.push({
              x: player.x + player.w / 2 + (Math.random() - 0.5) * player.w,
              y: player.y + player.h,
              vx: -player.vx * 0.15 + (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.3 - 0.4,
              color: 'rgba(255, 255, 255, 0.45)',
              size: Math.random() * 2 + 1,
              alpha: 0.7
            });
          }
        } else {
          player.vx *= friction;
          if (Math.abs(player.vx) < 0.15) {
            player.vx = 0;
          }
        }

        // Vertical gravity
        player.vy += gravity;

        // Trigger Jump & Double Jump
        if (keysRef.current['jump']) {
          if (player.isGrounded) {
            player.vy = -player.jumpForce;
            player.isGrounded = false;
            player.jumpsLeft = 1;
            keysRef.current['jump'] = false; // consume jump state
            sound.playJump();

            // Spawn neat initial jump blast particles
            for (let pi = 0; pi < 10; pi++) {
              player.particles.push({
                x: player.x + player.w / 2 + (Math.random() - 0.5) * player.w,
                y: player.y + player.h,
                vx: (Math.random() - 0.5) * 2.5,
                vy: (Math.random() - 0.5) * 1.5 - 0.5,
                color: '#38bdf8',
                size: Math.random() * 3 + 1,
                alpha: 0.9
              });
            }
          } else if (player.jumpsLeft > 0) {
            // Double jump triggered! Give they a neat double jump lift
            player.vy = -player.jumpForce * 1.1;
            player.jumpsLeft = 0; // consume remaining jump
            keysRef.current['jump'] = false; // consume jump state
            sound.playJump();

            // Spawn majestic golden double jump bursts fields!
            for (let pi = 0; pi < 15; pi++) {
              player.particles.push({
                x: player.x + player.w / 2 + (Math.random() - 0.5) * player.w,
                y: player.y + player.h / 2,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                color: '#facc15', // Gold burst
                size: Math.random() * 3.5 + 1.5,
                alpha: 0.95
              });
            }
          } else {
            keysRef.current['jump'] = false; // consume in vain
          }
        }

        // Check speed modification state reset (diminishes back to initial speed)
        if (player.speed > initialSpeed) {
          player.speed -= 0.02;
        }

        // Update projected positions separately for crisp AABB collision checks
        // AABB Horizontal Test
        player.x += player.vx;
        
        // Screen/level edge constraints
        if (player.x < 0) player.x = 0;
        if (player.x + player.w > levelWidth) player.x = levelWidth - player.w;

        // Platform Collisions (Horizontal)
        lvl.blocks.forEach(b => {
          // Disappearing invisible blocks cannot block the player!
          if (b.type === 'disappearing' && b.opacity !== undefined && b.opacity < 0.2) {
            return;
          }

          if (
            player.x < b.x + b.w &&
            player.x + player.w > b.x &&
            player.y < b.y + b.h &&
            player.y + player.h > b.y
          ) {
            // Collision occurred! Push player back
            if (b.type === 'lava') {
              handleDie();
              return;
            }

            if (player.vx > 0) {
              player.x = b.x - player.w;
            } else if (player.vx < 0) {
              player.x = b.x + b.w;
            }
          }
        });

        // AABB Vertical Test
        player.y += player.vy;
        player.isGrounded = false; // pessimistic default

        // Platform Collisions (Vertical)
        lvl.blocks.forEach(b => {
          // Disappearing check
          if (b.type === 'disappearing' && b.opacity !== undefined && b.opacity < 0.2) {
            return;
          }

          if (
            player.x < b.x + b.w &&
            player.x + player.w > b.x &&
            player.y < b.y + b.h &&
            player.y + player.h > b.y
          ) {
            if (b.type === 'lava') {
              handleDie();
              return;
            }

            if (b.type === 'winPad') {
              handleLevelWin();
              return;
            }

            if (b.type === 'checkpoint' && !b.activated) {
              b.activated = true;
              b.color = '#10b981'; // Bright Green when activated
              const coords = { x: b.x + b.w / 2, y: b.y - 10 };
              setCheckpointCoords(coords);
              checkpointCoordsRef.current = coords;
              sound.playCheckpoint();
              setScore(prev => prev + 50);
              if (onGainXp) onGainXp(30);
            }

            // Colliding downwards or upwards
            if (player.vy > 0) {
              // Landing on top of block
              player.y = b.y - player.h;
              player.vy = 0;
              player.isGrounded = true;
              player.jumpsLeft = 2; // reset double jump!

              // Trigger specials
              if (b.type === 'jumpPad') {
                player.vy = -player.jumpForce * 1.6; // mega spring bounce
                player.isGrounded = false;
                player.jumpsLeft = 1; // allow one double jump in air
                sound.playJump();
              }

              if (b.type === 'speedBoost') {
                player.speed = initialSpeed * 2.2; // heavy boost forward
              }
            } else if (player.vy < 0) {
              // Hitting ceiling
              player.y = b.y + b.h;
              player.vy = 0;
            }
          }
        });

        // Falling off the screen bounds / into the abyss (Бүх үеүдэд доошоо унахад шууд үхдэг болгов)
        if (player.y > 425) {
          handleDie();
          return;
        }
      }

      // Coin pickups collision detection
      lvl.coins.forEach(c => {
        if (!c.collected) {
          const px = player.x + player.w / 2;
          const py = player.y + player.h / 2;
          const dist = Math.sqrt((px - c.x) ** 2 + (py - c.y) ** 2);
          if (dist < player.w / 2 + c.radius) {
            c.collected = true;
            sound.playCoin();
            setScore(s => s + 100);
            if (onGainXp) onGainXp(15);
          }
        }
      });

      // ----------------------------------------------------
      // 3. DRAW GAME ELEMENTS
      // ----------------------------------------------------
      const playerCenterX = player.x + player.w / 2;
      const cameraX = Math.max(0, Math.min(levelWidth - canvas.width, playerCenterX - canvas.width / 2));

      // Clear canvas with deep space sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0f172a'); // slate-900
      skyGrad.addColorStop(1, '#1e1b4b'); // indigo-950
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Light grid lines for that distinct Roblox Obby build style look template (with fine parallax movement!)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      const gridScrollX = -(cameraX % gridSize);
      for (let x = gridScrollX; x < canvas.width; x += gridSize) {
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

      // Translate the elements by camera coordinates
      ctx.save();
      ctx.translate(-cameraX, 0);

      // Draw running/jumping dust particles in world coordinates
      if (player.particles) {
        for (let i = player.particles.length - 1; i >= 0; i--) {
          const pt = player.particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha -= 0.035;
          if (pt.alpha <= 0) {
            player.particles.splice(i, 1);
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
      }

      // Draw Coins (Shiny Spinning yellow icons)
      lvl.coins.forEach(c => {
        if (!c.collected) {
          ctx.save();
          // Draw star/glow first
          const pulse = Math.sin(Date.now() / 150) * 2;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#eab308';
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.radius + pulse / 2, 0, Math.PI * 2);
          ctx.fill();

          // Coin inner border
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.radius - 2.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      });

      // Draw blocks
      lvl.blocks.forEach(b => {
        ctx.save();
        if (b.type === 'disappearing' && b.opacity !== undefined) {
          ctx.globalAlpha = b.opacity;
        }

        // Draw shadow glow on lethal hazards
        if (b.type === 'lava') {
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ef4444';
        } else if (b.type === 'jumpPad') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ec4899';
        } else if (b.type === 'speedBoost') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#facc15';
        }

        // Round rectangular blocks design
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, b.type === 'checkpoint' ? 8 : 4);
        ctx.fill();

        // Extra details on blocks for beauty
        if (b.type === 'lava') {
          // Heat lines patterns
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let lx = b.x + 10; lx < b.x + b.w; lx += 25) {
            ctx.moveTo(lx, b.y + 2);
            ctx.lineTo(lx - 5, b.y + b.h - 2);
          }
          ctx.stroke();
        } else if (b.type === 'jumpPad') {
          // Spring icon inside
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(b.x + b.w / 2 - 10, b.y + b.h / 2);
          ctx.lineTo(b.x + b.w / 2 + 10, b.y + b.h / 2);
          ctx.stroke();
        } else if (b.type === 'speedBoost') {
          // Draw arrows pointing right
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(b.x + b.w / 2 - 15, b.y + b.h / 2);
          ctx.lineTo(b.x + b.w / 2, b.y + 4);
          ctx.lineTo(b.x + b.w / 2, b.y + b.h - 4);
          ctx.fill();
        } else if (b.type === 'checkpoint') {
          // Banner string
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(b.activated ? 'SAVE ✔️' : 'SAVE', b.x - 2, b.y - 6);
        } else if (b.type === 'winPad') {
          // Trophy shine drawing
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('FINISH 🏆', b.x + b.w / 2 - 25, b.y + b.h / 2);
        }

        ctx.restore();
      });

      // Draw the blocky Roblox Avatar Player Character
      ctx.save();
      // Draw shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(player.x + 2, player.y + player.h, player.w - 4, 3);

      // Character body structure (Head, Shirt, Pants/Legs blocky style)
      // Head
      ctx.fillStyle = player.skinColor;
      ctx.beginPath();
      ctx.roundRect(player.x + 5, player.y, 14, 12, 3);
      ctx.fill();

      // Fun Roblox Hat option (Cute square crown/cap)
      ctx.fillStyle = '#1e293b'; // slate hat
      ctx.fillRect(player.x + 2, player.y - 3, 20, 4); // brim
      ctx.fillRect(player.x + 6, player.y - 7, 12, 5); // crown

      // Head Eyes & Smile face details
      ctx.fillStyle = '#000000';
      const eyeDir = player.facingRight ? 1 : -1;
      const eyeOffset = player.facingRight ? 11 : 7;
      ctx.fillRect(player.x + eyeOffset, player.y + 4, 2, 2);
      ctx.fillRect(player.x + eyeOffset + 4 * eyeDir, player.y + 4, 2, 2);
      // mouth smile
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(player.x + eyeOffset + 2 * eyeDir, player.y + 7, 2.5, 0, Math.PI);
      ctx.stroke();

      // Shirt (Torso)
      ctx.fillStyle = player.shirtColor;
      ctx.beginPath();
      ctx.roundRect(player.x + 2, player.y + 12, 20, 14, 2);
      ctx.fill();

      // Cute white stripe or icon logo on shirt
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(player.x + 9, player.y + 15, 6, 6);

      // Legs/Pants
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x + 3, player.y + 26, 7, 10); // L leg
      ctx.fillRect(player.x + 14, player.y + 26, 7, 10); // R leg

      // Highlight outline on body
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(player.x, player.y, player.w, player.h);

      ctx.restore(); // restores player drawing save state
      ctx.restore(); // restores camera translation save state

      // Render Stage Level indicators and labels on top
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 15px system-ui';
      ctx.fillText(`${lvl.name}`, 15, 25);

      // Red full-screen death flash overlay & YOU DIED message
      if (deathFreezeFrames.current > 0) {
        ctx.fillStyle = `rgba(220, 38, 38, ${Math.min(0.65, deathFreezeFrames.current / 15)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('УНАЖ ҮХЛЭЭ! ☠️', canvas.width / 2, canvas.height / 2 - 10);
        
        ctx.font = 'bold 13px monospace';
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText('ТҮР ХҮЛЭЭНЭ ҮҮ...', canvas.width / 2, canvas.height / 2 + 35);
        ctx.restore();
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, levelIdx, showWinMessage]);

  // Fatal impact reset
  const handleDie = () => {
    if (deathFreezeFrames.current > 0) return; // Prevent multiple consecutive deaths
    
    sound.playDeath();
    setDeaths(d => d + 1);
    
    const player = playerRef.current;
    
    // Spawn red & orange majestic death explosion particles!
    for (let pi = 0; pi < 25; pi++) {
      player.particles.push({
        x: player.x + player.w / 2,
        y: player.y + player.h / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        color: Math.random() < 0.5 ? '#ef4444' : '#f97316',
        size: Math.random() * 4 + 2.5,
        alpha: 1.0
      });
    }

    // Freeze player in place briefly for death feedback
    player.vx = 0;
    player.vy = 0;
    deathFreezeFrames.current = 28; // ~0.45s freeze
  };

  // Winning and transition mechanisms
  const handleLevelWin = () => {
    sound.playWin();
    setScore(s => s + 500);
    if (onGainXp) onGainXp(150);

    const nextLvl = levelIdx + 1;
    if (nextLvl < LEVEL_DATA.length) {
      if (!unlockedLevels.includes(nextLvl)) {
        setUnlockedLevels(prev => [...prev, nextLvl]);
      }
      setLevelIdx(nextLvl);
      loadLevel(nextLvl);
    } else {
      // Game Cleared entirely!
      setShowWinMessage(true);
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative select-none">
      
      {/* LEFT COLUMN: Controls & Game Canvas Screen */}
      <div className="flex-1 p-3 md:p-6 flex flex-col justify-between space-y-4">
        
        {/* TOP STATUS ROW */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-white">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-yellow-400 animate-spin" />
            <span className="font-black text-sm uppercase tracking-widest bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              2D ROBLOX OBBY ARENA
            </span>
          </div>

          <div className="flex items-center gap-3.5 text-xs font-mono font-bold">
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5">
              <span>SCORE:</span>
              <span className="text-yellow-400">{score}</span>
            </div>

            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5 text-red-400">
              <span>DEATHS:</span>
              <span>{deaths}☠️</span>
            </div>

            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5 text-cyan-400">
              <span>TIME:</span>
              <span>{time}s</span>
            </div>
          </div>

          <button
            onClick={() => setMute(!mute)}
            className="p-1 px-2 text-xs bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            {mute ? <VolumeX className="w-4 h-4 inline" /> : <Volume2 className="w-4 h-4 inline" />}
          </button>
        </div>

        {/* INTERACTIVE CANVAS FIELD */}
        <div className="relative border border-white/10 rounded-3xl overflow-hidden shadow-2xl bg-slate-950">
          <canvas
            ref={canvasRef}
            width={900}
            height={480}
            className="w-full h-auto cursor-pointer block select-none touch-none bg-slate-950"
          />

          {/* TOUCH/CLICK START BLOCK */}
          {!isPlaying && !showWinMessage && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-3xl animate-bounce">
                🧱
              </div>

              <div className="space-y-1">
                <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                  ROBLOX 2D OBBY TOГЛООМ 🏃‍♂️
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Буруу газар гишгэлгүйгээр сонирхолтой сааднуудыг даван туулж барианы шаргал блок руу хүрээрэй.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-xs text-[11px] text-slate-300 bg-white/5 p-4 rounded-xl text-left border border-white/10">
                <div>
                  <span className="font-bold text-yellow-500">Hazard (Лава):</span>
                  <p className="text-slate-400">Улаан блок - үхүүлнэ</p>
                </div>
                <div>
                  <span className="font-bold text-pink-500">Jump Pad:</span>
                  <p className="text-slate-400">Ягаан блок - өндөр үсрүүлнэ</p>
                </div>
                <div>
                  <span className="font-bold text-yellow-400">Boost (Хурд):</span>
                  <p className="text-slate-400">Шар блок - хурд нэмнэ</p>
                </div>
                <div>
                  <span className="font-bold text-teal-400">Save (Checkpoint):</span>
                  <p className="text-slate-400">Бадарсан улаан далбаа</p>
                </div>
              </div>

              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:to-red-400 text-slate-950 font-black px-7 py-3.5 rounded-2xl transition-all transform active:scale-95 shadow-xl flex items-center gap-2 cursor-pointer text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>ОДОО ТОГЛОХ 🔥</span>
              </button>
            </div>
          )}

          {/* GAME WON SCREEN OVERLAY */}
          {showWinMessage && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-lg flex flex-col items-center justify-center text-center p-6 space-y-6">
              <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-400 rounded-3xl flex items-center justify-center text-5xl animate-bounce">
                🏆
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  БАЯР ХҮРГЭЕ! ТА ЯЛАГЧ БОЛЛОО! 👑
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Та нийт саад бэрхшээлийг давж Roblox Obby-г бүрэн дуусгалаа! Үнэхээр мундаг байлаа.
                </p>
              </div>

              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 text-xs font-mono">
                <div>СОР ДООД ҮХЭЛТ: <span className="text-red-400 font-extrabold">{deaths} удаа</span></div>
                <div>ЦАГ хугацаа: <span className="text-cyan-400 font-extrabold">{time} секунд</span></div>
                <div>АВсан оноо: <span className="text-yellow-400 font-extrabold">{score}</span></div>
              </div>

              <button
                onClick={resetAllStats}
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black px-8 py-3.5 rounded-2xl transition-all transform active:scale-95 shadow-xl flex items-center gap-2 cursor-pointer text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ЭХНЭЭС НЬ ДАХИН ТОГЛОХ 🔁</span>
              </button>
            </div>
          )}
        </div>

        {/* ON-SCREEN MOBILE / TOUCH CONTROLLER HUD */}
        {isPlaying && !showWinMessage && (
          <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Action guide info */}
            <div className="text-left w-full sm:w-auto">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-yellow-400" />
                УДИРДЛАГЫН ЗААВАР:
              </h5>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5 max-w-sm">
                Компьютер: <strong className="text-white">A, D, чих эсвэл Сумнууд</strong> ашиглан хөдөлнө. <strong className="text-white">W, Сум дээш, эсвэл Space</strong> товчлуураар үсэрнэ.
              </p>
            </div>

            {/* VIRTUAL JUMP CONTROLLER BUTTONS FOR MOBILE/TABLET SCREENS */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-center select-none">
              
              {/* Movement controls block (Left & Right arrows) */}
              <div className="flex items-center gap-2">
                <button
                  onTouchStart={() => { keysRef.current['left'] = true; }}
                  onTouchEnd={() => { keysRef.current['left'] = false; }}
                  onMouseDown={() => { keysRef.current['left'] = true; }}
                  onMouseUp={() => { keysRef.current['left'] = false; }}
                  onMouseLeave={() => { keysRef.current['left'] = false; }}
                  className="w-14 h-14 bg-slate-800 active:bg-yellow-500 hover:bg-slate-750 text-white active:text-slate-950 border border-white/10 rounded-2xl text-xl font-bold flex items-center justify-center transition-all shadow-xl cursor-pointer"
                  style={{ touchAction: 'none' }}
                >
                  ◀
                </button>
                
                <button
                  onTouchStart={() => { keysRef.current['right'] = true; }}
                  onTouchEnd={() => { keysRef.current['right'] = false; }}
                  onMouseDown={() => { keysRef.current['right'] = true; }}
                  onMouseUp={() => { keysRef.current['right'] = false; }}
                  onMouseLeave={() => { keysRef.current['right'] = false; }}
                  className="w-14 h-14 bg-slate-800 active:bg-yellow-500 hover:bg-slate-750 text-white active:text-slate-950 border border-white/10 rounded-2xl text-xl font-bold flex items-center justify-center transition-all shadow-xl cursor-pointer"
                  style={{ touchAction: 'none' }}
                >
                  ▶
                </button>
              </div>

              {/* Huge JUMP spring trigger button */}
              <button
                onTouchStart={() => { keysRef.current['jump'] = true; }}
                onTouchEnd={() => { keysRef.current['jump'] = false; }}
                onMouseDown={() => { keysRef.current['jump'] = true; }}
                onMouseUp={() => { keysRef.current['jump'] = false; }}
                onMouseLeave={() => { keysRef.current['jump'] = false; }}
                className="h-14 px-8 bg-gradient-to-r from-pink-500 to-rose-500 active:from-pink-400 active:to-rose-450 text-white border border-white/20 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-2xl shrink-0 cursor-pointer"
                style={{ touchAction: 'none' }}
              >
                <span>ҮСРЭХ (JUMP)</span>
                <span className="text-base animate-bounce">🚀</span>
              </button>

            </div>

          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Stage selector list and avatar customization selector */}
      <div className="w-full md:w-80 bg-slate-950/60 p-4 md:p-6 border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between space-y-6 shrink-0">
        
        {/* Stages lists */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-yellow-400" />
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">
              СОРИЛТЫН ТҮВШНҮҮД
            </h4>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
            {LEVEL_DATA.map((lvl, idx) => {
              const isUnlocked = unlockedLevels.includes(idx);
              const isActive = levelIdx === idx;
              return (
                <button
                  key={idx}
                  disabled={!isUnlocked}
                  onClick={() => {
                    loadLevel(idx);
                    setIsPlaying(true);
                  }}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all relative overflow-hidden group ${
                    isActive 
                      ? 'bg-slate-900 border-yellow-500 text-yellow-400 shadow-lg font-bold' 
                      : isUnlocked
                        ? 'bg-slate-950/40 border-white/5 text-slate-200 hover:border-white/15 cursor-pointer'
                        : 'bg-slate-950/10 border-white/5 text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-mono block">ТҮВШИН {idx + 1}</span>
                    <span className="text-xs">{lvl.name}</span>
                  </div>
                  {isActive ? (
                    <span className="text-xs">Тоглож буй</span>
                  ) : isUnlocked ? (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-md">Нээлттэй</span>
                  ) : (
                    <span className="text-xs">🔒</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Simple Avatar Customization */}
        <div className="space-y-3.5 bg-slate-950/80 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider">
              AVATAR GEAR (АВАТАР СОНГОХ)
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Cyan', shirt: '#ef4444', pants: '#38bdf8' },
              { label: 'Green', shirt: '#10b981', pants: '#06b6d4' },
              { label: 'Gamer', shirt: '#a855f7', pants: '#eab308' },
              { label: 'Dark', shirt: '#ec4899', pants: '#171717' },
            ].map((cloth, idx) => {
              const isSelected = playerRef.current.shirtColor === cloth.shirt;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    const player = playerRef.current;
                    player.shirtColor = cloth.shirt;
                    player.color = cloth.pants;
                    sound.playCoin();
                  }}
                  className={`relative h-11 rounded-lg border-2 flex flex-col justify-center items-center transition-all bg-slate-900 ${
                    isSelected ? 'border-yellow-400 scale-105' : 'border-white/5 hover:border-white/20'
                  }`}
                  title={`${cloth.label} хувцас`}
                >
                  <span className="text-xs">👕</span>
                  <div className="flex gap-0.5 mt-0.5">
                    <div className="w-2 h-1.5 rounded-sm" style={{ backgroundColor: cloth.shirt }}></div>
                    <div className="w-2 h-1.5 rounded-sm" style={{ backgroundColor: cloth.pants }}></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level Complete / XP Note */}
        <div className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-widest border-t border-white/5 pt-4">
          Нийт сааднуудыг давах бүрт таны хэрэглэгчийн XP хэмжээ огцом өснө! 🌟
        </div>

      </div>

    </div>
  );
}
