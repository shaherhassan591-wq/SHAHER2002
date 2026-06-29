import { saveAudioByKey, getAudioByKey } from "./audioStorage";
import { isNativeAndroid, saveNativeAudioFile, hasNativeAudioFile } from "./androidBridge";
import { muadhinsList } from "../data/islamicData";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Automatically downloads and pre-caches essential audios (the Prophet Blessing audio and the default Adhan audio)
 * inside IndexedDB and native Android storage so they work offline and never fall back to standard ringtones.
 */
export async function autoCacheEssentialAudios(): Promise<void> {
  try {
    console.log("[AutoCache] Starting background check for essential audio assets...");

    // 1. Prophet Blessing audio pre-caching
    const prophetKey = "real_prophet";
    const prophetUrl = "/audio/real_prophet.mp3";
    
    let needsProphetDownload = false;
    let prophetBlob: Blob | null = null;

    try {
      prophetBlob = await getAudioByKey(prophetKey);
      if (!prophetBlob) {
        needsProphetDownload = true;
      } else if (isNativeAndroid() && !hasNativeAudioFile("adhan_real_prophet.mp3")) {
        // Exists in IndexedDB but missing in native Android storage, sync it!
        console.log("[AutoCache] Syncing Prophet audio from IndexedDB to native Android...");
        const b64 = await blobToBase64(prophetBlob);
        saveNativeAudioFile("adhan_real_prophet.mp3", b64);
      }
    } catch (e) {
      needsProphetDownload = true;
    }

    if (needsProphetDownload) {
      console.log("[AutoCache] Downloading Prophet blessing audio for offline use...");
      try {
        let res = await fetch(prophetUrl);
        if (!res.ok) {
          // Fail-safe to online if local fetch fails
          const onlineUrl = "https://storage.pdftolink.io/users/guest/4a185c90-df6f-4a94-ae66-53f1e0fd1155.mp3";
          res = await fetch(onlineUrl);
        }
        if (res.ok) {
          const blob = await res.blob();
          await saveAudioByKey(prophetKey, blob);
          if (isNativeAndroid()) {
            const b64 = await blobToBase64(blob);
            saveNativeAudioFile("adhan_real_prophet.mp3", b64);
          }
          console.log("[AutoCache] Prophet blessing audio pre-cached successfully!");
        }
      } catch (err) {
        console.warn("[AutoCache] Failed to download Prophet blessing audio", err);
      }
    }

    // 2. Default/Selected Adhan audio pre-caching
    const selectedId = localStorage.getItem("selected_adhan_voice_id") || "makkah";
    const muadhin = muadhinsList.find(m => m.id === selectedId) || muadhinsList[0];
    const adhanKey = `adhan_${muadhin.id}`;
    const adhanFileName = `adhan_${muadhin.id}.mp3`;

    let needsAdhanDownload = false;
    let adhanBlob: Blob | null = null;

    try {
      adhanBlob = await getAudioByKey(adhanKey);
      if (!adhanBlob) {
        needsAdhanDownload = true;
      } else if (isNativeAndroid() && !hasNativeAudioFile(adhanFileName)) {
        console.log(`[AutoCache] Syncing Adhan ${muadhin.id} from IndexedDB to native Android...`);
        const b64 = await blobToBase64(adhanBlob);
        saveNativeAudioFile(adhanFileName, b64);
      }
    } catch (e) {
      needsAdhanDownload = true;
    }

    if (needsAdhanDownload) {
      console.log(`[AutoCache] Downloading selected Adhan audio (${muadhin.name}) for offline use...`);
      try {
        const url = muadhin.audioUrl;
        const proxiedUrl = `/api/proxy-audio?url=${encodeURIComponent(url)}`;
        let res = await fetch(proxiedUrl);
        if (!res.ok) {
          res = await fetch(url);
        }
        if (res.ok) {
          const blob = await res.blob();
          await saveAudioByKey(adhanKey, blob);
          if (isNativeAndroid()) {
            const b64 = await blobToBase64(blob);
            saveNativeAudioFile(adhanFileName, b64);
          }
          console.log(`[AutoCache] Selected Adhan (${muadhin.name}) pre-cached successfully!`);
        }
      } catch (err) {
        console.warn(`[AutoCache] Failed to download selected Adhan audio (${muadhin.name})`, err);
      }
    }

    console.log("[AutoCache] Background pre-caching completed.");
  } catch (error) {
    console.warn("[AutoCache] Error running autoCacheEssentialAudios", error);
  }
}
