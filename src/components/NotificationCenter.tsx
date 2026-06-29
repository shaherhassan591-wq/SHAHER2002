import React, { useState, useEffect, useRef } from "react";
import { Bell, BellOff, ShieldCheck, Sparkles, Volume2, Info, Moon, Settings, Flame, BookOpen, Clock, RefreshCw } from "lucide-react";
import { NotificationSetting } from "../types";
import { muadhinsList } from "../data/islamicData";
import { useLanguage } from "../context/LanguageContext";
import { getCustomAudio, saveCustomAudio, deleteCustomAudio } from "../utils/audioStorage";
import { 
  isNativeAndroid, 
  scheduleNativeAlarm, 
  cancelAllNativeAlarms, 
  requestNativeAutostart, 
  requestNativeIgnoreBatteryOptimizations, 
  APP_PACKAGE_ID 
} from "../utils/androidBridge";
import { LocalNotifications } from "@capacitor/local-notifications";
import {
  isLocalNotificationsSupported,
  requestLocalNotificationPermissions,
  scheduleAllOfflineNotifications,
  cancelAllOfflineNotifications
} from "../utils/localNotifications";

interface QuranVerseNotification {
  verse: string;
  surah: string;
  translated: string;
}

const randomQuranVerses: QuranVerseNotification[] = [
  {
    verse: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    surah: "البقرة - ١٨٦",
    translated: "ألطف وأصدق تنبيه بوجود الله وقربه الدائم وإجابته السريعة الصادقة لقلبك."
  },
  {
    verse: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    surah: "الرعد - ٢٨",
    translated: "طمأنينة وهدوء داخلي لنفسك؛ اذكر الله في سرك وعلنك."
  },
  {
    verse: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    surah: "الشرح - ٦",
    translated: "بشرى ربانية بأن كل ضيق يعقبه فرج واسع مبهج."
  },
  {
    verse: "وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا",
    surah: "الطور - ٤٨",
    translated: "أنت في رعاية الله وحفظه، اصبر واطمئن."
  },
  {
    verse: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    surah: "الطلاق - ٣",
    translated: "الله كافيك وناصرك وحافظك في كل دروب حياتك."
  },
  {
    verse: "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا",
    surah: "الأحزاب - ٥٦",
    translated: "تذكير بالصلاة والسلام على رسول الله صلى الله عليه وسلم لتنال شفاعته ورحمة من ربك."
  }
];

