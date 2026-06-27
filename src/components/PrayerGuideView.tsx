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
    whatToSay: "التشهد: «التَّحِيَّاتُ لِلَّهِ، وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنْ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ...» وفي الأخير يزيد الصلاة الإبراهيمية.",
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

const rakatTable = [
  { name: "الفجر", rakat: "٢", sunnahQabli: "٢ (مؤكدة)", sunnahBadi: "لا يوجد", status: "جهرية" },
  { name: "الظهر", rakat: "٤", sunnahQabli: "٤ (مؤكدة)", sunnahBadi: "٢ (مؤكدة)", status: "سرية" },
  { name: "العصر", rakat: "٤", sunnahQabli: "لا يوجد", sunnahBadi: "لا يوجد", status: "سرية" },
  { name: "المغرب", rakat: "٣", sunnahQabli: "لا يوجد", sunnahBadi: "٢ (مؤكدة)", status: "جهرية في أول ركعتين" },
  { name: "العشاء", rakat: "٤", sunnahQabli: "لا يوجد", sunnahBadi: "٢ (مؤكدة)", status: "جهرية في أول ركعتين" }
];

export default function PrayerGuideView({ darkMode = true }: { darkMode?: boolean }) {
  const [activeStepId, setActiveStepId] = useState<string>("intention");
  const [expandedSection, setExpandedSection] = useState<string | null>("pillars");

  const currentStep = PRAYER_STEPS.find(s => s.id === activeStepId) || PRAYER_STEPS[0];

  const sections = [
    {
      id: "pillars",
      title: "أركان الصلاة (١٤ ركناً لا تسقط عمداً ولا سهواً)",
      items: [
        "١. القيام في الفرض مع القدرة والاستطاعة.",
        "٢. تكبيرة الإحرام (قول الله أكبر في البداية).",
        "٣. قراءة سورة الفاتحة كاملة في كل ركعة.",
        "٤. الركوع (الانحناء بظهر مستوٍ).",
        "٥. الرفع من الركوع والاعتدال قائماً.",
        "٦. السجود الأول والثاني على الأعضاء السبعة.",
        "٧. الرفع من السجود والجلوس مطمئناً بينهما.",
        "٨. الطمأنينة والاستقرار في جميع هذه الأركان.",
        "٩. التشهد الأخير في نهاية الركعة الأخيرة.",
        "١٠. الجلوس لقراءة التشهد الأخير والتسليم.",
        "١١. الصلاة على النبي ﷺ بعد التشهد الأخير.",
        "١٢. التسليمتان (السلام عليكم ورحمة الله يميناً ويساراً).",
        "١٣. الترتيب بين الأركان كما وردت.",
        "١٤. نية الصلاة المحددة بالقلب."
      ]
    },
    {
      id: "wajibs",
      title: "واجبات الصلاة (٨ واجبات تجبر بسجود السهو)",
      items: [
        "١. جميع التكبيرات لغير تكبيرة الإحرام.",
        "٢. قول: (سمع الله لمن حمده) للإمام والمنفرد عند الرفع.",
        "٣. قول: (ربنا ولك الحمد) للكل بعد الاعتدال.",
        "٤. قول: (سبحان ربي العظيم) مرة واحدة في الركوع.",
        "٥. قول: (سبحان ربي الأعلى) مرة واحدة في السجود.",
        "٦. قول: (رب اغفر لي) بين السجدتين.",
        "٧. التشهد الأول بعد الركعة الثانية.",
        "٨. الجلوس للتشهد الأول مطمئناً."
      ]
    },
    {
      id: "sunnahs",
      title: "سنن الصلاة القولية والفعلية (تزيد الأجر والثواب)",
      items: [
        "١. رفع اليدين حذو المنكبين عند تكبيرة الإحرام والركوع والرفع منه.",
        "٢. وضع اليد اليمنى فوق اليسرى على الصدر أثناء القيام.",
        "٣. دعاء الاستفتاح في الركعة الأولى سراً بعد تكبيرة الإحرام.",
        "٤. الاستعاذة بالله والبسملة سراً قبل قراءة الفاتحة.",
        "٥. قول (آمين) جهراً في الصلوات الجهرية وسراً في السرية.",
        "٦. قراءة سورة أو آيات بعد الفاتحة في الركعتين الأوليين.",
        "٧. الجهر بالقراءة في الفجر والمغرب والعشاء، والإسرار في الظهر والعصر.",
        "٨. زيادة التسبيح والدعاء في الركوع والسجود عن المرة الواحدة.",
        "٩. النظر إلى موضع السجود بخشوع تام."
      ]
    }
  ];

  return (
    <div className={`flex flex-col h-full p-4 font-sans select-none overflow-y-auto ${
      darkMode ? "bg-[#071b29] text-white" : "bg-amber-50/40 text-slate-900"
    }`}>
      {/* Visual Header Banner */}
      <div className={`rounded-2xl border p-5 mb-6 flex flex-col space-y-4 shadow-lg text-right relative overflow-hidden ${
        darkMode ? "bg-[#0b263b] border-[#cca05a]/25 text-white" : "bg-gradient-to-r from-[#e8dcc4] to-[#f5ebd6] border-amber-900/15 text-slate-900"
      }`}>
        <div className="absolute left-4 top-4 text-amber-500/10 text-6xl">🕌</div>
        <div className="space-y-1.5 z-10">
          <h2 className="text-sm font-bold flex items-center justify-end space-x-1.5 space-x-reverse">
            <Sparkles className={`w-4 h-4 animate-pulse ${darkMode ? "text-amber-400" : "text-amber-900"}`} />
            <span className={darkMode ? "text-amber-100 font-extrabold" : "text-amber-950 font-extrabold"}>دليل كيفية الصلاة المكتمل والوافي</span>
          </h2>
          <p className={`text-xs leading-relaxed font-semibold ${darkMode ? "text-slate-100" : "text-slate-950"}`}>
            قال الله سبحانه: 「 إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوقُوتًا 」. نضع بين يديك سجلاً تفاعلياً مبسطاً لأركان الصلاة وسننها وكيفية أدائها من التكبير إلى التسليم لتبقى صلواتك صحيحة مطمئنة.
          </p>
        </div>
      </div>

      {/* Rakahs Summary Board Column */}
      <div className={`border rounded-2xl p-4 mb-6 text-right ${
        darkMode ? "bg-[#092234] border-[#cca05a]/20" : "bg-white border-amber-900/15 shadow-sm text-slate-900"
      }`}>
        <h3 className={`text-xs font-extrabold mb-3 border-b pb-2 flex items-center space-x-1 space-x-reverse justify-end ${
          darkMode ? "border-white/10 text-amber-100" : "border-slate-200 text-amber-950"
        }`}>
          <span>جدول ركعات الصلوات الخمس والسنن المصاحبة</span>
          <Clock className={`w-4 h-4 ${darkMode ? "text-amber-400" : "text-amber-900"}`} />
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse" style={{ direction: "rtl" }}>
            <thead>
              <tr className={`border-b text-right font-extrabold ${
                darkMode ? "border-white/10 text-[#cca05a]" : "border-slate-300 text-amber-950"
              }`}>
                <th className="py-2 px-1">الصلاة المكتوبة</th>
                <th className="py-2 px-1 text-center">عدد الركعات الفرض</th>
                <th className="py-2 px-1 text-center">سنة قبلية</th>
                <th className="py-2 px-1 text-center">سنة بعدية</th>
                <th className="py-2 px-1 text-center">طبيعة القراءة</th>
              </tr>
            </thead>
            <tbody>
              {rakatTable.map((row, index) => (
                <tr key={index} className={`border-b transition font-bold ${
                  darkMode ? "border-white/5 hover:bg-white/5 text-slate-100" : "border-slate-150 hover:bg-slate-50 text-slate-950"
                }`}>
                  <td className="py-2.5 px-1 font-extrabold">{row.name}</td>
                  <td className={`py-2.5 px-1 text-center font-extrabold ${darkMode ? "text-amber-200" : "text-amber-950"}`}>{row.rakat}</td>
                  <td className={`py-2.5 px-1 text-center ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{row.sunnahQabli}</td>
                  <td className={`py-2.5 px-1 text-center ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{row.sunnahBadi}</td>
                  <td className={`py-2.5 px-1 text-center text-xs ${darkMode ? "text-amber-300" : "text-amber-900"}`}>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Step-by-Step Step Carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 text-right" style={{ direction: "rtl" }}>
        
        {/* Left selector menu in Prayer steps */}
        <div className={`lg:col-span-4 border rounded-2xl p-4 space-y-1.5 max-h-[460px] overflow-y-auto ${
          darkMode ? "bg-[#092234] border-white/5" : "bg-white border-amber-900/15 shadow-sm"
        }`}>
          <span className={`text-[10px] font-extrabold block mb-2 px-2 ${darkMode ? "text-amber-300" : "text-amber-950"}`}>خطوات الصلاة ركعتين متكاملتين:</span>
          {PRAYER_STEPS.map((step) => {
            const isActive = activeStepId === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                className={`w-full text-right px-3 py-2.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? "bg-[#cca05a] text-slate-950 font-extrabold shadow"
                    : darkMode
                    ? "bg-slate-950/20 text-slate-100 hover:text-white hover:bg-white/5"
                    : "bg-slate-50 text-slate-950 hover:bg-amber-900/5 border border-slate-200"
                }`}
              >
                <span>{step.title}</span>
                <span className="text-sm font-mono">{step.imagePlaceholder}</span>
              </button>
            );
          })}
        </div>

        {/* Right Active showcase details board of selected Step */}
        <div className={`lg:col-span-8 border rounded-2xl p-5 flex flex-col justify-between min-h-[300px] ${
          darkMode ? "bg-gradient-to-br from-[#0c2e47] to-[#04121e] border-[#cca05a]/30 text-white" : "bg-white border-amber-900/15 shadow-sm text-slate-950"
        }`}>
          
          <div className="space-y-4">
            <div className={`flex justify-between items-center pb-2.5 border-b ${darkMode ? "border-white/5" : "border-slate-150"}`}>
              <span className={`text-xs px-3 py-1 rounded-full border font-extrabold font-serif ${
                darkMode ? "bg-slate-900 border-[#cca05a]/20 text-[#cca05a]" : "bg-amber-50 border-amber-900/20 text-amber-950"
              }`}>
                الأداء العملي الصحيح
              </span>
              <span className="text-3xl animate-bounce">{currentStep.imagePlaceholder}</span>
            </div>

            <h4 className={`text-base font-extrabold ${darkMode ? "text-[#ffe082]" : "text-amber-950"}`}>
              {currentStep.title}
            </h4>
            
            <p className={`text-xs leading-relaxed font-sans font-bold ${darkMode ? "text-slate-100" : "text-slate-950"}`}>
              {currentStep.description}
            </p>

            <div className={`p-4 rounded-xl border text-right space-y-1 mt-4 ${
              darkMode ? "bg-slate-950/40 border-[#cca05a]/20" : "bg-amber-50 border-amber-200 text-slate-950"
            }`}>
              <span className={`text-[10px] font-extrabold block leading-none ${darkMode ? "text-[#cca05a]" : "text-amber-900"}`}>ما يُقال ويُدعى به في هذا الموضع:</span>
              <p className={`text-sm font-serif font-extrabold pt-1 leading-relaxed select-text ${darkMode ? "text-amber-100" : "text-amber-950"}`}>
                {currentStep.whatToSay}
              </p>
            </div>
          </div>

          <div className={`flex justify-between pt-4 mt-4 border-t items-center ${darkMode ? "border-white/10" : "border-slate-200"}`}>
            <span className={`text-[10px] font-bold ${darkMode ? "text-slate-350" : "text-slate-950"}`}>تابع الخطوات الصحيحة بخشوع</span>
            
            <div className="flex gap-2">
              <button
                disabled={PRAYER_STEPS.findIndex(s => s.id === activeStepId) === 0}
                onClick={() => {
                  const currIdx = PRAYER_STEPS.findIndex(s => s.id === activeStepId);
                  if (currIdx > 0) {
                    setActiveStepId(PRAYER_STEPS[currIdx - 1].id);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs border transition font-bold cursor-pointer ${
                  darkMode 
                    ? "bg-slate-950/30 text-white border-white/10 disabled:opacity-40" 
                    : "bg-slate-100 text-slate-950 border-slate-300 hover:bg-slate-200 disabled:opacity-45"
                }`}
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
                className="px-4 py-1.5 rounded-lg bg-[#cca05a] hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition cursor-pointer"
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
            <div key={sec.id} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
              darkMode ? "bg-[#092234] border-white/5" : "bg-white border-amber-900/15 shadow-sm"
            }`}>
              <button
                onClick={() => setExpandedSection(isExpanded ? null : sec.id)}
                className={`w-full flex items-center justify-between p-4 font-extrabold text-xs transition cursor-pointer ${
                  darkMode ? "text-[#cca05a] hover:bg-white/5" : "text-amber-950 hover:bg-amber-900/5"
                }`}
              >
                <span className="flex items-center space-x-2 space-x-reverse">
                  <Info className={`w-4 h-4 ${darkMode ? "text-amber-400" : "text-amber-900"}`} />
                  <span>{sec.title}</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
              </button>
              
              {isExpanded && (
                <div className={`p-4 pt-1 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ${
                  darkMode ? "bg-slate-950/20 border-white/5" : "bg-slate-50 border-slate-200"
                }`}>
                  {sec.items.map((item, id) => (
                    <div key={id} className={`p-2.5 rounded-xl border text-[11px] leading-relaxed font-sans font-bold ${
                      darkMode ? "bg-slate-950/40 border-white/5 text-slate-100" : "bg-white border-amber-900/10 text-slate-950 shadow-sm"
                    }`}>
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
      <div className={`p-4 rounded-2xl border border-dashed mt-6 text-center leading-relaxed text-xs ${
        darkMode ? "bg-[#cca05a]/5 border-[#cca05a]/40" : "bg-amber-50 border-amber-900/30 text-slate-950 shadow-inner"
      }`}>
        <Heart className="w-5 h-5 text-red-500 animate-pulse mx-auto mb-2" />
        <span className={`font-extrabold ${darkMode ? "text-[#cca05a]" : "text-amber-950"}`}>أول ما يُحاسب عليه العبد يوم القيامة الصلاة</span>
        <p className={`text-[11px] font-sans font-bold mt-1 ${darkMode ? "text-slate-100" : "text-slate-950"}`}>
          إذا صحت وسلِمت صُنِع من ورائها توفيق الحياة ورزق السكينة وبشارة الجنة، فاحرص على إقامتها في أوقاتها بخشوع تام وطمأنينة بالغة. وتقبل الله صالح طاعاتكم.
        </p>
      </div>

    </div>
  );
}
