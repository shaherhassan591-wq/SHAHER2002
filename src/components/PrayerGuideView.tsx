import React, { useState } from "react";
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Info, 
  Compass, 
  Award, 
  CheckCircle, 
  ChevronLeft, 
  ChevronDown, 
  BookMarked,
  Clock,
  Heart,
  Smile
} from "lucide-react";

interface PrayerStep {
  id: string;
  title: string;
  description: string;
  whatToSay: string;
  imagePlaceholder: string;
}

const PRAYER_STEPS: PrayerStep[] = [
  {
    id: "intention",
    title: "1. النية واستقبال القبلة",
    description: "أن يعزم بقلبه على الصلاة التي يريد أداءها لله تعالى دون التلفظ بها جهراً، ثم يستقبل الكعبة المطهرة بجسده بالكامل.",
    whatToSay: "«العلماء أجمعوا على أن النية محلها القلب ولا يشترط قولها باللسان»",
    imagePlaceholder: "🕋"
  },
  {
    id: "takbeer",
    title: "2. تكبيرة الإحرام",
    description: "يرفع يديه حذو منكبيه أو أذنيه ويقول تكبيرة الإحرام للدخول في الصلاة، ثم يضع يده اليمنى على اليسرى فوق صدره.",
    whatToSay: "يقول: «اللَّهُ أَكْبَرُ»",
    imagePlaceholder: "🙌"
  },
  {
    id: "qiyam",
    title: "3. القيام وقراءة الفاتحة وسورة",
    description: "يقرأ دعاء الاستفتاح سراً، ثم يستعيذ بالله ويبسمل ويقرأ سورة الفاتحة كاملة، تليها سورة قصيرة أو ما يتيسر له من القرآن الكريم.",
    whatToSay: "قراءة الفاتحة: «بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ...» ثم قراءة سورة أخرى تليها بالترتيل والتدبر.",
    imagePlaceholder: "📖"
  },
  {
    id: "ruku",
    title: "4. الركوع الطمأنينة",
    description: "يكبّر ثم ينحني بظهره مستوياً ويداه متمكنتان من ركبتيه مع تفريج أصابعه ويطمئن في ركوعه.",
    whatToSay: "يقول في ركوعه: «سُبْحَانَ رَبِّيَ الْعَظِيمِ» (٣ مرات)",
    imagePlaceholder: "🙇"
  },
  {
    id: "rising",
    title: "5. الرفع من الركوع والاعتدال",
    description: "يرتفع من الركوع حتى يستوي ظهره قائماً مطمئناً ويرفع يديه حذو منكبيه أثناء الرفع.",
    whatToSay: "يقول الإمام والمُنفرِد: «سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ» وعند الاستواء يقول الجميع: «رَبَّنَا وَلَكَ الْحَمْدُ»",
    imagePlaceholder: "🧍"
  },
  {
    id: "sujud1",
    title: "6. السجود الأول",
    description: "يكبر ويهوي إلى السجود على الأعضاء السبعة: الجبهة مع الأنف، الكفين، الركبتين، وأطراف القدمين متجهاً بباطن أصابع قدميه نحو القبلة.",
    whatToSay: "يقول في سجوده: «سُبْحَانَ رَبِّيَ الْأَعْلَى» (٣ مرات)",
    imagePlaceholder: "🧎"
  },
  {
    id: "sitting",
    title: "7. الجلوس بين السجدتين",
    description: "يكبر ويرفع رأسه من السجود ويجلس مفترشاً رجله اليسرى وناصباً اليمنى مطمئناً ويضع كفيه على فخذيه.",
    whatToSay: "يقول بين السجدتين: «رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي»",
    imagePlaceholder: "🧘"
  },
  {
    id: "sujud2",
    title: "8. السجود الثاني",
    description: "يكبر ويهوي للسجود الثاني مثل الأول تماماً بالطمأنينة الكاملة والخشوع.",
    whatToSay: "يقول في سجوده الشريف: «سُبْحَانَ رَبِّيَ الْأَعْلَى» (٣ مرات)",
    imagePlaceholder: "🧎"
  },
  {
    id: "tashahhud",
    title: "9. التشهد (الأول والأخير)",
    description: "بعد الركعة الثانية (التشهد الأول) وفي نهاية الركعة الأخيرة (التشهد الأخير)، يجلس ويضع يده اليمنى على فخذه اليمنى عاقداً أصابعه ومشيراً بالسبابة.",
    whatToSay: "التشهد: «التَّحِيَّاتُ لِلَّهِ، وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ...» وفي الأخير يزيد الصلاة الإبراهيمية.",
    imagePlaceholder: "🤲"
  },
  {
    id: "tasleem",
    title: "10. التسليم والانتهاء",
    description: "يُسلم عن يمينه حتى يُرى بياض خده الأيمن قائلاً السلام عليكم ورحمة الله، ثم يلتفت عن يساره قائلاً مثل ذلك.",
    whatToSay: "عن اليمين ثم اليسار: «السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ»",
    imagePlaceholder: "👋"
  }
];

