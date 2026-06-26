import React, { useState, useEffect } from "react";
import { Copy, BookOpen, Search, Share2, Award, Sparkles, Sliders, Heart } from "lucide-react";
import { hadithsList } from "../data/islamicData";
import { Hadith } from "../types";

export default function HadithView({ darkMode = true }: { darkMode?: boolean }) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedHadith, setSelectedHadith] = useState<Hadith | null>(null);
  const [featuredHadith, setFeaturedHadith] = useState<Hadith>(hadithsList[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);

  const [hadithTab, setHadithTab] = useState<"all" | "favorites">("all");
  const [favorites, setFavorites] = useState<Hadith[]>(() => {
    const saved = localStorage.getItem("hadith_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const handleToggleFavorite = (hadith: Hadith, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isFav = favorites.some((f) => f.id === hadith.id);
    let updated: Hadith[];
    if (isFav) {
      updated = favorites.filter((f) => f.id !== hadith.id);
    } else {
      updated = [...favorites, hadith];
    }
    setFavorites(updated);
    localStorage.setItem("hadith_favorites", JSON.stringify(updated));
  };

  const handleShareHadith = async (hadith: Hadith, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const shareText = `【حديث شريف】\n"${hadith.text}"\n\n- الراوي: ${hadith.narrator}\n- المصدر: ${hadith.source}\n\nتم المشاركة من تطبيق "أنا مسلم" 🕌`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "حديث شريف صحيح من السنة المطهرة",
          text: shareText
        });
        setSharedId(hadith.id);
        setTimeout(() => setSharedId(null), 2500);
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.warn("Share API failed, using clipboard fallback", err);
        } else {
          return; // user cancelled share
        }
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareText);
      setSharedId(hadith.id);
      setTimeout(() => setSharedId(null), 2550);
    } catch (err) {
      console.error("Clipboard sharing failed:", err);
    }
  };

  const [fontSize, setFontSize] = useState<number>(() => {
    return Number(localStorage.getItem("hadith_font_size") || "16");
  });
  const [fontStyle, setFontStyle] = useState<string>(() => {
    return localStorage.getItem("hadith_font_style") || "naskh";
  });

  // Set randomized daily hadith on load
  useEffect(() => {
    const dayOfYear = new Date().getDate();
    const index = dayOfYear % hadithsList.length;
    setFeaturedHadith(hadithsList[index]);
  }, []);

  const handleCopy = (hadith: Hadith) => {
    const fullText = `【حديث شريف】\n"${hadith.text}"\n\n- ${hadith.narrator}\n- المصدر: ${hadith.source}\n\nتم النسخ من تطبيق "أنا مسلم"`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(hadith.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const listToSearch = hadithTab === "favorites" ? favorites : hadithsList;

  const filteredHadiths = listToSearch.filter(
    (h) =>
      h.text.includes(searchTerm) ||
      h.narrator.includes(searchTerm) ||
      h.source.includes(searchTerm) ||
      (h.explanation && h.explanation.includes(searchTerm))
  );

  const getNewFeatured = () => {
    const randomIdx = Math.floor(Math.random() * hadithsList.length);
    setFeaturedHadith(hadithsList[randomIdx]);
  };

  return (
    <div className={`flex flex-col h-full p-4 font-sans select-none overflow-y-auto transition-colors ${
      darkMode ? "bg-[#071b29] text-white" : "bg-white text-slate-900"
    }`}>
      {/* ⚙️ Hadith View Quick controls header */}
      <div className={`rounded-2xl border p-4 mb-5 flex flex-wrap justify-between items-center gap-3 shadow-lg flex-none ${
        darkMode ? "bg-[#0b293f] border-[#cca05a]/20 text-white" : "bg-[#fcfbf9] border-slate-200 text-slate-800"
      }`} style={{ direction: "rtl" }}>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Award className="w-5 h-5 text-amber-500" />
          <span className={`font-bold text-sm font-sans ${darkMode ? "text-yellow-101 text-yellow-100" : "text-slate-805 text-slate-800"}`}>الأحاديث النبوية الشريفة</span>
        </div>

        {/* Text styling buttons */}
        <div className="flex flex-wrap items-center gap-4 space-x-reverse font-sans">
          {/* Font Style Selection */}
          <div className="flex items-center space-x-1.5 space-x-reverse">
            <span className={`text-[10px] ${darkMode ? "text-amber-100/50" : "text-slate-500"}`}>نمط الخط:</span>
            <div className={`flex p-1 rounded-lg border text-[10px] gap-1 ${
              darkMode ? "bg-slate-950/40 border-white/5" : "bg-slate-50 border-slate-200"
            }`}>
              {[
                { id: "serif", name: "أميري" },
                { id: "naskh", name: "نسخ" },
                { id: "sans", name: "نظام" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setFontStyle(item.id);
                    localStorage.setItem("hadith_font_style", item.id);
                  }}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                    fontStyle === item.id 
                      ? "bg-[#cca05a] text-slate-950 font-bold" 
                      : darkMode ? "text-white/60 hover:text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Font Sizer */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className={`text-[10px] ${darkMode ? "text-amber-100/50" : "text-slate-500"}`}>حجم الخط:</span>
            <input
              type="range"
              min="12"
              max="28"
              value={fontSize}
              onChange={(e) => {
                const size = parseInt(e.target.value);
                setFontSize(size);
                localStorage.setItem("hadith_font_size", String(size));
              }}
              className="w-16 sm:w-24 md:w-28 h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-[#cca05a]"
            />
            <span className={`text-xs font-mono font-bold ${darkMode ? "text-amber-200" : "text-amber-800"}`}>{fontSize}px</span>
          </div>
        </div>
      </div>
      {/* Featured Hadith Banner */}
      <div className={`rounded-2xl border p-5 shadow-xl relative overflow-hidden mb-6 flex-none ${
        darkMode 
          ? "bg-gradient-to-r from-[#0d344f] via-[#092c44] to-[#041d2e] border-[#cca05a]/30" 
          : "bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-amber-50/10 border-slate-200"
      }`}>
        
        {/* Background islamic shape */}
        <div className="absolute top-0 right-0 opacity-5 w-40 h-40">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L58 35 L93 15 L70 45 L100 50 L70 55 L93 85 L58 65 L50 100 L42 65 L7 85 L30 55 L0 50 L30 45 L7 15 L42 35 Z" />
          </svg>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2 space-x-reverse text-amber-300">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">حديث اليوم المختار</span>
          </div>
          <button
            onClick={getNewFeatured}
            className="text-xs text-[#cca05a] hover:underline bg-[#cca05a]/10 px-2.5 py-1.5 rounded-lg border border-[#cca05a]/25 active:scale-95 transition"
          >
            تغيير الحديث
          </button>
        </div>

        {/* Content of featured hadith */}
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border-r-4 border-amber-400 relative ${
            darkMode ? "bg-slate-950/40" : "bg-white border border-slate-200"
          }`}>
            <p 
              className={`leading-8 text-right font-semibold ${darkMode ? "text-amber-100" : "text-slate-800"}`}
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: fontStyle === "serif" 
                  ? "'Amiri', serif" 
                  : fontStyle === "naskh" 
                  ? "'Noto Naskh Arabic', sans-serif" 
                  : "system-ui, sans-serif"
              }}
            >
              "{featuredHadith.text}"
            </p>
            <span className={`text-xs block text-right mt-2 ${darkMode ? "text-amber-200/60" : "text-slate-500 font-medium"}`}>
              {featuredHadith.narrator}
            </span>
          </div>

          <div className={`space-y-1 p-4 rounded-lg border ${
            darkMode ? "bg-[#103a55]/30 border-white/5" : "bg-amber-50/10 border-slate-200"
          }`}>
            <span className="text-xs text-[#cca05a] font-bold block text-right">شرح وتفسير الحديث:</span>
            <p className={`text-xs leading-relaxed text-right font-light ${
              darkMode ? "text-slate-100/80" : "text-slate-700 font-normal"
            }`}>
              {featuredHadith.explanation}
            </p>
            <span className="text-[10px] text-[#cca05a]/60 block text-left mt-2">
              المصدر: {featuredHadith.source}
            </span>
          </div>

          {/* Quick copy/share action bar */}
          <div className="flex items-center gap-2 pt-1 justify-start">
            <button
              onClick={() => handleCopy(featuredHadith)}
              className="flex items-center space-x-1.5 space-x-reverse text-xs bg-slate-900 border border-white/10 text-amber-200 px-3.5 py-1.5 rounded-lg hover:bg-slate-850 hover:text-white transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedId === featuredHadith.id ? "تم النسخ!" : "نسخ النص"}</span>
            </button>

            <button
              onClick={(e) => handleShareHadith(featuredHadith, e)}
              className="flex items-center space-x-1.5 space-x-reverse text-xs bg-[#cca05a] text-slate-950 px-3.5 py-1.5 rounded-lg hover:bg-amber-400 font-bold transition cursor-pointer shadow-sm"
              title="مشاركة الحديث"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>
                {sharedId === featuredHadith.id ? "تم النسخ والمشاركة!" : "مشاركة الحديث"}
              </span>
            </button>

            <button
              onClick={(e) => handleToggleFavorite(featuredHadith, e)}
              className={`flex items-center space-x-1.5 space-x-reverse text-xs px-3.5 py-1.5 rounded-lg border transition cursor-pointer shadow-sm ${
                favorites.some(f => f.id === featuredHadith.id)
                  ? "bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                  : "bg-slate-900 border-white/10 text-amber-200 hover:bg-slate-850 hover:text-white"
              }`}
              title="إضافة إلى المفضلة"
            >
              <Heart className={`w-3.5 h-3.5 ${favorites.some(f => f.id === featuredHadith.id) ? "fill-red-500 text-red-500" : ""}`} />
              <span>{favorites.some(f => f.id === featuredHadith.id) ? "مفضلة ❤️" : "إضافة للمفضلة"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hadith Database / Library Search */}
      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-bold ${darkMode ? "text-amber-200/80" : "text-slate-800"}`}>مكتبة الأحاديث الشريفة ({filteredHadiths.length})</span>
          <div className={`text-xs ${darkMode ? "text-slate-300/50" : "text-slate-500"}`}>الأربعين النووية ومقتطفات رياض الصالحين</div>
        </div>

        {/* Hadith Section Switcher Tabs */}
        <div className="grid grid-cols-2 bg-slate-950/20 p-1.5 rounded-2xl border border-white/5 gap-2" style={{ direction: "rtl" }}>
          <button
            onClick={() => {
              setHadithTab("all");
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              hadithTab === "all"
                ? "bg-gradient-to-r from-amber-500/90 to-[#cca05a] text-slate-950 font-black shadow-lg"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            📚 المكتبة الكاملة ({hadithsList.length})
          </button>
          <button
            onClick={() => {
              setHadithTab("favorites");
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              hadithTab === "favorites"
                ? "bg-gradient-to-r from-amber-500/90 to-[#cca05a] text-slate-950 font-black shadow-lg"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            ❤️ المفضلة ({favorites.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث بالكلمات... (مثال: نية، كربة، طق، المسجد)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full text-right border rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:border-[#cca05a] transition ${
              darkMode ? "bg-slate-900 border-white/10 text-amber-100" : "bg-slate-50 border-slate-205 text-slate-800"
            }`}
          />
        </div>

        {/* Hadiths Lists */}
        <div className="space-y-4">
          {hadithTab === "favorites" && favorites.length === 0 ? (
            <div className={`text-center py-12 rounded-xl text-xs border border-dashed ${
              darkMode ? "bg-slate-900/40 border-white/5 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
            }`}>
              ❤️ لم تقم بحفظ أي حديث في المفضلة بعد. اضغط على زر القلب عند قراءة أي حديث لحفظه هنا للرجوع السريع.
            </div>
          ) : null}

          {(hadithTab !== "favorites" || favorites.length > 0) && (
            <>
          {filteredHadiths.length > 0 ? (
            filteredHadiths.map((h, i) => (
              <div
                key={h.id}
                className={`rounded-xl border p-4 transition duration-300 space-y-3 ${
                  darkMode 
                    ? "bg-[#0b2537]/80 border-[#cca05a]/15 hover:border-[#cca05a]/40" 
                    : "bg-[#fdfcf9] border-slate-200 hover:border-[#cca05a]/30 shadow-xs"
                }`}
              >
                {/* Narrator */}
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center space-x-1.5 space-x-reverse text-[#cca05a] text-xs">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">{h.narrator}</span>
                  </div>
                  <span className={`text-[10px] ${darkMode ? "text-slate-300/40" : "text-slate-500"}`}>حديث رقم {i + 1}</span>
                </div>

                {/* Body Text */}
                <p 
                  className={`leading-relaxed text-right font-semibold ${darkMode ? "text-slate-100" : "text-slate-800"}`}
                  style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: fontStyle === "serif" 
                      ? "'Amiri', serif" 
                      : fontStyle === "naskh" 
                      ? "'Noto Naskh Arabic', sans-serif" 
                      : "system-ui, sans-serif"
                  }}
                >
                  "{h.text}"
                </p>

                {/* Detailed Section Drawer */}
                {selectedHadith?.id === h.id ? (
                  <div className={`p-3 rounded-lg border space-y-2 mt-2 ${
                    darkMode ? "bg-slate-950/40 border-white/5" : "bg-amber-500/5 border-slate-205"
                  }`}>
                    <span className={`text-xs block font-bold text-right ${darkMode ? "text-amber-200/80" : "text-amber-900 font-extrabold"}`}>فهم الحديث الشريف:</span>
                    <p className={`text-[11px] leading-relaxed text-right ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                      {h.explanation}
                    </p>
                    <div className={`text-[10px] block text-left ${darkMode ? "text-slate-404 text-slate-400" : "text-slate-500"}`}>
                      المصدر بالكتب: <span className="text-[#cca05a]">{h.source}</span>
                    </div>
                  </div>
                ) : null}

                {/* Footer Controls */}
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <button
                    onClick={() => setSelectedHadith(selectedHadith?.id === h.id ? null : h)}
                    className="flex items-center space-x-1 space-x-reverse text-xs text-amber-200/80 hover:text-amber-500 transition cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{selectedHadith?.id === h.id ? "إخفاء الشرح" : "قراءة الشرح والفوائد"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(h)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:border-white/20 transition text-slate-300 hover:text-white cursor-pointer"
                      title="نسخ الحديث"
                    >
                      {copiedId === h.id ? (
                        <span className="text-[10px] text-green-300 px-1">تم النسخ</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={(e) => handleShareHadith(h, e)}
                      className="p-1.5 rounded-lg bg-[#cca05a]/10 hover:bg-[#cca05a]/20 transition text-[#cca05a] hover:text-amber-300 cursor-pointer flex items-center justify-center"
                      title="مشاركة الحديث"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      {sharedId === h.id && <span className="text-[9px] font-bold mr-1">تم!</span>}
                    </button>

                    <button
                      onClick={(e) => handleToggleFavorite(h, e)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                        favorites.some(f => f.id === h.id)
                          ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                          : "bg-slate-900 border-white/5 hover:border-white/20 text-slate-300 hover:text-white"
                      }`}
                      title="إضافة للمفضلة"
                    >
                      <Heart className={`w-3.5 h-3.5 ${favorites.some(f => f.id === h.id) ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-12 rounded-xl text-sm ${darkMode ? "bg-slate-900/40 text-slate-400" : "bg-slate-50 border border-slate-200 text-slate-500"}`}>
              لا توجد أحاديث مطابقة لبحثك في المكتبة الحالية. جرب كلمات بديلة.
            </div>
          )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
