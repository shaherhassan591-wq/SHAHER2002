import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Check,
  Clock,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Bell,
  BellOff,
  Flame,
  Award,
  Sparkles,
  RotateCcw,
  Volume2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface WardItem {
  id: string;
  type: "verse" | "thekr";
  title: string;
  text: string;
  source?: string;
  repeatCount: number;
  reward?: string;
}

interface PersonalWardConfig {
  morningTime: string;
  afternoonTime: string;
  eveningTime: string;
  nightTime: string;
  remindersEnabled: boolean;
}

export default function DailyWardView({ darkMode = true }: { darkMode?: boolean }) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "afternoon" | "evening" | "night">("morning");
  const [completedItems, setCompletedItems] = useState<Record<string, number>>({});
  const [streakCount, setStreakCount] = useState<number>(() => {
    return Number(localStorage.getItem("daily_ward_streak") || "3"); // default initial encouraging simulated streak
  });
  const [hasFinishedToday, setHasFinishedToday] = useState<boolean>(() => {
    const lastDate = localStorage.getItem("daily_ward_last_date");
    const todayStr = new Date().toDateString();
    return lastDate === todayStr;
  });

  const [reminderConfig, setReminderConfig] = useState<PersonalWardConfig>(() => {
    const defaultData: PersonalWardConfig = {
      morningTime: "06:30",
      afternoonTime: "13:30",
      eveningTime: "18:00",
      nightTime: "22:30",
      remindersEnabled: true,
    };
    const saved = localStorage.getItem("daily_ward_reminders");
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [notificationActive, setNotificationActive] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<{ title: string; body: string }>({ title: "", body: "" });

  // Data definitions for the 4 periods of the day
  const periodWards: Record<"morning" | "afternoon" | "evening" | "night", { title: string; desc: string; items: WardItem[] }> = {
    morning: {
      title: "الورد الصباحي (من الفجر إلى الضحى)",
      desc: "شروق يومك ببركة القرآن وتحصين النفس بالأذكار النبوية المتواترة.",
      items: [
        {
          id: "m_v1",
          type: "verse",
          title: "آية الكرسي (سورة البقرة - ٢٥٥)",
          text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
          repeatCount: 1,
          reward: "لن يزال عليك من الله حافظ ولا يقربك شيطان حتى تصبح.",
          source: "صحيح البخاري",
        },
        {
          id: "m_v2",
          type: "verse",
          title: "سورة الإخلاص والمعوذتين",
          text: "بسم الله الرحمن الرحيم: قُلْ هُوَ اللَّهُ أَحَدٌ... (وتقرأ المعوذتين: قل أعوذ برب الفلق، وقل أعوذ برب الناس)",
          repeatCount: 3,
          reward: "تكفيك من كل شيء في يومك وجميل حفظك.",
          source: "سنن النسائي والترمذي",
        },
        {
          id: "m_d1",
          type: "thekr",
          title: "سيد الاستغفار",
          text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
          repeatCount: 1,
          reward: "من قالها موقناً بها فمات من يومه قبل الليل دخل الجنة.",
          source: "البخاري",
        },
        {
          id: "m_d2",
          type: "thekr",
          title: "التسبيح والتحميد المائة",
          text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
          repeatCount: 100,
          reward: "حُطّت خطاياه وإن كانت مثل زبد البحر، ولم يأتِ أحد بأفضل مما جاء به إلّا من قال مثله.",
          source: "مسلم",
        },
      ],
    },
    afternoon: {
      title: "الورد النهاري (من الظهر إلى العصر)",
      desc: "وسط النهار، محطة استراحة روحية متكاملة لامتصاص ضغوط الأعمال والحصول على الطمأنينة.",
      items: [
        {
          id: "a_v1",
          type: "verse",
          title: "آيات السكينة (سورة الفتح - ٤)",
          text: "هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ لِيَزْدَادُوا إِيمَانًا مَّعَ إِيمَانِهِمْ ۗ وَلِلَّهِ جُنُودُ السَّمَاوَاتِ وَالْأَرْضِ ۚ وَكَانَ اللَّهُ عَلِيمًا حَكِيمًا",
          repeatCount: 1,
          reward: "نشر الهدوء والسكينة والرضا في قلبك ونور في صدرك.",
        },
        {
          id: "a_d1",
          type: "thekr",
          title: "دعاء كفاية الهم وصلاح القلب",
          text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
          repeatCount: 3,
          reward: "تيسير الأمور اليومية وصلاح البال والنفس في معاشك.",
          source: "الحاكم وحسنه الألباني",
        },
        {
          id: "a_d2",
          type: "thekr",
          title: "التوكل وتفويض الأمر",
          text: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
          repeatCount: 7,
          reward: "كفاه الله ما أهمه من أمر الدنيا والآخرة.",
          source: "أبو داود",
        },
      ],
    },
    evening: {
      title: "الورد المسائي (من بعد العصر إلى العشاء)",
      desc: "أذكار وضراعة المساء، لحفظ البيت والنفس وزيادة الثبات وحمد رب الأرض والسموات.",
      items: [
        {
          id: "e_v1",
          type: "verse",
          title: "خواتيم سورة البقرة (الآيات ٢٨٥-٢٨٦)",
          text: "آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ... لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا...",
          repeatCount: 1,
          reward: "من قرأهما في ليلة كفتاه (أي من كل شر وسوء، وقيل كفتاه قيام ليلته).",
          source: "متفق عليه",
        },
        {
          id: "e_d1",
          type: "thekr",
          title: "التحصين الشامل",
          text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
          repeatCount: 3,
          reward: "لم يضره شيء طوال ليلته ووقاية من الفجاءة والمصائب.",
          source: "الترمذي",
        },
        {
          id: "e_d2",
          type: "thekr",
          title: "الرضا بالله رباً ومعبوداً",
          text: "رَضِيتُ بِاللَّهِ رَبَّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
          repeatCount: 3,
          reward: "كان حقاً على الله سبحانه وتعالى أن يرضيه يوم القيامة.",
          source: "أحمد والترمذي",
        },
      ],
    },
    night: {
      title: "الورد الليلي وقبل النوم (الثلث الأخير والليل)",
      desc: "الهدوء والسكينة والتدبر الوجداني، منارة الاستعداد للنوم النظيف وراحة الروح والجسد.",
      items: [
        {
          id: "n_v1",
          type: "verse",
          title: "سورة الملك (الكاملة المانعة)",
          text: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ... (شجع نفسك على قراءتها بالكامل من قسم القرآن الكريم بتطبيقنا)",
          repeatCount: 1,
          reward: "هي المانعة والمنجية من عذاب وفتنة القبر والشفيعة لصاحبها تباركها الملائكة.",
          source: "الترمذي والنسائي",
        },
        {
          id: "n_d1",
          type: "thekr",
          title: "تسبيحات النوم الراجحة",
          text: "سُبْحَانَ اللَّهِ (٣٣ مرة)، الْحَمْدُ لِلَّهِ (٣٣ مرة)، اللَّهُ أَكْبَرُ (٣٤ مرة)",
          repeatCount: 1,
          reward: "خير من خادم، ويبعث نشاطاً وقوة ومغفرة قبل الاستلقاء للنوم.",
          source: "البخاري ومسلم",
        },
        {
          id: "n_d2",
          type: "thekr",
          title: "حوقلة لتفريج الكروب والسمو",
          text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
          repeatCount: 50,
          reward: "كنز ثري من كنوز الجنة وباب عظيم مبهج لتجديد وتفويض منتهى الطاقات والأماني لله.",
          source: "متفق عليه",
        },
      ],
    },
  };

  // Determine period based on computer current local hour automaticaly on mount
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 12) {
      setSelectedPeriod("morning");
    } else if (hour >= 12 && hour < 17) {
      setSelectedPeriod("afternoon");
    } else if (hour >= 17 && hour < 22) {
      setSelectedPeriod("evening");
    } else {
      setSelectedPeriod("night");
    }

    // Interval to refresh time slightly
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Set default completed states from local storage dynamically
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const savedStates = localStorage.getItem(`daily_ward_completions_${todayStr}`);
    if (savedStates) {
      setCompletedItems(JSON.parse(savedStates));
    } else {
      setCompletedItems({});
    }
  }, [selectedPeriod]);

  // Audio chimes simulator
  const playClickChime = () => {
    try {
      if (typeof window !== "undefined") {
        if (localStorage.getItem("silent_mode") === "true") return;
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sine";
        // Rich high pleasant islamic harp-like double frequencies
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context is safe
    }
  };

  const playSuccessChime = () => {
    try {
      if (typeof window !== "undefined") {
        if (localStorage.getItem("silent_mode") === "true") return;
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.1); // E4
        osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.2); // G4
        osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.3); // C5

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);

        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      }
    } catch (e) {
      // safe
    }
  };

  const handleIncrement = (itemId: string, max: number) => {
    const current = completedItems[itemId] || 0;
    if (current < max) {
      const nextVal = current + 1;
      const updated = { ...completedItems, [itemId]: nextVal };
      setCompletedItems(updated);
      
      const todayStr = new Date().toDateString();
      localStorage.setItem(`daily_ward_completions_${todayStr}`, JSON.stringify(updated));
      
      playClickChime();

      // Check if all items for the current active period are now fully read!
      const activeItems = periodWards[selectedPeriod].items;
      const allDone = activeItems.every((item) => {
        const itemVal = item.id === itemId ? nextVal : (updated[item.id] || 0);
        return itemVal >= item.repeatCount;
      });

      if (allDone) {
        setHasFinishedToday(true);
        localStorage.setItem("daily_ward_last_date", todayStr);
        // increment streak
        const newStreak = streakCount + 1;
        setStreakCount(newStreak);
        localStorage.setItem("daily_ward_streak", String(newStreak));
        
        playSuccessChime();
        triggerNotification(
          "🎉 تهانينا وتقبل الله طاعتك!",
          `لقد أتممت الورد اليومي لـ ${periodWards[selectedPeriod].title} بنجاح! طهر الله قلبك وزادك من فضله.`
        );
      }
    }
  };

  const handleReset = () => {
    const todayStr = new Date().toDateString();
    localStorage.removeItem(`daily_ward_completions_${todayStr}`);
    setCompletedItems({});
  };

  const saveReminders = (newConfig: PersonalWardConfig) => {
    setReminderConfig(newConfig);
    localStorage.setItem("daily_ward_reminders", JSON.stringify(newConfig));
    triggerNotification("⚙️ تم حفظ مواعيد التذكير", "تم تعديل وحفظ جداول التنبيهات والأذكار لوردك اليومي بنجاح.");
  };

  const triggerNotification = (title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body, icon: "/favicon.ico" });
      } catch (e) {
        // Safe fallback
      }
    }
    setNotificationMsg({ title, body });
    setNotificationActive(true);
    setTimeout(() => {
      setNotificationActive(false);
    }, 5500);
  };

  const testTriggerReminder = (periodKey: "morning" | "afternoon" | "evening" | "night") => {
    const texts = {
      morning: { title: "🌅 تذكير الورد الصباحي", body: "شروق يومك بالخير والبركات! حان الآن موعد تلاوة وردك اليومي الصباحي لتبدأ يومك بحفظ الله." },
      afternoon: { title: "☀️ تذكير الورد النهاري", body: "محطتك الروحية لراحة البال والسكينة! حفل بالاستغفار والاسترخاء مع ورد الظهر المريح." },
      evening: { title: "🌇 تذكير الورد المسائي", body: "أرح قلبك وجسدك بذكر خالقك! حان موعد ورد المساء وأذكار التحصين والبركة." },
      night: { title: "🌃 تذكير الورد الليلي والملأ", body: "قبل الخلود لنوم هانئ، عرج على وردك الليلي وسورة الملك المنجية لسكينة ممتدة." },
    };
    
    const choice = texts[periodKey];
    triggerNotification(choice.title, choice.body);
  };

  // Compute overall progress metrics
  const activeItems = periodWards[selectedPeriod].items;
  const currentProgressSum = activeItems.reduce((acc, item) => acc + Math.min(completedItems[item.id] || 0, item.repeatCount), 0);
  const totalRequiredSum = activeItems.reduce((acc, item) => acc + item.repeatCount, 0);
  const progressPercentage = totalRequiredSum > 0 ? Math.round((currentProgressSum / totalRequiredSum) * 100) : 0;

  return (
    <div className={`flex flex-col h-full p-4 font-sans select-none overflow-y-auto transition-colors ${
      darkMode ? "bg-[#071b29] text-white animate-fade-in" : "bg-white text-slate-900"
    }`}>

      {/* In-app Notification Alert Overlay Banner */}
      {notificationActive && (
        <div className="fixed top-6 left-6 right-6 bg-gradient-to-r from-slate-950 via-[#0a3554] to-slate-900 border-2 border-emerald-500 p-4 rounded-xl shadow-2xl z-[99999] flex items-center justify-between animate-bounce direction-rtl">
          <div className="flex items-start space-x-3 space-x-reverse text-right">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-right">
              <h4 className="text-xs font-bold text-emerald-400">{notificationMsg.title}</h4>
              <p className="text-[11px] text-slate-100 mt-0.5 font-light leading-relaxed">{notificationMsg.body}</p>
            </div>
          </div>
          <button
            onClick={() => setNotificationActive(false)}
            className="text-xs text-slate-400 hover:text-white bg-white/5 px-2.5 py-1 rounded-md shrink-0 mr-3"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Header and Welcome Portion Board */}
      <div className={`rounded-2xl border p-5 shadow-xl relative overflow-hidden mb-6 flex-none text-right ${
        darkMode 
          ? "bg-gradient-to-r from-[#0d3652] to-[#051f30] border-[#cca05a]/30" 
          : "bg-gradient-to-r from-amber-500/10 via-amber-100/20 to-amber-50/5 border-slate-205"
      }`}>
        
        {/* Glowing background Islamic geometric accent */}
        <div className="absolute left-6 top-6 opacity-5 text-8xl">✴</div>

        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1.5 z-10">
            <span className="text-xs text-[#cca05a] tracking-widest block font-bold">الورد اليومي والمنهاج الروحي</span>
            <h2 className={`text-base font-bold flex items-center justify-end space-x-1.5 space-x-reverse ${darkMode ? "text-yellow-100" : "text-slate-800"}`}>
              <span>قرآنك حصنك • منهج الطاعات اليومي</span>
              <BookOpen className="w-5 h-5 text-amber-500" />
            </h2>
            <p className="text-xs text-slate-300 font-light max-w-xl leading-relaxed">
              برنامج قرآني وأذكار مقترحة تتبدل تلقائياً بتغير الوقت لمصاحبة المسلم في سائر أوقاته، لتنال حظاً وافراً من السكينة والصبر والتحصين.
            </p>
          </div>

          {/* Touch interactive streak showcase */}
          <div className="flex flex-col items-center bg-amber-500/10 border border-[#cca05a]/30 px-3.5 py-2.5 rounded-xl text-center shrink-0">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse fill-current" />
            <span className="text-[10px] text-slate-300/80 block mt-1">حبل الطاعة</span>
            <span className="text-xs font-bold text-yellow-300 font-mono">{streakCount} أيام متتالية</span>
          </div>
        </div>

        {/* Real-time indicator of current period */}
        <div className="flex flex-wrap gap-2.5 items-center justify-between border-t border-white/5 mt-4 pt-4 text-xs font-sans text-amber-100/70">
          <div className="flex items-center space-x-1.5 space-x-reverse">
            <Clock className="w-3.5 h-3.5 text-[#cca05a]" />
            <span>الوقت الحالي:</span>
            <span className="font-mono text-white font-bold">{currentTime.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>

          {hasFinishedToday && (
            <div className="flex items-center space-x-1 space-x-reverse bg-emerald-500/10 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-500/20">
              <Award className="w-3.5 h-3.5" />
              <span>أتممت حدك المفروض لليوم! هنيئاً لك</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs navigation for the four periods of the day */}
      <div className="grid grid-cols-4 gap-2 mb-6 text-center select-none" style={{ direction: "rtl" }}>
        {[
          { key: "morning", label: "الصباح", icon: Sunrise },
          { key: "afternoon", label: "الظهيرة", icon: Sun },
          { key: "evening", label: "المساء", icon: Sunset },
          { key: "night", label: "الليل", icon: Moon },
        ].map((period) => {
          const Icon = period.icon;
          const isSelected = selectedPeriod === period.key;
          return (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as any)}
              className={`py-3 px-1.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition duration-300 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-b from-[#cca05a]/25 to-[#cca05a]/5 text-white border-[#cca05a] shadow-lg scale-105 font-bold"
                  : "bg-slate-900/50 text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? "text-[#cca05a]" : "text-slate-400"}`} />
              <span className="text-[10px] whitespace-nowrap">{period.label}</span>
            </button>
          );
        })}
      </div>

      {/* Current selection display board */}
      <div className="bg-[#0b253b] rounded-2xl border border-white/5 p-4 mb-5 flex items-center justify-between gap-3 text-right" style={{ direction: "rtl" }}>
        <div>
          <h3 className="text-xs font-bold text-[#cca05a]">{periodWards[selectedPeriod].title}</h3>
          <p className="text-[10px] text-slate-300/70 mt-0.5 font-light leading-relaxed">{periodWards[selectedPeriod].desc}</p>
        </div>

        {/* Progress Circular Badge / Percent */}
        <div className="flex items-center space-x-2 space-x-reverse shrink-0">
          <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-slate-950/40 border border-white/10 text-center font-mono">
            <span className="text-[11px] font-bold text-amber-200">{progressPercentage}%</span>
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#cca05a]/30 animate-spin-slow pointer-events-none" />
          </div>
        </div>
      </div>

      {/* List of Wards items */}
      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center text-xs text-amber-200/50 mb-1" style={{ direction: "rtl" }}>
          <span>أقسام الورد المطلوبة للتلاوة:</span>
          {progressPercentage > 0 && (
            <button
              onClick={handleReset}
              className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة تصفير العداد لليوم</span>
            </button>
          )}
        </div>

        <div className="space-y-3.5">
          {activeItems.map((item) => {
            const count = completedItems[item.id] || 0;
            const isFinished = count >= item.repeatCount;

            return (
              <div
                key={item.id}
                className={`bg-[#092234] border rounded-xl p-4 transition-all duration-300 flex flex-col ${
                  isFinished
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/5 hover:border-[#cca05a]/20"
                }`}
                style={{ direction: "rtl" }}
              >
                {/* Header item */}
                <div className="flex justify-between items-start gap-3">
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      item.type === "verse" ? "bg-amber-500/10 text-amber-300" : "bg-sky-500/10 text-sky-300"
                    }`}>
                      {item.type === "verse" ? "📖 آية وتدبر" : "📿 ذكر وتثبيت"}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1.5">{item.title}</h4>
                  </div>

                  {/* Increment trigger & Counter display */}
                  <button
                    onClick={() => handleIncrement(item.id, item.repeatCount)}
                    disabled={isFinished}
                    className={`flex items-center justify-center space-x-1.5 space-x-reverse min-w-[70px] py-1 px-2.5 rounded-lg border transition duration-300 cursor-pointer ${
                      isFinished
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold text-[10px]"
                        : "bg-gradient-to-r from-amber-500 to-[#cca05a] hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-[10px] shadow"
                    }`}
                  >
                    {isFinished ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        <span>قرأته</span>
                      </>
                    ) : (
                      <>
                        <span>كرر: {count}/{item.repeatCount}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Main Text Content */}
                <p className="text-[13px] text-yellow-100 font-serif leading-relaxed mt-3 bg-slate-950/20 p-3 rounded-lg border border-white/5 select-text">
                  {item.text}
                </p>

                {/* Reward and references if exists */}
                {item.reward && (
                  <div className="mt-2.5 bg-slate-950/30 px-3 py-2 rounded border border-dashed border-[#cca05a]/10 text-[10px] text-slate-300 leading-normal">
                    <span className="text-amber-200/70 font-bold block mb-0.5">ثواب القراءة وحكمة الورد:</span>
                    {item.reward}
                  </div>
                )}

                {item.source && (
                  <span className="text-[9px] text-slate-300/40 text-left block mt-1">
                    المصدر: {item.source}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ⏰ Custom Reminder setup panel */}
      <div className="bg-[#092234] border border-[#cca05a]/25 p-5 rounded-2xl mt-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/5" style={{ direction: "rtl" }}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs font-bold text-amber-100">مواعيد التذكير التلقائي بالورد</h3>
          </div>

          <button
            onClick={() => {
              const nextVal = !reminderConfig.remindersEnabled;
              const nextObj = { ...reminderConfig, remindersEnabled: nextVal };
              saveReminders(nextObj);
            }}
            className={`p-1 rounded-lg transition ${
              reminderConfig.remindersEnabled ? "bg-amber-400/20 text-[#cca05a]" : "bg-slate-800 text-slate-500"
            }`}
            title="تفعيل/تعطيل كامل منبه الورد"
          >
            {reminderConfig.remindersEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-[11px] text-slate-300 font-light leading-relaxed text-right">
          احرص على أداء طاعتك بحسب الجدول اليومي المفصل. اختر مواعيد التنبيه المناسبة لكل فترة واستمع للاختبار السريع:
        </p>

        {reminderConfig.remindersEnabled && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ direction: "rtl" }}>
            {[
              { id: "morning", name: "المنبه الصباحي", val: reminderConfig.morningTime, setVal: (v: string) => saveReminders({ ...reminderConfig, morningTime: v }) },
              { id: "afternoon", name: "منبه الظهيرة", val: reminderConfig.afternoonTime, setVal: (v: string) => saveReminders({ ...reminderConfig, afternoonTime: v }) },
              { id: "evening", name: "منبه المساء", val: reminderConfig.eveningTime, setVal: (v: string) => saveReminders({ ...reminderConfig, eveningTime: v }) },
              { id: "night", name: "منبه الليل", val: reminderConfig.nightTime, setVal: (v: string) => saveReminders({ ...reminderConfig, nightTime: v }) },
            ].map((reminder) => (
              <div key={reminder.id} className="bg-slate-950/40 p-3 rounded-xl border border-white/5 hover:border-white/10 transition flex flex-col justify-between items-center gap-2">
                <span className="text-[10px] font-bold text-slate-300">{reminder.name}</span>
                <input
                  type="time"
                  value={reminder.val}
                  onChange={(e) => reminder.setVal(e.target.value)}
                  className="bg-slate-900 text-[#cca05a] border border-white/10 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-[#cca05a] font-mono text-center cursor-pointer"
                />
                <button
                  onClick={() => testTriggerReminder(reminder.id as any)}
                  className="w-full text-[9px] text-[#cca05a] bg-stone-900 border border-[#cca05a]/20 hover:bg-[#cca05a]/10 py-1 rounded transition duration-200"
                >
                  🔔 تجربة التنبيه
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#cca05a]/5 p-2.5 rounded-lg border border-white/5 text-[9px] text-slate-400 text-center select-text">
          💡 يمكنك النقر على زر "تجربة التنبيه" ليقوم التطبيق بمحاكاة فورية للإشعار المنبثق لتلك الفترة المحددة للتأكد من فاعلية التنبيهات.
        </div>
      </div>
    </div>
  );
}
