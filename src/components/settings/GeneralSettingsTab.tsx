import React from "react";
import { Sliders, Languages, Clock } from "lucide-react";

interface GeneralSettingsTabProps {
  darkMode: boolean;
  isAr: boolean;
  t: (key: string) => string;
  toggleLanguage: () => void;
  quranFontSize: number;
  handleQuranFontSizeChange: (size: number) => void;
  quranFontStyle: string;
  handleQuranFontStyleChange: (style: string) => void;
  hadithFontSize: number;
  handleHadithFontSizeChange: (size: number) => void;
  hadithFontStyle: string;
  handleHadithFontStyleChange: (style: string) => void;
  use12hFormat: boolean;
  handleToggle12hFormat: (enabled: boolean) => void;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  darkMode,
  isAr,
  t,
  toggleLanguage,
  quranFontSize,
  handleQuranFontSizeChange,
  quranFontStyle,
  handleQuranFontStyleChange,
  hadithFontSize,
  handleHadithFontSizeChange,
  hadithFontStyle,
  handleHadithFontStyleChange,
  use12hFormat,
  handleToggle12hFormat
}) => {
  const getQuranFontFamilyClass = (style: string) => {
    switch (style) {
      case "serif": return "font-serif font-medium";
      case "naskh": return "font-serif font-semibold leading-relaxed";
      case "sans": return "font-sans font-normal";
      default: return "font-serif";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 🌐 SYSTEM & LANGUAGE CARD */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">{t("lang_settings_label")}</span>
          <Languages className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
        <p className="text-[11px] text-slate-400 font-light leading-relaxed text-right">
          {t("lang_settings_desc")}
        </p>
        <div className="flex items-center gap-2 pt-1 justify-end">
          <button
            onClick={() => { if (!isAr) toggleLanguage(); }}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
              isAr
                ? "bg-[#cca05a]/20 border-[#cca05a] text-amber-100 shadow-sm font-bold"
                : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white"
            }`}
          >
            العربية (Arabic)
          </button>
          <button
            onClick={() => { if (isAr) toggleLanguage(); }}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
              !isAr
                ? "bg-[#cca05a]/20 border-[#cca05a] text-amber-100 shadow-sm font-bold"
                : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* ⏰ TIME DISPLAY FORMAT CARD */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">
            {isAr ? "⏰ صيغة عرض مواقيت الصلاة" : "⏰ Prayer Time Display Format"}
          </span>
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
        <p className="text-[11px] text-slate-400 font-light leading-relaxed text-right">
          {isAr
            ? "بدل صيغة عرض مواقيت الصلاة بين نظام 24 ساعة المعتاد أو نظام 12 ساعة مع مؤشرات ص/م (صباحاً ومساءً)."
            : "Switch your prayer display times between the traditional 24-hour format or a customized 12-hour format with AM/PM indicators."}
        </p>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/20 border border-white/5" style={{ direction: "rtl" }}>
          <span className="text-xs font-bold text-slate-200">
            {isAr ? "عرض مواقيت الصلاة بصيغة 12 ساعة:" : "Display times in 12-hour format:"}
          </span>
          <button
            onClick={() => handleToggle12hFormat(!use12hFormat)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              use12hFormat ? "bg-[#cca05a]" : "bg-slate-700"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${
                use12hFormat ? "left-0.5" : "left-6.5"
              }`}
              style={{
                transform: use12hFormat ? 'translateX(24px)' : 'translateX(0px)'
              }}
            />
          </button>
        </div>
      </div>

      {/* 📖 TYPOGRAPHY SETTINGS CARD */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-5 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">{t("settings_title")}</span>
          <Sliders className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
        <p className="text-[11px] text-slate-400 font-light text-right">
          {t("settings_desc")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          
          {/* Quran Font selector */}
          <div className="space-y-4 bg-slate-950/20 p-4 rounded-xl border border-white/5 text-right">
            <span className="text-xs font-bold text-amber-400 block">{t("quran_font_label")}</span>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] text-slate-300">
                <span>{t("font_size_label")}</span>
                <span className="font-mono font-bold text-[#cca05a]">{quranFontSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="36"
                value={quranFontSize}
                onChange={(e) => handleQuranFontSizeChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-[#cca05a]"
              />
            </div>

            <div className="space-y-1.5 text-right">
              <span className="text-[10px] text-slate-400 block font-bold">{t("font_style_label")}</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: "serif", name: t("font_style_serif") },
                  { id: "naskh", name: t("font_style_naskh") },
                  { id: "sans", name: t("font_style_sans") },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleQuranFontStyleChange(item.id)}
                    className={`py-1.5 px-0.5 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                      quranFontStyle === item.id
                        ? "bg-[#cca05a]/20 border-[#cca05a] text-amber-100"
                        : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Pane */}
            <div className="mt-3 p-3 bg-slate-950/40 rounded-lg border border-white/5 text-center">
              <span className="text-[9px] text-slate-500 block mb-1">{isAr ? "معاينة آية الكرسي" : "Verse Preview"}</span>
              <p 
                className={`text-slate-100 transition-all ${getQuranFontFamilyClass(quranFontStyle)}`}
                style={{ fontSize: `${quranFontSize}px` }}
              >
                اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ
              </p>
            </div>
          </div>

          {/* Hadith Font Selector */}
          <div className="space-y-4 bg-slate-950/20 p-4 rounded-xl border border-white/5 text-right">
            <span className="text-xs font-bold text-amber-400 block">{t("hadith_font_label")}</span>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] text-slate-300">
                <span>{t("font_size_label")}</span>
                <span className="font-mono font-bold text-[#cca05a]">{hadithFontSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="28"
                value={hadithFontSize}
                onChange={(e) => handleHadithFontSizeChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-[#cca05a]"
              />
            </div>

            <div className="space-y-1.5 text-right">
              <span className="text-[10px] text-slate-400 block font-bold">{t("font_style_hadith_label")}</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: "serif", name: t("font_style_serif") },
                  { id: "naskh", name: t("font_style_naskh") },
                  { id: "sans", name: t("font_style_sans") },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleHadithFontStyleChange(item.id)}
                    className={`py-1.5 px-0.5 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                      hadithFontStyle === item.id
                        ? "bg-[#cca05a]/20 border-[#cca05a] text-amber-100"
                        : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview Pane */}
            <div className="mt-3 p-3 bg-slate-950/40 rounded-lg border border-white/5 text-center">
              <span className="text-[9px] text-slate-500 block mb-1">{isAr ? "معاينة الحديث الشريف" : "Hadith Preview"}</span>
              <p 
                className={`text-slate-200 transition-all ${getQuranFontFamilyClass(hadithFontStyle)}`}
                style={{ fontSize: `${hadithFontSize}px` }}
              >
                «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ»
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
