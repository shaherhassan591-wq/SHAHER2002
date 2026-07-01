export interface EgyptCenter {
  id: string;
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
}

export interface EgyptGovernorate {
  id: string;
  nameAr: string;
  nameEn: string;
  centers: EgyptCenter[];
}

export const EGYPT_GOVERNORATES: EgyptGovernorate[] = [
  {
    id: "cairo",
    nameAr: "القاهرة",
    nameEn: "Cairo",
    centers: [
      { id: "cairo_city", nameAr: "مدينة القاهرة (العاصمة)", nameEn: "Cairo City", lat: 30.0444, lng: 31.2357 },
      { id: "helwan", nameAr: "حلوان", nameEn: "Helwan", lat: 29.8412, lng: 31.3006 },
      { id: "maadi", nameAr: "المعادي", nameEn: "Maadi", lat: 29.9602, lng: 31.2569 },
      { id: "new_cairo", nameAr: "القاهرة الجديدة (التجمع)", nameEn: "New Cairo", lat: 30.0247, lng: 31.4887 },
      { id: "heliopolis", nameAr: "مصر الجديدة", nameEn: "Heliopolis", lat: 30.1032, lng: 31.3396 },
      { id: "shubra", nameAr: "شبرا مصر", nameEn: "Shubra", lat: 30.0761, lng: 31.2447 },
      { id: "shorouk", nameAr: "مدينة الشروق", nameEn: "El Shorouk", lat: 30.1411, lng: 31.6267 },
      { id: "badr_city", nameAr: "مدينة بدر", nameEn: "Badr City", lat: 30.1378, lng: 31.7411 }
    ]
  },
  {
    id: "giza",
    nameAr: "الجيزة",
    nameEn: "Giza",
    centers: [
      { id: "giza_city", nameAr: "مدينة الجيزة", nameEn: "Giza City", lat: 30.0131, lng: 31.2089 },
      { id: "october_6", nameAr: "مدينة ٦ أكتوبر", nameEn: "6th of October", lat: 29.9734, lng: 30.9485 },
      { id: "sheikh_zayed", nameAr: "الشيخ زايد", nameEn: "Sheikh Zayed", lat: 30.0457, lng: 30.9814 },
      { id: "badrashein", nameAr: "البدرشين", nameEn: "Badrashein", lat: 29.8516, lng: 31.2721 },
      { id: "ayat", nameAr: "العياط", nameEn: "Ayat", lat: 29.6191, lng: 31.2587 },
      { id: "atfih", nameAr: "أطفيح", nameEn: "Atfih", lat: 29.4216, lng: 31.2522 },
      { id: "osim", nameAr: "أوسيم", nameEn: "Osim", lat: 30.1345, lng: 31.1444 },
      { id: "abu_nemros", nameAr: "أبو النمرس", nameEn: "Abu Nemros", lat: 29.9312, lng: 31.2182 },
      { id: "kerdasa", nameAr: "كرداسة", nameEn: "Kerdasa", lat: 30.0332, lng: 31.1147 },
      { id: "imbaba", nameAr: "إمبابة", nameEn: "Imbaba", lat: 30.0714, lng: 31.2125 },
      { id: "al_wahat", nameAr: "الواحات البحرية", nameEn: "Al Wahat Al Bahariya", lat: 28.3512, lng: 28.8541 }
    ]
  },
  {
    id: "alexandria",
    nameAr: "الإسكندرية",
    nameEn: "Alexandria",
    centers: [
      { id: "alex_city", nameAr: "مدينة الإسكندرية", nameEn: "Alexandria City", lat: 31.2001, lng: 29.9187 },
      { id: "borg_el_arab", nameAr: "برج العرب", nameEn: "Borg El Arab", lat: 30.9152, lng: 29.5841 },
      { id: "abu_qir", nameAr: "أبو قير", nameEn: "Abu Qir", lat: 31.3121, lng: 30.0652 },
      { id: "montazah", nameAr: "المنتزه", nameEn: "Montazah", lat: 31.2845, lng: 30.0125 },
      { id: "amreya", nameAr: "العامرية", nameEn: "Amreya", lat: 31.0254, lng: 29.8142 }
    ]
  },
  {
    id: "qalyubia",
    nameAr: "القليوبية",
    nameEn: "Qalyubia",
    centers: [
      { id: "banha", nameAr: "بنها", nameEn: "Banha", lat: 30.4591, lng: 31.1856 },
      { id: "qalyub", nameAr: "قليوب", nameEn: "Qalyub", lat: 30.1794, lng: 31.2503 },
      { id: "shubra_el_kheima", nameAr: "شبرا الخيمة", nameEn: "Shubra El Kheima", lat: 30.1286, lng: 31.2422 },
      { id: "khanka", nameAr: "الخانكة", nameEn: "Khanka", lat: 30.2144, lng: 31.3686 },
      { id: "shebin_el_qanater", nameAr: "شبين القناطر", nameEn: "Shebin El Qanater", lat: 30.3122, lng: 31.3217 },
      { id: "qaha", nameAr: "قها", nameEn: "Qaha", lat: 30.2831, lng: 31.2036 },
      { id: "tukh", nameAr: "طوخ", nameEn: "Tukh", lat: 30.3542, lng: 31.1994 },
      { id: "qanater_khayreya", nameAr: "القناطر الخيرية", nameEn: "El Qanater El Khayreya", lat: 30.1917, lng: 31.1417 },
      { id: "kafr_shukr", nameAr: "كفر شكر", nameEn: "Kafr Shukr", lat: 30.5489, lng: 31.2294 },
      { id: "obour", nameAr: "مدينة العبور", nameEn: "Obour City", lat: 30.1581, lng: 31.4794 }
    ]
  },
  {
    id: "dakahlia",
    nameAr: "الدقهلية",
    nameEn: "Dakahlia",
    centers: [
      { id: "mansoura", nameAr: "المنصورة", nameEn: "Mansoura", lat: 31.0364, lng: 31.3803 },
      { id: "mit_ghamr", nameAr: "ميت غمر", nameEn: "Mit Ghamr", lat: 30.7189, lng: 31.2614 },
      { id: "talkha", nameAr: "طلخا", nameEn: "Talkha", lat: 31.0539, lng: 31.3789 },
      { id: "dekernes", nameAr: "دكرنس", nameEn: "Dekernes", lat: 31.0864, lng: 31.5956 },
      { id: "senbellawein", nameAr: "السنبلاوين", nameEn: "Senbellawein", lat: 30.8872, lng: 31.4658 },
      { id: "sherbin", nameAr: "شربين", nameEn: "Sherbin", lat: 31.1931, lng: 31.5239 },
      { id: "aga", nameAr: "أجا", nameEn: "Aga", lat: 30.8039, lng: 31.2889 },
      { id: "belqas", nameAr: "بلقاس", nameEn: "Belqas", lat: 31.2222, lng: 31.3481 },
      { id: "manzala", nameAr: "المنزلة", nameEn: "El Manzala", lat: 31.1714, lng: 31.9367 },
      { id: "matareya_d", nameAr: "المطرية", nameEn: "El Matareya", lat: 31.1831, lng: 32.0317 },
      { id: "minat_el_nasr", nameAr: "منية النصر", nameEn: "Minat El Nasr", lat: 31.1294, lng: 31.6444 },
      { id: "gamasa", nameAr: "جمصة", nameEn: "Gamasa", lat: 31.4161, lng: 31.4939 }
    ]
  },
  {
    id: "sharqia",
    nameAr: "الشرقية",
    nameEn: "Sharqia",
    centers: [
      { id: "zagazig", nameAr: "الزقازيق", nameEn: "Zagazig", lat: 30.5872, lng: 31.5022 },
      { id: "belbeis", nameAr: "بلبيس", nameEn: "Belbeis", lat: 30.4181, lng: 31.5647 },
      { id: "minya_el_qamh", nameAr: "منيا القمح", nameEn: "Minya El Qamh", lat: 30.5019, lng: 31.3394 },
      { id: "abou_hammad", nameAr: "أبو حماد", nameEn: "Abou Hammad", lat: 30.5489, lng: 31.6744 },
      { id: "hehia", nameAr: "ههيا", nameEn: "Hehia", lat: 30.6694, lng: 31.5847 },
      { id: "abu_kebir", nameAr: "أبو كبير", nameEn: "Abu Kebir", lat: 30.7247, lng: 31.6747 },
      { id: "faqus", nameAr: "فاقوس", nameEn: "Faqus", lat: 30.7314, lng: 31.8025 },
      { id: "kafr_saqr", nameAr: "كفر صقر", nameEn: "Kafr Saqr", lat: 30.8039, lng: 31.6231 },
      { id: "awlad_saqr", nameAr: "أولاد صقر", nameEn: "Awlad Saqr", lat: 30.8731, lng: 31.6794 },
      { id: "diarb_negm", nameAr: "ديرب نجم", nameEn: "Diarb Negm", lat: 30.7514, lng: 31.4889 },
      { id: "tenth_ramadan", nameAr: "العاشر من رمضان", nameEn: "10th of Ramadan", lat: 30.3012, lng: 31.7583 },
      { id: "mashtool", nameAr: "مشتول السوق", nameEn: "Mashtool El Souq", lat: 30.3544, lng: 31.4394 },
      { id: "qurein", nameAr: "القرين", nameEn: "Al Qurein", lat: 30.5989, lng: 31.7489 },
      { id: "salhia", nameAr: "الصالحية الجديدة", nameEn: "New Salhia", lat: 30.6481, lng: 31.8794 }
    ]
  },
  {
    id: "gharbia",
    nameAr: "الغربية",
    nameEn: "Gharbia",
    centers: [
      { id: "tanta", nameAr: "طنطا", nameEn: "Tanta", lat: 30.7883, lng: 31.0011 },
      { id: "mahalla", nameAr: "المحلة الكبرى", nameEn: "El Mahalla El Kubra", lat: 30.9731, lng: 31.1647 },
      { id: "kafr_el_zayat", nameAr: "كفر الزيات", nameEn: "Kafr El Zayat", lat: 30.8222, lng: 30.8144 },
      { id: "zifta", nameAr: "زفتى", nameEn: "Zifta", lat: 30.7189, lng: 31.2394 },
      { id: "samanoud", nameAr: "سمنود", nameEn: "Samanoud", lat: 30.9589, lng: 31.2394 },
      { id: "basyoun", nameAr: "بسيون", nameEn: "Basyoun", lat: 30.8989, lng: 30.8111 },
      { id: "kotour", nameAr: "قطور", nameEn: "Kotour", lat: 30.8981, lng: 31.0111 },
      { id: "santa", nameAr: "السنطة", nameEn: "El Santa", lat: 30.6989, lng: 31.1394 }
    ]
  },
  {
    id: "monufia",
    nameAr: "المنوفية",
    nameEn: "Monufia",
    centers: [
      { id: "shebin_el_kom", nameAr: "شبين الكوم", nameEn: "Shebin El Kom", lat: 30.5511, lng: 31.0111 },
      { id: "menouf", nameAr: "منوف", nameEn: "Menouf", lat: 30.4658, lng: 30.9311 },
      { id: "ashmoun", nameAr: "أشمون", nameEn: "Ashmoun", lat: 30.2981, lng: 30.9889 },
      { id: "bagour", nameAr: "الباجور", nameEn: "Bagour", lat: 30.4344, lng: 31.0394 },
      { id: "quesna", nameAr: "قويسنا", nameEn: "Quesna", lat: 30.5011, lng: 31.1394 },
      { id: "tala", nameAr: "تلا", nameEn: "Tala", lat: 30.6789, lng: 30.9394 },
      { id: "shohadaa", nameAr: "الشهداء", nameEn: "Al Shohadaa", lat: 30.5989, lng: 30.8989 },
      { id: "sadat", nameAr: "مدينة السادات", nameEn: "Sadat City", lat: 30.3789, lng: 30.5289 },
      { id: "sers_lyan", nameAr: "سرس الليان", nameEn: "Sers El Lyan", lat: 30.4344, lng: 30.9144 }
    ]
  },
  {
    id: "beheira",
    nameAr: "البحيرة",
    nameEn: "Beheira",
    centers: [
      { id: "damanhour", nameAr: "دمنهور", nameEn: "Damanhour", lat: 31.0364, lng: 30.4694 },
      { id: "kafr_el_dawwar", nameAr: "كفر الدوار", nameEn: "Kafr El Dawwar", lat: 31.1314, lng: 30.1314 },
      { id: "rosetta", nameAr: "رشيد", nameEn: "Rosetta/Rashid", lat: 31.4011, lng: 30.4167 },
      { id: "edku", nameAr: "إدكو", nameEn: "Edku", lat: 31.3144, lng: 30.2981 },
      { id: "abu_hummus", nameAr: "أبو حمص", nameEn: "Abu Hummus", lat: 31.1211, lng: 30.3011 },
      { id: "itay_baroud", nameAr: "إيتاي البارود", nameEn: "Itay El Baroud", lat: 30.8872, lng: 30.6694 },
      { id: "hosh_essa", nameAr: "حوش عيسى", nameEn: "Hosh Essa", lat: 30.8989, lng: 30.3011 },
      { id: "kom_hamada", nameAr: "كوم حمادة", nameEn: "Kom Hamada", lat: 30.7611, lng: 30.6989 },
      { id: "delengat", nameAr: "الدلنجات", nameEn: "Delengat", lat: 30.8222, lng: 30.5289 },
      { id: "mahmoudiyah", nameAr: "المحمودية", nameEn: "Mahmoudiyah", lat: 31.1856, lng: 30.5239 },
      { id: "rahmaniyah", nameAr: "الرحمانية", nameEn: "Rahmaniyah", lat: 31.1039, lng: 30.6394 },
      { id: "abu_matamir", nameAr: "أبو المطامير", nameEn: "Abu El Matamir", lat: 30.9122, lng: 30.1789 },
      { id: "badr_b", nameAr: "مركز بدر", nameEn: "Badr Center", lat: 30.5731, lng: 30.7122 },
      { id: "wadi_natrun", nameAr: "وادي النطرون", nameEn: "Wadi El Natrun", lat: 30.4111, lng: 30.3544 }
    ]
  },
  {
    id: "kafr_el_sheikh",
    nameAr: "كفر الشيخ",
    nameEn: "Kafr El Sheikh",
    centers: [
      { id: "kafr_city", nameAr: "مدينة كفر الشيخ", nameEn: "Kafr El Sheikh", lat: 31.1044, lng: 30.9414 },
      { id: "desouk", nameAr: "دسوق", nameEn: "Desouk", lat: 31.1311, lng: 30.6481 },
      { id: "fuwwah", nameAr: "فوة", nameEn: "Fuwwah", lat: 31.2039, lng: 30.5489 },
      { id: "metoubes", nameAr: "مطوبس", nameEn: "Metoubes", lat: 31.2872, lng: 30.4811 },
      { id: "qallin", nameAr: "قلين", nameEn: "Qallin", lat: 30.9989, lng: 30.8122 },
      { id: "sidi_salem", nameAr: "سيدي سالم", nameEn: "Sidi Salem", lat: 31.2689, lng: 30.7989 },
      { id: "riyadh_k", nameAr: "الرياض (كفر الشيخ)", nameEn: "Riyadh", lat: 31.2291, lng: 30.9394 },
      { id: "baltim", nameAr: "بلطيم", nameEn: "Baltim", lat: 31.5794, lng: 31.0883 },
      { id: "hamool", nameAr: "الحامول", nameEn: "Hamool", lat: 31.3122, lng: 31.1394 },
      { id: "biyala", nameAr: "بيلا", nameEn: "Biyala", lat: 31.1789, lng: 31.2189 }
    ]
  },
  {
    id: "damietta",
    nameAr: "دمياط",
    nameEn: "Damietta",
    centers: [
      { id: "damietta_city", nameAr: "مدينة دمياط", nameEn: "Damietta City", lat: 31.4164, lng: 31.8136 },
      { id: "faraskur", nameAr: "فارسكور", nameEn: "Faraskur", lat: 31.3314, lng: 31.8011 },
      { id: "zarqa", nameAr: "الزرقا", nameEn: "Zarqa", lat: 31.2581, lng: 31.7122 },
      { id: "kafr_saad", nameAr: "كفر سعد", nameEn: "Kafr Saad", lat: 31.3011, lng: 31.6789 },
      { id: "new_damietta", nameAr: "دمياط الجديدة", nameEn: "New Damietta", lat: 31.4312, lng: 31.6794 },
      { id: "ras_el_bar", nameAr: "رأس البر", nameEn: "Ras El Bar", lat: 31.5283, lng: 31.8189 }
    ]
  },
  {
    id: "port_said",
    nameAr: "بورسعيد",
    nameEn: "Port Said",
    centers: [
      { id: "port_said_city", nameAr: "مدينة بورسعيد", nameEn: "Port Said City", lat: 31.2564, lng: 32.2842 },
      { id: "port_fouad", nameAr: "بورفؤاد", nameEn: "Port Fouad", lat: 31.2483, lng: 32.3167 },
      { id: "arab_dist", nameAr: "حي العرب", nameEn: "Al-Arab District", lat: 31.2591, lng: 32.2911 },
      { id: "zohour_dist", nameAr: "حي الزهور", nameEn: "Al-Zohour District", lat: 31.2481, lng: 32.2611 }
    ]
  },
  {
    id: "ismailia",
    nameAr: "الإسماعيلية",
    nameEn: "Ismailia",
    centers: [
      { id: "ismailia_city", nameAr: "مدينة الإسماعيلية", nameEn: "Ismailia City", lat: 30.6044, lng: 32.2742 },
      { id: "tell_kebir", nameAr: "التل الكبير", nameEn: "Tell El Kebir", lat: 30.5611, lng: 31.7889 },
      { id: "fayed", nameAr: "فايد", nameEn: "Fayed", lat: 30.3294, lng: 32.3011 },
      { id: "qantara_west", nameAr: "القنطرة غرب", nameEn: "Qantara West", lat: 30.8291, lng: 32.2989 },
      { id: "qantara_east", nameAr: "القنطرة شرق", nameEn: "Qantara East", lat: 30.8511, lng: 32.3211 },
      { id: "abu_suweir", nameAr: "أبو صوير", nameEn: "Abu Suweir", lat: 30.6011, lng: 32.1489 },
      { id: "kassassin", nameAr: "القصاصين", nameEn: "Kassassin", lat: 30.5694, lng: 31.9889 }
    ]
  },
  {
    id: "suez",
    nameAr: "السويس",
    nameEn: "Suez",
    centers: [
      { id: "suez_city", nameAr: "مدينة السويس", nameEn: "Suez City", lat: 29.9744, lng: 32.5383 },
      { id: "arbaeen", nameAr: "حي الأربعين", nameEn: "Arbaeen District", lat: 29.9881, lng: 32.5281 },
      { id: "ganayen", nameAr: "حي الجناين", nameEn: "Ganayen District", lat: 30.0883, lng: 32.5111 },
      { id: "attaka", nameAr: "حي عتاقة", nameEn: "Attaka District", lat: 29.8911, lng: 32.4111 }
    ]
  },
  {
    id: "north_sinai",
    nameAr: "شمال سيناء",
    nameEn: "North Sinai",
    centers: [
      { id: "arish", nameAr: "العريش", nameEn: "Arish", lat: 31.1311, lng: 33.8033 },
      { id: "rafah", nameAr: "رفح", nameEn: "Rafah", lat: 31.2847, lng: 34.2514 },
      { id: "sheikh_zuwayed", nameAr: "الشيخ زويد", nameEn: "Sheikh Zuwayed", lat: 31.2111, lng: 34.1111 },
      { id: "bir_el_abd", nameAr: "بئر العبد", nameEn: "Bir El Abd", lat: 31.0183, lng: 33.0111 },
      { id: "nakhel", nameAr: "نخل", nameEn: "Nakhel", lat: 29.9011, lng: 33.7483 },
      { id: "hasana", nameAr: "الحسنة", nameEn: "Al-Hasana", lat: 30.4181, lng: 33.8011 }
    ]
  },
  {
    id: "south_sinai",
    nameAr: "جنوب سيناء",
    nameEn: "South Sinai",
    centers: [
      { id: "tor", nameAr: "الطور (العاصمة)", nameEn: "El Tor", lat: 28.2389, lng: 33.6211 },
      { id: "sharm_el_sheikh", nameAr: "شرم الشيخ", nameEn: "Sharm El Sheikh", lat: 27.9158, lng: 34.3299 },
      { id: "dahab", nameAr: "دهب", nameEn: "Dahab", lat: 28.5111, lng: 34.5111 },
      { id: "nuweiba", nameAr: "نويبع", nameEn: "Nuweiba", lat: 28.9734, lng: 34.6511 },
      { id: "saint_catherine", nameAr: "سانت كاترين", nameEn: "Saint Catherine", lat: 28.5583, lng: 33.9744 },
      { id: "ras_sudr", nameAr: "رأس سدر", nameEn: "Ras Sudr", lat: 29.5889, lng: 32.7122 },
      { id: "abu_zenima", nameAr: "أبو زنيمة", nameEn: "Abu Zenima", lat: 29.0411, lng: 33.1111 },
      { id: "abu_rudeis", nameAr: "أبو رديس", nameEn: "Abu Rudeis", lat: 28.8911, lng: 33.1783 }
    ]
  },
  {
    id: "fayoum",
    nameAr: "الفيوم",
    nameEn: "Fayoum",
    centers: [
      { id: "fayoum_city", nameAr: "مدينة الفيوم", nameEn: "Fayoum City", lat: 29.3084, lng: 30.8428 },
      { id: "sinnuris", nameAr: "سنورس", nameEn: "Sinnuris", lat: 29.4111, lng: 30.8644 },
      { id: "ibsheway", nameAr: "إبشواي", nameEn: "Ibsheway", lat: 29.3589, lng: 30.6789 },
      { id: "itsa", nameAr: "إطسا", nameEn: "Itsa", lat: 29.2311, lng: 30.7989 },
      { id: "tamia", nameAr: "طامية", nameEn: "Tamia", lat: 29.4711, lng: 30.9589 },
      { id: "yusuf_seddik", nameAr: "يوسف الصديق", nameEn: "Yusuf El Seddik", lat: 29.3111, lng: 30.4111 }
    ]
  },
  {
    id: "beni_suef",
    nameAr: "بني سويف",
    nameEn: "Beni Suef",
    centers: [
      { id: "beni_suef_city", nameAr: "مدينة بني سويف", nameEn: "Beni Suef City", lat: 29.0744, lng: 31.0983 },
      { id: "nasser", nameAr: "ناصر (بشري)", nameEn: "Nasser", lat: 29.1581, lng: 31.0883 },
      { id: "biba", nameAr: "ببا", nameEn: "Biba", lat: 28.9144, lng: 30.9789 },
      { id: "sumusta", nameAr: "سمسطا", nameEn: "Sumusta", lat: 28.9011, lng: 30.8411 },
      { id: "fashn", nameAr: "الفشن", nameEn: "El Fashn", lat: 28.7291, lng: 30.8989 },
      { id: "ihnasia", nameAr: "إهناسيا", nameEn: "Ihnasia", lat: 29.0883, lng: 30.9111 },
      { id: "wasta", nameAr: "الواسطى", nameEn: "Wasta", lat: 29.3391, lng: 31.2011 }
    ]
  },
  {
    id: "minya",
    nameAr: "المنيا",
    nameEn: "Minya",
    centers: [
      { id: "minya_city", nameAr: "مدينة المنيا", nameEn: "Minya City", lat: 28.0904, lng: 30.7511 },
      { id: "mallawi", nameAr: "ملوي", nameEn: "Mallawi", lat: 27.7289, lng: 30.8411 },
      { id: "samalut", nameAr: "سمالوط", nameEn: "Samalut", lat: 28.3011, lng: 30.7122 },
      { id: "maghagha", nameAr: "مغاغة", nameEn: "Maghagha", lat: 28.6481, lng: 30.8411 },
      { id: "abu_qurqas", nameAr: "أبو قرقاص", nameEn: "Abu Qurqas", lat: 27.9311, lng: 30.8291 },
      { id: "bani_mazar", nameAr: "بني مزار", nameEn: "Bani Mazar", lat: 28.5011, lng: 30.8122 },
      { id: "el_idwa", nameAr: "العدوة", nameEn: "El Idwa", lat: 28.6989, lng: 30.6989 },
      { id: "deir_mawas", nameAr: "دير مواس", nameEn: "Deir Mawas", lat: 27.6391, lng: 30.8411 },
      { id: "matai", nameAr: "مطاي", nameEn: "Matai", lat: 28.4111, lng: 30.7831 }
    ]
  },
  {
    id: "asyut",
    nameAr: "أسيوط",
    nameEn: "Asyut",
    centers: [
      { id: "asyut_city", nameAr: "مدينة أسيوط", nameEn: "Asyut City", lat: 27.1804, lng: 31.1836 },
      { id: "dairut", nameAr: "ديروط", nameEn: "Dairut", lat: 27.5511, lng: 30.8111 },
      { id: "manfalut", nameAr: "منفلوط", nameEn: "Manfalut", lat: 27.3111, lng: 30.9694 },
      { id: "abnoub", nameAr: "أبنوب", nameEn: "Abnoub", lat: 27.2689, lng: 31.1511 },
      { id: "abu_tig", nameAr: "أبو تيج", nameEn: "Abu Tig", lat: 27.0489, lng: 31.3189 },
      { id: "el_badari", nameAr: "البداري", nameEn: "El Badari", lat: 26.9891, lng: 31.4111 },
      { id: "sahel_selim", nameAr: "ساحل سليم", nameEn: "Sahel Selim", lat: 27.0511, lng: 31.3489 },
      { id: "qusiya", nameAr: "القوصية", nameEn: "El Qusiya", lat: 27.4389, lng: 30.8111 },
      { id: "fateh", nameAr: "الفتح", nameEn: "El Fateh", lat: 27.1989, lng: 31.2111 },
      { id: "sedfa", nameAr: "صدفا", nameEn: "Sedfa", lat: 26.9744, lng: 31.3011 },
      { id: "ghanayem", nameAr: "الغنايم", nameEn: "Al Ghanayem", lat: 26.8911, lng: 31.2189 }
    ]
  },
  {
    id: "sohag",
    nameAr: "سوهاج",
    nameEn: "Sohag",
    centers: [
      { id: "sohag_city", nameAr: "مدينة سوهاج", nameEn: "Sohag City", lat: 26.5564, lng: 31.6947 },
      { id: "akhmim", nameAr: "أخميم", nameEn: "Akhmim", lat: 26.5611, lng: 31.7489 },
      { id: "girga", nameAr: "جرجا", nameEn: "Girga", lat: 26.3394, lng: 31.8889 },
      { id: "tahta", nameAr: "طهطا", nameEn: "Tahta", lat: 26.7689, lng: 31.5011 },
      { id: "balyana", nameAr: "البلينا", nameEn: "Balyana", lat: 26.2311, lng: 31.9989 },
      { id: "monsha", nameAr: "المنشأة", nameEn: "Monsha'a", lat: 26.4711, lng: 31.8011 },
      { id: "maragha", nameAr: "المراغة", nameEn: "Maragha", lat: 26.6911, lng: 31.6011 },
      { id: "dar_salam", nameAr: "دار السلام", nameEn: "Dar El Salam", lat: 26.2689, lng: 32.0489 },
      { id: "juhayna", nameAr: "جهينة", nameEn: "Juhayna", lat: 26.6789, lng: 31.4889 },
      { id: "sakalta", nameAr: "ساقلتة", nameEn: "Sakalta", lat: 26.6511, lng: 31.7989 },
      { id: "tima", nameAr: "طما", nameEn: "Tima", lat: 26.9111, lng: 31.4394 }
    ]
  },
  {
    id: "qena",
    nameAr: "قنا",
    nameEn: "Qena",
    centers: [
      { id: "qena_city", nameAr: "مدينة قنا", nameEn: "Qena City", lat: 26.1564, lng: 32.7164 },
      { id: "kus", nameAr: "قوص", nameEn: "Kus", lat: 25.9122, lng: 32.7689 },
      { id: "deshna", nameAr: "دشنا", nameEn: "Deshna", lat: 26.1211, lng: 32.4811 },
      { id: "abu_tesht", nameAr: "أبو تشت", nameEn: "Abu Tesht", lat: 26.1111, lng: 32.0989 },
      { id: "farshoot", nameAr: "فرشوط", nameEn: "Farshoot", lat: 26.0489, lng: 32.1489 },
      { id: "nag_hammadi", nameAr: "نجع حمادي", nameEn: "Nag Hammadi", lat: 26.0489, lng: 32.2389 },
      { id: "naqada", nameAr: "نقادة", nameEn: "Naqada", lat: 25.8989, lng: 32.7211 },
      { id: "waqt", nameAr: "الوقف", nameEn: "Waqt", lat: 26.1291, lng: 32.3511 },
      { id: "qft", nameAr: "قفط", nameEn: "Qft", lat: 25.9989, lng: 32.8122 }
    ]
  },
  {
    id: "luxor",
    nameAr: "الأقصر",
    nameEn: "Luxor",
    centers: [
      { id: "luxor_city", nameAr: "مدينة الأقصر", nameEn: "Luxor City", lat: 25.6872, lng: 32.6397 },
      { id: "esna", nameAr: "إسنا", nameEn: "Esna", lat: 25.2911, lng: 32.5511 },
      { id: "armant", nameAr: "أرمنت", nameEn: "Armant", lat: 25.6189, lng: 32.5311 },
      { id: "bayadiyah", nameAr: "البياضية", nameEn: "Al-Bayadiyah", lat: 25.6511, lng: 32.6111 },
      { id: "tud", nameAr: "الطود", nameEn: "Al-Tud", lat: 25.5989, lng: 32.5989 },
      { id: "zayniyah", nameAr: "الزينيه", nameEn: "Al-Zayniyah", lat: 25.7311, lng: 32.6511 },
      { id: "new_luxor", nameAr: "طيبة الجديدة", nameEn: "New Luxor", lat: 25.7583, lng: 32.7489 }
    ]
  },
  {
    id: "aswan",
    nameAr: "أسوان",
    nameEn: "Aswan",
    centers: [
      { id: "aswan_city", nameAr: "مدينة أسوان", nameEn: "Aswan City", lat: 24.0889, lng: 32.8997 },
      { id: "kom_ombo", nameAr: "كوم أمبو", nameEn: "Kom Ombo", lat: 24.4711, lng: 32.9489 },
      { id: "edfu", nameAr: "إدفو", nameEn: "Edfu", lat: 24.9789, lng: 32.8711 },
      { id: "nasr_nuba", nameAr: "نصر النوبة", nameEn: "Nasr El Nuba", lat: 24.4111, lng: 32.9111 },
      { id: "daraw", nameAr: "دراو", nameEn: "Daraw", lat: 24.4011, lng: 32.9311 },
      { id: "abu_simbel", nameAr: "أبو سمبل", nameEn: "Abu Simbel", lat: 22.3389, lng: 31.6211 }
    ]
  },
  {
    id: "red_sea",
    nameAr: "البحر الأحمر",
    nameEn: "Red Sea",
    centers: [
      { id: "hurghada", nameAr: "الغردقة (العاصمة)", nameEn: "Hurghada", lat: 27.2578, lng: 33.8116 },
      { id: "safaga", nameAr: "سفاجا", nameEn: "Safaga", lat: 26.7291, lng: 33.9394 },
      { id: "quseir", nameAr: "القصير", nameEn: "Quseir", lat: 26.1039, lng: 34.2811 },
      { id: "marsa_alam", nameAr: "مرسى علم", nameEn: "Marsa Alam", lat: 25.0789, lng: 34.8911 },
      { id: "ras_gharib", nameAr: "رأس غارب", nameEn: "Ras Gharib", lat: 28.3589, lng: 33.0789 },
      { id: "shalateen", nameAr: "شلاتين", nameEn: "Shalateen", lat: 22.3011, lng: 36.3111 },
      { id: "halayeb", nameAr: "حلايب", nameEn: "Halayeb", lat: 22.2189, lng: 36.6394 }
    ]
  },
  {
    id: "new_valley",
    nameAr: "الوادي الجديد",
    nameEn: "New Valley",
    centers: [
      { id: "kharga", nameAr: "الخارجة (العاصمة)", nameEn: "Kharga", lat: 25.4389, lng: 30.5511 },
      { id: "dakhla", nameAr: "الداخلة", nameEn: "Dakhla", lat: 25.5189, lng: 28.9889 },
      { id: "farafra", nameAr: "الفرافرة", nameEn: "Farafra", lat: 27.0583, lng: 27.9744 },
      { id: "baris", nameAr: "باريس", nameEn: "Baris", lat: 24.6789, lng: 30.5989 },
      { id: "balat", nameAr: "بلاط", nameEn: "Balat", lat: 25.5683, lng: 29.2744 }
    ]
  },
  {
    id: "matrouh",
    nameAr: "مطروح",
    nameEn: "Matrouh",
    centers: [
      { id: "matrouh_city", nameAr: "مرسى مطروح (العاصمة)", nameEn: "Marsa Matrouh", lat: 31.3528, lng: 27.2361 },
      { id: "alamein", nameAr: "العلمين", nameEn: "El Alamein", lat: 30.8389, lng: 28.9511 },
      { id: "siwa", nameAr: "سيوة", nameEn: "Siwa", lat: 29.2039, lng: 25.5189 },
      { id: "dabaa", nameAr: "الضبعة", nameEn: "Dabaa", lat: 31.0289, lng: 28.4389 },
      { id: "sallum", nameAr: "السلوم", nameEn: "Sallum", lat: 31.5589, lng: 25.1511 },
      { id: "barrani", nameAr: "سيدي براني", nameEn: "Sidi Barrani", lat: 31.6039, lng: 25.9289 },
      { id: "hamam", nameAr: "الحمام", nameEn: "Hamam", lat: 30.8289, lng: 29.3989 },
      { id: "negaila", nameAr: "النجيلة", nameEn: "Negaila", lat: 31.4289, lng: 26.6389 }
    ]
  }
];
