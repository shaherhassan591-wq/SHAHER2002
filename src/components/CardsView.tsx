import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  Download,
  Shuffle,
  Palette,
  Type,
  User,
  Layout,
  BookOpen,
  Bookmark,
  Award,
  Heart,
  FileText
} from "lucide-react";

interface QuoteItem {
  id: string;
  category: "quran" | "hadith" | "wisdom" | "dua";
  categoryAr: string;
  categoryEn: string;
  textAr: string;
  textEn: string;
  sourceAr: string;
  sourceEn: string;
  explanationAr: string;
  explanationEn: string;
}

const quotesDatabase: QuoteItem[] = [
  {
    id: "q-1",
    category: "quran",
    categoryAr: "آية قرآنية",
    categoryEn: "Quranic Verse",
    textAr: "« فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ »",
    textEn: '"So remember Me; I will remember you. And be grateful to Me and do not deny Me."',
    sourceAr: "سورة البقرة • الآية ١٥٢",
    sourceEn: "Surah Al-Baqarah • Ayah 152",
    explanationAr: "وعد إلهي جليل؛ إن ذُكر الله بالطاعة والتسبيح والشكر ذَكرَ العبد بجميل إحسانه ورضاه ودفعه للبلاء ونزول رحمته بروح الطمأنينة الكاملة.",
    explanationEn: "A majestic divine promise; remembering Allah through worship, praise, and gratitude brings His grace, protection, and complete serenity."
  },
  {
    id: "q-2",
    category: "quran",
    categoryAr: "آية قرآنية",
    categoryEn: "Quranic Verse",
    textAr: "« أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ »",
    textEn: '"Unquestionably, by the remembrance of Allah do hearts find rest."',
    sourceAr: "سورة الرعد • الآية ٢٨",
    sourceEn: "Surah Ar-Ra'd • Ayah 28",
    explanationAr: "غذاء الأرواح ومستقر السكون؛ ذكر الله ودوام الاتصال بمقام الألوهية يزيلان شتات القلق من النفس ويغسلان غبار الدنيا ببرد اليقين.",
    explanationEn: "Sustenance for the soul; continuous remembrance of the Creator clears anxiety and replaces worldly worries with absolute peace."
  },
  {
    id: "q-3",
    category: "quran",
    categoryAr: "آية قرآنية",
    categoryEn: "Quranic Verse",
    textAr: "« وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ »",
    textEn: '"And whoever fears Allah - He will make for him a way out * And will provide for him from where he does not expect."',
    sourceAr: "سورة الطلاق • الآية ٢-٣",
    sourceEn: "Surah At-Talaq • Ayah 2-3",
    explanationAr: "مفتاح المخارج والرزق؛ التقوى والوعي بمرضاة الله في السر والعلن هما اللذان يفتحان الأقفال المغلقة ويأتيان بالسكينة المعيشية والروحية.",
    explanationEn: "The key to solutions and provision; mindfulness of Allah opens closed doors and brings unexpected spiritual and physical nourishment."
  },
  {
    id: "q-4",
    category: "quran",
    categoryAr: "آية قرآنية",
    categoryEn: "Quranic Verse",
    textAr: "« إِنَّ مَعَ الْعُسْرِ يُسْرًا »",
    textEn: '"Indeed, with hardship [will be] ease."',
    sourceAr: "سورة الشرح • الآية ٦",
    sourceEn: "Surah Ash-Sharh • Ayah 6",
    explanationAr: "يقين ربّاني مريح للقلب؛ إنّ كل حزن أو كرب يصحبه يسر حتمي يتخلله، فلا يغلب عسر يسرين.",
    explanationEn: "A comforting divine certainty; every difficulty is naturally accompanied by ease, assuring that hardships will never permanently overcome."
  },
  {
    id: "h-1",
    category: "hadith",
    categoryAr: "حديث شريف",
    categoryEn: "Prophetic Hadith",
    textAr: "« يَا غُلَامُ إِنِّي أُعَلِّمُكَ كَلِمَاتٍ: احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ »",
    textEn: '"O young man, I shall teach you some words of advice: Be mindful of Allah and Allah will protect you. Be mindful of Allah and you will find Him in front of you."',
    sourceAr: "رواه الترمذي وقال حديث حسن صحيح",
    sourceEn: "Jami` at-Tirmidhi • Authentic",
    explanationAr: "من حفظ حدود الله وأوامره بالامتثال والوقوف عندها، حفظه الله في دينه ودنياه وصانه من شرور الخلق وعوارض الزمان.",
    explanationEn: "Whoever safeguards the boundaries of Allah, Allah protects them in their faith and life, defending them from all harms."
  },
  {
    id: "h-2",
    category: "hadith",
    categoryAr: "حديث شريف",
    categoryEn: "Prophetic Hadith",
    textAr: "« الدُّنْيَا حُلْوَةٌ خَضِرَةٌ، وَإِنَّ اللهَ مُسْتَخْلِفُكُمْ فِيهَا فَيَنْظُرُ كَيْفَ تَعْمَلُونَ »",
    textEn: '"The world is sweet and green, and verily Allah is making you to succeed each other in it in order to see how you act."',
    sourceAr: "صحيح مسلم • كتاب الرقاق",
    sourceEn: "Sahih Muslim • Book of Heart-Melters",
    explanationAr: "دعوة لليقظة؛ الدنيا دار اختبار بمتاعها الجميل، والموفق من عمّرها بالخير والعدل والإحسان دون التعلق الفاني بزينتها.",
    explanationEn: "A call for mindfulness; this life is a temporary test of beautiful adornments, and the successful is the one who seeds it with good deeds."
  },
  {
    id: "h-3",
    category: "hadith",
    categoryAr: "حديث شريف",
    categoryEn: "Prophetic Hadith",
    textAr: "« مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ »",
    textEn: '"Whoever takes a path upon which to seek knowledge, Allah will make the path to Paradise easy for him."',
    sourceAr: "صحيح مسلم • كتاب الذكر والدعاء",
    sourceEn: "Sahih Muslim • Book of Knowledge",
    explanationAr: "فضل العلم وأهله؛ السعي والترحال طلباً للعلم الشرعي والدنيوي النافع يذلل العقبات في الآخرة ويسلك بالعبد مدارج الرضوان الإلهي.",
    explanationEn: "The virtue of knowledge; traveling and exerting effort to learn useful matters paves a blessed path to eternal bliss."
  },
  {
    id: "w-1",
    category: "wisdom",
    categoryAr: "حكمة بليغة",
    categoryEn: "Islamic Wisdom",
    textAr: "« لَوْ عَلِمَ الْمُصَلِّي مَنْ يُنَاجِي، مَا انْفَتَلَ مِنْ صَلَاتِهِ أَبَدًا »",
    textEn: '"If the prayer-performer knew Whom he was intimately conversing with, he would never wish to turn away from his prayer."',
    sourceAr: "أثر بليغ للحسن البصري رحمه الله",
    sourceEn: "Al-Hasan Al-Basri",
    explanationAr: "تعظيم لمقام الصلاة؛ الوقوف بين يدي ملك الملوك هو أعظم مقام شرفي، واستشعار جلال الله يورث الخشوع واللذة الروحية العميقة.",
    explanationEn: "Exalting the stature of prayer; standing before the Sovereign of sovereigns is the highest honor, bringing deep spiritual ecstasy."
  },
  {
    id: "w-2",
    category: "wisdom",
    categoryAr: "حكمة بليغة",
    categoryEn: "Islamic Wisdom",
    textAr: "« مَا مِنْ بَلاءٍ يُصِيبُ الْعَبْدَ إِلَّا وَفِيهِ ثَلاثُ نِعَمٍ: أَنَّهُ لَمْ يَكُنْ فِي دِينِهِ، وَأَنَّهُ لَمْ يَكُنْ أَعْظَمَ مِمَّا كَانَ، وَأَنَّ اللَّهَ يَرْزُقُ الصَّبْرَ عَلَيْهِ »",
    textEn: '"There is no affliction that strikes a servant except that it holds three blessings: that it was not in their religion, that it was not bigger than it was, and that Allah grants patience over it."',
    sourceAr: "من درر الإمام شريح القاضي رحمه الله",
    sourceEn: "Shurayh Al-Qadi",
    explanationAr: "نظرة الرضا والتفاؤل في المحن؛ كل مصيبة دنيوية تهون ما دامت عقيدة العبد سليمة، ولطف الله يرافق الابتلاء ببرد الصبر والاحتساب.",
    explanationEn: "A perspective of contentment; worldly trials are light as long as one's faith is intact, and Allah's kindness accompanies adversity."
  },
  {
    id: "w-3",
    category: "wisdom",
    categoryAr: "حكمة بليغة",
    categoryEn: "Islamic Wisdom",
    textAr: "« الْعِلْمُ بِلَا عَمَلٍ جُنُونٌ، وَالْعَمَلُ بِلَا عِلْمٍ لَا يَكُونُ »",
    textEn: '"Knowledge without action is madness, and action without knowledge cannot properly exist."',
    sourceAr: "من نصائح الإمام الغزالي في كتاب أيها الولد",
    sourceEn: "Imam Al-Ghazali • O Beloved Son",
    explanationAr: "الترابط المتين؛ العلم النافع هو الشجرة والعمل الصالح هو الثمرة، ولا قيمة للمعلومات إن لم تنعكس خُلُقاً وسلوكاً وصلاحاً في الأرض.",
    explanationEn: "The vital link; useful knowledge is the tree and righteous action is the fruit. Information holds no value unless translated to ethical conduct."
  },
  {
    id: "d-1",
    category: "dua",
    categoryAr: "دعاء مأثور",
    categoryEn: "Noble Dua",
    textAr: "« اللَّهُمَّ إِنِّي أَسْأَلُكَ نَفْسًا بِكَ مُطْمَئِنَّةً، تُؤْمِنُ بِلِقَائِكَ، وَتَرْضَى بِقَضَائِكَ، وَتَقْنَعُ بِعَطَائِكَ »",
    textEn: '"O Allah, I ask You for a soul that finds peace in You, believes in meeting You, is content with Your decree, and is satisfied with Your giving."',
    sourceAr: "دعاء مأثور من السنن النبوية",
    sourceEn: "Recorded Prophetic Supplication",
    explanationAr: "دعاء جامع لراحة النفس وسكينتها من خلال طلب الطمأنينة والإيمان التام بالآخرة والرضا بما قسمه الله تبارك وتعالى.",
    explanationEn: "A comprehensive prayer seeking peace of mind, strong belief in the afterlife, and absolute satisfaction with divine destiny."
  },
  {
    id: "d-2",
    category: "dua",
    categoryAr: "دعاء مأثور",
    categoryEn: "Noble Dua",
    textAr: "« يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ »",
    textEn: '"O Turner of hearts, keep my heart firm on Your religion."',
    sourceAr: "صحيح الترمذي عن أم سلمة رضي الله عنها",
    sourceEn: "Sahih At-Tirmidhi from Umm Salamah",
    explanationAr: "أكثر دعاء كان يردده النبي صلى الله عليه وسلم؛ يذكرنا بأن القلوب تتقلب وتتأثر بالفتن، والاعتصام بالله هو الحامي الوحيد للثبات.",
    explanationEn: "The most frequent prayer of the Prophet; a reminder that hearts are volatile and divine preservation is the only anchor for steadfastness."
  }
];

