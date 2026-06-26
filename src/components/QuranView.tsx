import React, { useState, useRef, useEffect } from "react";
import { 
  Search, ChevronLeft, ChevronRight, BookOpen, Sparkles, Volume2, Info, Moon, 
  BookMarked, Play, Pause, Bookmark, Check, Copy, Sliders, ChevronDown, 
  ChevronUp, Download, Wifi, WifiOff, RefreshCw, AlertCircle, Heart,
  Maximize2, Minimize2, Eye, EyeOff, Sun, Clock, Smartphone
} from "lucide-react";
import { quranData } from "../data/islamicData";
import { quranIndex } from "../data/quranIndex";
import { Surah, FavoriteVerse } from "../types";

export const SURAH_PAGE_RANGES: Record<number, { start: number; end: number }> = {
  1: { start: 1, end: 1 },
  2: { start: 2, end: 49 },
  3: { start: 50, end: 76 },
  4: { start: 77, end: 105 },
  5: { start: 106, end: 127 },
  6: { start: 128, end: 150 },
  7: { start: 151, end: 176 },
  8: { start: 177, end: 186 },
  9: { start: 187, end: 207 },
  10: { start: 208, end: 220 },
  11: { start: 221, end: 234 },
  12: { start: 235, end: 248 },
  13: { start: 249, end: 254 },
  14: { start: 255, end: 261 },
  15: { start: 262, end: 266 },
  16: { start: 267, end: 281 },
  17: { start: 282, end: 292 },
  18: { start: 293, end: 304 },
  19: { start: 305, end: 311 },
  20: { start: 312, end: 321 },
  21: { start: 322, end: 331 },
  22: { start: 332, end: 341 },
  23: { start: 342, end: 349 },
  24: { start: 350, end: 358 },
  25: { start: 359, end: 366 },
  26: { start: 367, end: 376 },
  27: { start: 377, end: 384 },
  28: { start: 385, end: 395 },
  29: { start: 396, end: 403 },
  30: { start: 404, end: 410 },
  31: { start: 411, end: 414 },
  32: { start: 415, end: 417 },
  33: { start: 418, end: 427 },
  34: { start: 428, end: 433 },
  35: { start: 434, end: 439 },
  36: { start: 440, end: 445 },
  37: { start: 446, end: 452 },
  38: { start: 453, end: 457 },
  39: { start: 458, end: 466 },
  40: { start: 467, end: 476 },
  41: { start: 477, end: 482 },
  42: { start: 483, end: 488 },
  43: { start: 489, end: 495 },
  44: { start: 496, end: 498 },
  45: { start: 499, end: 501 },
  46: { start: 502, end: 506 },
  47: { start: 507, end: 510 },
  48: { start: 511, end: 514 },
  49: { start: 515, end: 517 },
  50: { start: 518, end: 519 },
  51: { start: 520, end: 522 },
  52: { start: 523, end: 525 },
  53: { start: 526, end: 527 },
  54: { start: 528, end: 530 },
  55: { start: 531, end: 533 },
  56: { start: 534, end: 536 },
  57: { start: 537, end: 541 },
  58: { start: 542, end: 544 },
  59: { start: 545, end: 548 },
  60: { start: 549, end: 550 },
  61: { start: 551, end: 552 },
  62: { start: 553, end: 554 },
  63: { start: 554, end: 555 },
  64: { start: 556, end: 557 },
  65: { start: 558, end: 559 },
  66: { start: 560, end: 561 },
  67: { start: 562, end: 563 },
  68: { start: 564, end: 565 },
  69: { start: 566, end: 567 },
  70: { start: 568, end: 569 },
  71: { start: 570, end: 571 },
  72: { start: 572, end: 573 },
  73: { start: 574, end: 575 },
  74: { start: 575, end: 577 },
  75: { start: 577, end: 578 },
  76: { start: 578, end: 579 },
  77: { start: 580, end: 581 },
  78: { start: 582, end: 583 },
  79: { start: 583, end: 584 },
  80: { start: 585, end: 586 },
  81: { start: 586, end: 586 },
  82: { start: 587, end: 587 },
  83: { start: 587, end: 588 },
  84: { start: 589, end: 590 },
  85: { start: 590, end: 590 },
  86: { start: 591, end: 591 },
  87: { start: 591, end: 592 },
  88: { start: 592, end: 593 },
  89: { start: 593, end: 594 },
  90: { start: 594, end: 595 },
  91: { start: 595, end: 595 },
  92: { start: 595, end: 596 },
  93: { start: 596, end: 596 },
  94: { start: 596, end: 597 },
  95: { start: 597, end: 597 },
  96: { start: 597, end: 598 },
  97: { start: 598, end: 598 },
  98: { start: 598, end: 599 },
  99: { start: 599, end: 599 },
  100: { start: 599, end: 600 },
  101: { start: 600, end: 600 },
  102: { start: 600, end: 601 },
  103: { start: 601, end: 601 },
  104: { start: 601, end: 601 },
  105: { start: 601, end: 601 },
  106: { start: 602, end: 602 },
  107: { start: 602, end: 602 },
  108: { start: 602, end: 602 },
  109: { start: 603, end: 603 },
  110: { start: 603, end: 603 },
  111: { start: 603, end: 603 },
  112: { start: 604, end: 604 },
  113: { start: 604, end: 604 },
  114: { start: 604, end: 604 }
};

export function getSurahPageInfo(surahNum: number, totalVerses: number) {
  const range = SURAH_PAGE_RANGES[surahNum] || { start: 1, end: 1 };
  const numPages = range.end - range.start + 1;
  const step = totalVerses / numPages;
  return { startPage: range.start, endPage: range.end, numPages, step };
}

export function getAyahPages(surah: Surah): number[] {
  if (surah.ayahPages && surah.ayahPages.length === surah.verses.length) {
    return surah.ayahPages;
  }
  // Fallback generation if not present
  const total = surah.verses.length;
  const range = SURAH_PAGE_RANGES[surah.number] || { start: 1, end: 1 };
  const numPages = range.end - range.start + 1;
  const step = total / numPages;
  const pages: number[] = [];
  for (let i = 0; i < total; i++) {
    const pIdx = Math.min(numPages - 1, Math.floor(i / step));
    pages.push(range.start + pIdx);
  }
  return pages;
}

export function getMushafPageIndexForVerse(surahNum: number, totalVerses: number, verseNum: number, ayahPages?: number[]) {
  if (ayahPages && ayahPages.length > 0) {
    const uniquePages = Array.from(new Set(ayahPages)).sort((a, b) => a - b);
    const targetPage = ayahPages[verseNum - 1];
    if (targetPage !== undefined) {
      const idx = uniquePages.indexOf(targetPage);
      if (idx !== -1) return idx;
    }
  }
  const { numPages, step } = getSurahPageInfo(surahNum, totalVerses);
  for (let p = 0; p < numPages; p++) {
    const start = Math.floor(p * step);
    const end = Math.floor((p + 1) * step);
    if (verseNum - 1 >= start && verseNum - 1 < end) {
      return p;
    }
  }
  return 0;
}

