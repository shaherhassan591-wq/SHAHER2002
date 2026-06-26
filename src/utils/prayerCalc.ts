export interface City {
  id: string;
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
  timezone: number;
}

export interface CalculationMethod {
  id: string;
  nameAr: string;
  nameEn: string;
  fajrAngle: number;
  ishaAngle: number;
  isUmmAlQura?: boolean;
}

export const CITIES: City[] = [
  { id: "mecca", nameAr: "مكة المكرمة", nameEn: "Mecca", lat: 21.4225, lng: 39.8262, timezone: 3 },
  { id: "madinah", nameAr: "المدينة المنورة", nameEn: "Medina", lat: 24.4672, lng: 39.6111, timezone: 3 },
  { id: "riyadh", nameAr: "الرياض", nameEn: "Riyadh", lat: 24.7136, lng: 46.6753, timezone: 3 },
  { id: "cairo", nameAr: "القاهرة", nameEn: "Cairo", lat: 30.0444, lng: 31.2357, timezone: 2 },
  { id: "jerusalem", nameAr: "القدس الشريف", nameEn: "Jerusalem", lat: 31.7683, lng: 35.2137, timezone: 3 },
  { id: "dubai", nameAr: "دبي", nameEn: "Dubai", lat: 25.2048, lng: 55.2708, timezone: 4 },
  { id: "amman", nameAr: "عمان", nameEn: "Amman", lat: 31.9454, lng: 35.9284, timezone: 3 },
  { id: "baghdad", nameAr: "بغداد", nameEn: "Baghdad", lat: 33.3152, lng: 44.3661, timezone: 3 },
  { id: "kuwait", nameAr: "الكويت", nameEn: "Kuwait City", lat: 29.3759, lng: 47.9774, timezone: 3 },
  { id: "manama", nameAr: "المنامة", nameEn: "Manama", lat: 26.2285, lng: 50.5860, timezone: 3 },
  { id: "doha", nameAr: "الدوحة", nameEn: "Doha", lat: 25.2854, lng: 51.5310, timezone: 3 },
  { id: "muscat", nameAr: "مسقط", nameEn: "Muscat", lat: 23.5859, lng: 58.4059, timezone: 4 },
  { id: "beirut", nameAr: "بيروت", nameEn: "Beirut", lat: 33.8938, lng: 35.5018, timezone: 3 },
  { id: "damascus", nameAr: "دمشق", nameEn: "Damascus", lat: 33.5138, lng: 36.2765, timezone: 3 },
  { id: "sanaa", nameAr: "صنعاء", nameEn: "Sanaa", lat: 15.3694, lng: 44.1910, timezone: 3 },
  { id: "rabat", nameAr: "الرباط", nameEn: "Rabat", lat: 34.0209, lng: -6.8416, timezone: 1 },
  { id: "tunis", nameAr: "تونس", nameEn: "Tunis", lat: 36.8065, lng: 10.1815, timezone: 1 },
  { id: "algiers", nameAr: "الجزائر", nameEn: "Algiers", lat: 36.7538, lng: 3.0588, timezone: 1 },
  { id: "tripoli", nameAr: "طرابلس", nameEn: "Tripoli", lat: 32.8872, lng: 13.1913, timezone: 2 },
  { id: "khartoum", nameAr: "الخرطوم", nameEn: "Khartoum", lat: 15.5007, lng: 32.5599, timezone: 2 },
  { id: "istanbul", nameAr: "إسطنبول", nameEn: "Istanbul", lat: 41.0082, lng: 28.9784, timezone: 3 },
  { id: "london", nameAr: "لندن", nameEn: "London", lat: 51.5074, lng: -0.1278, timezone: 1 },
  { id: "paris", nameAr: "باريس", nameEn: "Paris", lat: 48.8566, lng: 2.3522, timezone: 2 },
  { id: "newyork", nameAr: "نيويورك", nameEn: "New York", lat: 40.7128, lng: -74.0060, timezone: -4 },
  { id: "jakarta", nameAr: "جاكرتا", nameEn: "Jakarta", lat: -6.2088, lng: 106.8456, timezone: 7 },
  { id: "kualalumpur", nameAr: "كوالالمبور", nameEn: "Kuala Lumpur", lat: 3.1390, lng: 101.6869, timezone: 8 }
];

