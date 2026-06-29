import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Gamepad2, Utensils, Tv, Flame, GraduationCap, 
  Music, Heart, Smile, CheckCircle2, Award, MessageSquare, 
  Send, Sparkles, Star, Sparkle, Zap, Compass, Play, Pause, Volume2, VolumeX,
  User, Calendar, MapPin, Code, BookOpen, Crown, ChevronRight, Check, Skull, Swords, RefreshCw, Eye, EyeOff,
  Settings, Disc, Upload, Bot, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import All 5 fully-functional Arcade Games
import ObbyGame from './components/ObbyGame';
import CrouchJumpDodge from './components/CrouchJumpDodge';
import ZombieGame from './components/ZombieGame';
import FightingGame from './components/FightingGame';
import ReflexClicker from './components/ReflexClicker';

// Import local avatar asset
// @ts-ignore
import asraltAvatar from './assets/images/asralt_avatar_1782283035872.jpg';

type ImageWithFallbackProps = {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
};

function ImageWithFallback({ src, fallback, alt, className = "w-full h-full object-cover" }: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(src);
    setIsFallback(false);
  }, [src]);

  const handleError = () => {
    if (!isFallback) {
      setImgSrc(fallback);
      setIsFallback(true);
    }
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      onError={handleError} 
      className={`${className} transition-all duration-700 group-hover:scale-108`}
      referrerPolicy="no-referrer"
    />
  );
}