export function stripTashkeel(text: string): string {
  return text
    // Remove all tashkeel (diacritics)
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Remove Quranic small pause marks and ornament characters
    .replace(/[\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
    // Replace alef wasla with normal alef
    .replace(/\u0671/g, "ا");
}

export function isWordOfMajesty(word: string): boolean {
  const stripped = stripTashkeel(word);
  const targets = [
    "الله", "لله", 
    "بالله", "والله", "تالله", "فالله", "أالله", "وبالله", "فبالله", "أبالله",
    "ولله", "فلله", "أولله",
    "اللهم", "واللهم"
  ];
  return targets.includes(stripped);
}

export function renderUthmaniTextWithAllahRed(text: string): React.ReactNode[] {
  const words = text.split(" ");
  return words.map((word, idx) => {
    const isMajesty = isWordOfMajesty(word);
    return (
      <React.Fragment key={idx}>
        <span className={isMajesty ? "text-[#d32f2f] font-extrabold dark:text-red-500 drop-shadow-[0_0.5px_0.5px_rgba(239,68,68,0.2)]" : ""}>
          {word}
        </span>
        {idx < words.length - 1 ? " " : ""}
      </React.Fragment>
    );
  });
}

export function toArabicNumerals(num: number | string): string {
  const arabicMap: { [key: string]: string } = {
    "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
    "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩"
  };
  return String(num).replace(/[0-9]/g, (d) => arabicMap[d]);
}

export function getJuzNameAndNumberForPage(page: number): { number: number, nameAr: string } {
  if (page <= 21) return { number: 1, nameAr: "الجُزْءُ الأَوَّلُ" };
  if (page <= 41) return { number: 2, nameAr: "الجُزْءُ الثَّانِي" };
  if (page <= 61) return { number: 3, nameAr: "الجُزْءُ الثَّالِثُ" };
  if (page <= 81) return { number: 4, nameAr: "الجُزْءُ الرَّابِعُ" };
  if (page <= 101) return { number: 5, nameAr: "الجُزْءُ الخَامِسُ" };
  if (page <= 121) return { number: 6, nameAr: "الجُزْءُ السَّادِسُ" };
  if (page <= 141) return { number: 7, nameAr: "الجُزْءُ السَّابِعُ" };
  if (page <= 161) return { number: 8, nameAr: "الجُزْءُ الثَّامِنُ" };
  if (page <= 181) return { number: 9, nameAr: "الجُزْءُ التَّاسِعُ" };
  if (page <= 201) return { number: 10, nameAr: "الجُزْءُ العَاشِرُ" };
  if (page <= 221) return { number: 11, nameAr: "الجُزْءُ الحَادِي عَشَرَ" };
  if (page <= 241) return { number: 12, nameAr: "الجُزْءُ الثَّانِي عَشَرَ" };
  if (page <= 261) return { number: 13, nameAr: "الجُزْءُ الثَّالِثُ عَشَرَ" };
  if (page <= 281) return { number: 14, nameAr: "الجُزْءُ الرَّابِعُ عَشَرَ" };
  if (page <= 301) return { number: 15, nameAr: "الجُزْءُ الخَامِسُ عَشَرَ" };
  if (page <= 321) return { number: 16, nameAr: "الجُزْءُ السَّادِسَ عَشَرَ" };
  if (page <= 341) return { number: 17, nameAr: "الجُزْءُ السَّابِعَ عَشَرَ" };
  if (page <= 361) return { number: 18, nameAr: "الجُزْءُ الثَّامِنَ عَشَرَ" };
  if (page <= 381) return { number: 19, nameAr: "الجُزْءُ التَّاسِعَ عَشَرَ" };
  if (page <= 401) return { number: 20, nameAr: "الجُزْءُ العِشْرُونَ" };
  if (page <= 421) return { number: 21, nameAr: "الجُزْءُ الحَادِي وَالعِشْرُونَ" };
  if (page <= 441) return { number: 22, nameAr: "الجُزْءُ الثَّانِي وَالعِشْرُونَ" };
  if (page <= 461) return { number: 23, nameAr: "الجُزْءُ الثَّالِثُ وَالعِشْرُونَ" };
  if (page <= 481) return { number: 24, nameAr: "الجُزْءُ الرَّابِعُ وَالعِشْرُونَ" };
  if (page <= 501) return { number: 25, nameAr: "الجُزْءُ الخَامِسُ وَالعِشْرُونَ" };
  if (page <= 521) return { number: 26, nameAr: "الجُزْءُ السَّادِسُ وَالعِشْرُونَ" };
  if (page <= 541) return { number: 27, nameAr: "الجُزْءُ السَّابِعُ وَالعِشْرُونَ" };
  if (page <= 561) return { number: 28, nameAr: "الجُزْءُ الثَّامِنُ وَالعِشْرُونَ" };
  if (page <= 581) return { number: 29, nameAr: "الجُزْءُ التَّاسِعُ وَالعِشْرُونَ" };
  return { number: 30, nameAr: "الجُزْءُ الثَّلَاثُونَ" };
}

export function getHizbInfoForPage(page: number): string {
  if (page <= 1) return "الحزب ١";
  const hizbNum = Math.floor((page - 2) / 10) + 1;
  return `الحزب ${toArabicNumerals(hizbNum)}`;
}

export function VerseEndSymbol({ number }: { number: number }) {
  return (
    <span className="inline-flex items-center justify-center mx-1 select-none align-middle relative" style={{ width: '1.9em', height: '1.9em' }}>
      <svg className="absolute inset-0 w-full h-full text-[#cca05a]/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5">
        <circle cx="50" cy="50" r="34" strokeWidth="5" />
        <path d="M 50 4 L 50 16" strokeWidth="10" strokeLinecap="round" />
        <path d="M 50 84 L 50 96" strokeWidth="10" strokeLinecap="round" />
        <path d="M 4 50 L 16 50" strokeWidth="10" strokeLinecap="round" />
        <path d="M 84 50 L 96 50" strokeWidth="10" strokeLinecap="round" />
        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" />
        {/* Intricate decorative internal petals */}
        <path d="M 32 32 A 18 18 0 0 1 68 32 A 18 18 0 0 1 68 68 A 18 18 0 0 1 32 68 Z" strokeWidth="2" strokeDasharray="none" />
      </svg>
      <span className="relative z-10 font-mono text-[9px] font-bold text-amber-500 dark:text-amber-300 mt-0.5">
        {toArabicNumerals(number)}
      </span>
    </span>
  );
}

export default function QuranView({ darkMode = true }: { darkMode?: boolean }) {
  const [selectedSurahMeta, setSelectedSurahMeta] = useState<any>(quranIndex[0]);
  const [currentSurahData, setCurrentSurahData] = useState<Surah | null>(quranData[0]);
  const [isLoadingSurah, setIsLoadingSurah] = useState<boolean>(false);
  const [surahError, setSurahError] = useState<string | null>(null);

  const [fontSize, setFontSize] = useState<number>(() => {
    return Number(localStorage.getItem("quran_font_size") || "24");
  });
  const [fontStyle, setFontStyle] = useState<string>(() => {
    return localStorage.getItem("quran_font_style") || "serif";
  });
  const [displayMode, setDisplayMode] = useState<"detailed" | "continuous">("detailed");
  const [mushafPage, setMushafPage] = useState<number>(0);

  const surahPages = currentSurahData ? getAyahPages(currentSurahData) : [];
  const uniquePages = Array.from(new Set(surahPages)).sort((a, b) => a - b);
  const numPages = uniquePages.length || 1;
  const startPage = uniquePages[0] || (SURAH_PAGE_RANGES[selectedSurahMeta.number]?.start || 1);
  const endPage = uniquePages[uniquePages.length - 1] || (SURAH_PAGE_RANGES[selectedSurahMeta.number]?.end || 1);
  const step = currentSurahData ? currentSurahData.verses.length / numPages : 1;

  const [searchWord, setSearchWord] = useState<string>("");
  const [searchMode, setSearchMode] = useState<"surahs" | "ayyahs" | "favorites">("surahs");
  const [ayahSearchResults, setAyahSearchResults] = useState<any[]>([]);
  const [isSearchingAyahs, setIsSearchingAyahs] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [explainingAyahIdx, setExplainingAyahIdx] = useState<number | null>(null);
  const [aiExplanationText, setAiExplanationText] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Bookmarking state
  const [bookmark, setBookmark] = useState<{ surahNumber: number; surahName: string; verseNumber: number; verseText: string } | null>(() => {
    const saved = localStorage.getItem("quran_bookmark");
    return saved ? JSON.parse(saved) : null;
  });
  const [bookmarkStatusId, setBookmarkStatusId] = useState<number | null>(null);

  // Favorites state
  const [favorites, setFavorites] = useState<FavoriteVerse[]>(() => {
    const saved = localStorage.getItem("quran_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const handleToggleFavorite = (verseText: string, verseNum: number, translationText: string) => {
    const isFav = favorites.some(
      (f) => f.surahNumber === selectedSurahMeta.number && f.verseNumber === verseNum
    );
    let updated: FavoriteVerse[];
    if (isFav) {
      updated = favorites.filter(
        (f) => !(f.surahNumber === selectedSurahMeta.number && f.verseNumber === verseNum)
      );
    } else {
      updated = [
        ...favorites,
        {
          surahNumber: selectedSurahMeta.number,
          surahName: selectedSurahMeta.name,
          verseNumber: verseNum,
          verseText,
          translationText
        }
      ];
    }
    setFavorites(updated);
    localStorage.setItem("quran_favorites", JSON.stringify(updated));
  };

  // Reading Mode & Auto-scrolling
  const [isReadingMode, setIsReadingMode] = useState<boolean>(false);
  const [autoScrollActive, setAutoScrollActive] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1); // Scale 1 - 5, map to scrolling increment
  const scrollIntervalRef = useRef<any>(null);
  const mainContainerRef = useRef<HTMLDivElement | null>(null);

  // --- Focus Mode (وضع التركيز) States ---
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [preFocusFontSize, setPreFocusFontSize] = useState<number>(24);
  const [focusModeDarkMode, setFocusModeDarkMode] = useState<boolean>(darkMode);
  const [showTafsirInFocus, setShowTafsirInFocus] = useState<boolean>(false);
  const [focusTime, setFocusTime] = useState<string>("");
  const focusContainerRef = useRef<HTMLDivElement | null>(null);

  // Live clock effect for Focus Mode
  useEffect(() => {
    if (!isFocusMode) return;
    const updateTime = () => {
      const now = new Date();
      setFocusTime(now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isFocusMode]);

  // --- Screen Wake Lock (منع إطفاء الشاشة) ---
  const [isWakeLockEnabled, setIsWakeLockEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("quran_wakelock_enabled") === "true";
    }
    return false;
  });
  const wakeLockSentinelRef = useRef<any>(null);

  const requestWakeLock = async () => {
    if (typeof window === "undefined" || !("wakeLock" in navigator)) return;
    try {
      if (wakeLockSentinelRef.current) return;
      const sentinel = await (navigator as any).wakeLock.request("screen");
      wakeLockSentinelRef.current = sentinel;
      sentinel.addEventListener("release", () => {
        wakeLockSentinelRef.current = null;
      });
      console.log("Wake Lock acquired successfully");
    } catch (err) {
      console.error("Failed to acquire wake lock:", err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockSentinelRef.current) {
      try {
        await wakeLockSentinelRef.current.release();
        wakeLockSentinelRef.current = null;
        console.log("Wake Lock released successfully");
      } catch (err) {
        console.error("Failed to release wake lock:", err);
      }
    }
  };

  useEffect(() => {
    if (isWakeLockEnabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [isWakeLockEnabled]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && isWakeLockEnabled) {
        await requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isWakeLockEnabled]);

  const toggleWakeLock = () => {
    const nextVal = !isWakeLockEnabled;
    setIsWakeLockEnabled(nextVal);
    localStorage.setItem("quran_wakelock_enabled", nextVal ? "true" : "false");
  };

  // Recitation Simulator
  const [activeAyahRecitation, setActiveAyahRecitation] = useState<number | null>(null);
  const [isAudioSimulating, setIsAudioSimulating] = useState<boolean>(false);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== "undefined" ? window.speechSynthesis : null);

  // Network offline status
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== "undefined" ? navigator.onLine : true);

  // Preloading & downloading Quran for offline use state
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadMessage, setDownloadMessage] = useState<string>("");
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [cachedSurahsCount, setCachedSurahsCount] = useState<number>(0);

  // Fetch count of cached surahs in localStorage
  useEffect(() => {
    const getCachedCount = () => {
      let count = 0;
      for (let i = 1; i <= 114; i++) {
        if (localStorage.getItem(`cached_surah_${i}`)) {
          count++;
        }
      }
      setCachedSurahsCount(count);
    };
    getCachedCount();
  }, [currentSurahData, isDownloadingAll]);

  // Network Status Listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle dynamic external selected surah requests (e.g. from global search)
  useEffect(() => {
    const checkPendingSurah = () => {
      const pending = localStorage.getItem("quran_select_surah_pending");
      if (pending === "true") {
        localStorage.removeItem("quran_select_surah_pending");
        const sNumStr = localStorage.getItem("quran_selected_surah_num");
        if (sNumStr) {
          const sNum = Number(sNumStr);
          const meta = quranIndex.find((s) => s.number === sNum);
          if (meta) {
            setSelectedSurahMeta(meta);
            setMushafPage(0); // reset page to start
          }
        }
      }
    };
    checkPendingSurah();
    const interval = setInterval(checkPendingSurah, 350);
    return () => clearInterval(interval);
  }, []);

  // Handle auto-jumping to saved bookmark on mount if redirected from Dashboard
  useEffect(() => {
    if (localStorage.getItem("quran_jump_to_bookmark_pending") === "true") {
      localStorage.removeItem("quran_jump_to_bookmark_pending");
      
      const saved = localStorage.getItem("quran_bookmark");
      if (saved) {
        try {
          const bmk = JSON.parse(saved);
          setBookmark(bmk);
          
          setTimeout(() => {
            const targetSurahMeta = quranIndex.find(s => s.number === bmk.surahNumber);
            if (targetSurahMeta) {
              const surahData = quranData.find(s => s.number === bmk.surahNumber);
              const totalVerses = surahData ? surahData.verses.length : targetSurahMeta.numberOfAyahs;
              let targetAyahPages: number[] | undefined;
              try {
                const cached = localStorage.getItem(`cached_surah_${bmk.surahNumber}`);
                if (cached) {
                  targetAyahPages = JSON.parse(cached).ayahPages;
                }
              } catch (e) {}
              const pageIndex = getMushafPageIndexForVerse(bmk.surahNumber, totalVerses, bmk.verseNumber, targetAyahPages);
              setMushafPage(pageIndex);
              setSelectedSurahMeta(targetSurahMeta);
              
              setTimeout(() => {
                const elId = displayMode === "detailed" 
                  ? `verse-card-${bmk.verseNumber}` 
                  : `mushaf-verse-${bmk.verseNumber}`;
                const el = document.getElementById(elId);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                  el.classList.add("ring-2", "ring-[#cca05a]", "duration-500");
                  setTimeout(() => {
                    el.classList.remove("ring-2", "ring-[#cca05a]");
                  }, 2000);
                }
              }, 800);
            }
          }, 300);
        } catch (e) {
          console.error("Error auto-jumping to bookmark:", e);
        }
      }
    }
  }, []);

  // Sync / Load selected surah content with offline-first checks
  useEffect(() => {
    setMushafPage(0);
    const loadSurahText = async () => {
      setIsLoadingSurah(true);
      setSurahError(null);
      const sNumber = selectedSurahMeta.number;

      // 1. Check if it's one of our preloaded static complete surahs (e.g., Al-Fatihah, Al-Ikhlas, Al-Falaq, An-Nas)
      // And we avoid using them if they are mere extracts ("مقتطفات")
      const staticSurah = quranData.find(s => s.number === sNumber);
      if (staticSurah && staticSurah.verses && staticSurah.verses.length > 0 && !staticSurah.name.includes("مقتطفات")) {
        setCurrentSurahData(staticSurah);
        setIsLoadingSurah(false);
        return;
      }

      // 2. Check if cached in LocalStorage
      try {
        const cached = localStorage.getItem(`cached_surah_${sNumber}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.ayahPages && parsed.ayahPages.length > 0) {
            setCurrentSurahData(parsed);
            setIsLoadingSurah(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Error reading surah cache from localstorage", e);
      }

      // 3. Fetch from dynamic Al-Quran platform API
      try {
        const [arRes, trRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${sNumber}/quran-uthmani`),
          fetch(`https://api.alquran.cloud/v1/surah/${sNumber}/ar.jalalayn`)
        ]);

        if (!arRes.ok || !trRes.ok) {
          throw new Error("Failed to fetch surah data from API network.");
        }

        const arData = await arRes.json();
        const trData = await trRes.json();

        if (arData.code === 200 && trData.code === 200) {
          const combined: Surah = {
            number: sNumber,
            name: selectedSurahMeta.name,
            englishName: selectedSurahMeta.englishName,
            revelationType: selectedSurahMeta.revelationType,
            numberOfAyahs: selectedSurahMeta.numberOfAyahs,
            verses: arData.data.ayahs.map((a: any) => a.text),
            translation: trData.data.ayahs.map((a: any) => a.text),
            ayahPages: arData.data.ayahs.map((a: any) => a.page)
          };

          // Save in local storage forever
          localStorage.setItem(`cached_surah_${sNumber}`, JSON.stringify(combined));
          setCurrentSurahData(combined);
          setSurahError(null);
        } else {
          throw new Error("Failed response from public API.");
        }
      } catch (err) {
        console.warn(err);
        // Fallback: If we have static partial, show it
        if (staticSurah) {
          setCurrentSurahData(staticSurah);
          setSurahError("⚠️ تم تحميل مقتطفات السورة المحفوظة محلياً لعدم توفر إنترنت.");
        } else {
          setCurrentSurahData(null);
          setSurahError("⚠️ السورة غير متوفرة أوفلاين. يرجى الاتصال بالإنترنت لتحميلها لأول مرة ثم حفظها تلقائياً.");
        }
      } finally {
        setIsLoadingSurah(false);
      }
    };

    loadSurahText();
  }, [selectedSurahMeta]);

  // Auto-scroll loop effect
  useEffect(() => {
    if (autoScrollActive) {
      const interval = setInterval(() => {
        const activeContainer = isFocusMode ? focusContainerRef.current : mainContainerRef.current;
        if (activeContainer) {
          activeContainer.scrollBy({
            top: scrollSpeed,
            behavior: "auto"
          });
        }
      }, 50);
      scrollIntervalRef.current = interval;
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    }
    
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [autoScrollActive, scrollSpeed, isFocusMode]);

  // Bookmarks helper functions
  const handleSaveBookmark = (verseText: string, verseNum: number) => {
    const newBmk = {
      surahNumber: selectedSurahMeta.number,
      surahName: selectedSurahMeta.name,
      verseNumber: verseNum,
      verseText: verseText.slice(0, 30) + "..."
    };
    setBookmark(newBmk);
    localStorage.setItem("quran_bookmark", JSON.stringify(newBmk));
    setBookmarkStatusId(verseNum);
    setTimeout(() => setBookmarkStatusId(null), 2500);
    window.dispatchEvent(new Event("quran-bookmark-updated"));
  };

  const handleLoadBookmark = () => {
    if (!bookmark) return;
    const targetSurahMeta = quranIndex.find(s => s.number === bookmark.surahNumber);
    if (targetSurahMeta) {
      const surahData = quranData.find(s => s.number === bookmark.surahNumber);
      const totalVerses = surahData ? surahData.verses.length : targetSurahMeta.numberOfAyahs;
      let targetAyahPages: number[] | undefined;
      try {
        const cached = localStorage.getItem(`cached_surah_${bookmark.surahNumber}`);
        if (cached) {
          targetAyahPages = JSON.parse(cached).ayahPages;
        }
      } catch (e) {}
      const pageIndex = getMushafPageIndexForVerse(bookmark.surahNumber, totalVerses, bookmark.verseNumber, targetAyahPages);
      setMushafPage(pageIndex);
      setSelectedSurahMeta(targetSurahMeta);
      setTimeout(() => {
        const elId = displayMode === "detailed" 
          ? `verse-card-${bookmark.verseNumber}` 
          : `mushaf-verse-${bookmark.verseNumber}`;
        const el = document.getElementById(elId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-[#cca05a]", "duration-500");
          setTimeout(() => {
            el.classList.remove("ring-2", "ring-[#cca05a]");
          }, 2000);
        }
      }, 600);
    }
  };

  const filteredSurahs = quranIndex.filter(
    (s) => s.name.includes(searchWord) || s.englishName.toLowerCase().includes(searchWord.toLowerCase())
  );

  const normalizeArabic = (text: string): string => {
    return text
      .replace(/[\u064B-\u0652]/g, "") // remove diacritics/tashkeel
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/[\s_]+/g, " ")
      .trim();
  };

  const navigateToVerse = (surahNum: number, verseNum: number) => {
    const targetSurahMeta = quranIndex.find(s => s.number === surahNum);
    if (targetSurahMeta) {
      const surahData = quranData.find(s => s.number === surahNum);
      const totalVerses = surahData ? surahData.verses.length : targetSurahMeta.numberOfAyahs;
      let targetAyahPages: number[] | undefined;
      try {
        const cached = localStorage.getItem(`cached_surah_${surahNum}`);
        if (cached) {
          targetAyahPages = JSON.parse(cached).ayahPages;
        }
      } catch (e) {}
      const pageIndex = getMushafPageIndexForVerse(surahNum, totalVerses, verseNum, targetAyahPages);
      setMushafPage(pageIndex);
      setSelectedSurahMeta(targetSurahMeta);
      setTimeout(() => {
        const elId = displayMode === "detailed" 
          ? `verse-card-${verseNum}` 
          : `mushaf-verse-${verseNum}`;
        const el = document.getElementById(elId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-4", "ring-[#cca05a]", "duration-1000");
          setTimeout(() => {
            if (el) el.classList.remove("ring-4", "ring-[#cca05a]");
          }, 4000);
        }
      }, 1000);
    }
  };

  const executeSmartSearch = async (val: string) => {
    if (!val || val.trim().length < 2) {
      setAyahSearchResults([]);
      return;
    }
    setIsSearchingAyahs(true);
    setSearchError(null);
    const cleanedVal = val.trim();
    const normalizedQuery = normalizeArabic(cleanedVal);

    let localResults: any[] = [];

    // Search locally in static preloaded complete surahs
    quranData.forEach((s) => {
      if (s.verses && s.verses.length > 0 && !s.name.includes("مقتطفات")) {
        s.verses.forEach((verse, vIdx) => {
          const normVerse = normalizeArabic(verse);
          if (normVerse.includes(normalizedQuery)) {
            localResults.push({
              surahNumber: s.number,
              surahName: s.name,
              verseNumber: vIdx + 1,
              text: verse,
              translation: s.translation?.[vIdx] || "",
              source: "local"
            });
          }
        });
      }
    });

    // Check localStorage for cached surahs
    for (let i = 1; i <= 114; i++) {
      try {
        const cached = localStorage.getItem(`cached_surah_${i}`);
        if (cached) {
          const sObj = JSON.parse(cached);
          if (sObj && sObj.verses) {
            sObj.verses.forEach((verse: string, vIdx: number) => {
              const normVerse = normalizeArabic(verse);
              if (normVerse.includes(normalizedQuery)) {
                // check duplicates
                const isDup = localResults.some(r => r.surahNumber === sObj.number && r.verseNumber === vIdx + 1);
                if (!isDup) {
                  localResults.push({
                    surahNumber: sObj.number,
                    surahName: sObj.name,
                    verseNumber: vIdx + 1,
                    text: verse,
                    translation: sObj.translation?.[vIdx] || "",
                    source: "local"
                  });
                }
              }
            });
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }

    // Sort local results by surah number, then verse number
    localResults.sort((a, b) => {
      if (a.surahNumber !== b.surahNumber) return a.surahNumber - b.surahNumber;
      return a.verseNumber - b.verseNumber;
    });

    // If online, also search Al-Quran Cloud API as a secondary fallback for non-cached verses
    if (isOnline) {
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(cleanedVal)}/all/quran-uthmani`);
        if (response.ok) {
          const apiData = await response.json();
          if (apiData.code === 200 && apiData.data && apiData.data.matches) {
            const apiResults = apiData.data.matches.map((m: any) => ({
              surahNumber: m.surah.number,
              surahName: m.surah.name,
              verseNumber: m.numberInSurah,
              text: m.text,
              translation: "",
              source: "api"
            }));

            // Merge results avoiding duplicate surah+verse
            const seen = new Set(localResults.map(r => `${r.surahNumber}-${r.verseNumber}`));
            apiResults.forEach((r: any) => {
              const key = `${r.surahNumber}-${r.verseNumber}`;
              if (!seen.has(key)) {
                localResults.push(r);
                seen.add(key);
              }
            });
          }
        }
      } catch (err) {
        console.warn("API Search failed, using local/cached results.", err);
      }
    }

    setAyahSearchResults(localResults);
    setIsSearchingAyahs(false);
  };

  // Debounced search trigger
  useEffect(() => {
    if (searchMode !== "ayyahs") return;
    const delayDebounceFn = setTimeout(() => {
      executeSmartSearch(searchWord);
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchWord, searchMode]);

  const startAyahRecitationSim = (idx: number, verseText: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    if (activeAyahRecitation === idx && isAudioSimulating) {
      setIsAudioSimulating(false);
      setActiveAyahRecitation(null);
      return;
    }

    setActiveAyahRecitation(idx);
    setIsAudioSimulating(true);

    const cleanArabicText = verseText.replace(/[\u064B-\u0652]/g, ""); 
    const utterance = new SpeechSynthesisUtterance(cleanArabicText);
    utterance.lang = "ar";
    utterance.rate = 0.85;

    utterance.onend = () => {
      setIsAudioSimulating(false);
      setActiveAyahRecitation(null);
    };

    utterance.onerror = () => {
      setIsAudioSimulating(false);
      setActiveAyahRecitation(null);
    };

    synthRef.current.speak(utterance);
  };

  // AI Verse Tafsir helper
  const explainAyahWithAI = async (ayahText: string, idx: number) => {
    setExplainingAyahIdx(idx);
    setAiExplanationText("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verse: ayahText,
          surahName: selectedSurahMeta.name,
          verseNumber: idx + 1,
        }),
      });
      
      const data = await response.json();
      if (data.explanation) {
        setAiExplanationText(data.explanation);
      } else {
        setAiExplanationText("الرجاء تشغيل السيرفر وتوصيل مفتاح الذكاء الاصطناعي للحصول على تفسير فوري مفصل.");
      }
    } catch (e) {
      setAiExplanationText("عذراً، تعذر الاتصال بمساعد التفسير بالذكاء الاصطناعي حالياً. يمكنك الاستعانة بالتفسير الميسر المرفق بالأسفل.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Pre-download all 114 Surahs for perfect offline operation
  const downloadAllSurahsForOffline = async () => {
    if (isDownloadingAll) return;
    setIsDownloadingAll(true);
    setDownloadError(null);
    setDownloadProgress(0);
    setDownloadMessage("جاري إعداد الاتصال بالخادم...");

    try {
      for (let i = 1; i <= 114; i++) {
        setDownloadProgress(i);
        const name = quranIndex[i-1].name;
        setDownloadMessage(`جاري تنزيل سورة ${name} وتفسيرها (${i} من ١١٤)...`);

        // If already in localStorage, skip API fetch
        if (localStorage.getItem(`cached_surah_${i}`)) {
          continue;
        }

        const [arRes, trRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${i}/quran-uthmani`),
          fetch(`https://api.alquran.cloud/v1/surah/${i}/ar.jalalayn`)
        ]);

        if (!arRes.ok || !trRes.ok) {
          throw new Error(`تعذر جلب السورة رقم ${i} من الخادم.`);
        }

        const arData = await arRes.json();
        const trData = await trRes.json();

        if (arData.code === 200 && trData.code === 200) {
          const surahMeta = quranIndex[i-1];
          const combined = {
            number: i,
            name: surahMeta.name,
            englishName: surahMeta.englishName,
            revelationType: surahMeta.revelationType,
            numberOfAyahs: surahMeta.numberOfAyahs,
            verses: arData.data.ayahs.map((a: any) => a.text),
            translation: trData.data.ayahs.map((a: any) => a.text)
          };
          localStorage.setItem(`cached_surah_${i}`, JSON.stringify(combined));
        } else {
          throw new Error(`خطأ بالبيانات المسترجعة للسورة ${i}`);
        }

        // Gentle timeout to avoid flooding rate limits
        await new Promise((r) => setTimeout(r, 60));
      }
      setDownloadMessage("🎉 مبارك! تم تنزيل ترجمة وتلاوة القرآن كاملاً (١١٤ سورة) أوفلاين بنجاح.");
      setCachedSurahsCount(114);
    } catch (err: any) {
      console.error(err);
      setDownloadError("⚠️ حدث خطأ أثناء تنزيل السور. يرجى التحقق من اتصال الإنترنت ثم إعادة المحاولة.");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleEnterFocusMode = () => {
    setPreFocusFontSize(fontSize);
    setFontSize(Math.max(fontSize + 6, 32));
    setFocusModeDarkMode(darkMode);
    setIsFocusMode(true);
    
    // Attempt standard HTML5 fullscreen
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }
  };

  const handleExitFocusMode = () => {
    setFontSize(preFocusFontSize);
    setIsFocusMode(false);
    setAutoScrollActive(false);
    
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const isSpeaking = activeAyahRecitation !== null && isAudioSimulating;

  if (isFocusMode) {
    const activeRealPage = uniquePages[mushafPage] || startPage + mushafPage;
    const juzInfo = getJuzNameAndNumberForPage(activeRealPage);
    const hizbInfo = getHizbInfoForPage(activeRealPage);

    return (
      <div 
        className={`fixed inset-0 z-50 flex flex-col transition-colors duration-300 select-none overflow-hidden ${
          focusModeDarkMode ? "bg-[#040c14] text-[#f4ecd8]" : "bg-[#fcfbf9] text-slate-900"
        }`}
        style={{ direction: "rtl" }}
      >
        {/* Elegant glassmorphic top bar */}
        <div className={`flex flex-wrap items-center justify-between px-4 py-3 border-b backdrop-blur-md transition-colors ${
          focusModeDarkMode ? "bg-slate-950/60 border-white/10 text-white" : "bg-white/80 border-slate-200 text-slate-800"
        }`}>
          {/* Right side: Title & Juz info */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <h2 className="text-sm font-extrabold font-serif">
                سورة {selectedSurahMeta.name} • {juzInfo.nameAr} ({hizbInfo})
              </h2>
              <p className="text-[10px] text-slate-400 font-light">
                وضع التركيز والتلاوة الخاشعة مفعّل
              </p>
            </div>
          </div>

          {/* Center: Live clock and spiritual reminder */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/30 border border-white/5 text-xs text-[#cca05a] font-serif font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{focusTime}</span>
            <span className="text-white/20">|</span>
            <span>أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ</span>
          </div>

          {/* Left side: Controls (Font, Theme, Exit) */}
          <div className="flex items-center gap-3">
            {/* Tafsir Switcher */}
            {displayMode === "detailed" && (
              <button
                onClick={() => setShowTafsirInFocus(!showTafsirInFocus)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                  showTafsirInFocus
                    ? "bg-[#cca05a] text-slate-950 border-transparent font-extrabold shadow"
                    : focusModeDarkMode
                      ? "bg-slate-900/40 text-slate-300 border-white/10 hover:border-white/20"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {showTafsirInFocus ? "✓ التفسير معروض" : "📖 عرض التفسير"}
              </button>
            )}

            {/* Display Mode toggle (مفصل vs مصحف) */}
            <div className="flex bg-slate-950/45 p-1 rounded-lg border border-white/5 text-[10px] gap-1">
              <button
                onClick={() => setDisplayMode("detailed")}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  displayMode === "detailed" ? "bg-[#cca05a] text-slate-950 font-bold" : "text-white/60 hover:text-white"
                }`}
              >
                مفصل
              </button>
              <button
                onClick={() => setDisplayMode("continuous")}
                className={`px-2 py-0.5 rounded transition cursor-pointer ${
                  displayMode === "continuous" ? "bg-[#cca05a] text-slate-950 font-bold" : "text-white/60 hover:text-white"
                }`}
              >
                مصحف
              </button>
            </div>

            {/* Font Style */}
            <div className="hidden sm:flex items-center bg-slate-950/45 p-1 rounded-lg border border-white/5 text-[10px] gap-1">
              {[
                { id: "serif", name: "عثماني" },
                { id: "naskh", name: "نسخ" },
                { id: "sans", name: "نظام" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFontStyle(item.id)}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                    fontStyle === item.id ? "bg-[#cca05a] text-slate-950 font-bold" : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* Font Size decrease/increase buttons */}
            <div className="flex items-center bg-slate-950/45 p-1 rounded-lg border border-white/5 text-xs gap-1 select-none">
              <button
                onClick={() => setFontSize(size => Math.max(16, size - 2))}
                className="w-5 h-5 flex items-center justify-center rounded text-white/70 hover:text-white hover:bg-white/5 transition cursor-pointer font-bold"
                title="تصغير الخط"
              >
                -
              </button>
              <span className="text-[10px] font-mono text-amber-300 px-1 font-bold">{fontSize}px</span>
              <button
                onClick={() => setFontSize(size => Math.min(50, size + 2))}
                className="w-5 h-5 flex items-center justify-center rounded text-white/70 hover:text-white hover:bg-white/5 transition cursor-pointer font-bold"
                title="تكبير الخط"
              >
                +
              </button>
            </div>

            {/* Stay Awake Toggle (منع إطفاء الشاشة) */}
            <button
              onClick={toggleWakeLock}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                isWakeLockEnabled
                  ? "bg-emerald-600 text-white border-transparent shadow"
                  : focusModeDarkMode
                    ? "bg-slate-905 bg-slate-900/40 text-slate-300 border-white/10 hover:border-white/20"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
              title={isWakeLockEnabled ? "ميزة منع إطفاء الشاشة مفعّلة" : "تفعيل ميزة منع إطفاء الشاشة أثناء القراءة"}
            >
              <Smartphone className={`w-3.5 h-3.5 ${isWakeLockEnabled ? "text-yellow-300 animate-pulse" : ""}`} />
              <span className="hidden sm:inline">{isWakeLockEnabled ? "الشاشة نشطة ✓" : "إبقاء الشاشة مضيئة"}</span>
            </button>

            {/* Light/Dark Toggle */}
            <button
              onClick={() => setFocusModeDarkMode(!focusModeDarkMode)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                focusModeDarkMode 
                  ? "bg-slate-900/40 text-amber-300 border-white/10 hover:border-white/20" 
                  : "bg-white text-amber-600 border-slate-200 hover:bg-slate-100"
              }`}
              title="تبديل الإضاءة الليلية"
            >
              {focusModeDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Exit Focus Mode Button */}
            <button
              onClick={handleExitFocusMode}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-md"
              title="خروج من وضع التركيز والعودة للوحة التحكم"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>خروج ✕</span>
            </button>
          </div>
        </div>

        {/* Focus Mode Scrollable Text Container */}
        <div 
          ref={focusContainerRef}
          className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-6 scroll-smooth"
        >
          {/* Centered holy title before verses */}
          <div className="text-center space-y-2 mb-10">
            <span className="text-[#cca05a] text-xs font-bold tracking-widest block select-none">❖ أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ ❖</span>
            {selectedSurahMeta.number !== 1 && selectedSurahMeta.number !== 9 && (
              <div className="text-center py-4">
                <span className={`text-2xl md:text-3xl font-serif font-extrabold block tracking-wide select-none ${
                  focusModeDarkMode ? "text-amber-200" : "text-amber-800"
                }`}>
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </span>
                <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-[#cca05a]/60 to-transparent mx-auto mt-3" />
              </div>
            )}
          </div>

          {currentSurahData && currentSurahData.verses ? (
            displayMode === "detailed" ? (
              /* Detailed Flow in Focus Mode */
              <div className="max-w-3xl mx-auto space-y-8 pb-20">
                {currentSurahData.verses.map((v, idx) => {
                  // Skip visual duplicate Bismillah if already rendered as header
                  if (selectedSurahMeta.number !== 1 && idx === 0 && v.includes("بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ")) {
                    return null;
                  }

                  const isSpeaking = activeAyahRecitation === idx && isAudioSimulating;

                  return (
                    <div
                      key={idx}
                      id={`focus-verse-card-${idx + 1}`}
                      className={`group p-5 rounded-2xl border transition-all duration-500 ${
                        isSpeaking 
                          ? "border-[#cca05a]/60 bg-[#cca05a]/10 shadow-[0_0_20px_rgba(204,160,90,0.08)]" 
                          : focusModeDarkMode 
                            ? "bg-slate-950/25 border-white/5 hover:border-white/10" 
                            : "bg-amber-500/5 border-slate-200/50 hover:border-[#cca05a]/30"
                      }`}
                    >
                      {/* Arabic Verse */}
                      <div className="text-right leading-[2.1] select-text">
                        <span
                          className="font-bold leading-relaxed text-right inline-block text-pretty mb-3"
                          style={{ 
                            fontSize: `${fontSize}px`, 
                            color: isSpeaking 
                              ? (focusModeDarkMode ? "#ffeb3b" : "#b25e00") 
                              : (focusModeDarkMode ? "#f3ecc5" : "#1e293b"),
                            fontFamily: fontStyle === "serif" 
                              ? "'Amiri', serif" 
                              : fontStyle === "naskh" 
                              ? "'Noto Naskh Arabic', sans-serif" 
                              : "system-ui, sans-serif"
                          }}
                        >
                          {v}
                        </span>
                        <VerseEndSymbol number={idx + 1} />
                      </div>

                      {/* Optional Tafsir translation under each verse */}
                      {showTafsirInFocus && currentSurahData.translation && currentSurahData.translation[idx] && (
                        <div className={`p-3.5 rounded-xl border mt-3 transition-colors ${
                          focusModeDarkMode ? "bg-slate-950/50 border-white/5" : "bg-white border-slate-200"
                        }`}>
                          <p className="text-xs leading-relaxed font-sans font-light text-right text-slate-400">
                            <strong className="text-amber-500/85 font-bold ml-1">{idx + 1}. التفسير:</strong>
                            {currentSurahData.translation[idx]}
                          </p>
                        </div>
                      )}

                      {/* Quiet Hover action buttons inside Focus Mode */}
                      <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex gap-2 justify-start items-center border-t border-white/5 pt-2.5 mt-3 transition-opacity duration-350">
                        <button
                          onClick={() => startAyahRecitationSim(idx, v)}
                          className="flex items-center space-x-1 space-x-reverse bg-slate-950/40 hover:bg-slate-950 border border-[#cca05a]/25 px-2.5 py-1 rounded-lg text-[9.5px] text-yellow-100 transition cursor-pointer"
                        >
                          {isSpeaking ? <Pause className="w-3 h-3 text-red-400" /> : <Play className="w-3 h-3 text-amber-400" />}
                          <span>{isSpeaking ? "إيقاف الاستماع" : "استماع للآية"}</span>
                        </button>
                        
                        <button
                          onClick={() => handleSaveBookmark(v, idx + 1)}
                          className="flex items-center space-x-1 space-x-reverse bg-slate-950/40 hover:bg-slate-950 border border-[#cca05a]/25 px-2.5 py-1 rounded-lg text-[9.5px] text-amber-100 transition cursor-pointer"
                        >
                          <Bookmark className={`w-3 h-3 ${bookmark?.surahNumber === selectedSurahMeta.number && bookmark?.verseNumber === idx + 1 ? "fill-amber-400 text-amber-400" : "text-slate-450"}`} />
                          <span>علامة قراءة 🔖</span>
                        </button>

                        <button
                          onClick={() => handleToggleFavorite(v, idx + 1, currentSurahData.translation?.[idx] || "")}
                          className="flex items-center space-x-1 space-x-reverse bg-slate-950/40 hover:bg-slate-950 border border-[#cca05a]/25 px-2.5 py-1 rounded-lg text-[9.5px] text-amber-100 transition cursor-pointer"
                        >
                          <Heart className={`w-3 h-3 ${favorites.some(f => f.surahNumber === selectedSurahMeta.number && f.verseNumber === idx + 1) ? "fill-red-500 text-red-500" : "text-slate-450"}`} />
                          <span>تفضيل ❤️</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Mushaf Paginated View in Focus Mode */
              <div className="flex flex-col items-center justify-center space-y-6 pb-20 select-text max-w-2xl mx-auto">
                {/* Traditional Frame */}
                <div 
                  className={`relative w-full rounded-2xl border-4 p-5 md:p-8 overflow-hidden transition-all duration-300 ${
                    focusModeDarkMode 
                      ? "bg-[#050f16] border-[#cca05a] shadow-2xl" 
                      : "bg-[#fcfbf7] border-[#b08846] shadow-xl"
                  }`}
                  style={{
                    borderStyle: "double",
                    borderWidth: "8px"
                  }}
                >
                  {/* Decorative corners */}
                  <div className="absolute top-2 right-2 text-amber-500/20 text-lg">✴</div>
                  <div className="absolute top-2 left-2 text-amber-500/20 text-lg">✴</div>
                  <div className="absolute bottom-2 right-2 text-amber-500/20 text-lg">✴</div>
                  <div className="absolute bottom-2 left-2 text-amber-500/20 text-lg">✴</div>

                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-[#cca05a]/20 pb-3 mb-6 select-none text-xs text-[#cca05a] font-serif">
                    <span>{selectedSurahMeta.name}</span>
                    <span>❈ {juzInfo.nameAr} ❈</span>
                    <span>صفحة {toArabicNumerals(activeRealPage)}</span>
                  </div>

                  {/* Text body */}
                  <div 
                    className={`text-center leading-[2.6] tracking-wide text-pretty select-text ${
                      focusModeDarkMode ? "text-[#f3ecc5]" : "text-[#1c1a16]"
                    }`} 
                    style={{ 
                      fontSize: `${fontSize + 3}px`,
                      fontFamily: fontStyle === "serif" 
                        ? "'Amiri', serif" 
                        : fontStyle === "naskh" 
                        ? "'Noto Naskh Arabic', sans-serif" 
                        : "system-ui, sans-serif"
                    }}
                  >
                    {/* Bismillah on first page */}
                    {mushafPage === 0 && (
                      <div className="flex flex-col items-center justify-center mb-6">
                        <div className="border border-[#cca05a] rounded-xl p-2 bg-[#cca05a]/5 text-center select-none font-bold text-base mb-4 w-60">
                          {selectedSurahMeta.name}
                        </div>
                        {selectedSurahMeta.number !== 9 && (
                          <div className="text-center my-2 select-none text-xl font-bold font-serif">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                          </div>
                        )}
                      </div>
                    )}

                    <div className="w-full text-justify select-text" style={{ textJustify: "inter-word", textAlign: "center" }}>
                      {currentSurahData.verses
                        .map((v, idx) => ({ v, idx }))
                        .filter(({ idx }) => surahPages[idx] === activeRealPage)
                        .map(({ v, idx }) => {
                          const absoluteIdx = idx;
                          if (selectedSurahMeta.number !== 1 && absoluteIdx === 0 && v.includes("بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ")) {
                            return null;
                          }
                          return (
                            <React.Fragment key={absoluteIdx}>
                              <span 
                                className="transition-all duration-300 rounded cursor-pointer px-1 hover:bg-[#cca05a]/15 inline"
                                title="اضغط للاستماع"
                                onClick={() => startAyahRecitationSim(absoluteIdx, v)}
                              >
                                {renderUthmaniTextWithAllahRed(v)}
                              </span>
                              <VerseEndSymbol number={absoluteIdx + 1} />
                            </React.Fragment>
                          );
                        })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-center items-center mt-8 pt-3 border-t border-[#cca05a]/20 select-none">
                    <div className="px-4 py-1 border border-[#cca05a]/30 rounded-full bg-[#cca05a]/5 text-amber-400 font-mono text-xs font-bold">
                      {toArabicNumerals(activeRealPage)}
                    </div>
                  </div>
                </div>

                {/* Page turners floating buttons overlay */}
                <div className="flex justify-between w-full select-none" style={{ direction: "rtl" }}>
                  <button
                    disabled={mushafPage === 0}
                    onClick={() => setMushafPage(p => Math.max(0, p - 1))}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-slate-950/40 hover:bg-slate-950/75 border border-white/10 text-amber-200 transition disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>الصفحة السابقة</span>
                  </button>

                  <button
                    disabled={mushafPage >= numPages - 1}
                    onClick={() => setMushafPage(p => p + 1)}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-slate-950/40 hover:bg-slate-950/75 border border-white/10 text-amber-200 transition disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
                  >
                    <span>الصفحة التالية</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto animate-bounce mb-3" />
              <p>السورة غير محملة بالكامل أوفلاين.</p>
            </div>
          )}
        </div>

        {/* Focus Mode Bottom Auto-scroll bar */}
        <div className={`p-3.5 border-t flex flex-wrap justify-between items-center gap-4 text-xs select-none backdrop-blur ${
          focusModeDarkMode ? "bg-slate-950/75 border-white/10 text-slate-300" : "bg-white border-slate-200 text-slate-700"
        }`}>
          {/* Right: Autoscroll play */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAutoScrollActive(!autoScrollActive)}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 ${
                autoScrollActive
                  ? "bg-red-600 text-white"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {autoScrollActive ? "⏸ إيقاف التمرير" : "▶ بدء التمرير التلقائي"}
            </button>

            <span className="text-[10px] text-slate-400 font-light hidden sm:inline">
              (التمرير التلقائي يسمح لك بتلاوة مسترسلة هادئة بدون لمس الشاشة)
            </span>
          </div>

          {/* Center: Scroll speed */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold">سرعة التمرير:</span>
            <div className="flex bg-slate-900/60 p-1 rounded-lg border border-white/5 text-[10px] gap-1">
              {[1, 2, 3, 4, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setScrollSpeed(speed)}
                  className={`px-2 py-0.5 rounded font-black transition cursor-pointer ${
                    scrollSpeed === speed ? "bg-[#cca05a] text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Left: Overall Surah Recitation progress */}
          <div className="flex items-center gap-2 font-serif">
            <span>تقدم السورة:</span>
            <span className="text-amber-400 font-mono font-bold">
              {displayMode === "detailed" 
                ? `${currentSurahData?.verses?.length || selectedSurahMeta.numberOfAyahs} آية`
                : `${mushafPage + 1} / ${numPages} صفحة`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={mainContainerRef} className={`flex flex-col h-full p-4 font-sans select-none overflow-y-auto transition-colors ${
      darkMode ? "bg-[#071b29] text-white" : "bg-white text-slate-900"
    }`}>
      
      {/* 📡 NETWORK STATUS & OFFLINE PROGRESS BANNER */}
      <div className={`rounded-2xl p-3 mb-4 flex flex-wrap justify-between items-center text-right shadow-sm border ${
        darkMode ? "bg-[#082235] border-white/5" : "bg-slate-50 border-slate-200"
      }`} style={{ direction: "rtl" }}>
        
        {/* Network status */}
        <div className="flex items-center space-x-2 space-x-reverse text-xs">
          {isOnline ? (
            <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-500/20 font-bold">
              <Wifi className="w-3.5 h-3.5 animate-pulse" />
              متصل بالإنترنت
            </span>
          ) : (
            <span className="bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-500/25 font-bold font-sans">
              <WifiOff className="w-3.5 h-3.5" />
              الوضع غير المتصل (أوفلاين)
            </span>
          )}
          
          <span className={`text-[10px] ${darkMode ? "text-slate-400" : "text-slate-600"} font-normal`}>
            {cachedSurahsCount === 114 ? (
              <span className="text-emerald-400 font-bold">📚 كامل المصحف (١١٤ سورة) تـم حفظها أوفلاين</span>
            ) : (
              <span>🟢 السور المحفوظة أوفلاين: <strong>{cachedSurahsCount} من ١١٤</strong></span>
            )}
          </span>
        </div>

        {/* Action Button for Downloading Complete Quran */}
        {cachedSurahsCount < 114 && (
          <button
            onClick={downloadAllSurahsForOffline}
            disabled={isDownloadingAll || !isOnline}
            className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer active:scale-95 shadow ${
              isDownloadingAll
                ? "bg-slate-800 text-slate-400 border border-slate-700"
                : !isOnline
                ? "bg-slate-800 text-slate-550 border border-slate-700 opacity-50 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-400 to-[#cca05a] hover:opacity-95 text-slate-950 font-extrabold"
            }`}
          >
            {isDownloadingAll ? (
              <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {isDownloadingAll ? "جاري التثبيت أوفلاين..." : "تحميل القرآن كاملاً للأوفلاين دفعة واحدة 📥"}
          </button>
        )}
      </div>

      {/* Downloading interactive loader panel */}
      {isDownloadingAll && (
        <div className={`border-2 rounded-2xl p-4 mb-4 text-right shadow-lg ${
          darkMode ? "bg-slate-900 border-amber-500/30 text-white" : "bg-amber-50/70 border-amber-200 text-slate-900"
        }`} style={{ direction: "rtl" }}>
          <div className="flex justify-between items-center mb-1.5 text-xs font-bold">
            <span className="text-amber-400">تجهيز المنهاج كامل بدون إنترنت</span>
            <span>{Math.round((downloadProgress / 114) * 100)}%</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(downloadProgress / 114) * 100}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400">{downloadMessage}</p>
        </div>
      )}

      {downloadError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 mb-4 text-right flex items-center gap-2 text-xs text-red-400" style={{ direction: "rtl" }}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* 🔖 INTERACTIVE BOOKMARK REMINDER BAR */}
      {bookmark && (
        <div className={`border-2 rounded-2xl p-3 mb-4 flex justify-between items-center text-right shadow-md shrink-0 ${
          darkMode 
            ? "bg-gradient-to-r from-[#0b293f] via-[#091e2e] to-[#0b293f] border-[#cca05a]/40" 
            : "bg-gradient-to-r from-amber-500/10 via-amber-50 to-white border-amber-900/10"
        }`} style={{ direction: "rtl" }}>
          <div className="flex items-center space-x-2 space-x-reverse text-xs">
            <span className="p-1 px-1.5 rounded-lg bg-[#cca05a]/20 text-[#cca05a] font-extrabold flex items-center gap-1">
              <Bookmark className="w-3 h-3 fill-[#cca05a]" />
              آخر موضع قراءة محفوظ
            </span>
            <span className={`font-extrabold font-sans ${darkMode ? "text-white" : "text-slate-800"}`}>سورة {bookmark.surahName} • الآية {bookmark.verseNumber}</span>
          </div>
          <button
            onClick={handleLoadBookmark}
            className="text-[10px] bg-gradient-to-r from-amber-400 to-[#cca05a] text-slate-950 font-extrabold px-3.5 py-1.5 rounded-lg shadow cursor-pointer hover:opacity-90 transition active:scale-95"
          >
            الانتقال فوري للموضع ↩
          </button>
        </div>
      )}

      {/* 📜 FLOATING AUTO-SCROLL CONTROLS PANEL FOR READING MODE */}
      {isReadingMode && (
        <div className={`backdrop-blur border-2 rounded-2xl p-4 mb-4 sticky top-0 z-30 shadow-2xl flex flex-wrap justify-between items-center gap-3 text-right shrink-0 ${
          darkMode ? "bg-[#0b293f]/95 border-[#cca05a]" : "bg-[#fcfaf5]/95 border-amber-900/15"
        }`} style={{ direction: "rtl" }}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className={`text-xs font-bold ${darkMode ? "text-amber-300" : "text-amber-800"}`}>وضع القراءة الهادئ والتمرير التلقائي مفعّل</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 space-x-reverse">
              <span className="text-[10px] text-slate-350">التحكم:</span>
              <button
                onClick={() => setAutoScrollActive(!autoScrollActive)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  autoScrollActive 
                    ? "bg-red-650 bg-red-600 text-white font-bold" 
                    : "bg-emerald-600 text-white font-bold"
                }`}
              >
                {autoScrollActive ? "⏸ إيقاف التمرير" : "▶ بدء التمرير الآلي"}
              </button>
            </div>

            <div className="flex items-center space-x-1.5 space-x-reverse">
              <span className="text-[10px] text-slate-350 font-bold">سرعة التمرير:</span>
              <div className="flex bg-slate-950/50 p-1 rounded-lg border border-white/5 text-[10px] gap-1">
                {[1, 2, 3, 4, 5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setScrollSpeed(speed)}
                    className={`px-2 py-0.5 rounded font-extrabold transition cursor-pointer ${
                      scrollSpeed === speed ? "bg-[#cca05a] text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setIsReadingMode(false);
                setAutoScrollActive(false);
              }}
              className="px-3 py-1 bg-slate-950/40 hover:bg-slate-950 text-slate-300 border border-white/10 rounded-lg text-[10px] cursor-pointer"
            >
              إلغاء الوضع ✕
            </button>
          </div>
        </div>
      )}

      {/* Surah List Selector Bar */}
      <div className="mb-5 space-y-3 flex-none">
        <div className="flex justify-between items-center">
          <label className={`text-xs text-right font-bold ${darkMode ? "text-amber-200/50" : "text-slate-500"}`}>
            ابحث في القرآن الكريم واستكشف آياته العظيمة:
          </label>
          <span className="text-[10px] text-[#cca05a] font-bold bg-[#cca05a]/10 px-2.5 py-1 rounded-full animate-pulse">
            {searchMode === "surahs" ? "نمط السور 📚" : "الـبـحث الـذكي ✨"}
          </span>
        </div>

        {/* Dynamic Mode Switcher Tabs */}
        <div className="grid grid-cols-3 bg-slate-950/20 p-1.5 rounded-2xl border border-white/5 gap-2" style={{ direction: "rtl" }}>
          <button
            onClick={() => {
              setSearchMode("surahs");
              setSearchWord("");
            }}
            className={`py-2 text-[10px] sm:text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              searchMode === "surahs"
                ? "bg-gradient-to-r from-amber-500/90 to-[#cca05a] text-slate-950 font-black shadow-lg"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            📚 السور ({filteredSurahs.length})
          </button>
          <button
            onClick={() => {
              setSearchMode("ayyahs");
              setSearchWord("");
            }}
            className={`py-2 text-[10px] sm:text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              searchMode === "ayyahs"
                ? "bg-gradient-to-r from-amber-500/90 to-[#cca05a] text-slate-950 font-black shadow-lg"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            🔍 البحث الذكي
          </button>
          <button
            onClick={() => {
              setSearchMode("favorites");
              setSearchWord("");
            }}
            className={`py-2 text-[10px] sm:text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              searchMode === "favorites"
                ? "bg-gradient-to-r from-amber-500/90 to-[#cca05a] text-slate-950 font-black shadow-lg"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            ❤️ المفضلة ({favorites.length})
          </button>
        </div>
        
        {/* Search tool */}
        {searchMode !== "favorites" && (
          <div className="relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                searchMode === "surahs"
                  ? "ابحث عن أي سورة بالقرآن كاملاً... (مثال: البقرة، الكهف، الرحمن، يس)"
                  : "اكتب كلمة أو آية للبحث عنها في كامل القرآن الكريم... (مثال: الصلاة، يسبح، جنات)"
              }
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className={`w-full text-right border rounded-xl py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-[#cca05a] transition ${
                darkMode ? "bg-slate-900 border-white/10 text-amber-100" : "bg-slate-50 border-slate-250 text-slate-800"
              }`}
            />
          </div>
        )}

        {/* Conditionally Render Search Results */}
        {searchMode === "surahs" && (
          /* Surahs Badges selection */
          <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none direction-rtl">
            {filteredSurahs.map((s) => {
              const isLocal = !!localStorage.getItem(`cached_surah_${s.number}`) || s.number === 1 || s.number === 112 || s.number === 113 || s.number === 114;
              return (
                <button
                  key={s.number}
                  onClick={() => {
                    setSelectedSurahMeta(s);
                    setExplainingAyahIdx(null);
                  }}
                  className={`flex-none px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer relative ${
                    selectedSurahMeta.number === s.number
                      ? "bg-[#cca05a] text-slate-950 border-transparent shadow-lg scale-105 font-extrabold"
                      : darkMode 
                        ? "bg-slate-900 text-slate-200 border-white/5 hover:border-[#cca05a]/30" 
                        : "bg-slate-50 text-slate-700 border-slate-250 hover:border-[#cca05a]/30"
                  }`}
                >
                  سورة {s.name}
                  {isLocal && (
                    <span className="absolute top-1 left-1.5 text-[7px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">✓</span>
                  )}
                  <span className="text-[9px] opacity-60 block font-normal">
                    {s.revelationType === "Meccan" ? "مكية" : "مدنية"} • {s.numberOfAyahs} آيات
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {searchMode === "ayyahs" && (
          /* Smart Word/Ayah Search Matches Panel */
          <div className="mt-3 space-y-2 direction-rtl" style={{ direction: "rtl" }}>
            {isSearchingAyahs && (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#cca05a]" />
                <span className="text-xs font-bold">جاري البحث في آيات وسور المصحف بالكامل...</span>
              </div>
            )}

            {!isSearchingAyahs && searchWord && searchWord.trim().length < 2 && (
              <div className={`text-center py-4 rounded-xl text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                يرجى كتابة حرفين على الأقل لبدء البحث الذكي.
              </div>
            )}

            {!isSearchingAyahs && searchWord && searchWord.trim().length >= 2 && ayahSearchResults.length === 0 && (
              <div className={`text-center py-6 rounded-xl text-xs border border-dashed ${
                darkMode ? "bg-slate-950/20 border-white/5 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
              }`}>
                ⚠️ لم يتم العثور على نتائج تطابق الكلمة المبحوثة. جرب مرادفات أو كلمات أخرى (مثال: صلاة، رزقنا، المؤمنين).
              </div>
            )}

            {!isSearchingAyahs && ayahSearchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className={`text-[10px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    عثرنا على <strong>{ayahSearchResults.length}</strong> موضع قرآني مطابق
                  </span>
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    بحث فوري أوفلاين وسحابي 🟢
                  </span>
                </div>

                <div className="max-h-[350px] overflow-y-auto space-y-2.5 scrollbar-thin pr-1">
                  {ayahSearchResults.slice(0, 50).map((match, mIdx) => (
                    <div
                      key={mIdx}
                      className={`p-3.5 rounded-2xl border transition hover:border-[#cca05a]/40 shadow-sm flex flex-col gap-2 text-right ${
                        darkMode 
                          ? "bg-slate-900/60 border-white/5 text-white hover:bg-slate-900" 
                          : "bg-white border-slate-200 text-slate-800 hover:bg-amber-50/10"
                      }`}
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <span className="text-xs font-black text-[#cca05a] flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          سورة {match.surahName} (الآية {match.verseNumber})
                        </span>
                        <button
                          onClick={() => navigateToVerse(match.surahNumber, match.verseNumber)}
                          className="text-[10px] bg-[#cca05a] text-slate-950 font-black px-3 py-1 rounded-lg hover:opacity-90 transition cursor-pointer hover:scale-102 active:scale-98"
                        >
                          تلاوة وتفسير الآية ↩
                        </button>
                      </div>

                      <p className="text-sm font-sans font-medium leading-relaxed" style={{ fontFamily: "serif", fontSize: "16px" }}>
                        {match.text.split(" ").map((word: string, wIdx: number) => {
                          const isMatch = normalizeArabic(word).includes(normalizeArabic(searchWord));
                          return (
                            <span 
                              key={wIdx} 
                              className={isMatch ? "text-amber-400 font-extrabold underline decoration-amber-500 underline-offset-4 bg-amber-400/10 px-0.5 rounded" : ""}
                            >
                              {word}{" "}
                            </span>
                          );
                        })}
                      </p>
                    </div>
                  ))}

                  {ayahSearchResults.length > 50 && (
                    <div className="text-center py-3 text-[10px] text-slate-500 border-t border-dashed border-slate-800">
                      تم عرض أول ٥٠ نتيجة من أصل {ayahSearchResults.length}. يرجى تضييق نطاق البحث للحصول على نتائج أدق.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {searchMode === "favorites" && (
          /* Favorites list rendering */
          <div className="mt-3 space-y-2 direction-rtl" style={{ direction: "rtl" }}>
            {favorites.length === 0 ? (
              <div className={`text-center py-8 rounded-xl text-xs border border-dashed ${
                darkMode ? "bg-slate-950/20 border-white/5 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
              }`}>
                ❤️ لم تقم بحفظ أي آية في المفضلة بعد. اضغط على زر "إضافة للمفضلة" عند قراءة أي آية لحفظها هنا للرجوع السريع.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className={`text-[10px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    لديك <strong>{favorites.length}</strong> آية محفوظة بالمفضلة
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm("هل أنت متأكد من رغبتك في حذف جميع الآيات المحفوظة؟")) {
                        setFavorites([]);
                        localStorage.removeItem("quran_favorites");
                      }
                    }}
                    className="text-[9px] text-red-400 hover:text-red-300 font-bold bg-red-500/10 px-2 py-0.5 rounded-md cursor-pointer"
                  >
                    حذف الكل 🗑️
                  </button>
                </div>

                <div className="max-h-[350px] overflow-y-auto space-y-2.5 scrollbar-thin pr-1">
                  {favorites.map((fav, fIdx) => (
                    <div
                      key={fIdx}
                      className={`p-3.5 rounded-2xl border transition hover:border-[#cca05a]/40 shadow-sm flex flex-col gap-2 text-right ${
                        darkMode 
                          ? "bg-slate-900/60 border-white/5 text-white hover:bg-slate-900" 
                          : "bg-white border-slate-200 text-slate-800 hover:bg-amber-50/10"
                      }`}
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <span className="text-xs font-black text-[#cca05a] flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          سورة {fav.surahName} (الآية {fav.verseNumber})
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const updated = favorites.filter(
                                (f) => !(f.surahNumber === fav.surahNumber && f.verseNumber === fav.verseNumber)
                              );
                              setFavorites(updated);
                              localStorage.setItem("quran_favorites", JSON.stringify(updated));
                            }}
                            className="text-[10px] bg-red-500/10 hover:bg-red-500/25 text-red-400 font-black px-2 py-1 rounded-lg transition cursor-pointer"
                          >
                            حذف ✕
                          </button>
                          <button
                            onClick={() => navigateToVerse(fav.surahNumber, fav.verseNumber)}
                            className="text-[10px] bg-[#cca05a] text-slate-950 font-black px-3 py-1 rounded-lg hover:opacity-90 transition cursor-pointer hover:scale-102 active:scale-98"
                          >
                            الانتقال للآية ↩
                          </button>
                        </div>
                      </div>

                      <p className="text-sm font-sans font-medium leading-relaxed" style={{ fontFamily: "serif", fontSize: "16px" }}>
                        {fav.verseText}
                      </p>
                      
                      {fav.translationText && (
                        <p className={`text-[11px] leading-relaxed text-slate-400`}>
                          <strong>التفسير:</strong> {fav.translationText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Surah Controls Header */}
      <div className={`rounded-2xl border p-4 mb-5 flex flex-wrap justify-between items-center gap-3 shadow-lg flex-none ${
        darkMode ? "bg-[#0b293f] border-[#cca05a]/20 text-white" : "bg-[#fcfbf9] border-slate-200 text-slate-900"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse">
          <BookMarked className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className={`font-bold text-sm font-sans ${darkMode ? "text-yellow-100" : "text-slate-800"}`}>
            تلاوة سورة {selectedSurahMeta.name} {currentSurahData && `(${currentSurahData.numberOfAyahs} آية)`}
          </span>
        </div>

        {/* Text styling buttons */}
        <div className="flex flex-wrap items-center gap-4 space-x-reverse justify-end">
          {/* Reading Mode Button */}
          <button
            onClick={() => {
              setIsReadingMode(!isReadingMode);
              if (!isReadingMode) {
                setAutoScrollActive(true);
              } else {
                setAutoScrollActive(false);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 border transition cursor-pointer ${
              isReadingMode
                ? "bg-amber-400 text-slate-950 border-transparent shadow"
                : darkMode
                  ? "bg-slate-950/40 text-amber-100 border-[#cca05a]/30 hover:border-[#cca05a]"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50/25"
            }`}
          >
            <span>📖 وضع القراءة القرآني</span>
          </button>

          {/* Focus Mode Button */}
          <button
            onClick={handleEnterFocusMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border-transparent shadow`}
            title="تفعيل وضع التركيز لتلاوة خاشعة خالية من المشتتات مع تكبير الخط وملء الشاشة"
          >
            <Eye className="w-4 h-4" />
            <span>👁️ وضع التركيز</span>
          </button>

          {/* Stay Awake Button */}
          <button
            onClick={toggleWakeLock}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition cursor-pointer ${
              isWakeLockEnabled
                ? "bg-emerald-600 text-white border-transparent shadow"
                : darkMode
                  ? "bg-slate-950/40 text-amber-100 border-[#cca05a]/30 hover:border-[#cca05a]"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50/25"
            }`}
            title="منع الهاتف من الدخول في وضع السكون وإغلاق الشاشة أثناء القراءة والتلاوة"
          >
            <Smartphone className={`w-4 h-4 ${isWakeLockEnabled ? "text-yellow-300 animate-pulse" : ""}`} />
            <span>{isWakeLockEnabled ? "الشاشة مضيئة ✓" : "إبقاء الشاشة مضيئة"}</span>
          </button>

          {/* Font Style Selection */}
          <div className="flex items-center space-x-1.5 space-x-reverse">
            <span className="text-[10px] text-amber-100/50">نوع الخط:</span>
            <div className="flex bg-slate-950/40 p-1 rounded-lg border border-white/5 text-[10px] gap-1">
              {[
                { id: "serif", name: "الخط العثماني" },
                { id: "naskh", name: "خط النَسخ" },
                { id: "sans", name: "خط النظام" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setFontStyle(item.id);
                    localStorage.setItem("quran_font_style", item.id);
                  }}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    fontStyle === item.id ? "bg-[#cca05a] text-slate-950 font-extrabold" : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Font Sizer */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-[10px] text-amber-100/50 font-bold">التكبير:</span>
            <input
              type="range"
              min="16"
              max="42"
              value={fontSize}
              onChange={(e) => {
                const size = parseInt(e.target.value);
                setFontSize(size);
                localStorage.setItem("quran_font_size", String(size));
              }}
              className="w-16 sm:w-24 md:w-28 h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-[#cca05a]"
            />
            <span className="text-xs font-mono font-bold text-amber-200">{fontSize}px</span>
          </div>

          {/* Selector view mode */}
          <div className="flex bg-slate-950/40 p-1 rounded-lg border border-white/5 text-xs">
            <button
              onClick={() => setDisplayMode("detailed")}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                displayMode === "detailed" ? "bg-[#cca05a] text-slate-950 font-bold" : "text-white/70"
              }`}
            >
              مفصل
            </button>
            <button
              onClick={() => setDisplayMode("continuous")}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                displayMode === "continuous" ? "bg-[#cca05a] text-slate-950 font-bold" : "text-white/70"
              }`}
            >
              مصحف
            </button>
          </div>
        </div>
      </div>

      {/* Main Quran Reading Canvas */}
      <div className="flex-1 bg-gradient-to-b from-[#0a2335] via-[#091e2e] to-[#05131e] rounded-2xl border border-[#cca05a]/15 p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden min-h-[400px]">
        
        {/* Decorative corner islamic borders */}
        <div className="absolute top-2 right-2 text-amber-500/10 text-xl font-bold">✴</div>
        <div className="absolute top-2 left-2 text-amber-500/10 text-xl font-bold">✴</div>
        <div className="absolute bottom-2 right-2 text-amber-500/10 text-xl font-bold">✴</div>
        <div className="absolute bottom-2 left-2 text-amber-500/10 text-xl font-bold">✴</div>

        {/* Loading progress placeholder */}
        {isLoadingSurah && (
          <div className="absolute inset-0 bg-[#091e2e]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-10 h-10 animate-spin text-[#cca05a]" />
            <span className="text-sm text-amber-100 font-bold font-sans">تنزيل السورة الكريمة من المصحف الشريف...</span>
          </div>
        )}

        {/* Dynamic Errors inside view */}
        {surahError && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-right text-xs text-amber-400 font-sans" style={{ direction: "rtl" }}>
            {surahError}
          </div>
        )}

        {/* Bismillah plate */}
        {displayMode === "detailed" && selectedSurahMeta.number !== 1 && currentSurahData && (
          <div className="text-center py-2 flex flex-col items-center justify-center">
            <span className={`text-xl md:text-2xl font-sans tracking-wide font-extrabold block ${
              darkMode ? "text-amber-200" : "text-amber-800"
            }`}>
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </span>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#cca05a]/50 to-transparent mt-2" />
          </div>
        )}

        {/* Display rendering */}
        {currentSurahData && currentSurahData.verses ? (
          displayMode === "detailed" ? (
            <div className="space-y-6 direction-rtl">
              {currentSurahData.verses.map((v, idx) => {
                // Skip visual duplicate Bismillah if already rendered as header
                if (selectedSurahMeta.number !== 1 && idx === 0 && v.includes("بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ")) {
                  return null;
                }

                const isSpeaking = activeAyahRecitation === idx && isAudioSimulating;

                return (
                  <div
                    key={idx}
                    id={`verse-card-${idx + 1}`}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      isSpeaking 
                        ? "border-[#cca05a] bg-[#cca05a]/5" 
                        : darkMode 
                          ? "bg-slate-950/20 border-white/5 hover:border-[#cca05a]/5 hover:border-white/10" 
                          : "bg-amber-50/5 border-slate-200/60 hover:border-[#cca05a]/30"
                    }`}
                  >
                    {/* Arabic Verse text */}
                    <div className="text-right leading-relaxed mb-3">
                      <span
                        className="font-bold leading-relaxed text-right select-text text-pretty block mb-2"
                        style={{ 
                          fontSize: `${fontSize}px`, 
                          color: isSpeaking 
                            ? (darkMode ? "#ffe082" : "#934812") 
                            : (darkMode ? "#ffffff" : "#f1f5f9"),
                          fontFamily: fontStyle === "serif" 
                            ? "'Amiri', serif" 
                            : fontStyle === "naskh" 
                            ? "'Noto Naskh Arabic', sans-serif" 
                            : "system-ui, sans-serif"
                        }}
                      >
                        {v}
                      </span>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-[#cca05a]/50 text-[#cca05a] text-[10px] font-mono font-bold align-middle">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Accompanying Tafsir translation */}
                    {currentSurahData.translation && currentSurahData.translation[idx] && (
                      <div className={`p-3 rounded-lg border space-y-1 mt-2 ${
                        darkMode ? "bg-slate-950/40 border-white/5" : "bg-amber-500/5 border-slate-200/60"
                      }`}>
                        <span className={`text-[10px] font-bold block ${darkMode ? "text-amber-200/50" : "text-amber-800/80"}`}>التفسير الميسر:</span>
                        <p className="text-xs leading-relaxed font-light font-sans text-right text-slate-300">
                          {currentSurahData.translation[idx]}
                        </p>
                      </div>
                    )}

                    {/* AI assistant and Audio simulation bar */}
                    <div className="flex flex-wrap gap-2 justify-start items-center border-t border-white/5 pt-2.5 mt-3">
                      <button
                        onClick={() => startAyahRecitationSim(idx, v)}
                        className="flex items-center space-x-1.5 space-x-reverse bg-gradient-to-r from-amber-500/10 to-[#cca05a]/20 hover:from-amber-500/20 border border-[#cca05a]/30 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-yellow-100 transition cursor-pointer"
                      >
                        {isSpeaking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{isSpeaking ? "إيقاف الاستماع" : "استماع للآية"}</span>
                      </button>

                      <button
                        onClick={() => handleSaveBookmark(v, idx + 1)}
                        className="flex items-center space-x-1.5 space-x-reverse bg-slate-950/50 hover:bg-slate-950 border border-[#cca05a]/30 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-amber-100/90 transition cursor-pointer"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${bookmark?.surahNumber === selectedSurahMeta.number && bookmark?.verseNumber === idx + 1 ? "fill-amber-400 text-amber-400" : "text-slate-400"}`} />
                        <span>{bookmarkStatusId === idx + 1 ? "✅ تم الحفظ!" : "علامة قراءة 🔖"}</span>
                      </button>

                      <button
                        onClick={() => handleToggleFavorite(v, idx + 1, currentSurahData.translation?.[idx] || "")}
                        className="flex items-center space-x-1.5 space-x-reverse bg-slate-950/50 hover:bg-slate-950 border border-[#cca05a]/30 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-amber-100/90 transition cursor-pointer"
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorites.some(f => f.surahNumber === selectedSurahMeta.number && f.verseNumber === idx + 1) ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
                        <span>{favorites.some(f => f.surahNumber === selectedSurahMeta.number && f.verseNumber === idx + 1) ? "مفضلة ❤️" : "إضافة للمفضلة"}</span>
                      </button>

                      <button
                        onClick={() => explainAyahWithAI(v, idx)}
                        className="flex items-center space-x-1.5 space-x-reverse bg-[#cca05a]/10 hover:bg-[#cca05a]/20 border border-amber-300/20 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-amber-100 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>تفسير فوري بالذكاء الاصطناعي</span>
                      </button>
                    </div>

                    {/* AI Output Container */}
                    {explainingAyahIdx === idx && (
                      <div className="mt-4 bg-slate-950/50 p-4 rounded-xl border border-amber-500/30 text-right space-y-2 relative">
                        <div className="flex items-center space-x-2 space-x-reverse text-[#cca05a] text-[11px] font-bold">
                          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>بيان الذكاء الاصطناعي وخواطر الآية:</span>
                        </div>
                        
                        {isAiLoading ? (
                          <div className="flex items-center space-x-2 space-x-reverse py-2 text-xs text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>يرجى الانتظار، جاري صياغة التفسير والتدبر الروحي من المساعد...</span>
                          </div>
                        ) : (
                          <p className="text-xs text-[#ffe082] leading-relaxed font-sans font-light">
                            {aiExplanationText}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Paginated Mushaf Mode */
            <div className="flex flex-col h-full space-y-6">
              {/* Pagination controls at top of page text */}
              <div className="flex justify-between items-center bg-slate-950/40 px-4 py-2.5 rounded-xl border border-white/5 select-none" style={{ direction: "rtl" }}>
                <button
                  disabled={mushafPage === 0}
                  onClick={() => setMushafPage(p => Math.max(0, p - 1))}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-200 border border-white/10 transition disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>الصفحة السابقة</span>
                </button>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">الفهرس العثماني للقرآن الكريم</span>
                  <span className="text-xs font-bold text-amber-400 mt-0.5 block">
                    الصفحة {toArabicNumerals(uniquePages[mushafPage] || startPage + mushafPage)}
                  </span>
                </div>

                <button
                  disabled={mushafPage >= numPages - 1}
                  onClick={() => setMushafPage(p => p + 1)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-200 border border-white/10 transition disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                >
                  <span>الصفحة التالية</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* REAL MUSHAF BOOK CANVAS WRAPPER */}
              {(() => {
                const activeRealPage = uniquePages[mushafPage] || startPage + mushafPage;
                const juzInfo = getJuzNameAndNumberForPage(activeRealPage);
                const hizbInfo = getHizbInfoForPage(activeRealPage);
                
                return (
                  <div className="relative w-full max-w-2xl mx-auto my-2 select-text" style={{ direction: "rtl" }}>
                    {/* Hanging side Hezb/Juz badge (Floating Traditional Banner) */}
                    <div className="absolute -right-2 md:-right-6 top-1/4 -translate-y-1/2 z-10 hidden sm:flex flex-col items-center select-none animate-pulse-gentle">
                      <div className="bg-[#cca05a] text-slate-950 font-serif text-[10px] font-bold px-1.5 py-3 rounded-l-md shadow-lg border-y border-l border-amber-600/30 flex items-center justify-center h-28 leading-tight">
                        <span style={{ writingMode: 'vertical-rl' }}>{juzInfo.nameAr} - {hizbInfo}</span>
                      </div>
                      {/* Triangle tail */}
                      <div className="w-0 h-0 border-t-[8px] border-t-[#cca05a] border-r-[8px] border-r-transparent mr-auto" />
                    </div>

                    {/* MAIN DECORATIVE MUSHAF FRAME */}
                    <div 
                      className={`relative rounded-2xl border-4 p-4 md:p-6 transition-all duration-300 overflow-hidden ${
                        darkMode 
                          ? "bg-[#06111a] border-[#cca05a]/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
                          : "bg-[#fcfbf7] border-[#9c783c]/40 shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                      }`}
                      style={{
                        borderColor: darkMode ? "#cca05a" : "#b08846",
                        borderStyle: "double",
                        borderWidth: "6px"
                      }}
                    >
                      {/* Decorative corner islamic borders in four corners */}
                      <svg className="absolute top-1.5 right-1.5 w-6 h-6 text-[#cca05a]/60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                        <path d="M 0 0 L 100 0 L 100 20 L 20 20 L 20 100 L 0 100 Z" fill="currentColor" fillOpacity="0.1" />
                        <path d="M 30 30 L 70 30 L 70 70 L 30 70 Z" strokeWidth="4" />
                        <circle cx="50" cy="50" r="10" fill="currentColor" />
                      </svg>
                      <svg className="absolute top-1.5 left-1.5 w-6 h-6 text-[#cca05a]/60 rotate-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                        <path d="M 0 0 L 100 0 L 100 20 L 20 20 L 20 100 L 0 100 Z" fill="currentColor" fillOpacity="0.1" />
                        <path d="M 30 30 L 70 30 L 70 70 L 30 70 Z" strokeWidth="4" />
                        <circle cx="50" cy="50" r="10" fill="currentColor" />
                      </svg>
                      <svg className="absolute bottom-1.5 right-1.5 w-6 h-6 text-[#cca05a]/60 -rotate-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                        <path d="M 0 0 L 100 0 L 100 20 L 20 20 L 20 100 L 0 100 Z" fill="currentColor" fillOpacity="0.1" />
                        <path d="M 30 30 L 70 30 L 70 70 L 30 70 Z" strokeWidth="4" />
                        <circle cx="50" cy="50" r="10" fill="currentColor" />
                      </svg>
                      <svg className="absolute bottom-1.5 left-1.5 w-6 h-6 text-[#cca05a]/60 rotate-180" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                        <path d="M 0 0 L 100 0 L 100 20 L 20 20 L 20 100 L 0 100 Z" fill="currentColor" fillOpacity="0.1" />
                        <path d="M 30 30 L 70 30 L 70 70 L 30 70 Z" strokeWidth="4" />
                        <circle cx="50" cy="50" r="10" fill="currentColor" />
                      </svg>

                      {/* Top Header Row of the page */}
                      <div className="flex justify-between items-center border-b border-[#cca05a]/25 pb-3 mb-5 px-3 select-none text-[11px] md:text-xs">
                        {/* Surah Name Tag */}
                        <div className="bg-[#cca05a]/10 border border-[#cca05a]/40 px-3 py-1 rounded-full text-amber-200 font-serif font-bold">
                          {selectedSurahMeta.name}
                        </div>

                        {/* Traditional floral center knot */}
                        <div className="text-[#cca05a] opacity-60 font-serif">❈ ❖ ❈</div>

                        {/* Juz Tag */}
                        <div className="bg-[#cca05a]/10 border border-[#cca05a]/40 px-3 py-1 rounded-full text-amber-200 font-serif">
                          {juzInfo.nameAr}
                        </div>
                      </div>

                      {/* Mushaf Page Content with Beautiful Quranic Font and Spacing */}
                      <div 
                        className={`text-center leading-[3] tracking-wide select-text ${
                          darkMode ? "text-[#f3ecc5]" : "text-[#1c1a16]"
                        }`} 
                        style={{ 
                          fontSize: `${fontSize + 3}px`,
                          fontFamily: fontStyle === "serif" 
                            ? "'Amiri', serif" 
                            : fontStyle === "naskh" 
                            ? "'Noto Naskh Arabic', sans-serif" 
                            : "system-ui, sans-serif"
                        }}
                      >
                        {/* Surah Header & Bismillah inside the page flow if first page */}
                        {mushafPage === 0 && (
                          <div className="flex flex-col items-center justify-center w-full mb-6">
                            {/* Ornate Header Banner */}
                            <div className="w-full max-w-md bg-gradient-to-r from-amber-500/5 via-[#cca05a]/15 to-amber-500/5 border border-[#cca05a] rounded-xl p-2.5 relative shadow-inner text-center select-none">
                              <div className="absolute top-0.5 bottom-0.5 left-1 right-1 border border-[#cca05a]/20 rounded-lg pointer-events-none" />
                              <span className="font-serif text-lg md:text-xl font-extrabold text-amber-300 drop-shadow">
                                {selectedSurahMeta.name}
                              </span>
                              <div className="text-[9px] text-amber-400/80 mt-1 flex justify-center space-x-3 space-x-reverse font-sans">
                                <span>آياتها: {toArabicNumerals(selectedSurahMeta.numberOfAyahs)}</span>
                                <span className="text-amber-500/40">•</span>
                                <span>{selectedSurahMeta.revelationType === "Meccan" ? "مكيّة" : "مدنيّة"}</span>
                              </div>
                            </div>
                            
                            {/* Bismillah unless Surah 9 (At-Tawbah) */}
                            {selectedSurahMeta.number !== 9 && (
                              <div className="text-center my-4 select-none">
                                <span className="font-serif text-lg md:text-xl text-amber-100 dark:text-amber-100/90 font-extrabold block">
                                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Verses Grid/Flow */}
                        <div className="w-full text-justify select-text" style={{ textJustify: "inter-word", textAlign: "center" }}>
                          {currentSurahData.verses
                            .map((v, idx) => ({ v, idx }))
                            .filter(({ idx }) => surahPages[idx] === activeRealPage)
                            .map(({ v, idx }) => {
                              const absoluteIdx = idx;
                              
                              // Skip visual duplicate Bismillah inside the verses flow
                              if (selectedSurahMeta.number !== 1 && absoluteIdx === 0 && v.includes("بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ")) {
                                return null;
                              }

                              return (
                                <React.Fragment key={absoluteIdx}>
                                  <span 
                                    id={`mushaf-verse-${absoluteIdx + 1}`}
                                    className="transition-all duration-300 rounded cursor-pointer px-1 hover:bg-[#cca05a]/10 inline"
                                    title="اضغط للتلاوة الفردية"
                                    onClick={() => startAyahRecitationSim(absoluteIdx, v)}
                                  >
                                    {renderUthmaniTextWithAllahRed(v)}
                                  </span>
                                  <VerseEndSymbol number={absoluteIdx + 1} />
                                </React.Fragment>
                              );
                            })}
                        </div>
                      </div>

                      {/* Bottom Footer Page Number Capsule */}
                      <div className="flex justify-center items-center mt-6 pt-3 border-t border-[#cca05a]/25 select-none">
                        <div className="relative flex items-center justify-center px-4 py-1 border border-[#cca05a]/50 rounded-full bg-[#cca05a]/5 text-amber-300 font-mono text-xs font-bold shadow-md">
                          <span className="mr-1 text-[10px] text-amber-400/50">صفحة</span>
                          {toArabicNumerals(activeRealPage)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Bottom quick dots indicator */}
              <div className="flex justify-center items-center gap-1.5 flex-wrap py-2 select-none">
                {Array.from({ length: numPages }).map((_, pageIdx) => (
                  <button
                    key={pageIdx}
                    onClick={() => setMushafPage(pageIdx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      mushafPage === pageIdx 
                        ? "bg-[#cca05a] w-5 h-2 animate-pulse" 
                        : "bg-slate-700 hover:bg-slate-500"
                    }`}
                    title={`الصفحة رقم ${uniquePages[pageIdx] || startPage + pageIdx} في المصحف`}
                  />
                ))}
              </div>
            </div>
          )
        ) : (
          !isLoadingSurah && (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-500 animate-bounce" />
              <h3 className="font-bold text-sm text-white">السورة غير متوفرة أوفلاين في التطبيق</h3>
              <p className="text-xs text-slate-400 max-w-xs">يرجى تشغيل الإنترنت والضغط مرة واحدة لطلب السورة لتنزيلها وحفظها مجدداً في ذاكرة الهاتف لتكون متوفرة للأوفلاين دائمًا.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
