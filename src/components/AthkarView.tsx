import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, RotateCcw, AlertCircle, Bookmark, Share2, Sparkles, BookOpen } from "lucide-react";
import { athkarData } from "../data/islamicData";
import { ZikrSection, Zikr } from "../types";

export default function AthkarView() {
  const [activeCategory, setActiveCategory] = useState<string>("morning");
  // Manage counters in state locally so they are responsive
  const [sections, setSections] = useState<ZikrSection[]>(() => 
    JSON.parse(JSON.stringify(athkarData)) // Deep copy
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);

  useEffect(() => {
    const checkPendingCategory = () => {
      const pending = localStorage.getItem("athkar_select_pending");
      if (pending === "true") {
        localStorage.removeItem("athkar_select_pending");
        const cat = localStorage.getItem("athkar_selected_category");
        if (cat) {
          setActiveCategory(cat);
        }
      }
    };
    checkPendingCategory();
    const interval = setInterval(checkPendingCategory, 350);
    return () => clearInterval(interval);
  }, []);

  const handleShareZikr = async (item: Zikr, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent incrementing count when sharing
    
    const shareText = `【ذكر مسلم】\n"${item.text}"${item.reward ? `\n\nفضل الذكر: ${item.reward}` : ""}${item.source ? `\n\nالمصدر: ${item.source}` : ""}\n\n- تم النسخ من تطبيق "أنا مسلم" 🕌`;
    
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "ذكر من أذكار المسلم",
          text: shareText
        });
        setSharedId(item.id);
        setTimeout(() => setSharedId(null), 2500);
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.warn("Share API failed, trying clipboard fallback", err);
        } else {
          return; // user cancelled share
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setSharedId(item.id);
      setTimeout(() => setSharedId(null), 2500);
    } catch (err) {
      console.error("Clipboard sharing failed:", err);
    }
  };

  const activeSection = sections.find((s) => s.id === activeCategory) || sections[0];

  // Quick audio tick generator for authentic counts
  const playTick = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio Context init blocked or failed: ", e);
    }
  };

  const handleIncrement = (zikrId: string) => {
    playTick();
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        items: sec.items.map((item) => {
          if (item.id === zikrId) {
            const nextCount = item.count < item.maxCount ? item.count + 1 : item.count;
            // Vibrate if complete
            if (nextCount === item.maxCount && navigator.vibrate) {
              navigator.vibrate([40, 30, 40]);
            }
            return { ...item, count: nextCount };
          }
          return item;
        }),
      }))
    );
  };

  const handleResetSection = () => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id === activeCategory) {
          return {
            ...sec,
            items: sec.items.map((item) => ({ ...item, count: 0 })),
          };
        }
        return sec;
      })
    );
  };

  // Statistics calculation for the current section
  const totalItems = activeSection.items.length;
  const completedItems = activeSection.items.filter((item) => item.count === item.maxCount).length;
  const progressPercent = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="flex flex-col h-full bg-[#071b29] text-white p-4 font-sans select-none overflow-y-auto">
      {/* Category Selection Tabs */}
      <div className="flex bg-[#051520] p-1.5 rounded-xl border border-white/5 shadow-inner mb-5 gap-2 direction-rtl">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveCategory(sec.id)}
            className={`flex-1 flex items-center justify-center space-x-2 space-x-reverse py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === sec.id
                ? "bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 font-extrabold shadow-md scale-[1.02]"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="truncate">{sec.title}</span>
          </button>
        ))}
      </div>

      {/* Progress Card */}
      <div className="bg-[#0b2638] rounded-2xl border border-[#cca05a]/25 p-4 mb-5 flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 font-bold text-7xl select-none pointer-events-none text-[#cca05a] pr-4">
          🕌
        </div>
        <div className="space-y-1 z-10">
          <span className="text-xs text-amber-200/60 block text-right font-medium">نسبة الإنجاز في الأذكار الحالية</span>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-2xl font-bold text-amber-100">{completedItems}</span>
            <span className="text-xs text-slate-300">من أصل</span>
            <span className="text-lg font-bold text-[#cca05a]">{totalItems}</span>
          </div>
        </div>

        {/* Circular Progress Display */}
        <div className="relative w-16 h-16 flex items-center justify-center bg-slate-950/40 rounded-full border border-white/5">
          <span className="text-xs font-bold font-mono text-amber-200">{progressPercent}%</span>
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke="#cca05a"
              strokeWidth="2.5"
              strokeDasharray={`${progressPercent} ${100 - progressPercent}`}
              className="transition-all duration-300"
            />
          </svg>
        </div>
      </div>

      {/* List items of Zikr */}
      <div className="space-y-4 flex-1">
        {activeSection.items.map((item) => {
          const isFinished = item.count === item.maxCount;
          return (
            <div
              key={item.id}
              onClick={() => !isFinished && handleIncrement(item.id)}
              className={`bg-[#0a2334] rounded-xl border p-4 transition duration-300 cursor-pointer flex flex-col justify-between relative group ${
                isFinished
                  ? "border-green-600/50 bg-green-950/15"
                  : "border-[#cca05a]/20 hover:border-[#cca05a]/50"
              }`}
            >
              {/* Completed overlay checkmark */}
              {isFinished && (
                <div className="absolute top-3 left-3 flex items-center space-x-1 space-x-reverse bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-green-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>مكتمل</span>
                </div>
              )}

              {/* Text block */}
              <div className="space-y-3 mb-4 text-right">
                <p className="text-sm font-semibold text-slate-100 leading-8 font-sans transition-all duration-300">
                  {item.text}
                </p>

                {/* Reward explanation details */}
                {item.reward && (
                  <div className="bg-slate-950/30 p-2.5 rounded-lg border border-white/5 text-[11px] text-amber-100/70 leading-relaxed font-light">
                    <span className="text-amber-400 font-semibold text-xs inline">فضل الذكر:</span> {item.reward}
                  </div>
                )}

                {/* Hadith source */}
                {item.source && (
                  <span className="text-[10px] text-slate-400 block font-mono">
                    المصدر: {item.source}
                  </span>
                )}
              </div>

              {/* Interactive Counter Container */}
              <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={(e) => handleShareZikr(item, e)}
                    className="p-1 px-2 text-[#cca05a] bg-slate-900 hover:bg-[#cca05a]/10 border border-[#cca05a]/30 hover:border-amber-400 rounded-lg text-[10px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer z-10"
                    title="مشاركة الذكر"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>
                      {sharedId === item.id ? "تم النشر والنسخ!" : "مشاركة"}
                    </span>
                  </button>
                  <span className="text-[10px] text-[#cca05a]/60 font-light block">
                    انقر للعد
                  </span>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <span className="text-xs text-slate-300">التكرار:</span>
                  <div className={`text-sm font-bold font-mono px-3.5 py-1 rounded-full text-center min-w-[70px] transition-all ${
                    isFinished
                      ? "bg-green-600 text-white"
                      : "bg-slate-900 border border-[#cca05a]/30 text-amber-200"
                  }`}>
                    {item.count} / {item.maxCount}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer operations (Reset counters) */}
      <div className="w-full max-w-sm mx-auto flex py-4 flex-none">
        <button
          onClick={handleResetSection}
          className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-[#cca05a]/10 hover:bg-[#cca05a]/20 border border-[#cca05a]/40 text-amber-100 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>إعادة تصفير أذكار {activeSection.title}</span>
        </button>
      </div>
    </div>
  );
}
