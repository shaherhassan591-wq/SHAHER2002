import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { formatTime12h } from "../utils/timeFormat";
import { getCustomAudio, saveCustomAudio, hasCustomAudio, deleteCustomAudio, getAudioByKey } from "../utils/audioStorage";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import {
  Compass,
  Clock,
  MapPin,
  Sparkles,
  Volume2,
  Star,
  VolumeX,
  Moon,
  AlertOctagon,
  Heart,
  Sun,
  Activity,
  Disc,
  X,
  Flame,
  Sliders,
  Settings,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Award,
  Zap,
  Calendar,
  TrendingUp,
  Smartphone,
  Layers,
  Share2,
  Bookmark,
  BookMarked
} from "lucide-react";

const emeraldIcon = "/src/assets/images/quran_icon_emerald_1782407526619.jpg";
const indigoIcon = "/src/assets/images/quran_icon_indigo_1782407540556.jpg";
const amberIcon = "/src/assets/images/quran_icon_amber_1782407550922.jpg";

interface DailyVerse {
  ayah: string;
  surah: string;
  explanation: string;
}

const dailyVerses: DailyVerse[] = [
  {
    ayah: "« فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ »",
    surah: "سورة البقرة • الآية ١٥٢",
    explanation: "وعد إلهي جليل؛ إن ذُكر الله بالطاعة والتسبيح والشكر ذَكرَ العبد بجميل إحسانه ورضاه ودفعه للبلاء ونزول رحمته بروح الطمأنينة الكاملة."
  },
  {
    ayah: "« إِنَّ مَعَ الْعُسْرِ يُسْرًا »",
    surah: "سورة الشرح • الآية ٦",
    explanation: "يقين ربّاني مريح للقلب؛ إنّ كل حزن أو كرب يصحبه يسر حتمي يتخلله، فلا يغلب عسر يسرين. فرّج الله همّ كل مكروب ببركة هذا الوعد الشريف."
  },
  {
    ayah: "« وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ »",
    surah: "سورة الطلاق • الآية ٢-٣",
    explanation: "مفتاح المخارج والرزق؛ التقوى والوعي بمرضاة الله في السر والعلن هما اللذان يفتحان الأقفال المغلقة ويأتيان بالسكينة المعيشية والروحية."
  },
  {
    ayah: "« أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ »",
    surah: "سورة الرعد • الآية ٢٨",
    explanation: "غذاء الأرواح ومستقر السكون؛ ذكر الله ودوام الاتصال بمقام الألوهية يزيلان شتات القلق من النفس ويغسلان غبار الدنيا ببرد اليقين."
  },
  {
    ayah: "« وَقالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ »",
    surah: "سورة غافر • الآية ٦٠",
    explanation: "بصيص الرجاء ومربط العودة؛ الخالق الودود يحث عباده على دعائه واللجوء لفضله، كافلاً لهم الاستجابة الصادقة بما فيه خير دنياهم وآخرتهم."
  }
];

const PROPHET_VOICES = [
  { id: "prophet_voice_1", nameAr: "الصلاة على النبي (زدج - الصوت الأول)", nameEn: "Sallou Alayh (Voice 1)", url: "/audio/prophet_voice_1.mp3" },
  { id: "prophet_voice_2", nameAr: "الصلاة على النبي (زدج - الصوت الثاني)", nameEn: "Sallou Alayh (Voice 2)", url: "/audio/prophet_voice_2.mp3" },
  { id: "custom_voice", nameAr: "📁 ملف صوتي مخصص...", nameEn: "📁 Custom audio file...", url: "" }
];

interface DailyDeed {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  category: "athkar" | "quran" | "sunnah" | "general";
  targetTab?: string;
  points: number;
}

const DAILY_DEEDS: DailyDeed[] = [
  {
    id: "morning_athkar",
    titleAr: "أذكار الصباح",
    titleEn: "Morning Adhkar",
    descAr: "تحصين النفس والبدء بذكر الله عز وجل مع بداية اليوم لتيسير الأمور.",
    descEn: "Protecting yourself and starting the day with remembrance of Allah.",
    category: "athkar",
    targetTab: "athkar",
    points: 15
  },
  {
    id: "evening_athkar",
    titleAr: "أذكار المساء",
    titleEn: "Evening Adhkar",
    descAr: "طمأنينة الروح وحفظها بذكر الله تعالى وتلاوة المعوذات قبل غروب الشمس.",
    descEn: "Tranquility of the soul and protecting it before sunset.",
    category: "athkar",
    targetTab: "athkar",
    points: 15
  },
  {
    id: "read_quran_page",
    titleAr: "قراءة صفحة من القرآن الكريم",
    titleEn: "Read a Page of Holy Quran",
    descAr: "تدبر كلام الله عز وجل بتلاوة صفحة واحدة على الأقل من المصحف الشريف.",
    descEn: "Contemplate the words of Allah by reciting at least one page.",
    category: "quran",
    targetTab: "quran",
    points: 20
  },
  {
    id: "sunnah_prayers",
    titleAr: "صلاة السنن الرواتب",
    titleEn: "Sunnah Rawatib Prayers",
    descAr: "أداء السنن الرواتب التابعة للصلوات الخمس (ركعتان قبل الفجر، ٤ قبل الظهر وركعتان بعدها، ركعتان بعد المغرب، ركعتان بعد العشاء).",
    descEn: "Perform the voluntary Raka'at associated with the 5 daily prayers.",
    category: "sunnah",
    targetTab: "prayerguide",
    points: 25
  },
  {
    id: "witr_prayer",
    titleAr: "صلاة الوتر",
    titleEn: "Witr Prayer",
    descAr: "التقرب إلى الله بركعة أو أكثر ختاماً لصلوات الليل واليوم ليكون آخر صلاتك وتراً.",
    descEn: "Drawing close to Allah with one or more Raka'at ending the night prayers.",
    category: "sunnah",
    targetTab: "prayerguide",
    points: 15
  },
  {
    id: "daily_tasbih",
    titleAr: "الاستغفار والحمد والثناء",
    titleEn: "Daily Tasbih & Forgiveness",
    descAr: "تعطير اللسان بـ ١٠٠ تسبيحة واستغفار لتنقية القلوب وكسب الأجر العظيم.",
    descEn: "Scenting the tongue with 100 glorifications and seeking forgiveness.",
    category: "general",
    targetTab: "tasbih",
    points: 10
  }
];

