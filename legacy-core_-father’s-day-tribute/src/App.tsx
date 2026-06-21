import React, { useState, useRef, FormEvent, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { 
  Volume2, 
  VolumeX, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Heart, 
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
  Trash2,
  PenTool,
  Trophy,
  Smile,
  HeartHandshake,
  Star,
  Crown,
  Wrench,
  Gift,
  Pin,
  Send,
  MessageSquare,
  Plus,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Wind,
  Thermometer,
  Droplets,
  Search,
  RefreshCw,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Printer
} from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

// Import the generated high-quality Father's Day image
// @ts-ignore
import fatherPoster from "./assets/images/fathers_day_poster_1781971607956.jpg";
// @ts-ignore
import familyChaiMoment from "./assets/images/family_chai_moment_1781977463188.jpg";
// @ts-ignore
import familyHikingAdventure from "./assets/images/family_hiking_adventure_1781977481908.jpg";
// @ts-ignore
import familyCookingTogether from "./assets/images/family_cooking_together_1781977497417.jpg";

// ============================================================================
// RETRO SYNTHESIZER SOUND ENGINE
// ============================================================================
let globalSoundMuted = false;

const playSynthSound = (type: "click" | "success" | "fail" | "valve" | "squish" | "unlock" | "key") => {
  if (globalSoundMuted) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (type === "click") {
      // Crisp 3D button click sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "key") {
      // Light key click sound for vault
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(500, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === "success") {
      // Golden fanfare chime loop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.08); // E4
      osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.16); // G4
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.24); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.32); // E5
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.40); // C6
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } else if (type === "fail") {
      // Soft springy buzzer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "valve") {
      // Compressed high-pressure steam valve release
      const bufferSize = ctx.sampleRate * 0.18;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.18);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } else if (type === "squish") {
      // Bubbly elastic heartbeat pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === "unlock") {
      // Sincere bell-tower victory sound
      const playChime = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };
      playChime(523.25, 0, 0.4); // C
      playChime(659.25, 0.12, 0.4); // E
      playChime(783.99, 0.24, 0.4); // G
      playChime(1046.5, 0.36, 0.8); // C6
    }
  } catch (e) {
    console.warn("WebAudio gesture block", e);
  }
};

// ============================================================================
// CHRONICLE MILESTONES DEFINITION
// ============================================================================
interface Milestone {
  id: string;
  chapter: string;
  title: string;
  subtitle: string;
  description: string;
  personalNote: string;
}

const MILESTONES: Milestone[] = [
  {
    id: "milestone-1",
    chapter: "Chapter I",
    title: "Unshakeable Strength & Resilience",
    subtitle: "Your Quiet and Courageous Calm",
    description: "Whenever difficult storms hit our family, you showed me how to maintain focus, stand tall, and stay calm. Your silent courage in high-pressure moments taught me how to face the world without fear.",
    personalNote: "Thank you for being my unshakeable anchor during life's most challenging waves. Because of you, I learned how to stand strong."
  },
  {
    id: "milestone-2",
    chapter: "Chapter II",
    title: "A Compass of Uncompromising Integrity",
    subtitle: "Your Honest Moral Guidance",
    description: "An uncompromised legacy of kindness, honesty, and extreme reliability. You didn't just tell me how to behave; you lived these values every single day and installed an unwavering moral compass in me.",
    personalNote: "I learned how to be a trustworthy, hardworking human being simply by watching how you treat others with genuine respect."
  },
  {
    id: "milestone-3",
    chapter: "Chapter III",
    title: "Infinite Support & Constant Care",
    subtitle: "Your Unceasing Unconditional Love",
    description: "A continuous, comforting shield of love. Through late-night chats, morning guidance, and infinite patience, you have always been there for me whenever I reached out, with zero hesitation.",
    personalNote: "No matter how busy or tired you were, your support was endless. You are my absolute hero and best friend."
  }
];


interface SignatureRevealProps {
  src: string;
}

const SignatureReveal: React.FC<SignatureRevealProps> = ({ src }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Animated revealing container of the image */}
      <motion.div
        initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
        transition={{ duration: 2.4, ease: "easeInOut", delay: 0.8 }}
        className="w-full h-full flex items-center justify-center"
      >
        <img 
          src={src} 
          alt="Committed signature" 
          className="max-h-full max-w-full object-contain filter brightness-90 contrast-125 select-none"
        />
      </motion.div>

      {/* Trailing golden laser/light line that moves left-to-right as it is revealed */}
      <motion.div
        initial={{ left: "0%", opacity: 0 }}
        animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
        transition={{ 
          left: { duration: 2.4, ease: "easeInOut", delay: 0.8 },
          opacity: { times: [0, 0.05, 0.9, 1], duration: 2.4, ease: "linear", delay: 0.8 }
        }}
        className="absolute top-0 bottom-0 w-[4px] bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-200 pointer-events-none drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] z-10"
        style={{
          boxShadow: "0 0 16px #f59e0b, 0 0 32px #fbbf24",
        }}
      >
        {/* Sparkle emitter node right along the laser line */}
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
          {/* Pulsating core */}
          <div className="w-5 h-5 rounded-full bg-white animate-ping absolute -inset-1 border border-amber-300 shadow-[0_0_12px_#f59e0b]" />
          
          {/* Orbiting glittering star icons */}
          <div className="absolute -top-7 -left-3 animate-bounce text-[10px] text-yellow-300 select-none">✦</div>
          <div className="absolute top-5 -right-2 animate-pulse text-[8px] text-amber-400 select-none" style={{ animationDelay: "0.2s" }}>✦</div>
          <div className="absolute -top-4 right-4 animate-bounce text-[12px] text-yellow-400 select-none" style={{ animationDelay: "0.5s" }}>✦</div>
        </div>
      </motion.div>
    </div>
  );
};

// PROFOUND & HUMOROUS DAD WISDOM ATTRIBUTED TO PANKAJ
const PANKAJ_WISDOM = [
  {
    id: "pw-1",
    text: "No life problem is too complex that a moment of calm reflection, steady integrity, and deep breathing cannot resolve. 🧘",
    label: "Pankaj's Golden Rule",
    category: "Profound"
  },
  {
    id: "pw-2",
    text: "Before buying something, ask: Is it an absolute NEED, a passing WANT, or just a really good marketing trick? 🛍️",
    label: "Pankaj's Financial Axiom",
    category: "Humorous"
  },
  {
    id: "pw-3",
    text: "Do your absolute best, leave the outcome to the heavens, and remember to maintain deep breathing! 🧘",
    label: "Ultimate Calm Directive",
    category: "Profound"
  },
  {
    id: "pw-4",
    text: "Never, ever dry run a water pump, and always keep the engine revs smooth. Respect your machinery! 🚗",
    label: "Machinery Mandate #1",
    category: "Humorous"
  },
  {
    id: "pw-5",
    text: "A strategic silence maintained at the correct peak moment is often the smartest answer to a loud argument. 🤫",
    label: "Pankaj's Quiet Strategy",
    category: "Profound"
  },
  {
    id: "pw-6",
    text: "You rarely need high-tech GPS navigation if you have common sense and a willingness to ask three local people. 🗺️",
    label: "Analog Navigation Principle",
    category: "Humorous"
  },
  {
    id: "pw-7",
    text: "True luxury isn't found in premium branded labels; it lies in a deep sleep, hot home food, and a clear conscience. ✨",
    label: "The Conscience Scale",
    category: "Profound"
  }
];

// PHOTO COHESIVE MEMOIR COLLECTION FOR PANKAJ CELEBRATION
const FAMILY_GALLERY = [
  {
    id: "g-1",
    src: fatherPoster,
    caption: "Our Bedrock & Hero",
    subtitle: "Happy Father's Day, Pankaj!",
    sticker: "Official Tribute 🏆",
    color: "from-amber-400 to-amber-200"
  },
  {
    id: "g-2",
    src: familyChaiMoment,
    caption: "Invaluable lessons & lots of laughs",
    subtitle: "Pankaj's core values and life lessons",
    sticker: "Unshakeable Wisdom 💡",
    color: "from-orange-400 to-amber-300"
  },
  {
    id: "g-3",
    src: familyCookingTogether,
    caption: "Warmth & team work in the kitchen",
    subtitle: "Cooking dinner together, happy memories",
    sticker: "Chef Master 🍳",
    color: "from-rose-400 to-pink-300"
  },
  {
    id: "g-4",
    src: familyHikingAdventure,
    caption: "Adventure on a high mountain trail",
    subtitle: "Guiding our path up mountains & life",
    sticker: "Compass 🏔️",
    color: "from-emerald-400 to-teal-300"
  }
];

interface PolaroidCarouselProps {
  onPhotoChange?: () => void;
}