type Item = {
  id: string;
  title: string;
  category: 'hobby' | 'games' | 'media' | 'food';
  value: string;
  description: string;
  imagePath: string;
  fallbackUrl: string;
  icon: React.ReactNode;
  tags: string[];
  statName: string;
  statValue: number;
  colorClass: string; 
  bgGradient: string; 
  customDetail?: string; 
};

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeGame, setActiveGame] = useState<string | null>(null); // 'obby' | 'cyber' | 'zombie' | 'fighting' | 'reflex' | null
  const [secretFactFound, setSecretFactFound] = useState(false);
  const [xp, setXp] = useState(135); 
  const [scrollY, setScrollY] = useState(0);
  const [activeBioTab, setActiveBioTab] = useState<'bio' | 'school' | 'hobbies' | 'gaming'>('bio');
  const [activeStatus, setActiveStatus] = useState('🟢 ОНЛАЙН • Сонгдог аялал хийж байна 🎮');
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(['gamer', 'pioneer']);
  const [profileClicks, setProfileClicks] = useState(0);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Background audio / stars ambiance toggle
  const [enableAmbianceParticles, setEnableAmbianceParticles] = useState(true);

  // Gemini AI Chat States & Handlers
  interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: Date;
  }

  const [isIdolChatOpen, setIsIdolChatOpen] = useState(false);
  const [idolMessages, setIdolMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-idol',
      role: 'model',
      content: 'За, хийгээд үзье! 🔥 Би Юүжи Итадори байна. Найз минь, чамд ямар зөвлөгөө, дэмжлэг, урам зориг хэрэгтэй байна? Надад хэлээрэй, би үргэлж бэлэн байна! 💪👟',
      timestamp: new Date()
    }
  ]);
  const [idolInput, setIdolInput] = useState('');
  const [isIdolTyping, setIsIdolTyping] = useState(false);

  const [isMeChatOpen, setIsMeChatOpen] = useState(false);
  const [meMessages, setMeMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-me',
      role: 'model',
      content: 'Сайн уу! Асралтын портфолио сайтад тавтай морил! 🪐 Би бол Асралтын AI хувилбар байна. Миний сонирхол, төсөл, хичээлийн талаар асуух зүйл байна уу? Сагс тоглох эсвэл гүйх дуртай шүү! 🏀✨',
      timestamp: new Date()
    }
  ]);
  const [meInput, setMeInput] = useState('');
  const [isMeTyping, setIsMeTyping] = useState(false);

  const idolEndRef = useRef<HTMLDivElement | null>(null);
  const meEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isIdolChatOpen && idolEndRef.current) {
      idolEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [idolMessages, isIdolChatOpen, isIdolTyping]);

  useEffect(() => {
    if (isMeChatOpen && meEndRef.current) {
      meEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [meMessages, isMeChatOpen, isMeTyping]);

  const sendIdolMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!idolInput.trim() || isIdolTyping) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: idolInput.trim(),
      timestamp: new Date()
    };

    setIdolMessages(prev => [...prev, userMsg]);
    setIdolInput('');
    setIsIdolTyping(true);
    triggerReward(10, "Юүжи Итадоритой холбогдож байна... 📞⚡");

    try {
      const conversationHistory = [...idolMessages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat/idol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory })
      });

      let responseText = 'Уучлаарай, холболтонд алдаа гарлаа. Та дахин оролдоно уу.';
      if (!response.ok) {
        try {
          const errData = await response.json();
          if (errData && errData.text) {
            responseText = errData.text;
          } else if (errData && errData.error) {
            if (errData.error === "GEMINI_API_KEY_MISSING") {
              responseText = "Системийн алдаа: Gemini API Түлхүүр (GEMINI_API_KEY) тохируулагдаагүй байна. Та өөрийн Portfolio сайтын Settings > Secrets цэс рүү орж GEMINI_API_KEY нэртэйгээр өөрийн API түлхүүрийг нэмнэ үү. Ингэснээр AI чат ажиллах болно! 🛠️";
            } else {
              responseText = `Алдаа: ${errData.error}`;
            }
          }
        } catch (e) {
          // Response is not JSON
        }
        throw new Error(responseText);
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        content: data.text || 'Уучлаарай, хариу олдсонгүй.',
        timestamp: new Date()
      };

      setIdolMessages(prev => [...prev, modelMsg]);
      triggerReward(15, "Юүжи Итадори хариуллаа! 👊🔥");
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        content: err.message || 'Уучлаарай, холболтонд алдаа гарлаа. Та дахин оролдоно уу.',
        timestamp: new Date()
      };
      setIdolMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsIdolTyping(false);
    }
  };

  const sendMeMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!meInput.trim() || isMeTyping) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: meInput.trim(),
      timestamp: new Date()
    };

    setMeMessages(prev => [...prev, userMsg]);
    setMeInput('');
    setIsMeTyping(true);
    triggerReward(10, "Асралтын AI-тай холбогдож байна... 🏀⚡");

    try {
      const conversationHistory = [...meMessages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory })
      });

      let responseText = 'Уучлаарай, холболтонд алдаа гарлаа. Та дахин оролдоно уу.';
      if (!response.ok) {
        try {
          const errData = await response.json();
          if (errData && errData.text) {
            responseText = errData.text;
          } else if (errData && errData.error) {
            if (errData.error === "GEMINI_API_KEY_MISSING") {
              responseText = "Системийн алдаа: Gemini API Түлхүүр (GEMINI_API_KEY) тохируулагдаагүй байна. Та өөрийн Portfolio сайтын Settings > Secrets цэс рүү орж GEMINI_API_KEY нэртэйгээр өөрийн API түлхүүрийг нэмнэ үү. Ингэснээр AI чат ажиллах болно! 🛠️";
            } else {
              responseText = `Алдаа: ${errData.error}`;
            }
          }
        } catch (e) {
          // Response is not JSON
        }
        throw new Error(responseText);
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        content: data.text || 'Уучлаарай, хариу олдсонгүй.',
        timestamp: new Date()
      };

      setMeMessages(prev => [...prev, modelMsg]);
      triggerReward(15, "Асралт хариуллаа! 🏀✨");
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        content: err.message || 'Уучлаарай, холболтонд алдаа гарлаа. Та дахин оролдоно уу.',
        timestamp: new Date()
      };
      setMeMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsMeTyping(false);
    }
  };

  // Scroll tracking for high-performance parallax scroll offsets
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper helper to trigger a gorgeous custom level up or reward toast notification
  const triggerReward = (amount: number, message: string) => {
    setXp(prev => {
      const next = prev + amount;
      if (Math.floor(next / 100) > Math.floor(prev / 100)) {
        // LEVEL UP!
        showToast(`🎉 СУПЕР ТҮВШИН АХИЛАА (Түвшин ${Math.floor(next / 100)})!`);
      } else {
        showToast(`⚡ +${amount} XP: ${message}`);
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  // Likes and interactivity
  const [likes, setLikes] = useState<Record<string, number>>(() => {
    return {
      basketball: 145,
      onepiece: 289,
      gremix: 450,
      gaming: 320,
      food: 112,
      rokitbay: 210,
      movie: 168,
      goldonthewindow: 245
    };
  });

  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});

  const handleLike = (id: string) => {
    if (hasLiked[id]) {
      setLikes(prev => ({ ...prev, [id]: prev[id] - 1 }));
      setHasLiked(prev => ({ ...prev, [id]: false }));
      triggerReward(-15, "Таалагдсан сонголтыг буцаалаа");
    } else {
      setLikes(prev => ({ ...prev, [id]: prev[id] + 1 }));
      setHasLiked(prev => ({ ...prev, [id]: true }));
      triggerReward(30, "Шинэ сонирхолд лайк дарлаа! ❤️");
    }
  };

  const profileItems: Item[] = [
    {
      id: 'basketball',
      title: 'Спорт & Хөгжил',
      category: 'hobby',
      value: 'Сагсан бөмбөг 🏀',
      description: 'Талбай дээр бөмбөгөө залж, цагираг руу довтлох мөч хамгийн гоё! Миний хамгийн дуртай супер тоглогч бол LeBron James. Түүн шиг хүчирхэг, тэвчээртэй байхыг хичээдэг.',
      imagePath: 'licensed-image.webp',
      fallbackUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      tags: ['NBA', 'LeBron James', '3-Points'],
      statName: "Дуртай түвшин",
      statValue: 95,
      colorClass: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-950/80 via-transparent to-transparent",
      customDetail: "Шүтээн: LeBron James (LA Lakers)"
    },
    {
      id: 'onepiece',
      title: 'Дуртай анимэ',
      category: 'media',
      value: 'ONE PIECE (Ван Пис) 🏴‍☠️',
      description: 'Монки Д. Луффигийн уян налархай хүч, нөхөрлөлийн үнэ цэнэ, тэнгисийн хамгийн агуу эрдэнэсийг олох адал явдалт аялал. Энэ анимэг үзэхэд цаг хугацаа яаж өнгөрсөн нь мэдэгддэггүй!',
      imagePath: 'images.webp',
      fallbackUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      icon: <Tv className="w-5 h-5 text-rose-400" />,
      tags: ['Luffy', 'Gear 5', 'StrawHat'],
      statName: "Үзсэн ангийн хувь",
      statValue: 90,
      colorClass: "from-red-500 to-rose-600",
      bgGradient: "from-red-950/85 via-transparent to-transparent",
      customDetail: "Дуртай дүр: Monkey D. Luffy"
    },
    {
      id: 'gremix',
      title: 'Дуртай Юүтүбэр',
      category: 'media',
      value: 'Gremix (Грэмикс) 🎬',
      description: 'Миний хамгийн дуртай монгол Юүтүбэр бол Грэмикс ах. Хөгжилтэй царайны хувирал, тоглож байгаа тоглоомууд, сонирхолтой сорилтууд нь үнэхээр инээд бэлэглэдэг!',
      imagePath: 'images (1).webp',
      fallbackUrl: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=800&auto=format&fit=crop&q=80',
      icon: <Smile className="w-5 h-5 text-yellow-400" />,
      tags: ['Хөгжилтэй', 'Challenge', 'Reacts'],
      statName: "Буцалтгүй үзэх хувь",
      statValue: 100,
      colorClass: "from-yellow-400 to-amber-500",
      bgGradient: "from-yellow-950/80 via-transparent to-transparent",
      customDetail: "Шилдэг контент: Аймшгийн тоглоомууд 👻"
    },
    {
      id: 'gaming',
      title: 'Дуртай тоглоомууд',
      category: 'games',
      value: 'CS2 ба Roblox 🎮',
      description: 'Найзуудтайгаа онлайнаар холбогдоод Roblox дээр шинэ ертөнц нээж, харин CS2 дээр маш хурдан рефлекс, ухаалаг тактикийг ашиглан багаараа ялалт байгуулах хамгийн сэтгэл хөдөлгөм!',
      imagePath: 'download.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      icon: <Gamepad2 className="w-5 h-5 text-sky-400" />,
      tags: ['Roblox Obby', 'CS2 Clutch', 'Mirage'],
      statName: "Тоглоомын чадвар",
      statValue: 88,
      colorClass: "from-indigo-550 to-sky-500",
      bgGradient: "from-indigo-950/80 via-transparent to-transparent",
      customDetail: "Дуртай зураг: Mirage 🏜️"
    },
    {
      id: 'food',
      title: 'Дуртай хоол',
      category: 'food',
      value: 'Будаатай хуурга 🍜',
      description: 'Гэртээ хийсэн халуун будаатай хуурга бол хамгийн шилдэг нь! Амтлаг зөөлөн үхрийн мах, нарийн хэрчсэн лууван, сонгино болон амтлагчдын холимог будаатай үнэхээр сайхан зохицдог.',
      imagePath: 'images.png',
      fallbackUrl: 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=800&auto=format&fit=crop&q=80',
      icon: <Utensils className="w-5 h-5 text-emerald-400" />,
      tags: ['Махтай Будаа', 'Сонгодог', 'Гэрт хийсэн'],
      statName: "Идэх дуртай зэрэг",
      statValue: 98,
      colorClass: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-950/80 via-transparent to-transparent",
      customDetail: "Шилдэг хачир: Даршилсан өргөст хэмх 🥒"
    },
    {
      id: 'rokitbay',
      title: 'Дуртай дуучин',
      category: 'media',
      value: 'Rokit Bay (Рокит Бэй) 🎤',
      description: 'Түүний хэлж байгаа гүн гүнзгий үгнүүд, хип хоп реп хэмнэл маш их урам зориг өгдөг. Дуу болгон нь ямар нэг түүх өгүүлдэг болохоор дахин дахин сонсох дуртай.',
      imagePath: 'download (1).jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&auto=format&fit=crop&q=80',
      icon: <Music className="w-5 h-5 text-cyan-400" />,
      tags: ['OD', 'Хязгааргүй', 'Монгол Реп'],
      statName: "Дуунуудыг дуулах хувь",
      statValue: 85,
      colorClass: "from-cyan-400 to-blue-500",
      bgGradient: "from-blue-950/80 via-transparent to-transparent",
      customDetail: "Хамгийн дуртай дуу: Ая 🌌🎵"
    },
    {
      id: 'goldonthewindow',
      title: 'Миний дуртай дуу',
      category: 'media',
      value: 'Gold on the Window 🌧️💛',
      description: 'Бороотой цонхны неон тусгал, тайван, cozy, lofi хэмнэлтэй шилдэг уран бүтээл. Дууны үг бүр нь Асралтын сэтгэлд маш дулаахан мэдрэмж төрүүлдэг тул хамгийн дуртай дуунуудынх нь нэг болсон юм.',
      imagePath: 'gold_on_the_window.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80',
      icon: <Music className="w-5 h-5 text-amber-400" />,
      tags: ['Cozy Lofi', 'Rainy Vibe', 'Neon Nights'],
      statName: "Сонссон давтамж",
      statValue: 99,
      colorClass: "from-amber-400 to-yellow-500",
      bgGradient: "from-amber-950/80 via-transparent to-transparent",
      customDetail: "Шилдэг хэсэг: Vibing in my own true time 🌧️✨"
    },
    {
      id: 'movie',
      title: 'Дуртай кино',
      category: 'media',
      value: 'Harry Potter (Харри Поттер) 🧙‍♂️',
      description: 'Илбэ шид, ер бусын нууцуудаар дүүрэн Хогвартс сургуулийн ертөнц. Харри, Рон, Хермиона нарын нөхөрлөл бэрхшээлийг хамтдаа хэрхэн даван туулж байгаа нь үнэхээр сургамжтай.',
      imagePath: 'download (2).jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1505682634904-d7c8d95ccd50?w=800&auto=format&fit=crop&q=80',
      icon: <Flame className="w-5 h-5 text-fuchsia-400" />,
      tags: ['Gryffindor', 'Magic Spell', 'Fantasy'],
      statName: "Шидэт чадвар",
      statValue: 92,
      colorClass: "from-fuchsia-500 to-purple-600",
      bgGradient: "from-fuchsia-950/80 via-transparent to-transparent",
      customDetail: "Дуртай тэнхим: Гриффиндор 🦁"
    }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? profileItems 
    : profileItems.filter(item => item.category === selectedCategory);

  // Quiz Setup
  const quizQuestions = [
    {
      question: "Асралт одоо хэдэн настай вэ? 🤔",
      options: ["8 настай", "10 настай", "12 настай"],
      correct: 1,
      fact: "Би одоо яг 10 настай шүү дээ! Өсвөр нас руу аялж явна."
    },
    {
      question: "CS2 тоглоом дээр ямар газарт (map) тоглох хамгийн дуртай вэ? 🏜️",
      options: ["Dust II", "Inferno", "Mirage"],
      correct: 2,
      fact: "Миний хамгийн дуртай тактикийн газрын зураг бол Mirage юм!"
    },
    {
      question: "Асралт аль сургуульд сурдаг вэ? 🏫",
      options: ["Нийслэлийн 84-р сургууль", "Нийслэлийн 86-р сургууль", "Нийслэлийн 1-р сургууль"],
      correct: 1,
      fact: "Би Нийслэлийн 86-р сургуульд сурдаг!"
    },
    {
      question: "Түүний дуртай сагсан бөмбөгийн шүтээн тоглогч хэн бэ? 🏀",
      options: ["Stephen Curry", "LeBron James", "Kyrie Irving"],
      correct: 1,
      fact: "Агуу хаан LeBron James бол миний гол шүтээн!"
    }
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleOptionClick = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    if (idx === quizQuestions[currentQuestion].correct) {
      setScore(prev => prev + 1);
      triggerReward(40, "Зөв хариуллаа! 🌟");
    } else {
      triggerReward(10, "Хариулж сорьж үзлээ! 😊");
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setScore(0);
    setQuizFinished(false);
  };

  // Sticker-style Guestbook Messages State
  const [messages, setMessages] = useState<Array<{name: string, text: string, date: string, color: string, rotate: string, icon: string}>>([
    { 
      name: "Батболд ах нь", 
      text: "Үнэхээр гоёмсог сайт байна! Сагсаа сайн тоглоод, хичээлээ бас сайн хийгээрэй дүү минь! 🏀💪", 
      date: "Саяхан", 
      color: "from-amber-400 to-amber-500 text-stone-900 border-amber-300 shadow-amber-500/10", 
      rotate: "-rotate-2",
      icon: "🏀"
    },
    { 
      name: "Гэрэлээ эгч нь", 
      text: "Миний дүү мундаг шүү! One Piece-ийн Луффи шиг эрч хүчтэй байгаарай! Дизайн чинь маш тайван, гоё болсон байна! 🏴‍☠️✨", 
      date: "Саяхан", 
      color: "from-rose-400 to-rose-500 text-stone-900 border-rose-300 shadow-rose-500/10", 
      rotate: "rotate-2",
      icon: "🏴‍☠️"
    },
    { 
      name: "Багш нь 🏫", 
      text: "86-р сургуулийн бахархал үлгэр жишээч Асралт хүүдээ. Ийм бүтээлчээр өөрийгөө хөгжүүлж байгаад багш нь маш их баяртай байна. Ирээдүйн чадварлаг инженер болоорой!", 
      date: "1 цагийн өмнө", 
      color: "from-emerald-450 to-emerald-500 text-stone-900 border-emerald-300 shadow-emerald-500/10", 
      rotate: "-rotate-1",
      icon: "✍️"
    }
  ]);
  const [msgName, setMsgName] = useState("");
  const [msgText, setMsgText] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgName.trim() || !msgText.trim()) return;

    const gradients = [
      { gradient: "from-amber-405 to-amber-500 text-stone-900 border-amber-300", icon: "⭐" },
      { gradient: "from-rose-400 to-rose-500 text-stone-900 border-rose-300", icon: "❤️" },
      { gradient: "from-emerald-400 to-emerald-500 text-stone-900 border-emerald-300", icon: "🍀" },
      { gradient: "from-sky-450 to-sky-500 text-stone-900 border-sky-300", icon: "🎮" },
      { gradient: "from-purple-400 to-purple-500 text-stone-900 border-purple-300", icon: "✨" }
    ];
    
    const randomConfig = gradients[Math.floor(Math.random() * gradients.length)];
    const rotationalAngles = ["-rotate-3", "-rotate-2", "-rotate-1", "rotate-1", "rotate-2", "rotate-3"];
    const randomRotate = rotationalAngles[Math.floor(Math.random() * rotationalAngles.length)];

    const newMsg = {
      name: msgName,
      text: msgText,
      date: "Яг одоо",
      color: randomConfig.gradient,
      rotate: randomRotate,
      icon: randomConfig.icon
    };

    setMessages([newMsg, ...messages]);
    triggerReward(45, "Стикер хананд сэтгэгдэл үлдээлээ! 📌");
    setMsgName("");
    setMsgText("");
  };

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-rose-400 selection:text-slate-900 font-sans overflow-x-hidden bg-[#070513]">
      
      {/* GENTLE, CALMING COSMIC PARALLAX BACKGROUND */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        
        {/* Soft Radial Ambient Lights to provide a peaceful, comfortable cozy vibe (Taatai medremj) */}
        <div className="absolute top-0 left-0 w-full h-full bg-[#070617]"></div>
        
        {/* Gradient Nebula 1 (Top Left): Soft violet glow */}
        <div 
          className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-900/20 blur-[130px] transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${scrollY * 0.12}px)` }}
        ></div>

        {/* Gradient Nebula 2 (Middle Right): Deep relaxing teal emerald glow */}
        <div 
          className="absolute top-[30%] -right-[15%] w-[70%] h-[70%] rounded-full bg-emerald-950/20 blur-[140px] transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${scrollY * -0.08}px)` }}
        ></div>

        {/* Gradient Nebula 3 (Bottom Left): Soft sunset rose gold glow */}
        <div 
          className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-violet-955/15 blur-[120px] transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        ></div>

        {/* Floating Parallax Celestial Orbs (Visual depth) */}
        {/* Orb 1: Golden Amber Star (Fast Parallax) */}
        <div 
          className="absolute top-[15%] left-[8%] w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/25 to-yellow-300/10 border border-yellow-500/20 backdrop-blur-[2px] shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-transform duration-100 ease-out hidden md:block"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        ></div>

        {/* Orb 2: Purple Sapphire World (Slow Inverse Parallax) */}
        <div 
          className="absolute top-[55%] right-[6%] w-[120px] h-[120px] rounded-full bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent border border-purple-500/10 backdrop-blur-[1px] shadow-[0_0_30px_rgba(168,85,247,0.05)] transition-transform duration-100 ease-out hidden lg:block"
          style={{ transform: `translateY(${scrollY * -0.15}px)` }}
        ></div>

        {/* Orb 3: Emerald Jewel (Micro Parallax) */}
        <div 
          className="absolute top-[85%] left-[5%] w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-550/15 backdrop-blur-[2px] shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-transform duration-100 ease-out hidden md:block"
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
        ></div>

        {/* Elegant Minimalist Star Dust Mesh overlay */}
        {enableAmbianceParticles && (
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#8b5cf6_1px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none"></div>
        )}
      </div>

      {/* STICKY CUSTOM NOTIFICATION TOAST POPUP */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-55 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 p-[1.5px] rounded-2xl shadow-2xl"
          >
            <div className="bg-[#120f28] px-6 py-4 rounded-2xl flex items-center gap-3.5 max-w-md">
              <Zap className="w-5 h-5 text-yellow-300 animate-bounce fill-yellow-300" />
              <p className="text-xs sm:text-sm font-black text-white leading-relaxed">{showNotification}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATEFUL NAVIGATION HEADER */}
      <nav className="sticky top-0 z-40 bg-[#070614]/80 backdrop-blur-3xl border-b border-white/5 px-4 sm:px-6 py-3.5 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-3 w-3 shrink-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-amber-300 via-emerald-300 to-indigo-300 bg-clip-text text-transparent tracking-tight">
              АСРАЛТЫН ЕРТӨНЦ 🪐
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick access to game cabinet anchor */}
            <a 
              href="#arcade-cabinet"
              className="hidden sm:flex items-center gap-1.5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-slate-300 hover:text-white border border-white/5 font-bold text-xs px-4 py-2.5 rounded-2xl transition-all"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Тоглоом Тоглох 🎮</span>
            </a>

            {/* My Idol Chat button */}
            <button
              onClick={() => {
                setIsIdolChatOpen(true);
                triggerReward(15, "🤖 Idol Coach (Yuji Itadori) чат нээгдлээ!");
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/30 hover:border-rose-500/50 text-amber-200 hover:text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all cursor-pointer select-none"
            >
              <Bot className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>My Idol 🤖</span>
            </button>

            {/* Background ambiance toggle handler */}
            <button
              onClick={() => {
                setEnableAmbianceParticles(v => !v);
                showToast(enableAmbianceParticles ? "🌌 Оддын анимейшн хаалаа" : "🌌 Оддын анимейшн нээлээ");
              }}
              className="text-slate-400 hover:text-white p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
              title={enableAmbianceParticles ? "Арын тоосонцрыг унтраах" : "Арын тоосонцрыг асаах"}
            >
              {enableAmbianceParticles ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            {/* Level Orb Widget */}
            <div className="flex items-center gap-2 bg-slate-905/40 border border-white/5 p-1 rounded-2xl select-none">
              <div className="hidden md:flex flex-col text-right pl-2 pr-1">
                <span className="text-[10px] text-amber-400 font-extrabold tracking-wider flex items-center gap-1 justify-end">
                  <Zap className="w-2.5 h-2.5 fill-amber-400" /> СУПЕР ТҮВШИН
                </span>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">{xp} ХОЛБОЛТЫН XP</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-300 via-rose-300 to-indigo-400 p-[1.5px] shadow-lg transform hover:rotate-6 transition-transform duration-300">
                <div className="w-full h-full rounded-xl bg-[#0d0a1f] flex items-center justify-center font-black text-xs text-yellow-300">
                  L{Math.floor(xp / 100)}
                </div>
              </div>
            </div>

          </div>
        </div>
      </nav>

      {/* HERO SECTION / GAMER INTEGRATED PROFILE CARD & DETAILED BIO */}
      <header className="relative z-10 pt-10 pb-12 px-4 max-w-6xl mx-auto space-y-10">
        
        {/* Small greeting label */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-500/5 backdrop-blur-md border border-white/5 px-4 py-2 rounded-2xl text-[10.5px] font-black uppercase tracking-wider text-amber-300 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            10 НАСТАЙ АСРАЛТЫН ИНТЕРФЕЙС • ТӨРӨЛХ ЗАГВАР
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none text-white drop-shadow-2xl">
            Асралтын <span className="bg-gradient-to-r from-amber-200 via-emerald-300 to-indigo-300 bg-clip-text text-transparent">Гэрэлт Намтар</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium leading-relaxed">
            Миний дуртай сагсан бөмбөгийн соёл, анимэ, монгол уран бүтээлчид болон 5 өвөрмөц тоглоомыг багтаасан хувийн орон зайтай танилцаарай.
          </p>
        </div>

        {/* Dynamic Bento Dashboard block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          
          {/* PROFILE CARD PANEL (LEFT PANEL) */}
          <div className="lg:col-span-5 bg-[#0f0c22]/70 border border-white/5 backdrop-blur-xl rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-amber-400/20 transition-all duration-500">
            
            {/* Level Counter Floating badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="relative group/level select-none">
                <span className="absolute inset-0 bg-amber-400 rounded-xl blur-md opacity-20 group-hover/level:opacity-35 transition-opacity"></span>
                <div className="relative w-12 h-12 rounded-xl bg-stone-950 border border-amber-400/30 text-amber-300 font-extrabold text-[10px] flex flex-col justify-center items-center shadow-xl transform group-hover/level:scale-103 transition-all">
                  <span className="text-[8px] uppercase tracking-wider opacity-60 font-sans">Level</span>
                  <span className="text-sm font-black text-white">{Math.floor(xp / 100)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              
              {/* Identity block */}
              <div className="flex items-center gap-4.5 pt-2">
                <div 
                  onClick={() => { 
                    setProfileClicks(c => c + 1); 
                    triggerReward(5, "Аватарт хүрлээ");
                    if (profileClicks === 4) { 
                      triggerReward(50, "🎉 НУУЦ ОДОН: Аватар дээр 5 дарснаар СУПЕР бонус орлоо!");
                    } 
                  }}
                  className="relative shrink-0 cursor-pointer active:scale-95 transition-transform"
                >
                  <span className="absolute inset-x-0 -bottom-1 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-sm opacity-60 animate-pulse"></span>
                  <div className="w-20 h-20 rounded-[22px] bg-gradient-to-tr from-amber-300 via-rose-300 to-indigo-400 p-[2.5px] shadow-2xl">
                    <div className="w-full h-full rounded-[19px] overflow-hidden bg-slate-950 relative">
                      <ImageWithFallback 
                        src={asraltAvatar} 
                        fallback="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80" 
                        alt="Асралт ахлах" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Active ping beacon */}
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-slate-950 p-[3px] shadow-lg flex items-center justify-center border border-white/5 text-[9px]">
                    🟢
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xl font-black text-white tracking-tight">Асралт 👦</h3>
                    <Crown className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
                  </div>
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-455" /> Улаанбаатар
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    <span className="text-[8.5px] font-extrabold tracking-widest uppercase bg-indigo-950/80 text-indigo-300 border border-indigo-900/30 px-1.5 py-0.5 rounded-md">86-р сургууль</span>
                    <span className="text-[8.5px] font-extrabold tracking-widest uppercase bg-amber-950/80 text-amber-300 border border-amber-900/30 px-1.5 py-0.5 rounded-md">10 настай</span>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-[#0b081a]/80 border border-white/5 p-4 rounded-2xl space-y-3 relative">
                <div className="flex justify-between items-center pb-0.5">
                  <span className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-widest">Асралт юу хийж байна вэ?</span>
                  <span className="text-[9px] text-yellow-300 font-extrabold animate-pulse">Сэдэв статус</span>
                </div>
                
                <div className="text-xs font-bold text-white bg-slate-905/90 px-3.5 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 shadow-inner">
                  <p className="truncate text-slate-200">{activeStatus}</p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[8px] text-slate-500 font-extrabold block">ДӨРВӨН СТАТУСЫН СОНГОЛТ (+15 XP):</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { unicode: '🎮', text: 'CS2 Mirage тэмцээн', short: 'CS2 Mirage тэмцэж байна 🎮' },
                      { unicode: '🏀', text: 'Сагсан бөмбөгийн бэлтгэл', short: 'ЛеБроныг дуурайн шидэлттэй 🏀' },
                      { unicode: '🏴‍☠️', text: 'One Piece шинэ анги', short: 'One Piece Gear 5 үзэж байна 🏴‍☠️' },
                      { unicode: '💻', text: 'Бүтээлч шинэ код', short: 'Бүтээлч код оролдож байна 💻' },
                    ].map((st, sidx) => (
                      <button
                        key={sidx}
                        onClick={() => {
                          setActiveStatus(`🟢 ${st.short}`);
                          triggerReward(15, `Статусаа солилоо: ${st.unicode}`);
                        }}
                        className="text-[9.5px] font-semibold py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 hover:border-white/10 border border-white/5 text-slate-300 transition-all text-left flex items-center gap-1.5 cursor-pointer hover:text-white"
                      >
                        <span className="shrink-0">{st.unicode}</span>
                        <span className="truncate">{st.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Achievements Badges section */}
              <div className="space-y-2">
                <span className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-widest block">ТЭМДЭГ & ОЛОЛТ АМЖИЛТ</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'gamer', label: '🎮 CS2 GURU', xp: 25 },
                    { id: 'lakers', label: '👑 LAKERS PRO', xp: 25 },
                    { id: 'pirate', label: '☠️ DEEP BLUE', xp: 25 },
                    { id: 'wizard', label: '🧙‍♂️ HOGWARTS', xp: 25 }
                  ].map((bg) => {
                    const isUnlocked = unlockedBadges.includes(bg.id);
                    return (
                      <button
                        key={bg.id}
                        onClick={() => {
                          if (!isUnlocked) {
                            setUnlockedBadges([...unlockedBadges, bg.id]);
                            triggerReward(bg.xp, `${bg.label} тэмдгийг идэвхжүүллээ! ○`);
                          } else {
                            setUnlockedBadges(unlockedBadges.filter(a => a !== bg.id));
                            triggerReward(-bg.xp, `${bg.label} тэмдгийг болиуллаа ○`);
                          }
                        }}
                        className={`text-[9.5px] font-extrabold px-3 py-2 rounded-xl border transition-all duration-300 ${
                          isUnlocked 
                            ? 'bg-gradient-to-r from-amber-300 over-rose-350 to-indigo-400 text-stone-900 border-white shadow-xl' 
                            : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {bg.label} {isUnlocked ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
                {profileClicks > 0 && profileClicks < 5 && (
                  <p className="text-[9.5px] text-indigo-400 font-extrabold animate-pulse text-center">
                    ⚡ Аватар зургаа дахиад {5 - profileClicks} дараад +50 XP олоорой!
                  </p>
                )}
              </div>

            </div>

            {/* Level progress bar */}
            <div className="space-y-1.5 pt-5 border-t border-white/5 mt-5">
              <div className="flex justify-between items-center text-[9.5px]">
                <span className="text-slate-400 font-extrabold uppercase tracking-wider">Супер туршлага (Progress)</span>
                <span className="text-amber-300 font-extrabold">{xp % 100} / 100 XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#0d091e] overflow-hidden border border-white/5 relative">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-450 transition-all duration-1000 shadow-lg" 
                  style={{ width: `${xp % 100}%` }}
                ></div>
              </div>
            </div>

          </div>

          {/* DYNAMIC TABBED BIOGRAPHY CANVAS (RIGHT PANEL) */}
          <div className="lg:col-span-7 bg-[#0f0c22]/70 border border-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative">
            <div className="space-y-6">
              
              {/* Tab navigation headers styled beautifully */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5">
                {[
                  { id: 'bio', label: '👦 Танилцуулга', icon: <User className="w-3.5 h-3.5" /> },
                  { id: 'school', label: '🎒 Сургууль', icon: <GraduationCap className="w-3.5 h-3.5" /> },
                  { id: 'hobbies', label: '🚀 Сормуус Хобби', icon: <Trophy className="w-3.5 h-3.5" /> },
                  { id: 'gaming', label: '🎮 Тоглох Түвшин', icon: <Gamepad2 className="w-3.5 h-3.5" /> }
                ].map(bTab => (
                  <button
                    key={bTab.id}
                    onClick={() => {
                      setActiveBioTab(bTab.id as any);
                      triggerReward(5, `${bTab.label} хуудсыг нээлээ`);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all border duration-300 cursor-pointer ${
                      activeBioTab === bTab.id
                        ? 'bg-gradient-to-r from-amber-300 to-indigo-450 text-slate-950 border-white font-extrabold'
                        : 'bg-white/5 text-slate-450 border-white/5 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    {bTab.icon}
                    <span>{bTab.label}</span>
                  </button>
                ))}
              </div>

              {/* Rendered Tab Contents */}
              <div className="min-h-[220px] flex flex-col justify-between pt-1">
                <AnimatePresence mode="wait">
                  {activeBioTab === 'bio' && (
                    <motion.div 
                      key="bio"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-amber-300 font-extrabold text-lg">
                        <Crown className="w-5 h-5 text-amber-400" />
                        <h4>Намайг Асралт гэдэг!</h4>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Би одоогоор <strong>10 настай</strong>. Монголынхоо соёлын хөгжилд ухаалгаар тоглож, сурч, судалж оролцдог идэвхтэй сонирхолтой нэгэн юм. Миний гол мөрөөдөл бол дэлхийн хамгийн ухаалаг, чадварлаг тоглоом хөгжүүлэгч болох эсвэл сагсан бөмбөгийн спортоор домогт LeBron шиг өндөр амжилт гаргах юм.
                      </p>
                      <p className="text-slate-400 text-xs">
                        Эргэн тойрныхоо хүмүүсийг инээлгэх, шинэ сонин зүйл сурах, бэрхшээл бүрийг Луффи шиг эрч хүчээр давж гарах хамгийн дуртай. Миний хувийн хөрөгт тавтай морилно уу!
                      </p>
                      
                      {/* Numeric Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 pt-3">
                        <div className="bg-[#0b0819]/55 p-3 rounded-2xl border border-white/5 text-center">
                          <span className="text-xl block mb-0.5">🎮</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Тоглосон цаг</span>
                          <span className="text-xs font-black text-indigo-300">1,500+ цаг</span>
                        </div>
                        <div className="bg-[#0b0819]/55 p-3 rounded-2xl border border-white/5 text-center">
                          <span className="text-xl block mb-0.5">🏀</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Сагсны оновч</span>
                          <span className="text-xs font-black text-amber-400">95% бүрэн</span>
                        </div>
                        <div className="bg-[#0b0819]/55 p-3 rounded-2xl border border-white/5 text-center">
                          <span className="text-xl block mb-0.5">🎒</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Код бичсэн цаг</span>
                          <span className="text-xs font-black text-emerald-400">250+ цаг</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeBioTab === 'school' && (
                    <motion.div 
                      key="school"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
                        <GraduationCap className="w-5 h-5 text-emerald-450" />
                        <h4>Нийслэлийн 86-р дунд сургууль</h4>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Би Баянгол дүүргийн <strong>Нийслэлийн 86-р дунд сургуульд</strong> суралцдаг. Сургууль бол миний хувьд зөвхөн хичээл хийдэг газар биш, харийн найзуудтайгаа сагс залах, хамтдаа сонирхолтой төслүүд эхлүүлж хөгжих, багш нараасаа дэлхий ертөнцийг танин мэдэх маш гоё газар юм!
                      </p>
                      <p className="text-slate-400 text-xs">
                        Манай баг хамт олон маш хөгжилтэй, нөхөрсөг, нэг нэгнийгээ үргэлж дэмждэг. Сургуулийн дуртай хэсэг минь спорт заал юм.
                      </p>
                      <div className="bg-emerald-950/25 border border-emerald-900/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 mt-3">
                        <div>
                          <span className="text-xs font-black block text-emerald-400">🎁 СУРГУУЛИЙН НУУЦ ОЧИГТ САНАЛ</span>
                          <span className="text-[9.5px] text-slate-400">Нийслэлийн 86-р сургуулийн хамгийн сонирхолтой баримтыг нээх.</span>
                        </div>
                        <button 
                          onClick={() => { 
                            setSecretFactFound(true); 
                            triggerReward(60, "Нийслэлийн 86-р сургуулийн нууцыг оллоо! 🔑");
                          }}
                          className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-[10px] px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg"
                        >
                          {secretFactFound ? "Нээгдсэн ✓" : "Нээх 🔍"}
                        </button>
                      </div>

                      {secretFactFound && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-stone-950/80 border border-emerald-500/20 rounded-xl text-xs text-slate-200 leading-relaxed"
                        >
                          🏫 <strong>Миний сургуулийн нууц:</strong> Манай 86-р сургууль нь маш өргөн спорт талбайтай бөгөөд сурагчид чөлөөт цагаараа хамгийн ихээр сагсан бөмбөг тоглох дуртай, маш бүтээлч уур амьсгалтай сургууль юм!
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {activeBioTab === 'hobbies' && (
                    <motion.div 
                      key="hobbies"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-amber-300 font-extrabold text-lg">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <h4>Миний Хүчирхэг Хобби & Аялал</h4>
                      </div>
                      <p className="text-slate-300 text-sm">
                        Спорт, урлаг болон анимэ соёл бол намайг өдөр бүр баясгадаг зүйлс:
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="bg-[#0b0819]/55 p-3 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[11px] font-black text-amber-300 block">🏀 СУПЕР САГС</span>
                          <span className="text-[10px] text-slate-400 block">LeBron James-ийг дуурайн шидэлт хийж, багийн тактик унших дуртай.</span>
                        </div>
                        <div className="bg-[#0b0819]/55 p-3 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[11px] font-black text-rose-300 block">🏴‍☠️ ONE PIECE АНИМЭ</span>
                          <span className="text-[10px] text-slate-400 block">Монки Д. Луффигийн урам зориг, Gear 5-ийн нууцууд маш сонирхолтой.</span>
                        </div>
                        <div className="bg-[#0b0819]/55 p-3 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[11px] font-black text-yellow-300 block">🎬 GREMIX ЮҮТҮБЭР</span>
                          <span className="text-[10px] text-slate-400 block">Грэмикс ахын хөгжилтэй царайны хувирил, аймшгийн сорилтууд надад инээд бэлэглэнэ.</span>
                        </div>
                        <div className="bg-[#0b0819]/55 p-3 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[11px] font-black text-cyan-300 block">🎤 MUSIC BY ROKIT BAY</span>
                          <span className="text-[10px] text-slate-400 block">"Бор арьст гариг", "OD" дуунуудыг сонсоод маш их урам зориг авна.</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeBioTab === 'gaming' && (
                    <motion.div 
                      key="gaming"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-lg">
                        <Gamepad2 className="w-5 h-5 text-indigo-400" />
                        <h4>CS2 ба Roblox Рефлекс</h4>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Миний сонирхдог тоглоомууд бол зөвхөн дуртай зүйл бус, рефлекс, багаар ажиллах хурдыг нэмэгдүүлдэг цахим спорт юм:
                      </p>
                      
                      <div className="bg-stone-900/40 p-3.5 rounded-2xl border border-white/5 space-y-2">
                        <span className="text-[10px] font-black text-indigo-300 block">🏜️ CS2 MIRAGE TOГЛООМЧ</span>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          Найзуудтайгаа Mirage зураг дээр ухаалаг тактикийг хамгийн хурдан уншиж, чухал секундэд "Clutch" хийж ялалтанд хүргэнэ!
                        </p>
                        <span className="text-[10px] font-black text-yellow-300 block pt-1 border-t border-white/5">🧱 ROBLOX СААДТ ГҮЙЛТ (OBBY)</span>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          Үхэлтэй хумсын саад болох лава дээгүүр, үл үзэгдэх тулгуур, хурдны урамшуулал, үсрэлтүүдийг оновчтой тооцоолж гүйдэг.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Hint phrase */}
            <div className="mt-6 pt-3 border-t border-white/5 text-center text-[9.5px] text-slate-500 font-extrabold uppercase tracking-widest leading-relaxed">
              "Супер тоглоомч Асралтын гэр орны уриа: Нөхөрлөл ба Тэвчээр бол амжилтын түлхүүр юм!" 🔥
            </div>

          </div>

        </div>

      </header>

      {/* 🎮 INTEGRATED SCI-FI RETRO PLAYGROUND / ARCADE CABINET (COZY & NEAT) 🎮 */}
      <section id="arcade-cabinet" className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-b from-[#1b1542] via-[#0f0c23] to-[#070514] border-2 border-indigo-500/30 rounded-3.5xl p-6 shadow-3xl relative overflow-hidden">
          
          {/* Cabinet ambient background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[90px] pointer-events-none"></div>

          {/* Arcade Cabinet Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-white/10 gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center text-2xl shadow-xl shadow-indigo-950/55 text-white shrink-0 animate-pulse">
                🎮
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-200 via-rose-300 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                  АСРАЛТЫН ТОГЛООМЫН САН 🕹️
                </h3>
                <p className="text-xs text-slate-400">
                  Бие даан бүтээж, сонгосон 5 сонирхолтой тоглоомыг нэг дороос тоглож, XP оноогоо нэмээрэй!
                </p>
              </div>
            </div>

            {/* Quick stats inside arcade */}
            <div className="bg-stone-950/60 px-4 py-2 border border-white/10 rounded-2xl flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-bold text-slate-400">Тоглоомоор цуглуулсан XP:</span>
              <span className="text-xs font-black text-amber-300">{xp} XP</span>
            </div>
          </div>

          {/* Game Selection Bento Horizontal bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 py-6">
            {[
              { id: 'obby', title: '🧱 Roblox 2D Obby', desc: 'Компьютерийн зөөлөн саад', color: 'hover:border-yellow-400/40 text-yellow-300' },
              { id: 'cyber', title: '🚅 Субвэй Гүйгч PRO', desc: 'Гал тэрэгнээс бултах', color: 'hover:border-pink-500/40 text-pink-400' },
              { id: 'zombie', title: '💀 CS: Zombie Outbreak', desc: 'Буудах, амь тавилт', color: 'hover:border-red-500/40 text-red-400' },
              { id: 'fighting', title: '⚔️ Сэлэмт Тулаан', desc: 'Шидэт үсрэлт, цохилт', color: 'hover:border-purple-500/40 text-purple-400' },
              { id: 'reflex', title: '🎯 CS: Кибер Аим Арена', desc: 'Зэвсэг сонгох онолт', color: 'hover:border-emerald-500/40 text-[#2ecc71]' },
            ].map((game) => (
              <button
                key={game.id}
                onClick={() => {
                  setActiveGame(game.id);
                  triggerReward(10, `Тоглоомыг ачааллаа: ${game.title}`);
                }}
                className={`p-3.5 rounded-2xl bg-[#090717]/80 hover:bg-[#13102c]/90 border transition-all duration-300 text-left cursor-pointer transform active:scale-95 group relative ${
                  activeGame === game.id 
                    ? 'border-indigo-400 bg-indigo-950/20 shadow-lg shadow-indigo-950/40' 
                    : 'border-white/5'
                } ${game.color}`}
              >
                {activeGame === game.id && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                )}
                <span className="font-extrabold text-xs block text-slate-100 group-hover:text-white">{game.title}</span>
                <span className="text-[10px] text-slate-400 font-semibold block pt-0.5">{game.desc}</span>
              </button>
            ))}
          </div>

          {/* ACTIVE GAME INTERACTIVE SHEET */}
          <div className="bg-[#030207] border border-white/5 rounded-2.5xl min-h-[420px] shadow-2xl relative overflow-hidden flex flex-col justify-center items-center">
            
            {activeGame === 'obby' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <span className="text-xs text-yellow-300 font-bold flex items-center gap-1">🧱 ROBLOX 2D OBBY - Obstacle Runner</span>
                  <button onClick={() => setActiveGame(null)} className="text-[10px] text-rose-450 hover:text-rose-400 font-bold">Утраах ✕</button>
                </div>
                <ObbyGame onGainXp={(amount) => triggerReward(amount, "Obby-д оноо авлаа")} />
              </motion.div>
            )}

            {activeGame === 'cyber' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <span className="text-xs text-pink-400 font-bold flex items-center gap-1">🏂 СУБВЭЙ ГҮЙГЧ - Гал Тэрэгнээс Бултах 🚈</span>
                  <button onClick={() => setActiveGame(null)} className="text-[10px] text-rose-450 hover:text-rose-400 font-bold">Хаах ✕</button>
                </div>
                <CrouchJumpDodge onGainXp={(amount) => triggerReward(amount, "Субвэй Гүйгчид оноо авлаа")} />
              </motion.div>
            )}

            {activeGame === 'zombie' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <span className="text-xs text-red-400 font-bold flex items-center gap-1">🎮 CS: ZOMBIE OUTBREAK - Тайл Тулаан</span>
                  <button onClick={() => setActiveGame(null)} className="text-[10px] text-rose-450 hover:text-rose-400 font-bold">Утраах ✕</button>
                </div>
                <ZombieGame onGainXp={(amount) => triggerReward(amount, "Зомби элчид оноо авлаа")} />
              </motion.div>
            )}

            {activeGame === 'fighting' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-0">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4 p-4">
                  <span className="text-xs text-purple-400 font-bold flex items-center gap-1">⚔️ СЭЛЭМТ ТУЛААН (SHADOW FIGHTING)</span>
                  <button onClick={() => setActiveGame(null)} className="text-[10px] text-rose-455 hover:text-rose-400 font-bold">Утраах ✕</button>
                </div>
                <div className="px-4 pb-4">
                  <FightingGame onGainXp={(amount) => triggerReward(amount, "Сэлэмт тулаанд нэмэлт XP авлаа")} />
                </div>
              </motion.div>
            )}

            {activeGame === 'reflex' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">🎯 АИМ ТРЕНЕР - Нарийвчлал Сонгогч</span>
                  <button onClick={() => setActiveGame(null)} className="text-[10px] text-rose-450 hover:text-rose-400 font-bold">Утраах ✕</button>
                </div>
                <ReflexClicker onGainXp={(amount) => triggerReward(amount, "Карт устгаж хурдаллаа")} />
              </motion.div>
            )}

            {activeGame === null && (
              <div className="text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-indigo-500/5 border border-indigo-400/20 flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce">
                  🕹️
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-white font-extrabold text-sm uppercase tracking-wide">Тоглохын тулд дээд хэсгээс сонгоно уу</h4>
                  <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans">
                    Мөрөөдөлдөө тэмүүлэгч Асралтын бүтээсэн эдгээр 5-н сонгодог сэдвүүд нь гар утас болон компьютер дээр зэрэг тоглох уян боломжтой.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* BEN-TO DETAILS AREA: PROFILE INTERESTS FEED */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* Bento navigation filter tab */}
        <div className="bg-[#0f0c22]/70 border border-white/5 backdrop-blur-3xl rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-yellow-300 animate-spin" style={{ animationDuration: '10s' }} />
            <div>
              <h3 className="text-base font-black text-white leading-none">Сонирхлуудын сан</h3>
              <p className="text-[11px] text-slate-400 font-semibold pt-1">Шүүж сонирхвол танд илүү хялбар, цэгцтэй байх болно</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {[
              { id: 'all', label: '🌟 Бүх зүйл' },
              { id: 'hobby', label: '🏀 Спорт' },
              { id: 'media', label: '📺 Кино & Анимэ' },
              { id: 'food', label: '🍜 Амтат Хоол' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategory(tab.id);
                  triggerReward(5, `Ангиллыг солилоо: ${tab.label}`);
                }}
                className={`flex-1 md:flex-none text-[11px] font-extrabold px-3.5 py-2.5 rounded-xl transition-all duration-300 border ${
                  selectedCategory === tab.id 
                    ? 'bg-gradient-to-r from-amber-300 to-indigo-400 text-slate-950 border-white shadow-xl font-black' 
                    : 'bg-white/5 text-slate-350 hover:bg-white/10 border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Translucent Feed Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const isLiked = hasLiked[item.id];
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                key={item.id}
                className="bg-[#0f0c22]/70 border border-white/5 backdrop-blur-md hover:border-white/20 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col group relative"
              >
                {/* Fallback Image Frame */}
                <div className="relative h-56 overflow-hidden bg-slate-950">
                  <ImageWithFallback 
                    src={item.imagePath} 
                    fallback={item.fallbackUrl} 
                    alt={item.value} 
                  />
                  
                  {/* Subtle overlay gradient */}
                  <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t ${item.bgGradient} h-1/2 p-4 flex flex-col justify-end`}></div>
                  
                  {/* Category overlay tags */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-stone-950/90 backdrop-blur-md text-slate-200 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>

                  {/* Red Heart interactive button with modern aesthetic design */}
                  <button
                    onClick={() => handleLike(item.id)}
                    className={`absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all duration-300 shadow-xl cursor-pointer ${
                      isLiked 
                        ? 'bg-gradient-to-r from-red-500 to-rose-650 text-white border-0 scale-105' 
                        : 'bg-stone-950/90 border border-white/10 text-slate-200 backdrop-blur-sm'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'fill-current text-white animate-pulse' : 'text-rose-500'}`} />
                    <span>{likes[item.id]}</span>
                  </button>
                </div>

                {/* Information detailed area */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-[#090714]/30">
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                      {item.value}
                    </h4>
                    <p className="text-xs text-slate-350 leading-relaxed font-normal">
                      {item.description}
                    </p>
                    
                    {item.customDetail && (
                      <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                        <div className="text-[10px] text-slate-300 flex items-center gap-1.5 font-extrabold italic">
                          <Sparkle className="w-3 h-3 text-amber-300" />
                          {item.customDetail}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills ratings layout slider */}
                  <div className="space-y-1.5 pt-3 border-t border-white/10">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-extrabold uppercase tracking-wider">{item.statName}</span>
                      <span className="text-yellow-300 font-black">{item.statValue}%</span>
                    </div>
                    {/* Background path slider */}
                    <div className="w-full h-1.5 rounded-full bg-[#0c081e] overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${item.colorClass} transition-all duration-1000`} 
                        style={{ width: `${item.statValue}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Tags list */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="text-[9px] font-extrabold tracking-wider bg-[#0f0c23]/80 text-yellow-300 border border-white/5 px-2 py-0.5 rounded-md uppercase"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </section>

      {/* INTERACTIVE ZONE: AHA QUIZ & GUESTBOOK */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* AHA QUIZ AREA */}
          <div className="lg:col-span-6 bg-[#0f0c22]/70 border border-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-yellow-405/5 border border-yellow-400/20 flex items-center justify-center text-xl">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Асралтын АХА</h3>
                    <p className="text-[10px] text-slate-400 font-semibold pt-0.5">Сонирхолтой асуулт хариултын сорил</p>
                  </div>
                </div>
                
                <span className="text-[10px] font-black bg-indigo-500/10 border border-indigo-550/20 text-indigo-300 px-2.5 py-1 rounded-lg">
                  Асуулт {currentQuestion + 1}/{quizQuestions.length}
                </span>
              </div>

              {!quizFinished ? (
                <div className="space-y-4">
                  <h4 className="text-sm sm:text-base font-black text-amber-300">
                    {quizQuestions[currentQuestion].question}
                  </h4>

                  <div className="space-y-2">
                    {quizQuestions[currentQuestion].options.map((opt, optIdx) => {
                      const isCorrect = optIdx === quizQuestions[currentQuestion].correct;
                      const isSelected = optIdx === selectedOption;

                      let quizOptionStyle = "bg-[#0b0819]/50 border-white/5 text-slate-300 hover:bg-white/10";
                      
                      if (showFeedback) {
                        if (isCorrect) {
                          quizOptionStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-300 font-black";
                        } else if (isSelected) {
                          quizOptionStyle = "bg-red-500/10 border-red-500 text-red-300 font-black";
                        } else {
                          quizOptionStyle = "bg-white/5 border-white/5 text-slate-550 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={opt}
                          disabled={showFeedback}
                          onClick={() => handleOptionClick(optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200 flex items-center justify-between cursor-pointer ${quizOptionStyle}`}
                        >
                          <span>{opt}</span>
                          {showFeedback && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-current bg-[#070513] rounded-full" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback summary fact bubble */}
                  {showFeedback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0b0819]/90 border border-white/10 p-3.5 rounded-xl text-xs leading-relaxed text-slate-300"
                    >
                      <strong className="text-amber-400 block mb-0.5">💡 Тайлал тайлбар:</strong>
                      {quizQuestions[currentQuestion].fact}
                    </motion.div>
                  )}

                </div>
              ) : (
                /* Celebration Level Completion view */
                <div className="text-center py-6 space-y-4 font-sans">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-450 to-rose-500 p-[1.5px] animate-bounce">
                    <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center text-2xl">🏅</div>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-white">АХА сорил дууслаа!</h4>
                    <p className="text-[11px] text-slate-400 font-semibold">Амжилтын хувь:</p>
                  </div>

                  <div className="text-2xl font-black bg-gradient-to-r from-amber-300 to-rose-455 text-stone-950 px-8 py-2.5 rounded-xl inline-block shadow-lg">
                    {score} / {quizQuestions.length} зөв
                  </div>

                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    {score === quizQuestions.length 
                      ? "ҮНЭХЭЭР МУНДАГ! Намайг 100% мэддэг юм байна! 🌟🥳" 
                      : "Дуртай бүх зүйлсийг минь уншаад дахин нэг ороод үзээрэй! 😊"}
                  </p>
                </div>
              )}

            </div>

            {/* Pagination Flow */}
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
              {!quizFinished ? (
                <button
                  disabled={!showFeedback}
                  onClick={handleNextQuestion}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 transform active:scale-95 ${
                    showFeedback 
                      ? 'bg-gradient-to-r from-amber-300 to-indigo-400 text-slate-950 shadow-lg cursor-pointer font-black border border-white/10' 
                      : 'bg-white/5 text-slate-500 border-white/5 cursor-not-allowed'
                  }`}
                >
                  {currentQuestion < quizQuestions.length - 1 ? "Дараагийн асуулт ➡️" : "Дуусгах 🎉"}
                </button>
              ) : (
                <button
                  onClick={resetQuiz}
                  className="bg-white hover:bg-slate-100 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all transform active:scale-95 border border-white cursor-pointer"
                >
                  Дахин орох 🔄
                </button>
              )}
            </div>

          </div>

          {/* GUESTBOOK STICKER WALL AREA */}
          <div className="lg:col-span-6 bg-[#0f0c22]/70 border border-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-6">
              
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xl">
                  💖
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Зочны наалдамхай стикер хана</h3>
                  <p className="text-[10px] text-slate-400 font-semibold pt-0.5">Асралтад урам өгөх өнгөт зурвас үлдээгээрэй!</p>
                </div>
              </div>

              {/* Grid block for sticky notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[260px] overflow-y-auto pr-1">
                {messages.map((m, mIdx) => (
                  <div 
                    key={mIdx}
                    className={`p-3.5 rounded-2.5xl border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-103 select-none hover:-translate-y-1 relative bg-gradient-to-br ${m.rotate} ${m.color}`}
                  >
                    {/* Push Pin decorative element */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-red-500 border border-white shadow shadow-black/40 z-10"></div>
                    
                    <div className="flex items-center justify-between border-b border-black/10 pb-1.5 mb-2 mt-1">
                      <span className="font-extrabold text-[10px] tracking-wider uppercase truncate max-w-[75%]">
                        {m.icon} {m.name}
                      </span>
                      <span className="text-[8.5px] opacity-70 font-semibold whitespace-nowrap">{m.date}</span>
                    </div>
                    
                    <p className="text-[10px] sm:text-xs leading-relaxed font-bold italic text-slate-900">
                      "{m.text}"
                    </p>
                  </div>
                ))}
              </div>

            </div>

            {/* Sticker Note Submission Form */}
            <form onSubmit={handleSendMessage} className="space-y-2.5 pt-4 border-t border-white/10 mt-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <input 
                  type="text" 
                  value={msgName}
                  onChange={(e) => setMsgName(e.target.value)}
                  placeholder="Чиний нэр..." 
                  maxLength={15}
                  className="md:col-span-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 px-3.5 py-3 rounded-xl border border-white/10 focus:border-rose-400 focus:outline-none text-xs font-bold text-white transition-all w-full"
                  required
                />
                <input 
                  type="text" 
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Асралтад урам өгөх ухаалаг үгсээ бичээрэй... 📝" 
                  maxLength={120}
                  className="md:col-span-2 bg-white/5 hover:bg-white/10 focus:bg-white/10 px-3.5 py-3 rounded-xl border border-white/10 focus:border-rose-400 focus:outline-none text-xs text-slate-200 transition-all w-full"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 to-indigo-600 hover:brightness-110 text-white font-black py-3 rounded-xl text-xs transition-all duration-300 transform active:scale-95 shadow-xl flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Стикер хананд наах 📌</span>
              </button>
            </form>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-[#070514]/90 text-slate-400 border-t border-white/5 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-black tracking-widest text-slate-200">БАС БРЭНД ӨСВӨР СУРГҮҮЛЬ</span>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-white">Асралтын Хувийн Цахим Ертөнц</h3>
            <p className="text-xs text-slate-450 max-w-md mx-auto leading-relaxed">
              Миний дуртай спорт, One Piece анимэ, тоглоом болон хувийн мэдээллүүдийг сонирхсон танд маш их баярлалаа! Үргэлж эерэг давалгаатай байж, мөрөөдөлдөө тэмүүлээрэй.
            </p>
          </div>

          <div className="text-[10px] text-slate-650 max-w-md mx-auto pt-4 border-t border-white/5 uppercase tracking-widest font-semibold font-mono">
            &copy; {new Date().getFullYear()} АСРАЛТ. ЗОХИОГЧИЙН ЭРХ ХАМГААЛАГДСАН.
          </div>
        </div>
      </footer>

      {/* 🤖 MY IDOL (YUJI ITADORI) OVERLAY MODAL */}
      <AnimatePresence>
        {isIdolChatOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#060412]/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="bg-[#0c0a21]/95 border border-amber-500/30 rounded-3xl w-full max-w-lg h-[550px] flex flex-col overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.2)] relative"
            >
              {/* Outer decorative neon glows */}
              <div className="absolute top-0 left-0 w-36 h-36 bg-gradient-to-tr from-amber-500/10 to-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              {/* Modal Header */}
              <div className="bg-[#0e0b28] border-b border-white/5 p-4 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-[1.5px] flex-shrink-0 shadow-lg">
                    <div className="w-full h-full rounded-2xl bg-[#0c0a21] flex items-center justify-center text-xl">
                      👊
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                      Idol Coach (Yuji Itadori) 🤖
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      <span className="text-[10px] text-amber-400 font-extrabold tracking-wide uppercase">
                        JJK-ийн гол дүр • Халуун сэтгэлт дасгалжуулагч
                      </span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsIdolChatOpen(false)}
                  className="text-slate-450 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  title="Хаах"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Message Window */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col relative z-10 custom-scrollbar bg-[#09071c]/30">
                {idolMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] text-xs px-4 py-3 rounded-2.5xl leading-relaxed shadow-lg font-sans border ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none border-indigo-500/30' 
                          : 'bg-white/5 text-slate-100 rounded-tl-none border-amber-500/10'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[8px] text-slate-500 mt-1 px-1 select-none">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                
                {isIdolTyping && (
                  <div className="flex flex-col items-start">
                    <div className="bg-white/5 text-slate-300 text-xs px-4 py-3 rounded-2.5xl rounded-tl-none border border-amber-500/10 flex items-center gap-2 shadow-md">
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Юүжи хариулт бичиж байна...</span>
                    </div>
                  </div>
                )}
                
                <div ref={idolEndRef} />
              </div>

              {/* Chat Input Field Form */}
              <form 
                onSubmit={sendIdolMessage} 
                className="p-3 bg-[#08061a] border-t border-white/5 flex gap-2 items-center relative z-10"
              >
                <input 
                  type="text"
                  value={idolInput}
                  onChange={(e) => setIdolInput(e.target.value)}
                  placeholder="Юүжид хэлэх урамтай үгс эсвэл асуулт..." 
                  className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 px-4 py-3 rounded-2xl border border-white/10 focus:border-amber-400 focus:outline-none text-xs font-bold text-white placeholder-slate-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!idolInput.trim() || isIdolTyping}
                  className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-115 text-white transition-all transform active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💬 ME-AI ASSISTANT (ASRALT) POPUP CHAT & FLOATING BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Floating Messenger-style toggle launcher button */}
        {!isMeChatOpen && (
          <button
            onClick={() => {
              setIsMeChatOpen(true);
              triggerReward(15, "🏀 Асралтын AI туслах чат нээгдлээ!");
            }}
            className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 hover:brightness-110 p-4 rounded-full shadow-[0_5px_25px_rgba(99,102,241,0.55)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.7)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center text-white border border-white/20 select-none animate-bounce relative group"
            title="Асралт AI Туслах"
          >
            {/* Pulsing indicator dot */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#070514] rounded-full"></span>
            <MessageSquare className="w-5.5 h-5.5 text-white animate-pulse" />
            
            {/* Tooltip */}
            <span className="absolute right-14 bg-[#0a071d] border border-indigo-500/20 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
              Асралт AI туслах 🏀✨
            </span>
          </button>
        )}

        {/* Messenger Chat Box Panel */}
        <AnimatePresence>
          {isMeChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-[#0c0921]/95 border border-indigo-500/30 backdrop-blur-2xl rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] w-80 sm:w-96 h-[480px] flex flex-col overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>

              {/* Chat Header */}
              <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-[#0e0b28] p-3 border-b border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg shadow-inner">
                    🏀
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white flex items-center gap-1 uppercase tracking-wider">
                      Асралт (AI Туслах) 🟢
                    </h4>
                    <span className="text-[9px] text-indigo-300 font-bold tracking-wide uppercase">
                      Ирээдүйн инженер, сагсчин
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsMeChatOpen(false)}
                  className="text-slate-450 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                  title="Хаах"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat messages container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col relative z-10 custom-scrollbar bg-slate-950/20">
                {meMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] text-[11px] px-3.5 py-2.5 rounded-2.5xl leading-relaxed shadow-lg font-sans border ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none border-indigo-500/30' 
                          : 'bg-white/5 text-slate-100 rounded-tl-none border-indigo-500/10'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[7.5px] text-slate-500 mt-1 px-1 select-none">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {isMeTyping && (
                  <div className="flex flex-col items-start">
                    <div className="bg-white/5 text-slate-300 text-[10px] px-3.5 py-2.5 rounded-2.5xl rounded-tl-none border border-indigo-500/10 flex items-center gap-1.5 shadow-md">
                      <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                        <span className="w-1.2 h-1.2 rounded-full bg-indigo-400 animate-bounce"></span>
                        <span className="w-1.2 h-1.2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.2 h-1.2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                      <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">Асралт хариулж байна...</span>
                    </div>
                  </div>
                )}

                <div ref={meEndRef} />
              </div>

              {/* Chat Input Field Form */}
              <form 
                onSubmit={sendMeMessage} 
                className="p-2.5 bg-[#08061a] border-t border-white/5 flex gap-2 items-center relative z-10"
              >
                <input 
                  type="text"
                  value={meInput}
                  onChange={(e) => setMeInput(e.target.value)}
                  placeholder="Асралтаас асуух зүйлээ бичээрэй..." 
                  className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/10 focus:border-indigo-400 focus:outline-none text-[11px] font-bold text-white placeholder-slate-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!meInput.trim() || isMeTyping}
                  className="p-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white transition-all transform active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
