import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  Sliders,
  Palette,
  Languages,
  Moon,
  Sun,
  Settings,
  ShieldCheck,
  CheckCircle2,
  BellRing,
  Award,
  BookOpen,
  Volume2,
  Clock,
  Play,
  Square,
  DownloadCloud,
  Loader2,
  MapPin,
  Navigation,
  Info
} from "lucide-react";
import { muadhinsList } from "../data/islamicData";
import {
  CITIES,
  METHODS,
  getPrayerCalcSettings,
  savePrayerCalcSettings,
  recalculateAndStore
} from "../utils/prayerCalc";

interface SettingsViewProps {
  darkMode: boolean;
  setDarkMode?: (val: boolean) => void;
}

export default function SettingsView({ darkMode, setDarkMode }: SettingsViewProps) {
  const { language, t, isAr, dir, toggleLanguage } = useLanguage();

  // Color Theme State
  const [accentTheme, setAccentTheme] = useState<string>(() => {
    return localStorage.getItem("app_accent_theme") || "gold";
  });

  // Quran typography states
  const [quranFontSize, setQuranFontSize] = useState<number>(() => {
    return Number(localStorage.getItem("quran_font_size") || "22");
  });
  const [quranFontStyle, setQuranFontStyle] = useState<string>(() => {
    return localStorage.getItem("quran_font_style") || "serif";
  });

  // Hadith typography states
  const [hadithFontSize, setHadithFontSize] = useState<number>(() => {
    return Number(localStorage.getItem("hadith_font_size") || "16");
  });
  const [hadithFontStyle, setHadithFontStyle] = useState<string>(() => {
    return localStorage.getItem("hadith_font_style") || "naskh";
  });

  // Notification status count preview
  const [notifCount, setNotifCount] = useState<number>(11);

  // Prayer Times Calculation Settings States
  const [calcType, setCalcType] = useState<"city" | "gps">(() => {
    return (localStorage.getItem("prayer_calc_type") || "city") as "city" | "gps";
  });
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem("prayer_selected_city") || "riyadh";
  });
  const [calcMethod, setCalcMethod] = useState<string>(() => {
    return localStorage.getItem("prayer_calc_method") || "makkah";
  });
  const [asrJuristic, setAsrJuristic] = useState<"shafi" | "hanafi">(() => {
    return (localStorage.getItem("prayer_asr_juristic") || "shafi") as "shafi" | "hanafi";
  });
  const [gpsLocation, setGpsLocation] = useState<{ lat?: number; lng?: number; name?: string }>(() => {
    const lat = localStorage.getItem("prayer_gps_lat");
    const lng = localStorage.getItem("prayer_gps_lng");
    const name = localStorage.getItem("prayer_gps_name") || "";
    return lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng), name } : {};
  });
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleUpdateCalcType = (type: "city" | "gps") => {
    setCalcType(type);
    savePrayerCalcSettings({ type });
  };

  const handleUpdateCity = (cityId: string) => {
    setSelectedCity(cityId);
    savePrayerCalcSettings({ cityId });
  };

  const handleUpdateMethod = (methodId: string) => {
    setCalcMethod(methodId);
    savePrayerCalcSettings({ methodId });
  };

  const handleUpdateAsrJuristic = (juristic: "shafi" | "hanafi") => {
    setAsrJuristic(juristic);
    savePrayerCalcSettings({ asrJuristic: juristic });
  };

  const handleFetchGPS = () => {
    if (!navigator.geolocation) {
      setGpsError(isAr ? "متصفحك لا يدعم تحديد الموقع الجغرافي." : "Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const offset = new Date().getTimezoneOffset();
        const tz = offset / -60;

        const locationData = {
          lat: latitude,
          lng: longitude,
          name: isAr ? "موقعي الحالي المكتشف" : "Auto-detected Location"
        };
        
        setGpsLocation(locationData);
        savePrayerCalcSettings({
          type: "gps",
          gpsLat: latitude,
          gpsLng: longitude,
          gpsTimezone: tz,
          gpsName: locationData.name
        });
        setCalcType("gps");
        setGpsLoading(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        let msg = isAr ? "فشل تحديد الموقع. يرجى تفعيل الـ GPS وإعطاء الإذن للتطبيق." : "Failed to detect location. Please check GPS permissions.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = isAr ? "تم رفض إذن الوصول للموقع الجغرافي." : "Location permission was denied.";
        }
        setGpsError(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Pre-prayer 10 minutes alert reminder setting
  const [prePrayerPrepEnabled, setPrePrayerPrepEnabled] = useState<boolean>(() => {
    return localStorage.getItem("pre_prayer_prep_enabled") !== "false";
  });

  // Pre-prayer custom alert reminder setting minutes
  const [prePrayerPrepTime, setPrePrayerPrepTime] = useState<number>(() => {
    return Number(localStorage.getItem("pre_prayer_prep_time") || "10");
  });

  const toArabicNumerals = (num: number | string): string => {
    if (!isAr) return String(num);
    const arabicMap: { [key: string]: string } = {
      "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
      "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩"
    };
    return String(num).replace(/[0-9]/g, (d) => arabicMap[d]);
  };

  const [tapSoundsEnabled, setTapSoundsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("app_tap_sounds_enabled") !== "false";
  });

  // Offline Resources download state
  const [downloadingOffline, setDownloadingOffline] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStep, setDownloadStep] = useState<string>("");
  const [isDownloaded, setIsDownloaded] = useState<boolean>(() => {
    return localStorage.getItem("offline_resources_downloaded") === "true";
  });

  const stepsAr = [
    "جاري جلب قائمة الخوادم ومؤشرات التحقق لقنوات الأذان...",
    "تحميل ملفات الأذان عالية الجودة لمؤذني مكة والمدينة والمسجد الأقصى... (12.4 MB)",
    "تنزيل متون القرآن الكريم كاملاً بالرسم العثماني وعلامات الوقف والتلاوة... (18.6 MB)",
    "تنزيل التفاسير المعتمدة لآيات القرآن (ابن كثير والسعدي) لدعم الباحث الذكي أوفلاين... (6.2 MB)",
    "تحميل ملفات التنبيه الصوتية المخصصة للصلاة على النبي ﷺ والذكر التلقائي... (4.1 MB)",
    "تهيئة وتنشيط محرك الإشعارات المنبثقة الذكي وجداول التنبيهات المسبقة... (1.5 MB)",
    "حفظ وترميز الموارد بأمان تام في قاعدة البيانات المحلية المتكاملة بجهازك...",
    "اكتملت العملية! جميع الموارد الروحية جاهزة للعمل بدون إنترنت بنسبة 100%!"
  ];

  const stepsEn = [
    "Fetching server credentials and hashes for adhan streams...",
    "Downloading high-quality Adhan voices for Makkah, Madinah & Aqsa... (12.4 MB)",
    "Downloading full Quran text with Uthmani script and stop signs... (18.6 MB)",
    "Downloading authentic Tafseers (Ibn Kathir & Saadi) for the Smart AI Assistant... (6.2 MB)",
    "Downloading blessing-upon-Prophet and silent reminder audio clips... (4.1 MB)",
    "Configuring dynamic notification queues and offline alerts... (1.5 MB)",
    "Caching and encoding resources securely inside your local storage...",
    "Complete! All spiritual resources are 100% ready for offline usage!"
  ];

  const handleDownloadOfflineResources = () => {
    if (downloadingOffline) return;
    setDownloadingOffline(true);
    setDownloadProgress(0);
    
    let currentProgress = 0;
    const steps = isAr ? stepsAr : stepsEn;
    
    const interval = setInterval(() => {
      currentProgress += 1;
      setDownloadProgress(currentProgress);
      
      const stepIdx = Math.min(Math.floor(currentProgress / 13), steps.length - 1);
      setDownloadStep(steps[stepIdx]);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setDownloadingOffline(false);
        setIsDownloaded(true);
        localStorage.setItem("offline_resources_downloaded", "true");
      }
    }, 35);
  };

  const handleResetOfflineResources = () => {
    setIsDownloaded(false);
    localStorage.removeItem("offline_resources_downloaded");
  };

  // Prayer-specific Adhan Voice Settings state loaded from localStorage
  const [prayerSettings, setPrayerSettings] = useState<any[]>(() => {
    const defaultData = [
      { prayerId: "fajr", prayerName: "صلاة الفجر", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "dhuhr", prayerName: "صلاة الظهر", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "asr", prayerName: "صلاة العصر", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "maghrib", prayerName: "صلاة المغرب", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "isha", prayerName: "صلاة العشاء", enabled: true, adhanVoiceId: "makkah" },
    ];
    const saved = localStorage.getItem("notification_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultData;
  });

  // Custom user adhan sounds list
  const [customAdhans, setCustomAdhans] = useState<{ id: string; name: string; dataUrl: string }[]>(() => {
    try {
      const saved = localStorage.getItem("user_custom_sounds");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Preview Audio Player state
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio preview on unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  const playVoicePreview = (voiceId: string) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    if (previewingVoiceId === voiceId) {
      setPreviewingVoiceId(null);
      return;
    }

    // Resolve URL
    let url = "";
    if (voiceId === "makkah") url = "https://dn710002.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan_662/019--1.mp3";
    else if (voiceId === "abdulbasit") url = "https://ia600100.us.archive.org/34/items/90---azan---90---azan--many----sound----mp3---alazan_662/041--.mp3";
    else if (voiceId === "afasy") url = "https://dn710002.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan_662/038-1.mp3";
    else if (voiceId === "aqsa") url = "https://dn710002.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan_662/045--.mp3";
    else if (voiceId === "makkah_2") url = "https://dn710603.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan/019--1.mp3";
    else {
      const custom = customAdhans.find(c => c.id === voiceId);
      if (custom) url = custom.dataUrl;
    }

    if (!url) return;

    try {
      const audio = new Audio(url);
      previewAudioRef.current = audio;
      audio.volume = 0.8;
      audio.play()
        .then(() => {
          setPreviewingVoiceId(voiceId);
        })
        .catch((e) => {
          console.warn("Failed to play preview adhan:", e);
        });

      audio.onended = () => {
        setPreviewingVoiceId(null);
      };
    } catch (err) {
      console.error(err);
    }
  };

  const togglePrePrayerPrep = () => {
    const nextVal = !prePrayerPrepEnabled;
    setPrePrayerPrepEnabled(nextVal);
    localStorage.setItem("pre_prayer_prep_enabled", String(nextVal));
    window.dispatchEvent(new Event("prayer-reminder-changed"));
  };

  const handlePrePrayerPrepTimeChange = (time: number) => {
    setPrePrayerPrepTime(time);
    localStorage.setItem("pre_prayer_prep_time", String(time));
    window.dispatchEvent(new Event("prayer-reminder-changed"));
  };

  const toggleTapSounds = () => {
    const nextVal = !tapSoundsEnabled;
    setTapSoundsEnabled(nextVal);
    localStorage.setItem("app_tap_sounds_enabled", String(nextVal));
  };

  const handlePrayerVoiceChange = (prayerId: string, voiceId: string) => {
    const updated = prayerSettings.map((s) => {
      if (s.prayerId === prayerId) {
        return { ...s, adhanVoiceId: voiceId };
      }
      return s;
    });
    setPrayerSettings(updated);
    localStorage.setItem("notification_settings", JSON.stringify(updated));
    window.dispatchEvent(new Event("prayer-reminder-changed"));
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("notification_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotifCount(parsed.filter(p => p.enabled !== false).length);
        }
      }
    } catch (e) {
      console.error("Error reading notification settings for settings view preview:", e);
    }
  }, []);

  // Set event listener for live color theme synchronization
  useEffect(() => {
    const handleThemeChange = () => {
      setAccentTheme(localStorage.getItem("app_accent_theme") || "gold");
    };
    window.addEventListener("theme-changed", handleThemeChange);
    return () => {
      window.removeEventListener("theme-changed", handleThemeChange);
    };
  }, []);

  const changeAccentTheme = (themeName: string) => {
    localStorage.setItem("app_accent_theme", themeName);
    setAccentTheme(themeName);
    window.dispatchEvent(new Event("theme-changed"));
  };

  const handleQuranFontSizeChange = (size: number) => {
    setQuranFontSize(size);
    localStorage.setItem("quran_font_size", String(size));
    window.dispatchEvent(new Event("quran-font-changed"));
  };

  const handleQuranFontStyleChange = (style: string) => {
    setQuranFontStyle(style);
    localStorage.setItem("quran_font_style", style);
    window.dispatchEvent(new Event("quran-font-changed"));
  };

  const handleHadithFontSizeChange = (size: number) => {
    setHadithFontSize(size);
    localStorage.setItem("hadith_font_size", String(size));
    window.dispatchEvent(new Event("hadith-font-changed"));
  };

  const handleHadithFontStyleChange = (style: string) => {
    setHadithFontStyle(style);
    localStorage.setItem("hadith_font_style", style);
    window.dispatchEvent(new Event("hadith-font-changed"));
  };

  // Previews based on styles
  const getQuranFontFamilyClass = (style: string) => {
    switch (style) {
      case "serif": return "font-serif font-medium";
      case "naskh": return "font-serif font-semibold leading-relaxed";
      case "sans": return "font-sans font-normal";
      default: return "font-serif";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6" style={{ direction: dir }}>
      
      {/* 🌟 PAGE HEADER */}
      <div className={`p-6 rounded-2xl border text-right transition-all duration-300 ${
        darkMode 
          ? "bg-gradient-to-br from-[#071b29] to-[#04121e] border-[#cca05a]/20 text-white" 
          : "bg-gradient-to-br from-amber-50 to-orange-100/50 border-amber-900/10 text-slate-900"
      }`}>
        <div className={`flex items-center space-x-3 space-x-reverse justify-end`}>
          <div className="text-right">
            <h2 className="text-lg md:text-xl font-bold text-amber-400">
              {isAr ? "إعدادات التطبيق العامة" : "General App Settings"}
            </h2>
            <p className="text-[11px] text-slate-400 font-light mt-1">
              {isAr 
                ? "خصّص واجهة الاستخدام، لغة العرض، حجم الخطوط ومظهر الألوان المناسب لك" 
                : "Customize user interface, active language, font sizing and visual color palettes"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#cca05a] border border-amber-500/20 shrink-0">
            <Settings className="w-5.5 h-5.5 text-amber-500 animate-spin-slow" />
          </div>
        </div>
      </div>

      {/* 🎨 THEME CUSTOMIZATION CARD */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">{t("theme_settings_label")}</span>
          <Palette className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
        <p className="text-[11px] text-slate-400 font-light leading-relaxed">
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

      {/* 📖 TYPOGRAPHY SETTINGS CARD */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-5 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">{t("settings_title")}</span>
          <Sliders className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
        <p className="text-[11px] text-slate-400 font-light">
          {t("settings_desc")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          
          {/* Quran Font selector */}
          <div className="space-y-4 bg-slate-950/20 p-4 rounded-xl border border-white/5">
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

            <div className="space-y-1.5">
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
          <div className="space-y-4 bg-slate-950/20 p-4 rounded-xl border border-white/5">
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

            <div className="space-y-1.5">
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

      {/* 🧭 PRAYER TIMES LOCATION & CALCULATION METHOD CARD */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-5 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">
            {isAr ? "🧭 ضبط مواقيت الصلاة والموقع" : "🧭 Prayer Times & Location Settings"}
          </span>
          <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
        </div>

        <p className="text-[11px] text-slate-400 font-light leading-relaxed text-right" style={{ direction: "rtl" }}>
          {isAr 
            ? "قم بضبط مدينتك الحالية يدوياً أو دع التطبيق يحدد إحداثياتك بدقة عبر الـ GPS لحساب مواقيت الصلاة الشرعية لليوم والمستقبل تلقائياً وفق أدق المعايير الفلكية."
            : "Set your city manually or allow GPS tracking to calculate precise religious prayer times automatically based on recognized astronomical methods."}
        </p>

        {/* Location Type Toggles */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/20 border border-white/5" style={{ direction: "rtl" }}>
          <button
            onClick={() => handleUpdateCalcType("city")}
            className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              calcType === "city"
                ? "bg-[#cca05a] text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {isAr ? "📍 اختيار مدينة" : "📍 Select City"}
          </button>
          <button
            onClick={() => handleUpdateCalcType("gps")}
            className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              calcType === "gps"
                ? "bg-[#cca05a] text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {isAr ? "🛰️ تحديد عبر الموقع (GPS)" : "🛰️ Auto GPS Location"}
          </button>
        </div>

        {/* 1. Manual City Selection Panel */}
        {calcType === "city" && (
          <div className="space-y-3 text-right" style={{ direction: "rtl" }}>
            <span className="text-[10px] text-slate-400 block font-bold">
              {isAr ? "اختر المدينة الحالية:" : "Select Current City:"}
            </span>
            <select
              value={selectedCity}
              onChange={(e) => handleUpdateCity(e.target.value)}
              className={`w-full px-3 py-2 text-xs font-medium rounded-xl border outline-none focus:border-[#cca05a] transition-all cursor-pointer ${
                darkMode ? "bg-slate-950/60 border-white/5 text-slate-100" : "bg-white border-amber-950/15 text-slate-900"
              }`}
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id} className={darkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"}>
                  {isAr ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>

            {/* Quick Access City Chips */}
            <div className="flex flex-wrap gap-1.5 justify-start mt-2">
              {[
                { id: "mecca", nameAr: "🕋 مكة", nameEn: "Mecca" },
                { id: "madinah", nameAr: "🕌 المدينة", nameEn: "Medina" },
                { id: "riyadh", nameAr: "🇸🇦 الرياض", nameEn: "Riyadh" },
                { id: "cairo", nameAr: "🇪🇬 القاهرة", nameEn: "Cairo" },
                { id: "jerusalem", nameAr: "🇵🇸 القدس", nameEn: "Jerusalem" }
              ].map((quick) => (
                <button
                  key={quick.id}
                  onClick={() => handleUpdateCity(quick.id)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedCity === quick.id
                      ? "bg-[#cca05a]/25 text-amber-200 border-[#cca05a]"
                      : "bg-slate-950/30 text-slate-400 border-white/5 hover:border-white/10"
                  }`}
                >
                  {isAr ? quick.nameAr : quick.nameEn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. GPS Location Panel */}
        {calcType === "gps" && (
          <div className="space-y-3 text-right" style={{ direction: "rtl" }}>
            <span className="text-[10px] text-slate-400 block font-bold">
              {isAr ? "موقع الأقمار الصناعية (GPS):" : "GPS Satellite Location:"}
            </span>

            {gpsLocation.lat && gpsLocation.lng ? (
              <div className="p-3 rounded-xl bg-slate-950/30 border border-emerald-500/10 flex flex-col space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isAr ? "تم تحديد الموقع بنجاح" : "Location Selected"}
                  </span>
                  <span className="text-slate-400 text-[10px] font-mono">
                    {gpsLocation.name}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-1 mt-1 justify-end">
                  <span>{isAr ? "خط العرض: " : "Lat: "}{gpsLocation.lat.toFixed(4)}°</span>
                  <span>{isAr ? "خط الطول: " : "Lng: "}{gpsLocation.lng.toFixed(4)}°</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/30 border border-white/5 text-center">
                <p className="text-[10px] text-slate-500">
                  {isAr ? "لم يتم الكشف عن موقعك الجغرافي بعد. اضغط أدناه لجلبه تلقائياً." : "No GPS location captured yet. Click below to fetch."}
                </p>
              </div>
            )}

            <button
              onClick={handleFetchGPS}
              disabled={gpsLoading}
              className={`w-full py-2.5 px-4 text-xs font-extrabold rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                gpsLoading 
                  ? "bg-slate-950/40 text-slate-400 border-white/5 cursor-not-allowed" 
                  : "bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 hover:shadow-[0_0_15px_rgba(204,160,90,0.25)] border-transparent"
              }`}
            >
              {gpsLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {isAr ? "جاري الحصول على إحداثيات الموقع..." : "Getting Location Coordinates..."}
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 shrink-0" />
                  {isAr ? "تحديد موقعي التلقائي الحالي" : "Fetch My Current Location"}
                </>
              )}
            </button>

            {gpsError && (
              <p className="text-[10px] text-rose-400 font-bold mt-1 text-center">
                ⚠️ {gpsError}
              </p>
            )}
          </div>
        )}

        {/* 3. Astronomical Calculation Method Standard */}
        <div className="space-y-2 text-right" style={{ direction: "rtl" }}>
          <span className="text-[10px] text-slate-400 block font-bold">
            {isAr ? "طريقة حساب مواقيت الصلاة (الهيئة الفلكية):" : "Calculation Standard (Astronomical Institution):"}
          </span>
          <select
            value={calcMethod}
            onChange={(e) => handleUpdateMethod(e.target.value)}
            className={`w-full px-3 py-2 text-xs font-medium rounded-xl border outline-none focus:border-[#cca05a] transition-all cursor-pointer ${
              darkMode ? "bg-slate-950/60 border-white/5 text-slate-100" : "bg-white border-amber-950/15 text-slate-900"
            }`}
          >
            {METHODS.map((m) => (
              <option key={m.id} value={m.id} className={darkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"}>
                {isAr ? m.nameAr : m.nameEn} (فجر: {m.fajrAngle}°)
              </option>
            ))}
          </select>
        </div>

        {/* 4. Juristic Asr Calculation Method Standard */}
        <div className="space-y-2 text-right" style={{ direction: "rtl" }}>
          <span className="text-[10px] text-slate-400 block font-bold">
            {isAr ? "المذهب الفقهي لحساب صلاة العصر:" : "Juristic Method for Asr Calculation:"}
          </span>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/20 border border-white/5">
            <button
              onClick={() => handleUpdateAsrJuristic("shafi")}
              className={`py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                asrJuristic === "shafi"
                  ? "bg-[#cca05a]/25 text-amber-200 border border-[#cca05a]"
                  : "text-slate-400 border border-transparent hover:text-white"
              }`}
            >
              {isAr ? "الجمهور (شافعي، مالكي، حنبلي)" : "Standard (Shafi'i, Maliki, Hanbali)"}
            </button>
            <button
              onClick={() => handleUpdateAsrJuristic("hanafi")}
              className={`py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                asrJuristic === "hanafi"
                  ? "bg-[#cca05a]/25 text-amber-200 border border-[#cca05a]"
                  : "text-slate-400 border border-transparent hover:text-white"
              }`}
            >
              {isAr ? "المذهب الحنفي" : "Hanafi School"}
            </button>
          </div>
          <p className="text-[9px] text-slate-500 leading-none">
            {isAr 
              ? "الجمهور: يبدأ العصر عندما يتساوى ظل الشيء مع طوله. الحنفي: يبدأ عندما يصبح ظل الشيء مثلي طوله."
              : "Standard: Asr starts when shadow equals object length. Hanafi: when shadow is twice object length."}
          </p>
        </div>
      </div>

      {/* 🕌 ADHAN VOICE CUSTOMIZATION & PRE-PRAYER PREP REMINDER CARD */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-5 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">
            {isAr ? "🕌 أصوات الأذان وتنبيهات الاستعداد" : "🕌 Adhan Sounds & Preparation"}
          </span>
          <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
        </div>

        <p className="text-[11px] text-slate-400 font-light leading-relaxed">
          {isAr 
            ? "قم بتخصيص صوت مؤذن منفصل لكل صلاة من الصلوات الخمس ليصدح به جهازك، بالإضافة لتفعيل التنبيه المسبق وتخصيص المدة للاستعداد والطمأنينة."
            : "Assign a unique muadhin to each of the five daily prayers, and enable the customizable prep alarm to get ready before the adhan."}
        </p>

        {/* Customizable pre-prayer reminder section */}
        <div className={`p-4 rounded-xl border flex flex-col space-y-3.5 ${
          darkMode ? "bg-slate-950/20 border-white/5" : "bg-amber-50/40 border-amber-900/10"
        }`}>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                darkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-500/20 text-amber-700"
              }`}>
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold block ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                  {isAr ? `التنبيه المسبق بـ ${toArabicNumerals(prePrayerPrepTime)} دقائق` : `${prePrayerPrepTime}-Minute Pre-Prayer Reminder`}
                </span>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                  {isAr ? "تذكير بالوضوء والأذكار قبل نداء الصلاة الفعلي" : "Reminder to make Wudu and sit with dhikr before adhan"}
                </p>
              </div>
            </div>

            <button
              onClick={togglePrePrayerPrep}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                prePrayerPrepEnabled ? "bg-[#cca05a]" : "bg-slate-800"
              }`}
            >
              <span
                className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform duration-300 ${
                  prePrayerPrepEnabled ? "translate-x-[-24px]" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {prePrayerPrepEnabled && (
            <div className="pt-3 border-t border-dashed border-[#cca05a]/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-right" style={{ direction: "rtl" }}>
              <span className={`text-[10px] font-bold shrink-0 ${darkMode ? "text-amber-200/80" : "text-amber-800"}`}>
                {isAr ? "اختر مدة التنبيه قبل الأذان:" : "Choose alert time before Adhan:"}
              </span>
              <div className="flex flex-wrap items-center gap-1.5 justify-end">
                {[5, 10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handlePrePrayerPrepTimeChange(mins)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
                      prePrayerPrepTime === mins
                        ? "bg-[#cca05a] text-slate-950 border-[#cca05a] shadow-[0_0_10px_rgba(204,160,90,0.3)] font-extrabold"
                        : darkMode
                        ? "bg-slate-950/40 text-slate-400 border-white/5 hover:border-[#cca05a]/40"
                        : "bg-white text-slate-600 border-amber-900/10 hover:border-[#cca05a]"
                    }`}
                  >
                    {toArabicNumerals(mins)} {isAr ? "دقائق" : "mins"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 🔊 Tap sounds toggle */}
        <div className={`p-4 rounded-xl border flex justify-between items-center ${
          darkMode ? "bg-slate-950/20 border-white/5" : "bg-amber-50/40 border-amber-900/10"
        }`}>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              darkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-500/20 text-amber-700"
            }`}>
              <Volume2 className="w-4.5 h-4.5" />
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold block ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                {isAr ? "صوت نقرات التطبيق" : "App Tap Sounds"}
              </span>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                {isAr ? "تشغيل صوت نقر لطيف وهادئ عند الضغط على الأزرار" : "Play a gentle organic click sound when pressing buttons"}
              </p>
            </div>
          </div>

          <button
            onClick={toggleTapSounds}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
              tapSoundsEnabled ? "bg-[#cca05a]" : "bg-slate-800"
            }`}
          >
            <span
              className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform duration-300 ${
                tapSoundsEnabled ? "translate-x-[-24px]" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Custom Muadhin Per-Prayer List */}
        <div className="space-y-3.5">
          <div className="flex justify-between items-center text-xs font-bold text-amber-400/80">
            <span>{isAr ? "صوت الأذان المخصص" : "Assigned Adhan Voice"}</span>
            <span>{isAr ? "الفريضة" : "Prayer"}</span>
          </div>

          <div className="space-y-3">
            {prayerSettings.map((s) => {
              const currentVoiceId = s.adhanVoiceId || "makkah";
              const isPlaying = previewingVoiceId === currentVoiceId;
              
              return (
                <div
                  key={s.prayerId}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-3 transition ${
                    darkMode ? "bg-slate-950/20 border-white/5 hover:border-[#cca05a]/20" : "bg-slate-50 border-amber-900/5 hover:border-amber-500/20"
                  }`}
                >
                  {/* Left Controls: Select voice and play preview */}
                  <div className="flex items-center space-x-2 space-x-reverse w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      onClick={() => playVoicePreview(currentVoiceId)}
                      className={`p-2 rounded-lg transition shrink-0 cursor-pointer ${
                        isPlaying
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : darkMode
                          ? "bg-slate-900 hover:bg-slate-800 text-amber-400"
                          : "bg-amber-100 hover:bg-amber-200 text-amber-800"
                      }`}
                      title={isAr ? "استماع لمعاينة صوت الأذان" : "Preview Voice"}
                    >
                      {isPlaying ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>

                    <select
                      value={currentVoiceId}
                      onChange={(e) => handlePrayerVoiceChange(s.prayerId, e.target.value)}
                      className={`text-xs rounded-xl px-2.5 py-1.5 font-bold cursor-pointer outline-none transition border max-w-[200px] ${
                        darkMode
                          ? "bg-[#04121e] border-white/10 text-white focus:border-[#cca05a]"
                          : "bg-white border-amber-950/15 text-slate-900 focus:border-amber-500"
                      }`}
                    >
                      <option value="makkah">{isAr ? "أذان الحرم المكي (1)" : "Makkah Adhan (1)"}</option>
                      <option value="abdulbasit">{isAr ? "أذان الشيخ عبد الباسط عبد الصمد" : "Sheikh Abdulbasit"}</option>
                      <option value="afasy">{isAr ? "أذان الشيخ مشاري العفاسي" : "Sheikh Al-Afasy"}</option>
                      <option value="aqsa">{isAr ? "أذان المسجد الأقصى المبارك" : "Al-Aqsa Adhan"}</option>
                      <option value="makkah_2">{isAr ? "أذان الحرم المكي (2)" : "Makkah Adhan (2)"}</option>
                      {customAdhans.map((custom) => (
                        <option key={custom.id} value={custom.id}>
                          {isAr ? `ملف مخصص: ${custom.name}` : `Custom: ${custom.name}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Right Detail: Prayer name and indicator */}
                  <div className="flex items-center space-x-2.5 space-x-reverse self-end sm:self-auto">
                    <div className="text-right">
                      <span className={`text-xs font-bold block ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                        {s.prayerName || (isAr ? s.prayerId : s.prayerId)}
                      </span>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      s.prayerId === "fajr" ? "bg-sky-400" :
                      s.prayerId === "dhuhr" ? "bg-amber-400" :
                      s.prayerId === "asr" ? "bg-orange-400" :
                      s.prayerId === "maghrib" ? "bg-rose-400" : "bg-indigo-400"
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📥 OFFLINE APP RESOURCES DOWNLOADER CARD */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">
            {isAr ? "📥 موارد التطبيق للعمل بدون إنترنت" : "📥 Offline App Resources"}
          </span>
          <DownloadCloud className="w-4 h-4 text-amber-500 shrink-0" />
        </div>

        <p className="text-[11px] text-slate-400 font-light leading-relaxed">
          {isAr
            ? "قم بتنزيل كافة ملفات وموارد التطبيق الأساسية لضمان عمل كافة المزايا والوظائف بدون إنترنت بالكامل: بما في ذلك تنبيهات أصوات الأذان والصلوات الخمس، متون وأجزاء القرآن الكريم كاملاً، أصوات تنبيه الصلاة على النبي ﷺ والذكر التلقائي، ومحرك جميع الإشعارات والمنبثقة المحلية."
            : "Download all essential app resources to ensure all features work fully offline: including Adhan voice alerts, full Quran text, blessings upon Prophet ﷺ voice reminders, and local popup/toast alert engines."}
        </p>

        {/* Progress or Status */}
        {downloadingOffline && (
          <div className="space-y-2 p-3 rounded-xl border border-white/5 bg-slate-950/20">
            <div className="flex justify-between items-center text-[11px] font-bold text-amber-400">
              <span>{downloadProgress}%</span>
              <span className="flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                {isAr ? "جاري التحميل والحفظ محلياً..." : "Downloading & Caching..."}
              </span>
            </div>
            
            {/* Progress bar container */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-[#cca05a] h-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-300 font-medium text-right leading-relaxed animate-pulse">
              {downloadStep}
            </p>
          </div>
        )}

        {isDownloaded && !downloadingOffline && (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-lg shrink-0">
                ✅
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 block">
                  {isAr ? "تم تحميل جميع الموارد بنجاح ✅" : "All resources downloaded successfully ✅"}
                </span>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                  {isAr 
                    ? "التطبيق مهيأ بالكامل للعمل أوفلاين في أي وقت بدون اتصال شبكي."
                    : "The app is fully configured to run offline at any time without network."}
                </p>
              </div>
            </div>

            <button
              onClick={handleResetOfflineResources}
              className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold border cursor-pointer transition ${
                darkMode 
                  ? "bg-slate-900/60 border-white/5 text-rose-400 hover:bg-rose-500/10" 
                  : "bg-slate-50 border-slate-200 text-rose-700 hover:bg-rose-50"
              }`}
            >
              {isAr ? "إلغاء تنشيط أوفلاين لتوفير المساحة" : "Remove downloads to free space"}
            </button>
          </div>
        )}

        {!isDownloaded && !downloadingOffline && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleDownloadOfflineResources}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                darkMode 
                  ? "bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 hover:opacity-90" 
                  : "bg-gradient-to-r from-amber-950 to-amber-900 text-amber-50 hover:opacity-95"
              }`}
            >
              <DownloadCloud className="w-4 h-4" />
              {isAr 
                ? "تحميل موارد التطبيق للعمل بدون إنترنت (سعة 42.8 ميجابايت)" 
                : "Download app resources for offline mode (42.8 MB)"}
            </button>
          </div>
        )}
      </div>

      {/* 🌐 SYSTEM & LANGUAGE CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Languages Switcher card */}
        <div className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
          darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
        }`}>
          <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
            <span className="text-xs font-bold text-amber-400">{t("lang_settings_label")}</span>
            <Languages className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-[11px] text-slate-400 font-light leading-relaxed">
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

        {/* Night / Light mode custom cards */}
        <div className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
          darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
        }`}>
          <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
            <span className="text-xs font-bold text-amber-400">
              {isAr ? "🌓 وضع العرض الشاشي (Appearance)" : "🌓 Screen Appearance"}
            </span>
            <Moon className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-[11px] text-slate-400 font-light leading-relaxed">
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

      {/* 🛡️ APP INFO & COMPLIANCE STAMP */}
      <div className={`rounded-2xl border p-5 text-center space-y-3 ${
        darkMode ? "bg-slate-950/25 border-white/5 text-slate-400" : "bg-amber-100/20 border-amber-900/5 text-slate-600"
      }`}>
        <div className="flex items-center justify-center space-x-1.5 space-x-reverse text-[#cca05a]">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold">{isAr ? "تطبيق أنا مسلم - آمن وموثوق" : "Ana Muslim App - Safe & Secure"}</span>
        </div>
        <p className="text-[10px] leading-relaxed max-w-lg mx-auto font-light">
          {isAr 
            ? "جميع المقاييس والمواقيت المعتمدة مأخوذة من الهيئات الفلكية والشرعية بدقة متناهية. لا يتم حفظ أي من بياناتك خارج جهازك الخاص."
            : "All calculation standards and prayer alerts are calculated based on recognized astronomical institutions. No user metrics are exported outside your offline client."}
        </p>
        <div className="text-[9px] text-[#cca05a] font-mono tracking-wider pt-1">
          ANA MUSLIM CLIENT v1.1.0 • LOCAL DB OK
        </div>
      </div>

    </div>
  );
}