export const METHODS: CalculationMethod[] = [
  { id: "makkah", nameAr: "جامعة أم القرى، مكة المكرمة", nameEn: "Umm Al-Qura, Mecca", fajrAngle: 18.5, ishaAngle: 0, isUmmAlQura: true },
  { id: "mwl", nameAr: "رابطة العالم الإسلامي", nameEn: "Muslim World League", fajrAngle: 18, ishaAngle: 17 },
  { id: "egypt", nameAr: "الهيئة المصرية العامة للمساحة", nameEn: "Egyptian General Authority of Survey", fajrAngle: 19.5, ishaAngle: 17.5 },
  { id: "isna", nameAr: "الاتحاد الإسلامي لأمريكا الشمالية (ISNA)", nameEn: "Islamic Society of North America", fajrAngle: 15, ishaAngle: 15 },
  { id: "karachi", nameAr: "جامعة العلوم الإسلامية بكراتشي", nameEn: "University of Islamic Sciences, Karachi", fajrAngle: 18, ishaAngle: 18 },
  { id: "tehran", nameAr: "معهد الجيوفيزياء بجامعة طهران", nameEn: "Institute of Geophysics, University of Tehran", fajrAngle: 17.7, ishaAngle: 14 }
];

function d2r(d: number): number {
  return (d * Math.PI) / 180;
}

function r2d(r: number): number {
  return (r * 180) / Math.PI;
}

function formatTime(hours: number): string {
  if (isNaN(hours)) return "12:00";
  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);
  if (m === 60) {
    h += 1;
    m = 0;
  }
  h = (h + 24) % 24;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  timezone: number,
  methodId: string = "makkah",
  asrJuristic: "shafi" | "hanafi" = "shafi"
): {
  fajr: string;
  shuruq: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
} {
  const method = METHODS.find((m) => m.id === methodId) || METHODS[0];

  // Day of Year
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay) + 1;

  // Solar Declination
  const q = (2 * Math.PI * (dayOfYear - 1)) / 365;
  const delta = d2r(
    0.37877 +
      23.27 * Math.sin(q - 1.3814) +
      0.385 * Math.sin(2 * q - 1.36) +
      0.15 * Math.sin(3 * q - 1.9)
  );

  // Equation of Time (EoT)
  const B = (360 / 365) * (dayOfYear - 81);
  const EoT =
    9.87 * Math.sin(d2r(2 * B)) -
    7.53 * Math.cos(d2r(B)) -
    1.5 * Math.sin(d2r(B));

  const dhuhrTime = 12 + timezone - lng / 15 - EoT / 60;

  const getHourAngle = (altDeg: number): number => {
    const altRad = d2r(altDeg);
    const latRad = d2r(lat);
    const cosH =
      (Math.sin(altRad) - Math.sin(latRad) * Math.sin(delta)) /
      (Math.cos(latRad) * Math.cos(delta));

    if (cosH > 1) return 0;
    if (cosH < -1) return 12;
    return r2d(Math.acos(cosH)) / 15;
  };

  const shuruqHA = getHourAngle(-0.833);
  const shuruqTime = dhuhrTime - shuruqHA;

  const maghribHA = getHourAngle(-0.833);
  const maghribTime = dhuhrTime + maghribHA;

  const fajrHA = getHourAngle(-method.fajrAngle);
  const fajrTime = dhuhrTime - fajrHA;

  const latRad = d2r(lat);
  const g = Math.abs(latRad - delta);
  const shadowLength = asrJuristic === "hanafi" ? 2 : 1;
  const asrAltRad = Math.atan(1 / (shadowLength + Math.tan(g)));
  const asrHA = getHourAngle(r2d(asrAltRad));
  const asrTime = dhuhrTime + asrHA;

  let ishaTime: number;
  if (method.isUmmAlQura) {
    ishaTime = maghribTime + 1.5; // 90 mins
  } else {
    const ishaHA = getHourAngle(-method.ishaAngle);
    ishaTime = dhuhrTime + ishaHA;
  }

  return {
    fajr: formatTime(fajrTime),
    shuruq: formatTime(shuruqTime),
    dhuhr: formatTime(dhuhrTime),
    asr: formatTime(asrTime),
    maghrib: formatTime(maghribTime),
    isha: formatTime(ishaTime)
  };
}

