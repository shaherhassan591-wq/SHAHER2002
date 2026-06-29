import React from "react";
import { Volume2, Clock, BellOff, Play, Square, DownloadCloud, Loader2 } from "lucide-react";

interface Muadhin {
  id: string;
  nameAr: string;
  nameEn: string;
}

interface CustomAdhan {
  id: string;
  name: string;
}

interface PrayerSetting {
  prayerId: string;
  prayerName: string;
  adhanVoiceId: string;
}

interface SoundsSettingsTabProps {
  darkMode: boolean;
  isAr: boolean;
  t: (key: string) => string;
  toArabicNumerals: (num: number) => string;
  
  // Pre-prayer reminder
  prePrayerPrepEnabled: boolean;
  prePrayerPrepTime: number;
  togglePrePrayerPrep: () => void;
  handlePrePrayerPrepTimeChange: (mins: number) => void;

  // DND Mode
  dndModeEnabled: boolean;
  toggleDndMode: () => void;

  // Smart volume & sliders
  smartVolumeEnabled: boolean;
  toggleSmartVolume: () => void;
  selectedMaxVolume: number;
  handleMaxVolumeChange: (vol: number) => void;

  // Tap sounds
  tapSoundsEnabled: boolean;
  toggleTapSounds: () => void;

  // Adhan assignments
  prayerSettings: PrayerSetting[];
  previewingVoiceId: string | null;
  playVoicePreview: (voiceId: string) => void;
  handlePrayerVoiceChange: (prayerId: string, voiceId: string) => void;
  customAdhans: CustomAdhan[];

  // Offline Download sections
  prophetCached: boolean;
  prophetStatusMsg: string;
  downloadingProphet: boolean;
  handleDownloadProphetVoice: () => void;
  adhanCachedCount: number;
  muadhinsList: Muadhin[];
  adhanStatusMsg: string;
  downloadingAdhans: boolean;
  adhanProgress: number;
  handleDownloadAllAdhans: () => void;
}

