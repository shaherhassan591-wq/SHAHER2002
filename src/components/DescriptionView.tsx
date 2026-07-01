import React from "react";
import {
  Info,
  Heart,
  BookOpen,
  Clock,
  Sparkles,
  Award,
  Compass,
  Volume2,
  Calendar,
  MessageSquare,
  Smartphone,
  ShieldCheck,
  User,
  Coffee,
  Facebook,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const shaherAvatar = "/src/assets/images/shaher_avatar_1782931768093.jpg";

interface DescriptionViewProps {
  darkMode: boolean;
}

export default function DescriptionView({ darkMode }: DescriptionViewProps) {
  const { isAr, t } = useLanguage();

  const features = [
    {
      icon: Clock,
      titleAr: "مواقيت دقيقة وأصوات أذان متعددة",
      titleEn: "Accurate Prayer Times & Adhan Selection",
      descAr: "حساب دقيق لأوقات الصلاة محلياً دون الحاجة للإنترنت، مع إمكانية اختيار أصوات متعددة للأذان والتنبيهات المخصصة.",
      descEn: "Offline computation of prayer timings with a rich catalog of beautiful adhan voices from around the world.",
    },
    {
      icon: BookOpen,
      titleAr: "القرآن الكريم بخطوط كاليغرافية",
      titleEn: "Noble Quran with Fine Calligraphy",
      descAr: "قراءة المصحف الشريف كاملاً مع ضبط وتخصيص نوع الخط (أميري، نسخ، خط النظام) وحجم النص ليناسب راحتك البصرية.",
      descEn: "Read the complete Quran with customized calligraphy options (Amiri, Naskh, System) and dynamic sizing.",
    },
    {
      icon: Sparkles,
      titleAr: "تذكير ذكي بالصلاة على النبي ﷺ",
      titleEn: "Prophet Sallou Alayh Reminders",
      descAr: "منظومة تذكير صوتية وبشرية تفاعلية لتنبيهك بالصلاة على رسول الله ﷺ بانتظام بالصوت العذب المأثور الذي تفضله.",
      descEn: "A dedicated audio system periodically reminding you to send blessings upon the Prophet ﷺ in premium voices.",
    },
    {
      icon: Compass,
      titleAr: "السبحة الذكية والأذكار المتكاملة",
      titleEn: "Smart Tasbih & Structured Athkar",
      descAr: "مسبحة إلكترونية تفاعلية تسجل رصيدك اليومي مع حصن المسلم الكامل من أذكار الصباح والمساء مقسمة بدقة تامة.",
      descEn: "An interactive digital rosary alongside a structured fortress of daily prayers and morning/evening Athkar.",
    },
    {
      icon: Calendar,
      titleAr: "التقويم الهجري ومفكرة الصيام",
      titleEn: "Hijri Calendar & Fasting Tracker",
      descAr: "عرض التاريخ الهجري ومزامنة الأيام البيض والمناسبات الإسلامية العظيمة مع تتبع حالة الصيام الشخصي وتنبيهاته.",
      descEn: "Keep track of lunar dates, white days, Islamic holidays, and record your voluntary fasting progress.",
    },
    {
      icon: MessageSquare,
      titleAr: "مساعد إسلامي ذكي وتوليد البطاقات",
      titleEn: "Smart AI Assistant & Quote Cards",
      descAr: "طرح الاستفسارات الدينية والتدبر عبر مساعد مدمج، مع إمكانية تصميم وتصدير بطاقات اقتباسات إسلامية رائعة.",
      descEn: "Inquire and study with our specialized AI assistant and design beautiful custom card designs for sharing.",
    },
  ];

  return (
    <div className={`flex flex-col h-full p-4 font-sans select-none overflow-y-auto ${
      darkMode ? "bg-[#071b29] text-white" : "bg-amber-50/20 text-slate-900"
    }`}>
      
      {/* Dynamic Visual Banner */}
      <div className={`rounded-2xl border p-6 shadow-xl relative overflow-hidden mb-6 flex-none text-right ${
        darkMode 
          ? "bg-gradient-to-r from-[#0d3652] to-[#051f30] border-[#cca05a]/30" 
          : "bg-gradient-to-r from-amber-100/60 to-amber-50 border-[#cca05a]/30 text-slate-900"
      }`} style={{ direction: isAr ? "rtl" : "ltr" }}>
        <div className="absolute left-6 top-6 opacity-[0.05] text-8xl text-emerald-400 pointer-events-none">🕌</div>
        
        <div className="space-y-2 z-10">
          <span className="text-xs text-[#cca05a] block font-bold tracking-widest uppercase">
            {isAr ? "دليلك الإيماني الشامل" : "Your Spiritual Companion"}
          </span>
          <h2 className="text-2xl font-bold text-amber-500 flex items-center justify-start space-x-2 space-x-reverse">
            <Info className="w-6 h-6 text-amber-500" />
            <span>{isAr ? "عن تطبيق «أنا مسلم»" : "About Ana Muslim App"}</span>
          </h2>
          <p className={`text-sm leading-relaxed mt-2 max-w-2xl ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
            {isAr 
              ? "تطبيق إسلامي حديث ومتكامل، صُمم وصُقل بعناية فائقة ليكون رفيقاً روحياً لكل مسلم في حياته اليومية. يعمل التطبيق بدون الحاجة لاتصال بالإنترنت تماماً، وخالٍ تماماً من الإعلانات المشتتة لضمان الطمأنينة الكاملة والخشوع."
              : "A modern, complete Islamic utility application, carefully crafted to serve as a daily spiritual companion. The app operates fully offline with absolutely no advertisements or tracking to ensure your peace of mind and focus."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ direction: isAr ? "rtl" : "ltr" }}>
        
        {/* Main Content: Features List */}
        <div className="md:col-span-2 space-y-6">
          <div className={`rounded-2xl border p-5 shadow-xl ${
            darkMode ? "bg-gradient-to-br from-[#0a273c] to-[#051624] border-white/5" : "bg-white border-amber-200/50"
          }`}>
            <h3 className="text-base font-bold text-amber-500 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{isAr ? "ميزات وخدمات التطبيق الأساسية" : "Core App Features & Services"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    darkMode 
                      ? "bg-[#0b1e2d]/60 border-white/5 hover:border-emerald-500/30" 
                      : "bg-amber-50/30 border-amber-100 hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      <f.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-amber-500">
                        {isAr ? f.titleAr : f.titleEn}
                      </h4>
                      <p className={`text-xs leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                        {isAr ? f.descAr : f.descEn}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy and Trust */}
          <div className={`rounded-2xl border p-5 shadow-xl flex flex-col sm:flex-row items-center gap-4 ${
            darkMode ? "bg-gradient-to-br from-[#0a273c] to-[#051624] border-white/5" : "bg-white border-amber-200/50"
          }`}>
            <div className={`p-3 rounded-full ${darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-right sm:text-right flex-1 space-y-1" style={{ direction: isAr ? "rtl" : "ltr" }}>
              <h4 className="text-sm font-bold text-amber-500">
                {isAr ? "خصوصية تامة وبدون إعلانات" : "Absolute Privacy & Ad-Free"}
              </h4>
              <p className={`text-xs leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                {isAr
                  ? "تطبيق «أنا مسلم» لا يجمع أي بيانات شخصية أو إحصائية، ويعمل بكفاءة دون اتصال بالإنترنت. التطبيق مجاني بالكامل وخالٍ من أي مواد دعائية تقرباً لوجه الله تعالى ولتوفير تجربة عبادة آمنة وهادئة."
                  : "The 'Ana Muslim' application does not collect any personal or statistical data, and operates completely offline. It is fully free of cost and ads to offer an uninterrupted, tranquil worship experience."}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar: Developers & Credits */}
        <div className="space-y-6">
          <div className={`rounded-2xl border p-5 shadow-xl text-center space-y-4 ${
            darkMode ? "bg-gradient-to-br from-[#0a273c] to-[#051624] border-white/5" : "bg-white border-amber-200/50"
          }`}>
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#cca05a] shadow-lg">
              <img
                src={shaherAvatar}
                alt="Shaher Hassan"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-emerald-500 font-bold block tracking-wider uppercase">
                {isAr ? "الإشراف والتطوير الفني" : "Supervision & Engineering"}
              </span>
              <h4 className="text-base font-bold text-amber-500">
                {isAr ? "شاهر حسان" : "Shaher Hassan"}
              </h4>
              <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                {isAr ? "المهندس المطور الفني للتطبيق" : "Lead Aesthetic App Engineer"}
              </p>
            </div>

            <hr className={darkMode ? "border-white/5" : "border-amber-100"} />

            <p className={`text-xs leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
              {isAr
                ? "تم تطوير هذا التطبيق بحرص شديد على التفاصيل البصرية والنقاء الفني والبرمجي؛ ليكون صدقة جارية ونفعاً ممتداً لجميع المسلمين حول بقاع الأرض."
                : "This application was built with fine digital craftsmanship to be a continuous charity (Sadaqah Jariyah) and a steady guide for Muslims around the globe."}
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href="https://wa.me/qr/QBORZHMLX4RVM1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-emerald-950/20"
              >
                <span>{isAr ? "تواصل واتساب مباشر" : "WhatsApp Chat"}</span>
              </a>
              <a
                href="https://www.facebook.com/share/18f8iyEqCu/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-blue-950/20"
              >
                <Facebook className="w-4 h-4" />
                <span>{isAr ? "الملف الشخصي على فيسبوك" : "Facebook Profile"}</span>
              </a>
            </div>
          </div>

          {/* Dev Note Card */}
          <div className={`rounded-2xl border p-5 shadow-xl text-right ${
            darkMode ? "bg-gradient-to-br from-[#0b1e2d] to-[#04121e] border-white/5" : "bg-amber-50/30 border-amber-100"
          }`} style={{ direction: isAr ? "rtl" : "ltr" }}>
            <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5 mb-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              <span>{isAr ? "دعاء بظهر الغيب" : "A Simple Request"}</span>
            </h4>
            <p className={`text-xs leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              {isAr
                ? "نسألكم صالح الدعاء لنا ولوالدينا بظهر الغيب، ونرحب بملاحظاتكم القيمة ومقترحاتكم الدائمة لتطوير التطبيق وخدمتكم على الدوام."
                : "We kindly ask you for your prayers (Duaa) in absentia, and we warmly welcome your valuable suggestions to keep polishing and updating this app."}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
