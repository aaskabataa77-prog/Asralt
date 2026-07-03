import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Timer, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Flame, 
  Volume2, 
  HelpCircle,
  Play,
  CheckCircle,
  XCircle,
  BookOpen,
  Crown,
  Award,
  User,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';


interface Question {
  id: number;
  emojis: string;
  answer: string;
  options: string[];
  answers: string[];
  image?: string;
  character_image?: string;
  video: string;
  hint: string;
  trivia: string;
}

interface AnimeGuesserProps {
  onGainXp: (amount: number, message: string) => void;
}

export default function AnimeGuesser({ onGainXp }: AnimeGuesserProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestionsData, setAllQuestionsData] = useState<{ anime: Question[], characters: Question[] } | null>(null);
  const [quizMode, setQuizMode] = useState<'anime' | 'character'>('anime');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('easy');
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [shakeButton, setShakeButton] = useState<string | null>(null);
  const [shakeInput, setShakeInput] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'revealed' | 'gameover' | 'victory'>('start');

  // Lifelines (hints) states (per game or per question)
  const [hintUsed, setHintUsed] = useState<boolean>(false);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState<boolean>(false);
  const [fiftyFiftyActive, setFiftyFiftyActive] = useState<boolean>(false);
  const [revealLetterUsed, setRevealLetterUsed] = useState<boolean>(false);
  const [revealLetterActive, setRevealLetterActive] = useState<boolean>(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  
  // Fever mode triggers
  const [isFeverMode, setIsFeverMode] = useState<boolean>(false);

  // User answers log tracking
  const [userAnswers, setUserAnswers] = useState<Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>>([]);

  // Leaderboard states
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // Score submission states
  const [playerName, setPlayerName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);


  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load questions from data.json
  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => {
        setAllQuestionsData(data);
        // Default set questions to anime
        setQuestions(data.anime || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load anime quiz questions:", err);
        setLoading(false);
      });
  }, []);

  // Fetch TOP 10 high scores from Firestore
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const q = query(
        collection(db, 'scores'), 
        orderBy('score', 'desc'), 
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const scoresList: any[] = [];
      querySnapshot.forEach((doc) => {
        scoresList.push({ id: doc.id, ...doc.data() });
      });
      setLeaderboard(scoresList);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Submit high score to Firestore
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmitting || isSubmitted) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await addDoc(collection(db, 'scores'), {
        name: playerName.trim(),
        score: score,
        mode: quizMode === 'anime' ? 'Анимэ таах' : 'Баатрын дүр таах',
        difficulty: difficulty === 'easy' ? 'Хялбар' : difficulty === 'normal' ? 'Дундаж' : 'Отаку',
        answers: userAnswers,
        timestamp: serverTimestamp()
      });
      setIsSubmitted(true);
      playSound('victory');
      // Refresh leaderboard list after successful submit
      await fetchLeaderboard();
    } catch (err: any) {
      console.error("Error saving score to Firestore:", err);
      setSubmitError("Оноо хадгалахад алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !showQuitConfirm) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing' && !hasAnswered && !showQuitConfirm) {
      handleTimeOut();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, gameState, hasAnswered, showQuitConfirm]);

  // Sound effects generator via Web Audio API
  const playSound = (type: 'ding' | 'buzz' | 'streak' | 'gameover' | 'victory' | 'fever') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      if (type === 'ding') {
        // High-pitched sweet chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc1.frequency.setValueAtTime(783.99, now + 0.16); // G5
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1046.50, now); // C6
        osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.4);
        osc2.start(now);
        osc2.stop(now + 0.4);
      } else if (type === 'buzz') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'streak') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.12, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.25);
        });
      } else if (type === 'fever') {
        // Dramatic fever mode chime
        const notes = [440, 554.37, 659.25, 880, 1108.73]; // A Major arpeggio
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.15, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.35);
        });
      } else if (type === 'gameover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(55, now + 0.7);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
      } else if (type === 'victory') {
        const chords = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.1, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.45);
        });
      }
    } catch (e) {
      console.warn("Web Audio API failed/blocked", e);
    }
  };

  const getDifficultyTime = (diff: 'easy' | 'normal' | 'hard') => {
    if (diff === 'easy') return 20;
    if (diff === 'normal') return 12;
    return 15; // hard
  };

  const startGame = () => {
    if (!allQuestionsData) return;

    // Choose appropriate questions list based on selected mode
    const selectedList = quizMode === 'anime' ? allQuestionsData.anime : allQuestionsData.characters;
    // Shuffle list and also shuffle options of each question to make gameplay dynamic and fun
    const shuffledList = [...selectedList]
      .sort(() => 0.5 - Math.random())
      .map(q => ({
        ...q,
        options: [...q.options].sort(() => 0.5 - Math.random())
      }));
    setQuestions(shuffledList);

    setScore(0);
    setLives(3);
    setStreak(0);
    setCurrentIndex(0);
    setTimeLeft(getDifficultyTime(difficulty));
    setHasAnswered(false);
    setSelectedOption(null);
    setTypedAnswer('');
    setUserAnswers([]);
    setIsSubmitted(false);
    setSubmitError(null);
    setShowQuitConfirm(false);
    
    // Reset lifelines
    setHintUsed(false);
    setFiftyFiftyUsed(false);
    setFiftyFiftyActive(false);
    setRevealLetterUsed(false);
    setRevealLetterActive(false);
    setEliminatedOptions([]);
    setIsFeverMode(false);

    setGameState('playing');
  };

  const handleTimeOut = () => {
    playSound('buzz');
    setHasAnswered(true);
    setIsCorrect(false);
    setSelectedOption(null);
    const newLives = lives - 1;
    setLives(newLives);
    setStreak(0);
    setIsFeverMode(false);

    const currentQuestion = questions[currentIndex];
    setUserAnswers(prev => [...prev, {
      question: quizMode === 'anime' ? `${currentQuestion.emojis} (${currentQuestion.answer})` : currentQuestion.answer,
      userAnswer: 'Хугацаа дууссан ⏰',
      correctAnswer: currentQuestion.answer,
      isCorrect: false
    }]);

    setTimeout(() => {
      setGameState('revealed');
    }, 1000);
  };

  // Helper for applying 50/50 lifeline
  const useFiftyFifty = () => {
    if (fiftyFiftyUsed || hasAnswered || difficulty === 'hard') return;
    const currentQ = questions[currentIndex];
    
    // Find incorrect options
    const incorrectOptions = currentQ.options.filter(opt => opt !== currentQ.answer);
    
    // Randomly pick 2 incorrect options to eliminate
    const shuffledIncorrect = [...incorrectOptions].sort(() => 0.5 - Math.random());
    const eliminated = shuffledIncorrect.slice(0, 2);
    
    setEliminatedOptions(eliminated);
    setFiftyFiftyUsed(true);
    setFiftyFiftyActive(true);
    
    // Deduct points as cost for help
    setScore(prev => Math.max(0, prev - 3));
    playSound('buzz'); // small sound to notify cost
  };

  // Helper for text hint lifeline
  const useTextHint = () => {
    if (hintUsed || hasAnswered) return;
    setHintUsed(true);
    // Deduct points as cost
    setScore(prev => Math.max(0, prev - 3));
    playSound('streak'); // magic sound for hint revealed
  };

  // Helper for letter reveal lifeline
  const useLetterReveal = () => {
    if (revealLetterUsed || hasAnswered) return;
    setRevealLetterUsed(true);
    setRevealLetterActive(true);
    // Deduct points as cost
    setScore(prev => Math.max(0, prev - 3));
    playSound('streak');
  };

  // Check answer helper (works for both options clicking and manual typing)
  const processAnswer = (userAnswer: string, isFromOption: boolean) => {
    if (hasAnswered) return;

    const currentQuestion = questions[currentIndex];
    
    // Normalization logic: trim, lowercase, remove spaces to ensure robust checks
    const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
    const normUser = normalize(userAnswer);
    
    // Check match
    let correct = false;
    if (isFromOption) {
      // Direct comparison with exact correct option
      correct = normalize(userAnswer) === normalize(currentQuestion.answer);
    } else {
      // Check in answers array for typed entry
      correct = currentQuestion.answers.some(ans => normalize(ans) === normUser);
    }

    setHasAnswered(true);
    setIsCorrect(correct);

    // Save user answer to log
    setUserAnswers(prev => [...prev, {
      question: quizMode === 'anime' ? `${currentQuestion.emojis} (${currentQuestion.answer})` : currentQuestion.answer,
      userAnswer: userAnswer,
      correctAnswer: currentQuestion.answer,
      isCorrect: correct
    }]);

    if (correct) {
      playSound('ding');
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      
      let pointsToAdd = 10;
      let xpMessage = "+10 оноо авлаа!";
      
      // If in Fever Mode, double the base points!
      if (isFeverMode) {
        pointsToAdd = 20;
        xpMessage = "🔥 СЭРГЭЛТ (FEVER): +20 оноо!";
      }

      const modeLabel = quizMode === 'anime' ? "Анимэ Таавар" : "Баатрын Таавар";

      // Check streak bonus / fever trigger: 3 consecutive correct
      if (nextStreak === 3) {
        setIsFeverMode(true);
        pointsToAdd += 20; // Additional +20 points bonus
        setTimeout(() => playSound('fever'), 150);
        xpMessage = `Дараалсан ${nextStreak} зөв! 🔥 FEVER MODE идэвхжлээ! Нэмэлт +20 бонус!`;
        onGainXp(30, `${modeLabel}: 3 дараалж зөв таалаа! FEVER идэвхжлээ! ⚡`);
      } else if (nextStreak > 3) {
        // Fever mode ongoing bonus
        pointsToAdd += 10; // +10 extra points per correct inside Fever
        xpMessage = `🔥 FEVER СЭРГЭЛТ ОНГОЙЖ БАЙНА! +${pointsToAdd} оноо!`;
        onGainXp(15, `${modeLabel}: Fever цуврал үргэлжилсээр!`);
      } else {
        onGainXp(10, `${modeLabel}: Зөв хариуллаа!`);
      }

      setScore(prev => prev + pointsToAdd);

      setTimeout(() => {
        setGameState('revealed');
      }, 1000);
    } else {
      playSound('buzz');
      setIsFeverMode(false); // Lose fever mode

      if (isFromOption) {
        setShakeButton(userAnswer);
        setTimeout(() => setShakeButton(null), 500);
      } else {
        setShakeInput(true);
        setTimeout(() => setShakeInput(false), 500);
      }

      const nextLives = lives - 1;
      setLives(nextLives);
      setStreak(0);

      setTimeout(() => {
        setGameState('revealed');
      }, 1000);
    }
  };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    processAnswer(option, true);
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim()) return;
    processAnswer(typedAnswer, false);
  };

  const handleNextQuestion = () => {
    if (lives <= 0) {
      playSound('gameover');
      setGameState('gameover');
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      playSound('victory');
      setGameState('victory');
      const modeLabel = quizMode === 'anime' ? "Анимэ Таавар" : "Баатрын Таавар";
      onGainXp(50, `${modeLabel}-г амжилттай дуусгалаа! Нийт оноо: ${score}`);
    } else {
      setCurrentIndex(nextIndex);
      setTimeLeft(getDifficultyTime(difficulty));
      setHasAnswered(false);
      setSelectedOption(null);
      setTypedAnswer('');
      setGameState('playing');
      
      // Reset question-specific lifeline states
      setFiftyFiftyActive(false);
      setRevealLetterActive(false);
      setEliminatedOptions([]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 min-h-[350px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">Асуултуудыг ачаалж байна...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className={`relative w-full text-slate-200 transition-all duration-500 rounded-3xl ${isFeverMode ? 'bg-gradient-to-b from-[#180505] to-[#080310] shadow-[0_0_40px_rgba(239,68,68,0.15)] border border-red-500/20' : ''}`}>
      {/* Sound Toggle Control & Current Mode display */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 bg-stone-950/75 border border-white/5 py-1 px-2.5 rounded-full">
          <Volume2 className={`w-3.5 h-3.5 ${soundEnabled ? 'text-indigo-400' : 'text-slate-500'}`} />
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="text-[9.5px] uppercase font-black tracking-wider text-slate-400 hover:text-slate-200"
          >
            {soundEnabled ? "Дуутай" : "Дуугүй"}
          </button>
        </div>
        {(gameState === 'playing' || gameState === 'revealed') && (
          <div className={`py-1 px-2.5 rounded-full text-[9px] uppercase font-black border tracking-wider ${
            difficulty === 'easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            difficulty === 'normal' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {difficulty === 'easy' ? "Хялбар" : difficulty === 'normal' ? "Дундаж" : "Отаку (Хэцүү)"}
          </div>
        )}
        {(gameState === 'playing' || gameState === 'revealed') && (
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 py-1 px-2.5 rounded-full text-[9.5px] uppercase font-black tracking-wider text-rose-400 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 duration-150"
          >
            ✕ Гарах
          </button>
        )}
      </div>

      {/* Custom Quit Confirmation Overlay Dialog */}
      {showQuitConfirm && (
        <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 rounded-3xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0e0c1b] border-2 border-rose-500/30 rounded-2.5xl p-6 text-center max-w-sm w-full space-y-5 shadow-[0_0_50px_rgba(244,63,94,0.15)]"
          >
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-3xl mx-auto animate-pulse">
              ⚠️
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Тоглоомоос гарах уу?</h3>
              <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans">
                Таны одоогийн цуглуулсан <span className="text-amber-400 font-bold">{score} оноо</span> хадгалагдахгүй бөгөөд тоглоом цуцлагдахыг анхаарна уу.
              </p>
            </div>
            
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  setShowQuitConfirm(false);
                  setGameState('start');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-extrabold text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-950/20"
              >
                Тийм, Гарах
              </button>
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/5 text-slate-300 font-extrabold text-[11px] uppercase tracking-wider transition-all cursor-pointer"
              >
                Үргэлжлүүлэх
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <motion.div 
            key="start"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 text-center max-w-md mx-auto space-y-6"
          >
            {!showLeaderboard ? (
              <>
                <div className="space-y-2">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 via-amber-500 to-red-500 flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-indigo-950/50 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    🎌
                  </div>
                  <h2 className="text-xl font-black bg-gradient-to-r from-red-400 via-amber-300 to-rose-300 bg-clip-text text-transparent uppercase tracking-tight pt-2">
                    Анимэ Таавар PRO
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Эможиноос бүрдсэн кодыг тайлах эсвэл хайртай баатруудынхаа зургийг харж таагаарай!
                  </p>
                </div>

                {/* Quiz Mode Selector */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Тоглоомын Горим сонгох:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setQuizMode('anime');
                        if (allQuestionsData) setQuestions(allQuestionsData.anime);
                      }}
                      className={`py-3 px-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        quizMode === 'anime' 
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                          : 'bg-[#090714] border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <span>📺 Анимэ таах</span>
                      <span className="text-[8px] font-medium text-slate-500 lowercase">Эможи кодоор таах</span>
                    </button>
                    <button
                      onClick={() => {
                        setQuizMode('character');
                        if (allQuestionsData) setQuestions(allQuestionsData.characters);
                      }}
                      className={`py-3 px-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        quizMode === 'character' 
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]' 
                          : 'bg-[#090714] border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <span>🦸 Баатрын дүр таах</span>
                      <span className="text-[8px] font-medium text-slate-500 lowercase">Зураг ба эможи харах</span>
                    </button>
                  </div>
                </div>

                {/* Difficulty Selector */}
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Хүндрэлийн Түвшин сонгох:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setDifficulty('easy')}
                      className={`py-3 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        difficulty === 'easy' 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
                          : 'bg-[#090714] border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      🟢 Хялбар
                      <span className="block text-[8px] font-medium text-slate-500 lowercase pt-0.5">4 сонголттой, 20с</span>
                    </button>
                    <button
                      onClick={() => setDifficulty('normal')}
                      className={`py-3 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        difficulty === 'normal' 
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
                          : 'bg-[#090714] border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      🟡 Дундаж
                      <span className="block text-[8px] font-medium text-slate-500 lowercase pt-0.5">4 сонголттой, 12с</span>
                    </button>
                    <button
                      onClick={() => setDifficulty('hard')}
                      className={`py-3 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        difficulty === 'hard' 
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.25)]' 
                          : 'bg-[#090714] border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      🔥 Отаку
                      <span className="block text-[8px] font-medium text-slate-500 lowercase pt-0.5">Сонголтгүй, 15с</span>
                    </button>
                  </div>
                </div>

                {/* Game Rules Sheet */}
                <div className="bg-[#0b0a16] border border-white/5 rounded-2xl p-4 text-left space-y-2.5">
                  <h4 className="text-[11px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Тоглоомын дүрэм ба шинэ боломж:
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-300 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">✔️</span> 
                      <span>Зөв хариулбал <strong className="text-white">+10 оноо</strong> авна.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">✔️</span> 
                      <span>Дараалж <strong className="text-red-400">3 зөв</strong> хариулбал <strong className="text-red-400">🔥 FEVER MODE</strong> идэвхжиж оноо <strong className="text-red-400">2 дахин</strong> үржигдэнэ!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">✔️</span> 
                      <span>Хэцүү үедээ <strong className="text-indigo-400">Lifelines (Тусламж)</strong> ашиглаж болно. Гэхдээ тусламж бүр <strong className="text-rose-400">-3 онооны</strong> өртөгтэй!</span>
                    </li>
                  </ul>
                </div>

                {/* Dual grid action buttons: Start Game & Leaderboard */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={startGame}
                    className="py-3.5 px-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transform active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" /> Тоглоомыг Эхлэх
                  </button>
                  <button
                    onClick={() => {
                      setShowLeaderboard(true);
                      fetchLeaderboard();
                    }}
                    className="py-3.5 px-3 rounded-2xl bg-[#090714]/80 hover:bg-white/5 border border-white/10 text-amber-300 font-extrabold text-xs uppercase tracking-wider transform active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    🏆 Топ 10 оноо
                  </button>
                </div>
              </>
            ) : (
              <div className="text-left space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">ТОП 10 Тоглогчийн Leaderboard</h3>
                  </div>
                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-xl transition-all cursor-pointer font-bold"
                  >
                    Буцах ✕
                  </button>
                </div>

                {loadingLeaderboard ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ачаалж байна...</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs font-semibold bg-stone-950/20 rounded-2xl border border-white/5">
                    Одоогоор оноо хадгалагдаагүй байна. 🎮
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {leaderboard.map((item, idx) => {
                      let badge = "text-slate-400";
                      let bgGlow = "border-white/5 bg-stone-950/60";
                      if (idx === 0) {
                        badge = "text-yellow-400 font-bold";
                        bgGlow = "border-amber-500/20 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)]";
                      } else if (idx === 1) {
                        badge = "text-slate-300 font-bold";
                        bgGlow = "border-slate-400/20 bg-slate-400/5";
                      } else if (idx === 2) {
                        badge = "text-amber-600 font-bold";
                        bgGlow = "border-amber-700/20 bg-amber-700/5";
                      }

                      return (
                        <div
                          key={item.id || idx}
                          className={`flex items-center justify-between p-3 rounded-2xl border hover:border-white/15 transition-all ${bgGlow}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`text-xs w-6 text-center ${badge}`}>
                              {idx === 0 ? "👑" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                            </span>
                            <div className="min-w-0">
                              <span className="text-xs font-black text-white truncate block">{item.name}</span>
                              <span className="text-[8.5px] text-slate-400 uppercase tracking-widest block font-bold mt-0.5">
                                {item.mode} • {item.difficulty}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-amber-300 block">{item.score} <span className="text-[9px] text-slate-500 lowercase font-medium">оноо</span></span>
                            {item.timestamp && (
                              <span className="text-[8.5px] text-slate-500 block font-semibold">
                                {new Date(item.timestamp.seconds * 1000).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {gameState === 'playing' && currentQuestion && (
          <motion.div 
            key={`playing-${currentIndex}`}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="p-5 w-full max-w-lg mx-auto space-y-5"
          >
            {/* Fever Mode Banner */}
            {isFeverMode && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-black text-center text-xs py-1.5 px-3 rounded-full uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-bounce"
              >
                <Flame className="w-4 h-4 animate-pulse fill-white" /> FEVER MODE ИДЭВХТЭЙ! 2X ОНОО 🔥
              </motion.div>
            )}

            {/* Top Dashboard: Score, Streak, Timer, Lives */}
            <div className={`grid grid-cols-4 gap-2 border rounded-2xl p-3 text-center transition-all duration-300 ${isFeverMode ? 'bg-[#1a0606] border-red-500/30' : 'bg-[#090714] border-white/5'}`}>
              <div>
                <span className="text-[9px] uppercase font-black text-slate-500 block">Оноо</span>
                <span className="text-sm font-black text-amber-300 flex items-center justify-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> {score}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-black text-slate-500 block">Дараалсан</span>
                <span className="text-sm font-black text-rose-400 flex items-center justify-center gap-0.5">
                  <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-600'}`} /> 
                  {streak}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-black text-slate-500 block">Хугацаа</span>
                <span className={`text-sm font-black flex items-center justify-center gap-1 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                  <Timer className="w-3.5 h-3.5" /> {timeLeft}с
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-black text-slate-500 block">Амь</span>
                <div className="flex items-center justify-center gap-0.5 pt-0.5">
                  {[...Array(3)].map((_, i) => (
                    <Heart 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-stone-800'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Questions Tracker */}
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Асуулт {currentIndex + 1} / {questions.length}</span>
              {isFeverMode && (
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-black flex items-center gap-1 uppercase tracking-wider animate-pulse">
                  <Flame className="w-3.5 h-3.5" /> БҮХ ОНОО 2 ДАХИН ӨСНӨ!
                </span>
              )}
            </div>

            {/* EMOJI MAIN BOX OR CHARACTER IMAGE DISPLAY */}
            <div className={`relative py-6 px-4 border rounded-3xl text-center shadow-xl flex flex-col items-center justify-center space-y-3 overflow-hidden transition-all duration-300 ${
              isFeverMode 
                ? 'bg-gradient-to-b from-[#240a0a]/70 to-[#120303]/90 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                : 'bg-gradient-to-b from-[#110d2b]/60 to-[#080617]/90 border-white/5 shadow-stone-950/50'
            }`}>
              {/* Background blurred image preview */}
              {currentQuestion && (currentQuestion.image || currentQuestion.character_image) && (
                <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl pointer-events-none">
                  <img 
                    src={currentQuestion.image || currentQuestion.character_image} 
                    alt="Background preview" 
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      hasAnswered 
                        ? 'opacity-30 blur-[2px] scale-110' 
                        : 'opacity-[0.07] blur-[10px] scale-100'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/70 to-[#080617]/95"></div>
                </div>
              )}

              <div className="absolute top-2.5 left-3 text-[9px] uppercase font-extrabold text-indigo-400 tracking-wider flex items-center gap-1 z-10">
                <HelpCircle className="w-3 h-3" /> {quizMode === 'anime' ? "Эможиг таа" : "Баатрыг таа"}
              </div>

              {quizMode === 'character' && currentQuestion.character_image && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-40 h-40 md:w-44 md:h-44 rounded-2xl overflow-hidden border border-white/10 shadow-lg z-10"
                >
                  <img 
                    src={currentQuestion.character_image} 
                    alt="Аниме Баатар" 
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      hasAnswered 
                        ? 'blur-none opacity-100 scale-100' 
                        : 'blur-[3px] opacity-75 scale-100'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  {!hasAnswered && <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent"></div>}
                </motion.div>
              )}

              {quizMode === 'anime' && currentQuestion.image && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative w-48 h-28 md:w-56 md:h-32 rounded-2xl overflow-hidden border border-white/10 shadow-lg z-10 bg-[#090714]"
                >
                  <img 
                    src={currentQuestion.image} 
                    alt="Анимэ сэжүүр зураг" 
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      hasAnswered 
                        ? 'blur-none opacity-100 scale-100' 
                        : 'blur-[4px] opacity-75 brightness-95 scale-100'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  {!hasAnswered && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>}
                  {!hasAnswered && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8.5px] bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-indigo-300 border border-indigo-500/30 font-black uppercase tracking-wider">
                        🔒 Будгарсан зураг
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className={`text-4xl md:text-5xl tracking-wider select-none py-1 filter z-10 ${
                  isFeverMode 
                    ? 'drop-shadow-[0_8px_20px_rgba(239,68,68,0.45)]' 
                    : 'drop-shadow-[0_8px_16px_rgba(99,102,241,0.25)]'
                }`}
              >
                {currentQuestion.emojis}
              </motion.div>
              <p className="text-[11px] text-slate-400 z-10">
                {quizMode === 'anime' 
                  ? "Дээрх эможинууд ямар анимэг илтгэж байна вэ?" 
                  : "Зураг болон эможиг ашиглан баатрын нэрийг таана уу!"
                }
              </p>
              
              {/* Revealed First Letter Hint Display */}
              {revealLetterActive && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-2 text-xs bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-lg font-mono font-black z-10"
                >
                  Нэрний эхний үсэг: "{currentQuestion.answer.charAt(0)}" ...
                </motion.div>
              )}

              {/* Show Text Hint Display */}
              {hintUsed && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl max-w-sm text-left z-10"
                >
                  <p className="text-[10px] uppercase font-black text-amber-400">Зөвлөмж:</p>
                  <p className="text-[11px] text-amber-200 font-medium leading-relaxed">{currentQuestion.hint}</p>
                </motion.div>
              )}
            </div>

            {/* LIFELINES / TUSLAMJUUD (Interactive Hints panel) */}
            <div className="bg-stone-950/40 border border-white/5 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Тусламж авах (Өртөгтэй: -3 оноо)</span>
                <span className="text-[8px] text-rose-400 font-bold uppercase">Одоогийн онооноос хасагдана</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* 50/50 lifeline: only for easy/normal difficulty */}
                <button
                  type="button"
                  disabled={fiftyFiftyUsed || hasAnswered || difficulty === 'hard'}
                  onClick={useFiftyFifty}
                  className={`py-2 px-1.5 rounded-xl border text-[9.5px] font-black uppercase tracking-wider flex flex-col items-center justify-center transition-all gap-0.5 ${
                    difficulty === 'hard' 
                      ? 'opacity-20 cursor-not-allowed border-white/5 text-slate-600 bg-transparent'
                      : fiftyFiftyUsed 
                        ? 'opacity-40 cursor-not-allowed border-white/5 text-slate-500 bg-[#090714]'
                        : 'bg-[#0e0a25] border-indigo-500/20 hover:border-indigo-500/60 text-indigo-300 hover:bg-[#150f38] cursor-pointer'
                  }`}
                >
                  <span>🌗 50:50</span>
                  <span className="text-[7.5px] font-medium text-slate-400 lowercase">{difficulty === 'hard' ? 'Отаку-д хаалттай' : '2 бурууг хасах'}</span>
                </button>

                {/* Text Hint lifeline */}
                <button
                  type="button"
                  disabled={hintUsed || hasAnswered}
                  onClick={useTextHint}
                  className={`py-2 px-1.5 rounded-xl border text-[9.5px] font-black uppercase tracking-wider flex flex-col items-center justify-center transition-all gap-0.5 ${
                    hintUsed 
                      ? 'opacity-40 cursor-not-allowed border-white/5 text-slate-500 bg-[#090714]'
                      : 'bg-[#0e0a25] border-indigo-500/20 hover:border-indigo-500/60 text-indigo-300 hover:bg-[#150f38] cursor-pointer'
                  }`}
                >
                  <span>💡 Зөвлөмж</span>
                  <span className="text-[7.5px] font-medium text-slate-400 lowercase">тайлбар харах</span>
                </button>

                {/* First Letter Reveal lifeline */}
                <button
                  type="button"
                  disabled={revealLetterUsed || hasAnswered}
                  onClick={useLetterReveal}
                  className={`py-2 px-1.5 rounded-xl border text-[9.5px] font-black uppercase tracking-wider flex flex-col items-center justify-center transition-all gap-0.5 ${
                    revealLetterUsed 
                      ? 'opacity-40 cursor-not-allowed border-white/5 text-slate-500 bg-[#090714]'
                      : 'bg-[#0e0a25] border-indigo-500/20 hover:border-indigo-500/60 text-indigo-300 hover:bg-[#150f38] cursor-pointer'
                  }`}
                >
                  <span>🔤 Үсэг нээх</span>
                  <span className="text-[7.5px] font-medium text-slate-400 lowercase">эхний үсгийг харах</span>
                </button>
              </div>
            </div>

            {/* Choice buttons (4 Options) with glow/hover effect - ONLY SHOW ON EASY/NORMAL DIFFICULTY */}
            {difficulty !== 'hard' && (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOption === option;
                  const isCorrectOption = option === currentQuestion.answer;
                  const isShaking = shakeButton === option;
                  const isEliminated = eliminatedOptions.includes(option);

                  if (isEliminated) {
                    return (
                      <div 
                        key={option} 
                        className="p-4 rounded-2xl border border-dashed border-white/5 bg-[#070513]/30 text-slate-700 font-bold text-xs text-center select-none opacity-20"
                      >
                        ❌ Хасагдсан
                      </div>
                    );
                  }

                  let btnStyle = "border-white/10 bg-[#0c0924]/80 text-slate-200 hover:border-indigo-400 hover:bg-[#15113c] hover:shadow-[0_0_20px_rgba(99,102,241,0.45)] hover:scale-105";
                  
                  if (hasAnswered) {
                    if (isCorrectOption) {
                      btnStyle = "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.55)] font-black scale-102";
                    } else if (isSelected && !isCorrect) {
                      btnStyle = "border-red-400 bg-red-500/20 text-red-300 shadow-[0_0_25px_rgba(239,68,68,0.55)] font-black";
                    } else {
                      btnStyle = "border-white/5 bg-stone-900/30 text-slate-500 opacity-40 cursor-not-allowed";
                    }
                  }

                  return (
                    <motion.button
                      key={option}
                      disabled={hasAnswered}
                      onClick={() => handleOptionClick(option)}
                      whileHover={!hasAnswered ? { scale: 1.05, y: -2 } : {}}
                      whileTap={!hasAnswered ? { scale: 0.96 } : {}}
                      animate={isShaking ? { x: [0, -12, 12, -12, 12, -8, 8, -4, 4, 0], rotate: [0, -3, 3, -3, 3, -1, 1, 0] } : {}}
                      transition={isShaking ? { type: "tween", duration: 0.5 } : { type: "spring", stiffness: 300, damping: 15 }}
                      className={`p-4 rounded-2xl border font-bold text-xs text-center cursor-pointer transition-all duration-300 ${btnStyle}`}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Manual Type Input Section - ALWAYS SHOW, MANDATORY ON HARD */}
            <div className="pt-2">
              <form onSubmit={handleTypeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <motion.input
                    type="text"
                    disabled={hasAnswered}
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder={difficulty === 'hard' ? "Зөвхөн гараас бичиж хариулна! (Яг таг зөв нэр)..." : "Эсвэл хариултыг гараас шивж оруулж болно..."}
                    animate={shakeInput ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`w-full py-3.5 px-4 rounded-2xl bg-[#090714] border text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all ${
                      difficulty === 'hard' 
                        ? 'border-rose-500/30 focus:border-rose-500/60 focus:shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
                        : 'border-white/5 focus:border-indigo-500/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={hasAnswered || !typedAnswer.trim()}
                  className={`px-5 rounded-2xl border font-extrabold text-xs uppercase tracking-wide cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all ${
                    difficulty === 'hard'
                      ? 'bg-rose-600/20 hover:bg-rose-600/30 border-rose-500/30 text-rose-300'
                      : 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/30 text-indigo-300'
                  }`}
                >
                  Оруулах
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {gameState === 'revealed' && currentQuestion && (
          <motion.div 
            key={`revealed-${currentIndex}`}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="p-5 w-full max-w-lg mx-auto space-y-5"
          >
            {/* Answer Feedback Header */}
            <div className={`flex items-center gap-3 border p-4 rounded-2xl transition-all duration-300 ${
              isCorrect 
                ? 'bg-[#071911]/80 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                : 'bg-[#1c080e]/80 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
            }`}>
              {isCorrect ? (
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-[10px] font-black uppercase text-slate-400">Хариултын Үр Дүн</h4>
                <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  Зөв хариулт: <span className="text-indigo-400 font-black">{currentQuestion.answer}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 block">Одоогийн оноо</span>
                <span className="text-xs font-extrabold text-amber-300">{score} оноо</span>
              </div>
            </div>

            {/* Image Banner, YouTube Video, and FUN FACT Trivia */}
            <div className="bg-[#0b0a16] border border-white/5 rounded-3xl overflow-hidden shadow-xl space-y-4">
              {/* Anime High Quality Image Banner */}
              <div className="relative h-44 w-full">
                <img 
                  src={currentQuestion.image || currentQuestion.character_image} 
                  alt={currentQuestion.answer}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a16] via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-4">
                  <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">
                    {quizMode === 'anime' ? "Нээгдсэн анимэ" : "Нээгдсэн баатар"}
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight filter drop-shadow-md">{currentQuestion.answer}</h3>
                </div>
              </div>

              {/* FUN FACT / TRIVIA BOX (New engaging feature to avoid boredom) */}
              <div className="px-4 py-1.5">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-black uppercase text-amber-400 tracking-wide">
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" /> Мэдэхэд илүүдэхгүй (Trivia):
                  </div>
                  <p className="text-[11.5px] text-amber-200 font-medium leading-relaxed">
                    {currentQuestion.trivia || "Энэ анимэ нь дэлхий даяар сая сая фенүүдтэй бөгөөд салбартаа томоохон нөлөө үзүүлсэн шилдэг бүтээл юм."}
                  </p>
                </div>
              </div>

              {/* YouTube Iframe Embed for immersive video/theme song */}
              <div className="px-4 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    🎬 Сэдэвт дуу / Трейлер сонсох
                  </span>
                  <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">YouTube</span>
                </div>
                
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/5 bg-stone-950">
                  <iframe
                    src={`${currentQuestion.video}?autoplay=1&mute=0`}
                    title={`${currentQuestion.answer} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Next question button */}
            <button
              onClick={handleNextQuestion}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-indigo-900/50 transform active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              {lives <= 0 ? (
                <>Үр дүнг харах 💀</>
              ) : (
                <>Дараагийн асуулт <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </motion.div>
        )}

        {gameState === 'gameover' && (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 text-center max-w-md mx-auto space-y-5"
          >
            <div className="space-y-1">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-4xl mx-auto animate-bounce">
                💀
              </div>
              <h2 className="text-xl font-black text-rose-500 uppercase tracking-wider pt-2">Тоглоом Дууслаа!</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Танд үлдэх амь дууслаа. Дараагийн удаа илүү сайн хичээгээрэй!
              </p>
            </div>

            <div className="bg-[#0b0a16] border border-white/5 rounded-2xl p-4 grid grid-cols-2 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block">Нийт оноо</span>
                <span className="text-base font-black text-amber-300">{score}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block">Асуулт</span>
                <span className="text-base font-black text-indigo-400">{currentIndex + 1} / {questions.length}</span>
              </div>
            </div>

            {/* Score Submit Form */}
            <div className="bg-[#0b0a16] border border-indigo-500/20 rounded-2xl p-4 text-left space-y-3 relative z-10">
              <h4 className="text-[11px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Оноогоо хадгалах:
              </h4>
              {!isSubmitted ? (
                <form onSubmit={handleSubmitScore} className="space-y-2">
                  <p className="text-[10px] text-slate-400">Өөрийн нэрийг оруулж Leaderboard-д өрсөлдөөрэй!</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Тоглогчийн нэр..."
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !playerName.trim()}
                      className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {isSubmitting ? "Хадгалж байна..." : "Илгээх"}
                    </button>
                  </div>
                  {submitError && (
                    <p className="text-[9px] text-rose-400 font-bold">{submitError}</p>
                  )}
                </form>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-center space-y-1">
                  <p className="text-xs font-black text-emerald-400">Таны амжилт амжилттай хадгалагдлаа! 🎉</p>
                  <p className="text-[10px] text-indigo-300 font-bold">Онооны самбараас өөрийн байрыг хараарай.</p>
                </div>
              )}
            </div>

            {/* Answer Log Review */}
            {userAnswers.length > 0 && (
              <div className="bg-[#0b0a16] border border-white/5 rounded-2xl p-4 text-left space-y-2 max-h-[160px] overflow-y-auto relative z-10">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Хариултуудын Түүх:</h4>
                <div className="space-y-1.5">
                  {userAnswers.map((ans, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] p-2 bg-stone-950/40 rounded-xl border border-white/5">
                      <div className="min-w-0 pr-2">
                        <span className="font-extrabold text-white truncate block">{ans.question}</span>
                        <span className="text-[9px] text-slate-400">Таны хариулт: <strong className={ans.isCorrect ? "text-emerald-400" : "text-rose-400"}>{ans.userAnswer}</strong></span>
                      </div>
                      <span className={`text-[10px] font-black shrink-0 ${ans.isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                        {ans.isCorrect ? "✓ ЗӨВ" : "✗ БУРУУ"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={startGame}
              className="w-full py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-extrabold text-xs uppercase tracking-wider transform active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Дахин тоглох
            </button>
          </motion.div>
        )}

        {gameState === 'victory' && (
          <motion.div 
            key="victory"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 text-center max-w-md mx-auto space-y-6"
          >
            <div className="space-y-1.5 relative">
              <div className="absolute inset-0 bg-indigo-500/10 filter blur-3xl rounded-full"></div>
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-5xl mx-auto relative z-10 animate-pulse">
                👑
              </div>
              <h2 className="text-xl font-black bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent uppercase tracking-wider pt-2 relative z-10">
                Төгс Ялалт! 🎉
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed relative z-10 max-w-xs mx-auto">
                Баяр хүргэе! Та бүх {questions.length} асуултыг амжилттай давж, хамгийн шилдэг Анимэ Отаку болохоо баталлаа!
              </p>
            </div>

            <div className="bg-[#0b0a16] border border-white/5 rounded-2xl p-4 grid grid-cols-2 gap-2 text-center relative z-10">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block">Эцсийн оноо</span>
                <span className="text-base font-black text-amber-300 flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400" /> {score}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block">Буулгасан XP</span>
                <span className="text-base font-black text-indigo-400">+50 XP</span>
              </div>
            </div>

            {/* Score Submit Form */}
            <div className="bg-[#0b0a16] border border-indigo-500/20 rounded-2xl p-4 text-left space-y-3 relative z-10">
              <h4 className="text-[11px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Оноогоо хадгалах:
              </h4>
              {!isSubmitted ? (
                <form onSubmit={handleSubmitScore} className="space-y-2">
                  <p className="text-[10px] text-slate-400">Өөрийн нэрийг оруулж Leaderboard-д өрсөлдөөрэй!</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Тоглогчийн нэр..."
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !playerName.trim()}
                      className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {isSubmitting ? "Хадгалж байна..." : "Илгээх"}
                    </button>
                  </div>
                  {submitError && (
                    <p className="text-[9px] text-rose-400 font-bold">{submitError}</p>
                  )}
                </form>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-center space-y-1">
                  <p className="text-xs font-black text-emerald-400">Таны амжилт амжилттай хадгалагдлаа! 🎉</p>
                  <p className="text-[10px] text-indigo-300 font-bold">Онооны самбараас өөрийн байрыг хараарай.</p>
                </div>
              )}
            </div>

            {/* Answer Log Review */}
            {userAnswers.length > 0 && (
              <div className="bg-[#0b0a16] border border-white/5 rounded-2xl p-4 text-left space-y-2 max-h-[160px] overflow-y-auto relative z-10">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Хариултуудын Түүх:</h4>
                <div className="space-y-1.5">
                  {userAnswers.map((ans, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] p-2 bg-stone-950/40 rounded-xl border border-white/5">
                      <div className="min-w-0 pr-2">
                        <span className="font-extrabold text-white truncate block">{ans.question}</span>
                        <span className="text-[9px] text-slate-400">Таны хариулт: <strong className={ans.isCorrect ? "text-emerald-400" : "text-rose-400"}>{ans.userAnswer}</strong></span>
                      </div>
                      <span className={`text-[10px] font-black shrink-0 ${ans.isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                        {ans.isCorrect ? "✓ ЗӨВ" : "✗ БУРУУ"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={startGame}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transform active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Дахин оролдох
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
