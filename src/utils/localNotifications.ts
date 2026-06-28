import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { isNativeAndroid } from "./androidBridge";
import { getPrayerCalcSettings, calculatePrayerTimes, CITIES } from "./prayerCalc";

interface NotificationSetting {
  prayerId: string;
  prayerName: string;
  enabled: boolean;
  adhanVoiceId: string;
}

/**
 * Check if the current browser or environment supports the Notification API
 */
const checkNotificationSupport = (): boolean => {
  if (typeof window === "undefined") return false;
  
  // Natively in Capacitor Android/iOS, local notifications are always supported
  if (Capacitor.isNativePlatform()) {
    return true;
  }
  
  // On web, check if standard Notification API is present
  try {
    return "Notification" in window && typeof Notification.requestPermission === "function";
  } catch (e) {
    return false;
  }
};

/**
 * Check if Capacitor Local Notifications plugin is available and ready
 */
export const isLocalNotificationsSupported = (): boolean => {
  return checkNotificationSupport();
};

/**
 * Request OS-level permissions for triggering local alarms and notifications
 */
export const requestLocalNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (!checkNotificationSupport()) return false;
    const status = await LocalNotifications.requestPermissions();
    console.log("[LocalNotifications] Permission status requested:", status);
    return status.display === "granted";
  } catch (e) {
    console.warn("[LocalNotifications] Error requesting native local notification permission:", e);
    return false;
  }
};

/**
 * Cancel and delete all previously registered offline alarms/notifications
 */
export const cancelAllOfflineNotifications = async (): Promise<void> => {
  try {
    if (!checkNotificationSupport()) return;
    const pending = await LocalNotifications.getPending();
    if (pending.notifications && pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
      console.log("[LocalNotifications] Successfully cancelled all buffered native notifications:", pending.notifications.length);
    }
  } catch (e) {
    console.warn("[LocalNotifications] Could not cancel native notifications:", e);
  }
};

/**
 * Schedule recurring offline notifications for prayers and Athkar using the local device clock.
 * We schedule individual exact date-times for the next 4 days to ensure high accuracy,
 * as prayer times change slightly day-by-day. This respects iOS and Android limitations.
 */
