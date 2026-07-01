import React from "react";
import { MapPin, Navigation, CheckCircle2, Loader2, Clock } from "lucide-react";
import { EGYPT_GOVERNORATES } from "../../data/egyptLocations";

interface PrayerSettingsTabProps {
  darkMode: boolean;
  isAr: boolean;
  t: (key: string) => string;
  calcType: string;
  handleUpdateCalcType: (type: string) => void;
  selectedCity: string;
  handleUpdateCity: (cityId: string) => void;
  CITIES: Array<{ id: string; nameAr: string; nameEn: string; lat: number; lng: number; timezone: number }>;
  METHODS: Array<{ id: string; nameAr: string; nameEn: string; fajrAngle: number; ishaAngle: number }>;
  gpsLocation: { lat: number | null; lng: number | null; name: string; timezone?: number };
  gpsLoading: boolean;
  gpsError: string | null;
  handleFetchGPS: () => void;
  calcMethod: string;
  handleUpdateMethod: (methodId: string) => void;
  asrJuristic: string;
  handleUpdateAsrJuristic: (juristic: string) => void;

  // Manual Adjustments
  manualPrayerTimesMode: boolean;
  manualPrayerTimes: Record<string, string>;
  handleToggleManualMode: (enabled: boolean) => void;
  handleUpdateManualPrayerTime: (key: string, value: string) => void;
  handleSaveManualCoords?: (lat: number, lng: number, name: string, timezone: number) => void;
}

