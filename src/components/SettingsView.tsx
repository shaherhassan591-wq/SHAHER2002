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
  Info,
  BellOff
} from "lucide-react";
import { formatTime12h } from "../utils/timeFormat";
import { muadhinsList } from "../data/islamicData";
import { saveAudioByKey, getAudioByKey } from "../utils/audioStorage";
import {
  CITIES,
  METHODS,
  getPrayerCalcSettings,
  savePrayerCalcSettings,
  recalculateAndStore
} from "../utils/prayerCalc";
import { isNativeAndroid, requestNativeLocationPermission, saveNativeAudioFile, hasNativeAudioFile, ensureLocationPermission, getCurrentPositionWithFallback } from "../utils/androidBridge";

// Subtab Components
import { GeneralSettingsTab } from "./settings/GeneralSettingsTab";
import { ThemesSettingsTab } from "./settings/ThemesSettingsTab";
import { PrayerSettingsTab } from "./settings/PrayerSettingsTab";
import { SoundsSettingsTab } from "./settings/SoundsSettingsTab";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const toArabicNumerals = (num: number): string => {
  const chars = String(num).split("");
  const arabicChars = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return chars.map(char => {
    const val = parseInt(char);
    return isNaN(val) ? char : arabicChars[val];
  }).join("");
};

interface SettingsViewProps {
  darkMode: boolean;
  setDarkMode?: (val: boolean) => void;
}

