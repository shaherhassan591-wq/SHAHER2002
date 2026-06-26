export interface PrayerTime {
  id: string;
  name: string; // Arabic name
  englishName: string;
  time: string; // e.g., "04:30"
  icon: string; // Lucide icon identifier
}

export interface Muadhin {
  id: string;
  name: string;
  description: string;
  audioUrl: string;
  isPlaying?: boolean;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  revelationType: "Meccan" | "Medinan" | string;
  numberOfAyahs: number;
  verses: string[];
  translation?: string[];
  ayahPages?: number[];
}

export interface Zikr {
  id: string;
  text: string;
  count: number;
  maxCount: number;
  reward?: string;
  source?: string;
}

export interface ZikrSection {
  id: string;
  title: string;
  icon: string;
  items: Zikr[];
}

export interface Hadith {
  id: string;
  text: string;
  explanation?: string;
  narrator: string;
  source: string;
}

export interface NotificationSetting {
  prayerId: string;
  prayerName: string;
  enabled: boolean;
  adhanVoiceId: string;
}

export interface FavoriteVerse {
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  verseText: string;
  translationText: string;
}