export default function PrayerGuideView() {
  const [activeStepId, setActiveStepId] = useState<string>("intention");
  const [expandedSection, setExpandedSection] = useState<string | null>("pillars");

  const currentStep = PRAYER_STEPS.find(s => s.id === activeStepId) || PRAYER_STEPS[0];

  const sections = [
    {
      id: "pillars",
      title: "أركان الصلاة (لا تسقط عمداً ولا سهواً)",
      items: [
        "١. القيام في الفرض مع القدرة",
        "٢. تكبيرة الإحرام في بداية الصلاة",
        "٣. قراءة سورة الفاتحة في كل ركعة",
        "٤. الركوع والرفع منه والاعتدال قائماً",
        "٥. السجود على الأعضاء السبعة والرفع منه",
        "٦. الجلوس بين السجدتين",
        "٧. الطمأنينة والهدوء في جميع الأفعال",
        "٨. التشهد الأخير في نهاية الصلاة والجلوس له",
        "٩. التسليمتان والترتيب بين الأركان"
      ]
    },
    {
      id: "shuroot",
      title: "شروط صحة الصلاة (يجب تقديمها قبل البدء)",
      items: [
        "١. الإسلام والعقل والتمييز",
        "٢. الطهارة من الحدث (الوضوء أو الغسل)",
        "٣. طهارة البدن والثوب ومكان الصلاة",
        "٤. ستر العورة (للرجل من السرة للركبة، وللمرأة كامل جسدها عدا كفيها ووجهها)",
        "٥. دخول وقت الصلاة المكتوبة فلا تصح قبل وقتها",
        "٦. استقبال القبلة المشرفة (الكعبة المطهرة)"
      ]
    },
    {
      id: "sunan",
      title: "سنن ونوافل الصلاة الفضيلة",
      items: [
        "• دعاء الاستفتاح في الركعة الأولى",
        "• رفع اليدين عند تكبيرة الإحرام والركوع والرفع منه",
        "• وضع اليد اليمنى فوق اليسرى على الصدر",
        "• النظر إلى موضع السجود بخشوع وتواضع",
        "• ما زاد عن تسبيحة واحدة في الركوع والسجود",
        "• صلاة الرواتب القبلية والبعدية المصاحبة للفروض"
      ]
    }
  ];

  const rakatTable = [
    { name: "صلاة الفجر", rakat: "ركعتان (٢)", sunnahQabli: "ركعتان (٢)", sunnahBadi: "—", status: "جهرية" },
    { name: "صلاة الظهر", rakat: "أربع ركعات (٤)", sunnahQabli: "أربع ركعات (٤)", sunnahBadi: "ركعتان (٢)", status: "سرية" },
    { name: "صلاة العصر", rakat: "أربع ركعات (٤)", sunnahQabli: "—", sunnahBadi: "—", status: "سرية" },
    { name: "صلاة المغرب", rakat: "ثلاث ركعات (٣)", sunnahQabli: "—", sunnahBadi: "ركعتان (٢)", status: "جهرية في أول ركعتين" },
    { name: "صلاة العشاء", rakat: "أربع ركعات (٤)", sunnahQabli: "—", sunnahBadi: "ركعتان (٢) + الشفع والوتر", status: "جهرية في أول ركعتين" }
  ];

  return (
    <div className="flex flex-col h-full bg-[#071b29] text-white p-4 font-sans select-none overflow-y-auto">
      {/* Visual Header Banner */}
      <div className="bg-[#0b263b] rounded-2xl border border-[#cca05a]/25 p-5 mb-6 flex flex-col space-y-4 shadow-lg text-right relative overflow-hidden">
        <div className="absolute left-4 top-4 text-amber-500/10 text-6xl">🕌</div>
        <div className="space-y-1.5 z-10">
          <h2 className="text-sm font-bold text-yellow-105 flex items-center justify-end space-x-1.5 space-x-reverse">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>دليل كيفية الصلاة المكتمل والوافي</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            قال الله سبحانه: 「 إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا 」. نضع بين يديك سجلاً تفاعلياً مبسطاً لأركان الصلاة وسننها وكيفية أدائها من التكبير إلى التسليم لتبقى صلواتك صحيحة مطمئنة.
          </p>
        </div>
      </div>

      {/* Rakahs Summary Board Column */}
      <div className="bg-[#092234] border border-[#cca05a]/20 rounded-2xl p-4 mb-6 text-right">
        <h3 className="text-xs font-bold text-amber-200 mb-3 border-b border-white/5 pb-2 flex items-center space-x-1 space-x-reverse justify-end">
          <span>جدول ركعات الصلوات الخمس والسنن المصاحبة</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-[#e2ebd5] border-collapse" style={{ direction: "rtl" }}>
            <thead>
              <tr className="border-b border-white/10 text-[#cca05a] text-right">
                <th className="py-2 px-1">الصلاة المكتوبة</th>
                <th className="py-2 px-1 text-center">عدد الركعات الفرض</th>
                <th className="py-2 px-1 text-center">سنة قبلية</th>
                <th className="py-2 px-1 text-center">سنة بعدية</th>
                <th className="py-2 px-1 text-center">طبيعة القراءة</th>
              </tr>
            </thead>
            <tbody>
              {rakatTable.map((row, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-2.5 px-1 font-bold">{row.name}</td>
                  <td className="py-2.5 px-1 text-center font-bold text-amber-100">{row.rakat}</td>
                  <td className="py-2.5 px-1 text-center text-slate-300">{row.sunnahQabli}</td>
                  <td className="py-2.5 px-1 text-center text-slate-300">{row.sunnahBadi}</td>
                  <td className="py-2.5 px-1 text-center text-xs text-amber-400/90">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Step-by-Step Step Carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 text-right" style={{ direction: "rtl" }}>
        
        {/* Left selector menu in Prayer steps */}
        <div className="lg:col-span-4 bg-[#092234] border border-white/5 rounded-2xl p-4 space-y-1.5 max-h-[460px] overflow-y-auto">
          <span className="text-[10px] text-amber-400 font-bold block mb-2 px-2">خطوات الصلاة ركعتين متكاملتين:</span>
          {PRAYER_STEPS.map((step) => {
            const isActive = activeStepId === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                className={`w-full text-right px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? "bg-[#cca05a] text-slate-950 font-extrabold shadow"
                    : "bg-slate-950/20 text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{step.title}</span>
                <span className="text-sm font-mono">{step.imagePlaceholder}</span>
              </button>
            );
          })}
        </div>

        {/* Right Active showcase details board of selected Step */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#0c2e47] to-[#04121e] border border-[#cca05a]/30 rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
              <span className="text-xs bg-slate-900 px-3 py-1 rounded-full border border-[#cca05a]/20 text-[#cca05a] font-bold font-serif">
                الأداء العملي الصحيح
              </span>
              <span className="text-3xl animate-bounce">{currentStep.imagePlaceholder}</span>
            </div>

            <h4 className="text-base font-extrabold text-[#ffe082]">
              {currentStep.title}
            </h4>
            
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {currentStep.description}
            </p>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-[#cca05a]/15 text-right space-y-1 mt-4">
              <span className="text-[10px] text-[#cca05a] font-bold block leading-none">ما يُقال ويُدعى به في هذا الموضع:</span>
              <p className="text-sm text-yellow-101 font-serif font-bold pt-1 leading-relaxed select-text">
                {currentStep.whatToSay}
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4 mt-4 border-t border-white/10 items-center">
            <span className="text-[10px] text-slate-400">تابع الخطوات الصحيحة بخشوع</span>
            
            <div className="flex gap-2">
              <button
                disabled={PRAYER_STEPS.findIndex(s => s.id === activeStepId) === 0}
                onClick={() => {
                  const currIdx = PRAYER_STEPS.findIndex(s => s.id === activeStepId);
                  if (currIdx > 0) {
                    setActiveStepId(PRAYER_STEPS[currIdx - 1].id);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-950/30 text-xs border border-white/5 disabled:opacity-40"
              >
                السابق
              </button>
              <button
                disabled={PRAYER_STEPS.findIndex(s => s.id === activeStepId) === PRAYER_STEPS.length - 1}
                onClick={() => {
                  const currIdx = PRAYER_STEPS.findIndex(s => s.id === activeStepId);
                  if (currIdx < PRAYER_STEPS.length - 1) {
                    setActiveStepId(PRAYER_STEPS[currIdx + 1].id);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-[#cca05a] text-slate-950 font-bold text-xs"
              >
                التالي
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Accordion list for prerequisites, pillars, and sunnahs */}
      <div className="space-y-3 text-right" style={{ direction: "rtl" }}>
        {sections.map((sec) => {
          const isExpanded = expandedSection === sec.id;
          return (
            <div key={sec.id} className="bg-[#092234] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300">
              <button
                onClick={() => setExpandedSection(isExpanded ? null : sec.id)}
                className="w-full flex items-center justify-between p-4 text-[#cca05a] font-bold text-xs hover:bg-white/5 transition"
              >
                <span className="flex items-center space-x-2 space-x-reverse">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>{sec.title}</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
              </button>
              
              {isExpanded && (
                <div className="p-4 pt-1 bg-slate-950/20 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sec.items.map((item, id) => (
                    <div key={id} className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-[11px] text-slate-205 leading-relaxed font-sans">
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Informative advice reminder card */}
      <div className="bg-[#cca05a]/5 p-4 rounded-2xl border border-dashed border-[#cca05a]/40 mt-6 text-center leading-relaxed text-xs">
        <Heart className="w-5 h-5 text-red-500 animate-pulse mx-auto mb-2" />
        <span className="text-[#cca05a] font-bold">أول ما يُحاسب عليه العبد يوم القيامة الصلاة</span>
        <p className="text-slate-350 text-[11px] font-sans mt-1">
          إذا صحت وسلِمت صُنِع من ورائها توفيق الحياة ورزق السكينة وبشارة الجنة، فاحرص على إقامتها في أوقاتها بخشوع تام وطمأنينة بالغة. وتقبل الله صالح طاعاتكم.
        </p>
      </div>

    </div>
  );
}
