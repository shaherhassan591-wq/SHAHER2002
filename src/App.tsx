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
import { useLanguage } from "./context/LanguageContext";

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
} from "lucide-react";

export default function App() {
  const { language, toggleLanguage, t, isAr } = useLanguage();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [accentTheme, setAccentTheme] = useState<string>(() => {
    return localStorage.getItem("app_accent_theme") || "gold";
  });
  const [showPermissions, setShowPermissions] = useState<boolean>(() => {
    return localStorage.getItem("has_seen_permissions_modal") === null;
  });

  useEffect(() => {
    initGlobalTapSounds();
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
          className={`hidden md:flex flex-col w-64 border-l p-4 space-y-2 select-none shrink-0 text-right ${
            darkMode
              ? "bg-[#071b29]/55 border-white/5"
              : "bg-amber-50/50 border-amber-900/10"
          }`}
        >
          <div className="py-2 inline-flex items-center text-right justify-end space-x-1.5 space-x-reverse border-b border-dashed border-[#cca05a]/30 mb-2">
            <Sparkles className="w-4 h-4 text-[#cca05a] animate-pulse" />
            <span className="text-xs font-bold text-[#cca05a]">{t("islamicSections")}</span>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-end space-x-3 space-x-reverse px-4 py-3 rounded-xl text-xs font-bold transition-all text-right ${
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
          className={`fixed top-0 bottom-0 right-0 z-[49] w-72 max-w-xs p-5 flex flex-col space-y-3 shadow-2xl transition-transform duration-300 md:hidden ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } ${
            darkMode ? "bg-[#071b29] text-white" : "bg-amber-50 text-slate-900"
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
                className={`w-full flex items-center justify-end space-x-3 space-x-reverse px-4 py-3 rounded-xl text-xs font-bold transition text-right ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 font-extrabold shadow"
                    : darkMode
                    ? "text-slate-300 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-slate-950 hover:bg-amber-900/5"
                }`}
              >
                <span>{item.label}</span>
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-100" : "text-[#cca05a]"}`} />
              </button>
            );
          })}

          <div className="text-center pt-6 mt-auto border-t border-white/5 font-sans space-y-2">
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
        className={`fixed bottom-0 left-0 right-0 z-40 md:hidden flex justify-between items-center px-4 py-2 backdrop-blur-md border-t pb-5 transition-colors ${
          darkMode
            ? "bg-[#071b29]/95 border-white/5"
            : "bg-white/95 border-amber-900/10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
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
    </div>
  );
}