const CARD_STYLES = [
  { id: "star_gold", nameAr: "النجمة الأندلسية الذهبية", nameEn: "Andalusian Gold", bgClass: "from-[#081724] via-[#05111b] to-[#030910]", borderClass: "border-[#cca05a]/30", textCol: "text-amber-100", accentCol: "text-amber-400", subTextCol: "text-slate-400" },
  { id: "emerald_sacred", nameAr: "الزمرد المحروس", nameEn: "Sacred Emerald", bgClass: "from-[#021c13] via-[#01140d] to-[#000d08]", borderClass: "border-emerald-500/30", textCol: "text-emerald-50", accentCol: "text-emerald-400", subTextCol: "text-emerald-300/60" },
  { id: "royal_ruby", nameAr: "الياقوت الفاخر", nameEn: "Royal Ruby", bgClass: "from-[#1a0709] via-[#0f0405] to-[#080203]", borderClass: "border-rose-500/30", textCol: "text-rose-50", accentCol: "text-rose-400", subTextCol: "text-rose-300/60" },
  { id: "cosmic_indigo", nameAr: "الأزرق الكوني", nameEn: "Cosmic Indigo", bgClass: "from-[#08142c] via-[#040a16] to-[#02050b]", borderClass: "border-sky-500/30", textCol: "text-sky-50", accentCol: "text-sky-400", subTextCol: "text-sky-300/60" },
  { id: "manuscript_paper", nameAr: "الورق العتيق (مضيء)", nameEn: "Ancient Parchment (Light)", bgClass: "from-[#fbf7ee] via-[#f7f0df] to-[#eedfb9]/60", borderClass: "border-amber-800/20", textCol: "text-stone-800", accentCol: "text-amber-800", subTextCol: "text-stone-500" }
];