const PolaroidCarousel: React.FC<PolaroidCarouselProps> = ({ onPhotoChange }) => {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1); // 1 = next, -1 = prev

  const handleNext = () => {
    setDir(1);
    setIndex((prev) => (prev + 1) % FAMILY_GALLERY.length);
    if (onPhotoChange) onPhotoChange();
  };

  const handlePrev = () => {
    setDir(-1);
    setIndex((prev) => (prev - 1 + FAMILY_GALLERY.length) % FAMILY_GALLERY.length);
    if (onPhotoChange) onPhotoChange();
  };

  const setPhotoIndex = (newIdx: number) => {
    if (newIdx === index) return;
    setDir(newIdx > index ? 1 : -1);
    setIndex(newIdx);
    if (onPhotoChange) onPhotoChange();
  };

  // Drag handler to make it swipeable!
  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  const currentPhoto = FAMILY_GALLERY[index];

  // Variations for polaroid pile swapping feel
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 320 : -320,
      opacity: 0,
      scale: 0.82,
      rotate: direction > 0 ? 12 : -12,
      zIndex: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotate: index % 2 === 0 ? 1.5 : -1.5,
      zIndex: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 28 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.3 },
        rotate: { duration: 0.35 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 320 : -320,
      opacity: 0,
      scale: 0.82,
      rotate: direction < 0 ? 12 : -12,
      zIndex: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 28 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <div className="relative w-full overflow-visible py-4 flex flex-col items-center">
      {/* Outer wrapper that bounds swipe drag gestures is interactive */}
      <div className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-[3/4] flex items-center justify-center select-none touch-none">
        
        {/* Decorative backdrop stack of cards mimicking random piles beneath */}
        <div className="absolute inset-0 bg-white border-[3px] border-slate-900 rounded-2xl shadow-md rotate-[-4deg] scale-[0.98] transform translate-y-1.5 translate-x-1.5 opacity-40 z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-white border-[3px] border-slate-900 rounded-2xl shadow-sm rotate-[5deg] scale-[0.96] transform -translate-y-1 -translate-x-2 opacity-25 z-0 pointer-events-none" />

        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.65}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.02 }}
            className="absolute inset-0 bg-white p-3.5 pb-7 rounded-2xl shadow-[0_20px_45px_rgba(7,9,14,0.22),8px_8px_0px_#07090e] border-[3px] border-slate-900 flex flex-col justify-between cursor-grab active:cursor-grabbing z-10"
            title="Swipe left or right to rotate images!"
          >
            {/* The photo frame within polaroid container */}
            <div className="relative w-full aspect-[1/1] overflow-hidden rounded-xl border-2 border-slate-900 bg-slate-150 shrink-0">
              <img
                src={currentPhoto.src}
                alt={currentPhoto.caption}
                className="w-full h-full object-cover pointer-events-none select-none filter saturate-[1.08]"
                referrerPolicy="no-referrer"
              />

              {/* Absolute glass gloss overlay */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

              {/* Dynamic badge sticker at the top-right of image */}
              <div className="absolute top-2.5 right-2 a-sticker">
                <span className={`inline-flex items-center text-[8px] font-mono tracking-wider text-slate-900 font-extrabold px-2 py-0.5 rounded-md border-2 border-slate-900 shadow-sm bg-gradient-to-r ${currentPhoto.color} uppercase`}>
                  {currentPhoto.sticker}
                </span>
              </div>
            </div>

            {/* Handwritten style Polaroids captioned base */}
            <div className="flex flex-col items-center justify-center pt-3 px-1 text-center">
              <h4 className="text-sm sm:text-base font-serif font-bold text-slate-850 tracking-tight leading-tight mb-0.5 select-none">
                {currentPhoto.caption}
              </h4>
              <p className="text-[10px] text-slate-500 font-sans tracking-wide leading-normal italic font-medium select-none">
                {currentPhoto.subtitle}
              </p>
            </div>
            
            {/* Polaroid Tape Accent at top */}
            <div className="absolute -top-3.5 left-1/2 -ml-12 w-24 h-5 border-2 border-slate-900 bg-amber-400/85 flex items-center justify-center text-[7.5px] font-mono font-bold tracking-widest text-slate-950 shadow-sm rounded-sm origin-center rotate-1 uppercase">
              ✨ Memoir {index + 1}/{FAMILY_GALLERY.length}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Quick Action Overlays (Swipe Navigation Buttons) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 bg-white text-slate-900 h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-slate-900 shadow-[1px_1px_0px_#07090e] hover:shadow-[3px_3px_0px_#07090e] hover:scale-105 active:scale-95 flex items-center justify-center transition-all z-20 cursor-pointer"
          title="Previous Photo"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 bg-white text-slate-900 h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-slate-900 shadow-[1px_1px_0px_#07090e] hover:shadow-[3px_3px_0px_#07090e] hover:scale-105 active:scale-95 flex items-center justify-center transition-all z-20 cursor-pointer"
          title="Next Photo"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Slide Index indicators dots */}
      <div className="flex items-center justify-center space-x-1.5 mt-5">
        {FAMILY_GALLERY.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPhotoIndex(idx)}
            className={`cursor-pointer h-2 transition-all rounded-full ${
              idx === index 
                ? "w-5 bg-amber-500 border border-slate-950 shadow-sm" 
                : "w-2 bg-slate-250 border border-slate-400 hover:bg-slate-300"
            }`}
            title={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 mt-2.5 animate-pulse text-center">
        💡 Drag, swipe, or use arrows to flip memoirs
      </p>
    </div>
  );
};

export default function App() {
  // Generate stable golden dust particles to create a beautiful, slow-drifting festive look
  const goldenDustParticles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const size = Math.random() * 3 + 1.5; // delicate 1.5px to 4.5px particles
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const moveX = (Math.random() - 0.5) * 40; // drift dynamically horizontally
      const moveY = -Math.random() * 120 - 40; // drift upwards
      const duration = Math.random() * 14 + 10; // slow, dreamy pace
      const delay = Math.random() * -20; // negative delay so they are instantly distributed
      const initialOpacity = Math.random() * 0.4 + 0.15;
      return {
        id: i,
        size,
        startX,
        startY,
        moveX,
        moveY,
        duration,
        delay,
        initialOpacity,
      };
    });
  }, []);

  // Calculate accurate countdown to Pankaj's actual birthday on 31st December
  const daysToPankajBirthday = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    let targetBday = new Date(currentYear, 11, 31, 0, 0, 0); // Month 11 is December
    
    if (today.getTime() > targetBday.getTime()) {
      targetBday = new Date(currentYear + 1, 11, 31, 0, 0, 0);
    }
    
    const diffMs = targetBday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  // Audio Controller
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // sound mute toggle state
  const [isMuted, setIsMuted] = useState(false);

  // Personalization fields to make the gift extremely customizable and sweet
  const [recipientName, setRecipientName] = useState("Dad");
  const [senderName, setSenderName] = useState("Aditya & Samridh");
  const [customGiftTitle, setCustomGiftTitle] = useState("World's #1 Champion");
  const [favoriteSuperpower, setFavoriteSuperpower] = useState("Unshakeable Wisdom");

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [klinkLink, setKlinkLink] = useState("https://klinkme.com/pankaj");

  // Keep globalSoundMuted in sync with isMuted
  useEffect(() => {
    globalSoundMuted = isMuted;
  }, [isMuted]);

  // Flow Progression Pages: "intro" -> "finale"
  const [currentStep, setCurrentStep] = useState<"intro" | "finale">("intro");
  
  // Initialize Background Audio (Lighter piano loop loopable track)
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://assets.mixkit.co/music/preview/mixkit-ambient-piano-loop-83.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.35;
    }
  }, []);

  const startMusic = async () => {
    if (audioRef.current && !isPlaying) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setAudioError(false);
      } catch (err) {
        console.warn("Audio waiting gesture", err);
        setAudioError(true);
      }
    }
  };

  const toggleAudio = async () => {
    playSynthSound("click");
    if (!audioRef.current) {
      audioRef.current = new Audio("https://assets.mixkit.co/music/preview/mixkit-ambient-piano-loop-83.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.35;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setAudioError(false);
      } catch (err) {
        console.warn("Blocked audio playing", err);
        setAudioError(true);
      }
    }
  };

  // Minigame 1 States (Dad Joke Match)
  const [selectedJokeIndex, setSelectedJokeIndex] = useState<number | null>(null);
  const [jokeSuccess, setJokeSuccess] = useState(false);
  const [jokeErrorAnim, setJokeErrorAnim] = useState(false);

  // Minigame 2 States (steam valve click game)
  const [leakFixProgress, setLeakFixProgress] = useState(20);
  const [valveRotation, setValveRotation] = useState(0);
  const [leakFixed, setLeakFixed] = useState(false);

  // Minigame 3 States (Virtual Heart-Squeezer)
  const [hugPower, setHugPower] = useState(0);
  const [hugCompleted, setHugCompleted] = useState(false);
  const [isSqueezing, setIsSqueezing] = useState(false);

  // Autograph canvas drawing states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [selectedInkColor, setSelectedInkColor] = useState("#D4AF37"); // Gold
  const [drawingSparkles, setDrawingSparkles] = useState<Array<{ id: string; x: number; y: number; size: number; color: string }>>([]);

  // Safe Lock Cryptographic Vault States
  const [vaultInput, setVaultInput] = useState("");
  const [vaultAttempts, setVaultAttempts] = useState(0);
  const [vaultError, setVaultError] = useState(false);
  const [isLeverPulled, setIsLeverPulled] = useState(false);

  // Dad Lore Minigame States

  // Message Wall States
  const [heartfeltNotes, setHeartfeltNotes] = useState<Array<{ id: string; text: string; sender: string; color: string; createdAt: string; rotation: number }>>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteSender, setNewNoteSender] = useState("");
  const [newNoteColor, setNewNoteColor] = useState("amber");

  // Atmospheric Weather States for Dad
  const [weatherCity, setWeatherCity] = useState("Your Location");
  const [weatherTemp, setWeatherTemp] = useState<number>(24);
  const [weatherHumidity, setWeatherHumidity] = useState<number>(60);
  const [weatherWind, setWeatherWind] = useState<number>(12);
  const [weatherCondition, setWeatherCondition] = useState("Cozy & Pleasant");
  const [weatherIconName, setWeatherIconName] = useState<"sun" | "cloud" | "rain" | "snow" | "cloudSun">("sun");
  const [weatherFeelingNote, setWeatherFeelingNote] = useState("Perfect storytelling & wisdom-sharing conditions verified!");
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherSearchQuery, setWeatherSearchQuery] = useState("");
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const generateDadWeatherFeeling = (temp: number, cond: string): string => {
    const isRain = cond.toLowerCase().includes("rain") || cond.toLowerCase().includes("drizzle") || cond.toLowerCase().includes("shower") || cond.toLowerCase().includes("monsoon");
    const isSnow = cond.toLowerCase().includes("snow") || temp < 5;
    
    if (isRain) {
      return "Supreme weather for cozy, inspiring stories and shared laughter! 🌧️💬";
    }
    if (isSnow) {
      return "Winter protection index active! Keep cozy under a warm blanket. ❄️🧣";
    }
    if (temp >= 30) {
      return "A crisp, cool refreshing beverage or high-power air conditioner recommended! ☀️🥤";
    }
    if (temp >= 20 && temp < 30) {
      return "Absolutely perfect ambient temperature to relax and tell old stories! 😊🍂";
    }
    if (temp >= 10 && temp < 20) {
      return "Cozy sweater breeze, optimal couch power-nap environments! 📖🛋️";
    }
    return "Steaming hot inspiration and storytelling parameters fully verified. Stay cozy! ✨";
  };

  useEffect(() => {
    const q = query(collection(db, 'heartfeltNotes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setHeartfeltNotes(notes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'heartfeltNotes');
    });
    return () => unsubscribe();
  }, []);

  // Dad Wisdom Rotation and Coordinate States
  const [wisdomIndex, setWisdomIndex] = useState(0);
  const [wisdomY, setWisdomY] = useState(72);
  const [wisdomDir, setWisdomDir] = useState(1); // 1 = Left to right, -1 = Right to left

  useEffect(() => {
    if (currentStep === "finale") return;
    const interval = setInterval(() => {
      setWisdomIndex(prev => (prev + 1) % PANKAJ_WISDOM.length);
      // Random Y screen offset to prevent overlaps, kept in a safe 62% to 78% range
      setWisdomY(Math.floor(Math.random() * 16) + 62);
      setWisdomDir(prev => -prev);
    }, 14000); // cycle every 14 seconds
    return () => clearInterval(interval);
  }, [currentStep]);

  const fetchWeatherByIP = async () => {
    setIsWeatherLoading(true);
    setWeatherError(null);
    try {
      const ipRes = await fetch("https://ipapi.co/json/");
      if (!ipRes.ok) throw new Error("IP Geolocation offline");
      const ipData = await ipRes.json();
      
      const city = ipData.city || "Delhi";
      const region = ipData.region || ipData.country_name || "DL";
      const lat = ipData.latitude || 28.6139;
      const lon = ipData.longitude || 77.2090;

      setWeatherCity(`${city}, ${region}`);

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
      );
      if (!weatherRes.ok) throw new Error("Weather forecast service failed");
      const weatherData = await weatherRes.json();
      
      const temp = Math.round(weatherData.current.temperature_2m);
      const humidity = Math.round(weatherData.current.relative_humidity_2m);
      const wind = Math.round(weatherData.current.wind_speed_10m);
      const code = weatherData.current.weather_code;

      setWeatherTemp(temp);
      setWeatherHumidity(humidity);
      setWeatherWind(wind);

      let cond = "Pleasant";
      let icon: "sun" | "cloud" | "rain" | "snow" | "cloudSun" = "sun";

      if (code === 0) {
        cond = "Sunny & Clear";
        icon = "sun";
      } else if ([1, 2, 3].includes(code)) {
        cond = "Partly Cloudy";
        icon = "cloudSun";
      } else if ([45, 48].includes(code)) {
        cond = "Foggy Weather";
        icon = "cloud";
      } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
        cond = "Rainy Showers";
        icon = "rain";
      } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
        cond = "Snowy Spark";
        icon = "snow";
      } else {
        cond = "Atmospheric Cloud";
        icon = "cloud";
      }

      setWeatherCondition(cond);
      setWeatherIconName(icon);
      setWeatherFeelingNote(generateDadWeatherFeeling(temp, cond));
    } catch (err: any) {
      console.warn("Weather fetch failed, falling back to default cozy: ", err);
      setWeatherCity("Cozy Haven");
      setWeatherTemp(25);
      setWeatherHumidity(58);
      setWeatherWind(12);
      setWeatherCondition("Comfortable & Scenic");
      setWeatherIconName("cloudSun");
      setWeatherFeelingNote(generateDadWeatherFeeling(25, "Comfortable & Scenic"));
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const fetchWeatherByCityName = async (cityName: string) => {
    if (!cityName.trim()) return;
    setIsWeatherLoading(true);
    setWeatherError(null);
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );
      if (!geoRes.ok) throw new Error("City not found");
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("No city found by that name. Try another!");
      }

      const match = geoData.results[0];
      const cityLabel = `${match.name}, ${match.admin1 || match.country}`;
      const lat = match.latitude;
      const lon = match.longitude;

      setWeatherCity(cityLabel);

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
      );
      if (!weatherRes.ok) throw new Error("Weather forecast service failed");
      const weatherData = await weatherRes.json();
      
      const temp = Math.round(weatherData.current.temperature_2m);
      const humidity = Math.round(weatherData.current.relative_humidity_2m);
      const wind = Math.round(weatherData.current.wind_speed_10m);
      const code = weatherData.current.weather_code;

      setWeatherTemp(temp);
      setWeatherHumidity(humidity);
      setWeatherWind(wind);

      let cond = "Pleasant";
      let icon: "sun" | "cloud" | "rain" | "snow" | "cloudSun" = "sun";

      if (code === 0) {
        cond = "Sunny & Clear";
        icon = "sun";
      } else if ([1, 2, 3].includes(code)) {
        cond = "Partly Cloudy";
        icon = "cloudSun";
      } else if ([45, 48].includes(code)) {
        cond = "Foggy Weather";
        icon = "cloud";
      } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
        cond = "Rainy Showers";
        icon = "rain";
      } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
        cond = "Snowy Spark";
        icon = "snow";
      } else {
        cond = "Atmospheric Cloud";
        icon = "cloud";
      }

      setWeatherCondition(cond);
      setWeatherIconName(icon);
      setWeatherFeelingNote(generateDadWeatherFeeling(temp, cond));
      setWeatherSearchQuery("");
    } catch (err: any) {
      setWeatherError(err.message || "Could not fetch city weather");
      playSynthSound("fail");
    } finally {
      setIsWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherByIP();
  }, []);

  const triggerStepChange = (step: typeof currentStep) => {
    playSynthSound("click");
    setCurrentStep(step);
  };

  // Particle bursts
  const fireHeartConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.62 },
      colors: ["#D4AF37", "#FF69B4", "#FF1493", "#60A5FA", "#FFFFFF"]
    });
  };

  const fireUltimateConfetti = () => {
    playSynthSound("unlock");
    const duration = 8 * 1000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#D4AF37", "#FBBF24", "#FF69B4", "#38BDF8"]
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#D4AF37", "#FBBF24", "#FF69B4", "#38BDF8"]
      });

      confetti({
        particleCount: 20,
        angle: 90,
        spread: 80,
        origin: { x: 0.5, y: 0.4 },
        colors: ["#FFF7ED", "#FEF3C7", "#FBBF24", "#F59E0B", "#D97706"]
      });
      confetti({
        particleCount: 15,
        spread: 120,
        origin: { x: Math.random(), y: 0.75 },
        colors: ["#FFFFFF", "#FCD34D", "#D4AF37", "#FBBF24"]
      });
    }, 200);
  };


  // Message Wall - Adding custom post-it note
  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    playSynthSound("success");
    const randomRotation = Math.floor(Math.random() * 12) - 6;

    const newNote = {
      text: newNoteText.trim(),
      sender: newNoteSender.trim() || senderName,
      color: newNoteColor,
      createdAt: new Date().toISOString(),
      rotation: randomRotation
    };

    try {
        await addDoc(collection(db, 'heartfeltNotes'), newNote);
    } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'heartfeltNotes');
    }
    setNewNoteText("");
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x: 0.5, y: 0.8 }
    });
  };

  const handleDeleteNote = async (id: string) => {
    playSynthSound("click");
    try {
        await deleteDoc(doc(db, 'heartfeltNotes', id));
    } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `heartfeltNotes/${id}`);
    }
  };

  // Game 1 Punchline click
  const handleCheckJoke = (idx: number) => {
    if (idx === 1) { // Choice B - water-melon
      playSynthSound("success");
      setSelectedJokeIndex(idx);
      setJokeSuccess(true);
      fireHeartConfetti();
    } else {
      playSynthSound("fail");
      setSelectedJokeIndex(idx);
      setJokeErrorAnim(true);
      setTimeout(() => setJokeErrorAnim(false), 500);
    }
  };

  // Game 2 Valve click rotation
  const handleTurnValve = () => {
    if (leakFixed) return;
    playSynthSound("valve");
    
    const nextRotation = valveRotation + 120;
    setValveRotation(nextRotation);

    const nextProgress = Math.min(leakFixProgress + 16, 100);
    setLeakFixProgress(nextProgress);

    if (nextProgress >= 100) {
      setTimeout(() => {
        playSynthSound("success");
        setLeakFixed(true);
        fireHeartConfetti();
      }, 300);
    }
  };

  // Game 3 Fluffy Heart Squeezes
  const handleSqueezeHeart = () => {
    if (hugCompleted) return;
    playSynthSound("squish");
    setIsSqueezing(true);
    
    const nextPower = Math.min(hugPower + 10, 100);
    setHugPower(nextPower);

    setTimeout(() => setIsSqueezing(false), 160);

    if (nextPower >= 100) {
      setTimeout(() => {
        playSynthSound("success");
        setHugCompleted(true);
        fireHeartConfetti();
      }, 400);
    }
  };

  // Canvas drawing triggers
  const addSparkleTrail = (cx: number, cy: number) => {
    const isGoldColor = selectedInkColor === "#D4AF37";
    const newSparkles = Array.from({ length: 4 }).map((_, i) => ({
      id: `sparkle-${Math.random()}-${i}-${Date.now()}`,
      x: cx,
      y: cy,
      size: Math.random() * 8 + 4,
      color: isGoldColor ? "#fbbf24" : selectedInkColor
    }));
    setDrawingSparkles(prev => [...prev.slice(-40), ...newSparkles]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = selectedInkColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 8;
    ctx.shadowColor = selectedInkColor;

    const rect = canvas.getBoundingClientRect();
    let cx = 0, cy = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      cx = e.touches[0].clientX - rect.left;
      cy = e.touches[0].clientY - rect.top;
    } else {
      cx = e.clientX - rect.left;
      cy = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    setIsDrawing(true);
    addSparkleTrail(cx, cy);
  };

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = selectedInkColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 8;
    ctx.shadowColor = selectedInkColor;

    const rect = canvas.getBoundingClientRect();
    let cx = 0, cy = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      cx = e.touches[0].clientX - rect.left;
      cy = e.touches[0].clientY - rect.top;
    } else {
      cx = e.clientX - rect.left;
      cy = e.clientY - rect.top;
    }

    ctx.lineTo(cx, cy);
    ctx.stroke();
    addSparkleTrail(cx, cy);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    playSynthSound("click");
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSavedSignature(null);
    setDrawingSparkles([]);
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSavedSignature(dataUrl);
    playSynthSound("success");
    fireHeartConfetti();
  };

  // Safe locked Combination Lever Pull
  const handleLeverPull = (e: FormEvent) => {
    e.preventDefault();
    playSynthSound("click");
    setIsLeverPulled(true);

    const normal = vaultInput
      .toLowerCase()
      .trim()
      .replace(/[\u2018\u2019\u201B\u2032\u2035']/g, "")
      .replace(/\s+/g, "");

    const isMatch = [
      "fathersday", "happyfathersday", "fatherday", 
      "happyfatherday", "father", "fathers", "happyfathers", "sunday"
    ].includes(normal);

    setTimeout(() => {
      if (isMatch) {
        playSynthSound("unlock");
        setCurrentStep("finale");
        setTimeout(() => {
          fireUltimateConfetti();
        }, 500);
      } else {
        playSynthSound("fail");
        setIsLeverPulled(false);
        setVaultError(true);
        setVaultAttempts(prev => prev + 1);
        setTimeout(() => setVaultError(false), 800);
      }
    }, 600);
  };

  const handleDialButton = (char: string) => {
    playSynthSound("key");
    if (char === "DEL") {
      setVaultInput(prev => prev.slice(0, -1));
    } else if (char === "RESET") {
      setVaultInput("");
    } else {
      if (vaultInput.length < 15) {
        setVaultInput(prev => prev + char);
      }
    }
  };

  const handleResetApp = () => {
    playSynthSound("click");
    setVaultInput("");
    setVaultAttempts(0);
    setLeakFixProgress(20);
    setLeakFixed(false);
    setHugPower(0);
    setHugCompleted(false);
    setSelectedJokeIndex(null);
    setJokeSuccess(false);
    setSavedSignature(null);
    setNewNoteText("");
    setNewNoteSender("");
    setHeartfeltNotes([
      { id: "note-1", text: "Thank you for teaching us how to be resilient, strong, and always laugh at the silly jokes! You are our real-world superhero.", sender: "Aditya", color: "amber", createdAt: "June 20, 2026", rotation: -2 },
      { id: "note-2", text: "You always have the calmest solution to every problem we bring to you. We are so lucky to have you!", sender: "Samridh", color: "gold", createdAt: "June 20, 2026", rotation: 3 },
      { id: "note-3", text: "To the master of unshakeable wisdom, life advice, and unconditional guidance. Happy Father's Day!", sender: "Aditya & Samridh", color: "orange", createdAt: "June 20, 2026", rotation: -1 }
    ]);
    setCurrentStep("intro");
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 font-sans pb-16 flex flex-col justify-between overflow-x-hidden selection:bg-amber-400 selection:text-[#07090e]">
      
      {/* 3D FLOATING SPACE BACKGROUND WITH PARTICLE GRIDS */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-grid opacity-60" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#121626]/40 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* MAGICAL AMBIENT GOLDEN DUST PARTICLE EFFECT */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {goldenDustParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-tr from-yellow-200 via-amber-300 to-white"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.startX}%`,
              top: `${particle.startY}%`,
              boxShadow: "0 0 6px rgba(251, 191, 36, 0.5)",
            }}
            animate={{
              y: [0, particle.moveY],
              x: [0, particle.moveX],
              opacity: [0, particle.initialOpacity, particle.initialOpacity * 0.4, 0],
              scale: [0.8, 1.2, 0.9, 0.7],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>
      
      {/* 3D FLOATING DECORATIONS */}
      <div className="absolute pointer-events-none inset-0 overflow-hidden z-0">
        {/* Floating 3D Gold Medallion */}
        <motion.div 
          animate={{ y: -25, rotateY: 360 }}
          transition={{ 
            y: { 
              type: "spring", 
              stiffness: 12, 
              damping: 8, 
              mass: 6, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }, 
            rotateY: { 
              duration: 10, 
              repeat: Infinity, 
              ease: "linear" 
            } 
          }}
          className="absolute top-24 left-[7%] opacity-40 select-none hidden md:block"
          style={{ perspective: "1000px", rotate: "12deg" }}
        >
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 p-1 border-[3px] border-amber-950 shadow-[0_8px_0_#92400e,0_15px_20px_rgba(0,0,0,0.6)] flex items-center justify-center transform-gpu">
            {/* Inner layer */}
            <div className="w-full h-full rounded-full border-2 border-dashed border-amber-950/40 bg-amber-500/10 flex items-center justify-center">
              <Crown className="w-7.5 h-7.5 text-amber-950 fill-amber-300/30" />
            </div>
          </div>
        </motion.div>

        {/* Floating 3D Gift Box Layout */}
        <motion.div 
          animate={{ y: 25, rotateX: 20, rotateZ: 360 }}
          transition={{ 
            y: { 
              type: "spring", 
              stiffness: 10, 
              damping: 7, 
              mass: 8, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }, 
            rotateX: { 
              type: "spring", 
              stiffness: 15, 
              damping: 9, 
              mass: 5, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }, 
            rotateZ: { 
              duration: 14, 
              repeat: Infinity, 
              ease: "linear" 
            } 
          }}
          className="absolute top-1/3 right-[8%] opacity-40 select-none hidden md:block"
          style={{ perspective: "1000px" }}
        >
          <div className="relative w-14 h-14 bg-gradient-to-tr from-sky-600 to-indigo-500 border-[3px] border-slate-900 rounded-xl shadow-[0_8px_0_#1e1b4b,0_12px_15px_rgba(0,0,0,0.5)] transform-gpu flex items-center justify-center">
            {/* Gift Ribbons visual layers */}
            <div className="absolute inset-y-0 w-3 bg-amber-400 border-x border-slate-900" />
            <div className="absolute inset-x-0 h-3 bg-amber-400 border-y border-slate-900" />
            <div className="absolute w-6 h-6 rounded-full bg-amber-500 border-2 border-slate-900 z-10 flex items-center justify-center">
              <Gift className="w-3.5 h-3.5 text-slate-900" />
            </div>
          </div>
        </motion.div>

        {/* Floating 3D Neon Holographic Heart */}
        <motion.div 
          animate={{ y: -18, scale: 1.15, rotate: 12 }}
          transition={{ 
            y: { 
              type: "spring", 
              stiffness: 16, 
              damping: 11, 
              mass: 4, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }, 
            scale: { 
              type: "spring", 
              stiffness: 12, 
              damping: 10, 
              mass: 3, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }, 
            rotate: { 
              type: "spring", 
              stiffness: 10, 
              damping: 8, 
              mass: 5, 
              repeat: Infinity, 
              repeatType: "reverse" 
            } 
          }}
          className="absolute bottom-1/4 left-[9%] opacity-35 select-none hidden md:block"
          style={{ perspective: "1000px" }}
        >
          <div className="relative w-16 h-16 bg-pink-500/10 backdrop-blur-md rounded-2xl border-[3px] border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.3),inset_0_0_15px_rgba(236,72,153,0.2)] transform-gpu flex flex-col items-center justify-center">
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 border border-slate-950 animate-ping" />
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500/30 animate-pulse" />
          </div>
        </motion.div>

        {/* Floating 3D Heavy Brass Cog Wheel */}
        <motion.div 
          animate={{ y: 20, rotate: 360 }}
          transition={{ 
            y: { 
              type: "spring", 
              stiffness: 6, 
              damping: 5, 
              mass: 14, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }, 
            rotate: { 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear" 
            } 
          }}
          className="absolute bottom-1/3 right-[10%] opacity-35 select-none hidden md:block"
          style={{ perspective: "1000px" }}
        >
          <div className="relative w-16 h-16 rounded-full bg-slate-700 border-[4px] border-slate-800 shadow-[0_8px_0_#1e293b,0_15px_20px_rgba(0,0,0,0.6)] flex items-center justify-center transform-gpu">
            {/* Cog Teeth using rotated notches */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
              <div 
                key={ang} 
                className="absolute w-4 h-4 bg-slate-800 border border-slate-950 top-1/2 left-1/2 -ml-2 -mt-2 rounded-sm"
                style={{ transform: `rotate(${ang}deg) translate(28px)` }}
              />
            ))}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-slate-950 z-10 flex items-center justify-center shadow-inner">
              <div className="w-4 h-4 rounded-full bg-[#07090e] border border-slate-950" />
            </div>
          </div>
        </motion.div>

        {/* DAD WISDOM ROTATING DRIFTING CARDS (BEFORE THE VAULT FINALE CELEBRATION) */}
        {currentStep !== "finale" && (
          <AnimatePresence mode="wait">
            <motion.div
              key={wisdomIndex}
              initial={{ 
                opacity: 0, 
                x: wisdomDir > 0 ? "-340px" : "105vw", 
                y: `${wisdomY}vh`,
                scale: 0.9,
                rotate: wisdomDir > 0 ? -2 : 2
              }}
              animate={{ 
                opacity: [0, 1, 1, 1, 0], 
                x: wisdomDir > 0 ? "105vw" : "-340px",
                y: [
                  `${wisdomY}vh`, 
                  `${wisdomY - 4}vh`, 
                  `${wisdomY + 2}vh`, 
                  `${wisdomY - 3}vh`, 
                  `${wisdomY}vh`
                ],
                scale: 1,
                rotate: wisdomDir > 0 ? [ -2, 1, -1, 2, -1 ] : [ 2, -1, 1, -2, 1 ]
              }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ 
                duration: 13.5, // drift slowly across within the 14s cycle
                ease: "linear",
              }}
              className="absolute z-30 pointer-events-auto cursor-pointer max-w-[280px] sm:max-w-xs md:max-w-sm rounded-[1.8rem] p-5 bg-[#0f1322]/95 border-2 border-amber-500/30 shadow-[0_12px_24px_rgba(0,0,0,0.6),0_0_20px_rgba(212,175,55,0.1)] hover:border-amber-400 select-none transition-colors"
              onClick={() => {
                playSynthSound("click");
                setWisdomIndex(prev => (prev + 1) % PANKAJ_WISDOM.length);
                setWisdomY(Math.floor(Math.random() * 16) + 62);
              }}
              title="Click/tap to read next advice card!"
            >
              {/* Beautiful decorative quote and sparkles */}
              <div className="absolute top-3.5 right-4 flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
                <span className="text-[7.5px] font-mono text-amber-500/60 uppercase font-black tracking-widest">
                  SYS_WISDOM_v1
                </span>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  💡 Pankaj&apos;s Advice
                </span>
                <span className="text-[7.5px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-mono text-xs uppercase font-bold border border-amber-500/20">
                  {PANKAJ_WISDOM[wisdomIndex].category}
                </span>
              </div>

              <div className="relative pl-3 mt-1.5">
                <span className="absolute left-0 top-0 text-xl font-serif text-amber-500/40 select-none font-bold">&ldquo;</span>
                <p className="text-[11px] sm:text-xs text-slate-100 font-serif font-light leading-relaxed italic pr-1">
                  {PANKAJ_WISDOM[wisdomIndex].text}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[7px] font-mono text-slate-500 uppercase">
                <span className="italic text-amber-500/50">
                  {PANKAJ_WISDOM[wisdomIndex].label}
                </span>
                <span className="animate-pulse tracking-tight text-right text-[7px] font-bold text-amber-400/85">
                  Tap card to cycle • Drifting
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* SOLID STATE AUDIO CONTROL CENTER PANEL */}
      <div className="fixed top-6 right-6 z-50 flex items-center space-x-2">
        {/* Toggle Ambient Audio */}
        <button
          onClick={toggleAudio}
          className="cursor-pointer bg-[#141b2d] text-slate-100 border-[3px] border-slate-800 py-2 px-3 rounded-2xl flex items-center space-x-2 transition-all duration-150 hover:bg-[#1c243c] active:translate-y-[2px] shadow-[0_3px_0_#07090e] active:shadow-none focus:outline-none"
          title="Toggle Ambient Audio"
          id="audio-controller-button"
        >
          {/* EQUALIZER */}
          <div className="flex items-end space-x-0.5 h-3 w-4">
            <span className={`w-0.5 bg-amber-400 rounded-full transition-all duration-300 ${isPlaying ? "animate-bounce h-3" : "h-1"}`} style={{ animationDelay: "0.1s" }} />
            <span className={`w-0.5 bg-rose-400 rounded-full transition-all duration-300 ${isPlaying ? "animate-bounce h-2" : "h-1.5"}`} style={{ animationDelay: "0.3s" }} />
            <span className={`w-0.5 bg-sky-400 rounded-full transition-all duration-300 ${isPlaying ? "animate-bounce h-3.5" : "h-1"}`} style={{ animationDelay: "0.5s" }} />
          </div>
          <span className="font-semibold text-[8px] uppercase tracking-wider text-slate-300 hidden sm:inline">
            Ambient Piano
          </span>
          {isPlaying ? <Volume2 className="h-4 w-4 text-amber-400" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
        </button>

        {/* Toggle Sound FX Mute */}
        <button
          onClick={() => {
            playSynthSound("click");
            setIsMuted(!isMuted);
          }}
          className="cursor-pointer bg-[#141b2d] text-slate-100 border-[3px] border-slate-800 py-2 px-3 rounded-2xl flex items-center space-x-2 transition-all duration-150 hover:bg-[#1c243c] active:translate-y-[2px] shadow-[0_3px_0_#07090e] active:shadow-none focus:outline-none"
          title="Toggle Sound Effects"
          id="soundfx-controller-button"
        >
          <span className="font-semibold text-[8px] uppercase tracking-wider text-slate-300 hidden sm:inline">
            Sound FX
          </span>
          <span className="relative flex h-1.5 w-1.5">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${!isMuted ? "animate-ping bg-emerald-400" : "bg-red-400"}`} />
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${!isMuted ? "bg-emerald-500" : "bg-red-500"}`} />
          </span>
          <Smile className={`h-4 w-4 ${!isMuted ? "text-[#d4af37]" : "text-slate-500"}`} />
        </button>

        {audioError && (
          <div className="absolute right-0 top-12 bg-[#182035] p-3 rounded-2xl text-[9px] text-amber-300 tracking-wide w-52 text-right border border-amber-500/30 shadow-2xl animate-pulse">
            Piano track loaded. Tap the tactile audio controller to begin the song!
          </div>
        )}
      </div>

      {/* SINCERE HEADER */}
      <header className="pt-8 px-6 w-full max-w-2xl mx-auto flex flex-col space-y-4 z-10">
        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-slate-400">
          <div className="flex items-center space-x-2">
            <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500/30 animate-pulse" />
            <span className="uppercase font-bold text-slate-300">Infinite Certification Protocol</span>
          </div>
          <div className="flex items-center space-x-1.5 uppercase text-amber-400 font-extrabold bg-[#161d31] border border-amber-500/20 px-3.5 py-1.5 rounded-full shadow-lg">
            <span>{recipientName}&apos;s Edition</span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
        </div>

        {/* Dynamic 3D Neon Workflow Progress Stepper (Only when not in intro) */}
        {currentStep !== "intro" && (
          <div className="w-full bg-[#101422]/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest px-1">
              <span>Authorization Pipeline</span>
              <span className="text-amber-400 font-bold">
                {currentStep === "game_1" && "Step 1/6: Trivia match"}
                {currentStep === "game_2" && "Step 2/6: Pressure relief valve"}
                {currentStep === "game_3" && "Step 3/6: Affection accumulator"}
                {currentStep === "autograph" && "Step 4/6: Verified autograph"}
                {currentStep === "vault" && "Step 6/6: Cryptographic Vault"}
                {currentStep === "finale" && "Vault unlocked! legacy active"}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2.5">
              {[
                { label: "Trivia", steps: ["game_1"] },
                { label: "Pressure", steps: ["game_2"] },
                { label: "Love core", steps: ["game_3"] },
                { label: "Signature", steps: ["autograph"] },
                { label: "Vault", steps: ["vault", "finale"] },
              ].map((st, i) => {
                const isActive = st.steps.includes(currentStep);
                const isPassed = (() => {
                  const stepOrder = ["game_1", "game_2", "game_3", "autograph", "vault", "finale"];
                  const currentIdx = stepOrder.indexOf(currentStep);
                  const firstStepIdx = stepOrder.indexOf(st.steps[0]);
                  return currentIdx > firstStepIdx;
                })();

                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                      isActive 
                        ? "bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" 
                        : isPassed 
                        ? "bg-emerald-500" 
                        : "bg-slate-800"
                    }`} />
                    <span className={`text-[7px] mt-1 font-mono uppercase tracking-wider text-center ${isActive ? "text-amber-400 font-bold" : isPassed ? "text-emerald-500 font-bold" : "text-slate-600"}`}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* TOYBOX CONTAINER GATEWAY */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 flex flex-col justify-center items-center z-10 py-6">
        <AnimatePresence mode="wait">
          
          {/* ==================== PAGE 1: REVEAL INTRO CARD ==================== */}
          {currentStep === "intro" && (
            <motion.div
              key="intro-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 18 }}
              className="text-center space-y-8 max-w-xl mx-auto py-8"
            >
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 px-5  py-2 rounded-full shadow-[0_4px_12px_rgba(212,175,55,0.15)]">
                <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />
                <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase font-extrabold">A Father&apos;s Day 3D Chest</span>
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              </div>

               {/* Title layout */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-serif text-slate-100 tracking-tight leading-tight font-medium">
                  Welcome, <span className="text-amber-400 font-serif font-semibold">{recipientName}</span>! <br />
                  Let&apos;s Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 font-serif italic">3D Surprise</span>.
                </h1>

                <p className="text-xs md:text-sm text-slate-400 font-light max-w-md mx-auto leading-relaxed">
                  Hi {recipientName}! I built this highly-tuned interactive chest of memory trials, stress-relief pressure valves, and custom certifications to celebrate you. Please put on the ambient piano tracker, customize your settings below, and hit start!
                </p>
              </div>

              {/* ELEGANT SECONDARY MILESTONE: PANKAJ BIRTHDAY COUNTDOWN */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#121624] border-2 border-dashed border-amber-500/25 p-4 rounded-2xl max-w-md mx-auto text-left flex items-center justify-between space-x-4 relative overflow-hidden shadow-lg group hover:border-amber-400/40 transition-colors"
              >
                <div className="absolute -right-8 -bottom-8 opacity-[0.03] text-amber-400 group-hover:scale-110 transition-transform pointer-events-none">
                  <Calendar className="h-24 w-24" />
                </div>
                
                <div className="flex items-center space-x-3.5">
                  <div className="p-3 bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-400/30 rounded-xl text-amber-300">
                    <Calendar className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                      ⏳ Secondary Celebration Milestone
                    </span>
                    <h3 className="text-sm font-serif font-bold text-slate-200">
                      Pankaj&apos;s Birthday Countdown
                    </h3>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                      Celebrating the master on Dec 31st
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 border-l border-slate-800/80 pl-4">
                  <div className="flex items-baseline justify-end space-x-0.5">
                    <span className="text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 animate-pulse">
                      {daysToPankajBirthday}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">days</span>
                  </div>
                  <span className="text-[8px] font-mono text-amber-300/80 uppercase tracking-widest block font-bold">
                    remaining
                  </span>
                </div>
              </motion.div>

              {/* INTERACTIVE PERSONALIZATION STATION */}
              <div className="bg-[#121624] border-2 border-slate-800 p-6 rounded-[2.2rem] text-left space-y-4 max-w-md mx-auto shadow-inner relative overflow-hidden">
                <div className="absolute top-2 right-3 text-[6px] font-mono text-[#ec4899]/50 tracking-widest uppercase">CONFIG_STATION_V3</div>
                <div className="flex items-center space-x-2 text-slate-300 font-mono text-[9px] font-bold uppercase tracking-widest mb-1 border-b border-slate-800 pb-2">
                  <Wrench className="h-4 w-4 text-[#d4af37]" />
                  <span>Personalize Your Chest</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">Recipient Name</label>
                    <input 
                      type="text" 
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value || "Dad")}
                      placeholder="e.g. Dad, Papa"
                      className="w-full bg-[#07090e] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">Your Name</label>
                    <input 
                      type="text" 
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value || "Me")}
                      placeholder="Your name"
                      className="w-full bg-[#07090e] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-sky-300 font-bold focus:outline-none focus:border-sky-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">Official Award Title</label>
                  <select 
                    value={customGiftTitle}
                    onChange={(e) => setCustomGiftTitle(e.target.value)}
                    className="w-full bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
                  >
                    <option value="World\'s #1 Champion">🏆 World&apos;s #1 Champion</option>
                    <option value="Uncompromising Pillar of Integrity">⚖️ Uncompromising Pillar of Integrity</option>
                    <option value="The Master Storyteller & Joke Expert">🍿 Master Storyteller &amp; Joke Expert</option>
                    <option value="Anchored Protector & Counselor">⚓ Anchored Protector &amp; Counselor</option>
                    <option value="The Legend, The Myth, The Father">👑 The Legend, The Myth, The Father</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">Core Superpower Accent</label>
                  <select 
                    value={favoriteSuperpower}
                    onChange={(e) => setFavoriteSuperpower(e.target.value)}
                    className="w-full bg-[#07090e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
                  >
                    <option value="Unshakeable Wisdom">💡 Unshakeable Wisdom &amp; Guidance</option>
                    <option value="Legendary Perfect Dad Jokes">🍩 Legendary Perfect Dad Jokes</option>
                    <option value="Grill King Cook-out Mastery">🥩 Grill King Cook-out Mastery</option>
                    <option value="Infinite Calm and Resilience">🦁 Infinite Calm &amp; Resilience</option>
                    <option value="The Warmest Virtual Giant Hugs">🧸 Warmest Virtual Giant Hugs</option>
                  </select>
                </div>
              </div>

              {/* Action pushable 3D start button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    startMusic();
                    triggerStepChange("finale");
                    setTimeout(() => {
                      fireHeartConfetti();
                    }, 500);
                  }}
                  className="cursor-pointer bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-[#07090e] font-sans font-extrabold uppercase tracking-widest text-xs px-10 py-5 rounded-[2rem] border-[4px] border-slate-900 shadow-[0_10px_0_#07090e] hover:shadow-[0_10px_0_#07090e] active:translate-y-[10px] active:shadow-none transition-all duration-150 flex items-center space-x-3 mx-auto"
                  id="start-gift-button"
                >
                  <Gift className="h-5 w-5 text-[#07090e] fill-[#07090e]/20" />
                  <span>Launch {recipientName}&apos;s Box 🎁</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ==================== GRAND FINALE: THE 3D POLAROID PRINT LETTERS ==================== */}
          {currentStep === "finale" && (
            <motion.div
              key="finale-screen"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-full max-w-2xl text-center space-y-8 my-4"
            >
              {/* BEAUTIFUL DESIGNER 3D BOOKLET/GIFT-BOX ENVELOPE */}
              <div className="relative bg-[#fdfbf6] border-[6px] border-slate-900 p-6 md:p-11 rounded-[3rem] shadow-[20px_20px_0px_#07090e] overflow-hidden space-y-8 bg-[radial-gradient(#faf1e3_1.5px,transparent_1.5px)] [background-size:24px_24px] ring-8 ring-[#141b2d] text-[#07090e]">
                
                {/* Neobrutalist corner highlights */}
                <div className="absolute top-4 left-4 h-10 w-10 border-t-4 border-l-4 border-slate-900" />
                <div className="absolute top-4 right-4 h-10 w-10 border-t-4 border-r-4 border-slate-900" />
                <div className="absolute bottom-4 left-4 h-10 w-10 border-b-4 border-l-4 border-slate-900" />
                <div className="absolute bottom-4 right-4 h-10 w-10 border-b-4 border-r-4 border-slate-900" />

                {/* DAD CHAMPION SPECTACLES & GOLD CORONATION LOGO */}
                <div className="flex justify-center items-center space-x-3 pt-2">
                  <Crown className="h-6 w-6 text-amber-500 animate-bounce fill-amber-300" />
                  <span className="text-lg font-serif tracking-widest text-slate-900 font-extrabold block">#1 CHAMPION FATHER</span>
                  <Crown className="h-6 w-6 text-amber-500 animate-pulse fill-amber-300" />
                </div>

                {/* INTERACTIVE SWIPEABLE FAMILY POLAROID MEMOIRS CAROUSEL */}
                <div className="mx-auto max-w-sm md:max-w-md">
                  <PolaroidCarousel onPhotoChange={() => playSynthSound("click")} />
                </div>

                {/* Greet text */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#ec4899] block font-extrabold uppercase">
                    Official {customGiftTitle} Medal
                  </span>
                  <h2 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 font-medium tracking-tight leading-tight">
                    Happy Father&apos;s Day, {recipientName}!
                  </h2>
                </div>

                {/* Child handwritten letter section */}
                <div className="space-y-6 max-w-xl mx-auto px-2">
                  <p className="text-2xl md:text-3xl font-serif text-slate-900 font-light italic leading-relaxed">
                    &ldquo;Thank you, {recipientName}, for everything you have built in us. You are our absolute bedrock, our shelter, and our champion.&rdquo;
                  </p>
                  
                  <div className="w-28 h-[3px] bg-slate-900 mx-auto" />
                  
                  <p className="text-sm md:text-base text-slate-700 font-light tracking-wide leading-relaxed font-sans text-justify md:text-center">
                    Your key highlight, <span className="font-bold text-amber-700">{favoriteSuperpower}</span>, is the ultimate inspiration of how to build a legacy of integrity. No amount of words can ever fully express how incredibly grateful we are to have you guide our path. With all our love and appreciation, {senderName}!
                  </p>
                </div>

                {/* ========================================================== */}
                {/* ADVANCED ATMOSPHERIC STATUS INDICATION BOARD */}
                {/* ========================================================== */}
                <div className="bg-[#fcfaf4] rounded-3xl p-5 border-3 border-slate-900 shadow-[6px_6px_0px_#07090e] max-w-lg mx-auto space-y-4 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-400 text-slate-1050 px-3 py-1 text-[8px] font-mono font-bold uppercase tracking-widest border-l-2 border-b-2 border-slate-900 rounded-bl-xl">
                    Live Telemetry
                  </div>

                  {/* Widget title */}
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 bg-slate-950 text-amber-300 rounded-lg flex items-center justify-center">
                      <Thermometer className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-serif font-extrabold text-slate-900 uppercase tracking-wider">
                        🌞 Atmospheric Weather Status
                      </h4>
                      <p className="text-[9px] text-slate-500 font-mono">
                        Checking optimal wisdom-sharing &amp; storytelling conditions
                      </p>
                    </div>
                  </div>

                  {/* Core display board */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 bg-white border-2 border-slate-900 rounded-2xl p-4 relative">
                    
                    {/* Visual icon and Temp column */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-3 text-center">
                      {isWeatherLoading ? (
                        <div className="h-10 w-10 border-3 border-slate-800 border-t-amber-400 rounded-full animate-spin my-2" />
                      ) : (
                        <motion.div
                          animate={{ rotate: weatherIconName === "sun" ? 360 : [0, -10, 10, 0] }}
                          transition={
                            weatherIconName === "sun" 
                              ? { duration: 15, repeat: Infinity, ease: "linear" }
                              : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                          }
                          className="text-amber-500 hover:scale-110 transition-transform duration-200 cursor-help"
                        >
                          {weatherIconName === "sun" && <Sun className="h-10 w-10 fill-amber-200 text-amber-500" />}
                          {weatherIconName === "cloud" && <Cloud className="h-10 w-10 text-slate-400 fill-slate-100" />}
                          {weatherIconName === "rain" && <CloudRain className="h-10 w-10 text-sky-500" />}
                          {weatherIconName === "snow" && <CloudSnow className="h-10 w-10 text-sky-300" />}
                          {weatherIconName === "cloudSun" && <CloudSun className="h-10 w-10 text-amber-500" />}
                        </motion.div>
                      )}
                      
                      <div className="mt-1">
                        <span className="text-3xl font-mono font-extrabold text-slate-900">
                          {weatherTemp}°C
                        </span>
                        <span className="block text-[8px] font-mono text-slate-500 font-bold uppercase tracking-tight mt-0.5">
                          {weatherCondition}
                        </span>
                      </div>
                    </div>

                    {/* Sensor parameters */}
                    <div className="md:col-span-8 space-y-2 flex flex-col justify-between">
                      {/* Live location readout */}
                      <div className="flex items-center justify-between text-[11px] font-mono border-b border-dashed border-slate-100 pb-1.5">
                        <span className="font-bold text-slate-900 truncate max-w-[150px]" title={weatherCity}>
                          📍 {weatherCity}
                        </span>
                        <button
                          type="button"
                          onClick={() => fetchWeatherByIP()}
                          className="cursor-pointer text-[8px] font-bold text-slate-500 hover:text-amber-600 uppercase flex items-center space-x-1 border border-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-50 active:scale-95 transition-all"
                          title="Auto-detect target weather"
                        >
                          <RefreshCw className={`h-2 w-2 ${isWeatherLoading ? 'animate-spin' : ''}`} />
                          <span>Auto</span>
                        </button>
                      </div>

                      {/* Detail metrics list */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600">
                        <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200 flex items-center space-x-2">
                          <Droplets className="h-3.5 w-3.5 text-blue-500" />
                          <div className="leading-none">
                            <span className="block text-[7px] text-slate-400 font-bold uppercase">Humidity</span>
                            <span className="font-bold text-slate-800">{weatherHumidity}%</span>
                          </div>
                        </div>

                        <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-200 flex items-center space-x-2">
                          <Wind className="h-3.5 w-3.5 text-teal-500" />
                          <div className="leading-none">
                            <span className="block text-[7px] text-slate-400 font-bold uppercase">Wind</span>
                            <span className="font-bold text-slate-800">{weatherWind} km/h</span>
                          </div>
                        </div>
                      </div>

                      {/* Cozy custom sentiment message */}
                      <div className="bg-amber-50 text-amber-900 p-2 rounded-xl border border-amber-200/50 text-[10px] font-serif italic leading-relaxed text-center font-medium">
                        &ldquo;{weatherFeelingNote}&rdquo;
                      </div>
                    </div>
                  </div>

                  {/* Manual Location Search Control */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      fetchWeatherByCityName(weatherSearchQuery);
                    }}
                    className="flex space-x-2 items-center"
                  >
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={weatherSearchQuery}
                        onChange={(e) => setWeatherSearchQuery(e.target.value)}
                        placeholder="Search another city..."
                        className="w-full bg-white border-2 border-slate-900 text-slate-900 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isWeatherLoading}
                      className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800 text-xs font-mono font-bold px-3 py-2 rounded-xl border-2 border-slate-900 active:scale-95 transition-all shadow-[2px_2px_0px_#000] disabled:opacity-50"
                    >
                      Search
                    </button>
                  </form>

                  {/* Error notifications */}
                  {weatherError && (
                    <p className="text-[9px] font-mono text-rose-500 text-center font-bold">
                      ⚠️ {weatherError}
                    </p>
                  )}
                </div>

                <div className="w-28 h-[2px] bg-slate-200 mx-auto" />

                {/* THE EMBEDDED AUTOGRAPH DECAL */}
                {savedSignature ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-xs mx-auto border-3 border-dashed border-amber-500 p-4 rounded-3xl bg-amber-500/5 text-center space-y-2 relative"
                  >
                    <span className="block text-[8px] font-mono font-black text-amber-600 uppercase tracking-widest">
                      Certified Signature
                    </span>
                    <div className="relative bg-[#ffffff] h-20 w-full rounded-xl border-2 border-slate-900 overflow-hidden flex items-center justify-center shadow-inner p-1">
                      <SignatureReveal src={savedSignature} />
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center font-serif italic text-slate-400 text-xs">
                    Committed by Dad with love.
                  </div>
                )}

                {/* ========================================================== */}
                {/* THE GOLDEN VIRTUAL HEARTFELT MESSAGE WALL */}
                {/* ========================================================== */}
                <div className="bg-[#121622] rounded-3xl p-5 md:p-8 border-3 border-slate-900 shadow-[8px_8px_0px_#07090e] space-y-6 text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300" />
                  
                  {/* Header */}
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white">✍️ Dad&apos;s Golden Message Wall</h3>
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                        Leave floating heartfelt notes on the board
                      </p>
                    </div>
                  </div>

                  {/* Display Container with floating post-it cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative pt-1">
                    {heartfeltNotes.length === 0 ? (
                      <div className="col-span-full border-2 border-dashed border-slate-700/60 rounded-2xl py-10 px-4 text-center text-slate-400 text-xs italic font-serif bg-slate-950/20">
                        The wall is empty! Write a sweet note to pop onto the bulletin board below. 👇
                      </div>
                    ) : (
                      <AnimatePresence>
                        {heartfeltNotes.map((note) => {
                          let bgClass = "bg-gradient-to-br from-amber-200 to-amber-100 text-slate-900";
                          let shadowClass = "shadow-[4px_4px_12px_rgba(245,158,11,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]";

                          if (note.color === "gold") {
                            bgClass = "bg-gradient-to-br from-yellow-300 to-yellow-100 text-slate-900";
                            shadowClass = "shadow-[4px_4px_12px_rgba(251,191,36,0.25),inset_0_1px_0_rgba(255,255,255,0.4)]";
                          } else if (note.color === "orange") {
                            bgClass = "bg-gradient-to-br from-orange-200 to-orange-100 text-slate-900";
                            shadowClass = "shadow-[4px_4px_12px_rgba(249,115,22,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]";
                          }

                          return (
                            <motion.div
                              key={note.id}
                              initial={{ scale: 0.8, opacity: 0, y: 20 }}
                              animate={{ 
                                scale: 1, 
                                opacity: 1, 
                                y: 0,
                                rotate: note.rotation 
                              }}
                              exit={{ scale: 0.8, opacity: 0, y: -20 }}
                              whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                              transition={{ type: "spring", stiffness: 150, damping: 15 }}
                              className={`rounded-2xl p-5 relative border-2 border-slate-950 flex flex-col justify-between min-h-[140px] transform transition-shadow duration-200 hover:shadow-xl ${bgClass} ${shadowClass} group`}
                            >
                              {/* Pin visual effect */}
                              <div className="absolute -top-2 left-1/2 -ml-6 w-12 h-4.5 rounded bg-white/40 border-b border-white/50 shadow-sm backdrop-blur-[1px] transform -rotate-2 flex items-center justify-center">
                                <Pin className="h-3 w-3 text-slate-750 transform rotate-45" />
                              </div>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteNote(note.id)}
                                className="cursor-pointer absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 hover:bg-black/5 rounded"
                                title="Remove note"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>

                              {/* Note Text */}
                              <div className="space-y-3 pt-2">
                                <p className="text-xs leading-relaxed font-serif font-medium italic text-slate-800 break-words">
                                  &ldquo;{note.text}&rdquo;
                                </p>
                              </div>

                              {/* Note Footer */}
                              <div className="pt-4 flex items-center justify-between border-t border-slate-950/10 mt-auto text-[9px] font-mono text-slate-600">
                                <span className="font-bold flex items-center space-x-0.5">
                                  <Heart className="h-2.5 w-2.5 text-rose-500 fill-rose-500 mr-0.5" />
                                  <span>{note.sender}</span>
                                </span>
                                <span>{note.createdAt}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Form to stick a new note onto the board */}
                  <form onSubmit={handleAddNote} className="bg-slate-950/40 p-4.5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center space-x-1">
                      <Plus className="h-3.5 w-3.5 text-amber-400" />
                      <span>Add custom letter note</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Sender input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">From</label>
                        <input
                          type="text"
                          value={newNoteSender}
                          onChange={(e) => setNewNoteSender(e.target.value)}
                          placeholder={senderName || "Aditya & Samridh"}
                          className="w-full bg-[#121622] border-2 border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>

                      {/* Note text input */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold font-sans">Heartfelt Note</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            required
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            placeholder="Type dad-lore or thanks... ❤️"
                            maxLength={140}
                            className="flex-1 bg-[#121622] border-2 border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                          />
                          
                          <button
                            type="submit"
                            className="cursor-pointer bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-110 text-slate-950 focus:outline-none p-2.5 rounded-xl transition-all duration-150 active:scale-95 flex items-center justify-center shrink-0 w-11 border border-slate-950 shadow-sm"
                            title="Stick to Wall!"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Styling panel controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-805/40">
                      <div className="flex items-center space-x-3">
                        <span>Sticky Note Color:</span>
                        <div className="flex space-x-1.5">
                          {[
                            { value: "amber", name: "Amber", bg: "bg-amber-300" },
                            { value: "gold", name: "Gold", bg: "bg-yellow-300" },
                            { value: "orange", name: "Orange", bg: "bg-orange-300" }
                          ].map((theme) => (
                            <button
                              key={theme.value}
                              type="button"
                              onClick={() => setNewNoteColor(theme.value)}
                              className={`cursor-pointer px-2 py-0.5 rounded border text-[9px] transition-all flex items-center space-x-1 ${
                                newNoteColor === theme.value
                                  ? "border-amber-400 text-white font-extrabold bg-slate-800"
                                  : "border-slate-800 text-slate-400 hover:border-slate-700 bg-slate-900"
                              }`}
                            >
                              <div className={`w-2.5 h-2.5 rounded-full ${theme.bg}`} />
                              <span>{theme.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="text-[9px] text-slate-500 italic">
                        Sticks on board with interactive 3D rotation! ✨
                      </div>
                    </div>
                  </form>
                </div>

                {/* Score specs badge */}
                <div className="grid grid-cols-2 gap-4 bg-[#f8f6f0] border-3 border-slate-900 p-4 rounded-2xl font-mono text-[9px] text-slate-800 uppercase tracking-wider max-w-xs mx-auto">
                  <div className="text-left border-r-2 border-slate-900 pr-2 space-y-1">
                    <span className="text-slate-400 block text-[8px] font-bold">RELATIONSHIP COMPASS</span>
                    <span className="text-slate-900 font-extrabold flex items-center space-x-1">
                      <HeartHandshake className="h-3.5 w-3.5 text-pink-500 fill-pink-500/30" />
                      <span>DAD &amp; ME UNIFIED</span>
                    </span>
                  </div>
                  <div className="text-left pl-3 space-y-1">
                    <span className="text-slate-400 block text-[8px] font-bold">STABILITY INDEX</span>
                    <span className="text-emerald-600 font-extrabold flex items-center space-x-1">
                      <Smile className="h-3.5 w-3.5 text-emerald-500" />
                      <span>100% EXCELLENCE</span>
                    </span>
                  </div>
                </div>

                {/* Tac-buttons for star shower and play reset */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={fireUltimateConfetti}
                    className="cursor-pointer bg-[#d4af37] text-slate-950 hover:brightness-110 font-sans font-black uppercase tracking-wider text-xs px-8 py-4.5 rounded-full border-[3px] border-slate-900 shadow-[0_6px_0_#07090e] active:translate-y-[6px] active:shadow-none transition-all duration-150 flex items-center space-x-2"
                    id="celebrate-shower-stars-button"
                  >
                    <Sparkles className="h-4.5 w-4.5 text-slate-950" />
                    <span>Shower Gold Stars ✨</span>
                  </button>

                  <button
                    onClick={() => {
                      playSynthSound("click");
                      window.print();
                    }}
                    className="cursor-pointer bg-slate-950 text-amber-300 hover:bg-slate-900 font-sans font-black uppercase tracking-wider text-xs px-8 py-4.5 rounded-full border-[3px] border-slate-900 shadow-[0_6px_0_#07090e] active:translate-y-[6px] active:shadow-none transition-all duration-150 flex items-center space-x-2"
                    id="celebrate-print-tribute-button"
                  >
                    <Printer className="h-4.5 w-4.5 text-amber-400" />
                    <span>Print Tribute 🖨️</span>
                  </button>

                  <button
                    onClick={handleResetApp}
                    className="cursor-pointer bg-white text-slate-800 font-sans font-black uppercase tracking-wider text-xs px-8 py-4.5 rounded-full border-[3px] border-slate-900 shadow-[0_6px_0_#07090e] active:translate-y-[6px] active:shadow-none transition-all duration-150 flex items-center space-x-2 hover:bg-slate-50"
                    id="celebrate-restart-button"
                  >
                    <RotateCcw className="h-4 w-4 text-slate-800" />
                    <span>Replay App 🎮</span>
                  </button>
                </div>

                {/* PRINT TRIBUTE REGION (HIDDEN ON SCREEN, CONFIGURED SPECIFICALLY FOR HEAVY CONTRAST PAPER PRINTING) */}
                <div id="print-tribute-area" className="hidden print:block text-left">
                  <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                      body * {
                        visibility: hidden !important;
                      }
                      #print-tribute-area, #print-tribute-area * {
                        visibility: visible !important;
                      }
                      #print-tribute-area {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        background: #ffffff !important;
                        color: #07090e !important;
                        margin: 0 !important;
                        padding: 20px !important;
                        box-sizing: border-box !important;
                        font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                      .page-break {
                        page-break-after: always !important;
                        break-after: page !important;
                      }
                      .print-no-shadow {
                        box-shadow: none !important;
                        text-shadow: none !important;
                      }
                    }
                  `}} />
                  
                  <div className="flex justify-center mt-4">
                    <QRCodeSVG value={klinkLink} size={128} />
                  </div>

                  {/* CERTIFICATE PAGE */}
                  <div className="page-break bg-white text-slate-900 p-8 md:p-12 rounded-[2rem] border-[12px] border-double border-slate-900 relative min-h-[95vh] flex flex-col justify-between my-4 print-no-shadow">
                    
                    {/* Retro corner accents */}
                    <div className="absolute top-4 left-4 h-10 w-10 border-t-4 border-l-4 border-slate-900" />
                    <div className="absolute top-4 right-4 h-10 w-10 border-t-4 border-r-4 border-slate-900" />
                    <div className="absolute bottom-4 left-4 h-10 w-10 border-b-4 border-l-4 border-slate-900" />
                    <div className="absolute bottom-4 right-4 h-10 w-10 border-b-4 border-r-4 border-slate-900" />

                    <div className="space-y-6 my-auto pt-6 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-16 h-16 rounded-full bg-amber-100 border-4 border-amber-600 flex items-center justify-center">
                          <Award className="h-8 w-8 text-amber-600" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                          Official Conferred Honor
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h1 className="text-4xl font-serif font-black tracking-tight text-slate-900 uppercase">
                          Certificate of Champion Fatherhood
                        </h1>
                        <div className="w-32 h-[3px] bg-amber-500 mx-auto" />
                      </div>

                      <p className="text-[10px] font-mono tracking-[0.2em] text-slate-400 uppercase font-black">
                        THIS PRESTIGIOUS TITLE IS SOLEMNLY GRANTED TO
                      </p>

                      <h2 className="text-5xl font-serif font-black text-slate-900 tracking-tight py-4 leading-none uppercase">
                        {recipientName || "Pankaj"}
                      </h2>

                      <p className="max-w-xl mx-auto text-sm text-slate-700 leading-relaxed font-serif italic text-center">
                        &ldquo;For serving as our absolute bedrock, guiding our path with infinite integrity, keeping the family resilient during storms, and demonstrating the champion superpower of <strong className="text-slate-950 underline decoration-amber-500 decoration-4 underline-offset-4">{favoriteSuperpower || "Unshakeable Wisdom & Guidance"}</strong>.&rdquo;
                      </p>

                      <div className="max-w-lg mx-auto bg-slate-50 p-6 rounded-2xl border-2 border-slate-300 space-y-3 text-left">
                        <h4 className="text-[10px] font-mono tracking-wider uppercase text-slate-500 font-extrabold flex items-center space-x-1.5">
                          <span>📜 Proclamation &amp; Legacy Mandate:</span>
                        </h4>
                        <p className="text-xs text-slate-700 leading-relaxed font-sans text-justify">
                          We hereby declare {recipientName || "Pankaj"} to be #1 Champion Father. Thank you for everything you have built in us. You are our shelter, our provider, and our hero. Your key highlight, {favoriteSuperpower}, is the ultimate inspiration of how to build a legacy of integrity. Verified with 100% excellence.
                        </p>
                      </div>
                    </div>

                    {/* Footer alignment */}
                    <div className="mt-12 pt-6 border-t-2 border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-lg mx-auto w-full">
                      <div className="text-center space-y-1">
                        <span className="block text-[8px] font-mono text-slate-400 uppercase font-extrabold">Conferred By</span>
                        <span className="block text-sm font-serif font-bold text-slate-800 italic uppercase">
                          {senderName || "Aditya & Samridh"}
                        </span>
                        <div className="w-20 h-[2px] bg-slate-300 mx-auto" />
                      </div>

                      {savedSignature ? (
                        <div className="text-center space-y-1">
                          <span className="block text-[8px] font-mono text-slate-400 uppercase font-extrabold">Certified Autograph</span>
                          <div className="h-14 w-40 bg-white border-2 border-slate-900 p-1 rounded-lg flex items-center justify-center">
                            <img 
                              src={savedSignature} 
                              alt="Verified Signature Print" 
                              className="max-h-full max-w-full object-contain filter brightness-90 contrast-125 select-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <span className="block text-[8px] font-mono text-slate-400 uppercase font-extrabold">Signature Status</span>
                          <span className="text-[10px] font-serif italic text-slate-500 font-bold block pt-2 uppercase">
                            🔑 LOCKED BY VAULT SYSTEM
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MESSAGE WALL PAGE */}
                  <div className="bg-white text-slate-900 p-8 md:p-12 rounded-[2rem] border-[6px] border-slate-900 relative min-h-[95vh]">
                    <div className="absolute top-4 left-4 h-8 w-8 border-t-2 border-l-2 border-slate-800" />
                    <div className="absolute top-4 right-4 h-8 w-8 border-t-2 border-r-2 border-slate-850" />

                    <div className="text-center space-y-2 mb-8">
                      <div className="flex items-center justify-center space-x-2">
                        <MessageSquare className="h-6 w-6 text-amber-600" />
                        <h2 className="text-3xl font-serif font-black tracking-tight text-slate-900 uppercase">
                          Dad&apos;s Golden Message Wall
                        </h2>
                      </div>
                      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest max-w-md mx-auto">
                        Personal sentiments and notes left for {recipientName || "Pankaj"}
                      </p>
                      <div className="w-28 h-1 bg-amber-500 mx-auto mt-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4">
                      {heartfeltNotes.length === 0 ? (
                        <div className="col-span-full border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center italic font-serif text-slate-400 text-sm">
                          The message wall is empty. No custom notes were posted.
                        </div>
                      ) : (
                        heartfeltNotes.map((note, idx) => (
                          <div 
                            key={note.id} 
                            className="border-2 border-slate-900 p-5 rounded-2xl bg-[#fffdf0] text-slate-900 flex flex-col justify-between min-h-[140px] shadow-none relative print:break-inside-avoid"
                          >
                            <span className="absolute top-2.5 right-3 text-[7.5px] font-mono font-bold tracking-widest text-[#d4af37] uppercase">
                              Note #{idx + 1}
                            </span>

                            <div className="relative pl-3 space-y-2 mt-2">
                              <span className="absolute left-0 top-0 text-lg font-serif text-amber-600/40 font-bold">&ldquo;</span>
                              <p className="text-xs leading-relaxed font-serif italic text-slate-800 pr-1">
                                {note.text || ""}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[8px] font-mono text-slate-500">
                              <span className="font-bold flex items-center">
                                ❤️ {note.sender}
                              </span>
                              <span>{note.createdAt}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-200 text-center">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                        ❤️ CONFERRED WITH ETERNAL GRATITUDE • DESIGNED PROJECTS INC © 2026
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* COMPACT FOOTER */}
      <footer className="mt-8 text-center text-[10px] font-mono text-slate-500 select-none z-10 space-y-1">
        <div className="max-w-md mx-auto flex items-center justify-center space-x-2 opacity-80 font-bold uppercase tracking-widest text-[#d4af37]/80">
          <span>COMPUTED WITH ETERNAL GRATITUDE</span>
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          <span>FATHER_LEGACY_ONLINE</span>
        </div>
        <p className="text-[9px] text-slate-500/70">Designed and built with infinite pride and appreciation.</p>
      </footer>

    </div>
  );
}