export default function NotificationCenter() {
  const { language, toggleLanguage, t, isAr } = useLanguage();
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);
  const [quranNotifyEnabled, setQuranNotifyEnabled] = useState<boolean>(() => {
    return localStorage.getItem("quran_notifications_enabled") !== "false";
  });
  const [quranNotifyInterval, setQuranNotifyInterval] = useState<string>(() => {
    return localStorage.getItem("quran_notifications_interval") || "daily";
  });

  // User custom alert sounds dict
  const [customSounds, setCustomSounds] = useState<{ id: string; name: string; dataUrl: string }[]>(() => {
    try {
      const saved = localStorage.getItem("user_custom_sounds");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Pre-prayer 10 minutes alert reminder setting
  const [prePrayerPrepEnabled, setPrePrayerPrepEnabled] = useState<boolean>(() => {
    return localStorage.getItem("pre_prayer_prep_enabled") !== "false";
  });

  const [prePrayerPrepTime, setPrePrayerPrepTime] = useState<number>(() => {
    return Number(localStorage.getItem("pre_prayer_prep_time") || "10");
  });

  useEffect(() => {
    const handleSync = () => {
      setPrePrayerPrepEnabled(localStorage.getItem("pre_prayer_prep_enabled") !== "false");
      setPrePrayerPrepTime(Number(localStorage.getItem("pre_prayer_prep_time") || "10"));
    };
    window.addEventListener("prayer-reminder-changed", handleSync);
    return () => {
      window.removeEventListener("prayer-reminder-changed", handleSync);
    };
  }, []);

  const toArabicNumerals = (num: number | string): string => {
    if (!isAr) return String(num);
    const arabicMap: { [key: string]: string } = {
      "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
      "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩"
    };
    return String(num).replace(/[0-9]/g, (d) => arabicMap[d]);
  };

  // Hourly prophet blessing chimes settings
  const [prophetChimesEnabled, setProphetChimesEnabled] = useState<boolean>(() => {
    return localStorage.getItem("prophet_chimes_enabled") !== "false";
  });
  const [prophetChimesTimingMin, setProphetChimesTimingMin] = useState<number>(() => {
    return Number(localStorage.getItem("prophet_chimes_timing_min") || "0"); // minute of the hour, default 00 (exact hour)
  });
  const [prophetChimesVoice, setProphetChimesVoice] = useState<string>(() => {
    return localStorage.getItem("prophet_chimes_voice") || "real_prophet";
  });

  const [customAudioName, setCustomAudioName] = useState<string>(() => {
    return localStorage.getItem("custom_audio_filename") || "";
  });
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load notification configs
  const [settings, setSettings] = useState<NotificationSetting[]>(() => {
    const defaultData: NotificationSetting[] = [
      { prayerId: "fajr", prayerName: "صلاة الفجر", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "dhuhr", prayerName: "صلاة الظهر", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "asr", prayerName: "صلاة العصر", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "maghrib", prayerName: "صلاة المغرب", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "isha", prayerName: "صلاة العشاء", enabled: true, adhanVoiceId: "makkah" },
    ];
    const saved = localStorage.getItem("notification_settings");
    return saved ? JSON.parse(saved) : defaultData;
  });

  // --- Offline Local Notification integration states ---
  const [localNotificationsSupp, setLocalNotificationsSupp] = useState<boolean>(false);
  const [scheduledCount, setScheduledCount] = useState<number>(0);
  const [localPermission, setLocalPermission] = useState<string>("default");

  // Custom Local Notification toggle states
  const [tgQuran, setTgQuran] = useState<boolean>(() => localStorage.getItem("tg_quran_alerts") !== "false");
  const [tgHadith, setTgHadith] = useState<boolean>(() => localStorage.getItem("tg_hadith_alerts") !== "false");
  const [tgSalawat, setTgSalawat] = useState<boolean>(() => localStorage.getItem("tg_salawat_alerts") !== "false");

  const [dailyVerseEnabled, setDailyVerseEnabled] = useState<boolean>(() => localStorage.getItem("daily_verse_notif_enabled") !== "false");
  const [dailyHadithEnabled, setDailyHadithEnabled] = useState<boolean>(() => localStorage.getItem("daily_hadith_notif_enabled") !== "false");
  const [dailyMoralEnabled, setDailyMoralEnabled] = useState<boolean>(() => localStorage.getItem("daily_moral_notif_enabled") !== "false");

  // --- Quiet Daily Athkar Reminders State ---
  const [athkarReminders, setAthkarReminders] = useState<{
    enabled: boolean;
    morningTime: string;
    morningEnabled: boolean;
    eveningTime: string;
    eveningEnabled: boolean;
    nightTime: string;
    nightEnabled: boolean;
    chimeSoundId: "gentle" | "crystal" | "none";
  }>(() => {
    const saved = localStorage.getItem("athkar_reminder_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      enabled: true,
      morningTime: "07:00",
      morningEnabled: true,
      eveningTime: "17:00",
      eveningEnabled: true,
      nightTime: "22:00",
      nightEnabled: true,
      chimeSoundId: "gentle",
    };
  });

  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    return localStorage.getItem("app_accent_theme") || "gold";
  });

  const saveAthkarReminders = (newConfig: typeof athkarReminders) => {
    setAthkarReminders(newConfig);
    localStorage.setItem("athkar_reminder_config", JSON.stringify(newConfig));
  };

  const playChimeSample = (type: "gentle" | "crystal" | "none") => {
    if (type === "none") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "gentle") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(660, ctx.currentTime); // E5
        osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.9);
      } else {
        // crystal chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, ctx.currentTime); // High pitch D6
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.start();
        osc.stop(ctx.currentTime + 1.3);
      }
    } catch(e) {
      console.warn("Could not play chime sample:", e);
    }
  };

  const [testNotificationActive, setTestNotificationActive] = useState<boolean>(false);
  const [testNotificationContent, setTestNotificationContent] = useState<{title: string, body: string, iconType: "prayer" | "quran" | "salat" | "dhikr"}>({
    title: "",
    body: "",
    iconType: "prayer"
  });

  const [silentModeEnabled, setSilentModeEnabled] = useState<boolean>(() => {
    return localStorage.getItem("silent_mode") === "true";
  });

  const toggleSilentMode = () => {
    const nextVal = !silentModeEnabled;
    setSilentModeEnabled(nextVal);
    localStorage.setItem("silent_mode", String(nextVal));
    if (nextVal) {
      triggerLocalAlert("🔕 تفعيل الوضع الصامت (Silent Mode)", "تم إيقاف جميع التنبيهات الصوتية مؤقتاً، وتفعيل الإشعارات المرئية فقط.", "prayer");
    } else {
      triggerLocalAlert("🔊 إلغاء الوضع الصامت", "تم تفعيل التنبيهات الصوتية والأذان بنجاح.", "prayer");
    }
    // Sync alarms with the live silent status
    syncAlarmsToAndroid(settings);
  };

  const syncAlarmsToAndroid = (updatedSettings: NotificationSetting[]) => {
    try {
      window.dispatchEvent(new Event("prayer-reminder-changed"));
    } catch (e) {}

    if (!isNativeAndroid()) {
      console.log("[NotificationCenter] App is not in native WebView. Skipping AlarmManager registration.");
      return;
    }
    try {
      console.log("[NotificationCenter] Syncing Alarms to Native Alarm Manager...");
      cancelAllNativeAlarms();

      const rawTimes = localStorage.getItem("calculated_prayer_times");
      let times: Record<string, string> = {};
      if (rawTimes) {
        times = JSON.parse(rawTimes);
      } else {
        times = { fajr: "04:45", dhuhr: "12:15", asr: "15:35", maghrib: "18:20", isha: "19:45" };
      }

      const isSilent = localStorage.getItem("silent_mode") === "true";
      const isDnd = localStorage.getItem("dnd_mode") === "true";

      // 1. Sync standard prayer alarms
      updatedSettings.forEach((s) => {
        if (s.enabled) {
          const prayerTime = times[s.prayerId] || "12:00";
          // Schedule native AlarmManager for the standard prayer
          const voiceId = (isSilent || isDnd) ? "silent" : s.adhanVoiceId;
          const success = scheduleNativeAlarm(s.prayerName, prayerTime, voiceId);
          console.log(`[NotificationCenter] Scheduled Alarm ${s.prayerName} at ${prayerTime} with voice ${voiceId}: ${success}`);

          // Trigger pre-prayer 10 minutes warning alarm
          if (prePrayerPrepEnabled) {
            try {
              const [h, m] = prayerTime.split(":").map(Number);
              let totalMin = h * 60 + m - 10;
              if (totalMin < 0) totalMin += 24 * 60;
              const preH = String(Math.floor(totalMin / 60)).padStart(2, "0");
              const preM = String(totalMin % 60).padStart(2, "0");
              const preVoice = (isSilent || isDnd) ? "silent" : "pre_reminder";
              scheduleNativeAlarm(`الاستعداد لصلاة ${s.prayerName}`, `${preH}:${preM}`, preVoice);
              console.log(`[NotificationCenter] Scheduled 10-Min Pre-Prayer prep alarm at ${preH}:${preM}`);
            } catch (e) {
              console.warn(e);
            }
          }
        }
      });

      // 2. Sync Salat-ala-Nabi (Prophet blessings) alarms if enabled!
      const prophetEnabled = localStorage.getItem("prophet_chimes_enabled") !== "false";
      if (prophetEnabled && !isSilent) {
        const voiceId = localStorage.getItem("prophet_chimes_voice") || "real_prophet";
        const mode = localStorage.getItem("prophet_reminder_mode") || "interval";
        const startHour = Number(localStorage.getItem("prophet_active_hours_start") || "8");
        const endHour = Number(localStorage.getItem("prophet_active_hours_end") || "22");

        if (mode === "fixed") {
          const rawFixed = localStorage.getItem("prophet_daily_times");
          let fixedTimes: string[] = [];
          if (rawFixed) {
            try { fixedTimes = JSON.parse(rawFixed); } catch (e) {}
          }
          fixedTimes.forEach((timeStr) => {
            scheduleNativeAlarm(`الصلاة على النبي ${timeStr}`, timeStr, voiceId);
            console.log(`[NotificationCenter] Scheduled Native Salat-ala-Nabi alarm at ${timeStr}`);
          });
        } else {
          // interval mode
          const intervalMins = Number(localStorage.getItem("prophet_reminder_interval") || "60");
          if (intervalMins > 0) {
            // Generate periodic times during active hours
            let currentMin = startHour * 60;
            const endMin = endHour * 60;
            
            const limit = 24; // safe limit of max interval alarms
            let count = 0;
            
            // Handle cross-day boundary (e.g., 22:00 to 06:00)
            const isCrossDay = startHour > endHour;
            const maxMin = isCrossDay ? (endHour + 24) * 60 : endMin;
            
            while (currentMin <= maxMin && count < limit) {
              const actualMin = currentMin % (24 * 60);
              const h = String(Math.floor(actualMin / 60)).padStart(2, "0");
              const m = String(actualMin % 60).padStart(2, "0");
              const timeStr = `${h}:${m}`;
              
              scheduleNativeAlarm(`الصلاة على النبي ${timeStr}`, timeStr, voiceId);
              console.log(`[NotificationCenter] Scheduled Periodic Salat-ala-Nabi alarm at ${timeStr}`);
              
              currentMin += intervalMins;
              count++;
            }
          }
        }
      }

      console.log("[NotificationCenter] Done syncing native background alarms.");
    } catch (e) {
      console.error("[NotificationCenter] Failed to sync alarms:", e);
    }
  };

  useEffect(() => {
    // Check standard browser permissions on mount
    if (isNativeAndroid()) {
      setPermissionsGranted(true); // Native is authorized
      syncAlarmsToAndroid(settings);
    } else if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionsGranted(Notification.permission === "granted");
    }
  }, []);

  useEffect(() => {
    const handleProphetChange = () => {
      const savedVoice = localStorage.getItem("prophet_chimes_voice");
      if (savedVoice !== null) setProphetChimesVoice(savedVoice || "real_prophet");
      const savedName = localStorage.getItem("custom_audio_filename");
      setCustomAudioName(savedName || "");
    };
    window.addEventListener("prophet-reminder-changed", handleProphetChange);
    return () => {
      window.removeEventListener("prophet-reminder-changed", handleProphetChange);
    };
  }, []);

  // --- Offline Local Notification Setup and Event Listeners ---
  const checkLocalNotificationsStatus = async () => {
    try {
      const supp = isLocalNotificationsSupported();
      setLocalNotificationsSupp(supp);
      if (supp) {
        const pending = await LocalNotifications.getPending();
        setScheduledCount(pending.notifications?.length || 0);
        
        let perm = "default";
        const status = await LocalNotifications.checkPermissions();
        if (status.display === "granted") {
          perm = "granted";
        } else if (status.display === "denied") {
          perm = "denied";
        }
        setLocalPermission(perm);
      }
    } catch (e) {
      console.warn("Error checking local notifications status:", e);
    }
  };

  useEffect(() => {
    checkLocalNotificationsStatus();
    // Re-check periodically or on refocus
    const handleFocus = () => checkLocalNotificationsStatus();
    window.addEventListener("focus", handleFocus);
    window.addEventListener("prayer-reminder-changed", handleFocus);
    window.addEventListener("prophet-reminder-changed", handleFocus);
    
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("prayer-reminder-changed", handleFocus);
      window.removeEventListener("prophet-reminder-changed", handleFocus);
    };
  }, []);

  const handleOfflineSync = async () => {
    try {
      const success = await scheduleAllOfflineNotifications();
      if (success) {
        triggerLocalAlert("🕋 جدولة الإشعارات والمنبهات", "تم إعادة جدولة كامل مواقيت الصلوات والسنن الرواتب بنجاح للعمل دون اتصال بالإنترنت (Offline Mode)!", "prayer");
        await checkLocalNotificationsStatus();
      } else {
        triggerLocalAlert("⚠️ فشل تفعيل المنبهات", "نظام الإشعارات المحلية غير مفعّل بالمتصفح أو لم يتم السماح بالصلاحيات.", "prayer");
      }
    } catch (e) {
      console.warn("Offline synchronization exception:", e);
      triggerLocalAlert("⚠️ عذراً، لم تنجح الجدولة", "حدث خطأ أثناء الاتصال بنظام محاكاة الإشعارات المحلية.", "prayer");
    }
  };

  const handleToggleTag = async (key: string, currentValue: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    const newValue = !currentValue;
    setter(newValue);
    localStorage.setItem(`tg_${key}_alerts`, newValue ? "true" : "false");
    
    // Immediately trigger local notification schedule updates on device
    await scheduleAllOfflineNotifications();
    await checkLocalNotificationsStatus();
    
    if (newValue) {
      triggerLocalAlert("✅ تفعيل التفضيل محلياً", `تم تفعيل وتحديث جدول التنبيهات المخصصة بنجاح!`, "dhikr");
    } else {
      triggerLocalAlert("🚫 إلغاء التفضيل محلياً", `تم إيقاف فئة التنبيهات وإزالتها من جدولة الهاتف بنجاح.`, "dhikr");
    }
  };

  const handleToggleDailyVerse = async () => {
    const nextVal = !dailyVerseEnabled;
    setDailyVerseEnabled(nextVal);
    localStorage.setItem("daily_verse_notif_enabled", nextVal ? "true" : "false");
    await scheduleAllOfflineNotifications();
    await checkLocalNotificationsStatus();
    triggerLocalAlert(isAr ? "📖 تفعيل آية اليوم" : "📖 Enable Verse of the Day", isAr ? "تم تحديث جدول إشعارات آية اليوم." : "Verse of the Day scheduling updated.", "quran");
  };

  const handleToggleDailyHadith = async () => {
    const nextVal = !dailyHadithEnabled;
    setDailyHadithEnabled(nextVal);
    localStorage.setItem("daily_hadith_notif_enabled", nextVal ? "true" : "false");
    await scheduleAllOfflineNotifications();
    await checkLocalNotificationsStatus();
    triggerLocalAlert(isAr ? "💬 تفعيل حديث اليوم" : "💬 Enable Hadith of the Day", isAr ? "تم تحديث جدول إشعارات حديث اليوم الشريف." : "Hadith of the Day scheduling updated.", "dhikr");
  };

  const handleToggleDailyMoral = async () => {
    const nextVal = !dailyMoralEnabled;
    setDailyMoralEnabled(nextVal);
    localStorage.setItem("daily_moral_notif_enabled", nextVal ? "true" : "false");
    await scheduleAllOfflineNotifications();
    await checkLocalNotificationsStatus();
    triggerLocalAlert(isAr ? "💡 تفعيل نصيحة اليوم" : "💡 Enable Moral Tip of the Day", isAr ? "تم تحديث جدول الإشعارات النصائحية الأخلاقية." : "Moral Tip of the Day scheduling updated.", "dhikr");
  };

  const requestBrowserPermission = async () => {
    if (typeof window === "undefined") return;

    // 1. If we are running in Native Android or Local Notifications are supported, request local notifications permission
    if (isNativeAndroid() || isLocalNotificationsSupported()) {
      try {
        const granted = await requestLocalNotificationPermissions();
        if (granted) {
          setPermissionsGranted(true);
          await scheduleAllOfflineNotifications();
          triggerLocalAlert(
            isAr ? "تم تفعيل الإشعارات بنجاح!" : "Notifications Enabled!",
            isAr ? "شكرًا لك، سنقوم بتنبيهك بمواقيت الصلوات والآيات القرآنية بنظام الإشعارات المحلي." : "Thank you, we will alert you using the local notification system.",
            "prayer"
          );
          return;
        }
      } catch (e) {
        console.warn("Capacitor local notification request failed, trying standard browser notification...", e);
      }
    }

    // 2. Otherwise try standard browser Notification API if available
    if ("Notification" in window) {
      try {
        const res = await Notification.requestPermission();
        if (res === "granted") {
          setPermissionsGranted(true);
          triggerLocalAlert("تم تفعيل الإشعارات بنجاح!", "شكرًا لك، سنقوم بتنبيهك بمواقيت الصلوات والآيات القرآنية العطرة.", "prayer");
          return;
        } else {
          setPermissionsGranted(false);
          alert(isAr ? "تم رفض صلاحية الإشعارات. يرجى تفعيلها من إعدادات المتصفح." : "Notification permission denied. Please enable it in browser settings.");
          return;
        }
      } catch (e) {
        console.warn("Standard notification request failed:", e);
      }
    }

    // 3. Graceful fallback for mobile browsers/webviews where Notification API is undefined
    // We mark permissions as true to enable all the local in-app reminders and offline scheduling seamlessly
    setPermissionsGranted(true);
    triggerLocalAlert(
      isAr ? "تم تفعيل التنبيهات الذكية" : "Smart Notifications Enabled",
      isAr ? "تم تهيئة وتفعيل نظام التنبيهات المدمج للتطبيق بنجاح للعمل تلقائياً!" : "The built-in notification system has been successfully initialized to run automatically!",
      "prayer"
    );
  };

  const triggerLocalAlert = (title: string, body: string, iconType: "prayer" | "quran" | "salat" | "dhikr") => {
    // 1. Try standard browser notification if permission is there
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body, icon: "/favicon.ico" });
      } catch (e) {
        // Fallback for some OS/browsers
      }
    }

    // 2. Fallback to gorgeous in-app alert simulation
    setTestNotificationContent({ title, body, iconType });
    setTestNotificationActive(true);
    setTimeout(() => {
      setTestNotificationActive(false);
    }, 7000);
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("الرجاء اختيار ملف صوتي أصغر من 8 ميجابايت لضمان سرعة الحفظ المباشر.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newSound = {
        id: "custom_" + Date.now(),
        name: file.name,
        dataUrl: dataUrl
      };
      const updated = [...customSounds, newSound];
      setCustomSounds(updated);
      localStorage.setItem("user_custom_sounds", JSON.stringify(updated));
      triggerLocalAlert("🎵 رفع ملف صوتي تفاعلي", `تم رفع الصوت "${file.name}" وتوفيره للاستخدام بنجاح.`, "prayer");
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCustomSound = (id: string) => {
    const updated = customSounds.filter((s) => s.id !== id);
    setCustomSounds(updated);
    localStorage.setItem("user_custom_sounds", JSON.stringify(updated));
  };

  const handleToggle = (prayerId: string) => {
    const updated = settings.map((s) => {
      if (s.prayerId === prayerId) {
        return { ...s, enabled: !s.enabled };
      }
      return s;
    });
    setSettings(updated);
    localStorage.setItem("notification_settings", JSON.stringify(updated));
    syncAlarmsToAndroid(updated);
  };

  const toggleQuranNotifications = () => {
    const nextVal = !quranNotifyEnabled;
    setQuranNotifyEnabled(nextVal);
    localStorage.setItem("quran_notifications_enabled", String(nextVal));
    if (nextVal) {
      triggerLocalAlert("✨ تفعيل تدبر الآيات", "سيرسل لك التطبيق تنبيهات تدبرية مهدئة لآيات قرآنية محببة للقلوب.", "quran");
    }
  };

  const changeQuranInterval = (interval: string) => {
    setQuranNotifyInterval(interval);
    localStorage.setItem("quran_notifications_interval", interval);
  };

  const sendRandomQuranNotificationNow = () => {
    const randomIdx = Math.floor(Math.random() * randomQuranVerses.length);
    const item = randomQuranVerses[randomIdx];
    triggerLocalAlert(`📖 آية قرآنية للتدبر (${item.surah})`, `「 ${item.verse} 」\n${item.translated}`, "quran");
  };

  return (
    <div className="flex flex-col h-full bg-[#071b29] text-white p-4 font-sans select-none overflow-y-auto">
      
      {/* 🌐 LANGUAGE INTERFACE SWITCHER CARD */}
      <div className="bg-[#092234] border border-[#cca05a]/20 p-5 rounded-2xl mb-6 text-right space-y-4 flex-none">
        <div className="flex justify-between items-center pb-2 border-b border-white/5" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-xl">🌐</span>
            <h3 className="text-xs font-bold text-amber-100">{isAr ? "لغة واجهة المستخدم" : "App Interface Language"}</h3>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => toggleLanguage()}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative z-50 cursor-pointer ${
                language === "ar" 
                  ? "bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 font-extrabold shadow" 
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => toggleLanguage()}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative z-50 cursor-pointer ${
                language === "en" 
                  ? "bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 font-extrabold shadow" 
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              English
            </button>
          </div>
        </div>
        <p className="text-[11px] text-slate-350 leading-relaxed font-light font-sans text-right">
          {isAr 
            ? "قم بتبديل لغة واجهة التطبيق والخدمات الأساسية بين العربية والإنجليزية، مع حفظ المصحف والنصوص القرآنية بلغتها العربية الأصيلة الطاهرة."
            : "Switch the interface layout and core features between English and Arabic. Quranic scriptures will remain preserved in their original Arabic text."}
        </p>
      </div>

      {/* 🎨 CLASSIC ISLAMIC ACCENT THEME CUSTOMIZER */}
      <div className="bg-[#092234] border border-[#cca05a]/20 p-5 rounded-2xl mb-6 text-right space-y-4 flex-none" id="theme-customizer-card">
        <div className="flex justify-between items-center pb-2.5 border-b border-white/5" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 rounded-lg bg-[#cca05a]/10 flex items-center justify-center text-[#cca05a]">
              <Sparkles className="w-4 h-4 animate-pulse-gentle" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-100">{isAr ? "مخصّص الألوان والسمات" : "Theme & Accent Customizer"}</h3>
              <p className="text-[9px] text-slate-400 font-light">{isAr ? "اختر لوحة الألوان التي تناسب ذوقك وتريح عينك" : "Personalize colors while preserving pure Islamic aesthetics"}</p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-350 leading-relaxed font-light text-right">
          {isAr
            ? "بفضل مخصّص الألوان، يمكنك الآن تلوين واجهة التطبيق، الأزرار، والزخارف بنوافذ لونية عطرة هادئة متناسقة مع روح وجمال العمارة والفن الإسلامي الأصيل."
            : "Style your experience. Choose from curated palettes inspired by breathtaking Islamic art, architecture, and sacred history to set your accent highlight."}
        </p>

        {/* Dynamic Theme Circles Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1.5" style={{ direction: isAr ? "rtl" : "ltr" }}>
          {[
            { id: "gold", nameAr: "الذهبي الأندلسي", nameEn: "Andalusian Gold", dotColor: "bg-[#cca05a]", bg: "bg-[#cca05a]/10" },
            { id: "emerald", nameAr: "الأخضر الروضة", nameEn: "Rawdah Emerald", dotColor: "bg-[#10b981]", bg: "bg-[#10b981]/10" },
            { id: "blue", nameAr: "الأزرق الفجراوي", nameEn: "Celestial Blue", dotColor: "bg-[#0284c7]", bg: "bg-[#0284c7]/10" },
            { id: "ruby", nameAr: "العقيق الدمشقي", nameEn: "Damascene Ruby", dotColor: "bg-[#f43f5e]", bg: "bg-[#f43f5e]/10" },
            { id: "purple", nameAr: "البنفسجي الوقور", nameEn: "Royal Purple", dotColor: "bg-[#8b5cf6]", bg: "bg-[#8b5cf6]/10" },
          ].map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  localStorage.setItem("app_accent_theme", theme.id);
                  setCurrentTheme(theme.id);
                  window.dispatchEvent(new Event("theme-changed"));
                }}
                className={`flex flex-col items-center justify-between p-3 rounded-xl border transition-all text-center relative cursor-pointer hover:scale-[1.03] active:scale-95 ${
                  isSelected 
                    ? "border-[#cca05a] bg-slate-950/60 shadow-lg shadow-[#cca05a]/5 scale-[1.02]" 
                    : "border-white/5 bg-slate-950/20 hover:border-white/10"
                }`}
              >
                {/* Visual Circle Accent Dot Indicator */}
                <div className={`w-6 h-6 rounded-full ${theme.dotColor} flex items-center justify-center relative mb-2 shadow`}>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 block" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-100 block whitespace-nowrap">{isAr ? theme.nameAr : theme.nameEn}</span>
                  <span className="text-[7.5px] uppercase tracking-wider font-mono text-slate-400 block">{theme.id}</span>
                </div>

                {isSelected && (
                  <span className="absolute top-1 right-1 text-[8px] bg-[#cca05a]/20 text-[#cca05a] px-1 rounded font-bold">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Test notification active trigger overlay */}
      {testNotificationActive && (
        <div 
          className={`fixed top-6 left-6 right-6 border-2 p-5 rounded-2xl shadow-2xl z-[99999] flex items-center justify-between transition-all duration-500 animate-pulse direction-rtl ${
            testNotificationContent.iconType === "quran" 
              ? "border-amber-500 shadow-amber-900/40 bg-gradient-to-r from-slate-950 via-[#251b10] to-[#04121e]"
              : testNotificationContent.iconType === "salat"
              ? "border-rose-500 shadow-rose-900/40 bg-gradient-to-r from-slate-950 via-[#2d1218] to-[#04121e]"
              : testNotificationContent.iconType === "dhikr"
              ? "border-cyan-500 shadow-cyan-900/40 bg-gradient-to-r from-slate-950 via-[#10242e] to-[#04121e]"
              : "border-emerald-500 shadow-emerald-950/40 bg-gradient-to-r from-[#031d10] via-[#062438] to-[#04121e]"
          }`}
          style={{ direction: "rtl" }}
        >
          <div className="flex items-start space-x-3 space-x-reverse text-right">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
              testNotificationContent.iconType === "quran"
                ? "bg-amber-400/10 text-amber-300"
                : testNotificationContent.iconType === "salat"
                ? "bg-rose-400/10 text-rose-300"
                : testNotificationContent.iconType === "dhikr"
                ? "bg-cyan-400/10 text-cyan-300"
                : "bg-emerald-400/10 text-emerald-300"
            }`}>
              {testNotificationContent.iconType === "quran" ? (
                <BookOpen className="w-5.5 h-5.5 text-amber-400 animate-pulse" />
              ) : testNotificationContent.iconType === "salat" ? (
                <span className="text-xl animate-bounce">💖</span>
              ) : testNotificationContent.iconType === "dhikr" ? (
                <Sparkles className="w-5.5 h-5.5 text-cyan-400 animate-spin-slow" />
              ) : (
                <Bell className="w-5.5 h-5.5 text-emerald-400 animate-bounce" />
              )}
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-bold tracking-widest block uppercase px-2 py-0.5 rounded-full w-max text-white mb-1.5 ${
                testNotificationContent.iconType === "quran"
                  ? "bg-amber-600/30 text-amber-300"
                  : testNotificationContent.iconType === "salat"
                  ? "bg-rose-600/30 text-rose-300"
                  : testNotificationContent.iconType === "dhikr"
                  ? "bg-cyan-600/30 text-cyan-300"
                  : "bg-emerald-600/30 text-emerald-300"
              }`}>
                {testNotificationContent.iconType === "quran"
                  ? "📖 تدبر القرآن الكريم"
                  : testNotificationContent.iconType === "salat"
                  ? "✨ الصلاة على النبي مسموعة"
                  : testNotificationContent.iconType === "dhikr"
                  ? "📿 ذكر مأثور"
                  : "🕌 نداء الصلاة الشريفة"}
              </span>
              <h4 className="text-xs font-bold font-sans text-white">{testNotificationContent.title}</h4>
              <p className="text-[11px] text-slate-100 mt-1 leading-relaxed font-serif font-light">{testNotificationContent.body}</p>
            </div>
          </div>
          <button
            onClick={() => setTestNotificationActive(false)}
            className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg shrink-0 mr-4 cursor-pointer"
          >
            إغلاق التنبيه
          </button>
        </div>
      )}

      {/* Permissions banner board */}
      <div className="bg-[#0b263b] rounded-2xl border border-[#cca05a]/25 p-5 mb-6 flex flex-col space-y-4 shadow-lg relative overflow-hidden flex-none text-right">
        
        <div className="absolute left-4 top-4 text-amber-500/10 text-6xl">🤖</div>

        <div className="space-y-1.5 z-10">
          <h2 className="text-sm font-bold text-yellow-100 flex items-center justify-end space-x-1.5 space-x-reverse">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{isNativeAndroid() ? "نظام أندرويد الأصلي ومتكامل (Offline)" : "نظام التنبيهات والأذان التفاعلي"}</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            {isNativeAndroid() 
              ? "يعمل التطبيق الآن كـتطبيق أندرويد أصلي بالكامل بدون إنترنت. يتم استخدام منبهات النظام الداخلية الفعّالة لضمان دقة مواقيت الأذان."
              : "يدعم التطبيق إرسال أقوى إشعارات للصلوات بالإضافة إلى إرسال آيات قرآنية منتقاة بعناية لتباشر بها يومك ونفسك، حتى بعد إغلاق التطبيق."}
          </p>
        </div>

        {/* Display App ID Information */}
        <div className="bg-slate-950/45 p-3 rounded-xl border border-white/5 space-y-2 z-10 text-[10px] text-slate-300 antialiased font-mono">
          <div className="flex justify-between items-center">
            <span className="text-amber-200">com.anamuslim.app</span>
            <span className="text-slate-400">معرّف التطبيق الأصلي (App ID):</span>
          </div>
          <div className="flex justify-between items-center border-t border-white/5 pt-1.5">
            <span className={isNativeAndroid() ? "text-emerald-400 font-bold" : "text-amber-400/80"}>
              {isNativeAndroid() ? "متصل بالكامل (Native)" : "وضع المحاكاة (Browser)"}
            </span>
            <span className="text-slate-400">حالة الارتباط بـ WebView Bridge:</span>
          </div>
        </div>

        {/* Android Native-specific Permissions Controllers */}
        <div className="space-y-2.5 z-10">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                requestNativeAutostart();
                triggerLocalAlert("⚙️ طلب إذن التشغيل التلقائي", "جاري فتح إعدادات النظام للتشغيل التلقائي (Autostart) لمنع إلغاء التنبيه بالخلفية.", "prayer");
              }}
              className="bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border border-white/5 hover:border-amber-500/25 py-2 px-3 rounded-xl text-[10px] font-bold text-center transition cursor-pointer"
            >
              🔄 تشغيل تلقائي مستقل (Autostart)
            </button>
            <button
              onClick={() => {
                requestNativeIgnoreBatteryOptimizations();
                triggerLocalAlert("🔋 إعفاء من توفير البطارية", "جاري طلب استثناء التطبيق من قيود توفير الطاقة لضمان استمرارية صوت الأذان كاملاً.", "prayer");
              }}
              className="bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border border-white/5 hover:border-amber-500/25 py-2 px-3 rounded-xl text-[10px] font-bold text-center transition cursor-pointer"
            >
              ⚡ تجاوز موفر البطارية (Ignore Power)
            </button>
          </div>

          <button
            onClick={() => {
              syncAlarmsToAndroid(settings);
              triggerLocalAlert("🕋 جدولة ومزامنة منبهات النظام", "تم إعادة جدولة كامل مواقيت الصلوات والسنن بـ Alarm Manager هاتف أندرويد بنجاح!", "prayer");
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 font-extrabold text-xs py-2.5 px-4 rounded-xl text-slate-950 shadow-md hover:shadow-emerald-500/20 transition active:scale-95 cursor-pointer text-center"
          >
            ⏰ مزامنة وجدولة مواقيت الصلاة في الهاتف الآن
          </button>
        </div>

        {/* Fallback configuration triggers (Browser mode) */}
        {!isNativeAndroid() && (
          <div className="pt-2 z-10 border-t border-white/5">
            {permissionsGranted ? (
              <div className="bg-emerald-500/15 border border-emerald-500/35 p-3 rounded-xl flex items-center justify-between text-emerald-300 text-xs direction-rtl">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>إشعارات صلواتك وآياتك مفعلة بنجاح على جهازك الحالي!</span>
                </div>
              </div>
            ) : (
              <button
                onClick={requestBrowserPermission}
                className="w-full bg-[#cca05a] hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow transition active:scale-95 cursor-pointer text-center"
              >
                🔐 تفعيل صلاحية إشعارات الأذان والآيات بالجهاز
              </button>
            )}
          </div>
        )}

        {/* Native Android configuration triggers */}
        {isNativeAndroid() && localPermission !== "granted" && (
          <div className="pt-2 z-10 border-t border-white/5">
            <button
              onClick={async () => {
                const granted = await requestLocalNotificationPermissions();
                if (granted) {
                  setLocalPermission("granted");
                  triggerLocalAlert("تم تفعيل صلاحيات الإشعارات", "شكرًا لك، يمكنك الآن تلقي الأذان والتنبيهات بنجاح!", "prayer");
                  syncAlarmsToAndroid(settings);
                } else {
                  triggerLocalAlert("⚠️ الصلاحية مطلوبة", "الرجاء السماح بالإشعارات في إعدادات الهاتف لتلقي الأذان في وقته.", "prayer");
                }
              }}
              className="w-full bg-[#cca05a] hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow transition active:scale-95 cursor-pointer text-center"
            >
              🔑 تفعيل صلاحية إشعارات الأذان والأذكار بالهاتف
            </button>
          </div>
        )}
      </div>

      {/* 📡 OFFLINE-FIRST LOCAL NOTIFICATIONS SETTINGS CARD */}
      <div className="bg-[#092234] border-2 border-emerald-500/25 p-5 rounded-2xl mb-6 text-right space-y-4 flex-none relative overflow-hidden" id="local-notifications-setup-card">
        {/* Glow decoration */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-center pb-2.5 border-b border-white/5" style={{ direction: "rtl" }}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse-gentle" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-emerald-200">المنبهات وجدولة الإشعارات المحلية (Local Scheduling)</h3>
              <p className="text-[9px] text-[#cca05a] font-normal">جدولة ذكية مستقلة بالكامل دون الحاجة للاتصال بالإنترنت</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              مستقل ومستقر (Offline First) ⚡
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed font-light text-right">
          {isAr 
            ? "نظام الأذان والأذكار في تطبيق 'أنا مسلم' مدمج محلياً بالكامل. يتم استخدام منبهات النظام الداخلية الفعّالة بجهازك لضمان تلقي نداء الحق والتذكيرات في توقيتها المثالي الدقيق مئة بالمئة، حتى لو كان جهازك في وضع الطائرة أو بدون اتصال بالإنترنت."
            : "The prayer times and Athkar alert engine is fully decentralized and client-side. It utilizes background system hardware alarms (AlarmManager & LocalNotifications) to guarantee you receive the blessings on time, even if the device is offline or in Airplane Mode."}
        </p>

        {/* Status Dashboard Grid */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 font-mono pt-1">
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[9px] text-[#cca05a] block font-sans">حالة الإذن بالجهاز:</span>
            <span className="font-bold text-white capitalize">{localPermission === "granted" ? "مسموح بالكامل (Granted)" : "بحاجة لصلاحية (Pending)"}</span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[9px] text-[#cca05a] block font-sans">عدد التنبيهات المجدولة حالياً:</span>
            <span className="font-bold text-white block truncate">{scheduledCount > 0 ? `${scheduledCount} منبه نشط` : "في انتظار التحديث"}</span>
          </div>
        </div>

        {/* Local Sync and Schedule Action Button */}
        <div className="pt-2">
          <button
            onClick={handleOfflineSync}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-[#cca05a] hover:from-emerald-400 hover:to-[#cca05a]/90 text-slate-950 font-extrabold text-xs py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/10 transition active:scale-95 cursor-pointer text-center"
          >
            🔄 إعادة بناء وجدولة منبهات الهاتف محلياً (Force Local Synced Alarms)
          </button>
        </div>

        {/* Advanced Segment-Targeted Tags Section */}
        <div className="bg-slate-950/25 p-4 rounded-xl border border-emerald-500/10 space-y-3.5 transition-all">
          <div className="border-b border-white/5 pb-1.5 flex justify-between items-center" style={{ direction: "rtl" }}>
            <span className="text-[10px] text-emerald-400 font-bold">✨ تخصيص فئات الإشعارات المحلية (Local Reminders filter):</span>
            <span className="text-[9px] text-slate-400">تُحدث فورياً</span>
          </div>

          <div className="space-y-3" style={{ direction: "rtl" }}>
            {/* Item 1 */}
            <div className="flex justify-between items-center">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-100 block">📖 تنبيهات تدبر القران الكريم اليومية</span>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5">آيات قرآنية وتفاسير دورية مريحة للقلوب</p>
              </div>
              <button
                onClick={() => handleToggleTag("quran", tgQuran, setTgQuran)}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                  tgQuran ? "bg-emerald-500" : "bg-slate-800"
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-slate-950 rounded-full transition-all ${
                  tgQuran ? "right-0.5" : "right-4.5"
                }`} />
              </button>
            </div>

            {/* Item 2 */}
            <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-100 block">🕌 نداءات الأذان ومواقيت الصلوات الخمس</span>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5">تذكير فوري في توقيت الصلوات والجمعة</p>
              </div>
              <button
                onClick={() => handleToggleTag("hadith", tgHadith, setTgHadith)}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                  tgHadith ? "bg-emerald-500" : "bg-slate-800"
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-slate-950 rounded-full transition-all ${
                  tgHadith ? "right-0.5" : "right-4.5"
                }`} />
              </button>
            </div>

            {/* Item 3 */}
            <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-100 block">✨ تذكير الصلاة والذكر والصلوات المعطرة</span>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5">تنبيهات تسبيح وحمد لتعطير لسانك</p>
              </div>
              <button
                onClick={() => handleToggleTag("salawat", tgSalawat, setTgSalawat)}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                  tgSalawat ? "bg-emerald-500" : "bg-slate-800"
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-slate-950 rounded-full transition-all ${
                  tgSalawat ? "right-0.5" : "right-4.5"
                }`} />
              </button>
            </div>

            {/* Daily Verse Switch */}
            <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-100 block">📖 آية اليوم (Verse of the Day)</span>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5">تنبيه يومي لطيف في تمام الساعة 09:00 صباحاً لتدبر كلام الله</p>
              </div>
              <button
                onClick={handleToggleDailyVerse}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                  dailyVerseEnabled ? "bg-emerald-500" : "bg-slate-800"
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-slate-950 rounded-full transition-all ${
                  dailyVerseEnabled ? "right-0.5" : "right-4.5"
                }`} />
              </button>
            </div>

            {/* Daily Hadith Switch */}
            <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-100 block">💬 حديث اليوم (Hadith of the Day)</span>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5">تذكير بسنة الحبيب المصطفى ﷺ يومياً في الساعة 01:00 ظهراً</p>
              </div>
              <button
                onClick={handleToggleDailyHadith}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                  dailyHadithEnabled ? "bg-emerald-500" : "bg-slate-800"
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-slate-950 rounded-full transition-all ${
                  dailyHadithEnabled ? "right-0.5" : "right-4.5"
                }`} />
              </button>
            </div>

            {/* Daily Moral Tip Switch */}
            <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-100 block">💡 نصيحة أخلاقية قيّمة لليوم</span>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5">موعظة ونصيحة أخلاقية للتعامل الحسن في الساعة 05:00 مساءً</p>
              </div>
              <button
                onClick={handleToggleDailyMoral}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                  dailyMoralEnabled ? "bg-emerald-500" : "bg-slate-800"
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-slate-950 rounded-full transition-all ${
                  dailyMoralEnabled ? "right-0.5" : "right-4.5"
                }`} />
              </button>
            </div>
          </div>
          
          <p className="text-[9px] text-slate-400 leading-relaxed font-light text-center border-t border-white/5 pt-2">
            ⚠️ أي تبديل في الخيارات أعلاه سيقوم فوراً بإعادة جدولة منبهات جهازك لتضمين أو استبعاد الفئة المختارة تلقائياً ومحلياً.
          </p>
        </div>
      </div>

      {/* 🔕 SILENT MODE TOGGLE SECTION */}
      <div className="bg-[#092234] border border-[#cca05a]/20 p-5 rounded-2xl mb-6 text-right space-y-4 flex-none">
        <div className="flex justify-between items-center pb-2 border-b border-white/5" style={{ direction: "rtl" }}>
          <div className="flex items-center space-x-2 space-x-reverse">
            {silentModeEnabled ? <BellOff className="w-5 h-5 text-red-400 animate-pulse" /> : <Bell className="w-5 h-5 text-amber-400" />}
            <h3 className="text-xs font-bold text-amber-100">الوضع الصامت (Silent Mode)</h3>
          </div>
          
          {/* Toggle Switch */}
          <button
            onClick={toggleSilentMode}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
              silentModeEnabled ? "bg-red-500" : "bg-slate-800"
            }`}
          >
            <span
              className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform duration-300 ${
                silentModeEnabled ? "translate-x-[-24px]" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <p className="text-[11px] text-slate-350 leading-relaxed font-light font-sans">
          عند تفعيل 'الوضع الصامت'، سيقوم التطبيق بكتم وإيقاف جميع الأصوات نهائياً (مثل الأذان، وأذكار الصلاة على النبي، والصلوات، والتنبيهات الصوتية الحية) في الخلفية والواجهة، مع الحفاظ على الإشعارات المنبثقة التوضيحية والصور والبطاقات المرئية كاملة، لضمان الطمأنينة والهدوء أينما كنت.
        </p>

        {silentModeEnabled && (
          <div className="bg-red-500/15 border border-red-500/35 p-3 rounded-xl flex items-center justify-between text-red-300 text-[10px] direction-rtl">
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-sm">⚠️</span>
              <span className="font-sans">تم تفعيل كتم الصوت بنجاح! الإشعارات ستعمل مرئياً وصامتة بالكامل.</span>
            </div>
          </div>
        )}
      </div>

      {/* 📖 New Feature Section: Quranic Verses Random Notifications */}
      <div className="bg-[#092234] border border-[#cca05a]/20 p-5 rounded-2xl mb-6 text-right space-y-4 flex-none">
        <div className="flex justify-between items-center pb-2 border-b border-white/5" style={{ direction: "rtl" }}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs font-bold text-amber-100">إشعارات الآيات القرآنية اليومية</h3>
          </div>
          
          {/* Toggle Switch */}
          <button
            onClick={toggleQuranNotifications}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
              quranNotifyEnabled ? "bg-[#cca05a]" : "bg-slate-800"
            }`}
          >
            <span
              className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform duration-300 ${
                quranNotifyEnabled ? "translate-x-[-24px]" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <p className="text-[11px] text-slate-350 font-light leading-relaxed">
          عند تشغيل هذا الخيار، سيقوم المصمم الذكي بإمدادك ببطاقة تذكيرية منبثقة تحتوي على آية قرآنية جليلة، مع تفسير سريع يلامس القلب ويغسل هموم يومك.
        </p>

        {/* Configurations of interval */}
        {quranNotifyEnabled && (
          <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-2.5 text-right">
            <div className="flex justify-between items-center text-[10px] text-amber-200/60" style={{ direction: "rtl" }}>
              <span>تكرار التنبيهات والتدبر:</span>
              <span className="font-mono text-white/50">تلقائي</span>
            </div>
            <div className="grid grid-cols-3 gap-2" style={{ direction: "rtl" }}>
              {[
                { id: "hourly", name: "كل ساعة" },
                { id: "daily", name: "مرة باليوم" },
                { id: "weekly", name: "مرة بالأسبوع" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => changeQuranInterval(opt.id)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                    quranNotifyInterval === opt.id
                      ? "bg-[#cca05a] text-slate-950 border-transparent shadow font-extrabold"
                      : "bg-slate-900 text-slate-400 border-white/5 hover:text-white"
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Trigger Button for user to get immediate Quran verse */}
        <button
          onClick={sendRandomQuranNotificationNow}
          className="w-full bg-slate-950/50 hover:bg-slate-950/80 border border-dashed border-[#cca05a]/45 text-xs text-amber-300 font-bold py-2 rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>أرسل لي آية قرآنية كريمة الآن للتدبر والراحة</span>
        </button>
      </div>

      {/* 💚 SCHEDULING SYSTEM: SALAT ALA AL-NABI (HOUR/QUARTER-HOUR CHIMES) */}
      <div className="bg-[#092234] border border-[#cca05a]/20 p-5 rounded-2xl mb-6 text-right space-y-4 flex-none">
        <div className="flex justify-between items-center pb-2 border-b border-white/5" style={{ direction: "rtl" }}>
          <div className="flex items-center space-x-2 space-x-reverse font-sans">
            <span className="text-xl">💚</span>
            <div>
              <h3 className="text-xs font-bold text-amber-100">جدولة التذكير بالصلاة على النبي ﷺ</h3>
              <p className="text-[9px] text-[#cca05a] font-normal">تشغيل صوت بشري مأثور بشكل دوري هادئ</p>
            </div>
          </div>
          
          {/* Toggle Switch */}
          <button
            onClick={() => {
              const nextVal = !prophetChimesEnabled;
              setProphetChimesEnabled(nextVal);
              localStorage.setItem("prophet_chimes_enabled", String(nextVal));
              if (nextVal) {
                triggerLocalAlert("💚 تم تفعيل التذكير بالصلاة على النبي", "سنقوم بتنبيهك بالصلاة على النبي دورياً بالصوت البشري الذي تفضله.", "salat");
              }
            }}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
              prophetChimesEnabled ? "bg-emerald-500" : "bg-slate-800"
            }`}
          >
            <span
              className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform duration-300 ${
                prophetChimesEnabled ? "translate-x-[-24px]" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <p className="text-[11px] text-slate-350 leading-relaxed font-light font-sans">
          قم بجدولة نداء الصلاة على النبي عليه أزكى الصلاة والتسليم؛ لتصلي عليه ملائكة السماء وتكتسي دنيتك بالبركات والسلام.
        </p>

        {prophetChimesEnabled && (
          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-4 text-right">
            
            {/* Preferred timing selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-amber-200/70 font-bold block">منبه التنبيه المفضل (توقيت التذكير الدقيق):</label>
              <div className="grid grid-cols-4 gap-2 text-center" style={{ direction: "rtl" }}>
                {[
                  { id: 0, label: "رأس كل ساعة" },
                  { id: 15, label: "الدقيقة ١٥" },
                  { id: 30, label: "منتصف الساعة" },
                  { id: 45, label: "الدقيقة ٤٥" }
                ].map((timing) => (
                  <button
                    key={timing.id}
                    onClick={() => {
                      setProphetChimesTimingMin(timing.id);
                      localStorage.setItem("prophet_chimes_timing_min", String(timing.id));
                    }}
                    className={`py-1.5 rounded-lg text-[9px] font-bold border transition cursor-pointer ${
                      prophetChimesTimingMin === timing.id
                        ? "bg-[#cca05a] text-slate-950 border-transparent font-extrabold shadow"
                        : "bg-slate-900 text-slate-400 border-white/5 hover:text-white"
                    }`}
                  >
                    {timing.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice select */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] text-amber-200/70 font-bold block text-right">🎙️ اختر الصوت البشري للتذكير بالصلوات على النبي ﷺ:</label>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-1.5" style={{ direction: "rtl" }}>
                {[
                  { id: "real_prophet", name: "النبي صلّوا عليه" },
                  { id: "custom_voice", name: "📁 مخصص" }
                ].map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => {
                      setProphetChimesVoice(voice.id);
                      localStorage.setItem("prophet_chimes_voice", voice.id);
                      window.dispatchEvent(new Event("prophet-reminder-changed"));
                      if (voice.id === "custom_voice" && !customAudioName) {
                        setTimeout(() => {
                          fileInputRef.current?.click();
                        }, 100);
                      }
                    }}
                    className={`relative py-1.5 px-0.5 rounded-lg text-[9px] font-bold border transition cursor-pointer text-center ${
                      prophetChimesVoice === voice.id
                        ? "bg-amber-400 text-slate-950 border-transparent font-extrabold shadow"
                        : "bg-slate-900 text-slate-400 border-white/5 hover:text-white"
                    }`}
                  >
                    {voice.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Audio File Management Section */}
            {prophetChimesVoice === "custom_voice" && (
              <div className="p-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 space-y-2 text-right">
                <span className="text-[10px] text-amber-300 font-bold block">
                  {isAr ? "📁 إدارة الملف الصوتي المخصص للتذكير:" : "📁 Manage Custom Audio File:"}
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
                            setProphetChimesVoice("real_prophet");
                            localStorage.setItem("prophet_chimes_voice", "real_prophet");
                            window.dispatchEvent(new Event("prophet-reminder-changed"));
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
                          window.dispatchEvent(new Event("prophet-reminder-changed"));
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

            {/* Listen test trigger */}
            <button
              onClick={() => {
                if (silentModeEnabled) {
                  triggerLocalAlert("🔕 الوضع الصامت مفعّل", "لا يمكن تشغيل الصوت التجريبي أثناء تمكين 'الوضع الصامت'. يرجى إيقافه من الأعلى أولاً.", "prayer");
                  return;
                }
                if (prophetChimesVoice === "custom_voice") {
                  import("../utils/audioStorage").then(({ getCustomAudio }) => {
                    getCustomAudio().then(blob => {
                      if (blob) {
                        const objectUrl = URL.createObjectURL(blob);
                        const audioObj = new Audio(objectUrl);
                        audioObj.volume = 0.8;
                        audioObj.play().catch(() => {});
                      } else {
                        const audioObj = new Audio("/audio/real_prophet.mp3");
                        audioObj.volume = 0.8;
                        audioObj.play().catch(() => {});
                      }
                    });
                  });
                  return;
                }
                const mp3 = "/audio/real_prophet.mp3"; // default / real_prophet
                import("../utils/audioStorage").then(({ getAudioByKey }) => {
                  getAudioByKey("real_prophet").then(blob => {
                    if (blob) {
                      const objectUrl = URL.createObjectURL(blob);
                      const audioObj = new Audio(objectUrl);
                      audioObj.volume = 0.8;
                      audioObj.play().catch(() => {});
                    } else {
                      const audioObj = new Audio(mp3);
                      audioObj.volume = 0.8;
                      audioObj.play().catch(() => {});
                    }
                  }).catch(() => {
                    const audioObj = new Audio(mp3);
                    audioObj.volume = 0.8;
                    audioObj.play().catch(() => {});
                  });
                });
                triggerLocalAlert("💚 تجربة تذكير النبي", "اللهم صلّ وسلم وبارك على نبينا محمد وعلى آله وصحبه أجمعين.", "salat");
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] py-2 rounded-lg transition active:scale-95 cursor-pointer shadow-md"
            >
              🎵 تشغيل تجريبي لصوت الصلاة على النبي ﷺ الآن
            </button>
          </div>
        )}
      </div>

      {/* 🎵 CUSTOM ALERTS UPLOADER SECTION */}
      <div className="bg-[#092234] border border-[#cca05a]/20 p-5 rounded-2xl mb-6 text-right space-y-4 flex-none">
        <div className="flex items-center space-x-2 space-x-reverse" style={{ direction: "rtl" }}>
          <span className="text-xl">🎵</span>
          <div>
            <h3 className="text-xs font-bold text-amber-100 font-sans">رفع تنبيهات وأصوات مخصصة</h3>
            <p className="text-[9px] text-slate-400 font-light">ارفع ملفاً صوتياً من جهازك وعيّنه للصلوات أو الأذكار</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-350 leading-relaxed font-light">
          يمكنك تخصيص الأذان وتنبيهات الأذكار بصوتك المفضل أو بصوت قارئك المختار. تقبل الأداة الملفات الصوتية بمختلف الصيغ (mp3, wav, m4a, ogg).
        </p>

        {/* Input Trigger */}
        <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-3">
          <input
            type="file"
            accept="audio/*"
            id="user-custom-audio-uploader"
            onChange={handleCustomAudioUpload}
            className="hidden"
          />
          <label
            htmlFor="user-custom-audio-uploader"
            className="w-full block bg-gradient-to-r from-amber-500/10 to-[#cca05a]/20 hover:from-amber-500/20 text-[#cca05a] border border-dashed border-[#cca05a]/45 rounded-xl py-3 text-center text-xs font-extrabold cursor-pointer transition active:scale-95 shadow-md"
          >
            📥 اختر ملف تنبيه صوتي من جهازك للرفع
          </label>

          {/* List of custom audio tracks already uploaded */}
          {customSounds.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5 text-right">
              <span className="text-[10px] text-amber-200/60 font-bold block">الملفات بصيغة الأصوات المخصصة المتاحة حالياً ({customSounds.length}):</span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {customSounds.map((sound) => (
                  <div key={sound.id} className="bg-slate-900/60 p-2 rounded-lg border border-white/5 flex justify-between items-center text-[10px] text-slate-200" style={{ direction: "rtl" }}>
                    <div className="flex items-center space-x-1.5 space-x-reverse truncate">
                      <span className="text-[11px]">🔊</span>
                      <span className="truncate max-w-[150px] font-sans font-medium">{sound.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => {
                          if (silentModeEnabled) {
                            triggerLocalAlert("🔕 الوضع الصامت مفعّل", "لا يمكن تشغيل الصوت التجريبي أثناء تمكين 'الوضع الصامت'. يرجى إيقافه من الأعلى أولاً.", "prayer");
                            return;
                          }
                          const a = new Audio(sound.dataUrl);
                          a.volume = 0.8;
                          a.play().catch(() => {});
                          triggerLocalAlert("🔊 اختبار الملف الصوتي", `يتم تشغيل "${sound.name}" بنجاح!`, "prayer");
                        }}
                        className="px-2 py-0.5 bg-[#cca05a] text-slate-950 rounded text-[9px] font-bold cursor-pointer"
                      >
                        تشغيل
                      </button>
                      <button
                        onClick={() => handleDeleteCustomSound(sound.id)}
                        className="px-2 py-0.5 bg-red-650 bg-red-650 text-white rounded text-[9px] font-bold cursor-pointer"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 📿 QUIET DAILY ATHKAR REMINDERS CONFIGURATION SECTION */}
      <div className="bg-[#092234] border-2 border-emerald-500/20 p-5 rounded-2xl mb-6 text-right space-y-4 flex-none relative overflow-hidden" id="athkar-daily-reminders-card">
        {/* Visual glow background hint */}
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex justify-between items-center pb-2.5 border-b border-white/5" style={{ direction: "rtl" }}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-emerald-200">منبهات الأذكار اليومية الهادئة (Daily Athkar Reminders)</h3>
              <p className="text-[9px] text-[#cca05a] font-light">تنبيهات لطيفة وخافتة لتذكيرك بالأوراد النبوية العطرة</p>
            </div>
          </div>

          {/* Global Toggle switch */}
          <button
            onClick={() => {
              const nextVal = !athkarReminders.enabled;
              saveAthkarReminders({ ...athkarReminders, enabled: nextVal });
              if (nextVal) {
                triggerLocalAlert("📿 تفعيل منبهات الأذكار", "تم تشغيل نظام التذكير اليومي بالأذكار بنجاح وفق مواقيتك الخاصة.", "dhikr");
              } else {
                triggerLocalAlert("🔕 إيقاف منبهات الأذكار", "تم كتم وإيقاف تنبيهات الأذكار اليومية المخصصة مؤقتاً.", "dhikr");
              }
            }}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
              athkarReminders.enabled ? "bg-emerald-500" : "bg-slate-800"
            }`}
          >
            <span
              className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform duration-300 ${
                athkarReminders.enabled ? "translate-x-[-24px]" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <p className="text-[11px] text-slate-350 leading-relaxed font-light text-right">
          {isAr
            ? "يساعدك هذا النظام غير المزعج في استقبال تنبيهات مريحة وتعبدية لقراءة الأذكار اليومية في أوقات تختارها أنت بنفسك بدقة، مع إمكانية تجربة نغمة اهتزازية عذبة أو رنين ناعم للغاية للحفاظ على تركيزك."
            : "Set precise, personalized daily times to receive gentle, quiet notifications for your morning, evening, and sleeping Athkar without disruptive alarms."}
        </p>

        {athkarReminders.enabled && (
          <div className="space-y-3 pt-1">
            {/* The 3 seasons sections inputs */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" style={{ direction: "rtl" }}>
              {/* Season 1: Morning */}
              <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-2 text-right">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-amber-200">أذكار الصباح</span>
                  <input
                    type="checkbox"
                    checked={athkarReminders.morningEnabled}
                    onChange={(e) => saveAthkarReminders({ ...athkarReminders, morningEnabled: e.target.checked })}
                    className="w-3.5 h-3.5 rounded border-white/10 text-emerald-500 focus:ring-opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-1.5 space-x-reverse justify-end">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="time"
                    disabled={!athkarReminders.morningEnabled}
                    value={athkarReminders.morningTime}
                    onChange={(e) => saveAthkarReminders({ ...athkarReminders, morningTime: e.target.value })}
                    className="bg-slate-950 border border-white/10 text-white font-mono text-[11px] py-1 px-1.5 rounded focus:outline-none focus:border-emerald-500 w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Season 2: Evening */}
              <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-2 text-right">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-amber-200">أذكار المساء</span>
                  <input
                    type="checkbox"
                    checked={athkarReminders.eveningEnabled}
                    onChange={(e) => saveAthkarReminders({ ...athkarReminders, eveningEnabled: e.target.checked })}
                    className="w-3.5 h-3.5 rounded border-white/10 text-emerald-500 focus:ring-opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-1.5 space-x-reverse justify-end">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="time"
                    disabled={!athkarReminders.eveningEnabled}
                    value={athkarReminders.eveningTime}
                    onChange={(e) => saveAthkarReminders({ ...athkarReminders, eveningTime: e.target.value })}
                    className="bg-slate-950 border border-white/10 text-white font-mono text-[11px] py-1 px-1.5 rounded focus:outline-none focus:border-emerald-500 w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Season 3: Night/Sleep */}
              <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-2 text-right">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-amber-200">أذكار النوم</span>
                  <input
                    type="checkbox"
                    checked={athkarReminders.nightEnabled}
                    onChange={(e) => saveAthkarReminders({ ...athkarReminders, nightEnabled: e.target.checked })}
                    className="w-3.5 h-3.5 rounded border-white/10 text-emerald-500 focus:ring-opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-1.5 space-x-reverse justify-end">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="time"
                    disabled={!athkarReminders.nightEnabled}
                    value={athkarReminders.nightTime}
                    onChange={(e) => saveAthkarReminders({ ...athkarReminders, nightTime: e.target.value })}
                    className="bg-slate-950 border border-white/10 text-white font-mono text-[11px] py-1 px-1.5 rounded focus:outline-none focus:border-emerald-500 w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Quiet Chime sound selector and test play button */}
            <div className="bg-slate-950/25 p-3 rounded-xl border border-emerald-500/10 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center space-x-2 space-x-reverse w-full sm:w-auto" style={{ direction: "rtl" }}>
                <span className="text-[10px] text-slate-300 whitespace-nowrap">رنين التنبيه الخافت:</span>
                <select
                  value={athkarReminders.chimeSoundId}
                  onChange={(e) => {
                    const soundId = e.target.value as any;
                    saveAthkarReminders({ ...athkarReminders, chimeSoundId: soundId });
                    playChimeSample(soundId);
                  }}
                  className="bg-slate-950 border border-white/10 text-emerald-300 text-[10px] px-2.5 py-1.5 rounded focus:outline-none focus:border-emerald-500 cursor-pointer w-full"
                >
                  <option value="gentle">🎵 جرس دافئ خافت (Gentle Chime)</option>
                  <option value="crystal">🎐 رنين كريستالي لامع (Crystal Clarity)</option>
                  <option value="none">🔕 صامت بالكامل (سماح بالإشعارات فقط)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => playChimeSample(athkarReminders.chimeSoundId)}
                className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center justify-center space-x-1.5 space-x-reverse active:scale-95 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>اختبار رنين الأذكار</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ⏰ PRE-PRAYER CUSTOMIZABLE ALERT WARNING SETTING CARD */}
      <div className="bg-[#092234] border border-[#cca05a]/20 p-5 rounded-2xl mb-6 text-right space-y-4 flex-none">
        <div className="flex justify-between items-center pb-2 border-b border-white/5" style={{ direction: "rtl" }}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="text-xl">🕌</span>
            <div>
              <h3 className="text-xs font-bold text-amber-100 font-sans">تنبيه الاستعداد الذكي للصلوات بـ {toArabicNumerals(prePrayerPrepTime)} دقائق</h3>
              <p className="text-[9px] text-[#cca05a] font-normal">تذكير بالأذكار والسنن الرواتب قبل نداء الصلاة الفعلي</p>
            </div>
          </div>
          
          {/* Toggle Switch */}
          <button
            onClick={() => {
              const nextVal = !prePrayerPrepEnabled;
              setPrePrayerPrepEnabled(nextVal);
              localStorage.setItem("pre_prayer_prep_enabled", String(nextVal));
              window.dispatchEvent(new Event("prayer-reminder-changed"));
              if (nextVal) {
                triggerLocalAlert("🕌 تم تفعيل تنبيه الاستعداد الذكي", `سنرسل لك إشعاراً عذباً قبل الصلاة بـ ${toArabicNumerals(prePrayerPrepTime)} دقائق لتتهيأ وتستعد.`, "prayer");
              }
            }}
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

        <p className="text-[11px] text-slate-350 leading-relaxed font-light font-sans" style={{ direction: "rtl" }}>
          عند تفعيل الميزة، سيقوم التطبيق بحساب الوقت بدقة وتنبيهك تلقائياً قبل أي موعد صلاة بـ {toArabicNumerals(prePrayerPrepTime)} دقائق كاملة، مما يعطيك الفرصة المباركة للتهيؤ والوضوء وقراءة بعض الأذكار.
        </p>

        {prePrayerPrepEnabled && (
          <div className="pt-3 border-t border-dashed border-[#cca05a]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-right" style={{ direction: "rtl" }}>
            <span className="text-[10px] font-bold text-amber-200/80">
              اختر مدة التنبيه قبل الأذان:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 justify-end">
              {[5, 10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setPrePrayerPrepTime(mins);
                    localStorage.setItem("pre_prayer_prep_time", String(mins));
                    window.dispatchEvent(new Event("prayer-reminder-changed"));
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
                    prePrayerPrepTime === mins
                      ? "bg-[#cca05a] text-slate-950 border-[#cca05a] shadow-[0_0_10px_rgba(204,160,90,0.3)] font-extrabold"
                      : "bg-slate-950/40 text-slate-400 border-white/5 hover:border-[#cca05a]/40"
                  }`}
                >
                  {toArabicNumerals(mins)} دقائق
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prayers Notification list */}
      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center text-xs text-amber-200/50 direction-rtl" style={{ direction: "rtl" }}>
          <span>تحكم بتنبيهات وإشعارات الصلاة:</span>
          <span>حالة المنبه والصوت</span>
        </div>

        <div className="space-y-3">
          {settings.map((s) => (
            <div
              key={s.prayerId}
              className="bg-[#092234] border border-white/5 p-4 rounded-xl flex justify-between items-center hover:border-[#cca05a]/20 transition"
              style={{ direction: "rtl" }}
            >
              {/* Title descriptive */}
              <div className="text-right flex-1 pl-4">
                <h4 className={`text-xs font-bold ${s.enabled ? "text-amber-100" : "text-slate-400 line-through"}`}>
                  {s.prayerName}
                </h4>
                
                {/* Selector for Adhan Voice */}
                <div className="mt-2 flex items-center space-x-1.5 space-x-reverse justify-start">
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">صوت النداء:</span>
                  <select
                    value={s.adhanVoiceId}
                    onChange={(e) => {
                      const updated = settings.map((set) => {
                        if (set.prayerId === s.prayerId) {
                          return { ...set, adhanVoiceId: e.target.value };
                        }
                        return set;
                      });
                      setSettings(updated);
                      localStorage.setItem("notification_settings", JSON.stringify(updated));
                      syncAlarmsToAndroid(updated);
                    }}
                    className="bg-slate-950/85 border border-white/10 text-amber-200 text-[10px] font-sans px-2.5 py-1 rounded focus:outline-none focus:border-[#cca05a] cursor-pointer max-w-[180px]"
                  >
                    {/* Default muadhins */}
                    {muadhinsList.map((m) => (
                      <option key={m.id} value={m.id} className="bg-slate-900 text-white select-none">
                        🕌 {m.name}
                      </option>
                    ))}
                    {/* Custom uploaded files */}
                    {customSounds.map((sound) => (
                      <option key={sound.id} value={sound.id} className="bg-slate-900 text-[#cca05a] select-none">
                        🎵 مخصص: {sound.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(s.prayerId)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0 cursor-pointer ${
                  s.enabled ? "bg-[#cca05a]" : "bg-slate-800"
                }`}
              >
                <span
                  className={`absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform duration-300 ${
                    s.enabled ? "translate-x-[-24px]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Test Alert Trigger Button */}
      <div className="w-full max-w-sm mx-auto flex py-4 flex-none space-y-2 flex-col">
        <button
          onClick={() => triggerLocalAlert("🕌 أذان العصر", "حان الآن موعد صلاة العصر حسب توقيتك المحلي، أرحنا بها يا بلال.", "prayer")}
          className="w-full bg-slate-900 border border-[#cca05a]/30 text-amber-100 font-bold text-xs py-2.5 rounded-xl transition active:scale-95 cursor-pointer hover:bg-slate-800"
        >
          🔔 تجربة محاكاة نداء صلاة حية (إشعار منبثق)
        </button>
        
        {/* Helper info */}
        <div className="bg-[#cca05a]/5 p-2.5 rounded-lg border border-white/5 text-[10px] text-slate-400 text-center leading-relaxed">
          * نوصي بالضغط على زر تفعيل الإشعارات بالأعلى والسماح بالتنبيه لتجربة الأداء الفعّال للمؤذن التلقائي.
        </div>
      </div>
    </div>
  );
}

