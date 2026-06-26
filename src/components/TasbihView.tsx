import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Volume2, VolumeX, Flame, Heart, Sparkles, BookOpen } from "lucide-react";

export default function TasbihView() {
  const [count, setCount] = useState<number>(0);
  const [totalSession, setTotalSession] = useState<number>(0);
  const [target, setTarget] = useState<number>(33); // 33, 100, or custom
  const [activePhrase, setActivePhrase] = useState<string>("سُبْحَانَ اللَّهِ");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isRippling, setIsRippling] = useState<boolean>(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("total_tasbih");
    if (savedSession) {
      setTotalSession(parseInt(savedSession, 10));
    }
  }, []);

  // Web Audio Synthesizer to make realistic satisfying haptic click sounds & chimes instantly
  const playClickSound = (isMilestone: boolean) => {
    if (!soundEnabled || localStorage.getItem("silent_mode") === "true") return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (isMilestone) {
        // High-end pleasant chime/gong sound for finishing a set
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.65);
      } else {
        // Highly realistic tactile wooden/metallic click tick
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
        
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch (e) {
      console.warn("Audio Context init blocked or failed: ", e);
    }
  };

  const handleIncrement = () => {
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 200);

    const nextCount = count + 1;
    let milestone = false;

    if (nextCount === target) {
      milestone = true;
      playClickSound(true);
      setCount(0); // auto reset on target achievement
    } else {
      playClickSound(false);
      setCount(nextCount);
    }

    // Update total session statistics
    const newTotal = totalSession + 1;
    setTotalSession(newTotal);
    localStorage.setItem("total_tasbih", newTotal.toString());

    // HTML5 Haptic feedback if supported by standard mobile engines
    if (navigator.vibrate) {
      navigator.vibrate(milestone ? [60, 40, 60] : 15);
    }
  };

  const handleReset = () => {
    setCount(0);
    playClickSound(true);
  };

  const handleClearTotal = () => {
    setTotalSession(0);
    localStorage.setItem("total_tasbih", "0");
  };

  const phrasesList = [
    "سُبْحَانَ اللَّهِ",
    "الْحَمْدُ لِلَّهِ",
    "اللَّهُ أَكْبَرُ",
    "لاَ إِلَهَ إِلاَّ اللهُ",
    "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ",
    "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    "لا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ"
  ];

  return (
    <div className="flex flex-col items-center justify-between h-full bg-gradient-to-b from-[#0a2335] via-[#071b29] to-[#04111a] text-white p-6 font-sans select-none">
      
      {/* Top Config Area */}
      <div className="w-full max-w-md bg-[#0a2e47]/40 backdrop-blur-md rounded-2xl border border-[#cca05a]/20 p-4 space-y-4">
        {/* Title & sound selection */}
        <div className="flex justify-between items-center bg-[#073957]/50 p-2 rounded-xl">
          <div className="flex items-center space-x-2 space-x-reverse text-[#cca05a]">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-sm">المسبحة الإلكترونية الإلكترونية الذكية</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition ${
              soundEnabled ? "bg-[#cca05a]/20 text-yellow-300" : "bg-red-950/20 text-red-400"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Selected phrase carousell */}
        <div className="space-y-1">
          <label className="text-xs text-amber-200/60 block text-right font-medium">اختر الذِكْر الحالي:</label>
          <div className="flex overflow-x-auto gap-2 py-1 scrollbar-none scroll-smooth items-center direction-rtl">
            {phrasesList.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActivePhrase(phrase);
                  setCount(0);
                }}
                className={`flex-none text-xs px-3 py-1.5 rounded-full border transition-all ${
                  activePhrase === phrase
                    ? "bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 font-bold border-transparent shadow-lg scale-105"
                    : "bg-[#0b283d] text-amber-100/80 border-[#cca05a]/10 hover:border-[#cca05a]/30"
                }`}
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Goals selector */}
        <div className="flex justify-between items-center text-xs bg-[#061e2f]/40 p-2 rounded-xl border border-white/5">
          <span className="text-amber-200/50">الهدف الحالي:</span>
          <div className="flex gap-1.5">
            {[33, 99, 100, 1000].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTarget(t);
                  setCount(0);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  target === t
                    ? "bg-[#cca05a] text-slate-900 font-bold"
                    : "bg-[#09263a] text-white/70"
                }`}
              >
                {t === 1000 ? "مفتوح" : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Counter Bead */}
      <div className="flex flex-col items-center justify-center py-6 w-full max-w-xs relative">
        {/* Total counts badges */}
        <div className="absolute top-0 flex gap-2 w-full justify-between items-center text-xs border-b border-white/5 pb-2">
          <div className="flex items-center space-x-1 space-x-reverse text-amber-200">
            <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
            <span>مجموع التسبيحات اليوم:</span>
            <span className="font-mono font-bold text-lg text-white ml-1">{totalSession}</span>
          </div>
          <button
            onClick={handleClearTotal}
            className="text-[10px] text-red-300 hover:text-red-400 opacity-60 hover:opacity-100 transition"
          >
            تصفير المجموع
          </button>
        </div>

        {/* Main tapping ring */}
        <motion.button
          onClick={handleIncrement}
          whileTap={{ scale: 0.94 }}
          className="relative mt-8 w-60 h-60 rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-[#123e5c] via-[#092c42] to-[#041624] border-4 border-[#cca05a] shadow-[0_0_40px_rgba(204,160,90,0.25)] hover:shadow-[0_0_50px_rgba(204,160,90,0.4)] transition-all cursor-pointer overflow-hidden group outline-none"
        >
          {/* Ripple animation on click */}
          {isRippling && (
            <span className="absolute inset-0 bg-amber-400/10 rounded-full animate-ping pointer-events-none" />
          )}

          {/* Decorative glowing backplate */}
          <div className="absolute inset-2 rounded-full border border-[#cca05a]/20 bg-radial-gradient from-transparent to-slate-950/20" />
          
          {/* Floating animated beads on the perimeter */}
          <div className="absolute inset-4 rounded-full border border-dashed border-amber-300/30 animate-spin-slow pointer-events-none" />

          {/* Golden Islamic Geometric Logo in Center Background */}
          <svg className="absolute w-44 h-44 opacity-10 text-[#cca05a]" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L58 35 L93 15 L70 45 L100 50 L70 55 L93 85 L58 65 L50 100 L42 65 L7 85 L30 55 L0 50 L30 45 L7 15 L42 35 Z" />
          </svg>

          {/* Selection Dhikr Name */}
          <span className="text-sm font-bold text-amber-100 tracking-wide z-10 opacity-90 mb-1 max-w-[80%] text-center line-clamp-1 truncate">
            {activePhrase}
          </span>

          {/* Beautiful Number Presentation */}
          <div className="relative text-7xl font-bold font-sans tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-amber-200 drop-shadow-md z-10 my-1 font-mono">
            {count}
          </div>

          <span className="text-[10px] font-mono tracking-widest text-[#cca05a] z-10 uppercase mt-1">
            {count === 0 ? "اضغط للبدء" : `بقي ${target - count}`}
          </span>

          {/* Circular progress bar around */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="47.5"
              fill="transparent"
              stroke="#cca05a"
              strokeWidth="1.5"
              strokeDasharray="298"
              strokeDashoffset={298 - (298 * count) / target}
              className="transition-all duration-100"
              opacity="0.8"
            />
          </svg>
        </motion.button>
      </div>

      {/* Control Area Bar at Bottom */}
      <div className="w-full max-w-sm flex items-center justify-center space-x-4 space-x-reverse pt-2">
        {/* Reset button counter */}
        <button
          onClick={handleReset}
          className="flex items-center justify-center space-x-2 space-x-reverse bg-slate-900 hover:bg-slate-800 border border-[#cca05a]/25 text-amber-100/90 text-xs py-2 px-5 rounded-full shadow-lg transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>تصفير الدورة الحالية</span>
        </button>
      </div>

      {/* Inspirational Hadith Quote on Tasbih */}
      <div className="w-full max-w-md text-center bg-[#cca05a]/5 p-2 rounded-xl border border-[#cca05a]/10 text-xs text-amber-200/70 mt-2 flex items-center justify-center space-x-1.5 space-x-reverse">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-none" />
        <p className="line-clamp-1 italic font-sans leading-relaxed">
          - "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ" - الرعد 28
        </p>
      </div>
    </div>
  );
}
