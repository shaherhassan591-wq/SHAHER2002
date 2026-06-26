import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Smooth progress increment from 0 to 100
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 32);

    // Show splash for ~3.5 seconds then proceed
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  const isEn = typeof window !== "undefined" && localStorage.getItem("app_lang") === "en";

  return (
    <div className="fixed inset-0 bg-[#04121e] flex flex-col items-center justify-center text-white overflow-hidden z-[9999] select-none">
      
      {/* 🔮 Ambient Blurred Atmospheric Background of the same Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110 pointer-events-none"
        style={{ backgroundImage: "url('/splash_screen.jpg')" }}
      />
      
      {/* 🌟 Subtle Animated Soft Light Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#04121e] via-transparent to-[#04121e]/80 pointer-events-none" />

      {/* 📱 Main Splash Frame (Full-screen on Mobile, elegant centered phone preview on Desktop) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-md h-full md:max-h-[85vh] md:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/5 bg-[#071d2e] flex flex-col justify-between p-8 text-center"
      >
        
        {/* Full Image background */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: "url('/splash_screen.jpg')" }}
        />

        {/* Shadow Overlay inside the frame to keep loading text legible */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#04121e]/40 to-transparent pointer-events-none" />

        {/* Spacer to push contents down */}
        <div className="flex-1" />

        {/* Lower Loader Overlay Plate */}
        <div className="relative z-10 space-y-5 pb-6">
          
          {/* Progress Bar & Percentage */}
          <div className="space-y-2.5 max-w-xs mx-auto">
            <div className="flex justify-between items-center text-[11px] text-[#cca05a] font-mono px-1">
              <span className="font-semibold tracking-wider font-sans">
                {isEn ? "Initializing Application..." : "جاري تهيئة التطبيق..."}
              </span>
              <span className="font-bold">{progress}%</span>
            </div>
            
            {/* Custom Glowing Progress Track */}
            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm p-[1px]">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-600 via-[#cca05a] to-[#ffe6aa] rounded-full shadow-[0_0_10px_#cca05a]" 
                style={{ width: `${progress}%` }}
                layout
              />
            </div>
          </div>

          {/* Inspirational loading quote */}
          <p className="text-amber-100/40 text-[10px] font-light max-w-xs mx-auto select-none">
            {isEn 
              ? "« Every day is an opportunity to draw closer to Allah »" 
              : "« كُلَّ يَوْمٍ هُوَ فُرْصَةٌ لِلتَّقَرُّبِ إِلَى اللَّهِ »"}
          </p>

          {/* Developers credits at the absolute bottom */}
          <div className="pt-2 flex flex-col items-center justify-center space-y-0.5 opacity-90">
            <div className="w-10 h-[1px] bg-[#cca05a]/30 mb-1" />
            <span className="text-[9px] text-amber-200/50 font-sans tracking-wide">
              {isEn ? "Supervised & Developed by" : "تطوير وإشراف المبرمج العربي"}
            </span>
            <span className="text-[11px] font-bold text-[#cca05a] font-sans">
              {isEn ? "Developer / Shaher Hassan" : "المطور / شاهر حسان"}
            </span>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
