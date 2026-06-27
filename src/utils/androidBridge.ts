/**
 * Unified Android Native Bridge for "Ana Muslim" Application
 * package-id: com.anamuslim.app
 * This utility bridges the React web app and raw native Android WebView Javascript Interfaces.
 */

declare global {
  interface Window {
    Android?: {
      scheduleAlarm?: (prayerName: string, time24h: string, voiceId: string) => void;
      cancelAlarms?: () => void;
      requestAutostart?: () => void;
      requestIgnoreBatteryOptimizations?: () => void;
      getAppVersion?: () => string;
      playEmbeddedAudio?: (assetName: string) => void;
      stopEmbeddedAudio?: () => void;
    };
    AndroidBridge?: {
      scheduleAlarm?: (prayerName: string, time24h: string, voiceId: string) => void;
      cancelAlarms?: () => void;
      requestAutostart?: () => void;
      requestIgnoreBatteryOptimizations?: () => void;
      getAppVersion?: () => string;
      playEmbeddedAudio?: (assetName: string) => void;
      stopEmbeddedAudio?: () => void;
    };
  }
}

import { Capacitor } from "@capacitor/core";

export const APP_PACKAGE_ID = "com.anamuslim.app";

/**
 * Check if the application is running inside a native Android wrapper
 */
export const isNativeAndroid = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    if (Capacitor.getPlatform() === "android") {
      return true;
    }
  } catch (e) {}
  return !!window.Android || !!window.AndroidBridge;
};

/**
 * Schedule a native Alarm Manager alarm for prayer time
 */
export const scheduleNativeAlarm = (prayerName: string, time24h: string, voiceId: string): boolean => {
  console.log(`[AndroidBridge] Scheduling local AlarmManager for: ${prayerName} at ${time24h} using voice: ${voiceId}`);
  
  if (typeof window === "undefined") return false;

  // Attempt window.Android interface
  if (window.Android && typeof window.Android.scheduleAlarm === "function") {
    try {
      window.Android.scheduleAlarm(prayerName, time24h, voiceId);
      return true;
    } catch (e) {
      console.error("Error calling window.Android.scheduleAlarm", e);
    }
  }

  // Attempt window.AndroidBridge interface
  if (window.AndroidBridge && typeof window.AndroidBridge.scheduleAlarm === "function") {
    try {
      window.AndroidBridge.scheduleAlarm(prayerName, time24h, voiceId);
      return true;
    } catch (e) {
      console.error("Error calling window.AndroidBridge.scheduleAlarm", e);
    }
  }

  return false;
};

/**
 * Cancel all alarms scheduled inside the system
 */
export const cancelAllNativeAlarms = (): boolean => {
  if (typeof window === "undefined") return false;

  if (window.Android && typeof window.Android.cancelAlarms === "function") {
    try {
      window.Android.cancelAlarms();
      return true;
    } catch (e) {
      console.error("Error calling window.Android.cancelAlarms", e);
    }
  }

  if (window.AndroidBridge && typeof window.AndroidBridge.cancelAlarms === "function") {
    try {
      window.AndroidBridge.cancelAlarms();
      return true;
    } catch (e) {
      console.error("Error calling window.AndroidBridge.cancelAlarms", e);
    }
  }

  return false;
};

/**
 * Request system background workspace Permission (Autostart)
 */
export const requestNativeAutostart = (): boolean => {
  if (typeof window === "undefined") return false;

  if (window.Android && typeof window.Android.requestAutostart === "function") {
    try {
      window.Android.requestAutostart();
      return true;
    } catch (e) {
      console.warn("Autostart request failed", e);
    }
  }

  if (window.AndroidBridge && typeof window.AndroidBridge.requestAutostart === "function") {
    try {
      window.AndroidBridge.requestAutostart();
      return true;
    } catch (e) {
      console.warn("Autostart request failed", e);
    }
  }

  return false;
};

/**
 * Request Ignore Battery Optimizations (Wun-whitelist the application from background suspend limits)
 */
export const requestNativeIgnoreBatteryOptimizations = (): boolean => {
  if (typeof window === "undefined") return false;

  if (window.Android && typeof window.Android.requestIgnoreBatteryOptimizations === "function") {
    try {
      window.Android.requestIgnoreBatteryOptimizations();
      return true;
    } catch (e) {
      console.warn("Battery optimization request failed", e);
    }
  }

  if (window.AndroidBridge && typeof window.AndroidBridge.requestIgnoreBatteryOptimizations === "function") {
    try {
      window.AndroidBridge.requestIgnoreBatteryOptimizations();
      return true;
    } catch (e) {
      console.warn("Battery optimization request failed", e);
    }
  }

  return false;
};

/**
 * Request playing embedded audio assets (from android_asset folder natively)
 */
export const playNativeEmbeddedAudio = (assetFileName: string): boolean => {
  if (typeof window === "undefined") return false;

  if (window.Android && typeof window.Android.playEmbeddedAudio === "function") {
    try {
      window.Android.playEmbeddedAudio(assetFileName);
      return true;
    } catch (e) {
      console.warn("Native audio play failed", e);
    }
  }

  if (window.AndroidBridge && typeof window.AndroidBridge.playEmbeddedAudio === "function") {
    try {
      window.AndroidBridge.playEmbeddedAudio(assetFileName);
      return true;
    } catch (e) {
      console.warn("Native audio play failed", e);
    }
  }

  return false;
};

/**
 * Stop any active native playback
 */
export const stopNativeEmbeddedAudio = (): boolean => {
  if (typeof window === "undefined") return false;

  if (window.Android && typeof window.Android.stopEmbeddedAudio === "function") {
    try {
      window.Android.stopEmbeddedAudio();
      return true;
    } catch (e) {
      console.warn("Native audio stop failed", e);
    }
  }

  if (window.AndroidBridge && typeof window.AndroidBridge.stopEmbeddedAudio === "function") {
    try {
      window.AndroidBridge.stopEmbeddedAudio();
      return true;
    } catch (e) {
      console.warn("Native audio stop failed", e);
    }
  }

  return false;
};

/**
 * Return fully embedded audio path inside the PWA public assets or local APK path.
 * This ensures files are loaded relative to the app origin (offline-compatible) 
 * without hitting any external cloud URLs.
 */
export const getOfflineAdhanAudioPath = (voiceId: string): string => {
  // Return relative path pointing to the embedded folder.
  // This satisfies: "تضمين ملفات الصوت (Embedded Audio) داخل ملف الـ APK نفسه حتى يشتغل الأذان كاملاً"
  return `./audio/adhan_${voiceId}.mp3`;
};