export const PrayerSettingsTab: React.FC<PrayerSettingsTabProps> = ({
  darkMode,
  isAr,
  t,
  calcType,
  handleUpdateCalcType,
  selectedCity,
  handleUpdateCity,
  CITIES,
  METHODS,
  gpsLocation,
  gpsLoading,
  gpsError,
  handleFetchGPS,
  calcMethod,
  handleUpdateMethod,
  asrJuristic,
  handleUpdateAsrJuristic,

  manualPrayerTimesMode,
  manualPrayerTimes,
  handleToggleManualMode,
  handleUpdateManualPrayerTime,
  handleSaveManualCoords
}) => {
  const [showManualInputs, setShowManualInputs] = React.useState(false);
  const [manualLat, setManualLat] = React.useState(String(gpsLocation.lat || "24.7136"));
  const [manualLng, setManualLng] = React.useState(String(gpsLocation.lng || "46.6753"));
  const [manualTz, setManualTz] = React.useState(String(gpsLocation.timezone || "3"));
  const [manualName, setManualName] = React.useState(gpsLocation.name || (isAr ? "موقعي اليدوي" : "My Manual Coordinates"));
  const [manualSaveSuccess, setManualSaveSuccess] = React.useState(false);

  // States for Egypt Manual Selection
  const [selectedRegion, setSelectedRegion] = React.useState<"global" | "egypt">(() => {
    if (gpsLocation.name && (gpsLocation.name.includes("مصر") || gpsLocation.name.includes("Egypt") || gpsLocation.name.includes("Cairo") || gpsLocation.name.includes("القاهرة"))) {
      return "egypt";
    }
    return "global";
  });

  const [selectedGovId, setSelectedGovId] = React.useState<string>(() => {
    if (gpsLocation.name) {
      const foundGov = EGYPT_GOVERNORATES.find(gov => gpsLocation.name.includes(gov.nameAr) || gpsLocation.name.includes(gov.nameEn));
      if (foundGov) return foundGov.id;
    }
    return "cairo";
  });

  const activeGov = EGYPT_GOVERNORATES.find(gov => gov.id === selectedGovId) || EGYPT_GOVERNORATES[0];

  const [selectedCenterId, setSelectedCenterId] = React.useState<string>(() => {
    if (gpsLocation.name) {
      const foundGov = EGYPT_GOVERNORATES.find(gov => gpsLocation.name.includes(gov.nameAr) || gpsLocation.name.includes(gov.nameEn));
      if (foundGov) {
        const foundCenter = foundGov.centers.find(c => gpsLocation.name.includes(c.nameAr) || gpsLocation.name.includes(c.nameEn));
        if (foundCenter) return foundCenter.id;
      }
    }
    return activeGov.centers[0]?.id || "";
  });

  const handleGovChange = (govId: string) => {
    setSelectedGovId(govId);
    const gov = EGYPT_GOVERNORATES.find(g => g.id === govId);
    if (gov && gov.centers.length > 0) {
      setSelectedCenterId(gov.centers[0].id);
    }
  };

  const onApplyEgyptCenter = () => {
    const gov = EGYPT_GOVERNORATES.find(g => g.id === selectedGovId);
    const center = gov?.centers.find(c => c.id === selectedCenterId);
    if (gov && center && handleSaveManualCoords) {
      const fullName = `مصر، ${gov.nameAr}، ${center.nameAr}`;
      const timezone = new Date().getTimezoneOffset() / -60;
      
      // Save manual coords as Custom Location
      handleSaveManualCoords(center.lat, center.lng, fullName, timezone);
      
      // Switch calculation type to coordinate-based GPS calculation
      handleUpdateCalcType("gps");
      
      // Set calculation method to Egypt Survey Authority (الهيئة المصرية العامة للمساحة)
      handleUpdateMethod("egypt");
      
      setManualSaveSuccess(true);
      setTimeout(() => setManualSaveSuccess(false), 4000);
    }
  };

  const onSaveManual = () => {
    const latNum = parseFloat(manualLat);
    const lngNum = parseFloat(manualLng);
    const tzNum = parseFloat(manualTz);
    if (!isNaN(latNum) && !isNaN(lngNum) && !isNaN(tzNum) && handleSaveManualCoords) {
      handleSaveManualCoords(latNum, lngNum, manualName, tzNum);
      setManualSaveSuccess(true);
      setTimeout(() => setManualSaveSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 🧭 PRAYER TIMES LOCATION & CALCULATION METHOD CARD */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-5 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">
            {isAr ? "🧭 ضبط مواقيت الصلاة والموقع" : "🧭 Prayer Times & Location Settings"}
          </span>
          <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
        </div>

        <p className="text-[11px] text-slate-400 font-light leading-relaxed text-right" style={{ direction: "rtl" }}>
          {isAr 
            ? "قم بضبط مدينتك الحالية يدوياً أو دع التطبيق يحدد إحداثياتك بدقة عبر الـ GPS لحساب مواقيت الصلاة الشرعية لليوم والمستقبل تلقائياً وفق أدق المعايير الفلكية."
            : "Set your city manually or allow GPS tracking to calculate precise religious prayer times automatically based on recognized astronomical methods."}
        </p>

        {/* Location Type Toggles */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/20 border border-white/5" style={{ direction: "rtl" }}>
          <button
            onClick={() => handleUpdateCalcType("city")}
            className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              calcType === "city"
                ? "bg-[#cca05a] text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {isAr ? "📍 اختيار مدينة" : "📍 Select City"}
          </button>
          <button
            onClick={() => handleUpdateCalcType("gps")}
            className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              calcType === "gps"
                ? "bg-[#cca05a] text-slate-950 shadow-md font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {isAr ? "🛰️ تحديد عبر الموقع (GPS)" : "🛰️ Auto GPS Location"}
          </button>
        </div>

        {/* 1. Manual City Selection Panel */}
        {calcType === "city" ? (
          <div className="space-y-4" style={{ direction: "rtl" }}>
            <div className="flex gap-2 p-0.5 rounded-lg bg-slate-950/20 border border-white/5 justify-end">
              <button
                type="button"
                onClick={() => setSelectedRegion("egypt")}
                className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-md transition duration-200 cursor-pointer ${
                  selectedRegion === "egypt"
                    ? "bg-amber-400 text-slate-950 shadow font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🇪🇬 {isAr ? "محافظات ومراكز مصر" : "Egypt Governorates"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion("global")}
                className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-md transition duration-200 cursor-pointer ${
                  selectedRegion === "global"
                    ? "bg-amber-400 text-slate-950 shadow font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🌍 {isAr ? "مدن وعواصم عالمية" : "Global Cities"}
              </button>
            </div>

            {selectedRegion === "global" ? (
              <div className="space-y-3 text-right">
                <span className="text-[10px] text-slate-400 block font-bold">
                  {isAr ? "اختر المدينة الحالية:" : "Select Current City:"}
                </span>
                <select
                  value={selectedCity}
                  onChange={(e) => handleUpdateCity(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-xl border outline-none focus:border-[#cca05a] transition-all cursor-pointer ${
                    darkMode ? "bg-slate-950/60 border-white/5 text-slate-100" : "bg-white border-amber-950/15 text-slate-900"
                  }`}
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id} className={darkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"}>
                      {isAr ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>

                {/* Quick Access City Chips */}
                <div className="flex flex-wrap gap-1.5 justify-start mt-2">
                  {[
                    { id: "mecca", nameAr: "🕋 مكة", nameEn: "Mecca" },
                    { id: "madinah", nameAr: "🕌 المدينة", nameEn: "Medina" },
                    { id: "riyadh", nameAr: "🇸🇦 الرياض", nameEn: "Riyadh" },
                    { id: "cairo", nameAr: "🇪🇬 القاهرة", nameEn: "Cairo" },
                    { id: "jerusalem", nameAr: "🇵🇸 القدس", nameEn: "Jerusalem" }
                  ].map((quick) => (
                    <button
                      key={quick.id}
                      onClick={() => handleUpdateCity(quick.id)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
                        selectedCity === quick.id
                          ? "bg-[#cca05a]/25 text-amber-200 border-[#cca05a]"
                          : "bg-slate-950/30 text-slate-400 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {isAr ? quick.nameAr : quick.nameEn}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-right">
                <p className="text-[10px] text-amber-200/80 leading-relaxed font-bold border-r-2 border-amber-500/50 pr-2">
                  💡 {isAr 
                    ? "اختر محافظتك ومركزك في مصر وسيتم ضبط خطوط الطول والعرض وتطبيق طريقة الحساب الرسمية المصرية لضمان دقة المواعيد."
                    : "Select your governorate and center in Egypt to apply exact coordinates and the official Egyptian survey standard."}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 block font-bold">{isAr ? "المحافظة:" : "Governorate:"}</label>
                    <select
                      value={selectedGovId}
                      onChange={(e) => handleGovChange(e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border outline-none focus:border-[#cca05a] cursor-pointer ${
                        darkMode ? "bg-slate-950/60 border-white/5 text-slate-100" : "bg-white border-amber-950/15 text-slate-900"
                      }`}
                    >
                      {EGYPT_GOVERNORATES.map((gov) => (
                        <option key={gov.id} value={gov.id}>
                          {isAr ? gov.nameAr : gov.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 block font-bold">{isAr ? "المركز / المدينة:" : "Center / City:"}</label>
                    <select
                      value={selectedCenterId}
                      onChange={(e) => setSelectedCenterId(e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border outline-none focus:border-[#cca05a] cursor-pointer ${
                        darkMode ? "bg-slate-950/60 border-white/5 text-slate-100" : "bg-white border-amber-950/15 text-slate-900"
                      }`}
                    >
                      {activeGov.centers.map((center) => (
                        <option key={center.id} value={center.id}>
                          {isAr ? center.nameAr : center.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Show coordinates of selected center */}
                {activeGov && (
                  <div className="p-2 rounded-lg bg-slate-950/20 border border-white/5 text-[9px] text-slate-400 font-mono flex justify-between">
                    <span>{isAr ? "خط الطول: " : "Lng: "}{activeGov.centers.find(c => c.id === selectedCenterId)?.lng || ""}</span>
                    <span>{isAr ? "خط العرض: " : "Lat: "}{activeGov.centers.find(c => c.id === selectedCenterId)?.lat || ""}</span>
                    <span className="text-[#cca05a] font-bold">{isAr ? "تنسيق فلكي دقيق" : "Astronomical precision"}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onApplyEgyptCenter}
                  className="w-full py-2 px-4 text-xs font-extrabold rounded-xl bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 hover:shadow-lg transition duration-200 cursor-pointer"
                >
                  🇪🇬 {isAr ? "💾 حفظ وتطبيق مواقيت هذا المركز" : "💾 Save & Apply Center Times"}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* GPS is active - if the name shows Egypt governorate, display it as a nice badge */
          gpsLocation.name && (gpsLocation.name.includes("مصر") || gpsLocation.name.includes("Egypt")) && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-right space-y-1.5" style={{ direction: "rtl" }}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-amber-300 font-bold">🇪🇬 موقع مصر اليدوي مفعّل</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500 text-slate-950 font-extrabold">{isAr ? "نشط" : "Active"}</span>
              </div>
              <p className="text-xs font-bold text-slate-100">{gpsLocation.name}</p>
              <p className="text-[10px] text-slate-400">
                {isAr 
                  ? "تتم الحسابات للمركز المحدد بدقة متناهية وفق المذهب والزاوية المعتمدة."
                  : "Calculations are active for the selected center using coordinates with maximum precision."}
              </p>
            </div>
          )
        )}

        {/* 2. GPS Location Panel */}
        {calcType === "gps" && (
          <div className="space-y-3 text-right" style={{ direction: "rtl" }}>
            <span className="text-[10px] text-slate-400 block font-bold">
              {isAr ? "موقع الأقمار الصناعية (GPS):" : "GPS Satellite Location:"}
            </span>

            {gpsLocation.lat && gpsLocation.lng ? (
              <div className="p-3 rounded-xl bg-slate-950/30 border border-emerald-500/10 flex flex-col space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isAr ? "تم تحديد الموقع بنجاح" : "Location Selected"}
                  </span>
                  <span className="text-slate-400 text-[10px] font-mono">
                    {gpsLocation.name}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-1 mt-1 justify-end">
                  <span>{isAr ? "خط العرض: " : "Lat: "}{gpsLocation.lat.toFixed(4)}°</span>
                  <span>{isAr ? "خط الطول: " : "Lng: "}{gpsLocation.lng.toFixed(4)}°</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/30 border border-white/5 text-center">
                <p className="text-[10px] text-slate-500">
                  {isAr ? "لم يتم الكشف عن موقعك الجغرافي بعد. اضغط أدناه لجلبه تلقائياً." : "No GPS location captured yet. Click below to fetch."}
                </p>
              </div>
            )}

            <button
              onClick={handleFetchGPS}
              disabled={gpsLoading}
              className={`w-full py-2.5 px-4 text-xs font-extrabold rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                gpsLoading 
                  ? "bg-slate-950/40 text-slate-400 border-white/5 cursor-not-allowed" 
                  : "bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 hover:shadow-[0_0_15px_rgba(204,160,90,0.25)] border-transparent"
              }`}
            >
              {gpsLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {isAr ? "جاري الحصول على إحداثيات الموقع..." : "Getting Location Coordinates..."}
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 shrink-0" />
                  {isAr ? "تحديد موقعي التلقائي الحالي" : "Fetch My Current Location"}
                </>
              )}
            </button>

            {gpsError && (
              <p className="text-[10px] text-rose-400 font-bold mt-1 text-center">
                ⚠️ {gpsError}
              </p>
            )}

            <div className="pt-2 border-t border-white/5 text-center">
              <button
                type="button"
                onClick={() => setShowManualInputs(!showManualInputs)}
                className="text-[11px] text-[#cca05a] hover:underline font-bold cursor-pointer"
              >
                {showManualInputs 
                  ? (isAr ? "▲ إخفاء إدخال الإحداثيات اليدوي" : "▲ Hide Manual Coordinates Input")
                  : (isAr ? "📝 أدخل إحداثيات موقعك يدوياً (خطوط العرض والطول والوقت)" : "📝 Enter location coordinates manually (Lat, Lng, Timezone)")
                }
              </button>
            </div>

            {showManualInputs && (
              <div className="p-4 rounded-xl bg-slate-950/45 border border-white/5 space-y-3 mt-2 text-right">
                <span className="text-[10px] text-[#cca05a] font-bold block">
                  {isAr ? "إدخال إحداثيات مخصصة بالكامل:" : "Enter Custom Coordinates:"}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 block">{isAr ? "خط العرض (Latitude):" : "Latitude:"}</label>
                    <input
                      type="text"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder="e.g. 24.7136"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs font-mono font-bold text-center text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 block">{isAr ? "خط الطول (Longitude):" : "Longitude:"}</label>
                    <input
                      type="text"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      placeholder="e.g. 46.6753"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs font-mono font-bold text-center text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 block">{isAr ? "المنطقة الزمنية (GMT/UTC):" : "Timezone (GMT/UTC):"}</label>
                    <input
                      type="text"
                      value={manualTz}
                      onChange={(e) => setManualTz(e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs font-mono font-bold text-center text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 block">{isAr ? "اسم الموقع/المدينة:" : "Location/City Name:"}</label>
                    <input
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder={isAr ? "مثال: موقعي الخاص" : "e.g. My Custom Location"}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-center text-white font-bold"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSaveManual}
                  className="w-full mt-2 py-2 px-4 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition cursor-pointer"
                >
                  {isAr ? "💾 حفظ وتطبيق الإحداثيات اليدوية" : "💾 Save & Apply Manual Coordinates"}
                </button>

                {manualSaveSuccess && (
                  <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/30 text-center text-emerald-400 text-[10px] font-bold">
                    ✓ {isAr ? "تم حفظ وتطبيق الإحداثيات الجديدة لمواقيت الصلاة بنجاح!" : "New coordinates applied and prayer times calculated!"}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Astronomical Calculation Method Standard */}
        <div className="space-y-2 text-right" style={{ direction: "rtl" }}>
          <span className="text-[10px] text-slate-400 block font-bold">
            {isAr ? "طريقة حساب مواقيت الصلاة (الهيئة الفلكية):" : "Calculation Standard (Astronomical Institution):"}
          </span>
          <select
            value={calcMethod}
            onChange={(e) => handleUpdateMethod(e.target.value)}
            className={`w-full px-3 py-2 text-xs font-medium rounded-xl border outline-none focus:border-[#cca05a] transition-all cursor-pointer ${
              darkMode ? "bg-slate-950/60 border-white/5 text-slate-100" : "bg-white border-amber-950/15 text-slate-900"
            }`}
          >
            {METHODS.map((m) => (
              <option key={m.id} value={m.id} className={darkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"}>
                {isAr ? m.nameAr : m.nameEn} (فجر: {m.fajrAngle}°)
              </option>
            ))}
          </select>
        </div>

        {/* 4. Juristic Asr Calculation Method Standard */}
        <div className="space-y-2 text-right" style={{ direction: "rtl" }}>
          <span className="text-[10px] text-slate-400 block font-bold">
            {isAr ? "المذهب الفقهي لحساب صلاة العصر:" : "Juristic Method for Asr Calculation:"}
          </span>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/20 border border-white/5">
            <button
              onClick={() => handleUpdateAsrJuristic("shafi")}
              className={`py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                asrJuristic === "shafi"
                  ? "bg-[#cca05a]/25 text-amber-200 border border-[#cca05a]"
                  : "text-slate-400 border border-transparent hover:text-white"
              }`}
            >
              {isAr ? "الجمهور (شافعي، مالكي، حنبلي)" : "Standard (Shafi'i, Maliki, Hanbali)"}
            </button>
            <button
              onClick={() => handleUpdateAsrJuristic("hanafi")}
              className={`py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                asrJuristic === "hanafi"
                  ? "bg-[#cca05a]/25 text-amber-200 border border-[#cca05a]"
                  : "text-slate-400 border border-transparent hover:text-white"
              }`}
            >
              {isAr ? "المذهب الحنفي" : "Hanafi School"}
            </button>
          </div>
          <p className="text-[9px] text-slate-500 leading-none">
            {isAr 
              ? "الجمهور: يبدأ العصر عندما يتساوى ظل الشيء مع طوله. الحنفي: يبدأ عندما يصبح ظل الشيء مثلي طوله."
              : "Standard: Asr starts when shadow equals object length. Hanafi: when shadow is twice object length."}
          </p>
        </div>
      </div>

      {/* 🛠️ MANUAL PRAYER TIMES SETTING SECTION */}
      <div className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
        darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
      }`}>
        <div className="flex items-center space-x-2 space-x-reverse justify-end pb-3 border-b border-white/5">
          <span className="text-xs font-bold text-amber-400">
            {isAr ? "🛠️ وضع الضبط اليدوي لمواقيت الصلاة" : "🛠️ Manual Prayer Times Adjustment"}
          </span>
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
        </div>

        <p className="text-[11px] text-slate-400 font-light leading-relaxed text-right" style={{ direction: "rtl" }}>
          {isAr 
            ? "بتفعيلك لهذا الوضع، يمكنك إدخال وتعديل مواقيت الصلاة لليوم يدوياً بالدقيقة والساعة بدلاً من استخدام الحسابات التلقائية المستندة للموقع الجغرافي."
            : "By enabling this mode, you can manually input and adjust prayer times for today by minute and hour instead of utilizing automatic GPS/city calculations."}
        </p>

        {/* Toggle Button for Manual Mode */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/20 border border-white/5" style={{ direction: "rtl" }}>
          <span className="text-xs font-bold text-slate-200">
            {isAr ? "تفعيل الضبط اليدوي للصلوات:" : "Enable Manual Adjustment:"}
          </span>
          <button
            onClick={() => handleToggleManualMode(!manualPrayerTimesMode)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              manualPrayerTimesMode ? "bg-[#cca05a]" : "bg-slate-700"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${
                manualPrayerTimesMode ? "left-0.5" : "left-6.5"
              }`}
              style={{
                transform: manualPrayerTimesMode ? 'translateX(24px)' : 'translateX(0px)'
              }}
            />
          </button>
        </div>

        {/* Manual Input Fields for each of the 6 times */}
        {manualPrayerTimesMode && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2" style={{ direction: "rtl" }}>
            {[
              { key: "fajr", name: isAr ? "🌅 صلاة الفجر" : "Fajr" },
              { key: "shuruq", name: isAr ? "☀️ الشروق" : "Shuruq" },
              { key: "dhuhr", name: isAr ? "☀️ صلاة الظهر" : "Dhuhr" },
              { key: "asr", name: isAr ? "⛅ صلاة العصر" : "Asr" },
              { key: "maghrib", name: isAr ? "🌇 صلاة المغرب" : "Maghrib" },
              { key: "isha", name: isAr ? "🌃 صلاة العشاء" : "Isha" },
            ].map((prayer) => (
              <div key={prayer.key} className="p-3 rounded-xl bg-slate-950/30 border border-white/5 space-y-1.5 flex flex-col">
                <span className="text-[10px] text-amber-200 font-bold block text-right">
                  {prayer.name}
                </span>
                <input
                  type="time"
                  value={manualPrayerTimes[prayer.key] || "12:00"}
                  onChange={(e) => handleUpdateManualPrayerTime(prayer.key, e.target.value)}
                  className="w-full bg-slate-900 text-white border border-white/10 rounded-lg p-1.5 text-xs font-mono font-bold text-center outline-none focus:border-[#cca05a] transition cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
