import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isAr: boolean;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Mapping the exact translation keys used by App.tsx and custom keys for the app contents
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // App Brand & Navigation keys Expected by App.tsx
    "appName": "أنا مسلم",
    "appSubName": "ANA MUSLIM",
    "islamicSections": "الأقسام والخدمات الإسلامية",
    "supervisedBy": "بإشراف وتطوير",
    "developerName": "شاهر حسان",
    "whatsappContact": "تواصل واتساب",
    "navHeaderTitle": "مسارات ومحتويات التطبيق",
    "developerTitle": "المهندس المطور الفني للتطبيق",
    "developerContact": "تواصل واتساب مع المطور",
    
    // Tab Keys Expected by App.tsx menuItems
    "dashboard": "الرئيسية والمواقيت",
    "quran": "القرآن الكريم",
    "dailyward": "الورد اليومي للتدبر",
    "calendar": "التقويم الهجري",
    "description": "وصف التطبيق",
    "athkar": "الأذكار اليومية",
    "tasbih": "المسبحة الذكية",
    "hadiths": "الحديث الشريف",
    "adhan": "أصوات الأذان",
    "notifications": "التنبيهات والإشعارات",
    "prayerguide": "كيفية الصلاة والأركان",
    "mosques": "المساجد القريبة",
    "cards_generator": "بطاقات الاقتباسات",
    "ai_assistant": "المساعد الإسلامي الذكي",
    "settings": "إعدادات التطبيق",

    // Dashboard UI keys & titles
    "settings_title": "موجِّه الخُطوط ومخبر جودة القراءة المعماري",
    "settings_desc": "خصِّص حجم ونقش كتابة الآيات والأحاديث لتناسب راحة ونظر عينيك",
    "quran_font_label": "📖 خط تلاوة القرآن الكريم",
    "hadith_font_label": "💫 خط متون الحديث الشريف",
    "font_size_label": "قياس الحجم:",
    "font_style_label": "نقش كاليغرافي للقرآن:",
    "font_style_hadith_label": "نمط كاليغرافي للحديث:",
    "font_preview_title": "معاينة نص العرض التفاعلي الفوري (Live Font Preview):",
    "font_preview_quran_label": "مظهر الآية:",
    "font_preview_hadith_label": "مظهر الحديث:",
    "font_style_serif": "أميري عتيق",
    "font_style_naskh": "نسخ واضح",
    "font_style_sans": "خط النظام",

    // Language Settings UI
    "lang_settings_label": "🌐 لغة العرض والواجهات (Language)",
    "lang_settings_desc": "بدّل لغة المحتوى العام والواجهات مع الحفاظ على النصوص القرآنية الشريفة بالعربية وبكبير نقائها كليجة مكنونة",
    "lang_ar": "العربية (Arabic)",
    "lang_en": "الإنجليزية (English)",

    // Theme Customization UI
    "theme_settings_label": "🎨 تخصيص السمة والألوان (Theme Palette)",
    "theme_settings_desc": "اختر مظهر الألوان المناسب لذوقك الفني لتخصيص كامل واجهات ومكونات التطبيق",
    "theme_gold": "الذهب الكلاسيكي (Gold)",
    "theme_emerald": "الزمرد الشريف (Emerald)",
    "theme_blue": "الأزرق الكوني (Blue)",
    "theme_ruby": "الياقوت الدافئ (Ruby)",
    "theme_purple": "البنفسجي الملكي (Purple)",

    // Prayer Times & Dashboard Content
    "prayer_times_today": "مواقيت الصلاة اليوم",
    "prayer_times_subtitle": "تنبيهات الأذان والعد التنازلي للفرض القادم بدقة متناهية",
    "waiting_prayer": "بانتظار صلاة $1",
    "time_remaining": "الوقت المتبقي:",
    "active_now": "قائمة الآن",
    "minutes": "دقائق",
    "hours": "ساعات",
    "prayer_tracker_title": "تتبع صلواتك اليومية ومكاسب عبادتك",
    "prayer_tracker_desc": "سجِّل حالة أداء كل صلاة لتبني خط بياني لالتزامك وتكسب أوسمة الأداء الإيماني",
    "not_determined_yet": "لم يُحدد بعد",
    "prayed_alhamdulillah": "صلّيت بفضل الله",
    "prayed_mosque": "صلّيت بالمسجد",
    "prayed_congregation": "صلّيتها جماعة",
    "prayed_late": "متأخرة / قضاء",
    "prayed_missed": "فائتة / لم تأدّ",
    
    // Prophet reminder card
    "prophet_reminder_restore": "إظهار منبر الصلاة على النبي ﷺ",
    "prophet_card_title": "الصلاة على النبي ﷺ (تذكير مستمر)",
    "prophet_card_verse": "«إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا»",
    "prophet_card_btn": "اضغط للصلاة على الحبيب ﷺ",
    "prophet_counter_prefix": "رصيد صلواتك اليوم:",
    "prophet_counter_suffix": "مرة",
    "prophet_badge_label": "الرتبة واللقب الذكري:",
    "prophet_card_hide": "إخفاء المنبر الذكري مؤقتاً",

    // Daily Verse Card
    "daily_verse_title": "📖 قبس من الأنوار القرآنية اليومية",
    "daily_verse_explanation_btn": "تفسير مفصل وتدبُّر معاني الآية",
    "daily_verse_explanation_loading": "جاري استحضار تدبر الآية وتفسيرها بالذكاء الاصطناعي...",
    "copied": "تم النسخ بنجاح!",
    "copy": "نسخ الآية",
    "previous": "السابق",
    "next": "التالي",

    // Fasting Tracker card
    "fasting_title": "🌙 مفكرة الصيام المتكاملة",
    "fasting_desc": "تتبع صيام التطوع والأيام المباركة مع تذكير تفصيلي",
    "fasting_today_status": "حالة صيامك اليوم:",
    "fasting_not_fasting": "غير صائم اليوم",
    "fasting_is_fasting": "الحمد لله، صائم اليوم",
    "fasting_toggle_btn": "تبديل حالة الصيام",
    "fasting_sunnah_header": "الأيام المباركة لصيام التطوع القادم:",
    "fasting_days_count": "متبقي $1 يوماً",
    "fasting_days_count_today": "اليوم!",

    // Audio stream & radio
    "audio_stream_title": "📻 البث الإذاعي الإسلامي المباشر",
    "audio_stream_desc": "استمع إلى تلاوة خاشعة على مدار 24 ساعة من إذاعة القاهرة ومكة المكرمة",
    "audio_stream_playing": "إيقاف المذياع",
    "audio_stream_paused": "تشغيل البث الحي",

    // Tasbih page (if we translate headers)
    "tasbih_title": "المسبحة الذكية",
    "tasbih_desc": "استخدم المسبحة التفاعلية لضبط أذكارك اليومية مع خاصية الاهتزاز والصوت",

    // Miscellaneous
    "save": "حفظ",
    "cancel": "إلغاء",
    "warning_ten_mins": "بقي أقل من 10 دقائق على إقامة الصلاة التالية!",
    "feedback_btn": "المقترحات والشكاوى ✉️",
    "feedback_desc": "يسعدنا دائماً الاستماع لآرائكم ومقترحاتكم أو البلاغ عن مشكلة فنية لتطوير التطبيق وخدمة المسلمين بجميع بقاع الأرض."
  },
  en: {
    // App Brand & Navigation keys Expected by App.tsx
    "appName": "Ana Muslim",
    "appSubName": "ANA MUSLIM",
    "islamicSections": "Islamic Sections & Services",
    "supervisedBy": "Under supervision of",
    "developerName": "Shaher Hassan",
    "whatsappContact": "Contact WhatsApp",
    "navHeaderTitle": "App Paths & Sections",
    "developerTitle": "Aesthetic App Developer",
    "developerContact": "Contact Developer Group",

    // Tab Keys Expected by App.tsx menuItems
    "dashboard": "Home & Prayer Times",
    "quran": "Noble Quran",
    "dailyward": "Daily Quran Verse",
    "calendar": "Hijri Calendar",
    "description": "App Description",
    "athkar": "Daily Athkar",
    "tasbih": "Smart Tasbih",
    "hadiths": "Hadith Shareef",
    "adhan": "Adhan Voices",
    "notifications": "Notifications Center",
    "prayerguide": "Prayer Pillars & Guide",
    "mosques": "Nearby Mosques",
    "cards_generator": "Quote Cards",
    "ai_assistant": "Smart AI Assistant",
    "settings": "App Settings",

    // Dashboard UI keys & titles
    "settings_title": "Typography Controls & Reading Bench",
    "settings_desc": "Customize text size and calligraphy of Quranic verses & Hadith to fit your visual comfort",
    "quran_font_label": "📖 Holy Quran Recitation FontStyle",
    "hadith_font_label": "💫 Prophet Hadith FontStyle",
    "font_size_label": "Font Size:",
    "font_style_label": "Quranic Calligraphy:",
    "font_style_hadith_label": "Hadith Typography Style:",
    "font_preview_title": "Live Rendering Preview:",
    "font_preview_quran_label": "Verse Aspect:",
    "font_preview_hadith_label": "Hadith Aspect:",
    "font_style_serif": "Amiri Vintage",
    "font_style_naskh": "Clear Naskh",
    "font_style_sans": "System Font",

    // Language Settings UI
    "lang_settings_label": "🌐 Application Language / لغة التطبيق",
    "lang_settings_desc": "Toggle the UI and basic content language while preserving the beautiful Quranic Texts in high-clarity Arabic text",
    "lang_ar": "العربية (Arabic)",
    "lang_en": "English (الإنجليزية)",

    // Theme Customization UI
    "theme_settings_label": "🎨 Customize Theme & Colors (Theme Palette)",
    "theme_settings_desc": "Select the color palette that matches your aesthetic preference to customize the app's components & icons",
    "theme_gold": "Classic Gold",
    "theme_emerald": "Sacred Emerald",
    "theme_blue": "Cosmic Blue",
    "theme_ruby": "Warm Ruby",
    "theme_purple": "Royal Purple",

    // Prayer Times & Dashboard Content
    "prayer_times_today": "Today's Prayer Times",
    "prayer_times_subtitle": "Adhan alerts and countdown for the next obligatory prayer with extreme accuracy",
    "waiting_prayer": "Waiting for $1",
    "time_remaining": "Remaining:",
    "active_now": "Currently Appending",
    "minutes": "min",
    "hours": "hrs",
    "prayer_tracker_title": "Daily Prayer Tracker & Worship Analytics",
    "prayer_tracker_desc": "Log your prayer attendance status to build a commitment graph and unlock custom spiritual badges",
    "not_determined_yet": "Not specified",
    "prayed_alhamdulillah": "Prayed (Alhamdulillah)",
    "prayed_mosque": "Prayed at Mosque",
    "prayed_congregation": "Prayed in Jama'ah",
    "prayed_late": "Delayed / Makeup",
    "prayed_missed": "Missed / Not Prayed",
    
    // Prophet reminder card
    "prophet_reminder_restore": "Restore Prophet Blessings Bench ﷺ",
    "prophet_card_title": "Durood upon Prophet Muhammad ﷺ (Continuous)",
    "prophet_card_verse": "«Indeed, Allah and His angels sends blessings upon the Prophet. O you who have believed, ask [ Allah to confer] blessing upon him and ask for peace.»",
    "prophet_card_btn": "Tap to send blessings upon Him ﷺ",
    "prophet_counter_prefix": "Blessings logged today:",
    "prophet_counter_suffix": "times",
    "prophet_badge_label": "Spiritual Devoted Title:",
    "prophet_card_hide": "Hide blessings panel temporarily",

    // Daily Verse Card
    "daily_verse_title": "📖 Ray from the Quranic Verses (Daily Guidance)",
    "daily_verse_explanation_btn": "Detailed AI Reflection & Tafsir",
    "daily_verse_explanation_loading": "Invoking AI reflection and authentic Tafsir insights...",
    "copied": "Copied successfully!",
    "copy": "Copy Verse",
    "previous": "Previous",
    "next": "Next",

    // Fasting Tracker card
    "fasting_title": "🌙 Integrated Fasting Companion",
    "fasting_desc": "Track voluntary fasting and blessed sunnah days with beautiful counters",
    "fasting_today_status": "Your fasting state today:",
    "fasting_not_fasting": "Not fasting today",
    "fasting_is_fasting": "Alhamdulillah, fasting today",
    "fasting_toggle_btn": "Toggle Fasting State",
    "fasting_sunnah_header": "Upcoming blessed voluntary fasting days:",
    "fasting_days_count": "$1 days remaining",
    "fasting_days_count_today": "Today!",

    // Audio stream & radio
    "audio_stream_title": "📻 Live Islamic Broadcasts",
    "audio_stream_desc": "Tune in to peaceful Quranic chants broadcasting 24/7 of Cairo & Makkah",
    "audio_stream_playing": "Pause Stream",
    "audio_stream_paused": "Play Live Radio",

    // Tasbih page (if we translate headers)
    "tasbih_title": "Smart Tasbih Contador",
    "tasbih_desc": "Use the smart interaction bead to calculate your subhas and chants with sound/haptics",

    // Miscellaneous
    "save": "Save",
    "cancel": "Cancel",
    "warning_ten_mins": "Less than 10 minutes left until the congregation of next prayer!",
    "feedback_btn": "Suggestions & Feedback ✉️",
    "feedback_desc": "We would love to hear your suggestions, ideas, or report of technical issues to help improve this application for Muslims worldwide."
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("app_lang") as Language) || "ar";
  });

  const toggleLanguage = () => {
    const nextLang = language === "ar" ? "en" : "ar";
    setLanguageState(nextLang);
    localStorage.setItem("app_lang", nextLang);
  };

  useEffect(() => {
    // Dynamic page direction support for multi-language beauty
    const dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translationSet = translations[language] || translations["ar"];
    return translationSet[key] || translations["ar"][key] || key;
  };

  const isAr = language === "ar";
  const dir = isAr ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isAr, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
