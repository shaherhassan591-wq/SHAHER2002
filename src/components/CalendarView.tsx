import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  Compass,
} from "lucide-react";

interface HijriDateDetails {
  day: number;
  month: number;
  monthName: string;
  year: number;
  occasion?: string;
}

export default function CalendarView({ darkMode = true }: { darkMode?: boolean }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [occasionsList, setOccasionsList] = useState<Array<{ name: string; dateStr: string; status: string }>>([]);

  const arabicDayNames = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت"
  ];

  const hijriMonthNames = [
    "محرم",
    "صفر",
    "ربيع الأول",
    "ربيع الآخر",
    "جمادى الأولى",
    "جمادى الآخرة",
    "رجب",
    "شعبان",
    "رمضان",
    "شوال",
    "ذو القعدة",
    "ذو الحجة"
  ];

  const getHijriDetails = (date: Date): HijriDateDetails => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "numeric",
        year: "numeric"
      });
      const parts = formatter.formatToParts(date);
      const day = parseInt(parts.find(p => p.type === 'day')?.value || "1", 10);
      const month = parseInt(parts.find(p => p.type === 'month')?.value || "1", 10);
      const year = parseInt(parts.find(p => p.type === 'year')?.value || "1445", 10);
      
      const monthName = hijriMonthNames[month - 1] || "محرم";

      // Detect Islamic Occasions
      let occasion = undefined;
      if (month === 1 && day === 1) occasion = "رأس السنة الهجرية الجديد 🌟";
      else if (month === 1 && day === 10) occasion = "يوم عاشوراء العظيم 🌿";
      else if (month === 3 && day === 12) occasion = "المولد النبوي الشريف ﷺ 💚";
      else if (month === 7 && day === 27) occasion = "الإسراء والمعراج 🌌";
      else if (month === 8 && day === 15) occasion = "ليلة النصف من شعبان 🌕";
      else if (month === 9 && day === 1) occasion = "بداية شهر رمضان المبارك 🌙";
      else if (month === 9 && day >= 21 && day % 2 !== 0) occasion = "ليلة وترية من العشر الأواخر 🌟";
      else if (month === 10 && day === 1) occasion = "عيد الفطر المبارك 🎉";
      else if (month === 12 && day === 9) occasion = "يوم عرفة المبارك 🕋";
      else if (month === 12 && day === 10) occasion = "عيد الأضحى المبارك 🐑";

      return { day, month, monthName, year, occasion };
    } catch (e) {
      return { day: 1, month: 1, monthName: "محرم", year: 1445 };
    }
  };

  // Generate days in grid for the selected year & month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dayNum: number) => {
    setSelectedDate(new Date(year, month, dayNum));
  };

  const isToday = (dayNum: number) => {
    const today = new Date();
    return today.getDate() === dayNum && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (dayNum: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === dayNum && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  // Format month title (Arabic and English)
  const gregorianMonthTitle = currentDate.toLocaleDateString("ar-EG", { month: "long", year: "numeric" });
  
  // Hijri details of the first day of month to construct approximate Hijri heading
  const firstHijri = getHijriDetails(new Date(year, month, 1));
  const lastHijri = getHijriDetails(new Date(year, month, totalDaysInMonth));

  // Islamic occasions for the current year
  useEffect(() => {
    if (!selectedDate) return;
    const details = getHijriDetails(selectedDate);
    const yearH = details.year;

    // Compile virtual timeline of occurrences for the general UI list
    const items = [
      { name: "بداية العام الهجري الجديد", dateStr: `١ محرّم ${yearH} هـ`, status: "عام هجري سعيد" },
      { name: "صيام يوم عاشوراء العظيم", dateStr: `١٠ محرّم ${yearH} هـ`, status: "تكفير سنة ماضية" },
      { name: "المولد النبوي الشريف", dateStr: `١٢ ربيع الأول ${yearH} هـ`, status: "خير البرية ﷺ" },
      { name: "الإسراء والمعراج", dateStr: `٢٧ رجب ${yearH} هـ`, status: "ليلة مباركة" },
      { name: "بداية شهر الاستغفار والتحضير", dateStr: `١ شعبان ${yearH} هـ`, status: "شهر الخير" },
      { name: "بداية شهر رمضان المبارك", dateStr: `١ رمضان ${yearH} هـ`, status: "شهر القرآن والرحمة" },
      { name: "عيد الفطر السعيد", dateStr: `١ شوّال ${yearH} هـ`, status: "جائزة الصيام" },
      { name: "يوم عرفة العظيم", dateStr: `٩ ذو الحجة ${yearH} هـ`, status: "أفضل أيام الدنيا" },
      { name: "عيد الأضحى المبارك", dateStr: `١٠ ذو الحجة ${yearH} هـ`, status: "أيام الفرحة والشكر" },
    ];
    setOccasionsList(items);
  }, [selectedDate]);

  const selectedHijri = selectedDate ? getHijriDetails(selectedDate) : null;
  const selectedGregorianText = selectedDate 
    ? selectedDate.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className={`flex flex-col h-full p-4 font-sans select-none overflow-y-auto ${
      darkMode ? "bg-[#071b29] text-white" : "bg-amber-50/40 text-slate-900"
    }`}>
      
      {/* Dynamic Header */}
      <div className={`rounded-2xl border p-5 shadow-xl relative overflow-hidden mb-6 flex-none text-right ${
        darkMode ? "bg-gradient-to-r from-[#0d3652] to-[#051f30] border-[#cca05a]/30 text-white" : "bg-gradient-to-r from-[#e8dcc4] to-[#f5ebd6] border-amber-900/10 text-slate-900"
      }`} style={{ direction: "rtl" }}>
        <div className="absolute left-6 top-6 opacity-[0.03] text-8xl text-amber-500 pointer-events-none">🗓</div>
        <div className="space-y-1 z-10">
          <span className={`text-xs tracking-widest block font-bold ${darkMode ? "text-[#cca05a]" : "text-amber-950"}`}>مواقيت التقويم الإسلامي والمعاش</span>
          <h2 className="text-base font-bold flex items-center justify-start space-x-1.5 space-x-reverse text-amber-100 dark:text-amber-50">
            <CalendarIcon className={`w-5 h-5 ${darkMode ? "text-amber-400" : "text-amber-900"}`} />
            <span className={darkMode ? "text-amber-100" : "text-amber-950"}>التقويم الهجري والميلادي الشامل</span>
          </h2>
          <p className={`text-xs font-light max-w-xl leading-relaxed mt-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
            تابع التواريخ الهجرية المقترنة بالميلادية يوماً بيوم، وتعرّف على المناسبات الدينية والأيام الفضيلة وفقاً لحسابات أم القرى الموثقة.
          </p>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ direction: "rtl" }}>
        
        {/* Right Section: The Month Calendar Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`rounded-2xl border p-5 shadow-xl ${
            darkMode ? "bg-gradient-to-br from-[#0a273c] to-[#051624] border-white/5" : "bg-white border-amber-900/10"
          }`}>
            
            {/* Nav controls */}
            <div className={`flex items-center justify-between pb-4 border-b mb-4 ${darkMode ? "border-white/5" : "border-slate-100"}`}>
              <button
                onClick={handlePrevMonth}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  darkMode ? "bg-slate-900 border-white/5 text-amber-100 hover:border-[#cca05a]/30" : "bg-amber-50 border-amber-900/10 text-amber-950 hover:bg-amber-100"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <h3 className={`text-sm font-extrabold ${darkMode ? "text-[#cca05a]" : "text-amber-950"}`}>{gregorianMonthTitle}</h3>
                <span className={`text-[10px] block font-semibold mt-0.5 ${darkMode ? "text-zinc-400" : "text-slate-600"}`}>
                  🕌 يوافق تقريباً: {firstHijri.monthName} {firstHijri.year} هـ - {lastHijri.monthName} {lastHijri.year} هـ
                </span>
              </div>

              <button
                onClick={handleNextMonth}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  darkMode ? "bg-slate-900 border-white/5 text-amber-100 hover:border-[#cca05a]/30" : "bg-amber-50 border-amber-900/10 text-amber-950 hover:bg-amber-100"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Week day letters (Sunday to Saturday) */}
            <div className={`grid grid-cols-7 gap-1 text-center mb-3 text-[11px] font-bold ${
              darkMode ? "text-amber-200/60" : "text-amber-900"
            }`}>
              {arabicDayNames.map((day) => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Grid of days */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              
              {/* Empty offset divs */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-16 rounded-xl bg-transparent opacity-0" />
              ))}

              {/* Days loop */}
              {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const cellDate = new Date(year, month, dayNum);
                const hijriInfo = getHijriDetails(cellDate);
                const active = isToday(dayNum);
                const selected = isSelected(dayNum);

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-16 rounded-xl flex flex-col justify-between p-1.5 border transition duration-300 relative cursor-pointer ${
                      selected
                        ? darkMode 
                          ? "bg-[#cca05a]/25 border-[#cca05a] text-white font-extrabold shadow-lg scale-102"
                          : "bg-[#cca05a]/20 border-[#cca05a] text-amber-950 font-extrabold shadow-md scale-102"
                        : active
                        ? "bg-gradient-to-b from-amber-500 to-[#cca05a] border-transparent text-slate-950 font-extrabold"
                        : darkMode
                        ? "bg-slate-950/40 border-white/5 text-slate-200 hover:border-[#cca05a]/30 hover:bg-slate-950/70"
                        : "bg-white border-amber-900/5 text-slate-800 hover:border-[#cca05a]/40 hover:bg-amber-50/50"
                    }`}
                  >
                    {/* Occasion indicator micro dot */}
                    {hijriInfo.occasion && (
                      <span className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    )}

                    {/* upper half: Gregorian Day */}
                    <span className="text-xs font-bold leading-none select-none">
                      {dayNum}
                    </span>

                    {/* lower half: Hijri Day */}
                    <span className={`text-[9px] font-semibold text-left block w-full select-none ${
                      selected 
                        ? (darkMode ? "text-amber-200" : "text-amber-950") 
                        : active 
                        ? "text-slate-900/80 font-bold" 
                        : "text-[#cca05a]"
                    }`}>
                      {hijriInfo.day} هـ
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend guide */}
            <div className={`flex items-center justify-start gap-4 mt-5 pt-3 border-t text-[10px] ${
              darkMode ? "border-white/5 text-zinc-400" : "border-slate-100 text-slate-600 font-medium"
            }`}>
              <div className="flex items-center space-x-1 space-x-reverse">
                <span className="w-2.5 h-2.5 rounded bg-gradient-to-r from-amber-500 to-[#cca05a]" />
                <span>اليوم الحالي</span>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <span className="w-2.5 h-2.5 rounded border border-[#cca05a] bg-[#cca05a]/20" />
                <span>اليوم المحدد</span>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>يوافق مناسبة دينية</span>
              </div>
            </div>

          </div>
        </div>

        {/* Left Section: Context Cards & Occasion lists */}
        <div className="space-y-4">
          
          {/* Selected Date Card */}
          {selectedDate && selectedHijri && (
            <div className={`border p-5 rounded-2xl shadow-xl space-y-3.5 text-right ${
              darkMode ? "bg-[#0b253b] border-[#cca05a]/20 text-white" : "bg-white border-amber-900/15 text-slate-900"
            }`}>
              
              <div className={`flex items-center space-x-2 space-x-reverse pb-2 border-b ${
                darkMode ? "border-white/5 text-[#cca05a]" : "border-slate-100 text-amber-950"
              }`}>
                <Clock className={`w-4 h-4 animate-pulse ${darkMode ? "text-amber-400" : "text-amber-900"}`} />
                <span className="text-xs font-bold font-sans">معلومات اليوم المحدّد</span>
              </div>

              <div className="space-y-1">
                <span className={`text-[10px] block ${darkMode ? "text-zinc-400" : "text-slate-500"}`}>التاريخ الميلادي:</span>
                <span className={`text-xs font-bold block ${darkMode ? "text-white" : "text-slate-900"}`}>{selectedGregorianText}</span>
              </div>

              <div className="space-y-1">
                <span className={`text-[10px] block ${darkMode ? "text-zinc-400" : "text-slate-500"}`}>التاريخ الهجري المبارك:</span>
                <span className={`text-sm font-extrabold block ${darkMode ? "text-amber-200" : "text-amber-950"}`}>
                  {selectedHijri.day} {selectedHijri.monthName} {selectedHijri.year} هـ
                </span>
              </div>

              {selectedHijri.occasion ? (
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed font-bold ${
                  darkMode ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-950"
                }`}>
                  🎉 {selectedHijri.occasion}
                </div>
              ) : (
                <div className={`p-2.5 rounded-lg text-[10px] border ${
                  darkMode ? "bg-slate-950/20 text-slate-400 border-white/5" : "bg-slate-50 text-slate-600 border-slate-100"
                }`}>
                  يوم اعتيادي مبارك، لا توجد مناسبة دينية رئيسية مدونة في هذا التاريخ.
                </div>
              )}
            </div>
          )}

          {/* Upcoming Islamic highlights throughout the year */}
          <div className={`border p-4 rounded-2xl shadow-xl space-y-3 ${
            darkMode ? "bg-gradient-to-br from-[#0a273c] to-[#051624] border-white/5 text-white" : "bg-white border-amber-900/10 text-slate-900"
          }`}>
            <div className={`flex items-center space-x-2 space-x-reverse pb-1 border-b ${
              darkMode ? "border-white/5 text-[#cca05a]" : "border-slate-100 text-amber-950"
            }`}>
              <Award className={`w-4 h-4 ${darkMode ? "text-[#cca05a]" : "text-amber-900"}`} />
              <h4 className={`text-xs font-bold ${darkMode ? "text-amber-100" : "text-amber-950"}`}>أعظم المناسبات السنوية للهجرة</h4>
            </div>

            <p className={`text-[10px] font-light leading-relaxed ${darkMode ? "text-zinc-400" : "text-slate-600"}`}>
              تذكير بالمواقيت المتداولة لأعظم المناسبات في السنة الحالية لتنال فضل التحضير والاستبشار:
            </p>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {occasionsList.map((oc, i) => (
                <div key={i} className={`p-2.5 rounded-xl border flex items-center justify-between text-right text-[11px] ${
                  darkMode ? "bg-slate-950/30 border-white/5" : "bg-slate-50 border-amber-900/5"
                }`}>
                  <div>
                    <span className={`font-bold block ${darkMode ? "text-slate-100" : "text-slate-950"}`}>{oc.name}</span>
                    <span className="text-[#cca05a] font-mono font-bold text-[10px] block mt-0.5">{oc.dateStr}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded border truncate shrink-0 ml-1.5 ${
                    darkMode ? "bg-[#cca05a]/10 text-amber-200/80 border-[#cca05a]/20" : "bg-amber-50 text-amber-950 border-amber-900/20 font-bold"
                  }`}>
                    {oc.status}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
