import React, { useState, useEffect } from "react";
import Splash from "./components/Splash";
import Dashboard from "./components/Dashboard";
import QuranView from "./components/QuranView";
import AthkarView from "./components/AthkarView";
import TasbihView from "./components/TasbihView";
import HadithView from "./components/HadithView";
import AdhanSelector from "./components/AdhanSelector";
import NotificationCenter from "./components/NotificationCenter";
import DailyWardView from "./components/DailyWardView";
import CalendarView from "./components/CalendarView";
import DescriptionView from "./components/DescriptionView";
import PrayerGuideView from "./components/PrayerGuideView";
import PrayerNotificationTracker from "./components/PrayerNotificationTracker";
import FeedbackModal from "./components/FeedbackModal";
import SettingsView from "./components/SettingsView";
import MosquesView from "./components/MosquesView";
import CardsView from "./components/CardsView";
import SpiritualAssistantView from "./components/SpiritualAssistantView";
import PermissionsModal from "./components/PermissionsModal";
import { initGlobalTapSounds } from "./utils/soundEffects";
import { autoCacheEssentialAudios } from "./utils/autoCache";
import { useLanguage } from "./context/LanguageContext";
import { quranData, athkarData, hadithsList } from "./data/islamicData";
import { quranIndex } from "./data/quranIndex";

import {
  Compass,
  BookOpen,
  CheckCircle,
  Clock,
  Volume2,
  Bell,
  Sliders,
  Sparkles,
  Award,
  BookMarked,
  Moon,
  Sun,
  Menu,
  X,
  Smile,
  Calendar,
  MessageCircle,
  MessageSquare,
  Download,
  Info,
  Settings,
  MapPin,
  Image,
  Search,
} from "lucide-react";

