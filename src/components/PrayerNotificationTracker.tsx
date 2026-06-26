import React, { useState, useEffect, useRef } from "react";
import { Bell, Volume2, X, Play, Pause, Square } from "lucide-react";
import { isNativeAndroid } from "../utils/androidBridge";
import { scheduleAllOfflineNotifications } from "../utils/localNotifications";

interface CustomSound {
  id: string;
  name: string;
  dataUrl: string;
}

interface PrayerSetting {
  prayerId: string;
  prayerName: string;
  enabled: boolean;
  adhanVoiceId: string;
}

function toArabicNumerals(num: number | string): string {
  const arabicMap: { [key: string]: string } = {
    "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
    "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩"
  };
  return String(num).replace(/[0-9]/g, (d) => arabicMap[d]);
}

export default function PrayerNotificationTracker() {
  const [activeAlert, setActiveAlert] = useState<{
    prayerId: string;
    prayerName: string;
    muadhinName: string;
    time: string;
  } | null>(null);

  const [isPlayingAdhan, setIsPlayingAdhan] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkIntervalRef = useRef<any>(null);

  // Constant list of prayer times matching the main application
  const prayerTimes = [
    { id: "fajr", name: "الفجر", time: "04:12" },
    { id: "dhuhr", name: "الظهر", time: "12:15" },
    { id: "asr", name: "العصر", time: "15:45" },
    { id: "maghrib", name: "المغرب", time: "18:49" },
    { id: "isha", name: "العشاء", time: "20:18" }
  ];

  // Helper to load Athkar reminder configuration
  const getAthkarConfig = () => {
    try {
      const saved = localStorage.getItem("athkar_reminder_config");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
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
  };

  const playQuietChime = (type: string) => {
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
      console.warn("Could not play quiet chime on tracker:", e);
    }
  };

  // Helper to load settings
  const getSettings = (): PrayerSetting[] => {
    try {
      const saved = localStorage.getItem("notification_settings");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { prayerId: "fajr", prayerName: "صلاة الفجر", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "dhuhr", prayerName: "صلاة الظهر", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "asr", prayerName: "صلاة العصر", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "maghrib", prayerName: "صلاة المغرب", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "isha", prayerName: "صلاة العشاء", enabled: true, adhanVoiceId: "makkah" },
    ];
  };

  // Helper to load custom sounds
  const getCustomSounds = (): CustomSound[] => {
    try {
      const saved = localStorage.getItem("user_custom_sounds");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {}
    return [];
  };

  // Helper to resolve muadhin details
  const getMuadhinName = (voiceId: string): string => {
    if (voiceId === "makkah") return "أذان الحرم المكي (1)";
    if (voiceId === "abdulbasit") return "أذان الشيخ عبد الباسط عبد الصمد";
    if (voiceId === "afasy") return "أذان الشيخ مشاري العفاسي";
    if (voiceId === "aqsa") return "أذان المسجد الأقصى المبارك";
    if (voiceId === "makkah_2") return "أذان الحرم المكي (2)";
    
    const custom = getCustomSounds().find(c => c.id === voiceId);
    if (custom) return `ملف مخصص: ${custom.name}`;
    
    return "مؤذن الحرم المكي";
  };

  const getAudioUrls = (voiceId: string): string[] => {
    const custom = getCustomSounds().find(c => c.id === voiceId);
    if (custom) {
      return [custom.dataUrl];
    }

    const MOHADIN_FALLBACKS: Record<string, string[]> = {
      makkah: [
        "https://dn710002.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan_662/019--1.mp3",
        "https://dn710603.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan/019--1.mp3"
      ],
      abdulbasit: [
        "https://ia600100.us.archive.org/34/items/90---azan---90---azan--many----sound----mp3---alazan_662/041--.mp3"
      ],
      afasy: [
        "https://dn710002.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan_662/038-1.mp3"
      ],
      aqsa: [
        "https://dn710002.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan_662/045--.mp3"
      ],
      makkah_2: [
        "https://dn710603.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan/019--1.mp3",
        "https://dn710002.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan_662/019--1.mp3"
      ]
    };

    const list = MOHADIN_FALLBACKS[voiceId] || [];
    const expanded: string[] = [];
    list.forEach(url => {
      if (url.startsWith("http")) {
        expanded.push(url);
        expanded.push(`/api/proxy-audio?url=${encodeURIComponent(url)}`);
      } else {
        expanded.push(url);
      }
    });

    if (expanded.length === 0) {
      // Default fallback url
      return ["https://www.islamcan.com/audio/adhan/azan3.mp3"];
    }
    return expanded;
  };

  const playAdhanAudio = (voiceId: string) => {
    // 1. Silent mode check
    if (localStorage.getItem("silent_mode") === "true") {
      console.log("[PrayerNotificationTracker] Silent mode active. Audio play skipped.");
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const urls = getAudioUrls(voiceId);
    let index = 0;

    const playWithFallback = () => {
      if (index >= urls.length) {
        console.error("[PrayerNotificationTracker] All fallback audio URLs failed.");
        setIsPlayingAdhan(false);
        return;
      }

      const activeUrl = urls[index];
      const audio = new Audio(activeUrl);
      audioRef.current = audio;
      audio.volume = 0.9;

      audio.play()
        .then(() => {
          setIsPlayingAdhan(true);
          console.log(`[PrayerNotificationTracker] Successfully playing adhan url index ${index}: ${activeUrl}`);
        })
        .catch((err) => {
          console.warn(`[PrayerNotificationTracker] Play failed for index ${index}: ${activeUrl}`, err);
          index++;
          playWithFallback();
        });

      audio.onended = () => {
        setIsPlayingAdhan(false);
      };
    };

    playWithFallback();
  };

  const triggerSystemNotification = (title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "prayer-notification-alert"
        });
      } catch (e) {
        console.error("OS notification error:", e);
      }
    }
  };

  const stopAdhan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayingAdhan(false);
    setActiveAlert(null);
  };

  useEffect(() => {
    // Background check interval every 10 seconds
    checkIntervalRef.current = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const timeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

      // Get active prayer times (dynamic or static fallback)
      let activePrayerTimes = prayerTimes;
      try {
        const rawTimes = localStorage.getItem("calculated_prayer_times");
        if (rawTimes) {
          const parsed = JSON.parse(rawTimes);
          activePrayerTimes = [
            { id: "fajr", name: "الفجر", time: parsed.fajr || "04:12" },
            { id: "dhuhr", name: "الظهر", time: parsed.dhuhr || "12:15" },
            { id: "asr", name: "العصر", time: parsed.asr || "15:45" },
            { id: "maghrib", name: "المغرب", time: parsed.maghrib || "18:49" },
            { id: "isha", name: "العشاء", time: parsed.isha || "20:18" }
          ];
        }
      } catch (e) {}

      // Find matching prayer for immediate Adhan call
      const matchedPrayer = activePrayerTimes.find(p => p.time === timeStr);
      if (matchedPrayer) {
        const uniqueKey = `alerted_${matchedPrayer.id}_${todayStr}`;
        const alreadyAlerted = localStorage.getItem(uniqueKey);

        if (!alreadyAlerted) {
          // Check settings for this prayer
          const currentSettings = getSettings();
          const prayerSetting = currentSettings.find(s => s.prayerId === matchedPrayer.id);

          if (!prayerSetting || prayerSetting.enabled) {
            // Set alerted flag so we don't spam multiple times within the same minute
            localStorage.setItem(uniqueKey, "true");

            const voiceId = prayerSetting?.adhanVoiceId || "makkah";
            const muadhinName = getMuadhinName(voiceId);

            // Display in-app gorgeous banner alert
            setActiveAlert({
              prayerId: matchedPrayer.id,
              prayerName: matchedPrayer.name,
              muadhinName,
              time: matchedPrayer.time
            });

            // Trigger OS Notification
            const msgTitle = `🕌 حان الآن موعد نداء صلاة ${matchedPrayer.name}`;
            const msgBody = `الله أكبر، الله أكبر.. نداء الحق لـ صلاة ${matchedPrayer.name} بتوقيتك المحلي بصوت (${muadhinName}). أقم صلاتك تسعد حياتك.`;
            triggerSystemNotification(msgTitle, msgBody);

            // Play the Adhan Audio!
            playAdhanAudio(voiceId);
          }
        }
      }

      // Check custom minutes before prayer preparation warning alert
      const prepEnabled = localStorage.getItem("pre_prayer_prep_enabled") !== "false";
      if (prepEnabled) {
        const prepTimeSaved = localStorage.getItem("pre_prayer_prep_time");
        const prepTime = prepTimeSaved ? parseInt(prepTimeSaved, 10) : 10;

        // Calculate custom minutes in the future
        const futureDate = new Date(now.getTime() + prepTime * 60 * 1000);
        const futureHours = String(futureDate.getHours()).padStart(2, "0");
        const futureMinutes = String(futureDate.getMinutes()).padStart(2, "0");
        const futureTimeStr = `${futureHours}:${futureMinutes}`;

        const incomingPrayer = activePrayerTimes.find(p => p.time === futureTimeStr);
        if (incomingPrayer) {
          const prepKey = `alerted_prep_${incomingPrayer.id}_${todayStr}`;
          const alreadyPrepAlerted = localStorage.getItem(prepKey);

          if (!alreadyPrepAlerted) {
            const currentSettings = getSettings();
            const prayerSetting = currentSettings.find(s => s.prayerId === incomingPrayer.id);

            if (!prayerSetting || prayerSetting.enabled) {
              localStorage.setItem(prepKey, "true");

              // Play gentle notification chime
              playQuietChime("gentle");

              // Trigger OS Notification
              const prepTitle = `🔔 اقترب موعد صلاة ${incomingPrayer.name} (بقي ${toArabicNumerals(prepTime)} دقائق)`;
              const prepBody = `أخي الكريم، شارف وقت صلاة ${incomingPrayer.name} على الدخول. استعد وتوضأ لملاقاة الرحمن واللحاق بتكبيرة الإحرام.`;
              triggerSystemNotification(prepTitle, prepBody);
            }
          }
        }
      }

      // Check quiet daily reminders for Athkar
      try {
        const athkarConfig = getAthkarConfig();
        if (athkarConfig.enabled && localStorage.getItem("silent_mode") !== "true") {
          const reminders = [
            {
              id: "morning",
              name: "أذكار الصباح",
              time: athkarConfig.morningTime,
              enabled: athkarConfig.morningEnabled,
              title: "📿 حان الآن وقت أذكار الصباح",
              body: "أصبحنا وأصبح الملك لله.. رطب لسانك بذكر الله وحصّن خطوتك بأذكار الصباح كاملة الآن."
            },
            {
              id: "evening",
              name: "أذكار المساء",
              time: athkarConfig.eveningTime,
              enabled: athkarConfig.eveningEnabled,
              title: "📿 حان الآن وقت أذكار المساء",
              body: "أمسينا وأمسى الملك لله.. اختتم نهارك بالبركة وحصّن ليلتك بأذكار المساء المباركة."
            },
            {
              id: "night",
              name: "أوراد النوم والذكر",
              time: athkarConfig.nightTime,
              enabled: athkarConfig.nightEnabled,
              title: "📿 تذكير: أوراد ما قبل النوم ولحظات الهدوء",
              body: "باسمك ربي وضعت جنبي.. تسبيح وهدوء يريح قلبك المتعب، ردد أذكار النوم الطاهرة."
            }
          ];

          reminders.forEach(rem => {
            if (rem.enabled && rem.time === timeStr) {
              const remKey = `alerted_athkar_${rem.id}_${todayStr}`;
              const alreadyReminded = localStorage.getItem(remKey);
              if (!alreadyReminded) {
                localStorage.setItem(remKey, "true");

                // Trigger quiet non-intrusive notification chime
                playQuietChime(athkarConfig.chimeSoundId || "gentle");

                // Trigger OS Notification
                triggerSystemNotification(rem.title, rem.body);
              }
            }
          });
        }
      } catch (e) {
        console.error("Athkar check error:", e);
      }
    }, 10000); // Check every 10 seconds

    // Schedule all native offline notifications on startup (Capacitor/Android local notification syncing)
    scheduleAllOfflineNotifications().catch((e) => {
      console.warn("Failed or skipped initial offline scheduling:", e);
    });

    // Listener to automatically reschedule notifications when user changes settings in UI
    const handleRescheduleEvent = () => {
      console.log("[PrayerNotificationTracker] Rescheduling offline notifications due to live user settings updates...");
      scheduleAllOfflineNotifications().catch((err) => console.warn(err));
    };

    window.addEventListener("prophet-reminder-changed", handleRescheduleEvent);
    window.addEventListener("prayer-reminder-changed", handleRescheduleEvent);

    // Standard notification permission requests automatically when tracker loads (if not already prompted)
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      setTimeout(() => {
        Notification.requestPermission().catch(() => {});
      }, 8000);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.removeEventListener("prophet-reminder-changed", handleRescheduleEvent);
      window.removeEventListener("prayer-reminder-changed", handleRescheduleEvent);
    };
  }, []);

  if (!activeAlert) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-[9999] md:left-auto md:right-4 md:w-96 animate-bounce" style={{ direction: "rtl" }}>
      <div className="bg-[#092234] border-2 border-amber-400 rounded-2xl p-4 shadow-2xl overflow-hidden relative">
        {/* Absolute Glowing Ripple back background */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-amber-250 to-amber-600 animate-pulse" />
        
        <div className="flex items-start space-x-3 space-x-reverse">
          <div className="bg-amber-500/10 border border-amber-400/30 p-2.5 rounded-xl text-amber-300 transform animate-pulse shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          
          <div className="flex-1 text-right mt-0.5 min-w-0">
            <h4 className="text-sm font-bold text-amber-200">🕌 نداء الحق: صلاة {activeAlert.prayerName}</h4>
            <p className="text-[11px] text-slate-200 leading-normal mt-1 leading-relaxed">
              حان الآن توقيت صلاة <span className="font-bold text-white">{activeAlert.prayerName}</span> المحلي ({activeAlert.time}). نفعك الله بصلاتك وكتب أجر طاعتك.
            </p>
            <span className="text-[10px] text-amber-400/80 block mt-1.5 font-sans font-light">
              🔊 المؤذن المعين: {activeAlert.muadhinName}
            </span>
          </div>

          <button 
            onClick={stopAdhan}
            className="p-1.5 hover:bg-white/10 text-slate-300 rounded-lg transition"
            title="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Playback Control Actions Footer */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex justify-end gap-2">
          {isPlayingAdhan ? (
            <button
              onClick={stopAdhan}
              className="px-3.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>إيقاف صوت الأذان</span>
            </button>
          ) : (
            <button
              onClick={() => {
                const settings = getSettings();
                const currentSetting = settings.find(s => s.prayerId === activeAlert.prayerId);
                const voiceId = currentSetting?.adhanVoiceId || "makkah";
                playAdhanAudio(voiceId);
              }}
              className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>إعادة تشغيل</span>
            </button>
          )}

          <button
            onClick={() => setActiveAlert(null)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 rounded-xl text-[10px] font-bold transition active:scale-95 cursor-pointer"
          >
            تجاهل المؤقت
          </button>
        </div>
      </div>
    </div>
  );
}