export const scheduleAllOfflineNotifications = async (): Promise<boolean> => {
  try {
    const isSupported = isLocalNotificationsSupported();
    const isNative = Capacitor.isNativePlatform();

    if (isSupported && isNative) {
      // 1. First ensure we clean up any pre-existing schedules to avoid duplicates
      await cancelAllOfflineNotifications();

      // 2. Request / Ensure permission
      await requestLocalNotificationPermissions();

      // Create high-importance channel for Android popup/heads-up notifications
      try {
        await LocalNotifications.createChannel({
          id: "prayer-times-channel",
          name: "أوقات الصلاة والتنبيهات والآذان",
          description: "تنبيهات مواعيد الصلوات الخمس والأذكار والآيات الشريفة بحد أقصى للأولوية لظهورها كإشعار منبثق على شاشة الهاتف.",
          importance: 5, // MAX importance (Heads-up / Pop-up notification!)
          visibility: 1,  // PUBLIC
          vibration: true,
          lights: true,
        });
        console.log("[LocalNotifications] Successfully created/verified high importance channel: prayer-times-channel");
      } catch (chanErr) {
        console.warn("[LocalNotifications] Error creating notification channel:", chanErr);
      }
    } else {
      console.log("[LocalNotifications] Capacitor LocalNotifications is not natively supported or in simulation environment. Preparing simulated notifications schedule.");
    }

    // 3. Prepare notifications list
    const notificationsToSchedule: any[] = [];
    let idCounter = 1000; // unique notification index counter

    // Load actual or default notification settings
    let settings: NotificationSetting[] = [];
    try {
      const saved = localStorage.getItem("notification_settings");
      if (saved) {
        settings = JSON.parse(saved);
      }
    } catch (e) {}

    if (settings.length === 0) {
      settings = [
        { prayerId: "fajr", prayerName: "صلاة الفجر", enabled: true, adhanVoiceId: "makkah" },
        { prayerId: "dhuhr", prayerName: "صلاة الظهر", enabled: true, adhanVoiceId: "makkah" },
        { prayerId: "asr", prayerName: "صلاة العصر", enabled: true, adhanVoiceId: "makkah" },
        { prayerId: "maghrib", prayerName: "صلاة المغرب", enabled: true, adhanVoiceId: "makkah" },
        { prayerId: "isha", prayerName: "صلاة العشاء", enabled: true, adhanVoiceId: "makkah" },
      ];
    }

    // Get active prayer calculation configurations
    const calcSettings = getPrayerCalcSettings();
    let lat = 24.7136; // Riyadh defaults
    let lng = 46.6753;
    let timezone = 3;

    if (calcSettings.type === "city") {
      const city = CITIES.find((c) => c.id === calcSettings.cityId) || CITIES[2];
      lat = city.lat;
      lng = city.lng;
      timezone = city.timezone;
    } else if (calcSettings.type === "gps" && calcSettings.gpsLat !== undefined && calcSettings.gpsLng !== undefined) {
      lat = calcSettings.gpsLat;
      lng = calcSettings.gpsLng;
      timezone = calcSettings.gpsTimezone !== undefined ? calcSettings.gpsTimezone : (new Date().getTimezoneOffset() / -60);
    }

    const isSilent = localStorage.getItem("silent_mode") === "true";
    const isDnd = localStorage.getItem("dnd_mode") === "true";
    const prePrayerPrepEnabled = localStorage.getItem("pre_prayer_prep_enabled") !== "false";
    const prepTimeSaved = localStorage.getItem("pre_prayer_prep_time");
    const prepTime = prepTimeSaved ? parseInt(prepTimeSaved, 10) : 10;

    const toArabicNumerals = (num: number | string): string => {
      const arabicMap: { [key: string]: string } = {
        "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
        "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩"
      };
      return String(num).replace(/[0-9]/g, (d) => arabicMap[d]);
    };

    // Constant daily moral lists
    const DAILY_VERSES = [
      { text: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا", ref: "سورة النساء - ١٠٣" },
      { text: "وَقُرْءَانَ الْفَجْرِ ۖ إِنَّ قُرْءَانَ الْفَجْرِ كَانَ مَشْهُودًا", ref: "سورة الإسراء - ٧٨" },
      { text: "وَأَقِمِ الصَّلَاةَ طَرَفَيِ النَّهَارِ وَزُلَفًا مِنَ اللَّيْلِ ۚ إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ", ref: "سورة هود - ١١٤" },
      { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", ref: "سورة الرعد - ٢٨" },
      { text: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ", ref: "سورة آل عمران - ١٣٣" },
      { text: "ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ", ref: "سورة النحل - ١٢٥" },
      { text: "Wَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", ref: "سورة الطلاق - ٢" }
    ];

    const DAILY_HADITHS = [
      { text: "إنَّما الأعْمالُ بالنِّيّاتِ، وإنَّما لِكُلِّ امْرِئٍ ما نَوَى", ref: "صحيح البخاري" },
      { text: "المسلِمُ مَن سَلِمَ المسلِمُونَ مِن لِسانِهِ ويَدِهِ", ref: "صحيح البخاري ومسلم" },
      { text: "تبسمك في وجه أخيك لك صدقة", ref: "سنن الترمذي" },
      { text: "الدِّينُ النَّصِيحَةُ", ref: "صحيح مسلم" },
      { text: "خيركم من تعلم القرآن وعلمه", ref: "صحيح البخاري" },
      { text: "يسروا ولا تعسروا، وبشروا ولا تنفروا", ref: "صحيح البخاري" },
      { text: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا", ref: "سنن الترمذي" }
    ];

    const DAILY_MORAL_TIPS = [
      "بر الوالدين مفتاح لكل توفيق؛ اتصل بوالديك اليوم وأسعدهما بكلمة طيبة تسعد قلبيهما.",
      "إماطة الأذى عن الطريق صدقة, حافظ على نظافة بيئتك واجعل ممر الناس آمناً مريحاً.",
      "الكلمة الطيبة تفتح مغاليق القلوب؛ قل خيراً يرفع من شأن الناس أو اصمت فذلك أزكى لك.",
      "العفو والصفح عند المقدرة من شيم الكرام؛ اعفُ عمن أخطأ بحقك ليرتاح صدرك ويصفو عيشك الحبيب.",
      "الأمانة خلق رفيع؛ كن أميناً مخلصاً في عملك ووفِ بوعودك فالمؤمن إذا عاهد وفى بعهده.",
      "صناعة المعروف تقي مصارع السوء؛ ابحث اليوم عن محتاج أو مكروب وقدم له عوناً أو دعوة بظهر الغيب.",
      "حفظ النعمة يبدأ بشكرها؛ تذكر نعم الصحة والعافية والمسكن التي تحيط بك واشكر المنعم سبحانه."
    ];

    // Load Athkar configurations
    let athkarConfig = {
      enabled: true,
      morningTime: "07:00",
      morningEnabled: true,
      eveningTime: "17:00",
      eveningEnabled: true,
      nightTime: "22:00",
      nightEnabled: true,
    };

    try {
      const savedAthkar = localStorage.getItem("athkar_reminder_config");
      if (savedAthkar) {
        Object.assign(athkarConfig, JSON.parse(savedAthkar));
      }
    } catch (e) {}

    const verseNotifEnabled = localStorage.getItem("daily_verse_notif_enabled") !== "false";
    const hadithNotifEnabled = localStorage.getItem("daily_hadith_notif_enabled") !== "false";
    const moralNotifEnabled = localStorage.getItem("daily_moral_notif_enabled") !== "false";

    // 4. Calculate accurate scheduler instances for the next 4 days
    // Scheduling for 4 days strictly respects the iOS local notifications limit (max 64 per app)
    const now = new Date();
    const SCHEDULING_DAYS_LIMIT = 4;

    for (let d = 0; d < SCHEDULING_DAYS_LIMIT; d++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + d);

      // Recalculate exact prayer times for this specific day offset
      const dailyTimes = calculatePrayerTimes(
        targetDate,
        lat,
        lng,
        timezone,
        calcSettings.methodId,
        calcSettings.asrJuristic
      );

      // Register standard prayer alerts
      if (!isDnd) {
        settings.forEach((s) => {
          if (s.enabled) {
            const prayerTimeStr = dailyTimes[s.prayerId as "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"] || "12:00";
            const [hour, minute] = prayerTimeStr.split(":").map(Number);

            const schedDate = new Date(targetDate);
            schedDate.setHours(hour, minute, 0, 0);

            // Standard Adhan alert
            if (schedDate.getTime() > now.getTime()) {
              notificationsToSchedule.push({
                id: idCounter++,
                title: `🕌 حان الآن موعد صلاة ${s.prayerName.replace("صلاة ", "")}`,
                body: isSilent 
                  ? `أقيمت صلاة ${s.prayerName.replace("صلاة ", "")}، تذكر أداء الفريضة في وقتها (وضع صامت).`
                  : `الله أكبر، الله أكبر.. نداء الحق لـ صلاة ${s.prayerName.replace("صلاة ", "")} بتوقيتك المحلي. أقم صلاتك تسعد حياتك.`,
                channelId: "prayer-times-channel",
                schedule: {
                  at: schedDate,
                  allowWhileIdle: true
                },
                sound: undefined,
                actionTypeId: "PRAYER_ACTION",
                extra: {
                  prayerId: s.prayerId,
                  scheduledTime: prayerTimeStr
                }
              });
            }

            // Customizable Pre-Prayer warning alert
            if (prePrayerPrepEnabled) {
              const prepDate = new Date(schedDate.getTime() - prepTime * 60 * 1000);
              if (prepDate.getTime() > now.getTime()) {
                notificationsToSchedule.push({
                  id: idCounter++,
                  title: `⏳ اقترب موعد صلاة ${s.prayerName.replace("صلاة ", "")}`,
                  body: `بقي أقل من ${toArabicNumerals(prepTime)} دقائق للنداء المبارك لصلاة ${s.prayerName.replace("صلاة ", "")}. استعد وتوضأ لملاقاة الرحمن.`,
                  channelId: "prayer-times-channel",
                  schedule: {
                    at: prepDate,
                    allowWhileIdle: true
                  },
                  sound: undefined,
                  actionTypeId: "PRE_PRAYER_ACTION",
                  extra: {
                    prayerId: s.prayerId
                  }
                });
              }
            }
          }
        });
      }

      // Register Athkar reminders
      if (athkarConfig.enabled && !isSilent) {
        if (athkarConfig.morningEnabled) {
          const [h, m] = athkarConfig.morningTime.split(":").map(Number);
          const schedDate = new Date(targetDate);
          schedDate.setHours(h, m, 0, 0);
          if (schedDate.getTime() > now.getTime()) {
            notificationsToSchedule.push({
              id: idCounter++,
              title: "📿 حان الآن وقت أذكار الصباح",
              body: "أصبحنا وأصبح الملك لله.. رطب لسانك بذكر الله وحصّن يومك المبارك بالأذكار كاملة الآن.",
              channelId: "prayer-times-channel",
              schedule: {
                at: schedDate,
                allowWhileIdle: true
              },
              sound: undefined
            });
          }
        }

        if (athkarConfig.eveningEnabled) {
          const [h, m] = athkarConfig.eveningTime.split(":").map(Number);
          const schedDate = new Date(targetDate);
          schedDate.setHours(h, m, 0, 0);
          if (schedDate.getTime() > now.getTime()) {
            notificationsToSchedule.push({
              id: idCounter++,
              title: "📿 حان الآن وقت أذكار المساء",
              body: "أمسينا وأمسي الملك لله.. اختتم نهارك بالبركة وحصّن نفسك ودارك بأذكار المساء المباركة.",
              channelId: "prayer-times-channel",
              schedule: {
                at: schedDate,
                allowWhileIdle: true
              },
              sound: undefined
            });
          }
        }

        if (athkarConfig.nightEnabled) {
          const [h, m] = athkarConfig.nightTime.split(":").map(Number);
          const schedDate = new Date(targetDate);
          schedDate.setHours(h, m, 0, 0);
          if (schedDate.getTime() > now.getTime()) {
            notificationsToSchedule.push({
              id: idCounter++,
              title: "🌌 تذكير قبيل النوم بالأذكار",
              body: "باسمك ربي وضعت جنبي وبك أرفعه.. لا تنسَ أذكار النوم وورد سورة الملك طلباً للسكينة والحفظ.",
              channelId: "prayer-times-channel",
              schedule: {
                at: schedDate,
                allowWhileIdle: true
              },
              sound: undefined
            });
          }
        }
      }

      // Daily Spiritual alerts (Verse, Hadith, Moral tip)
      const dayOfMonth = targetDate.getDate();

      if (verseNotifEnabled && !isSilent) {
        const verse = DAILY_VERSES[dayOfMonth % DAILY_VERSES.length];
        const schedDate = new Date(targetDate);
        schedDate.setHours(9, 0, 0, 0); // 9:00 AM
        if (schedDate.getTime() > now.getTime()) {
          notificationsToSchedule.push({
            id: idCounter++,
            title: "📖 آية اليوم المتدبرة",
            body: `قال الله تعالى: "${verse.text}" [${verse.ref}]`,
            channelId: "prayer-times-channel",
            schedule: {
              at: schedDate,
              allowWhileIdle: true
            },
            sound: undefined
          });
        }
      }

      if (hadithNotifEnabled && !isSilent) {
        const hadith = DAILY_HADITHS[dayOfMonth % DAILY_HADITHS.length];
        const schedDate = new Date(targetDate);
        schedDate.setHours(13, 0, 0, 0); // 1:00 PM
        if (schedDate.getTime() > now.getTime()) {
          notificationsToSchedule.push({
            id: idCounter++,
            title: "💬 الحديث النبوي الشريف لليوم",
            body: `عن النبي ﷺ قال: "${hadith.text}" [${hadith.ref}]`,
            channelId: "prayer-times-channel",
            schedule: {
              at: schedDate,
              allowWhileIdle: true
            },
            sound: undefined
          });
        }
      }

      if (moralNotifEnabled && !isSilent) {
        const tip = DAILY_MORAL_TIPS[dayOfMonth % DAILY_MORAL_TIPS.length];
        const schedDate = new Date(targetDate);
        schedDate.setHours(17, 0, 0, 0); // 5:00 PM
        if (schedDate.getTime() > now.getTime()) {
          notificationsToSchedule.push({
            id: idCounter++,
            title: "💡 نصيحة أخلاقية قيّمة لليوم",
            body: tip,
            channelId: "prayer-times-channel",
            schedule: {
              at: schedDate,
              allowWhileIdle: true
            },
            sound: undefined
          });
        }
      }
    }

    // 5. Register using Capacitor LocalNotifications plugin if supported, otherwise simulate
    if (notificationsToSchedule.length > 0) {
      if (isSupported && isNative) {
        try {
          await LocalNotifications.schedule({
            notifications: notificationsToSchedule
          });
          console.log(`[LocalNotifications] Successfully set up ${notificationsToSchedule.length} native offline alarms.`);
          localStorage.setItem("simulated_scheduled_notifications", JSON.stringify(notificationsToSchedule));
        } catch (schedErr) {
          console.warn("[LocalNotifications] Native schedule API threw, falling back to simulation:", schedErr);
          localStorage.setItem("simulated_scheduled_notifications", JSON.stringify(notificationsToSchedule));
        }
      } else {
        localStorage.setItem("simulated_scheduled_notifications", JSON.stringify(notificationsToSchedule));
        console.log(`[LocalNotifications Web Simulation] Successfully calculated and saved ${notificationsToSchedule.length} simulated offline alarms.`);
      }
    }

    return true;
  } catch (e) {
    console.warn("[LocalNotifications] Could not schedule native offline notifications:", e);
    return true;
  }
};