export default function App() {
  const { language, toggleLanguage, t, isAr } = useLanguage();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchActiveTab, setSearchActiveTab] = useState<string>("all");

  const searchResults = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length < 2) return [];

    const results: { type: "quran" | "athkar" | "hadith"; title: string; text: string; payload: any }[] = [];

    // 1. Search Quran
    if (searchActiveTab === "all" || searchActiveTab === "quran") {
      quranData.forEach((surah) => {
        surah.verses.forEach((verse, vIdx) => {
          if (verse.toLowerCase().includes(query)) {
            results.push({
              type: "quran",
              title: isAr ? `سورة ${surah.name} • الآية ${vIdx + 1}` : `Surah ${surah.englishName} • Ayah ${vIdx + 1}`,
              text: verse,
              payload: { surahNum: surah.number, verseIdx: vIdx }
            });
          }
        });
      });
    }

    // 2. Search Athkar
    if (searchActiveTab === "all" || searchActiveTab === "athkar") {
      athkarData.forEach((section) => {
        section.items.forEach((item) => {
          if (item.text.toLowerCase().includes(query) || section.title.toLowerCase().includes(query)) {
            results.push({
              type: "athkar",
              title: section.title,
              text: item.text,
              payload: { category: section.id }
            });
          }
        });
      });
    }

    // 3. Search Hadith
    if (searchActiveTab === "all" || searchActiveTab === "hadith") {
      hadithsList.forEach((hadith, idx) => {
        if (hadith.text.toLowerCase().includes(query) || hadith.narrator.toLowerCase().includes(query)) {
          results.push({
            type: "hadith",
            title: isAr ? `الحديث الشريف • رقم ${idx + 1}` : `Hadith • No. ${idx + 1}`,
            text: hadith.text,
            payload: { hadithIdx: idx }
          });
        }
      });
    }

    return results.slice(0, 30);
  }, [searchQuery, searchActiveTab, isAr]);

  const handleSearchResultClick = (res: any) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    
    if (res.type === "quran") {
      localStorage.setItem("quran_selected_surah_num", res.payload.surahNum.toString());
      localStorage.setItem("quran_select_surah_pending", "true");
      setActiveTab("quran");
    } else if (res.type === "athkar") {
      localStorage.setItem("athkar_selected_category", res.payload.category);
      localStorage.setItem("athkar_select_pending", "true");
      setActiveTab("athkar");
    } else if (res.type === "hadith") {
      setActiveTab("hadiths");
    }
  };

  // Shortcut keypress Ctrl+K or Cmd+K to trigger instant search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const [accentTheme, setAccentTheme] = useState<string>(() => {
    return localStorage.getItem("app_accent_theme") || "gold";
  });
  const [showPermissions, setShowPermissions] = useState<boolean>(() => {
    return localStorage.getItem("has_seen_permissions_modal") === null;
  });

  // Keep a history of navigated tabs to support seamless gesture back navigation
  const [tabHistory, setTabHistory] = useState<string[]>(["dashboard"]);

  useEffect(() => {
    setTabHistory(prev => {
      if (prev[prev.length - 1] === activeTab) return prev;
      return [...prev, activeTab];
    });
  }, [activeTab]);

  const handleGoBack = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      return;
    }
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      return;
    }
    if (isFeedbackOpen) {
      setIsFeedbackOpen(false);
      return;
    }
    if (tabHistory.length > 1) {
      const nextHistory = [...tabHistory];
      nextHistory.pop(); // remove current tab
      const prevTab = nextHistory.pop(); // get previous tab
      if (prevTab) {
        setTabHistory(nextHistory);
        setActiveTab(prevTab);
      }
    } else if (activeTab !== "dashboard") {
      setActiveTab("dashboard");
    }
  };

  // Listen to swiping from left or right edge of the screen (Gesture back navigation)
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startT = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startT = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length !== 1) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const duration = Date.now() - startT;

      const diffX = endX - startX;
      const diffY = endY - startY;

      // Detect quick horizontal swipe from edge
      if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && duration < 400) {
        const threshold = 70;
        const edgeOffset = 45; // pixel margin from edge of screen

        const isFromLeftEdge = startX < edgeOffset;
        const isFromRightEdge = startX > window.innerWidth - edgeOffset;

        if (isFromLeftEdge && diffX > threshold) {
          handleGoBack();
        } else if (isFromRightEdge && diffX < -threshold) {
          handleGoBack();
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [tabHistory, activeTab, mobileMenuOpen, isFeedbackOpen, isSearchOpen]);

  // Handle Capacitor native hardware back button registration
  useEffect(() => {
    let appBackButtonListener: any = null;

    import("@capacitor/app")
      .then(({ App }) => {
        App.addListener("backButton", () => {
          handleGoBack();
        }).then(listener => {
          appBackButtonListener = listener;
        });
      })
      .catch(() => {
        // Safe fallback if not in custom Capacitor container
      });

    return () => {
      if (appBackButtonListener) {
        appBackButtonListener.remove();
      }
    };
  }, [tabHistory, activeTab, mobileMenuOpen, isFeedbackOpen, isSearchOpen]);

  useEffect(() => {
    initGlobalTapSounds();
    autoCacheEssentialAudios();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", accentTheme);

    const handleThemeChange = () => {
      setAccentTheme(localStorage.getItem("app_accent_theme") || "gold");
    };

    window.addEventListener("theme-changed", handleThemeChange);
    return () => {
      window.removeEventListener("theme-changed", handleThemeChange);
    };
  }, [accentTheme]);

  // Auto handle splash timeout
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Swipe-to-back gestures support
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target && (
        target.tagName === "INPUT" ||
        target.tagName === "BUTTON" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest(".no-swipe")
      )) {
        touchStartX = 0;
        touchStartY = 0;
        return;
      }

      const clientX = e.touches[0].clientX;
      const width = window.innerWidth;

      // Only allow swipe-to-back if it starts near the edge (within 50px of left or right edge)
      const isNearLeftEdge = clientX < 50;
      const isNearRightEdge = clientX > width - 50;

      if (isNearLeftEdge || isNearRightEdge) {
        touchStartX = clientX;
        touchStartY = e.touches[0].clientY;
      } else {
        touchStartX = 0;
        touchStartY = 0;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Ensure horizontal swipe is dominant and significant
      if (Math.abs(diffX) > 80 && Math.abs(diffY) < 40) {
        // Swiping from edge (left-to-right or right-to-left depending on layout direction)
        // If activeTab is not dashboard, swipe back to dashboard
        if (activeTab !== "dashboard") {
          setActiveTab("dashboard");
          
          try {
            const synth = window.speechSynthesis;
            if (synth && synth.speaking) {
              synth.cancel();
            }
          } catch(err) {}
        }
      }

      touchStartX = 0;
      touchStartY = 0;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeTab]);

  if (showSplash) {
    return <Splash onComplete={handleSplashComplete} />;
  }

  if (showPermissions) {
    return (
      <PermissionsModal
        darkMode={darkMode}
        onComplete={() => setShowPermissions(false)}
      />
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard darkMode={darkMode} setActiveTab={setActiveTab} />;
      case "quran":
        return <QuranView darkMode={darkMode} />;
      case "dailyward":
        return <DailyWardView darkMode={darkMode} />;
      case "calendar":
        return <CalendarView darkMode={darkMode} />;
      case "description":
        return <DescriptionView darkMode={darkMode} />;
      case "athkar":
        return <AthkarView darkMode={darkMode} />;
      case "tasbih":
        return <TasbihView darkMode={darkMode} />;
      case "hadiths":
        return <HadithView darkMode={darkMode} />;
      case "adhan":
        return <AdhanSelector darkMode={darkMode} />;
      case "notifications":
        return <NotificationCenter />;
      case "prayerguide":
        return <PrayerGuideView darkMode={darkMode} />;
      case "mosques":
        return <MosquesView darkMode={darkMode} />;
      case "cards_generator":
        return <CardsView darkMode={darkMode} />;
      case "ai_assistant":
        return <SpiritualAssistantView darkMode={darkMode} />;
      case "settings":
        return <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:
        return <Dashboard darkMode={darkMode} setActiveTab={setActiveTab} />;
    }
  };

  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: Clock },
    { id: "quran", label: t("quran"), icon: BookMarked },
    { id: "dailyward", label: t("dailyward"), icon: BookOpen },
    { id: "calendar", label: t("calendar"), icon: Calendar },
    { id: "description", label: t("description"), icon: Info },
    { id: "athkar", label: t("athkar"), icon: CheckCircle },
    { id: "tasbih", label: t("tasbih"), icon: Compass },
    { id: "hadiths", label: t("hadiths"), icon: Award },
    { id: "adhan", label: t("adhan"), icon: Volume2 },
    { id: "notifications", label: t("notifications"), icon: Bell },
    { id: "prayerguide", label: t("prayerguide"), icon: Sparkles },
    { id: "mosques", label: t("mosques"), icon: MapPin },
    { id: "cards_generator", label: t("cards_generator"), icon: Image },
    { id: "ai_assistant", label: t("ai_assistant"), icon: Sparkles },
    { id: "settings", label: t("settings"), icon: Settings },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 font-sans ${
        darkMode
          ? "bg-[#04121e] text-white"
          : "bg-amber-50/40 text-slate-900"
      }`}
    >
      {/* 🕌 Background prayer alarms tracker & push notifications */}
      <PrayerNotificationTracker />
      
      {/* Top Application Header */}
      <header
        className={`sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md transition-colors ${
          darkMode
            ? "bg-[#071b29]/95 border-white/5 text-white"
            : "bg-[#e8dcc4]/90 border-amber-900/10 text-slate-900"
        }`}
      >
        
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-1.5 rounded-lg md:hidden transition ${
            darkMode ? "hover:bg-white/5" : "hover:bg-amber-900/5"
          }`}
        >
          {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
        </button>

        {/* Central Logo & Title Grouping */}
        <div className="flex items-center space-x-2 space-x-reverse justify-end flex-1 md:flex-initial text-right">

          <div className="text-right">
            <h1 className="text-sm font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-[#cca05a]">
              {t("appName")}
            </h1>
            <span className="text-[9px] text-[#cca05a] tracking-widest font-mono uppercase block leading-none">
              {t("appSubName")}
            </span>
          </div>
        </div>

        {/* Desktop Header Navigtor items */}
        <div className="hidden md:flex items-center space-x-1.5 space-x-reverse">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 space-x-reverse px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#cca05a] text-slate-950 shadow"
                    : darkMode
                    ? "text-slate-300 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-slate-900 hover:bg-amber-900/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Night / Light Mode visual toggle, Feedback, and Language Switcher */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
              darkMode ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" : "bg-slate-900/5 text-slate-800 hover:bg-slate-900/10"
            }`}
            title={isAr ? "البحث السريع (Ctrl+K)" : "Quick Search (Ctrl+K)"}
            aria-label="Open Search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={() => setIsFeedbackOpen(true)}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              darkMode ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" : "bg-slate-900/5 text-slate-800 hover:bg-slate-900/10"
            }`}
            title={isAr ? "المقترحات والشكاوى" : "Suggestions & Feedback"}
            aria-label="Send Feedback"
          >
            <MessageSquare className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={toggleLanguage}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all relative z-50 cursor-pointer ${
              darkMode 
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/20 hover:bg-amber-500/25" 
                : "bg-slate-900/5 text-slate-800 border border-slate-900/10 hover:bg-slate-900/10"
            }`}
          >
            {isAr ? "English" : "العربية"}
          </button>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              darkMode ? "bg-amber-500/10 text-yellow-300" : "bg-slate-900/5 text-slate-800"
            }`}
            aria-label="Toggle Night Mode"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      {/* Main Core View Area with Sidebar Panel */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
        
        {/* Sidebar Nav (Desktop only) */}
        <aside
          className={`hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16 w-64 border-l p-4 select-none shrink-0 text-right backdrop-blur-md ${
            darkMode
              ? "bg-[#071b29]/55 border-white/5"
              : "bg-amber-50/50 border-amber-900/10"
          }`}
        >
          <div className="py-2 inline-flex items-center text-right justify-end space-x-1.5 space-x-reverse border-b border-dashed border-[#cca05a]/30 mb-2 shrink-0">
            <Sparkles className="w-4 h-4 text-[#cca05a] animate-pulse" />
            <span className="text-xs font-bold text-[#cca05a]">{t("islamicSections")}</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-amber-500/10">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-end space-x-3 space-x-reverse px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-right ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 font-extrabold shadow scale-[1.03]"
                      : darkMode
                      ? "text-slate-300 hover:text-white hover:bg-white/5"
                      : "text-slate-700 hover:text-slate-950 hover:bg-amber-900/5"
                  }`}
                >
                  <span>{item.label}</span>
                  <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-[#cca05a]"}`} />
                </button>
              );
            })}
          </div>

          {/* User developer homage box in sidebar */}
          <div className="pt-6 mt-auto flex flex-col items-center text-center">
            <div className="w-10 h-px bg-[#cca05a]/30 my-2" />
            <span className="text-[10px] text-amber-500/50">{t("supervisedBy")}</span>
            <span className="text-xs font-bold text-amber-200/80 mb-2.5">{t("developerName")}</span>
            
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full flex items-center justify-center space-x-1.5 space-x-reverse px-3 py-2 rounded-xl text-[11px] font-extrabold bg-[#cca05a] hover:opacity-95 text-slate-950 shadow-md transition-all duration-300 transform hover:scale-[1.03] cursor-pointer mb-2"
            >
              <span>{t("feedback_btn")}</span>
              <MessageSquare className="w-3.5 h-3.5" />
            </button>

            <a
              href="https://wa.me/qr/QBORZHMLX4RVM1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-1.5 space-x-reverse px-3 py-2 rounded-xl text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-emerald-900/40 transition-all duration-300 transform hover:scale-[1.03] cursor-pointer"
            >
              <span>{t("whatsappContact")}</span>
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
            </a>
          </div>
        </aside>

        {/* Mobile menu navigation drawer (Active overlay) */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-950/70 z-[40] md:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div
          className={`fixed top-0 bottom-0 right-0 z-[49] w-72 max-w-xs p-5 flex flex-col shadow-2xl transition-transform duration-300 md:hidden backdrop-blur-md border-l ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } ${
            darkMode 
              ? "bg-[#071b29]/85 border-white/5 text-white" 
              : "bg-amber-50/85 border-amber-900/10 text-slate-900"
          }`}
        >
          <div className="flex justify-between items-center border-b border-dashed border-[#cca05a]/30 pb-3 mb-2 direction-rtl">
            <div className="flex items-center space-x-2 space-x-reverse text-[#cca05a]">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs">{t("navHeaderTitle")}</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable menu items area for perfect responsiveness on all screens */}
          <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-amber-500/10">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-end space-x-3 space-x-reverse px-4 py-2.5 rounded-xl text-xs font-bold transition text-right ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 font-extrabold shadow"
                      : darkMode
                      ? "text-slate-300 hover:text-white hover:bg-white/5"
                      : "text-slate-700 hover:text-slate-950 hover:bg-amber-900/5"
                  }`}
                >
                  <span>{item.label}</span>
                  <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-[#cca05a]"}`} />
                </button>
              );
            })}
          </div>

          <div className="text-center pt-3 border-t border-white/5 font-sans space-y-2 shrink-0">
            <span className="text-[10px] text-amber-500/40 block">{t("developerTitle")}</span>
            <span className="text-xs font-bold text-amber-300/80 mt-0.5 block">{t("developerName").replace("المطور / ", "")}</span>
            
            <button
              onClick={() => {
                setIsFeedbackOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full mt-2 flex items-center justify-center space-x-2 space-x-reverse px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#cca05a] text-slate-950 shadow-md transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              <span>{t("feedback_btn")}</span>
              <MessageSquare className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/qr/QBORZHMLX4RVM1"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center space-x-2 space-x-reverse px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              <span>{t("developerContact")}</span>
              <MessageCircle className="w-4 h-4 fill-current" />
            </a>

            <span className="text-[9px] text-slate-300/30 font-mono block pt-1">Ana Muslim v1.1.0</span>
          </div>
        </div>

        {/* Real-time Dynamic View Render Panel with rich padding */}
        <main className="flex-1 w-full min-w-0 md:p-6 pb-24 md:pb-6 relative z-10">
          {renderActiveView()}
        </main>
      </div>

      {/* Embedded Global Style classes and animations inside index.css wrapper */}
      {/* Mobile Sticky Bottom Navigator Bar for seamless mobile touch UX (Touch target > 44px) */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-40 md:hidden flex justify-between items-center px-4 py-2 backdrop-blur-lg border-t pb-5 transition-colors ${
          darkMode
            ? "bg-[#071b29]/70 border-white/5"
            : "bg-white/70 border-amber-900/10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
        }`}
      >
        {menuItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-lg relative cursor-pointer min-w-[50px]"
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? "text-[#cca05a] scale-110" : "text-slate-400"
                }`}
              />
              <span
                className={`text-[9px] mt-1 transition ${
                  isActive ? "text-[#cca05a] font-bold" : "text-slate-400"
                }`}
              >
                {item.id === "dashboard" ? (isAr ? "الرئيسية" : "Home") : item.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ✉️ Feedback Modal System Component */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        darkMode={darkMode}
      />

      {/* 🔍 Dynamic Global Search Drawer Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-10 select-none">
          {/* Blur background glass backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery("");
            }}
          />

          {/* Modal Container */}
          <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col overflow-hidden max-h-[85vh] md:max-h-[75vh] animate-in fade-in zoom-in duration-200 ${
            darkMode 
              ? "bg-[#071b29] border-[#cca05a]/30 text-white" 
              : "bg-amber-50 border-amber-900/20 text-slate-900"
          }`} style={{ direction: isAr ? "rtl" : "ltr" }}>
            
            {/* Header Input Area */}
            <div className="flex items-center gap-3 p-4 border-b border-dashed border-slate-500/10 shrink-0">
              <Search className="w-5 h-5 text-[#cca05a] shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder={isAr ? "ابحث عن سور، أذكار، أدعية أو أي قسم..." : "Search Surahs, Athkar, or any section..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-sm font-medium py-1 placeholder-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-white text-[10px]"
                >
                  ✕
                </button>
              )}
              <span className="text-[10px] font-mono text-[#cca05a]/60 bg-[#cca05a]/5 px-2 py-0.5 rounded border border-[#cca05a]/10 hidden sm:inline">
                ESC
              </span>
            </div>

            {/* Scrollable Results Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {(() => {
                const query = searchQuery.trim().toLowerCase();
                
                // 1. Filter Navigation/Tabs
                const matchingTabs = menuItems.filter(item => 
                  item.label.toLowerCase().includes(query) || 
                  (isAr && item.label.includes(query))
                );

                // 2. Filter Quran Surahs
                const matchingSurahs = query 
                  ? quranIndex.filter(s => 
                      s.name.includes(query) || 
                      s.englishName.toLowerCase().includes(query) ||
                      String(s.number) === query
                    )
                  : [];

                // 3. Filter Athkar Sections
                const matchingAthkar = query
                  ? athkarData.filter(cat => 
                      cat.title.includes(query) || 
                      cat.items.some(item => item.text.includes(query))
                    )
                  : [];

                const hasResults = matchingTabs.length > 0 || matchingSurahs.length > 0 || matchingAthkar.length > 0;

                if (!query) {
                  // Quick Access/Most Searched suggestions
                  return (
                    <div className="space-y-4 text-right">
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                        {isAr ? "وصول سريع ورائج 🔥" : "Popular & Quick Access 🔥"}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: "quran", labelAr: "القرآن الكريم", labelEn: "Holy Quran" },
                          { id: "athkar", labelAr: "حصن المسلم", labelEn: "Athkar & Duas" },
                          { id: "tasbih", labelAr: "المسبحة الإلكترونية", labelEn: "Tasbih Counter" },
                          { id: "dailyward", labelAr: "الورد اليومي", labelEn: "Daily Progress" },
                          { id: "adhan", labelAr: "أصوات الأذان", labelEn: "Adhan Sounds" },
                          { id: "ai_assistant", labelAr: "المساعد الإسلامي AI", labelEn: "AI Spiritual Assistant" },
                        ].map(sug => (
                          <button
                            key={sug.id}
                            onClick={() => {
                              setActiveTab(sug.id);
                              setIsSearchOpen(false);
                            }}
                            className={`p-3 rounded-xl border text-center transition hover:scale-[1.02] active:scale-95 cursor-pointer ${
                              darkMode
                                ? "bg-slate-900/50 border-white/5 hover:bg-slate-900 hover:border-[#cca05a]/30"
                                : "bg-white border-amber-900/10 hover:bg-amber-100/50"
                            }`}
                          >
                            <span className="text-xs font-bold block mb-0.5 text-[#cca05a]">
                              {isAr ? sug.labelAr : sug.labelEn}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {isAr ? "انتقال سريع" : "Go to section"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (!hasResults) {
                  return (
                    <div className="py-8 text-center space-y-2">
                      <span className="text-3xl">🔍</span>
                      <p className="text-xs font-bold text-slate-400">
                        {isAr ? "لم نجد أي نتائج تطابق بحثك." : "No results match your search."}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {isAr ? "تأكد من كتابة الكلمات بشكل صحيح وجرب مجدداً." : "Check your spelling and try again."}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 text-right">
                    
                    {/* Sections Results */}
                    {matchingTabs.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-wider pb-1 border-b border-dashed border-slate-500/15">
                          {isAr ? "أقسام وصفحات التطبيق" : "App Sections & Pages"}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {matchingTabs.map(item => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setActiveTab(item.id);
                                  setIsSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-right transition hover:scale-[1.01] cursor-pointer ${
                                  darkMode
                                    ? "bg-slate-900/40 border-white/5 hover:border-[#cca05a]/30 hover:bg-slate-900"
                                    : "bg-white border-amber-900/10 hover:bg-amber-100/50"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-[#cca05a]" />
                                  <span className="text-xs font-bold">
                                    {item.label}
                                  </span>
                                </div>
                                <span className="text-[9px] text-slate-500">
                                  {isAr ? "دخول" : "Enter"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quran Surahs Results */}
                    {matchingSurahs.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-wider pb-1 border-b border-dashed border-slate-500/15">
                          {isAr ? "سور القرآن الكريم" : "Holy Quran Surahs"}
                        </h4>
                        <div className="space-y-1">
                          {matchingSurahs.map(s => (
                            <button
                              key={s.number}
                              onClick={() => {
                                localStorage.setItem("quran_selected_surah_num", String(s.number));
                                localStorage.setItem("quran_select_surah_pending", "true");
                                setActiveTab("quran");
                                setIsSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-right transition cursor-pointer ${
                                darkMode
                                  ? "bg-slate-900/40 border-white/5 hover:border-[#cca05a]/30 hover:bg-slate-900"
                                  : "bg-white border-amber-900/10 hover:bg-amber-100/50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-[#cca05a] bg-[#cca05a]/10 w-6 h-6 rounded-lg flex items-center justify-center font-bold">
                                  {s.number}
                                </span>
                                <div className="text-right">
                                  <span className="text-xs font-bold block">
                                    سورة {s.name}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-sans">
                                    {s.englishName} • {s.numberOfAyahs} {isAr ? "آية" : "verses"}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-[#cca05a]">
                                {s.revelationType === "Meccan" ? (isAr ? "مكية" : "Meccan") : (isAr ? "مدنية" : "Medinan")}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Athkar Results */}
                    {matchingAthkar.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-wider pb-1 border-b border-dashed border-slate-500/15">
                          {isAr ? "أقسام حصن المسلم والأذكار" : "Hisn Al-Muslim Athkar"}
                        </h4>
                        <div className="space-y-1">
                          {matchingAthkar.map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => {
                                localStorage.setItem("athkar_selected_category", cat.id);
                                localStorage.setItem("athkar_select_pending", "true");
                                setActiveTab("athkar");
                                setIsSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-right transition cursor-pointer ${
                                darkMode
                                  ? "bg-slate-900/40 border-white/5 hover:border-[#cca05a]/30 hover:bg-slate-900"
                                  : "bg-white border-amber-900/10 hover:bg-amber-100/50"
                              }`}
                            >
                              <div className="text-right">
                                <span className="text-xs font-bold block text-amber-300">
                                  {cat.title}
                                </span>
                                <span className="text-[9px] text-slate-500 block truncate max-w-md">
                                  {cat.items[0]?.text || ""}
                                </span>
                              </div>
                              <span className="text-[9px] bg-amber-500/10 text-[#cca05a] px-2 py-0.5 rounded-full border border-[#cca05a]/20 font-bold">
                                {isAr ? "عرض الذكر" : "View"}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