export default function Dashboard({ darkMode = true, setActiveTab }: { darkMode?: boolean; setActiveTab?: (tab: string) => void }) {
  const { language, t, isAr, dir, toggleLanguage } = useLanguage();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Local active theme tracking synced with App.tsx via "theme-changed" events
  const [accentTheme, setAccentTheme] = useState<string>(() => {
    return localStorage.getItem("app_accent_theme") || "gold";
  });

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
    window.dispatchEvent(new Event("theme-changed"));
  };

  // --- Quran reading bookmark state ---
  const [quranBookmark, setQuranBookmark] = useState<{ surahNumber: number; surahName: string; verseNumber: number; verseText: string } | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quran_bookmark");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  // Re-load bookmark on mount or when active Tab becomes active
  useEffect(() => {
    const handleBookmarkUpdate = () => {
      const saved = localStorage.getItem("quran_bookmark");
      if (saved) {
        try {
          setQuranBookmark(JSON.parse(saved));
        } catch (e) {
          setQuranBookmark(null);
        }
      } else {
        setQuranBookmark(null);
      }
    };
    handleBookmarkUpdate();
    
    window.addEventListener("storage", handleBookmarkUpdate);
    window.addEventListener("quran-bookmark-updated", handleBookmarkUpdate);
    return () => {
      window.removeEventListener("storage", handleBookmarkUpdate);
      window.removeEventListener("quran-bookmark-updated", handleBookmarkUpdate);
    };
  }, []);

  const handleReturnToLastRead = () => {
    if (!quranBookmark || !setActiveTab) return;
    localStorage.setItem("quran_jump_to_bookmark_pending", "true");
    setActiveTab("quran");
  };

  // --- App Icon customization states ---
  const [selectedAppIcon, setSelectedAppIcon] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selected_app_icon") || "emerald";
    }
    return "emerald";
  });
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; desc: string } | null>(null);

  const handleSelectIcon = (iconId: string) => {
    setSelectedAppIcon(iconId);
    localStorage.setItem("selected_app_icon", iconId);
  };

  // Week prayer commitment logging states
  const [past7Days, setPast7Days] = useState<{ dateStr: string; dayName: string; shortDate: string }[]>([]);
  const [selectedLogDate, setSelectedLogDate] = useState<string>("");

  const [prayerLogs, setPrayerLogs] = useState<Record<string, Record<string, "ontime" | "late" | "missed">>>(() => {
    const saved = localStorage.getItem("prayer_commitment_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    
    const initialLogs: Record<string, Record<string, "ontime" | "late" | "missed">> = {};
    const now = new Date();
    const templateData = [
      { fajr: "ontime", dhuhr: "ontime", asr: "late", maghrib: "ontime", isha: "ontime" }, // -6 days
      { fajr: "ontime", dhuhr: "late", asr: "ontime", maghrib: "ontime", isha: "missed" }, // -5 days
      { fajr: "ontime", dhuhr: "ontime", asr: "ontime", maghrib: "ontime", isha: "ontime" }, // -4 days
      { fajr: "missed", dhuhr: "ontime", asr: "late", maghrib: "ontime", isha: "ontime" }, // -3 days
      { fajr: "ontime", dhuhr: "ontime", asr: "late", maghrib: "ontime", isha: "ontime" }, // -2 days
      { fajr: "ontime", dhuhr: "ontime", asr: "ontime", maghrib: "ontime", isha: "late" }, // -1 days
      { fajr: "ontime", dhuhr: "ontime", asr: "ontime", maghrib: "ontime", isha: "ontime" }  // Today
    ];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const idx = 6 - i;
      initialLogs[dateStr] = templateData[idx] as any;
    }
    
    localStorage.setItem("prayer_commitment_logs", JSON.stringify(initialLogs));
    return initialLogs;
  });

  useEffect(() => {
    const arabicDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const dDays = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayName = arabicDays[d.getDay()];
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      dDays.push({
        dateStr,
        dayName,
        shortDate: `${d.getDate()}/${d.getMonth() + 1}`
      });
    }
    setPast7Days(dDays);
    if (dDays.length > 0) {
      setSelectedLogDate(dDays[dDays.length - 1].dateStr);
    }
  }, []);

  const updatePrayerStatus = (dateStr: string, prayerId: string, status: "ontime" | "late" | "missed") => {
    const dayLog = prayerLogs[dateStr] || { fajr: "missed", dhuhr: "missed", asr: "missed", maghrib: "missed", isha: "missed" };
    const updated = {
      ...prayerLogs,
      [dateStr]: {
        ...dayLog,
        [prayerId]: status
      }
    };
    setPrayerLogs(updated);
    localStorage.setItem("prayer_commitment_logs", JSON.stringify(updated));
  };

  const chartData = past7Days.map((v) => {
    const dayLog = prayerLogs[v.dateStr] || { fajr: "missed", dhuhr: "missed", asr: "missed", maghrib: "missed", isha: "missed" };
    let points = 0;
    const items = Object.values(dayLog);
    items.forEach((item) => {
      if (item === "ontime") points += 100;
      else if (item === "late") points += 50;
    });
    const score = Math.round(points / 5);
    
    return {
      date: v.dateStr,
      day: v.dayName,
      shortDate: v.shortDate,
      "الالتزام": score,
      score: score
    };
  });

  const averageCommitment = chartData.length > 0 
    ? Math.round(chartData.reduce((acc: number, item) => acc + item.score, 0) / chartData.length)
    : 0;

  const totalOnTimeCount = Object.values(prayerLogs).reduce((acc: number, dayLog) => {
    return acc + Object.values(dayLog).filter(status => status === "ontime").length;
  }, 0);

  const bestDay = chartData.length > 0
    ? [...chartData].sort((a, b) => b.score - a.score)[0].day
    : "—";
  const [bearing, setBearing] = useState<number>(180); // Default to south-ish
  const [vibrateActive, setVibrateActive] = useState<boolean>(false);
  const [hijriDateText, setHijriDateText] = useState<string>("");
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Random Zikr state changer on mount/load
  const [zikrText, setZikrText] = useState<string>(() => {
    const defaultAzkar = [
      "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
      "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
      "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
      "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
      "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ ﷺ",
      "سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَلَا إِلَهَ إِلَّا اللَّهُ ، وَاللَّهُ أَكْبَرُ",
      "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
      "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ"
    ];
    return defaultAzkar[Math.floor(Math.random() * defaultAzkar.length)];
  });
  const [copiedZikr, setCopiedZikr] = useState<boolean>(false);
  const [isTenMinWarningActive, setIsTenMinWarningActive] = useState<boolean>(false);
  const [simulateTenMinWarning, setSimulateTenMinWarning] = useState<boolean>(false);


  // Live Cairo/Mecca Audio Radio Steam
  const [isPlayingRadio, setIsPlayingRadio] = useState<boolean>(false);
  const [radioRef] = useState(() => {
    return new Audio("https://quransound.islam.gov.qa/stream");
  });

  // Prophet blessing states
  const salawatAudioRef = useRef<HTMLAudioElement | null>(null);

  const [showProphetReminder, setShowProphetReminder] = useState<boolean>(() => {
    return localStorage.getItem("show_prophet_reminder") !== "false";
  });
  const [blessingsCount, setBlessingsCount] = useState<number>(() => {
    return Number(localStorage.getItem("prophet_blessings_count") || "0");
  });

  const [prophetChimesVoice, setProphetChimesVoice] = useState<string>(() => {
    const saved = localStorage.getItem("prophet_chimes_voice");
    if (!saved || saved === "real_prophet") return "prophet_voice_1";
    return saved;
  });

  const [customAudioName, setCustomAudioName] = useState<string>(() => {
    return localStorage.getItem("custom_audio_filename") || "";
  });
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prophetReminderMode, setProphetReminderMode] = useState<"interval" | "fixed">(() => {
    const saved = localStorage.getItem("prophet_reminder_mode");
    return (saved === "fixed" ? "fixed" : "interval");
  });

  const [prophetReminderInterval, setProphetReminderInterval] = useState<number>(() => {
    const saved = localStorage.getItem("prophet_reminder_interval");
    return saved !== null ? Number(saved) : 30; // Default to every 30 minutes
  });

  const [prophetDailyTimes, setProphetDailyTimes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("prophet_daily_times");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return ["09:00", "12:00", "15:00", "18:00", "21:00"];
  });

  const [prophetActiveHoursStart, setProphetActiveHoursStart] = useState<number>(() => {
    const saved = localStorage.getItem("prophet_active_hours_start");
    return saved !== null ? Number(saved) : 8; // Default 8 AM
  });

  const [prophetActiveHoursEnd, setProphetActiveHoursEnd] = useState<number>(() => {
    const saved = localStorage.getItem("prophet_active_hours_end");
    return saved !== null ? Number(saved) : 22; // Default 10 PM
  });

  const [lastReminderPlayedTime, setLastReminderPlayedTime] = useState<number>(() => {
    const saved = localStorage.getItem("last_prophet_reminder_played");
    return saved ? Number(saved) : Date.now();
  });

  const [newAlarmTime, setNewAlarmTime] = useState<string>("12:00");

  // Reactive prayer times that load saved times or defaults
  const [prayerTimes, setPrayerTimes] = useState(() => {
    try {
      const raw = localStorage.getItem("calculated_prayer_times");
      if (raw) {
        const parsed = JSON.parse(raw);
        return [
          { id: "fajr", name: "الفجر", time: parsed.fajr || "04:12", icon: "🌅", index: 0 },
          { id: "shuruq", name: "الشروق", time: parsed.shuruq || "05:43", icon: "☀️", index: 1 },
          { id: "dhuhr", name: "الظهر", time: parsed.dhuhr || "12:15", icon: "☀️", index: 2 },
          { id: "asr", name: "العصر", time: parsed.asr || "15:45", icon: "⛅", index: 3 },
          { id: "maghrib", name: "المغرب", time: parsed.maghrib || "18:49", icon: "🌇", index: 4 },
          { id: "isha", name: "العشاء", time: parsed.isha || "20:18", icon: "🌃", index: 5 }
        ];
      }
    } catch (e) {}
    return [
      { id: "fajr", name: "الفجر", time: "04:12", icon: "🌅", index: 0 },
      { id: "shuruq", name: "الشروق", time: "05:43", icon: "☀️", index: 1 },
      { id: "dhuhr", name: "الظهر", time: "12:15", icon: "☀️", index: 2 },
      { id: "asr", name: "العصر", time: "15:45", icon: "⛅", index: 3 },
      { id: "maghrib", name: "المغرب", time: "18:49", icon: "🌇", index: 4 },
      { id: "isha", name: "العشاء", time: "20:18", icon: "🌃", index: 5 }
    ];
  });

  const [use12hFormat, setUse12hFormat] = useState<boolean>(() => {
    return localStorage.getItem("use_12h_format") !== "false";
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        setUse12hFormat(localStorage.getItem("use_12h_format") !== "false");
        const raw = localStorage.getItem("calculated_prayer_times");
        if (raw) {
          const parsed = JSON.parse(raw);
          setPrayerTimes([
            { id: "fajr", name: "الفجر", time: parsed.fajr || "04:12", icon: "🌅", index: 0 },
            { id: "shuruq", name: "الشروق", time: parsed.shuruq || "05:43", icon: "☀️", index: 1 },
            { id: "dhuhr", name: "الظهر", time: parsed.dhuhr || "12:15", icon: "☀️", index: 2 },
            { id: "asr", name: "العصر", time: parsed.asr || "15:45", icon: "⛅", index: 3 },
            { id: "maghrib", name: "المغرب", time: parsed.maghrib || "18:49", icon: "🌇", index: 4 },
            { id: "isha", name: "العشاء", time: parsed.isha || "20:18", icon: "🌃", index: 5 }
          ]);
        }
      } catch (e) {}
    };
    window.addEventListener("prayer-reminder-changed", handleSync);
    return () => {
      window.removeEventListener("prayer-reminder-changed", handleSync);
    };
  }, []);

  const [nextPrayer, setNextPrayer] = useState({ name: "العصر", time: "15:45", timeLeft: "00:00:00", percent: 0 });
  const [activePrayerId, setActivePrayerId] = useState<string>("dhuhr");

  // Home Screen Widgets Simulation States
  const [widgetVerseIndex, setWidgetVerseIndex] = useState<number>(0);
  const [widgetHadithIndex, setWidgetHadithIndex] = useState<number>(0);
  const [widgetMoralIndex, setWidgetMoralIndex] = useState<number>(0);
  const [widgetInstTab, setWidgetInstTab] = useState<"android" | "ios">("android");
  const [widgetCopiedText, setWidgetCopiedText] = useState<string | null>(null);

  const widgetVerses = [
    { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", ref: "سورة الرعد - آية ٢٨" },
    { text: "أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ", ref: "سورة الإسراء - آية ٧٨" },
    { text: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا", ref: "سورة النساء - آية ١٠٣" },
    { text: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ", ref: "سورة البقرة - آية ٤٥" },
    { text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", ref: "سورة الطلاق - آية ٢-٣" }
  ];

  const widgetHadiths = [
    { text: "إنَّما الأعْمالُ بالنِّيّاتِ، وإنَّما لِكُلِّ امْرِئٍ ما نَوَى", ref: "صحيح البخاري" },
    { text: "المسلِمُ مَن سَلِمَ المسلِمُونَ مِن لِسانِهِ ويَدِهِ", ref: "صحيح البخاري ومسلم" },
    { text: "تبسمك في وجه أخيك لك صدقة", ref: "سنن الترمذي" },
    { text: "خيركم من تعلم القرآن وعلمه", ref: "صحيح البخاري" }
  ];

  const widgetMorals = [
    "بر الوالدين مفتاح التوفيق؛ اتصل بوالديك وأسعدهما بكلمة طيبة اليوم.",
    "إماطة الأذى عن الطريق صدقة، اجعل ممر الناس آمناً مريحاً دائماً.",
    "الكلمة الطيبة تفتح مغاليق القلوب؛ قل خيراً أو اصمت ليعم الأمن والود.",
    "العفو والصفح عند المقدرة يورث محبة القلوب وسكينة النفس الحالمة.",
    "كن مخلصاً أميناً في عملك ووفِ بوعودك فالمؤمن إذا عاهد وفى بعهده."
  ];

  const handleCopyWidgetText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setWidgetCopiedText(type);
    setTimeout(() => setWidgetCopiedText(null), 2000);
  };

  // --- Today's Spiritual Deeds (أعمال اليوم) State ---
  const [completedDeeds, setCompletedDeeds] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("completed_daily_deeds");
    const savedDate = localStorage.getItem("completed_deeds_date");
    const todayStr = new Date().toDateString();
    
    if (savedDate === todayStr && saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    const todayStr = new Date().toDateString();
    localStorage.setItem("completed_deeds_date", todayStr);
    localStorage.setItem("completed_daily_deeds", JSON.stringify(completedDeeds));
  }, [completedDeeds]);

  const handleToggleDeed = (deedId: string) => {
    setCompletedDeeds((prev) => ({
      ...prev,
      [deedId]: !prev[deedId]
    }));
  };

  const notifyProphetChange = () => {
    window.dispatchEvent(new Event("prophet-reminder-changed"));
  };

  useEffect(() => {
    const handleProphetChange = () => {
      const savedMode = localStorage.getItem("prophet_reminder_mode") || "interval";
      setProphetReminderMode(savedMode as "interval" | "fixed");

      const savedInterval = localStorage.getItem("prophet_reminder_interval");
      setProphetReminderInterval(savedInterval !== null ? Number(savedInterval) : 30);

      const savedStart = localStorage.getItem("prophet_active_hours_start");
      setProphetActiveHoursStart(savedStart !== null ? Number(savedStart) : 8);

      const savedEnd = localStorage.getItem("prophet_active_hours_end");
      setProphetActiveHoursEnd(savedEnd !== null ? Number(savedEnd) : 22);

      const savedShow = localStorage.getItem("show_prophet_reminder");
      if (savedShow !== null) setShowProphetReminder(savedShow !== "false");

      try {
        const savedTimes = localStorage.getItem("prophet_daily_times");
        if (savedTimes) {
          const parsed = JSON.parse(savedTimes);
          if (Array.isArray(parsed)) setProphetDailyTimes(parsed);
        }
      } catch (e) {}

      const savedCount = localStorage.getItem("prophet_blessings_count");
      if (savedCount !== null) setBlessingsCount(Number(savedCount));

      const savedVoice = localStorage.getItem("prophet_chimes_voice");
      if (savedVoice !== null) {
        setProphetChimesVoice((savedVoice === "real_prophet" || !savedVoice) ? "prophet_voice_1" : savedVoice);
      }

      const savedName = localStorage.getItem("custom_audio_filename");
      setCustomAudioName(savedName || "");
    };

    const handlePlayPending = () => {
      console.log("[Dashboard] play-pending-salawat event received. Triggering Salat audio.");
      playVoiceChime();
    };

    window.addEventListener("prophet-reminder-changed", handleProphetChange);
    window.addEventListener("play-pending-salawat", handlePlayPending);
    return () => {
      window.removeEventListener("prophet-reminder-changed", handleProphetChange);
      window.removeEventListener("play-pending-salawat", handlePlayPending);
    };
  }, []);

  const playSyntheticSalawat = () => {
    if (localStorage.getItem("silent_mode") === "true") return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ");
      utterance.lang = "ar-SA";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const playVoiceChime = () => {
    try {
      if (typeof window === "undefined") return;
      if (localStorage.getItem("silent_mode") === "true") {
        console.log("[Dashboard] Silent mode is enabled. Skipping audio chime.");
        return;
      }

      // Priority check: If Adhan is currently playing, queue this Salat reminder
      if ((window as any).__adhanPlaying) {
        console.log("[Dashboard] Adhan is currently playing. Queuing Salat reminder sequentially.");
        (window as any).__pendingSalawat = true;
        return;
      }

      // Stop current if playing
      if (salawatAudioRef.current) {
        salawatAudioRef.current.pause();
        salawatAudioRef.current = null;
        (window as any).__salawatAudio = null;
      }

      const voiceInfo = PROPHET_VOICES.find(v => v.id === prophetChimesVoice) || PROPHET_VOICES[0];
      
      if (voiceInfo.id === "custom_voice") {
        getCustomAudio().then(blob => {
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            const audio = new Audio(objectUrl);
            salawatAudioRef.current = audio;
            (window as any).__salawatAudio = audio;
            audio.play().then(() => {
              console.log("[Dashboard] Played custom audio successfully.");
            }).catch(err => {
              console.warn("Failed to play custom object url", err);
              playSyntheticSalawat();
            });
            audio.onended = () => {
              (window as any).__salawatAudio = null;
            };
            audio.onerror = () => {
              (window as any).__salawatAudio = null;
            };
          } else {
            console.warn("No custom audio blob found, playing default voice.");
            // Fallback play default
            const defaultVoice = PROPHET_VOICES[0];
            const defaultUrl = defaultVoice.url;
            const defaultProxied = defaultUrl.startsWith("http") ? `/api/proxy-audio?url=${encodeURIComponent(defaultUrl)}` : defaultUrl;
            const audio = new Audio(defaultProxied);
            salawatAudioRef.current = audio;
            (window as any).__salawatAudio = audio;
            audio.play().catch(() => {
              const direct = new Audio(defaultUrl);
              salawatAudioRef.current = direct;
              (window as any).__salawatAudio = direct;
              direct.play().catch(() => playSyntheticSalawat());
              direct.onended = () => {
                (window as any).__salawatAudio = null;
              };
            });
            audio.onended = () => {
              (window as any).__salawatAudio = null;
            };
          }
        }).catch(err => {
          console.error("Error reading custom audio:", err);
          playSyntheticSalawat();
        });
        return;
      }

      let dbKey = "";
      if (voiceInfo.id === "real_prophet") dbKey = "real_prophet_v3";
      else if (voiceInfo.id === "prophet_voice_1") dbKey = "prophet_voice_1_v1";
      else if (voiceInfo.id === "prophet_voice_2") dbKey = "prophet_voice_2_v1";

      if (dbKey) {
        getAudioByKey(dbKey).then(blob => {
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            const audio = new Audio(objectUrl);
            salawatAudioRef.current = audio;
            (window as any).__salawatAudio = audio;
            audio.play().then(() => {
              console.log(`[Dashboard] Played cached ${voiceInfo.id} audio successfully.`);
            }).catch(err => {
              console.warn(`Failed to play cached ${voiceInfo.id}, fallback to synthetic`, err);
              playSyntheticSalawat();
            });
            audio.onended = () => {
              (window as any).__salawatAudio = null;
            };
          } else {
            // Not cached, stream normally
            const fullUrl = voiceInfo.url;
            const proxiedUrl = fullUrl.startsWith("http") ? `/api/proxy-audio?url=${encodeURIComponent(fullUrl)}` : fullUrl;
            const audio = new Audio(proxiedUrl);
            salawatAudioRef.current = audio;
            (window as any).__salawatAudio = audio;
            audio.preload = "auto";
            audio.play().catch(() => {
              const directAudio = new Audio(fullUrl);
              salawatAudioRef.current = directAudio;
              (window as any).__salawatAudio = directAudio;
              directAudio.play().catch(() => playSyntheticSalawat());
              directAudio.onended = () => {
                (window as any).__salawatAudio = null;
              };
            });
            audio.onended = () => {
              (window as any).__salawatAudio = null;
            };
          }
        }).catch(() => {
          // Fallback stream normally
          const fullUrl = voiceInfo.url;
          const proxiedUrl = fullUrl.startsWith("http") ? `/api/proxy-audio?url=${encodeURIComponent(fullUrl)}` : fullUrl;
          const audio = new Audio(proxiedUrl);
          salawatAudioRef.current = audio;
          (window as any).__salawatAudio = audio;
          audio.preload = "auto";
          audio.play().catch(() => {
            const directAudio = new Audio(fullUrl);
            salawatAudioRef.current = directAudio;
            (window as any).__salawatAudio = directAudio;
            directAudio.play().catch(() => playSyntheticSalawat());
            directAudio.onended = () => {
              (window as any).__salawatAudio = null;
            };
          });
          audio.onended = () => {
            (window as any).__salawatAudio = null;
          };
        });
        return;
      }

      const fullUrl = voiceInfo.url;
      const proxiedUrl = fullUrl.startsWith("http") ? `/api/proxy-audio?url=${encodeURIComponent(fullUrl)}` : fullUrl;
      console.log(`[Dashboard] Attempting to play Salawat [${voiceInfo.id}]: ${proxiedUrl}`);

      const audio = new Audio(proxiedUrl);
      salawatAudioRef.current = audio;
      (window as any).__salawatAudio = audio;
      audio.preload = "auto";
      
      audio.play()
        .then(() => {
          console.log(`Successfully playing Prophet reminder through proxy`);
        })
        .catch(err => {
          console.warn("Proxy failing, playing direct...", err);
          const directAudio = new Audio(fullUrl);
          salawatAudioRef.current = directAudio;
          (window as any).__salawatAudio = directAudio;
          directAudio.play().catch(e => {
            console.warn("All direct audio attempts failed, fallback to SpeechSynthesis.", e);
            playSyntheticSalawat();
          });
          directAudio.onended = () => {
            (window as any).__salawatAudio = null;
          };
        });
      audio.onended = () => {
        (window as any).__salawatAudio = null;
      };
    } catch (e) {
      console.warn("Audio play exception:", e);
      playSyntheticSalawat();
    }
  };

  const handleIncrementBlessing = () => {
    const nextVal = blessingsCount + 1;
    setBlessingsCount(nextVal);
    localStorage.setItem("prophet_blessings_count", String(nextVal));
    playVoiceChime();
    notifyProphetChange();
  };

  const handleResetBlessings = () => {
    setBlessingsCount(0);
    localStorage.setItem("prophet_blessings_count", "0");
    notifyProphetChange();
  };

  // Clock tick & Date formatters
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (!showProphetReminder) return;

      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      // Check silent mode
      if (localStorage.getItem("silent_mode") === "true") return;

      // Active hours range check (لتجنب الإزعاج أثناء النوم)
      const isTimeInRange = (hours: number) => {
        if (prophetActiveHoursStart <= prophetActiveHoursEnd) {
          return hours >= prophetActiveHoursStart && hours <= prophetActiveHoursEnd;
        } else {
          // Over midnight, e.g. 22:00 to 06:00
          return hours >= prophetActiveHoursStart || hours <= prophetActiveHoursEnd;
        }
      };

      if (!isTimeInRange(currentHours)) return;

      if (prophetReminderMode === "interval") {
        if (prophetReminderInterval > 0) {
          const timeDiffMs = now.getTime() - lastReminderPlayedTime;
          const intervalMs = prophetReminderInterval * 60 * 1000;
          
          if (timeDiffMs >= intervalMs) {
            playVoiceChime();
            setBlessingsCount(prev => {
              const nextVal = prev + 1;
              localStorage.setItem("prophet_blessings_count", String(nextVal));
              return nextVal;
            });
            const currentTimestamp = now.getTime();
            setLastReminderPlayedTime(currentTimestamp);
            localStorage.setItem("last_prophet_reminder_played", String(currentTimestamp));
            notifyProphetChange();
          }
        }
      } else {
        // "fixed" daily alarms mode
        const padZero = (n: number) => String(n).padStart(2, "0");
        const currentHHMM = `${padZero(currentHours)}:${padZero(currentMinutes)}`;
        
        if (prophetDailyTimes.includes(currentHHMM)) {
          const todayDateStr = `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`;
          const lastPlayedAlarmKey = `last_prophet_fixed_played_${todayDateStr}`;
          const lastPlayedHHMM = localStorage.getItem(lastPlayedAlarmKey);
          
          if (lastPlayedHHMM !== currentHHMM) {
            playVoiceChime();
            localStorage.setItem(lastPlayedAlarmKey, currentHHMM);
            setBlessingsCount(prev => {
              const nextVal = prev + 1;
              localStorage.setItem("prophet_blessings_count", String(nextVal));
              return nextVal;
            });
            notifyProphetChange();
          }
        }
      }
    }, 1000);

    const options = { calendar: "islamic-umalqura", day: "numeric", month: "long", year: "numeric" };
    const localeAr = new Intl.DateTimeFormat("ar-SA", options as any);
    setHijriDateText(localeAr.format(new Date()));

    return () => clearInterval(timer);
  }, [
    prophetReminderMode,
    prophetReminderInterval,
    prophetDailyTimes,
    prophetActiveHoursStart,
    prophetActiveHoursEnd,
    showProphetReminder,
    lastReminderPlayedTime
  ]);

  // Prefetch human blessing on the Prophet voice for perfect offline use
  useEffect(() => {
    const prefetchSalawatAudios = async () => {
      try {
        for (const voice of PROPHET_VOICES) {
          if (!voice.url) continue;
          const proxied = voice.url.startsWith("http") ? `/api/proxy-audio?url=${encodeURIComponent(voice.url)}` : voice.url;
          fetch(proxied, { priority: "low" } as any).catch(() => {});
        }
        console.log("[Dashboard] Offline prefetch complete for the default human salawat voice.");
      } catch (e) {
        console.warn("Could not prefetch offline salawat voice on start", e);
      }
    };
    const delayTimer = setTimeout(prefetchSalawatAudios, 4000);
    return () => clearTimeout(delayTimer);
  }, []);

  // Sync Audio Radio Stream state safely
  useEffect(() => {
    return () => {
      radioRef.pause();
    };
  }, [radioRef]);

  // Dynamic values calculation for Countdown & Highlighted card
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const totalMinutesNow = currentHours * 60 + currentMinutes;

      // Determine active and next prayer
      let targetIndex = 0;
      let isSet = false;

      for (let i = 0; i < prayerTimes.length; i++) {
        const [h, m] = prayerTimes[i].time.split(":").map(Number);
        const pMinutes = h * 60 + m;
        if (totalMinutesNow < pMinutes) {
          targetIndex = i;
          isSet = true;
          break;
        }
      }

      if (!isSet) {
        // Next is Fajr of tomorrow
        targetIndex = 0;
      }

      const activeIdx = targetIndex === 0 ? prayerTimes.length - 1 : targetIndex - 1;
      setActivePrayerId(prayerTimes[activeIdx].id);

      const targetPrayer = prayerTimes[targetIndex];
      const [th, tm] = targetPrayer.time.split(":").map(Number);
      let targetDate = new Date();
      targetDate.setHours(th, tm, 0, 0);

      if (targetIndex === 0 && totalMinutesNow >= 20 * 60 + 18) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const diffMs = targetDate.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const formatted = `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

      // Calculate elapsed percentage since previous prayer
      const prevPrayerObj = prayerTimes[activeIdx];
      const [ph, pm] = prevPrayerObj.time.split(":").map(Number);
      let prevDate = new Date();
      prevDate.setHours(ph, pm, 0, 0);
      if (activeIdx === 5 && totalMinutesNow < 4 * 60 + 12) {
        prevDate.setDate(prevDate.setDate(prevDate.getDate() - 1));
      }

      const totalSpan = targetDate.getTime() - prevDate.getTime();
      const elapsed = now.getTime() - prevDate.getTime();
      const percent = Math.min(100, Math.max(0, Math.floor((elapsed / totalSpan) * 100)));

      // Check if it's within 10 minutes of the next prayer
      const totalRemainingMins = hours * 60 + minutes;
      setIsTenMinWarningActive(totalRemainingMins <= 10 && totalRemainingMins > 0);

      setNextPrayer({
        name: targetPrayer.name,
        time: targetPrayer.time,
        timeLeft: formatted,
        percent: percent
      });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Compass interaction alignment logic
  const handleRotateCompass = () => {
    // Standard Makkah angle in Arabia is around 225°
    let nextAngle = 0;
    if (bearing !== 225) {
      nextAngle = 225; // Snap align
    } else {
      nextAngle = 45; // manual rotate out
    }
    setBearing(nextAngle);
    if (nextAngle === 225) {
      setVibrateActive(true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setTimeout(() => setVibrateActive(false), 1500);
    }
  };

  // Toggle Live Cairo/Mecca stream radio
  const toggleQuranRadio = () => {
    if (isPlayingRadio) {
      radioRef.pause();
      setIsPlayingRadio(false);
    } else {
      radioRef.play()
        .then(() => setIsPlayingRadio(true))
        .catch((err) => {
          console.warn("Live radio stream failed to play", err);
          setIsPlayingRadio(false);
        });
    }
  };

  // Font settings block
  const [quranFontSize, setQuranFontSize] = useState<number>(() => {
    return Number(localStorage.getItem("quran_font_size") || "22");
  });
  const [quranFontStyle, setQuranFontStyle] = useState<string>(() => {
    return localStorage.getItem("quran_font_style") || "serif";
  });
  const [hadithFontSize, setHadithFontSize] = useState<number>(() => {
    return Number(localStorage.getItem("hadith_font_size") || "16");
  });
  const [hadithFontStyle, setHadithFontStyle] = useState<string>(() => {
    return localStorage.getItem("hadith_font_style") || "naskh";
  });

  const handleQuranFontSizeChange = (size: number) => {
    setQuranFontSize(size);
    localStorage.setItem("quran_font_size", String(size));
  };
  const handleQuranFontStyleChange = (style: string) => {
    setQuranFontStyle(style);
    localStorage.setItem("quran_font_style", style);
  };
  const handleHadithFontSizeChange = (size: number) => {
    setHadithFontSize(size);
    localStorage.setItem("hadith_font_size", String(size));
  };
  const handleHadithFontStyleChange = (style: string) => {
    setHadithFontStyle(style);
    localStorage.setItem("hadith_font_style", style);
  };

  // Gregorian format standard arabic or english depending on isAr
  const gregorianDateText = new Intl.DateTimeFormat(isAr ? "ar-EG" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const getGreetingText = () => {
    const hr = currentTime.getHours();
    if (isAr) {
      if (hr < 4) return "نسألك اللّهم قياماً خالصاً ودعاءً مستجاباً في جوف الليل";
      if (hr < 11) return "صباح ممتلئ بالأنوار والبركات والنشاط في طاعة الله";
      if (hr < 15) return "يوم مبارك عامر بالذكر، نسأل الله لك قبول العمل";
      if (hr < 18) return "مساء الهداية والسكينة ومضاعفة الأجر والمثوبة";
      return "ليل هادئ بذكر الله، رعاك الله بالسكينة والرضوان";
    } else {
      if (hr < 4) return "We ask Allah for sincere prayers in the depth of the night";
      if (hr < 11) return "A morning filled with lights, blessings, and active obedience";
      if (hr < 15) return "A blessed day filled with remembrance; may Allah accept your deeds";
      if (hr < 18) return "An evening of guidance, tranquility, and abundant rewards";
      return "A peaceful night with the remembrance of Allah; may He protect you";
    }
  };

  const getLocalizedPrayerName = (name: string) => {
    if (isAr) return name;
    const lower = name.trim();
    if (lower === "الفجر" || lower === "Fajr") return "Fajr";
    if (lower === "الشروق" || lower === "Shuruq" || lower === "الشروق (Sunrise)" || lower === "Sunrise") return "Sunrise";
    if (lower === "الظهر" || lower === "Dhuhr") return "Dhuhr";
    if (lower === "العصر" || lower === "Asr") return "Asr";
    if (lower === "المغرب" || lower === "Maghrib") return "Maghrib";
    if (lower === "العشاء" || lower === "Isha") return "Isha";
    return name;
  };

  const getLocalizedSurah = (surah: string) => {
    if (isAr) return surah;
    const s = surah;
    if (s.includes("البقرة")) return "Surah Al-Baqarah • Verse 152";
    if (s.includes("الشرح")) return "Surah Al-Inshirah • Verse 6";
    if (s.includes("الطلاق")) return "Surah At-Talaq • Verses 2-3";
    if (s.includes("الرعد")) return "Surah Ar-Ra'd • Verse 28";
    if (s.includes("غافر")) return "Surah Ghafir • Verse 60";
    return s;
  };

  const getLocalizedExplanation = (explanation: string) => {
    if (isAr) return explanation;
    const e = explanation;
    if (e.includes("وعد إلهي جليل")) {
      return "A magnificent divine promise: if Allah is remembered with obedience, praise, and gratitude, He remembers the servant with His beautiful favor, satisfaction, defense against affliction, and mercy with full tranquility.";
    }
    if (e.includes("يقين ربّاني مريح")) {
      return "Comforting Lordly certainty: every sorrow or distress is accompanied by an inevitable ease. No single hardship can overcome two eases. May Allah relieve every distressed person.";
    }
    if (e.includes("مفتاح المخارج والرزق")) {
      return "The key to solutions and provision: piety (Taqwa) and consciousness of Allah's pleasure, in secret and public, open closed locks and bring livelihood and spiritual tranquility.";
    }
    if (e.includes("غذاء الأرواح ومستقر")) {
      return "Nourishment for souls and station of rest: remembrance of Allah and continuous connection to the Divine Divinity removes the clutter of anxiety from the soul and washes the dust of the world with cool certainty.";
    }
    if (e.includes("بصيص الرجاء ومربط")) {
      return "The glimmer of hope and anchor of return: The Loving Creator urges His servants to call upon Him and seek His grace, guaranteeing them a sincere response for what is best for their worldly life and hereafter.";
    }
    return e;
  };

  const activeVerse = dailyVerses[activeVerseIndex];

  const copyVerseToClipboard = () => {
    const textToCopy = `${activeVerse.ayah} \n(${activeVerse.surah}) \nتم النسخ من تطبيق أنا مسلم`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNextVerse = () => {
    setShowExplanation(false);
    setActiveVerseIndex((prev) => (prev + 1) % dailyVerses.length);
  };

  const handlePrevVerse = () => {
    setShowExplanation(false);
    setActiveVerseIndex((prev) => (prev - 1 + dailyVerses.length) % dailyVerses.length);
  };

  // Milestone triggers for Prophet prayers count
  const getMilestoneStatus = () => {
    if (blessingsCount >= 100) return { title: isAr ? "👑 خادم السنة الشريفة" : "👑 Sunnah Servant", level: isAr ? "متقدم جداً" : "highly persistent", color: "from-amber-400 to-yellow-600" };
    if (blessingsCount >= 50) return { title: isAr ? "🔥 لسان خاشع رطب" : "🔥 Moist Humble Tongue", level: isAr ? "مداوم" : "regular", color: "from-orange-500 to-amber-500" };
    if (blessingsCount >= 10) return { title: isAr ? "🌟 محب مخلص للرسول" : "🌟 Devoted Prophet Lover", level: isAr ? "بداية مكنونة" : "beginning", color: "from-emerald-400 to-teal-600" };
    return { title: isAr ? "🌱 بذرة طيبة للذكر" : "🌱 Dhikr Sprout", level: isAr ? "مبتدئ" : "beginner", color: "from-stone-600 to-slate-400" };
  };

  const milestone = getMilestoneStatus();

  return (
    <div
      className={`flex flex-col h-full font-sans select-none overflow-y-auto space-y-6 ${
        darkMode ? "bg-slate-950/20 text-white p-3 sm:p-5" : "bg-transparent text-slate-900 p-3 sm:p-5"
      }`}
      style={{ contentVisibility: "auto" }}
    >
      {/* 🚀 ELITE FLOATING PROPHET REMINDER RESTORE BUTTON */}
      {!showProphetReminder && (
        <div className={isAr ? "text-left" : "text-right"}>
          <button
            onClick={() => {
              setShowProphetReminder(true);
              localStorage.setItem("show_prophet_reminder", "true");
            }}
            className={`group px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 ${isAr ? "ml-auto" : "mr-auto"} shadow-sm`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse group-hover:scale-110 transition" />
            <span>{t("prophet_reminder_restore")}</span>
          </button>
        </div>
      )}

      {/* ⭐️ REDESIGNED COSMIC PROPHET PRAYER CARD (ﷺ) */}
      {showProphetReminder && (
        <div
          className={`relative overflow-hidden rounded-2xl border transition-all duration-500 p-5 shadow-xl ${
            darkMode
              ? "bg-gradient-to-br from-[#071d2b] via-[#041521] to-slate-950 border-emerald-500/20 text-white"
              : "bg-gradient-to-br from-[#fefcf8] via-[#f7f3e8] to-[#eee4d2] border-emerald-600/10 text-slate-950"
          }`}
          style={{ direction: dir }}
        >
          {/* Aesthetic Background Calligraphy watermark */}
          <div className="absolute left-6 bottom-[-30px] opacity-[0.04] text-[180px] font-bold select-none pointer-events-none scale-125 text-[#cca05a]">
            ﷺ
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setShowProphetReminder(false);
              localStorage.setItem("show_prophet_reminder", "false");
              notifyProphetChange();
            }}
            className="absolute left-4 top-4 w-7 h-7 bg-slate-950/20 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-full flex items-center justify-center border border-white/5 transition"
            title="إخفاء التذكير"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Card Title Header */}
          <div className={`flex items-center space-x-3 ${isAr ? "space-x-reverse" : ""} pb-3.5 border-b border-dashed border-[#cca05a]/20 mb-4`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              darkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-600/10 border-emerald-600/20 text-emerald-700"
            }`}>
              <Sparkles className="w-5 h-5 animate-spin-slow text-[#cca05a]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#cca05a] leading-none">{t("prophet_card_title")}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-light leading-none font-sans">
                {isAr 
                  ? "قال النبي ﷺ: «من صلّى عليّ صلاة واحدة صلّى الله عليه بها عشراً»" 
                  : "The Prophet ﷺ said: 'Whoever invokes blessings upon me once, Allah sends blessings upon him ten times.'"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative z-10">
            {/* Column 1 - Left Segment: Callout Quote + custom Timing panel */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className={`p-4 rounded-xl text-center border relative overflow-hidden ${
                darkMode ? "bg-slate-950/55 border-emerald-500/10" : "bg-white/60 border-amber-900/10"
              }`}>
                <span className="text-[10px] text-amber-500/50 block font-light tracking-wide mb-1 select-none">
                  {isAr ? "الذكر الشريف المتكرر" : "Noble Sunnah Durood Chanting"}
                </span>
                <p className="text-lg sm:text-xl font-serif font-bold text-[#cca05a] leading-relaxed select-text py-1">
                  « اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ »
                </p>
              </div>

              {/* Voice and Custom Timing Selector */}
              <div className="space-y-4">
                {/* Voice selector for the Prophet Blessing */}
                <div className="space-y-2.5 p-3 rounded-xl border bg-emerald-500/5 border-emerald-500/10 text-right">
                  <label className="text-[10px] text-amber-200/80 font-bold block mb-1">
                    {isAr ? "🎙️ اختر صوت التذكير بالصلاة على النبي ﷺ:" : "🎙️ Choose Prophet Blessings Voice:"}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5" style={{ direction: isAr ? "rtl" : "ltr" }}>
                    {PROPHET_VOICES.map((v) => {
                      const isSelected = prophetChimesVoice === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => {
                            setProphetChimesVoice(v.id);
                            localStorage.setItem("prophet_chimes_voice", v.id);
                            notifyProphetChange();
                            if (v.id === "custom_voice" && !customAudioName) {
                              setTimeout(() => {
                                fileInputRef.current?.click();
                              }, 100);
                            } else {
                              // Play test instantly
                              setTimeout(() => {
                                playVoiceChime();
                              }, 50);
                            }
                          }}
                          className={`relative py-1.5 px-0.5 text-[9px] font-bold rounded-lg border text-center transition cursor-pointer ${
                            isSelected
                              ? "bg-amber-500/20 border-amber-500 text-amber-300 font-extrabold shadow-sm"
                              : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-slate-800"
                          }`}
                        >
                          <span className="block text-[9px] truncate">{isAr ? v.nameAr : v.nameEn}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-emerald-500/5">
                    <span className="text-[8.5px] text-slate-400">
                      {isAr ? "💡 سيتم استخدام هذا الصوت في التنبيهات المجدولة والتكرارية تلقائياً." : "💡 This voice will be utilized for scheduled and repeating alerts."}
                    </span>
                    <button
                      onClick={() => playVoiceChime()}
                      className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-[#cca05a]/25 text-[#cca05a] text-[10px] border border-amber-500/25 transition cursor-pointer flex items-center gap-1 font-bold"
                    >
                      <span>🔊</span>
                      <span>{isAr ? "تجربة الصوت الحالي" : "Test Voice"}</span>
                    </button>
                  </div>
                </div>

                {/* Custom Audio File Management Section */}
                {prophetChimesVoice === "custom_voice" && (
                  <div className="p-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 space-y-2 text-right">
                    <span className="text-[10px] text-amber-300 font-bold block">
                      {isAr ? "📁 إدارة الملف الصوتي المخصص:" : "📁 Manage Custom Audio File:"}
                    </span>
                    
                    {customAudioName ? (
                      <div className="flex flex-col gap-2 pb-1 bg-slate-950/20 p-2 rounded border border-white/5">
                        <div className="flex items-center justify-between gap-2.5 text-xs">
                          <button
                            onClick={async () => {
                              if (confirm(isAr ? "هل أنت متأكد من حذف الملف الصوتي؟" : "Are you sure you want to delete the custom audio?")) {
                                await deleteCustomAudio();
                                setCustomAudioName("");
                                localStorage.removeItem("custom_audio_filename");
                                setProphetChimesVoice("prophet_voice_1");
                                localStorage.setItem("prophet_chimes_voice", "prophet_voice_1");
                                notifyProphetChange();
                              }
                            }}
                            className="text-red-400 hover:text-red-300 text-[10px] bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 rounded transition cursor-pointer font-bold"
                          >
                            {isAr ? "حذف الملف" : "Delete File"}
                          </button>
                          <span className="text-[10px] text-slate-300 font-mono truncate max-w-[200px]" dir="ltr">
                            {customAudioName}
                          </span>
                        </div>
                        <span className="text-[8px] text-slate-400 leading-relaxed block">
                          {isAr ? "✅ الملف الصوتي مخزن محلياً ومتاح للعمل بالكامل دون اتصال بالإنترنت." : "✅ Stored locally on your device for absolute offline support."}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2.5 gap-2 border border-dashed border-slate-700/60 rounded bg-slate-950/45">
                        <span className="text-[9px] text-slate-400 text-center px-2">
                          {isAr ? "لم تقم برفع أي ملف بعد. يرجى رفع ملف لتشغيله كصلاة على النبي." : "No custom audio uploaded yet. Select a file to use."}
                        </span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="audio/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setIsUploading(true);
                              await saveCustomAudio(file);
                              setCustomAudioName(file.name);
                              localStorage.setItem("custom_audio_filename", file.name);
                              setIsUploading(false);
                              // Auto delay and play test
                              setTimeout(() => {
                                playVoiceChime();
                              }, 100);
                            } catch (err: any) {
                              setIsUploading(false);
                              alert(isAr ? "حدث خطأ أثناء حفظ الملف: " + err.message : "Error saving file: " + err.message);
                            }
                          }}
                          className="hidden"
                        />
                        <button
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 text-[10px] border border-amber-500/30 transition cursor-pointer font-bold flex items-center gap-1.5"
                        >
                          {isUploading ? (
                            <span>⏳ {isAr ? "جاري الحفظ..." : "Saving..."}</span>
                          ) : (
                            <>
                              <span>📤</span>
                              <span>{isAr ? "اختر ملفاً صوتياً (MP3 / WAV)" : "Upload Audio File (MP3 / WAV)"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Alarm Timing Type Switch */}
                <div className="space-y-2 pt-2 border-t border-dashed border-[#cca05a]/20">
                  <label className="text-[10px] text-amber-200/80 font-bold block">
                    {isAr ? "⏱️ طريقة الجدولة وتوقيت التذكير:" : "⏱️ Reminder Scheduling System:"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setProphetReminderMode("interval");
                        localStorage.setItem("prophet_reminder_mode", "interval");
                        notifyProphetChange();
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        prophetReminderMode === "interval"
                          ? "bg-[#cca05a]/20 text-[#cca05a] border border-[#cca05a] font-extrabold"
                          : "bg-slate-900/40 text-slate-400 border border-transparent hover:text-white"
                      }`}
                    >
                      {isAr ? "🔁 تكرار تلقائي بالدقائق" : "🔁 Repeating Interval"}
                    </button>
                    <button
                      onClick={() => {
                        setProphetReminderMode("fixed");
                        localStorage.setItem("prophet_reminder_mode", "fixed");
                        notifyProphetChange();
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        prophetReminderMode === "fixed"
                          ? "bg-[#cca05a]/20 text-[#cca05a] border border-[#cca05a] font-extrabold"
                          : "bg-slate-900/40 text-slate-400 border border-transparent hover:text-white"
                      }`}
                    >
                      {isAr ? "⏰ أوقات محددة يومياً" : "⏰ Fixed Daily Alarms"}
                    </button>
                  </div>
                </div>

                {/* Conditional Sub-settings rendering based on selected Mode */}
                {prophetReminderMode === "interval" ? (
                  <div className="space-y-3 p-3 rounded-xl bg-slate-900/30 border border-white/5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-300">{isAr ? "تكرار التنبيه كل:" : "Repeat Alert Every:"}</span>
                      <span className="text-emerald-400 font-bold">
                        {prophetReminderInterval > 0 
                          ? (isAr ? `كل ${prophetReminderInterval} دقيقة تلقائياً` : `Every ${prophetReminderInterval} min`)
                          : (isAr ? "تنبيه يدوي فقط" : "Manual trigger only")}
                      </span>
                    </div>

                    {/* Pre-set Buttons */}
                    <div className="grid grid-cols-5 gap-1">
                      {[15, 30, 45, 60, 0].map((mins) => {
                        const isSelected = prophetReminderInterval === mins;
                        const label = mins === 0 
                          ? (isAr ? "إيقاف" : "Stop") 
                          : `${mins}${isAr ? "د" : "m"}`;
                        return (
                          <button
                            key={mins}
                            onClick={() => {
                              setProphetReminderInterval(mins);
                              localStorage.setItem("prophet_reminder_interval", String(mins));
                              const nowTs = Date.now();
                              setLastReminderPlayedTime(nowTs);
                              localStorage.setItem("last_prophet_reminder_played", String(nowTs));
                              notifyProphetChange();
                            }}
                            className={`py-1 px-0.5 text-[9px] font-bold rounded border transition cursor-pointer text-center ${
                              isSelected
                                ? "bg-[#cca05a]/25 border-[#cca05a] text-[#cca05a]"
                                : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-slate-800"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Minute Input Slider/Input */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-[#cca05a]">
                        {isAr ? "أو حدد تكراراً بالدقائق المخصصة (مثلا 5 أو 120 دقيقة):" : "Or define a custom interval in minutes:"}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="180"
                          value={prophetReminderInterval || 30}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setProphetReminderInterval(val);
                            localStorage.setItem("prophet_reminder_interval", String(val));
                            notifyProphetChange();
                          }}
                          className="flex-1 accent-amber-500 h-1 rounded bg-slate-900 cursor-pointer"
                        />
                        <input
                          type="number"
                          min="1"
                          max="300"
                          value={prophetReminderInterval}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setProphetReminderInterval(val);
                            localStorage.setItem("prophet_reminder_interval", String(val));
                            notifyProphetChange();
                          }}
                          className="w-14 text-center text-xs font-bold bg-slate-950/70 border border-white/10 rounded px-1 text-[#cca05a] font-mono"
                        />
                        <span className="text-[10px] text-slate-400">{isAr ? "دقيقة" : "min"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 rounded-xl bg-slate-900/30 border border-white/5">
                    <span className="text-[10px] text-slate-300 block">
                      {isAr ? "⏰ قائمة أوقات التنبيه المحددة يومياً:" : "⏰ Specific Daily Alarm Times:"}
                    </span>

                    {/* Alarm list tag tags */}
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 border border-white/5 rounded-lg bg-slate-950/40">
                      {prophetDailyTimes.map((alarmTime, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-[#cca05a]/30 text-[#cca05a] text-[10px] font-mono"
                        >
                          <span>{alarmTime}</span>
                          <button
                            onClick={() => {
                              const updated = prophetDailyTimes.filter((_, i) => i !== idx);
                              setProphetDailyTimes(updated);
                              localStorage.setItem("prophet_daily_times", JSON.stringify(updated));
                              notifyProphetChange();
                            }}
                            className="text-red-400 hover:text-red-300 hover:scale-125 transition cursor-pointer text-[12px] font-bold"
                            title={isAr ? "حذف التوقيت" : "Delete alarm"}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {prophetDailyTimes.length === 0 && (
                        <p className="text-[9px] text-slate-500 p-1 w-full text-center">
                          {isAr ? "لم تقم بتهيئة أي وقت تنبيه يومي بعد" : "No daily fixed alarms scheduled yet"}
                        </p>
                      )}
                    </div>

                    {/* Alarm Time Added control */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="time"
                        value={newAlarmTime}
                        onChange={(e) => setNewAlarmTime(e.target.value)}
                        className="flex-1 bg-slate-950/80 border border-white/10 rounded px-2.5 py-1 text-xs text-amber-255 focus:outline-none focus:border-amber-500 font-mono text-center text-[#cca05a]"
                      />
                      <button
                        onClick={() => {
                          if (!newAlarmTime) return;
                          if (prophetDailyTimes.includes(newAlarmTime)) return;
                          const updated = [...prophetDailyTimes, newAlarmTime].sort();
                          setProphetDailyTimes(updated);
                          localStorage.setItem("prophet_daily_times", JSON.stringify(updated));
                          notifyProphetChange();
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] rounded transition cursor-pointer flex items-center gap-1"
                      >
                        + {isAr ? "إضافة" : "Add"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Sleep Protection hours - hours from/to */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-900/30 border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-amber-200/70 font-bold flex items-center gap-1.5">
                      <span>🛡️</span>
                      <span>{isAr ? "فترة النشاط اليومية (حماية النوم)" : "Sleep Safe Active Hours"}</span>
                    </label>
                    <span className="text-[9px] text-[#cca05a]">
                      {isAr 
                        ? `نشط من ${prophetActiveHoursStart === 0 ? "12 منتصف الليل" : prophetActiveHoursStart + ":00"} وحتى ${prophetActiveHoursEnd === 0 ? "12 منتصف الليل" : prophetActiveHoursEnd + ":00"}`
                        : `Active: ${prophetActiveHoursStart}:00 to ${prophetActiveHoursEnd}:00`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-slate-400 block">{isAr ? "تنبيه بدءاً من الساعة:" : "Wake hour:"}</span>
                      <select
                        value={prophetActiveHoursStart}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setProphetActiveHoursStart(val);
                          localStorage.setItem("prophet_active_hours_start", String(val));
                          notifyProphetChange();
                        }}
                        className="w-full text-center bg-slate-950 text-slate-300 font-bold border border-white/10 rounded p-1 text-[10px] cursor-pointer"
                      >
                        {Array.from({ length: 24 }).map((_, h) => (
                          <option key={h} value={h}>
                            {String(h).padStart(2, "0")}:00 {h >= 12 ? (isAr ? "مساءً" : "PM") : (isAr ? "صباحاً" : "AM")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[8px] text-slate-400 block">{isAr ? "التوقف عند الساعة:" : "Sleep hour:"}</span>
                      <select
                        value={prophetActiveHoursEnd}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setProphetActiveHoursEnd(val);
                          localStorage.setItem("prophet_active_hours_end", String(val));
                          notifyProphetChange();
                        }}
                        className="w-full text-center bg-slate-950 text-slate-300 font-bold border border-white/10 rounded p-1 text-[10px] cursor-pointer"
                      >
                        {Array.from({ length: 24 }).map((_, h) => (
                          <option key={h} value={h}>
                            {String(h).padStart(2, "0")}:00 {h >= 12 ? (isAr ? "مساءً" : "PM") : (isAr ? "صباحاً" : "AM")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 - Right Segment: Dial Interactive Orbit Dial */}
            <div className="lg:col-span-5 flex flex-col justify-between items-center p-4 rounded-xl border relative bg-slate-950/15 border-[#cca05a]/15">
              
              {/* Milestone ribbon badge */}
              <div className={`absolute top-2 left-2 rounded-lg px-2 py-0.5 text-[9px] font-bold text-white bg-gradient-to-r ${milestone.color}`}>
                {milestone.title}
              </div>

              {/* Circular interactive orbit dial */}
              <div className="my-3 relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-dashed border-[#cca05a]/40 p-1 bg-slate-950/30 select-none">
                <div className="absolute inset-2 rounded-full bg-gradient-to-b from-[#11324c] to-[#04121e] border border-[#cca05a]/20 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-450 leading-none">{isAr ? "صلواتك" : "Salawat"}</span>
                  <span className="text-3xl font-extrabold text-[#cca05a] tracking-tight py-1 font-mono">
                    {blessingsCount}
                  </span>
                  <span className="text-[8px] text-[#cca05a]/60 leading-none">{milestone.level}</span>
                </div>
              </div>

              <div className="w-full flex items-center gap-2 pt-2 border-t border-white/5 font-sans">
                {blessingsCount > 0 && (
                  <button
                    onClick={handleResetBlessings}
                    className="text-[10px] text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 py-2.5 px-3 rounded-lg border border-red-500/20 transition cursor-pointer"
                  >
                    {isAr ? "تصفير" : "Reset"}
                  </button>
                )}
                
                <button
                  onClick={handleIncrementBlessing}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 animate-bounce text-slate-950" />
                  <span>{isAr ? "صَلِّ عَلَيْهِ وَسَلِّمْ" : "Invoke Durood"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔮 REDESIGNED ELITE GREETING HEADER WITH ACTIVE TIMELINE PROGRESS */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 shadow-lg ${
          darkMode
            ? "bg-gradient-to-r from-[#0d2a3f] via-[#071b29] to-[#04121e] border-[#cca05a]/30 text-white"
            : "bg-gradient-to-r from-[#efebd8] via-[#e2d5bd] to-[#d6c7ab] border-amber-900/10 text-slate-950"
        }`}
      >
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 text-[180px] pointer-events-none text-[#cca05a]/40">
          🌙
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className={`space-y-1.5 z-10 max-w-xl ${isAr ? "text-right" : "text-left"}`}>
            <div className={`flex items-center gap-2 ${isAr ? "justify-start" : "justify-start"}`}>
              <span className="bg-amber-500/10 text-[#cca05a] border border-[#cca05a]/25 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                {isAr ? "الحقيبة والمنهاج اليومي الذكي" : "The Intelligent Spiritual Dashboard"}
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-l from-amber-100 via-amber-200 to-yellow-400">
              {isAr ? "السلام عليكم ورحمة الله وبركاته" : "Assalamu Alaikum wa Rahmatullahi wa Barakatuh"}
            </h1>
            <p className="text-xs font-serif leading-relaxed text-slate-200">
              {getGreetingText()}
            </p>
          </div>

          <div className={`flex flex-col items-start ${isAr ? "md:items-end text-right" : "md:items-start text-left"} justify-center space-y-1 shrink-0 z-10 font-sans`}>
            <div className={`flex items-center space-x-1 ${isAr ? "space-x-reverse" : ""} bg-amber-500/10 text-[#cca05a] border border-[#cca05a]/20 px-3 py-1 rounded-full font-bold`}>
              <span className="text-xs leading-none">{hijriDateText}</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-950/20 px-2 py-0.5 rounded mt-1 block">
              {isAr ? "التاريخ الميلادي: " : "Gregorian Date: "} {gregorianDateText}
            </span>
          </div>
        </div>

        {/* Dynamic Prayer Remaining Progress Timeline (Highly Advanced) */}
        <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#cca05a] font-bold">{isAr ? "شريط مرور وقت الصلاة والنداء التالي" : "Prayer remaining time & next adhan progress"}</span>
            <span className="text-slate-300 font-mono">
              {isAr 
                ? `بقي ${nextPrayer.timeLeft} لـ ${nextPrayer.name}` 
                : `${nextPrayer.timeLeft} remaining until ${nextPrayer.name}`} ({use12hFormat ? formatTime12h(nextPrayer.time, isAr) : nextPrayer.time})
            </span>
          </div>
          
          <div className="w-full h-2 rounded-full overflow-hidden bg-slate-950/40 border border-white/5 flex">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-[#cca05a] to-emerald-500 transition-all duration-1000 ease-out"
              style={{ width: `${nextPrayer.percent}%` }}
            />
          </div>
          
          <div className="flex justify-between text-[10px] text-slate-300 leading-none">
            <span>{isAr ? "المرجعية المحلية التلقائية" : "Automatic Local GPS/Time Reference"}</span>
            <span>{isAr ? "التقدم:" : "Progress:"} {nextPrayer.percent}%</span>
          </div>
        </div>
      </div>

      {/* 🔖 QURAN READING BOOKMARK WIDGET */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-all duration-300 ${
          darkMode
            ? "bg-gradient-to-b from-[#091b29] to-[#04121e] border-[#cca05a]/30 text-white"
            : "bg-white border-amber-900/10 text-slate-950"
        }`}
        style={{ direction: dir }}
      >
        <div className="absolute left-4 top-4 opacity-5 text-6xl">🔖</div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#cca05a]/25 mb-4">
          <div className={`flex items-center space-x-2 ${isAr ? "space-x-reverse" : ""} text-[#cca05a]`}>
            <BookMarked className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="text-sm font-extrabold font-sans">
              {isAr ? "موضع القراءة الأخير (علامة الحفظ)" : "Last Reading Position (Bookmark)"}
            </h3>
          </div>
          
          {quranBookmark && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
              {isAr ? "جاهز للمتابعة ✓" : "Ready to continue ✓"}
            </span>
          )}
        </div>

        {quranBookmark ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-1">
            <div className={`flex-1 ${isAr ? "text-right" : "text-left"} space-y-2`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#cca05a] font-serif">
                  {isAr ? "سورة" : "Surah"} {quranBookmark.surahName}
                </span>
                <span className="text-xs bg-slate-950/30 px-2.5 py-1 rounded-full text-slate-300 font-mono font-bold">
                  {isAr ? "الآية" : "Verse"} {quranBookmark.verseNumber}
                </span>
              </div>
              <p className="text-sm font-serif italic text-pretty text-slate-300 leading-relaxed max-w-2xl select-text">
                {quranBookmark.verseText}
              </p>
            </div>

            <button
              onClick={handleReturnToLastRead}
              className="w-full md:w-auto bg-gradient-to-r from-amber-500 via-[#cca05a] to-yellow-500 hover:opacity-95 text-slate-950 font-extrabold text-xs py-3 px-6 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>{isAr ? "متابعة القراءة من حيث توقفت" : "Continue Reading from last stop"}</span>
              <ChevronLeft className={`w-4 h-4 ${isAr ? "" : "rotate-180"}`} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <div className={`flex-1 ${isAr ? "text-right" : "text-left"}`}>
              <p className="text-xs text-slate-400 leading-relaxed font-sans font-light">
                {isAr
                  ? "لم تقم بحفظ أي علامة قراءة حتى الآن. أثناء تصفحك للقرآن الكريم، اضغط على زر 'علامة قراءة 🔖' بجانب أي آية ليتم حفظ موضعك هنا والعودة إليه بضغطة واحدة."
                  : "You haven't bookmarked any reading position yet. While reading the Quran, click the 'Bookmark 🔖' button next to any verse to save your progress here."}
              </p>
            </div>

            <button
              onClick={() => setActiveTab && setActiveTab("quran")}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-950 text-[#cca05a] hover:text-white font-bold text-xs py-2.5 px-5 rounded-xl border border-[#cca05a]/30 hover:border-transparent transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isAr ? "ابدأ القراءة الآن" : "Start Reading Now"}</span>
            </button>
          </div>
        )}
      </div>

      {/* ⚙️ SMART NOTIFICATION CONTROL BAR (Simulate trigger & Settings) */}
      <div className="flex flex-wrap justify-between items-center gap-2 p-3.5 rounded-xl bg-slate-900/40 border border-white/5" style={{ direction: dir }}>
        <div className={`flex items-center space-x-2 ${isAr ? "space-x-reverse" : ""} text-[#cca05a] text-xs font-bold ${isAr ? "text-right" : "text-left"}`}>
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{isAr ? "التنبيه الصوتي والذكي النشط قبل الصلاة بـ 10 دقائق" : "Smart audio & notifications alert active 10 minutes prior to prayer"}</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setSimulateTenMinWarning(!simulateTenMinWarning)}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition duration-300 cursor-pointer ${
              simulateTenMinWarning 
                ? "bg-amber-500 font-bold border-transparent text-slate-950" 
                : "bg-slate-950/40 text-slate-400 border-white/5 hover:text-white"
            }`}
          >
            {simulateTenMinWarning 
              ? (isAr ? "🔴 جاري محاكاة تنبيه الـ 10 دقائق" : "🔴 Simulating 10-Min Pre-Alert") 
              : (isAr ? "🔔 محاكاة تنبيه الـ 10 دقائق" : "🔔 Simulate 10-Min Pre-Alert")}
          </button>
        </div>
      </div>

      {/* 🕌 ACTIVE SMART 10-MINUTE PRAYER PRE-ALERT WARNING */}
      {(isTenMinWarningActive || simulateTenMinWarning) && (
        <div className={`bg-gradient-to-r from-emerald-500/10 via-[#cca05a]/20 to-emerald-500/15 border-2 border-[#cca05a] rounded-2xl p-5 shadow-2xl animate-pulse ${isAr ? "text-right" : "text-left"} relative overflow-hidden`} style={{ direction: dir }}>
          <div className="absolute left-4 top-4 text-3xl opacity-20">🕌</div>
          <div className={`flex items-center space-x-2 ${isAr ? "space-x-reverse" : ""} text-amber-300 font-bold mb-1`}>
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow animate-bounce" />
            <h4 className="text-sm font-extrabold leading-none">
              {isAr ? `🕌 تنبيه ذكي مسبق: اقترب موعد صلاة ${nextPrayer.name}` : `🕌 Smart pre-alert: ${nextPrayer.name} prayer is approaching`}
            </h4>
          </div>
          <p className="text-xs text-white leading-relaxed font-sans mt-2">
            {isAr ? (
              <>
                بقي أقل من <span className="text-[#ffe082] font-extrabold text-sm font-mono leading-none">١٠ دقائق</span> للنداء المبارك لصلاة <span className="text-[#ffe082] font-bold text-sm">{nextPrayer.name}</span> ({use12hFormat ? formatTime12h(nextPrayer.time, isAr) : nextPrayer.time}).
                استعد بالوضوء العاطر في طمأنينة الآن وصلاة السنن الراتبة وتلاوة طائفة من الأذكار لنيل الأجر الكامل الموفور والخشوع في صلاتك.
              </>
            ) : (
              <>
                Less than <span className="text-[#ffe082] font-extrabold text-sm font-mono leading-none">10 minutes</span> left until the blessed call for <span className="text-[#ffe082] font-bold text-sm">{nextPrayer.name}</span> prayer ({use12hFormat ? formatTime12h(nextPrayer.time, isAr) : nextPrayer.time}).
                Prepare yourself now with fragrant Wudu in serenity, pray Sunnah, and recite daily dhikr to attain full reward of worship.
              </>
            )}
          </p>
          <div className={`mt-3.5 flex ${isAr ? "justify-end" : "justify-start"} gap-2 text-xs`}>
            {simulateTenMinWarning && (
              <button onClick={() => setSimulateTenMinWarning(false)} className="text-[10px] bg-slate-950/40 hover:bg-slate-950/60 border border-white/10 px-3 py-1 rounded-lg text-slate-300 cursor-pointer">
                {isAr ? "إغلاق التجربة" : "Close Simulation"}
              </button>
            )}
            <button className="text-[10px] bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-extrabold px-4 py-1.5 rounded-xl shadow cursor-pointer">
              {isAr ? "✨ سأستعد الحين وأصلي النوافل" : "✨ I will prepare now & pray Nafil"}
            </button>
          </div>
        </div>
      )}

      {/* 🌟 RANDOM DYNAMIC ZIKR CARD FOR PEACE OF HEART */}
      <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-lg ${
        darkMode
          ? "bg-gradient-to-b from-[#0b2437] to-[#04121e] border-[#cca05a]/30 text-white"
          : "bg-white border-[#cca05a]/20 text-slate-950"
      }`} style={{ direction: dir }}>
        <div className="absolute left-4 top-4 opacity-5 text-6xl">✨</div>
        
        <div className="flex justify-between items-center pb-3 border-b border-[#cca05a]/25 mb-4">
          <div className={`flex items-center space-x-2 ${isAr ? "space-x-reverse" : ""} text-[#cca05a]`}>
            <Sparkles className="w-4.5 h-4.5 text-amber-450 animate-pulse" />
            <h3 className="text-xs font-bold font-sans">
              {isAr ? "بطاقة الذكر الروحي العشوائي المعطر" : "Sweet-Scented Prophetic Dhikr Card"}
            </h3>
          </div>
          
          <button
            onClick={() => {
              const azkar = [
                "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
                "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
                "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
                "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
                "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
                "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ ﷺ",
                "سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَلَا إِلَهَ إِلَّا اللَّهُ ، وَاللَّهُ أَكْبَرُ",
                "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
                "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ"
              ];
              const curInd = azkar.indexOf(zikrText);
              let nextInd = Math.floor(Math.random() * azkar.length);
              if (nextInd === curInd) {
                nextInd = (nextInd + 1) % azkar.length;
              }
              setZikrText(azkar[nextInd]);
            }}
            className="text-[10px] text-amber-200 hover:text-white bg-slate-950/30 hover:bg-slate-950/50 px-2.5 py-1 rounded-lg border border-[#cca05a]/30 cursor-pointer flex items-center space-x-1"
          >
            <span>{isAr ? "ذكر آخر" : "Next Dhikr"} ↺</span>
          </button>
        </div>

        <div className="py-4 text-center">
          <p className="text-base sm:text-lg font-serif font-bold text-[#ffe082] leading-relaxed px-2 select-text">
            {zikrText}
          </p>
        </div>

        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="text-[10px] text-slate-400 font-sans">
            {isAr ? "تتغير تلقائياً في كل مرة تفتح فيها التطبيق لتعطير لسانك بالحمد والذكر" : "Changes automatically each time you open the app to scent your tongue with praise"}
          </span>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(zikrText + " \nتم النسخ من تطبيق أنا مسلم").then(() => {
                setCopiedZikr(true);
                setTimeout(() => setCopiedZikr(false), 2000);
              });
            }}
            className="text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-[#cca05a] hover:opacity-90 py-1.5 px-4 rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            {copiedZikr ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedZikr ? (isAr ? "تم نسخ الذكر!" : "Copied!") : (isAr ? "نسخ الذكر" : "Copy Dhikr")}</span>
          </button>
        </div>
      </div>

      {/* 📋 أعمال اليوم والسنن المرجعية (Today's Spiritual Checklist) */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-5 relative overflow-hidden ${
        darkMode ? "bg-[#071b29] border-[#cca05a]/20 text-white" : "bg-white border-amber-900/10 text-slate-950"
      }`} style={{ direction: dir }}>
        {/* Decorative ambient background lights */}
        <div className="absolute right-[-20px] top-[-20px] w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-[-20px] bottom-[-20px] w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-500/20 text-emerald-700"
            }`}>
              <Award className="w-5 h-5 shrink-0" />
            </div>
            <div className="text-right">
              <h3 className="text-sm font-extrabold text-amber-400">
                {isAr ? "📋 حقيبة أعمال اليوم والسنن الرواتب" : "📋 Today's Deeds & Sunnah Checklist"}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-light">
                {isAr ? "ثبّت عاداتك الروحية اليومية وحافظ على السنن الرواتب لتنال الأجر الوفير" : "Establish your daily spiritual habits and keep up the rawatib sunnahs"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[9px] text-slate-400 block font-light">{isAr ? "النقاط الإيمانية اليومية" : "Daily Spiritual Points"}</span>
              <span className="text-xs font-mono font-black text-amber-400">
                {DAILY_DEEDS.reduce((sum, deed) => sum + (completedDeeds[deed.id] ? deed.points : 0), 0)} / {DAILY_DEEDS.reduce((sum, deed) => sum + deed.points, 0)} {isAr ? "نقطة" : "pts"}
              </span>
            </div>
            <div className="w-11 h-11 rounded-full border-2 border-[#cca05a]/30 bg-slate-950/40 flex items-center justify-center">
              <span className="text-[11px] font-mono font-black text-emerald-400">
                {DAILY_DEEDS.reduce((sum, deed) => sum + deed.points, 0) > 0 
                  ? Math.round((DAILY_DEEDS.reduce((sum, deed) => sum + (completedDeeds[deed.id] ? deed.points : 0), 0) / DAILY_DEEDS.reduce((sum, deed) => sum + deed.points, 0)) * 100) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] text-slate-300">
            <span>
              {isAr 
                ? `تم إنجاز ${DAILY_DEEDS.filter((deed) => completedDeeds[deed.id]).length} من أصل ${DAILY_DEEDS.length} عبادات اليوم` 
                : `Completed ${DAILY_DEEDS.filter((deed) => completedDeeds[deed.id]).length} of ${DAILY_DEEDS.length} daily habits`}
            </span>
            <span className="font-bold text-emerald-400">
              {DAILY_DEEDS.reduce((sum, deed) => sum + deed.points, 0) > 0 
                ? Math.round((DAILY_DEEDS.reduce((sum, deed) => sum + (completedDeeds[deed.id] ? deed.points : 0), 0) / DAILY_DEEDS.reduce((sum, deed) => sum + deed.points, 0)) * 100) 
                : 0}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-950/40 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 transition-all duration-700 ease-out"
              style={{ 
                width: `${DAILY_DEEDS.reduce((sum, deed) => sum + deed.points, 0) > 0 
                  ? Math.round((DAILY_DEEDS.reduce((sum, deed) => sum + (completedDeeds[deed.id] ? deed.points : 0), 0) / DAILY_DEEDS.reduce((sum, deed) => sum + deed.points, 0)) * 100) 
                  : 0}%` 
              }}
            />
          </div>
        </div>

        {/* Grid of Checklist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAILY_DEEDS.map((deed) => {
            const isCompleted = !!completedDeeds[deed.id];
            return (
              <div
                key={deed.id}
                className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all duration-300 ${
                  isCompleted
                    ? darkMode
                      ? "bg-emerald-950/15 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                      : "bg-emerald-50/50 border-emerald-500/20 shadow-sm"
                    : darkMode
                      ? "bg-slate-950/40 border-white/5 hover:border-[#cca05a]/30"
                      : "bg-slate-50/50 border-amber-900/5 hover:border-[#cca05a]/30"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <button
                      onClick={() => handleToggleDeed(deed.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-slate-950"
                          : "border-slate-500 hover:border-amber-400"
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      deed.category === "quran"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : deed.category === "athkar"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : deed.category === "sunnah"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}>
                      {isAr
                        ? deed.category === "quran"
                          ? "📖 القرآن"
                          : deed.category === "athkar"
                          ? "🕌 الأذكار"
                          : deed.category === "sunnah"
                          ? "✨ السنن"
                          : "⚙️ عام"
                        : deed.category === "quran"
                        ? "📖 Quran"
                        : deed.category === "athkar"
                        ? "🕌 Athkar"
                        : deed.category === "sunnah"
                        ? "✨ Sunnah"
                        : "⚙️ General"}
                    </span>
                  </div>

                  <div className={`${isAr ? "text-right" : "text-left"} space-y-1`}>
                    <h4 className={`text-xs font-extrabold transition-all ${isCompleted ? "text-emerald-400 line-through opacity-70" : darkMode ? "text-white" : "text-slate-950"}`}>
                      {isAr ? deed.titleAr : deed.titleEn}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                      {isAr ? deed.descAr : deed.descEn}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-3">
                  <span className="text-[9.5px] font-mono text-amber-500 font-bold">
                    +{deed.points} {isAr ? "نقطة" : "pts"}
                  </span>

                  {deed.targetTab && setActiveTab && (
                    <button
                      onClick={() => setActiveTab(deed.targetTab!)}
                      className="text-[9.5px] font-bold text-[#cca05a] hover:text-white flex items-center gap-1 cursor-pointer bg-slate-950/40 px-2 py-1 rounded border border-[#cca05a]/20 transition hover:bg-slate-950/70"
                    >
                      <span>{isAr ? "انتقل للعبادة ↗" : "Go to worship ↗"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📱 INTERACTIVE HOME SCREEN WIDGETS SECTION */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-5 relative overflow-hidden ${
        darkMode ? "bg-gradient-to-r from-[#071d2c] to-[#04121e] border-[#cca05a]/20 text-white" : "bg-white border-amber-900/10 text-slate-950"
      }`} style={{ direction: dir }}>
        {/* Decorative ambient background lights */}
        <div className="absolute right-[-20px] top-[-20px] w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-[-20px] bottom-[-20px] w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              darkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-500/20 text-amber-700"
            }`}>
              <Smartphone className="w-5 h-5 shrink-0" />
            </div>
            <div className="text-right">
              <h3 className="text-sm font-extrabold text-amber-400">
                {isAr ? "📱 أدوات الشاشة الرئيسية التفاعلية" : "📱 Interactive Home Screen Widgets"}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isAr ? "ودجات تفاعلية لعرض موعد الصلاة وآية اليوم دون الحاجة لفتح التطبيق" : "Interactive home screen widget simulators for instant daily prayers and verses"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/20 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setWidgetInstTab("android")}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                widgetInstTab === "android"
                  ? "bg-[#cca05a] text-slate-950 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isAr ? "أندرويد" : "Android"}
            </button>
            <button
              onClick={() => setWidgetInstTab("ios")}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                widgetInstTab === "ios"
                  ? "bg-[#cca05a] text-slate-950 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isAr ? "آيفون (iOS)" : "iPhone (iOS)"}
            </button>
          </div>
        </div>

        {/* 1. Widgets Grid Simulator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Widget A: Next Prayer Widget */}
          <div className="bg-gradient-to-b from-slate-950 to-slate-900 border border-[#cca05a]/30 rounded-2xl p-4 flex flex-col justify-between shadow-xl min-h-[175px] relative overflow-hidden group">
            {/* Mosque silhouette background */}
            <div className="absolute right-0 bottom-0 opacity-10 text-7xl select-none pointer-events-none transition-transform duration-500 group-hover:scale-110">🕌</div>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-400/80 font-bold tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                {isAr ? "الصلاة القادمة" : "Next Prayer"}
              </span>
              <span className="bg-amber-500/10 text-amber-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-amber-500/20">
                {isAr ? "ودجت مباشر" : "Live Widget"}
              </span>
            </div>

            <div className="my-3 text-right">
              <span className="text-2xl font-black text-amber-150 block tracking-tight">
                {nextPrayer.name}
              </span>
              <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
                <span className="text-3xl font-mono font-black text-white leading-none">
                  {use12hFormat ? formatTime12h(nextPrayer.time, isAr) : nextPrayer.time}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {isAr ? "بتوقيتك" : "Local"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[9px] text-emerald-400 font-bold animate-pulse">
                ⏳ {isAr ? `بقي: ${nextPrayer.timeLeft}` : `Time: ${nextPrayer.timeLeft}`}
              </span>
              <button
                onClick={() => {
                  const timesStr = `🕋 مواقيت الصلاة لليوم حسب موقعك الحالي:
• الفجر: ${prayerTimes[0].time}
• الشروق: ${prayerTimes[1].time}
• الظهر: ${prayerTimes[2].time}
• العصر: ${prayerTimes[3].time}
• المغرب: ${prayerTimes[4].time}
• العشاء: ${prayerTimes[5].time}
تم النسخ من تطبيق "أنا مسلم" - الرفيق الروحي الموثوق.`;
                  handleCopyWidgetText(timesStr, "prayer");
                }}
                className="text-[9px] font-bold text-slate-355 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-900 px-2 py-1 rounded border border-white/5"
              >
                {widgetCopiedText === "prayer" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{widgetCopiedText === "prayer" ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "نسخ المواقيت" : "Copy Times")}</span>
              </button>
            </div>
          </div>

          {/* Widget B: Verse of the Day Widget */}
          <div className="bg-gradient-to-b from-[#091b29] to-[#04121e] border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-xl min-h-[175px] text-right">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-400/80 font-bold tracking-wider flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-500 shrink-0" />
                {isAr ? "آية اليوم العطرة" : "Verse of the Day"}
              </span>
              <button
                onClick={() => setWidgetVerseIndex((prev) => (prev + 1) % widgetVerses.length)}
                className="text-[9px] text-amber-400/80 hover:text-white bg-slate-950/40 px-2 py-0.5 rounded border border-[#cca05a]/20 cursor-pointer animate-pulse"
              >
                {isAr ? "تحديث ↺" : "Next ↺"}
              </button>
            </div>

            <div className="my-3 font-serif">
              <p className="text-xs font-bold text-slate-100 leading-relaxed px-1 text-center">
                " {widgetVerses[widgetVerseIndex].text} "
              </p>
              <span className="text-[9px] text-slate-400 mt-1 block text-left">
                {widgetVerses[widgetVerseIndex].ref}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[8px] text-slate-500 font-bold">
                {isAr ? "يتحدث تلقائياً كل صباح" : "Updates daily at 09:00 AM"}
              </span>
              <button
                onClick={() => {
                  const shareStr = ` قال الله تعالى: { ${widgetVerses[widgetVerseIndex].text} } [${widgetVerses[widgetVerseIndex].ref}]\nشارِك الأجر مع أحبابك. تم النسخ من تطبيق أنا مسلم.`;
                  handleCopyWidgetText(shareStr, "verse");
                }}
                className="text-[9px] font-bold text-slate-355 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-900 px-2 py-1 rounded border border-white/5"
              >
                {widgetCopiedText === "verse" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{widgetCopiedText === "verse" ? (isAr ? "تم!" : "Copied!") : (isAr ? "نسخ ومشاركة" : "Copy & Share")}</span>
              </button>
            </div>
          </div>

          {/* Widget C: Moral Advice Widget */}
          <div className="bg-gradient-to-b from-[#101b15] to-[#040c08] border border-emerald-500/10 rounded-2xl p-4 flex flex-col justify-between shadow-xl min-h-[175px] text-right">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400/80 font-bold tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                {isAr ? "موعظة ونصيحة اليوم" : "Daily Moral Tip"}
              </span>
              <button
                onClick={() => setWidgetMoralIndex((prev) => (prev + 1) % widgetMorals.length)}
                className="text-[9px] text-emerald-400/80 hover:text-white bg-slate-950/40 px-2 py-0.5 rounded border border-emerald-500/20 cursor-pointer animate-pulse"
              >
                {isAr ? "تغيير ↺" : "Change ↺"}
              </button>
            </div>

            <div className="my-3 text-center">
              <p className="text-[11px] text-slate-200 font-sans leading-relaxed px-1 font-medium">
                {widgetMorals[widgetMoralIndex]}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[8px] text-emerald-500/60 font-bold">
                {isAr ? "مكارم الأخلاق النبوية" : "Ethical refinement tip"}
              </span>
              <button
                onClick={() => {
                  const tipStr = `💡 نصيحة اليوم الأخلاقية الراقية:\n"${widgetMorals[widgetMoralIndex]}"\nتطبيق مكارم الأخلاق هو خير عبادة. تم النشر من أنا مسلم.`;
                  handleCopyWidgetText(tipStr, "moral");
                }}
                className="text-[9px] font-bold text-slate-355 hover:text-white flex items-center gap-1 cursor-pointer bg-slate-900 px-2 py-1 rounded border border-white/5"
              >
                {widgetCopiedText === "moral" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{widgetCopiedText === "moral" ? (isAr ? "تم!" : "Copied!") : (isAr ? "نسخ النصيحة" : "Copy Tip")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Interactive Step-by-Step Installation Instruction Card */}
        <div className="p-4 rounded-xl bg-slate-950/30 border border-white/5 space-y-2 text-right" style={{ direction: "rtl" }}>
          <span className="text-xs font-bold text-amber-200 flex items-center gap-1 justify-end">
            <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            {isAr ? `طريقة تثبيت هذه الأدوات (Widgets) على شاشة ${widgetInstTab === "android" ? "هاتفك الأندرويد" : "جهازك الآيفون"}:` : `How to add widgets to your ${widgetInstTab === "android" ? "Android" : "iOS"} device:`}
          </span>
          
          {widgetInstTab === "android" ? (
            <ul className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside pr-1">
              <li>{isAr ? "اذهب إلى شاشتك الرئيسية، ثم اضغط مطولاً على أي مساحة فارغة بها." : "Go to your main home screen, and touch and hold any empty area."}</li>
              <li>{isAr ? "اختر أيقونة 'الأدوات' أو 'الأدوات المصغرة' (Widgets) من الخيارات السفلية." : "Tap the 'Widgets' or 'Add widget' button in the menu that appears."}</li>
              <li>{isAr ? "ابحث في القائمة عن اسم تطبيقنا 'أنا مسلم' أو 'Islamic Smart App'." : "Scroll to find 'Islamic Smart App' or PWA shortcut in the list."}</li>
              <li>{isAr ? "ستظهر لك الأدوات المصغرة المتاحة (مواقيت الصلاة، آية اليوم). اضغط مطولاً على الأداة التي ترغب بها واسحبها للشاشة!" : "Select the size of the widget (e.g., 2x2, 4x2) and drag it to your screen."}</li>
            </ul>
          ) : (
            <ul className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside pr-1">
              <li>{isAr ? "من الشاشة الرئيسية لجهاز الآيفون، اضغط مطولاً على أي تطبيق أو مساحة فارغة حتى تهتز التطبيقات." : "From the Home Screen, touch and hold a widget or an empty area until the apps jiggle."}</li>
              <li>{isAr ? "اضغط على زر الإضافة (+) المتواجد في الزاوية العلوية لشاشة هاتفك." : "Tap the Add (+) button in the upper corner of the screen."}</li>
              <li>{isAr ? "ابحث عن تطبيقنا في محرك البحث أو اختره من قائمة التطبيقات النشطة." : "Scroll down, select the 'Islamic Smart App' icon from the widget gallery."}</li>
              <li>{isAr ? "اختر الحجم المناسب (صغير، متوسط، عريض) واضغط على 'إضافة أداة' (Add Widget) لتستقر بجانب تطبيقاتك وتتحدث تلقائياً." : "Choose from three widget sizes, then tap 'Add Widget' to place it on your screen."}</li>
            </ul>
          )}
        </div>
      </div>

      {/* 🕌 ULTRA-ADVANCED INTERACTIVE DUAL COLUMN BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* RIGHT BENTO: HIGH-FIDELITY COMPASS DIAGRAM */}
        <div
          onClick={handleRotateCompass}
          className={`group rounded-2xl border transition-all duration-300 p-5 shadow-lg relative cursor-pointer overflow-hidden ${
            darkMode
              ? "bg-[#071b29] border-[#cca05a]/20 hover:border-[#cca05a]/50 text-white"
              : "bg-white border-amber-900/10 hover:border-[#cca05a] text-slate-950"
          }`}
          style={{ direction: dir }}
        >
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5 mb-4">
            <div className={`flex items-center space-x-1.5 ${isAr ? "space-x-reverse" : ""}`}>
              <Compass className="w-4 h-4 text-[#cca05a] animate-pulse" />
              <span className="text-xs font-bold text-[#cca05a]">
                {isAr ? "البوصلة التفاعلية لتحديد اتجاه القبلة" : "Interactive Qibla Compass Finder"}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-light">
              {isAr ? "اضغط للضبط التلقائي" : "Click to auto-calibrate"}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            {/* Compass Graphic with Degrees */}
            <div className="relative w-36 h-36 rounded-full border-2 border-dashed border-[#cca05a]/40 bg-slate-950/30 flex items-center justify-center transition-transform hover:scale-105 duration-300 shadow-inner">
              
              {/* Outer Cardinal Headings */}
              <span className="absolute top-1 text-[10px] font-bold text-red-500">{isAr ? "ط (North)" : "N"}</span>
              <span className="absolute bottom-1 text-[10px] font-bold text-slate-400">{isAr ? "ج (South)" : "S"}</span>
              <span className="absolute right-1 text-[10px] font-bold text-slate-400 font-mono">{isAr ? "ق (East)" : "E"}</span>
              <span className="absolute left-1 text-[10px] font-bold text-slate-400 font-mono">{isAr ? "غ (West)" : "W"}</span>

              {/* Kaaba fixed direction beacon (at 225 deg) */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ transform: "rotate(225deg)" }}
              >
                <div className="absolute top-2 flex flex-col items-center">
                  <span className="text-xs animate-bounce" title={isAr ? "الكعبة المطهرة" : "The Holy Kaaba"}>🕋</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute -bottom-1" />
                </div>
              </div>

              {/* Target glowing sector ring */}
              <div className="absolute inset-4 rounded-full border border-[#cca05a]/10" />

              {/* Compass Needle (Rotates) */}
              <div
                className="absolute w-full h-full flex items-center justify-center transition-all duration-700 ease-out"
                style={{ transform: `rotate(${bearing}deg)` }}
              >
                {/* Needle Design */}
                <div className="relative w-3.5 h-24 flex flex-col items-center justify-between">
                  <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[50px] border-b-red-600 rounded-t-full drop-shadow-md" />
                  <div className="w-3 h-3 rounded-full bg-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-slate-950 z-20" />
                  <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[50px] border-t-slate-300 rounded-b-full drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-3 pt-3 border-t border-white/5">
            {bearing === 225 ? (
              <div className="text-emerald-400 text-xs font-bold animate-pulse-gentle flex items-center justify-center gap-1.5 justify-center">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? "✨ تم ضبط اتجاه الصلاة تماماً نحو الكعبة الشريفة (٢٢٥°)" : "✨ Qibla calibrated perfectly towards the Holy Kaaba (225°)"}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-300 font-bold block">
                {isAr ? "مؤشر الضبط الحالي: " : "Current Bearing: "}<span className="text-amber-500 text-sm font-mono font-bold">{bearing}°</span> {isAr ? "(انقر لالتقاط القبلة فوراً)" : "(click to capture Qibla immediately)"}
              </span>
            )}
          </div>
        </div>

        {/* LEFT BENTO: DAILY MULTI-VERSE CAROUSEL TOOL */}
        <div
          className={`rounded-2xl border p-5 shadow-lg relative flex flex-col justify-between overflow-hidden ${
            darkMode
              ? "bg-[#071b29] border-[#cca05a]/20 text-white"
              : "bg-white border-amber-900/10 text-slate-950"
          }`}
          style={{ direction: dir }}
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
            <div className={`flex items-center space-x-1.5 ${isAr ? "space-x-reverse" : ""}`}>
              <BookOpen className="w-4 h-4 text-[#cca05a]" />
              <span className="text-xs font-bold text-[#cca05a]">
                {isAr ? "مقتبسات ومواعظ للتدبر اليومي" : "Daily Quranic Wisdom & Reflections"}
              </span>
            </div>
            
            <div className={`flex items-center space-x-1.5 ${isAr ? "space-x-reverse" : ""}`}>
              <button
                onClick={handlePrevVerse}
                className="p-1 rounded-lg bg-slate-950/20 hover:bg-slate-950/40 text-slate-400 hover:text-[#cca05a] transition cursor-pointer"
                title={isAr ? "السابق" : "Previous"}
              >
                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <span className="text-[10px] font-mono text-amber-500 font-bold">
                {activeVerseIndex + 1} / {dailyVerses.length}
              </span>
              <button
                onClick={handleNextVerse}
                className="p-1 rounded-lg bg-slate-950/20 hover:bg-slate-950/40 text-slate-400 hover:text-[#cca05a] transition cursor-pointer"
                title={isAr ? "التالي" : "Next"}
              >
                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Core Ayah Area */}
          <div className="py-4 text-center my-auto">
            <p className="text-base sm:text-lg font-serif font-extrabold text-[#ffe082] leading-relaxed px-1 select-text">
              {activeVerse.ayah}
            </p>
            <span className="text-[10px] text-amber-500/60 block mt-2 font-mono">
              {getLocalizedSurah(activeVerse.surah)}
            </span>
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={copyVerseToClipboard}
                className="text-xs font-bold text-slate-300 hover:text-white bg-slate-950/30 hover:bg-slate-950/50 py-1.5 px-3 rounded-lg border border-white/5 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isAr ? "تم النسخ" : "Copied!") : (isAr ? "نسخ الآية" : "Copy Verse")}</span>
              </button>

              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-[#cca05a] py-1.5 px-4 rounded-lg shadow transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{showExplanation ? (isAr ? "إخفاء التفسير والتدبر" : "Hide Reflections") : (isAr ? "تدبر وتفسير الآية" : "Reflect & Tafsir")}</span>
              </button>
            </div>

            {/* Collapsible smart explanation card */}
            {showExplanation && (
              <div className={`p-3.5 rounded-xl border border-amber-900/10 bg-[#cca05a]/5 space-y-1 block ${isAr ? "text-right" : "text-left"}`}>
                <span className="text-[10px] text-[#cca05a] font-bold block">{isAr ? "مقتطفات من تفاسير الأئمة والتدبر الوقور:" : "Excerpts from classical Tafsir & spiritual wisdom:"}</span>
                <p className="text-xs text-slate-300 leading-relaxed font-serif font-light select-text">
                  {getLocalizedExplanation(activeVerse.explanation)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🎙️ QURAN LIVE BROADCAST PLAYER WITH ANIMATED CSS SOUND WAVE VISUALIZER */}
      <div 
        className="overflow-hidden rounded-2xl border p-4 shadow-md bg-gradient-to-l from-slate-950 to-[#071b29] border-[#cca05a]/25 flex flex-wrap items-center justify-between gap-4"
        style={{ direction: dir }}
      >
        <div className={`flex items-center space-x-3 ${isAr ? "space-x-reverse text-right" : "text-left"}`}>
          <div className="relative w-10 h-10 bg-[#cca05a]/10 rounded-full flex items-center justify-center text-[#cca05a] shadow-inner">
            <Disc className={`w-6 h-6 z-10 ${isPlayingRadio ? "animate-spin-slow text-yellow-300" : "text-[#cca05a]"}`} />
          </div>
          
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#cca05a] block">
              {isAr ? "بث إذاعة القرآن الكريم المباشر" : "Holy Quran Live Radio Broadcast"}
            </span>
            <span className="text-[10px] text-slate-400 block font-light leading-none">
              {isAr ? "تلاوة عطرة مباركة على مدار الساعة برواية حفص عن عاصم" : "Beautiful 24/7 recitation of the Holy Quran according to Hafs 'an 'Asim"}
            </span>
          </div>
        </div>

        {/* CSS Audio Wave Equalizer (Animate only when radio is active) */}
        <div className={`flex items-end justify-center space-x-1 ${isAr ? "space-x-reverse" : ""} h-8 px-4`}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bar) => {
            // Random duration values and height scopes for organic-looking vibration
            const animDur = `${0.45 + (bar % 3) * 0.15}s`;
            const animDel = `${(bar % 4) * 0.1}s`;
            return (
              <div
                key={bar}
                className={`w-0.75 bg-amber-400 rounded-t-full transition-all duration-300 ${
                  isPlayingRadio ? "animate-bounce" : "h-1 bg-opacity-20"
                }`}
                style={{
                  height: isPlayingRadio ? `${20 + (bar % 3) * 20}%` : "5px",
                  animationDuration: isPlayingRadio ? animDur : "0s",
                  animationDelay: isPlayingRadio ? animDel : "0s",
                  animationIterationCount: "infinite"
                }}
              />
            );
          })}
        </div>

        <button
          onClick={toggleQuranRadio}
          className={`flex items-center space-x-1.5 ${isAr ? "space-x-reverse" : ""} px-5 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
            isPlayingRadio
              ? "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20"
              : "bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 hover:opacity-90"
          }`}
        >
          {isPlayingRadio ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4" />}
          <span>
            {isPlayingRadio 
              ? (isAr ? "إيقاف البث الإذاعي" : "Stop Broadcast") 
              : (isAr ? "استماع للبث المباشر" : "Listen Live")}
          </span>
        </button>
      </div>

      {/* ⏰ EXQUISITE HIGH-POLISHED PRAYER GRID FOR TODAY */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs text-amber-200/50 direction-rtl mb-1 px-1" style={{ direction: "rtl" }}>
          <span className="font-bold text-[#cca05a]">أوقات الصلاة المحلية ومواقيت الفريضة لليوم:</span>
          <span className="font-mono text-slate-400">اليوم المعتمد: {gregorianDateText}</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
          {prayerTimes.map((pt) => {
            const isActive = activePrayerId === pt.id;
            const isFajr = pt.id === "fajr";
            
            return (
              <div
                key={pt.id}
                className={`rounded-2xl border p-4 transition-all duration-300 flex flex-col items-center text-center justify-center space-y-1 relative overflow-hidden ${
                  isActive
                    ? "bg-slate-950/60 border-[#cca05a] shadow-inner scale-[1.03]"
                    : darkMode
                    ? "bg-[#071b29]/80 border-white/5 hover:border-[#cca05a]/30"
                    : "bg-white border-amber-900/10 hover:border-[#cca05a]/20 shadow-sm"
                }`}
              >
                {/* Visual badge top corners */}
                <div className="absolute right-2.5 top-2 text-xs opacity-65">{pt.icon}</div>

                {isActive && (
                  <div className="absolute left-2.5 top-2 rounded-full px-1.5 py-0.5 text-[8px] font-bold bg-emerald-500 text-white animate-pulse">
                    الآن
                  </div>
                )}
                
                <span className="text-xs font-bold text-[#cca05a]/90">{pt.name}</span>
                <span className="text-2xl font-mono font-extrabold tracking-wide">
                  {use12hFormat ? formatTime12h(pt.time, isAr) : pt.time}
                </span>
                <span className="text-[9px] text-slate-400 font-mono tracking-widest block">محلي تلقائي</span>

                {/* Pulsing golden base glow for active prayer */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-[#cca05a]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 📊 INTERACTIVE WEEKLY PRAYER COMMITMENT TRACKER (RECHARTS GRAPH) */}
      <div
        className={`rounded-2xl border p-5 shadow-xl space-y-5 text-right ${
          darkMode
            ? "bg-[#071b29] border-[#cca05a]/20 text-white"
            : "bg-white border-amber-900/10 text-slate-950"
        }`}
        style={{ direction: "rtl" }}
      >
        {/* Title and Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-dashed border-[#cca05a]/20 gap-3" style={{ direction: "rtl" }}>
          <div className="flex items-center space-x-2 space-x-reverse justify-start">
            <div className="w-8 h-8 rounded-lg bg-[#cca05a]/10 flex items-center justify-center text-[#cca05a]">
              <TrendingUp className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-200">لوحة تتبع نسبة الالتزام بالصلوات الخمس في وقتها</h3>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">رسم بياني تفاعلي حي يحلل مدى محافظتك على الصلوات خلال الأسبوع الماضي</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5 space-x-reverse bg-[#cca05a]/10 text-[#cca05a] text-[10px] px-2.5 py-1 rounded-full font-bold self-start sm:self-center border border-[#cca05a]/15">
            <Calendar className="w-3.5 h-3.5" />
            <span>آخر ٧ أيام للصلوات المفروضة</span>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Stat 1: Avg Commitment */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            darkMode ? "bg-slate-950/45 border-white/5" : "bg-slate-50 border-amber-900/5 shadow-sm"
          }`}>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-light leading-none">متوسط التزامك الأسبوعي</span>
              <span className="text-xl font-extrabold text-[#cca05a]">{averageCommitment}%</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-sm font-bold">
              📈
            </div>
          </div>

          {/* Stat 2: Total On-Time Prayers */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            darkMode ? "bg-slate-950/45 border-white/5" : "bg-slate-50 border-amber-900/5 shadow-sm"
          }`}>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-light leading-none">صلوات في وقتها (الأسبوع)</span>
              <span className="text-xl font-extrabold text-emerald-400">{totalOnTimeCount} / ٣٥</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm font-bold">
              🕌
            </div>
          </div>

          {/* Stat 3: Best/Peak Committed Day */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            darkMode ? "bg-slate-950/45 border-white/5" : "bg-slate-50 border-amber-900/5 shadow-sm"
          }`}>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-light leading-none">أعلى يوم التزام في العبادة</span>
              <span className="text-xl font-extrabold text-blue-400">{bestDay}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm font-bold">
              👑
            </div>
          </div>
        </div>

        {/* The Recharts Graphical Interface */}
        <div className={`p-3 rounded-xl border ${
          darkMode ? "bg-slate-950/30 border-white/5" : "bg-slate-50/50 border-amber-900/5"
        }`}>
          <div className="h-60 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorCommitmentVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cca05a" stopOpacity={darkMode ? 0.35 : 0.2}/>
                    <stop offset="95%" stopColor="#cca05a" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: darkMode ? '#94a3b8' : '#475569', fontSize: 10 }}
                  stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: darkMode ? '#94a3b8' : '#475569', fontSize: 10 }}
                  stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#0a1d2c' : '#ffffff',
                    border: darkMode ? '1px solid rgba(204, 160, 90, 0.3)' : '1px solid rgba(139, 92, 26, 0.15)',
                    borderRadius: '12px',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    direction: 'rtl',
                    textAlign: 'right',
                    fontSize: '11px',
                    fontFamily: 'sans-serif',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  formatter={(value: any) => [`${value}%`, 'نسبة الالتزام بالصلاة']}
                  labelFormatter={(label) => `يوم ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="الالتزام" 
                  stroke="#cca05a" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorCommitmentVal)" 
                  activeDot={{ r: 6, stroke: darkMode ? '#071b29' : '#ffffff', strokeWidth: 2, fill: '#cca05a' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Past 7 Days Interactive Selector Buttons */}
        <div className="space-y-2">
          <span className="text-[10px] text-slate-400 block font-bold">اختيار اليوم لعرض السجل وتعديله:</span>
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none justify-start select-none" style={{ direction: "rtl" }}>
            {past7Days.map((day) => {
              const isSelected = selectedLogDate === day.dateStr;
              const dayLog = prayerLogs[day.dateStr] || { fajr: "missed", dhuhr: "missed", asr: "missed", maghrib: "missed", isha: "missed" };
              
              let points = 0;
              Object.values(dayLog).forEach((item) => {
                if (item === "ontime") points += 100;
                else if (item === "late") points += 50;
              });
              const score = Math.round(points / 5);

              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedLogDate(day.dateStr)}
                  className={`flex-none px-4 py-2 rounded-xl border text-center transition-all duration-300 min-w-[76px] cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-b from-[#cca05a] to-[#b38947] text-slate-950 font-bold border-[#cca05a] shadow-md scale-[1.02]"
                      : darkMode
                      ? "bg-slate-950/40 border-white/5 hover:border-[#cca05a]/30 text-slate-300"
                      : "bg-slate-100 border-slate-200 hover:border-[#cca05a]/30 text-slate-700"
                  }`}
                >
                  <div className="text-[10px] opacity-75">{day.dayName}</div>
                  <div className="text-xs font-bold tracking-tight mt-0.5">{day.shortDate}</div>
                  <div className={`text-[9px] mt-1 px-1 rounded-full ${
                    isSelected 
                      ? "bg-slate-900/35 text-white" 
                      : score === 100 
                      ? "bg-emerald-500/15 text-emerald-400" 
                      : score >= 50 
                      ? "bg-amber-500/15 text-amber-500" 
                      : "bg-red-500/15 text-red-500"
                  }`}>
                    {score}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Logging Editor for the Selected Day */}
        {selectedLogDate && (
          <div className={`border rounded-xl p-4.5 space-y-3.5 transition-all duration-300 ${
            darkMode ? "bg-slate-950/25 border-white/5" : "bg-slate-50/60 border-amber-900/5"
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-dashed border-white/10" style={{ direction: "rtl" }}>
              <div className="flex items-center space-x-1.5 space-x-reverse">
                <span className="text-xs">📅</span>
                <h4 className="text-xs font-bold text-amber-200">
                  تفاصيل صلوات يوم: {past7Days.find(d => d.dateStr === selectedLogDate)?.dayName || "اليوم"} ({selectedLogDate})
                </h4>
              </div>
              <span className="text-[9px] text-slate-400 font-light">تعديلك يحدث الرسم البياني والإحصائيات مباشرة</span>
            </div>

            <div className="space-y-2.5">
              {[
                { id: "fajr", name: "صلاة الفجر", icon: "🌅" },
                { id: "dhuhr", name: "صلاة الظهر", icon: "☀️" },
                { id: "asr", name: "صلاة العصر", icon: "⛅" },
                { id: "maghrib", name: "صلاة المغرب", icon: "🌇" },
                { id: "isha", name: "صلاة العشاء", icon: "🌃" }
              ].map((pr) => {
                const activeDayLog = prayerLogs[selectedLogDate] || { fajr: "missed", dhuhr: "missed", asr: "missed", maghrib: "missed", isha: "missed" };
                const currentStatus = activeDayLog[pr.id] || "missed";

                return (
                  <div key={pr.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border gap-2.5 transition-all ${
                    darkMode ? "bg-slate-950/40 border-white/5" : "bg-white border-slate-200/50 shadow-sm"
                  }`} style={{ direction: "rtl" }}>
                    {/* Prayer name and icon */}
                    <div className="flex items-center space-x-2 space-x-reverse justify-start">
                      <span className="text-sm">{pr.icon}</span>
                      <span className={`text-xs font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{pr.name}</span>
                    </div>

                    {/* Tri-state toggle selector */}
                    <div className="grid grid-cols-3 gap-1 w-full sm:w-auto">
                      {/* On-Time Pill */}
                      <button
                        onClick={() => updatePrayerStatus(selectedLogDate, pr.id, "ontime")}
                        className={`py-1 px-2.5 rounded-lg text-[10px] font-bold text-center transition cursor-pointer ${
                          currentStatus === "ontime"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 shadow-inner"
                            : darkMode
                            ? "bg-slate-900 border border-white/5 text-slate-400 hover:border-slate-800"
                            : "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200/60"
                        }`}
                      >
                        في وقتها
                      </button>

                      {/* Late Pill */}
                      <button
                        onClick={() => updatePrayerStatus(selectedLogDate, pr.id, "late")}
                        className={`py-1 px-2.5 rounded-lg text-[10px] font-bold text-center transition cursor-pointer ${
                          currentStatus === "late"
                            ? "bg-amber-500/15 text-amber-500 border border-amber-500/35 shadow-inner"
                            : darkMode
                            ? "bg-slate-900 border border-white/5 text-slate-400 hover:border-slate-800"
                            : "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200/60"
                        }`}
                      >
                        متأخرة / قضاء
                      </button>

                      {/* Missed Pill */}
                      <button
                        onClick={() => updatePrayerStatus(selectedLogDate, pr.id, "missed")}
                        className={`py-1 px-2.5 rounded-lg text-[10px] font-bold text-center transition cursor-pointer ${
                          currentStatus === "missed"
                            ? "bg-red-500/5 text-red-400 border border-red-500/20 shadow-inner"
                            : darkMode
                            ? "bg-slate-900 border border-white/5 text-slate-400 hover:border-slate-800"
                            : "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200/60"
                        }`}
                      >
                        فائتة / لم تأدّ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ⚙️ INTEGRATED TYPOGRAPHY & READING LABORATORY (GLASS CARD) */}
      <div
        className={`rounded-2xl border p-5 shadow-xl space-y-5 ${
          isAr ? "text-right" : "text-left"
        } ${
          darkMode
            ? "bg-[#071b29] border-[#cca05a]/20 text-white"
            : "bg-white border-amber-900/10 text-slate-950"
        }`}
        style={{ direction: dir }}
      >
        <div className={`flex items-center space-x-2 ${isAr ? "space-x-reverse" : ""} justify-start pb-2.5 border-b border-white/5`}>
          <div className="w-8 h-8 rounded-lg bg-[#cca05a]/10 flex items-center justify-center text-[#cca05a]">
            <Settings className="w-4.5 h-4.5 text-amber-500 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-amber-200">{t("settings_title")}</h3>
            <p className="text-[10px] text-slate-400 font-light mt-0.5">{t("settings_desc")}</p>
          </div>
        </div>

        {/* 🌐 GENERAL LANGUAGE SETTINGS SEGMENT */}
        <div className="bg-slate-950/25 p-4 rounded-xl border border-white/5 space-y-3">
          <span className="text-xs font-bold text-amber-400 block">
            {t("lang_settings_label")}
          </span>
          <p className="text-[10px] text-slate-400 font-light">
            {t("lang_settings_desc")}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => { if (!isAr) toggleLanguage(); }}
              className={`py-2 px-4 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                isAr
                  ? "bg-[#cca05a]/20 border-[#cca05a] text-amber-100 shadow-sm"
                  : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white"
              }`}
            >
              العربية (Arabic)
            </button>
            <button
              onClick={() => { if (isAr) toggleLanguage(); }}
              className={`py-2 px-4 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                !isAr
                  ? "bg-[#cca05a]/20 border-[#cca05a] text-amber-100 shadow-sm"
                  : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white"
              }`}
            >
              English (English)
            </button>
          </div>
        </div>

        {/* 🎨 THEME CUSTOMIZATION SEGMENT */}
        <div className="bg-slate-950/25 p-4 rounded-xl border border-white/5 space-y-3">
          <span className="text-xs font-bold text-amber-400 block">
            {t("theme_settings_label")}
          </span>
          <p className="text-[10px] text-slate-400 font-light">
            {t("theme_settings_desc")}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
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
                  className={`flex items-center space-x-2 space-x-reverse py-2 px-3.5 rounded-lg border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? `border-amber-500 bg-[#cca05a]/20 text-white shadow-md scale-[1.02] font-extrabold`
                      : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white hover:bg-slate-950/60"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${theme.colorBg} shrink-0 shadow-sm`} />
                  <span>{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
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
          </div>
        </div>

        {/* Real-time Dynamic View Previewer Plate */}
        <div className="bg-slate-950/30 p-4 rounded-xl border border-white/5 space-y-3">
          <span className="text-[10px] text-slate-400 font-bold block">{t("font_preview_title")}</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quran preview */}
            <div className="bg-slate-950/40 p-3.5 rounded-lg border border-[#cca05a]/10 space-y-1 text-center">
              <span className={`text-[9px] text-[#cca05a] block font-bold ${isAr ? "text-right" : "text-left"}`}>{t("font_preview_quran_label")}</span>
              <p 
                className="text-white text-pretty leading-relaxed"
                style={{ 
                  fontSize: `${quranFontSize}px`, 
                  fontFamily: quranFontStyle === "serif" 
                    ? "'Amiri', serif" 
                    : quranFontStyle === "naskh" 
                    ? "'Noto Naskh Arabic', sans-serif" 
                    : "system-ui, sans-serif" 
                }}
              >
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ <br/>
                « كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ »
              </p>
            </div>

            {/* Hadith preview */}
            <div className={`bg-slate-950/40 p-3.5 rounded-lg border border-[#cca05a]/10 space-y-1 ${isAr ? "text-right" : "text-left"}`}>
              <span className="text-[9px] text-[#cca05a] block font-bold">{t("font_preview_hadith_label")}</span>
              <p 
                className="text-zinc-200 text-pretty leading-relaxed"
                style={{ 
                  fontSize: `${hadithFontSize}px`, 
                  fontFamily: hadithFontStyle === "serif" 
                    ? "'Amiri', serif" 
                    : hadithFontStyle === "naskh" 
                    ? "'Noto Naskh Arabic', sans-serif" 
                    : "system-ui, sans-serif" 
                }}
              >
                « إنَّما الأعْمالُ بالنِّيّاتِ، وإنَّما لِكُلِّ امْرِئٍ ما نَوَى »
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 LIGHTBOX MODAL FOR APP ICONS */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md" style={{ direction: dir }}>
          <div className="relative max-w-lg w-full bg-slate-900 border border-[#cca05a]/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title={isAr ? "إغلاق" : "Close"}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-[#cca05a] font-sans">
              {lightboxImage.title}
            </h3>

            <div className="aspect-square w-full max-w-[300px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-serif max-w-sm">
              {lightboxImage.desc}
            </p>

            <button
              onClick={() => setLightboxImage(null)}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-95 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              {isAr ? "إغلاق المعاينة" : "Close Preview"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
