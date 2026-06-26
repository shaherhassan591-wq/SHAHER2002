import { LocalNotifications } from "@capacitor/local-notifications";
import { isNativeAndroid } from "./androidBridge";

// Hardcoded default prayer times (matching app globals)
const DEFAULT_PRAYER_TIMES = [
  { id: "fajr", name: "الفجر", time: "04:12" },
  { id: "dhuhr", name: "الظهر", time: "12:15" },
  { id: "asr", name: "العصر", time: "15:45" },
  { id: "maghrib", name: "المغرب", time: "18:49" },
  { id: "isha", name: "العشاء", time: "20:18" }
];

interface NotificationSetting {
  prayerId: string;
  prayerName: string;
  enabled: boolean;
  adhanVoiceId: string;
}

/**
 * Check if Capactior Local Notifications plugin is available and ready
 */
export const isLocalNotificationsSupported = (): boolean => {
  try {
    return isNativeAndroid() || (typeof window !== "undefined" && !!LocalNotifications);
  } catch (e) {
    return false;
  }
};

/**
 * Request OS-level permissions for triggering local alarms and notifications
 */
export const requestLocalNotificationPermissions = async (): Promise<boolean> => {
  try {
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
 * Schedule recurring offline daily notifications for prayers and Athkar using the local device clock
 */
export const scheduleAllOfflineNotifications = async (): Promise<boolean> => {
  try {
    if (!isLocalNotificationsSupported()) {
      console.log("[LocalNotifications] Capacitor LocalNotifications is not supported in this frame environment.");
      return false;
    }

    // 1. First ensure we clean up any pre-existing schedules to avoid duplicates
    await cancelAllOfflineNotifications();

    // 2. Request / Ensure permission
    await requestLocalNotificationPermissions();

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

    // Get active prayer times
    const timesMap: Record<string, string> = {
      fajr: "04:12",
      dhuhr: "12:15",
      asr: "15:45",
      maghrib: "18:49",
      isha: "20:18"
    };

    try {
      const savedTimes = localStorage.getItem("calculated_prayer_times");
      if (savedTimes) {
        Object.assign(timesMap, JSON.parse(savedTimes));
      }
    } catch (e) {}

    const isSilent = localStorage.getItem("silent_mode") === "true";
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

    // 4. Register Prayer Notifications
    settings.forEach((s) => {
      if (s.enabled) {
        const timeStr = timesMap[s.prayerId] || "12:00";
        const [hour, minute] = timeStr.split(":").map(Number);

        // Standard Adhan alert
        notificationsToSchedule.push({
          id: idCounter++,
          title: `🕌 حان الآن موعد صلاة ${s.prayerName.replace("صلاة ", "")}`,
          body: isSilent 
            ? `أقيمت صلاة ${s.prayerName.replace("صلاة ", "")}، تذكر أداء الفريضة في وقتها (وضع صامت).`
            : `الله أكبر، الله أكبر.. نداء الحق لـ صلاة ${s.prayerName.replace("صلاة ", "")} بتوقيتك المحلي. أقم صلاتك تسعد حياتك.`,
          schedule: {
            on: { hour, minute },
            repeats: true,
            allowWhileIdle: true
          },
          sound: isSilent ? undefined : "adhan.wav",
          actionTypeId: "PRAYER_ACTION",
          extra: {
            prayerId: s.prayerId
          }
        });

        // Customizable Pre-Prayer warning alert
        if (prePrayerPrepEnabled) {
          const alertTotalMinutes = hour * 60 + minute - prepTime;
          const targetTotalMinutes = alertTotalMinutes < 0 ? (24 * 60 + alertTotalMinutes) : alertTotalMinutes;
          const alertHour = Math.floor(targetTotalMinutes / 60);
          const alertMinute = targetTotalMinutes % 60;

          notificationsToSchedule.push({
            id: idCounter++,
            title: `⏳ اقترب موعد صلاة ${s.prayerName.replace("صلاة ", "")}`,
            body: `بقي أقل من ${toArabicNumerals(prepTime)} دقائق للنداء المبارك لصلاة ${s.prayerName.replace("صلاة ", "")}. استعد وتوضأ لملاقاة الرحمن.`,
            schedule: {
              on: {
                hour: alertHour,
                minute: alertMinute
              },
              repeats: true,
              allowWhileIdle: true
            },
            sound: isSilent ? undefined : "chime.wav",
            actionTypeId: "PRE_PRAYER_ACTION"
          });
        }
      }
    });

    // 5. Register Athkar periodic offline notifications
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

    if (athkarConfig.enabled && !isSilent) {
      if (athkarConfig.morningEnabled) {
        const [h, m] = athkarConfig.morningTime.split(":").map(Number);
        notificationsToSchedule.push({
          id: idCounter++,
          title: "📿 حان الآن وقت أذكار الصباح",
          body: "أصبحنا وأصبح الملك لله.. رطب لسانك بذكر الله وحصّن يومك المبارك بالأذكار كاملة الآن.",
          schedule: {
            on: { hour: h, minute: m },
            repeats: true,
            allowWhileIdle: true
          },
          sound: "chime.wav"
        });
      }

      if (athkarConfig.eveningEnabled) {
        const [h, m] = athkarConfig.eveningTime.split(":").map(Number);
        notificationsToSchedule.push({
          id: idCounter++,
          title: "📿 حان الآن وقت أذكار المساء",
          body: "أمسينا وأمسي الملك لله.. اختتم نهارك بالبركة وحصّن نفسك ودارك بأذكار المساء المباركة.",
          schedule: {
            on: { hour: h, minute: m },
            repeats: true,
            allowWhileIdle: true
          },
          sound: "chime.wav"
        });
      }

      if (athkarConfig.nightEnabled) {
        const [h, m] = athkarConfig.nightTime.split(":").map(Number);
        notificationsToSchedule.push({
          id: idCounter++,
          title: "🌌 تذكير قبيل النوم بالأذكار",
          body: "باسمك ربي وضعت جنبي وبك أرفعه.. لا تنسَ أذكار النوم وورد سورة الملك طلباً للسكينة والحفظ.",
          schedule: {
            on: { hour: h, minute: m },
            repeats: true,
            allowWhileIdle: true
          },
          sound: "chime.wav"
        });
      }
    }

    // 5.5 Daily Spiritual & Moral Nourishment Notifications (Non-intrusive)
    const verseNotifEnabled = localStorage.getItem("daily_verse_notif_enabled") !== "false";
    const hadithNotifEnabled = localStorage.getItem("daily_hadith_notif_enabled") !== "false";
    const moralNotifEnabled = localStorage.getItem("daily_moral_notif_enabled") !== "false";

    const DAILY_VERSES = [
      { text: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا", ref: "سورة النساء - ١٠٣" },
      { text: "وَقُرْءَانَ الْفَجْرِ ۖ إِنَّ قُرْءَانَ الْفَجْرِ كَانَ مَشْهُودًا", ref: "سورة الإسراء - ٧٨" },
      { text: "وَأَقِمِ الصَّلَاةَ طَرَفَيِ النَّهَارِ وَزُلَفًا مِنَ اللَّيْلِ ۚ إِنَّ الْحَسَنَاتِ يُذْهِبْنَ السَّيِّئَاتِ", ref: "سورة هود - ١١٤" },
      { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", ref: "سورة الرعد - ٢٨" },
      { text: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ", ref: "سورة آل عمران - ١٣٣" },
      { text: "ادْعُ إِلَىٰ سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ", ref: "سورة النحل - ١٢٥" },
      { text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", ref: "سورة الطلاق - ٢" }
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
      "إماطة الأذى عن الطريق صدقة، حافظ على نظافة بيئتك واجعل ممر الناس آمناً مريحاً.",
      "الكلمة الطيبة تفتح مغاليق القلوب؛ قل خيراً يرفع من شأن الناس أو اصمت فذلك أزكى لك.",
      "العفو والصفح عند المقدرة من شيم الكرام؛ اعفُ عمن أخطأ بحقك ليرتاح صدرك ويصفو عيشك الحبيب.",
      "الأمانة خلق رفيع؛ كن أميناً مخلصاً في عملك ووفِ بوعودك فالمؤمن إذا عاهد وفى بعهده.",
      "صناعة المعروف تقي مصارع السوء؛ ابحث اليوم عن محتاج أو مكروب وقدم له عوناً أو دعوة بظهر الغيب.",
      "حفظ النعمة يبدأ بشكرها؛ تذكر نعم الصحة والعافية والمسكن التي تحيط بك واشكر المنعم سبحانه."
    ];

    const dayOfMonth = new Date().getDate();

    if (verseNotifEnabled && !isSilent) {
      const verse = DAILY_VERSES[dayOfMonth % DAILY_VERSES.length];
      notificationsToSchedule.push({
        id: idCounter++,
        title: "📖 آية اليوم المتدبرة",
        body: `قال الله تعالى: "${verse.text}" [${verse.ref}]`,
        schedule: {
          on: { hour: 9, minute: 0 },
          repeats: true,
          allowWhileIdle: true
        },
        sound: "chime.wav"
      });
    }

    if (hadithNotifEnabled && !isSilent) {
      const hadith = DAILY_HADITHS[dayOfMonth % DAILY_HADITHS.length];
      notificationsToSchedule.push({
        id: idCounter++,
        title: "💬 الحديث النبوي الشريف لليوم",
        body: `عن النبي ﷺ قال: "${hadith.text}" [${hadith.ref}]`,
        schedule: {
          on: { hour: 13, minute: 0 },
          repeats: true,
          allowWhileIdle: true
        },
        sound: "chime.wav"
      });
    }

    if (moralNotifEnabled && !isSilent) {
      const tip = DAILY_MORAL_TIPS[dayOfMonth % DAILY_MORAL_TIPS.length];
      notificationsToSchedule.push({
        id: idCounter++,
        title: "💡 نصيحة أخلاقية قيّمة لليوم",
        body: tip,
        schedule: {
          on: { hour: 17, minute: 0 },
          repeats: true,
          allowWhileIdle: true
        },
        sound: "chime.wav"
      });
    }

    // 6. Push to native LocalNotifications manager!
    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule
      });
      console.log(`[LocalNotifications] Successfully set up ${notificationsToSchedule.length} background offline alarms.`);
    }

    return true;
  } catch (e) {
    console.warn("[LocalNotifications] Could not schedule native offline notifications:", e);
    return false;
  }
};
