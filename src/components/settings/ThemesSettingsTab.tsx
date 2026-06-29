import React from "react";
import { Palette, Moon, Sun } from "lucide-react";

interface ThemesSettingsTabProps {
  darkMode: boolean;
  setDarkMode?: (dark: boolean) => void;
  accentTheme: string;
  changeAccentTheme: (theme: string) => void;
  isAr: boolean;
  t: (key: string) => string;
}

export const ThemesSettingsTab: React.FC<ThemesSettingsTabProps> = ({
  darkMode,
  setDarkMode,
  accentTheme,
  changeAccentTheme,
  isAr,
  t
}) => {
  return (
    <div className="space-y-6">
      {/* 🎨 THEME CUSTOMIZATION CARD */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">{t("theme_settings_label")}</span>
          <Palette className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
        <p className="text-[11px] text-slate-400 font-light leading-relaxed text-right">
          {t("theme_settings_desc")}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1 justify-end">
          {[
            { id: "gold", colorBg: "bg-[#cca05a]", borderCol: "border-[#cca05a]", name: t("theme_gold") },
            { id: "emerald", colorBg: "bg-[#10b981]", borderCol: "border-[#10b981]", name: t("theme_emerald") },
            { id: "blue", colorBg: "bg-[#0284c7]", borderCol: "border-[#0284c7]", name: t("theme_blue") },
            { id: "ruby", colorBg: "bg-[#f43f5e]", borderCol: "border-[#f43f5e]", name: t("theme_ruby") },
            { id: "purple", colorBg: "bg-[#8b5cf6]", borderCol: "border-[#8b5cf6]", name: t("theme_purple") }
          ].map((theme) => {
            const isSelected = accentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => changeAccentTheme(theme.id)}
                className={`flex items-center space-x-2 space-x-reverse py-2.5 px-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? `border-amber-500 bg-[#cca05a]/20 text-white shadow-md scale-[1.02] font-bold`
                    : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white hover:bg-slate-950/60"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${theme.colorBg} shrink-0 shadow-sm`} />
                <span className="text-xs">{theme.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Night / Light mode custom card */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">
            {isAr ? "🌓 وضع العرض الشاشي (Appearance)" : "🌓 Screen Appearance"}
          </span>
          <Moon className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
        <p className="text-[11px] text-slate-400 font-light leading-relaxed text-right">
          {isAr 
            ? "بدل بين الوضع المظلم للحفاظ على العين ليلاً، أو الوضع النهاري الساطع لقراءة أسهل بضوء الشمس"
            : "Switch between protective dark mode for night usage or bright warm light mode for outdoor reading"}
        </p>
        {setDarkMode && (
          <div className="flex items-center gap-2 pt-1 justify-end">
            <button
              onClick={() => setDarkMode(false)}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                !darkMode
                  ? "bg-amber-500/20 border-amber-500 text-amber-700 font-bold"
                  : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="text-xs">{isAr ? "النهاري المضيء" : "Light Mode"}</span>
            </button>
            <button
              onClick={() => setDarkMode(true)}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
                darkMode
                  ? "bg-[#cca05a]/20 border-[#cca05a] text-amber-100 font-bold"
                  : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="text-xs">{isAr ? "المظلم الحامي" : "Dark Mode"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