export const SoundsSettingsTab: React.FC<SoundsSettingsTabProps> = ({
  darkMode,
  isAr,
  t,
  toArabicNumerals,
  prePrayerPrepEnabled,
  prePrayerPrepTime,
  togglePrePrayerPrep,
  handlePrePrayerPrepTimeChange,
  dndModeEnabled,
  toggleDndMode,
  smartVolumeEnabled,
  toggleSmartVolume,
  selectedMaxVolume,
  handleMaxVolumeChange,
  tapSoundsEnabled,
  toggleTapSounds,
  prayerSettings,
  previewingVoiceId,
  playVoicePreview,
  handlePrayerVoiceChange,
  customAdhans,

  // Offline cache properties
  prophetCached,
  prophetStatusMsg,
  downloadingProphet,
  handleDownloadProphetVoice,
  adhanCachedCount,
  muadhinsList,
  adhanStatusMsg,
  downloadingAdhans,
  adhanProgress,
  handleDownloadAllAdhans
}) => {
  return (
    <div className="space-y-6">
      
      {/* 🕌 ADHAN VOICE CUSTOMIZATION & PRE-PRAYER PREP REMINDER CARD */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-5 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">
            {isAr ? "🕌 أصوات الأذان وتنبيهات الاستعداد" : "🕌 Adhan Sounds & Preparation"}
          </span>
          <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
        </div>

        <p className="text-[11px] text-slate-400 font-light leading-relaxed text-right">
          {isAr 
            ? "قم بتخصيص صوت مؤذن منفصل لكل صلاة من الصلوات الخمس ليصدح به جهازك، بالإضافة لتفعيل التنبيه المسبق وتخصيص المدة للاستعداد والطمأنينة."
            : "Assign a unique muadhin to each of the five daily prayers, and enable the customizable prep alarm to get ready before the adhan."}
        </p>

        {/* Customizable pre-prayer reminder section */}
        <div className={`p-4 rounded-xl border flex flex-col space-y-3.5 ${
          darkMode ? "bg-slate-950/20 border-white/5" : "bg-amber-50/40 border-amber-900/10"
        }`}>
          <div className="flex justify-between items-center w-full" style={{ direction: "rtl" }}>
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                darkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-500/20 text-amber-700"
              }`}>
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold block ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                  {isAr ? `التنبيه المسبق بـ ${toArabicNumerals(prePrayerPrepTime)} دقائق` : `${prePrayerPrepTime}-Minute Pre-Prayer Reminder`}
                </span>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                  {isAr ? "تذكير بالوضوء والأذكار قبل نداء الصلاة الفعلي" : "Reminder to make Wudu and sit with dhikr before adhan"}
                </p>
              </div>
            </div>

            <button
              onClick={togglePrePrayerPrep}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                prePrayerPrepEnabled ? "bg-[#cca05a]" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${
                  prePrayerPrepEnabled ? "left-0.5" : "left-6.5"
                }`}
                style={{
                  transform: prePrayerPrepEnabled ? 'translateX(24px)' : 'translateX(0px)'
                }}
              />
            </button>
          </div>

          {prePrayerPrepEnabled && (
            <div className="pt-3 border-t border-dashed border-[#cca05a]/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-right" style={{ direction: "rtl" }}>
              <span className={`text-[10px] font-bold shrink-0 ${darkMode ? "text-amber-200/80" : "text-amber-800"}`}>
                {isAr ? "اختر مدة التنبيه قبل الأذان:" : "Choose alert time before Adhan:"}
              </span>
              <div className="flex flex-wrap items-center gap-1.5 justify-end">
                {[5, 10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handlePrePrayerPrepTimeChange(mins)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
                      prePrayerPrepTime === mins
                        ? "bg-[#cca05a] text-slate-950 border-[#cca05a] shadow-[0_0_10px_rgba(204,160,90,0.3)] font-extrabold"
                        : darkMode
                        ? "bg-slate-950/40 text-slate-400 border-white/5 hover:border-[#cca05a]/40"
                        : "bg-white text-slate-600 border-amber-900/10 hover:border-[#cca05a]"
                    }`}
                  >
                    {toArabicNumerals(mins)} {isAr ? "دقائق" : "mins"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 🔕 Do Not Disturb (DND) Mode Toggle Section */}
        <div className={`p-4 rounded-xl border flex flex-col space-y-3.5 ${
          darkMode ? "bg-slate-950/20 border-white/5" : "bg-amber-50/40 border-amber-900/10"
        }`}>
          <div className="flex justify-between items-center w-full" style={{ direction: "rtl" }}>
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                darkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-500/20 text-amber-700"
              }`}>
                <BellOff className="w-4.5 h-4.5" />
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold block ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                  {isAr ? "وضع عدم الإزعاج المؤقت (DND)" : "Do Not Disturb Mode"}
                </span>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                  {isAr 
                    ? "كتم كافة تنبيهات الأذان والصلوات مؤقتاً دون تعطيل الأذكار والآيات" 
                    : "Mute all Adhan & prayer alarms temporarily without muting Athkar"}
                </p>
              </div>
            </div>

            <button
              onClick={toggleDndMode}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                dndModeEnabled ? "bg-[#cca05a]" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${
                  dndModeEnabled ? "left-0.5" : "left-6.5"
                }`}
                style={{
                  transform: dndModeEnabled ? 'translateX(24px)' : 'translateX(0px)'
                }}
              />
            </button>
          </div>
        </div>

        {/* 🔊 Smart Adhan Volume (Gradual Volume) Toggle & Slider Section */}
        <div className={`p-4 rounded-xl border flex flex-col space-y-3.5 ${
          darkMode ? "bg-slate-950/20 border-white/5" : "bg-amber-50/40 border-amber-900/10"
        }`}>
          <div className="flex justify-between items-center w-full" style={{ direction: "rtl" }}>
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                darkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-500/20 text-amber-700"
              }`}>
                <Volume2 className="w-4.5 h-4.5" />
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold block ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                  {isAr ? "الصوت التدريجي للأذان (الذكي)" : "Smart Adhan Volume"}
                </span>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                  {isAr 
                    ? "ارتفاع تدريجي هادئ للصوت لتجنب الإزعاج (خصوصاً صلاة الفجر)" 
                    : "Gradually increases Adhan volume from 0 to target level"}
                </p>
              </div>
            </div>

            <button
              onClick={toggleSmartVolume}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                smartVolumeEnabled ? "bg-[#cca05a]" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${
                  smartVolumeEnabled ? "left-0.5" : "left-6.5"
                }`}
                style={{
                  transform: smartVolumeEnabled ? 'translateX(24px)' : 'translateX(0px)'
                }}
              />
            </button>
          </div>

          {/* Volume Level Control */}
          <div className="pt-3 border-t border-dashed border-[#cca05a]/25 flex flex-col space-y-2 text-right" style={{ direction: "rtl" }}>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-bold ${darkMode ? "text-amber-200/80" : "text-amber-800"}`}>
                {isAr ? "مستوى الصوت الأقصى المستهدف:" : "Target Maximum Volume:"}
              </span>
              <span className="text-xs font-mono font-bold text-amber-500">
                {toArabicNumerals(selectedMaxVolume)}%
              </span>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={selectedMaxVolume}
                onChange={(e) => handleMaxVolumeChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-[#cca05a]"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5 justify-end mt-1">
              {[30, 50, 70, 90, 100].map((vol) => (
                <button
                  key={vol}
                  onClick={() => handleMaxVolumeChange(vol)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedMaxVolume === vol
                      ? "bg-[#cca05a] text-slate-950 border-[#cca05a] shadow-[0_0_8px_rgba(204,160,90,0.3)] font-extrabold"
                      : darkMode
                      ? "bg-slate-950/40 text-slate-400 border-white/5 hover:border-[#cca05a]/40"
                      : "bg-white text-slate-600 border-amber-900/10 hover:border-[#cca05a]"
                  }`}
                >
                  {toArabicNumerals(vol)}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 🔊 Tap sounds toggle */}
        <div className={`p-4 rounded-xl border flex justify-between items-center ${
          darkMode ? "bg-slate-950/20 border-white/5" : "bg-amber-50/40 border-amber-900/10"
        }`}>
          <button
            onClick={toggleTapSounds}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
              tapSoundsEnabled ? "bg-[#cca05a]" : "bg-slate-800"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${
                tapSoundsEnabled ? "left-0.5" : "left-6.5"
              }`}
              style={{
                transform: tapSoundsEnabled ? 'translateX(24px)' : 'translateX(0px)'
              }}
            />
          </button>

          <div className="flex items-center space-x-3 space-x-reverse text-right">
            <div className="text-right">
              <span className={`text-xs font-bold block ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                {isAr ? "صوت نقرات التطبيق" : "App Tap Sounds"}
              </span>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                {isAr ? "تشغيل صوت نقر لطيف وهادئ عند الضغط على الأزرار" : "Play a gentle organic click sound when pressing buttons"}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              darkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-500/20 text-amber-700"
            }`}>
              <Volume2 className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        {/* Custom Muadhin Per-Prayer List */}
        <div className="space-y-3.5">
          <div className="flex justify-between items-center text-xs font-bold text-amber-400/80" style={{ direction: "rtl" }}>
            <span>{isAr ? "صوت الأذان المخصص" : "Assigned Adhan Voice"}</span>
            <span>{isAr ? "الفريضة" : "Prayer"}</span>
          </div>

          <div className="space-y-3">
            {prayerSettings.map((s) => {
              const currentVoiceId = s.adhanVoiceId || "makkah";
              const isPlaying = previewingVoiceId === currentVoiceId;
              
              return (
                <div
                  key={s.prayerId}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-3 transition ${
                    darkMode ? "bg-slate-950/20 border-white/5 hover:border-[#cca05a]/20" : "bg-slate-50 border-amber-900/5 hover:border-amber-500/20"
                  }`}
                  style={{ direction: "rtl" }}
                >
                  {/* Left Controls: Select voice and play preview */}
                  <div className="flex items-center space-x-2 space-x-reverse w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      onClick={() => playVoicePreview(currentVoiceId)}
                      className={`p-2 rounded-lg transition shrink-0 cursor-pointer ${
                        isPlaying
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : darkMode
                          ? "bg-slate-900 hover:bg-slate-800 text-amber-400"
                          : "bg-amber-100 hover:bg-amber-200 text-amber-800"
                      }`}
                      title={isAr ? "استماع لمعاينة صوت الأذان" : "Preview Voice"}
                    >
                      {isPlaying ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>

                    <select
                      value={currentVoiceId}
                      onChange={(e) => handlePrayerVoiceChange(s.prayerId, e.target.value)}
                      className={`text-xs rounded-xl px-2.5 py-1.5 font-bold cursor-pointer outline-none transition border max-w-[200px] ${
                        darkMode
                          ? "bg-[#04121e] border-white/10 text-white focus:border-[#cca05a]"
                          : "bg-white border-amber-950/15 text-slate-900 focus:border-amber-500"
                      }`}
                    >
                      <option value="makkah">{isAr ? "أذان الحرم المكي (1)" : "Makkah Adhan (1)"}</option>
                      <option value="abdulbasit">{isAr ? "أذان الشيخ عبد الباسط عبد الصمد" : "Sheikh Abdulbasit"}</option>
                      <option value="afasy">{isAr ? "أذان الشيخ مشاري العفاسي" : "Sheikh Al-Afasy"}</option>
                      <option value="aqsa">{isAr ? "أذان المسجد الأقصى المبارك" : "Al-Aqsa Adhan"}</option>
                      <option value="makkah_2">{isAr ? "أذان الحرم المكي (2)" : "Makkah Adhan (2)"}</option>
                      {customAdhans.map((custom) => (
                        <option key={custom.id} value={custom.id}>
                          {isAr ? `ملف مخصص: ${custom.name}` : `Custom: ${custom.name}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Right Detail: Prayer name and indicator */}
                  <div className="flex items-center space-x-2.5 space-x-reverse self-end sm:self-auto">
                    <div className="text-right">
                      <span className={`text-xs font-bold block ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                        {s.prayerName || (isAr ? s.prayerId : s.prayerId)}
                      </span>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      s.prayerId === "fajr" ? "bg-sky-400" :
                      s.prayerId === "dhuhr" ? "bg-amber-400" :
                      s.prayerId === "asr" ? "bg-orange-400" :
                      s.prayerId === "maghrib" ? "bg-rose-400" : "bg-indigo-400"
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📥 OFFLINE RESOURCES MANAGER CARD (Download files) */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">
            {isAr ? "موارد التطبيق للعمل بدون إنترنت" : "App Resources for Offline Work"}
          </span>
          <DownloadCloud className="w-4 h-4 text-amber-500 shrink-0" />
        </div>
        <p className="text-[11px] text-slate-400 font-light leading-relaxed text-right">
          {isAr 
            ? "قم بتحميل وحفظ المقاطع الصوتية مباشرة إلى الذاكرة الدائمة لهاتفك لتشغيل الأذان وتنبيهات الأذكار والصلاة على النبي بالكامل حتى أثناء انقطاع اتصالك بالإنترنت."
            : "Download and save audio files directly to your persistent offline memory. This guarantees fully functioning Adhan and Athkar voice alerts even in offline or airplane mode."}
        </p>

        <div className="space-y-3 pt-2">
          {/* Prophet blessing section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 rounded-xl bg-slate-950/25 border border-white/5 gap-2 text-right" style={{ direction: "rtl" }}>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-200">
                {isAr ? "صوت التذكير بالصلاة على النبي الشريف" : "Prophet Sallou Alayh Audio"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {prophetCached 
                  ? (isAr ? "🟢 جاهز ومحفوظ بالكامل أوفلاين" : "🟢 Fully cached offline")
                  : (isAr ? "🔴 غير محفوظ (سيتم البث أونلاين فقط)" : "🔴 Not cached (will stream online)")}
              </span>
              {prophetStatusMsg && (
                <span className="text-[10px] text-amber-400 mt-1 font-bold">
                  {prophetStatusMsg}
                </span>
              )}
            </div>
            <button
              disabled={downloadingProphet}
              onClick={handleDownloadProphetVoice}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                prophetCached 
                  ? "bg-slate-800 text-[#cca05a] border border-[#cca05a]/30 hover:bg-slate-900" 
                  : "bg-[#cca05a] text-slate-950 hover:bg-amber-400"
              }`}
            >
              {downloadingProphet ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <DownloadCloud className="w-3.5 h-3.5" />
              )}
              <span>
                {prophetCached 
                  ? (isAr ? "تحديث التحميل" : "Update Cache") 
                  : (isAr ? "تحميل للعمل أوفلاين" : "Download Offline")}
              </span>
            </button>
          </div>

          {/* Adhan section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 rounded-xl bg-slate-950/25 border border-white/5 gap-2 text-right" style={{ direction: "rtl" }}>
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-amber-200">
                {isAr ? "ملفات الأذان الكاملة لجميع المؤذنين" : "All Muadhins Full Adhan MP3s"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {isAr 
                  ? `🟢 تم حفظ ${adhanCachedCount} من أصل ${muadhinsList.length} أذان كامل`
                  : `🟢 Cached ${adhanCachedCount} of ${muadhinsList.length} Adhan files`}
              </span>
              {adhanStatusMsg && (
                <span className="text-[10px] text-amber-400 mt-1 font-bold">
                  {adhanStatusMsg}
                </span>
              )}
            </div>
            <button
              disabled={downloadingAdhans}
              onClick={handleDownloadAllAdhans}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                adhanCachedCount === muadhinsList.length 
                  ? "bg-slate-800 text-[#cca05a] border border-[#cca05a]/30 hover:bg-slate-900" 
                  : "bg-[#cca05a] text-slate-950 hover:bg-amber-400"
              }`}
            >
              {downloadingAdhans ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{adhanProgress}%</span>
                </div>
              ) : (
                <DownloadCloud className="w-3.5 h-3.5" />
              )}
              <span>
                {adhanCachedCount === muadhinsList.length 
                  ? (isAr ? "إعادة تحميل الكل" : "Re-download All") 
                  : (isAr ? "تحميل كافة الأذانات" : "Download All Adhans")}
              </span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