const RATIOS = [
  { id: "square", nameAr: "مربع (WhatsApp / Post)", nameEn: "Square (1:1)", class: "aspect-square max-w-[420px]" },
  { id: "story", nameAr: "طولي (Story / Wallpaper)", nameEn: "Story (9:16)", class: "aspect-[9/16] max-w-[340px] py-10" },
  { id: "banner", nameAr: "عرضي (Landscape)", nameEn: "Banner (16:9)", class: "aspect-[16/9] max-w-[500px]" }
];

const FONTS = [
  { id: "serif", nameAr: "أميري عتيق", nameEn: "Amiri Serif", class: "font-serif" },
  { id: "sans", nameAr: "خط واجهة حديث", nameEn: "Modern Sans", class: "font-sans" },
  { id: "mono", nameAr: "خط برمجي دقيق", nameEn: "Mono Scholarly", class: "font-mono" }
];

export default function CardsView({ darkMode }: { darkMode: boolean }) {
  const { isAr, dir, t } = useLanguage();

  // Selected state
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem>(quotesDatabase[0]);
  const [selectedStyle, setSelectedStyle] = useState(CARD_STYLES[0]);
  const [selectedRatio, setSelectedRatio] = useState(RATIOS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [signature, setSignature] = useState<string>(() => {
    return localStorage.getItem("user_quote_signature") || "";
  });

  const [activeCategory, setActiveCategory] = useState<"all" | "quran" | "hadith" | "wisdom" | "dua">("all");
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Hidden canvas reference for high quality image generation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    localStorage.setItem("user_quote_signature", signature);
  }, [signature]);

  const filteredQuotes = activeCategory === "all" 
    ? quotesDatabase 
    : quotesDatabase.filter(q => q.category === activeCategory);

  const handleRandomize = () => {
    const list = filteredQuotes.length > 0 ? filteredQuotes : quotesDatabase;
    let next = list[Math.floor(Math.random() * list.length)];
    // Try to get a different one
    if (list.length > 1 && next.id === selectedQuote.id) {
      const otherList = list.filter(q => q.id !== selectedQuote.id);
      next = otherList[Math.floor(Math.random() * otherList.length)];
    }
    setSelectedQuote(next);
  };

  const handleCopy = () => {
    const textToCopy = `✨ ${selectedQuote.categoryAr} ✨\n\n${selectedQuote.textAr}\n\n📖 المصدر: ${selectedQuote.sourceAr}\n\n💡 التفسير: ${selectedQuote.explanationAr}\n\n💬 ${isAr ? "تمت المشاركة من تطبيق أنا مسلم" : "Shared from Ana Muslim App"}\n${signature ? `✍️ ${signature}` : ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // 🎨 OFFLINE CANVAS-BASED EXPORT/DOWNLOAD OF BEAUTIFUL CARDS
  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    setDownloading(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setDownloading(false);
      return;
    }

    // Determine canvas dimensions based on ratio
    let width = 800;
    let height = 800;

    if (selectedRatio.id === "story") {
      width = 720;
      height = 1280;
    } else if (selectedRatio.id === "banner") {
      width = 1200;
      height = 675;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw Background Gradient
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) / 1.5);
    if (selectedStyle.id === "star_gold") {
      gradient.addColorStop(0, "#081724");
      gradient.addColorStop(0.5, "#05111b");
      gradient.addColorStop(1, "#030910");
    } else if (selectedStyle.id === "emerald_sacred") {
      gradient.addColorStop(0, "#021c13");
      gradient.addColorStop(0.5, "#01140d");
      gradient.addColorStop(1, "#000d08");
    } else if (selectedStyle.id === "royal_ruby") {
      gradient.addColorStop(0, "#1a0709");
      gradient.addColorStop(0.5, "#0f0405");
      gradient.addColorStop(1, "#080203");
    } else if (selectedStyle.id === "cosmic_indigo") {
      gradient.addColorStop(0, "#08142c");
      gradient.addColorStop(0.5, "#040a16");
      gradient.addColorStop(1, "#02050b");
    } else {
      // manuscript
      gradient.addColorStop(0, "#fbf7ee");
      gradient.addColorStop(0.5, "#f7f0df");
      gradient.addColorStop(1, "#eedfb9");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Color definitions
    const isLight = selectedStyle.id === "manuscript_paper";
    const primaryTextColor = isLight ? "#1c1917" : "#f8fafc"; // slate-50 or stone-900
    const goldColor = isLight ? "#92400e" : "#cca05a"; // amber-800 or gold
    const subtitleColor = isLight ? "#57534e" : "#94a3b8"; // slate-400 or stone-500

    // Draw Islamic Geometric Accent Ornaments / Borders
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 3;
    
    // Outer border
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Inner elegant double border
    ctx.strokeStyle = isLight ? "rgba(146, 64, 14, 0.4)" : "rgba(204, 160, 90, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Draw Corner geometric brackets
    const bracketSize = 35;
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 3.5;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(30 + bracketSize, 30);
    ctx.lineTo(30, 30);
    ctx.lineTo(30, 30 + bracketSize);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - 30 - bracketSize, 30);
    ctx.lineTo(width - 30, 30);
    ctx.lineTo(width - 30, 30 + bracketSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(30 + bracketSize, height - 30);
    ctx.lineTo(30, height - 30);
    ctx.lineTo(30, height - 30 - bracketSize);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 30 - bracketSize, height - 30);
    ctx.lineTo(width - 30, height - 30);
    ctx.lineTo(width - 30, height - 30 - bracketSize);
    ctx.stroke();

    // Draw central category badge at the top
    ctx.fillStyle = isLight ? "rgba(146, 64, 14, 0.1)" : "rgba(204, 160, 90, 0.1)";
    const badgeW = 220;
    const badgeH = 45;
    ctx.fillRect(width / 2 - badgeW / 2, 55, badgeW, badgeH);
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(width / 2 - badgeW / 2, 55, badgeW, badgeH);

    ctx.fillStyle = goldColor;
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`❖ ${selectedQuote.categoryAr.toUpperCase()} ❖`, width / 2, 55 + badgeH / 2);

    // Write Main Text (Arabic text is right-to-left, we wrap lines properly)
    ctx.fillStyle = primaryTextColor;
    
    // Set appropriate font sizes depending on ratio and layout
    let quoteFontSize = selectedRatio.id === "story" ? 28 : 32;
    if (selectedQuote.textAr.length > 100) {
      quoteFontSize -= 6;
    }

    ctx.font = `bold ${quoteFontSize}px Amiri, Georgia, serif`;
    ctx.textAlign = "center";

    // Text Wrapping function
    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(" ");
      let line = "";
      const lines: string[] = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + i * lineHeight);
      }
      return lines.length * lineHeight;
    };

    const maxTextW = width - 140;
    let textStartY = height / 2.8;

    if (selectedRatio.id === "story") {
      textStartY = height / 3.4;
    }

    // Write Arabic quote
    const arabicLineHeight = quoteFontSize * 1.45;
    const arabicTextHeight = wrapText(selectedQuote.textAr, width / 2, textStartY, maxTextW, arabicLineHeight);

    // Draw divider
    const divY = textStartY + arabicTextHeight + 35;
    ctx.strokeStyle = "rgba(204, 160, 90, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, divY);
    ctx.lineTo(width / 2 + 120, divY);
    ctx.stroke();

    // Write Source & Translation
    const sourceY = divY + 40;
    ctx.fillStyle = goldColor;
    ctx.font = "bold 16px Arial";
    ctx.fillText(selectedQuote.sourceAr, width / 2, sourceY);

    // Write English translation
    const translationFontSize = selectedRatio.id === "story" ? 17 : 19;
    ctx.font = `italic ${translationFontSize}px Arial, sans-serif`;
    ctx.fillStyle = subtitleColor;
    const translationLineHeight = translationFontSize * 1.4;
    
    wrapText(selectedQuote.textEn, width / 2, sourceY + 45, maxTextW, translationLineHeight);

    // Draw user signature if supplied
    if (signature.trim()) {
      const sigY = height - 90;
      ctx.fillStyle = goldColor;
      ctx.font = "bold 14px Arial";
      ctx.fillText(`✍️ ${signature.trim()}`, width / 2, sigY);
    }

    // Watermark Ana Muslim at bottom
    ctx.fillStyle = isLight ? "rgba(146, 64, 14, 0.4)" : "rgba(204, 160, 90, 0.4)";
    ctx.font = "10px monospace";
    ctx.fillText("ANA MUSLIM CLIENT • ISLAMIC CARDS", width / 2, height - 60);

    // Save/Download link
    setTimeout(() => {
      try {
        const imageURI = canvas.toDataURL("image/jpeg", 0.9);
        const link = document.createElement("a");
        link.download = `ana_muslim_quote_${selectedQuote.id}.jpg`;
        link.href = imageURI;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Failed to export image:", err);
      } finally {
        setDownloading(false);
      }
    }, 400);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 md:p-6 space-y-6" style={{ direction: dir }}>
      
      {/* HEADER SPLASH */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 ${
        darkMode 
          ? "bg-gradient-to-br from-[#071b29] to-[#04121e] border-[#cca05a]/20" 
          : "bg-gradient-to-br from-amber-50 to-orange-100/40 border-amber-900/10"
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-5.5 h-5.5 text-amber-500 animate-pulse" />
              {isAr ? "صانع بطاقات الاقتباسات والبطاقات الدعوية" : "Islamic Quote & Card Generator"}
            </h2>
            <p className="text-[11px] text-slate-400 font-light mt-1 max-w-xl">
              {isAr 
                ? "اختر آية قرآنية، حديث شريف، أو حكمة دعوية ثم صممها بخلفيات هندسية إسلامية جذابة لتشاركها في الصباح والمساء كصدقة جارية."
                : "Select verses, prophetic traditions, or scholars' wisdom to formulate gorgeous customizable cards for online sharing."}
            </p>
          </div>

          <button
            onClick={handleRandomize}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#cca05a] hover:bg-amber-600 transition text-slate-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer shrink-0"
          >
            <Shuffle className="w-4 h-4" />
            <span>{isAr ? "اقتباس عشوائي" : "Random Quote"}</span>
          </button>
        </div>
      </div>

      {/* FILTER CATEGORY PILLS */}
      <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-start">
        {[
          { id: "all", labelAr: "الكل", labelEn: "All", icon: FileText },
          { id: "quran", labelAr: "آيات قرآنية", labelEn: "Quranic Verses", icon: BookOpen },
          { id: "hadith", labelAr: "أحاديث شريفة", labelEn: "Hadiths", icon: Award },
          { id: "wisdom", labelAr: "مواعظ السلف", labelEn: "Wisdom", icon: Bookmark },
          { id: "dua", labelAr: "أدعية مأثورة", labelEn: "Supplications", icon: Heart },
        ].map((cat) => {
          const isSelected = activeCategory === cat.id;
          const CatIcon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                // Immediately pick one from the chosen category
                const list = cat.id === "all" ? quotesDatabase : quotesDatabase.filter(q => q.category === cat.id);
                if (list.length > 0) {
                  setSelectedQuote(list[0]);
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                isSelected
                  ? "bg-[#cca05a]/25 border border-[#cca05a] text-amber-200 shadow-sm"
                  : "bg-slate-950/20 border border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <CatIcon className="w-3.5 h-3.5" />
              <span>{isAr ? cat.labelAr : cat.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN GENERATOR INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CUSTOMIZATION WORKBENCH */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* BACKGROUND DESIGNS */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
          }`}>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" />
              {isAr ? "مظهر البطاقة الفني" : "Visual Theme / Background"}
            </span>
            <div className="grid grid-cols-1 gap-2">
              {CARD_STYLES.map((style) => {
                const isSel = selectedStyle.id === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-2.5 rounded-lg border text-right text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isSel 
                        ? "border-[#cca05a] bg-[#cca05a]/10 text-white" 
                        : "bg-slate-950/20 border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{isAr ? style.nameAr : style.nameEn}</span>
                    <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${style.bgClass} border border-white/10`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* FONTS AND RATIO CHOICES */}
          <div className={`p-4 rounded-xl border space-y-3.5 ${
            darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
          }`}>
            
            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Layout className="w-3.5 h-3.5" />
                {isAr ? "قياسات ومقاس البطاقة" : "Card Dimensions"}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {RATIOS.map((r) => {
                  const isSel = selectedRatio.id === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRatio(r)}
                      className={`py-2 px-1 rounded-lg text-[10px] font-bold border transition text-center cursor-pointer ${
                        isSel
                          ? "bg-[#cca05a]/20 border-[#cca05a] text-amber-100"
                          : "bg-slate-950/30 border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {isAr ? r.nameAr.split(" ")[0] : r.nameEn.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Style Selection */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Type className="w-3.5 h-3.5" />
                {isAr ? "خط ونقش الكتابة" : "Calligraphy Font"}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {FONTS.map((f) => {
                  const isSel = selectedFont.id === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFont(f)}
                      className={`py-2 px-1 rounded-lg text-[10px] font-bold border transition text-center cursor-pointer ${
                        isSel
                          ? "bg-[#cca05a]/20 border-[#cca05a] text-amber-100"
                          : "bg-slate-950/30 border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {isAr ? f.nameAr : f.nameEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Author/Share Signature */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {isAr ? "توقيع المشارك المخصص" : "Custom Share Signature"}
              </span>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder={isAr ? "مثال: أخوكم في الله شاهر" : "e.g. Your brother Shaher"}
                className="w-full bg-slate-950/60 border border-white/5 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>

          {/* RICH QUOTES EXPLORER SELECTOR */}
          <div className={`p-4 rounded-xl border space-y-3 max-h-[220px] overflow-y-auto ${
            darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
          }`}>
            <span className="text-xs font-bold text-amber-400 block">
              {isAr ? "📚 اختر من القائمة مباشرة" : "📚 Select Directly from List"}
            </span>
            <div className="space-y-2">
              {filteredQuotes.map((q) => {
                const isSel = selectedQuote.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuote(q)}
                    className={`p-2 rounded-lg text-right text-[11px] font-light cursor-pointer border transition ${
                      isSel 
                        ? "border-[#cca05a]/50 bg-[#cca05a]/10 text-amber-200" 
                        : "bg-slate-950/20 border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold text-[#cca05a] mb-0.5">{isAr ? q.categoryAr : q.categoryEn}</div>
                    <div className="line-clamp-1">{isAr ? q.textAr : q.textEn}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE VISUAL CANVAS CARD PREVIEW & SHARE ACTION HUB */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-5">
          
          {/* LIVE RENDERING CONTAINER */}
          <div 
            id="islamic-card-preview"
            className={`w-full relative rounded-2xl border transition-all duration-300 shadow-2xl flex flex-col justify-between p-6 md:p-8 text-center bg-gradient-to-br overflow-hidden ${selectedRatio.class} ${selectedStyle.bgClass} ${selectedStyle.borderClass}`}
          >
            {/* Islamic geometric background vectors simulated via CSS grids */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[radial-gradient(#cca05a_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Corner traditional ornaments */}
            <div className={`absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 pointer-events-none ${selectedStyle.borderClass.replace("border-", "border-t-").replace("border-", "border-r-")}`} />
            <div className={`absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 pointer-events-none ${selectedStyle.borderClass.replace("border-", "border-t-").replace("border-", "border-l-")}`} />
            <div className={`absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 pointer-events-none ${selectedStyle.borderClass.replace("border-", "border-b-").replace("border-", "border-r-")}`} />
            <div className={`absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 pointer-events-none ${selectedStyle.borderClass.replace("border-", "border-b-").replace("border-", "border-l-")}`} />

            {/* Top Category Tag */}
            <div className="pt-2">
              <span className={`inline-block px-4 py-1.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider border ${selectedStyle.borderClass} ${selectedStyle.bgClass} ${selectedStyle.accentCol}`}>
                ❖ {isAr ? selectedQuote.categoryAr : selectedQuote.categoryEn} ❖
              </span>
            </div>

            {/* Main content block */}
            <div className="my-auto py-6 space-y-4">
              <p 
                className={`transition-all leading-relaxed text-balance ${selectedFont.class} ${selectedStyle.textCol}`}
                style={{ fontSize: selectedRatio.id === "story" ? "18px" : "21px" }}
              >
                {isAr ? selectedQuote.textAr : selectedQuote.textEn}
              </p>
              
              <div className="w-16 h-[1.5px] bg-[#cca05a]/25 mx-auto" />
              
              <p className={`text-[11px] font-bold ${selectedStyle.accentCol}`}>
                {isAr ? selectedQuote.sourceAr : selectedQuote.sourceEn}
              </p>
            </div>

            {/* Bottom info signature */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              {signature.trim() && (
                <p className={`text-xs font-bold ${selectedStyle.accentCol}`}>
                  ✍️ {signature.trim()}
                </p>
              )}
              <p className="text-[9px] tracking-widest uppercase font-mono text-slate-500/80">
                ANA MUSLIM CLIENT • ISLAMIC CARDS
              </p>
            </div>
          </div>

          {/* ACTION HUB PANEL */}
          <div className="w-full grid grid-cols-2 gap-3 max-w-[420px]">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900/60 border border-white/5 hover:bg-slate-950 transition text-slate-100 font-extrabold text-xs rounded-xl cursor-pointer shadow"
            >
              {copySuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">{isAr ? "تم نسخ النص!" : "Copied Text!"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{isAr ? "نسخ اقتباس النص" : "Copy Card Text"}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 transition text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer shadow-md"
            >
              {downloading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{isAr ? "جاري الحفظ..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isAr ? "تحميل كبطاقة صورة" : "Download as Image"}</span>
                </>
              )}
            </button>
          </div>

          {/* Hidden Canvas Element for exact high resolution rendering exports */}
          <canvas ref={canvasRef} className="hidden" />

          {/* EXPLANATION / TAFASEER CONTAINER */}
          <div className={`p-4 rounded-xl border w-full max-w-[420px] text-right space-y-2.5 ${
            darkMode ? "bg-slate-950/20 border-white/5" : "bg-white border-amber-900/10"
          }`}>
            <span className="text-[10px] font-extrabold text-[#cca05a] uppercase block tracking-wider">
              {isAr ? "📖 الفائدة والتفسير الميسّر" : "📖 Spiritual Benefit & Tafsir"}
            </span>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {isAr ? selectedQuote.explanationAr : selectedQuote.explanationEn}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