export interface PrayerCalcSettings {
  type: "city" | "gps";
  cityId: string;
  methodId: string;
  asrJuristic: "shafi" | "hanafi";
  gpsLat?: number;
  gpsLng?: number;
  gpsTimezone?: number;
  gpsName?: string;
}

export function getPrayerCalcSettings(): PrayerCalcSettings {
  const type = (localStorage.getItem("prayer_calc_type") || "city") as "city" | "gps";
  const cityId = localStorage.getItem("prayer_selected_city") || "riyadh";
  const methodId = localStorage.getItem("prayer_calc_method") || "makkah";
  const asrJuristic = (localStorage.getItem("prayer_asr_juristic") || "shafi") as "shafi" | "hanafi";

  const settings: PrayerCalcSettings = {
    type,
    cityId,
    methodId,
    asrJuristic
  };

  const gpsLat = localStorage.getItem("prayer_gps_lat");
  const gpsLng = localStorage.getItem("prayer_gps_lng");
  const gpsTimezone = localStorage.getItem("prayer_gps_timezone");
  const gpsName = localStorage.getItem("prayer_gps_name");

  if (gpsLat && gpsLng) {
    settings.gpsLat = parseFloat(gpsLat);
    settings.gpsLng = parseFloat(gpsLng);
    settings.gpsTimezone = gpsTimezone ? parseFloat(gpsTimezone) : 3;
    settings.gpsName = gpsName || "موقعي الحالي";
  }

  return settings;
}

export function savePrayerCalcSettings(settings: Partial<PrayerCalcSettings>): void {
  if (settings.type) localStorage.setItem("prayer_calc_type", settings.type);
  if (settings.cityId) localStorage.setItem("prayer_selected_city", settings.cityId);
  if (settings.methodId) localStorage.setItem("prayer_calc_method", settings.methodId);
  if (settings.asrJuristic) localStorage.setItem("prayer_asr_juristic", settings.asrJuristic);

  if (settings.gpsLat !== undefined) localStorage.setItem("prayer_gps_lat", String(settings.gpsLat));
  if (settings.gpsLng !== undefined) localStorage.setItem("prayer_gps_lng", String(settings.gpsLng));
  if (settings.gpsTimezone !== undefined) localStorage.setItem("prayer_gps_timezone", String(settings.gpsTimezone));
  if (settings.gpsName !== undefined) localStorage.setItem("prayer_gps_name", settings.gpsName);

  recalculateAndStore();
}

export function recalculateAndStore(): void {
  const settings = getPrayerCalcSettings();
  let lat = 24.7136; // Riyadh defaults
  let lng = 46.6753;
  let timezone = 3;

  if (settings.type === "city") {
    const city = CITIES.find((c) => c.id === settings.cityId) || CITIES[2];
    lat = city.lat;
    lng = city.lng;
    timezone = city.timezone;
  } else if (settings.type === "gps" && settings.gpsLat !== undefined && settings.gpsLng !== undefined) {
    lat = settings.gpsLat;
    lng = settings.gpsLng;
    timezone = settings.gpsTimezone !== undefined ? settings.gpsTimezone : (new Date().getTimezoneOffset() / -60);
  }

  const times = calculatePrayerTimes(
    new Date(),
    lat,
    lng,
    timezone,
    settings.methodId,
    settings.asrJuristic
  );

  localStorage.setItem("calculated_prayer_times", JSON.stringify(times));
  window.dispatchEvent(new Event("prayer-reminder-changed"));
}

export function getStoredPrayerTimes(): {
  fajr: string;
  shuruq: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
} {
  try {
    const raw = localStorage.getItem("calculated_prayer_times");
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}

  // Recalculate if none is saved
  recalculateAndStore();
  try {
    const raw = localStorage.getItem("calculated_prayer_times");
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return {
    fajr: "04:12",
    shuruq: "05:43",
    dhuhr: "12:15",
    asr: "15:45",
    maghrib: "18:49",
    isha: "20:18"
  };
}