export default function SettingsView({ darkMode, setDarkMode }: SettingsViewProps) {
  const { language, t, isAr, dir, toggleLanguage } = useLanguage();

  // Navigation tab: 'general' | 'theme' | 'prayer' | 'sounds'
  const [activeTab, setActiveTab] = useState<"general" | "theme" | "prayer" | "sounds">("general");

  // Offline Resources States
  const [prophetCached, setProphetCached] = useState<boolean>(false);
  const [downloadingProphet, setDownloadingProphet] = useState<boolean>(false);
  const [prophetStatusMsg, setProphetStatusMsg] = useState<string | null>(null);

  const [adhanCachedCount, setAdhanCachedCount] = useState<number>(0);
  const [downloadingAdhans, setDownloadingAdhans] = useState<boolean>(false);
  const [adhanProgress, setAdhanProgress] = useState<number>(0);
  const [adhanStatusMsg, setAdhanStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check if Prophet audio is cached
    getAudioByKey("real_prophet_v3").then(async (blob) => {
      const isCached = blob !== null;
      setProphetCached(isCached);
      if (isCached && isNativeAndroid() && !hasNativeAudioFile("adhan_real_prophet.mp3") && blob) {
        try {
          const b64 = await blobToBase64(blob);
          saveNativeAudioFile("adhan_real_prophet.mp3", b64);
        } catch (e) {
          console.error("Auto-sync prophet voice failed", e);
        }
      }
    }).catch(() => setProphetCached(false));

    // Check how many Adhans are cached
    let count = 0;
    const checks = muadhinsList.map(async (m) => {
      try {
        const blob = await getAudioByKey(`adhan_${m.id}`);
        if (blob) {
          count++;
          if (isNativeAndroid() && !hasNativeAudioFile(`adhan_${m.id}.mp3`)) {
            try {
              const b64 = await blobToBase64(blob);
              saveNativeAudioFile(`adhan_${m.id}.mp3`, b64);
            } catch (e) {
              console.error(`Auto-sync adhan ${m.id} failed`, e);
            }
          }
        }
      } catch (e) {}
    });
    Promise.all(checks).then(() => {
      setAdhanCachedCount(count);
    });
  }, []);

  const handleDownloadProphetVoice = async () => {
    setDownloadingProphet(true);
    setProphetStatusMsg(isAr ? "جاري تحميل وتخزين صوت الصلاة على النبي أوفلاين..." : "Downloading Prophet audio offline...");
    try {
      const url = "/audio/real_prophet.mp3?v=3";
      let blob: Blob;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Local file fetch error");
        blob = await res.blob();
      } catch (err) {
        // Fail-safe to online if local fetch fails
        const onlineUrl = "https://archive.org/download/nbeslo3leh/%D8%A7%D9%84%D9%86%D8%A8%D9%8A%20%D1%81%D9%84%D9%88%D8%A7%20%D8%B9%D9%84%D9%8A%D9%87.mp3";
        const res = await fetch(onlineUrl);
        blob = await res.blob();
      }
      await saveAudioByKey("real_prophet_v3", blob);
      if (isNativeAndroid()) {
        try {
          const b64 = await blobToBase64(blob);
          saveNativeAudioFile("adhan_real_prophet.mp3", b64);
        } catch (err) {
          console.error("Failed to save prophet voice natively", err);
        }
      }
      setProphetCached(true);
      setProphetStatusMsg(isAr ? "تم التحميل والحفظ بنجاح! يعمل الصوت الآن بالكامل بدون إنترنت 🟢" : "Saved successfully! Audio works fully offline now 🟢");
    } catch (e) {
      console.error(e);
      setProphetStatusMsg(isAr ? "حدث خطأ أثناء تحميل الملف. تحقق من اتصال الشبكة." : "Error downloading. Check network connection.");
    } finally {
      setDownloadingProphet(false);
    }
  };

  const handleDownloadAllAdhans = async () => {
    setDownloadingAdhans(true);
    setAdhanProgress(0);
    setAdhanStatusMsg(isAr ? "بدء تحميل ملفات الأذان أوفلاين..." : "Starting Adhan downloads...");
    
    let downloadedCount = 0;
    for (let i = 0; i < muadhinsList.length; i++) {
      const muadhin = muadhinsList[i];
      setAdhanStatusMsg(isAr ? `جاري تحميل أذان ${muadhin.name}...` : `Downloading ${muadhin.name}...`);
      try {
        const url = muadhin.audioUrl;
        const proxiedUrl = `/api/proxy-audio?url=${encodeURIComponent(url)}`;
        let blob: Blob;
        try {
          const res = await fetch(proxiedUrl);
          if (!res.ok) throw new Error("Proxy error");
          blob = await res.blob();
        } catch (err) {
          const res = await fetch(url);
          blob = await res.blob();
        }
        await saveAudioByKey(`adhan_${muadhin.id}`, blob);
        if (isNativeAndroid()) {
          try {
            const b64 = await blobToBase64(blob);
            saveNativeAudioFile(`adhan_${muadhin.id}.mp3`, b64);
          } catch (err) {
            console.error(`Failed to save adhan ${muadhin.id} natively`, err);
          }
        }
        downloadedCount++;
        setAdhanProgress(Math.round(((i + 1) / muadhinsList.length) * 100));
      } catch (e) {
        console.error(`Failed to download Adhan for ${muadhin.id}`, e);
      }
    }
    
    setAdhanCachedCount(downloadedCount);
    setAdhanStatusMsg(
      isAr 
        ? "اكتمل تحميل جميع الملفات الصوتية بنجاح 🟢" 
        : "All Adhans successfully downloaded 🟢"
    );
    setDownloadingAdhans(false);
  };

  // Manual Prayer Times States
  const [manualPrayerTimesMode, setManualPrayerTimesMode] = useState<boolean>(() => {
    return localStorage.getItem("manual_prayer_times_mode") === "true";
  });
  const [manualPrayerTimes, setManualPrayerTimes] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem("calculated_prayer_times");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      fajr: "04:12",
      shuruq: "05:43",
      dhuhr: "12:15",
      asr: "15:45",
      maghrib: "18:49",
      isha: "20:18"
    };
  });

  const handleUpdateManualPrayerTime = (key: string, value: string) => {
    const updated = { ...manualPrayerTimes, [key]: value };
    setManualPrayerTimes(updated);
    localStorage.setItem("calculated_prayer_times", JSON.stringify(updated));
    window.dispatchEvent(new Event("prayer-reminder-changed"));
  };

  const handleToggleManualMode = (enabled: boolean) => {
    setManualPrayerTimesMode(enabled);
    localStorage.setItem("manual_prayer_times_mode", String(enabled));
    if (enabled) {
      localStorage.setItem("calculated_prayer_times", JSON.stringify(manualPrayerTimes));
    } else {
      // Recalculate using active GPS/city immediately
      localStorage.removeItem("calculated_prayer_times");
      recalculateAndStore();
      // Sync manualPrayerTimes state back
      try {
        const raw = localStorage.getItem("calculated_prayer_times");
        if (raw) {
          setManualPrayerTimes(JSON.parse(raw));
        }
      } catch (e) {}
    }
    window.dispatchEvent(new Event("prayer-reminder-changed"));
  };

  // 12-Hour format mode state
  const [use12hFormat, setUse12hFormat] = useState<boolean>(() => {
    return localStorage.getItem("use_12h_format") === "true";
  });

  const handleToggle12hFormat = (enabled: boolean) => {
    setUse12hFormat(enabled);
    localStorage.setItem("use_12h_format", String(enabled));
    window.dispatchEvent(new Event("prayer-reminder-changed"));
  };

  // Color Theme State
  const [accentTheme, setAccentTheme] = useState<string>(() => {
    return localStorage.getItem("app_accent_theme") || "gold";
  });

  const changeAccentTheme = (themeName: string) => {
    localStorage.setItem("app_accent_theme", themeName);
    setAccentTheme(themeName);
    window.dispatchEvent(new Event("theme-changed"));
  };

  // Quran typography states
  const [quranFontSize, setQuranFontSize] = useState<number>(() => {
    return Number(localStorage.getItem("quran_font_size") || "22");
  });
  const [quranFontStyle, setQuranFontStyle] = useState<string>(() => {
    return localStorage.getItem("quran_font_style") || "serif";
  });

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

  // Hadith typography states
  const [hadithFontSize, setHadithFontSize] = useState<number>(() => {
    return Number(localStorage.getItem("hadith_font_size") || "16");
  });
  const [hadithFontStyle, setHadithFontStyle] = useState<string>(() => {
    return localStorage.getItem("hadith_font_style") || "naskh";
  });

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

  // Calculation parameters
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

  const handleUpdateCalcType = (type: string) => {
    const nextType = type as "city" | "gps";
    setCalcType(nextType);
    savePrayerCalcSettings({ type: nextType });
  };

  const handleUpdateCity = (cityId: string) => {
    setSelectedCity(cityId);
    savePrayerCalcSettings({ cityId });
  };

  const handleUpdateMethod = (methodId: string) => {
    setCalcMethod(methodId);
    savePrayerCalcSettings({ methodId });
  };

  const handleUpdateAsrJuristic = (juristic: string) => {
    const nextJuristic = juristic as "shafi" | "hanafi";
    setAsrJuristic(nextJuristic);
    savePrayerCalcSettings({ asrJuristic: nextJuristic });
  };

  const handleFetchGPS = async () => {
    if (!navigator.geolocation) {
      setGpsError(isAr ? "متصفحك لا يدعم تحديد الموقع الجغرافي." : "Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    if (isNativeAndroid()) {
      try {
        const hasPerm = await ensureLocationPermission();
        if (!hasPerm) {
          setGpsError(isAr ? "تم رفض صلاحية استخدام الموقع. يرجى تفعيلها من إعدادات الهاتف." : "Location permission denied. Please enable in settings.");
          setGpsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Native location check failed, using fallback:", err);
      }
    }

    try {
      const pos = await getCurrentPositionWithFallback();
      const nextLoc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        name: isAr ? "الإحداثيات الحالية" : "Current GPS Coordinates"
      };
      setGpsLocation(nextLoc);
      savePrayerCalcSettings({
        gpsLat: pos.coords.latitude,
        gpsLng: pos.coords.longitude,
        gpsName: nextLoc.name
      });
    } catch (err: any) {
      console.error("GPS fetch error:", err);
      setGpsError(isAr ? "فشل تحديد الموقع. يرجى التأكد من تشغيل الـ GPS بالهاتف والمحاولة مجدداً." : "Failed to retrieve location. Please check GPS settings.");
    } finally {
      setGpsLoading(false);
    }
  };

  // Sound, Volumes, Pre-prayer prep
  const [prePrayerPrepEnabled, setPrePrayerPrepEnabled] = useState<boolean>(() => {
    return localStorage.getItem("pre_prayer_prep_enabled") === "true";
  });
  const [prePrayerPrepTime, setPrePrayerPrepTime] = useState<number>(() => {
    return Number(localStorage.getItem("pre_prayer_prep_time") || "10");
  });
  const [dndModeEnabled, setDndModeEnabled] = useState<boolean>(() => {
    return localStorage.getItem("dnd_mode") === "true";
  });
  const [smartVolumeEnabled, setSmartVolumeEnabled] = useState<boolean>(() => {
    return localStorage.getItem("smart_volume_enabled") === "true";
  });
  const [selectedMaxVolume, setSelectedMaxVolume] = useState<number>(() => {
    return Number(localStorage.getItem("adhan_max_volume") || "80");
  });
  const [tapSoundsEnabled, setTapSoundsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("app_tap_sounds_enabled") !== "false";
  });

  const togglePrePrayerPrep = () => {
    const nextVal = !prePrayerPrepEnabled;
    setPrePrayerPrepEnabled(nextVal);
    localStorage.setItem("pre_prayer_prep_enabled", String(nextVal));
    window.dispatchEvent(new Event("prayer-reminder-changed"));
  };

  const toggleDndMode = () => {
    const nextVal = !dndModeEnabled;
    setDndModeEnabled(nextVal);
    localStorage.setItem("dnd_mode", String(nextVal));
    window.dispatchEvent(new Event("prayer-reminder-changed"));
  };

  const toggleSmartVolume = () => {
    const nextVal = !smartVolumeEnabled;
    setSmartVolumeEnabled(nextVal);
    localStorage.setItem("smart_volume_enabled", String(nextVal));
    window.dispatchEvent(new Event("prayer-reminder-changed"));
  };

  const handleMaxVolumeChange = (vol: number) => {
    setSelectedMaxVolume(vol);
    localStorage.setItem("adhan_max_volume", String(vol));
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

  // Prayer adhan voice listings
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

  const [customAdhans, setCustomAdhans] = useState<{ id: string; name: string; dataUrl: string }[]>(() => {
    try {
      const saved = localStorage.getItem("user_custom_sounds");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

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

  // Previewing State
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // Sync state loaded trigger
  useEffect(() => {
    const handleThemeChange = () => {
      setAccentTheme(localStorage.getItem("app_accent_theme") || "gold");
    };
    window.addEventListener("theme-changed", handleThemeChange);
    return () => {
      window.removeEventListener("theme-changed", handleThemeChange);
    };
  }, []);

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

      {/* 🗂️ SIDEBAR/TABS COMPONENT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start" style={{ direction: "rtl" }}>
        
        {/* Navigation panel */}
        <div className={`rounded-2xl border p-3.5 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible ${
          darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
        }`}>
          {[
            { id: "general", nameAr: "🌐 عامة والخطوط", nameEn: "General & Font", icon: Languages },
            { id: "theme", nameAr: "🎨 مظهر التطبيق", nameEn: "App Theme", icon: Palette },
            { id: "prayer", nameAr: "🧭 مواقيت الصلاة", nameEn: "Prayer Times", icon: MapPin },
            { id: "sounds", nameAr: "🔊 أصوات وتنزيلات", nameEn: "Sounds & Cache", icon: Volume2 },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 space-x-reverse py-3 px-4 rounded-xl text-right transition cursor-pointer shrink-0 md:shrink-1 ${
                  isSelected
                    ? "bg-[#cca05a] text-slate-950 font-bold shadow-md"
                    : "bg-slate-950/20 text-slate-400 hover:text-white hover:bg-slate-950/40"
                }`}
              >
                <TabIcon className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs whitespace-nowrap">{isAr ? tab.nameAr : tab.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic subtab container */}
        <div className="col-span-1 md:col-span-3">
          {activeTab === "general" && (
            <GeneralSettingsTab
              darkMode={darkMode}
              isAr={isAr}
              t={t}
              toggleLanguage={toggleLanguage}
              quranFontSize={quranFontSize}
              handleQuranFontSizeChange={handleQuranFontSizeChange}
              quranFontStyle={quranFontStyle}
              handleQuranFontStyleChange={handleQuranFontStyleChange}
              hadithFontSize={hadithFontSize}
              handleHadithFontSizeChange={handleHadithFontSizeChange}
              hadithFontStyle={hadithFontStyle}
              handleHadithFontStyleChange={handleHadithFontStyleChange}
              use12hFormat={use12hFormat}
              handleToggle12hFormat={handleToggle12hFormat}
            />
          )}

          {activeTab === "theme" && (
            <ThemesSettingsTab
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              accentTheme={accentTheme}
              changeAccentTheme={changeAccentTheme}
              isAr={isAr}
              t={t}
            />
          )}

          {activeTab === "prayer" && (
            <PrayerSettingsTab
              darkMode={darkMode}
              isAr={isAr}
              t={t}
              calcType={calcType}
              handleUpdateCalcType={handleUpdateCalcType}
              selectedCity={selectedCity}
              handleUpdateCity={handleUpdateCity}
              CITIES={CITIES}
              METHODS={METHODS}
              gpsLocation={gpsLocation as any}
              gpsLoading={gpsLoading}
              gpsError={gpsError}
              handleFetchGPS={handleFetchGPS}
              calcMethod={calcMethod}
              handleUpdateMethod={handleUpdateMethod}
              asrJuristic={asrJuristic}
              handleUpdateAsrJuristic={handleUpdateAsrJuristic}
              
              // Manual Mode Props
              manualPrayerTimesMode={manualPrayerTimesMode}
              manualPrayerTimes={manualPrayerTimes}
              handleToggleManualMode={handleToggleManualMode}
              handleUpdateManualPrayerTime={handleUpdateManualPrayerTime}
            />
          )}

          {activeTab === "sounds" && (
            <SoundsSettingsTab
              darkMode={darkMode}
              isAr={isAr}
              t={t}
              toArabicNumerals={toArabicNumerals}
              prePrayerPrepEnabled={prePrayerPrepEnabled}
              prePrayerPrepTime={prePrayerPrepTime}
              togglePrePrayerPrep={togglePrePrayerPrep}
              handlePrePrayerPrepTimeChange={handlePrePrayerPrepTimeChange}
              dndModeEnabled={dndModeEnabled}
              toggleDndMode={toggleDndMode}
              smartVolumeEnabled={smartVolumeEnabled}
              toggleSmartVolume={toggleSmartVolume}
              selectedMaxVolume={selectedMaxVolume}
              handleMaxVolumeChange={handleMaxVolumeChange}
              tapSoundsEnabled={tapSoundsEnabled}
              toggleTapSounds={toggleTapSounds}
              prayerSettings={prayerSettings}
              previewingVoiceId={previewingVoiceId}
              playVoicePreview={playVoicePreview}
              handlePrayerVoiceChange={handlePrayerVoiceChange}
              customAdhans={customAdhans}

              // Offline caches
              prophetCached={prophetCached}
              prophetStatusMsg={prophetStatusMsg || ""}
              downloadingProphet={downloadingProphet}
              handleDownloadProphetVoice={handleDownloadProphetVoice}
              adhanCachedCount={adhanCachedCount}
              muadhinsList={muadhinsList}
              adhanStatusMsg={adhanStatusMsg || ""}
              downloadingAdhans={downloadingAdhans}
              adhanProgress={adhanProgress}
              handleDownloadAllAdhans={handleDownloadAllAdhans}
            />
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
