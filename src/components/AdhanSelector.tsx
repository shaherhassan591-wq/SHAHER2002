import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Info, Star, Heading, Sparkles, AlertTriangle, Disc, Sunrise, Sun, CloudSun, Sunset, Moon, Upload, Trash2 } from "lucide-react";
import { muadhinsList } from "../data/islamicData";
import { Muadhin, NotificationSetting } from "../types";
import { isNativeAndroid, playNativeEmbeddedAudio, stopNativeEmbeddedAudio } from "../utils/androidBridge";

export default function AdhanSelector({ darkMode = true }: { darkMode?: boolean }) {
  const [customAdhans, setCustomAdhans] = useState<{ id: string; name: string; dataUrl: string }[]>(() => {
    try {
      const saved = localStorage.getItem("user_custom_sounds");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const customMuadhins: Muadhin[] = customAdhans.map((sound) => ({
    id: sound.id,
    name: `ملف مخصص: ${sound.name}`,
    description: "أذان مخصص تم رفعه واختيار الملف من الهاتف مباشرة للتشغيل الكامل",
    audioUrl: sound.dataUrl,
  }));

  const allMuadhins = [...muadhinsList, ...customMuadhins];

  const [activeMuadhin, setActiveMuadhin] = useState<Muadhin>(() => {
    const initialId = localStorage.getItem("selected_adhan_voice_id") || muadhinsList[0].id;
    return allMuadhins.find(m => m.id === initialId) || muadhinsList[0];
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [silentMode, setSilentMode] = useState<boolean>(() => {
    return localStorage.getItem("silent_mode") === "true";
  });
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => {
    return localStorage.getItem("selected_adhan_voice_id") || muadhinsList[0].id;
  });

  // Prayer-specific Adhan Voice Settings state loaded from localStorage
  const [prayerSettings, setPrayerSettings] = useState<NotificationSetting[]>(() => {
    const defaultData: NotificationSetting[] = [
      { prayerId: "fajr", prayerName: "صلاة الفجر", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "dhuhr", prayerName: "صلاة الظهر", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "asr", prayerName: "صلاة العصر", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "maghrib", prayerName: "صلاة المغرب", enabled: true, adhanVoiceId: "makkah" },
      { prayerId: "isha", prayerName: "صلاة العشاء", enabled: true, adhanVoiceId: "makkah" },
    ];
    const saved = localStorage.getItem("notification_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return defaultData;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentUrlIndex, setCurrentUrlIndex] = useState<number>(0);

  // Backup URLs configuration for each Muadhin voice to bypass downtime
  // First array element is the fully embedded local APK file path.
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

  const getAdhanUrls = (muadhinId: string): string[] => {
    if (muadhinId.startsWith("custom_")) {
      return [activeMuadhin.audioUrl];
    }
    const list = MOHADIN_FALLBACKS[muadhinId] || [];
    if (list.length === 0) {
      return [activeMuadhin.audioUrl];
    }
    const expanded: string[] = [];
    list.forEach(url => {
      if (url.startsWith("http")) {
        // First try playing direct (fast client/browser connection - bypasses server proxy IP filters)
        expanded.push(url);
        // Second try via premium CORS proxy as a backend-mediated fallback
        expanded.push(`/api/proxy-audio?url=${encodeURIComponent(url)}`);
      } else {
        expanded.push(url);
      }
    });
    return expanded;
  };

  const adhanUrls = getAdhanUrls(activeMuadhin.id);
  const currentAudioUrl = adhanUrls[currentUrlIndex] || activeMuadhin.audioUrl;

  useEffect(() => {
    // Reset indices when switching active Muadhin
    setCurrentUrlIndex(0);
    setLoadError(null);
    setIsLoading(false);
  }, [activeMuadhin]);

  useEffect(() => {
    if (localStorage.getItem("silent_mode") === "true") {
      if (isPlaying) {
        setIsPlaying(false);
        setLoadError("الوضع الصامت مفعّل. يرجى تعطيل الوضع الصامت في صفحة التنبيهات لتتمكن من تشغيل الأذان.");
      }
      return;
    }

    // Check if we are running in full local native APK WebView
    if (isNativeAndroid() && !activeMuadhin.id.startsWith("custom_")) {
      if (isPlaying) {
        setIsLoading(true);
        const fileName = `adhan_${activeMuadhin.id}.mp3`;
        console.log(`[AdhanSelector] Playing via native AndroidBridge: ${fileName}`);
        const success = playNativeEmbeddedAudio(fileName);
        if (success) {
          setIsLoading(false);
          setLoadError(null);
        } else {
          setIsLoading(false);
          setLoadError("تم رصد تطبيق أندرويد ولكن تعذر تشغيل الصوت المدمج. يرجى التأكد من حزم ملفات MP3 داخل مجلد assets/www/audio.");
        }
      } else {
        stopNativeEmbeddedAudio();
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(currentAudioUrl);
    audioRef.current = audio;
    audio.preload = "auto";

    const updateProgress = () => {
      setAudioProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setLoadError(null);
    };

    const handleError = (e: any) => {
      console.warn(`Error loading audio url index ${currentUrlIndex}: ${currentAudioUrl}`, e);
      
      const nextIndex = currentUrlIndex + 1;
      if (nextIndex < adhanUrls.length) {
        setIsLoading(true);
        setCurrentUrlIndex(nextIndex);
      } else {
        setIsPlaying(false);
        setIsLoading(false);
        setLoadError("تعذر تشغيل الصوت من جميع الخواديم المتاحة. يرجى التحقق من اتصال الإنترنت أو تجربة مؤذن آخر.");
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("error", handleError);

    if (isPlaying) {
      setIsLoading(true);
      audio.play().catch((err) => {
        console.warn("Play promise rejected directly", err);
        // If play is blocked or rejected, attempt fallback transition
        const nextIndex = currentUrlIndex + 1;
        if (nextIndex < adhanUrls.length) {
          setIsLoading(true);
          setCurrentUrlIndex(nextIndex);
        } else {
          setIsPlaying(false);
          setIsLoading(false);
          setLoadError("فشل تفعيل الصوت بسبب قيود المتصفح أو مشكلة بالشبكة. تفضّل بالنقر على زر التشغيل مجدداً للبدء.");
        }
      });
    }

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, [currentAudioUrl, isPlaying]);

  const toggleSound = () => {
    if (localStorage.getItem("silent_mode") === "true") {
      setLoadError("الوضع الصامت مفعّل. يرجى إيقاف 'الوضع الصامت' في صفحة التنبيهات لتتمكن من تشغيل الأذان.");
      return;
    }
    
    // For Native Android, toggle the play state directly without checking html5 audio ref!
    if (isNativeAndroid() && !activeMuadhin.id.startsWith("custom_")) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setLoadError(null);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn("Failed to play audio directly, checking fallbacks...", err);
          const nextIndex = currentUrlIndex + 1;
          if (nextIndex < adhanUrls.length) {
            setCurrentUrlIndex(nextIndex);
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
            setIsLoading(false);
            setLoadError("عذراً، يمنع المتصفح التشغيل التلقائي قبل التفاعل أولاً، أو أن السيرفر غير مستجيب.");
          }
        });
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setAudioProgress(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const selectAsDefaultAdhan = (id: string) => {
    setSelectedVoiceId(id);
    localStorage.setItem("selected_adhan_voice_id", id);
    
    // Also propagate defaults to all individual prayers for ease of use
    const updated = prayerSettings.map((s) => ({
      ...s,
      adhanVoiceId: id,
    }));
    setPrayerSettings(updated);
    localStorage.setItem("notification_settings", JSON.stringify(updated));
  };

  const handlePrayerVoiceChange = (prayerId: string, voiceId: string) => {
    const updated = prayerSettings.map((s) => {
      if (s.prayerId === prayerId) {
        return { ...s, adhanVoiceId: voiceId };
      }
      return s;
    });
    setPrayerSettings(updated);
    localStorage.setItem("notification_settings", JSON.stringify(updated));
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
      
      const updated = [...customAdhans, newSound];
      setCustomAdhans(updated);
      localStorage.setItem("user_custom_sounds", JSON.stringify(updated));

      const newMuadhin: Muadhin = {
        id: newSound.id,
        name: `ملف مخصص: ${newSound.name}`,
        description: "أذان مخصص تم رفعه واختيار الملف من الهاتف مباشرة للتشغيل الكامل",
        audioUrl: dataUrl,
      };

      setActiveMuadhin(newMuadhin);
      setSelectedVoiceId(newSound.id);
      localStorage.setItem("selected_adhan_voice_id", newSound.id);
      setIsPlaying(false);
      setLoadError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCustomSound = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customAdhans.filter((s) => s.id !== id);
    setCustomAdhans(updated);
    localStorage.setItem("user_custom_sounds", JSON.stringify(updated));

    if (activeMuadhin.id === id) {
      const fallback = muadhinsList[0];
      setActiveMuadhin(fallback);
      setIsPlaying(false);
    }
    if (selectedVoiceId === id) {
      setSelectedVoiceId(muadhinsList[0].id);
      localStorage.setItem("selected_adhan_voice_id", muadhinsList[0].id);
    }

    const updatedPrayerSettings = prayerSettings.map((s) => {
      if (s.adhanVoiceId === id) {
        return { ...s, adhanVoiceId: muadhinsList[0].id };
      }
      return s;
    });
    setPrayerSettings(updatedPrayerSettings);
    localStorage.setItem("notification_settings", JSON.stringify(updatedPrayerSettings));
  };

  const getPrayerIcon = (id: string) => {
    switch (id) {
      case "fajr":
        return <Sunrise className="w-4 h-4 text-amber-300" />;
      case "dhuhr":
        return <Sun className="w-4 h-4 text-yellow-400" />;
      case "asr":
        return <CloudSun className="w-4 h-4 text-orange-200" />;
      case "maghrib":
        return <Sunset className="w-4 h-4 text-orange-400" />;
      case "isha":
        return <Moon className="w-4 h-4 text-sky-300" />;
      default:
        return <Sunrise className="w-4 h-4 text-yellow-300" />;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className={`flex flex-col h-full p-4 font-sans select-none overflow-y-auto transition-colors ${
      darkMode ? "bg-[#071b29] text-white" : "bg-white text-slate-900"
    }`}>
      
      {/* Active Muadhin Custom Interactive Player */}
      <div className={`rounded-2xl border p-5 shadow-xl space-y-5 relative overflow-hidden mb-6 flex-none ${
        darkMode 
          ? "bg-gradient-to-tr from-[#0a2e47] via-[#082236] to-[#04121e] border-[#cca05a]/30 text-white" 
          : "bg-gradient-to-tr from-amber-500/10 via-amber-100/30 to-amber-50/10 border-amber-900/10 text-slate-900"
      }`}>
        
        {/* Animated Vinyl/Disc representing audio */}
        <div className="absolute -left-6 -top-6 opacity-5 pointer-events-none">
          <Disc className={`w-36 h-36 text-amber-300 ${isPlaying ? "animate-spin-slow" : ""}`} />
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          <h2 className={`text-sm font-bold ${darkMode ? "text-amber-200" : "text-amber-900 font-extrabold"}`}>مشغل ومستمع أصوات الأذان</h2>
        </div>

        {/* Info of currently playing */}
        <div className={`p-4 rounded-xl border relative text-right ${
          darkMode ? "bg-slate-950/40 border-[#cca05a]/10" : "bg-white border-amber-900/10 shadow-sm"
        }`} style={{ direction: "rtl" }}>
          <h3 className={`text-sm font-bold text-right mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}>{activeMuadhin.name}</h3>
          <p className={`text-xs leading-relaxed text-right font-light ${darkMode ? "text-slate-300/80" : "text-slate-650"}`}>
            {activeMuadhin.description}
          </p>
          
          {isLoading && (
            <div className="mt-3 flex items-center justify-end space-x-2 space-x-reverse text-amber-300 text-xs animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>جاري الاتصال والتحميل من خادم الصوت (المصدر الحالي: {currentUrlIndex + 1}/{adhanUrls.length})...</span>
            </div>
          )}

          {loadError && (
            <div className="mt-3 p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-red-300 text-xs flex flex-col space-y-1 justify-end items-end text-right">
              <div className="flex items-center space-x-1.5 space-x-reverse justify-end font-bold">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>عثرنا على مشكلة في الاتصال بالسيرفر الأصلي للأذان</span>
              </div>
              <span className="text-[11px] font-light text-slate-300 leading-normal">{loadError}</span>
            </div>
          )}

          {silentMode && (
            <div className="mt-3 p-3 bg-red-950/40 border border-red-500/25 rounded-xl text-red-300 text-[11px] flex items-center justify-end space-x-2 space-x-reverse text-right font-light">
              <span>⚠️</span>
              <span>الوضع الصامت مفعّل حالياً. يرجى تفكيك كتم الصوت وإيقاف 'الوضع الصامت' من صفحة التنبيهات لتتمكن من تشغيل الأذان.</span>
            </div>
          )}

          {!isLoading && !loadError && selectedVoiceId === activeMuadhin.id && (
            <div className="mt-2.5 inline-flex items-center space-x-1 space-x-reverse bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
              <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>صوت الأذان والمنبه الافتراضي الحالي</span>
            </div>
          )}
        </div>

        {/* Range seeker slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={audioDuration || 100}
            value={audioProgress}
            onChange={handleSeekChange}
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#cca05a]"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{formatTime(audioDuration)}</span>
            <span>{formatTime(audioProgress)}</span>
          </div>
        </div>

        {/* Audio controls */}
        <div className="flex items-center justify-between bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
          <button
            onClick={() => selectAsDefaultAdhan(activeMuadhin.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
              selectedVoiceId === activeMuadhin.id
                ? "bg-[#cca05a] text-slate-950 border-transparent shadow"
                : "bg-slate-900 text-[#cca05a]/80 border-[#cca05a]/25 hover:bg-slate-800"
            }`}
          >
            {selectedVoiceId === activeMuadhin.id ? "معتمد كصوت رئيسي" : "تعيين كصوت رئيسي"}
          </button>

          {/* Central Play/Pause Trigger */}
          <button
            onClick={toggleSound}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-[#cca05a] flex items-center justify-center text-slate-950 shadow-lg transform hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-slate-950 fill-slate-950" />
            ) : (
              <Play className="w-6 h-6 text-slate-950 fill-slate-950 ml-0.5" />
            )}
          </button>

          {/* Equalizer Waveform animation */}
          <div className="flex items-end space-x-1 space-x-reverse h-6 w-12 justify-center">
            {isPlaying ? (
              [...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="w-1 bg-[#cca05a] rounded-full animate-pulse"
                  style={{
                    height: Math.random() * 16 + 4 + "px",
                    animationDuration: Math.random() * 0.8 + 0.4 + "s",
                  }}
                />
              ))
            ) : (
              [...Array(5)].map((_, i) => (
                <span key={i} className="w-1 h-1.5 bg-slate-500 rounded-full" />
              ))
            )}
          </div>
        </div>
      </div>

      {/* 🕌 Separate Customization interface for each prayer */}
      <div className="bg-gradient-to-br from-[#0a273c] to-[#051624] rounded-2xl border border-[#cca05a]/25 p-5 shadow-xl space-y-4 mb-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Volume2 className="w-5 h-5 text-[#cca05a] animate-pulse" />
            <h3 className="text-sm font-bold text-amber-100">تخصيص مؤذن منفصل لكل صلاة</h3>
          </div>
          <span className="text-[10px] text-[#cca05a] bg-[#cca05a]/10 px-2.5 py-0.5 rounded-full border border-[#cca05a]/20 font-bold">تفضيلات منوعة</span>
        </div>

        <p className="text-xs text-slate-300 font-light text-right leading-relaxed mb-4">
          يمكنك تحديد مؤذن مختلف لكل صلاة من الصلوات الخمس بشكل منفصل. انقر على اسم المؤذن لتعيينه، أو انقر على رمز التشغيل بجانب كل صلاة للاستماع للصوت المحدد في المشغل أعلاه:
        </p>

        <div className="space-y-3.5">
          {prayerSettings.map((prayer) => {
            const assignedMuadhin = allMuadhins.find(m => m.id === prayer.adhanVoiceId) || muadhinsList[0];
            const isCurrentPlayingAssigned = activeMuadhin.id === assignedMuadhin.id && isPlaying;

            return (
              <div
                key={prayer.prayerId}
                className="bg-slate-950/30 p-3.5 rounded-xl border border-white/5 hover:border-[#cca05a]/20 transition duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right"
                style={{ direction: "rtl" }}
              >
                {/* Right block: Prayer Description & current assigned Muadhin */}
                <div className="flex items-center space-x-3 space-x-reverse justify-start">
                  <div className="w-8 h-8 rounded-lg bg-slate-950/50 flex items-center justify-center border border-white/5 shrink-0">
                    {getPrayerIcon(prayer.prayerId)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{prayer.prayerName}</span>
                    <span className="text-[10px] text-amber-200/70 block mt-0.5 font-light">
                      🔊 مُعيّن حالياً: <span className="text-[#cca05a] font-semibold">{assignedMuadhin.name.replace("ملف مخصص: ", "")}</span>
                    </span>
                  </div>
                </div>

                {/* Left block: Player trigger and chips selectors */}
                <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
                  {/* Selectors */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {allMuadhins.map((m) => {
                      const isSelected = prayer.adhanVoiceId === m.id;
                      let shortName = "مكة 1";
                      if (m.id === "makkah") shortName = "مكة 1";
                      else if (m.id === "abdulbasit") shortName = "عبد الباسط";
                      else if (m.id === "afasy") shortName = "العفاسي";
                      else if (m.id === "aqsa") shortName = "الأقصى";
                      else if (m.id === "makkah_2") shortName = "مكة 2";
                      else {
                        const cleanName = m.name.replace("ملف مخصص: ", "");
                        shortName = cleanName.length > 10 ? cleanName.substring(0, 10) + "..." : cleanName;
                      }

                      return (
                        <button
                          key={m.id}
                          onClick={() => handlePrayerVoiceChange(prayer.prayerId, m.id)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition duration-200 cursor-pointer font-bold ${
                            isSelected
                              ? "bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 font-extrabold border-transparent shadow"
                              : "bg-slate-900 border-white/5 text-slate-300 hover:text-white"
                          }`}
                        >
                          {shortName}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick listen button */}
                  <button
                    onClick={() => {
                      setActiveMuadhin(assignedMuadhin);
                      if (activeMuadhin.id === assignedMuadhin.id) {
                        toggleSound();
                      } else {
                        setIsPlaying(true);
                      }
                    }}
                    className={`p-1.5 rounded-full border transition flex items-center justify-center cursor-pointer shrink-0 ${
                      isCurrentPlayingAssigned
                        ? "bg-red-500/20 border-red-500/30 text-red-400"
                        : "bg-[#cca05a]/10 border-[#cca05a]/20 text-[#cca05a] hover:bg-[#cca05a]/20"
                    }`}
                    title="استماع لصوت هذه الصلاة"
                  >
                    {isCurrentPlayingAssigned ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📥 Upload Adhan from local phone files section (تخصيص صوت) */}
      <div className={`rounded-xl border p-5 text-right mb-6 transition-all duration-300 ${
        darkMode 
          ? "bg-[#0b2438] border-[#cca05a]/40 hover:border-[#cca05a]/80" 
          : "bg-amber-500/5 border-amber-900/20 hover:border-amber-900/40"
      }`} style={{ direction: "rtl" }}>
        <div className="flex items-center space-x-2 space-x-reverse justify-start mb-2">
          <Upload className="w-4 h-4 text-[#cca05a]" />
          <h4 className="text-xs font-bold text-amber-200">تخصيص صوت للأذان والمنبهات</h4>
        </div>
        <p className="text-[10px] text-slate-300/85 mb-3.5 leading-relaxed">
          يمكنك الآن تخصيص صوت الأذان ورفع ملفك الصوتي المفضل بصوتك أو صوت مؤذن تختاره من هاتفك المحمول ليعمل بالكامل كتنبيه رئيسي. يدعم صيغ MP3 و WAV و M4A بحجم أقصى 15 ميجابايت.
        </p>
        
        <input
          type="file"
          id="adhan-phone-file-uploader"
          accept="audio/*"
          onChange={handleCustomAudioUpload}
          className="hidden"
        />
        
        <label
          htmlFor="adhan-phone-file-uploader"
          className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-gradient-to-r from-amber-500/20 to-[#cca05a]/35 hover:from-amber-600/40 text-white border border-[#cca05a] rounded-xl py-3 text-xs font-extrabold cursor-pointer transition active:scale-95 shadow-md"
        >
          <span>📁 تخصيص صوت (رفع ملف من جهازك)</span>
        </label>
      </div>

      {/* Muadhins Inventory list */}
      <div className="space-y-4 flex-1">
        <span className={`text-xs block text-right ${darkMode ? "text-amber-200/50" : "text-slate-500 font-medium"}`}>أصوات الأذان المتوفرة بالمكتبة:</span>
        
        <div className="space-y-3">
          {allMuadhins.map((m) => {
            const isActive = activeMuadhin.id === m.id;
            const isMainVoice = selectedVoiceId === m.id;
            const isCustom = m.id.startsWith("custom_");
            
            return (
              <div
                key={m.id}
                onClick={() => {
                  setActiveMuadhin(m);
                  if (!isActive) setIsPlaying(false);
                }}
                className={`rounded-xl border p-4 transition-all duration-300 cursor-pointer flex justify-between items-center ${
                  isActive
                    ? darkMode ? "border-[#cca05a] bg-[#0c2f46]" : "border-[#cca05a] bg-amber-500/10 shadow-sm"
                    : darkMode ? "bg-[#0a2334] border-white/5 hover:border-[#cca05a]/30" : "bg-slate-50 border-slate-200 hover:border-[#cca05a]/30"
                }`}
              >
                {/* Check icon/Star badge */}
                <div className="flex items-center space-x-2">
                  {isCustom && (
                    <button
                      onClick={(e) => handleDeleteCustomSound(m.id, e)}
                      className="p-1 px-1.5 hover:bg-red-500/20 text-red-400 rounded transition cursor-pointer"
                      title="حذف الملف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isMainVoice && (
                    <span className="bg-amber-500/10 text-amber-655 border border-amber-500/20 rounded-full px-2 py-0.5 text-[9px] font-bold">
                      افتراضي
                    </span>
                  )}
                  {isActive && isPlaying && (
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  )}
                </div>

                {/* Text details */}
                <div className="text-right space-y-1">
                  <h4 className={`text-xs font-bold ${isActive ? "text-[#cca05a]" : darkMode ? "text-white" : "text-slate-800"}`}>
                    {m.name}
                  </h4>
                  <p className={`text-[10px] max-w-[200px] line-clamp-1 italic ${darkMode ? "text-slate-300/60" : "text-slate-500"}`}>
                    {m.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informative Guidance Banner */}
      <div className={`mt-6 p-3 rounded-xl border text-right space-y-1 ${
        darkMode ? "bg-[#cca05a]/5 border-[#cca05a]/10" : "bg-amber-500/5 border-amber-900/10"
      }`}>
        <div className="flex items-center justify-end space-x-1 space-x-reverse text-amber-500 text-xs font-bold">
          <Info className="w-4 h-4 text-amber-500" />
          <span className="font-bold">فائدة الأذان والذكر:</span>
        </div>
        <p className={`text-[10px] leading-relaxed font-light ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
          إذا اخترت أحد المؤذنين كصوت رئيسي، سيقوم التطبيق ببدء تنبيه الأذان بهذا الصوت المحدد تلقائياً عند قدوم موعد الصلاة من أجل تذكيرك بالعبادة في وقتها.
        </p>
      </div>

      {/* 📱 LOCAL PLAYBACK & APK INTEGRATION RESOURCE */}
      <div className={`mt-4 p-4 rounded-xl border text-right space-y-3 ${
        darkMode ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-900"
      }`} style={{ direction: "rtl" }}>
        <div className="flex items-center space-x-1.5 space-x-reverse justify-start">
          <span className="text-base">📱</span>
          <h4 className="text-xs font-bold">بث الأذان المحلي بالكامل (Offline APK Audio Playback)</h4>
        </div>
        <p className="text-[10px] leading-relaxed font-light">
          لتفادي مشكلة <strong>قيود التشغيل التلقائي (Autoplay restrictions)</strong> وقطع اتصال السيرفر بالكامل في الأندرويد، يعتمد التطبيق الآن على <strong>نظام تشغيل صوتي مدمج محلي (ExoPlayer/MediaPlayer)</strong>.
        </p>
        <ul className="text-[9px] list-disc list-inside space-y-1 opacity-90 leading-relaxed">
          <li><strong>بدون إنترنت:</strong> يتم تشغيل الأذان محلياً ومباشرة من الـ Storage عند وضع ملف الأذان باسم <code>adhan_makkah.mp3</code> في مجلق <code>assets</code> أو <code>res/raw</code> داخل الـ APK.</li>
          <li><strong>توافق تام:</strong> يتجاوز هذا الأسلوب المحلي أي حظر من متصفح الويب أو الـ WebView لتشغيل الأصوات تلقائياً في الخلفية.</li>
        </ul>
      </div>
    </div>
  );
}
