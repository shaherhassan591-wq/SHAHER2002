import { saveAudioByKey, getAudioByKey, deleteAudioByKey } from "./audioStorage";
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

    // Clean up any old prophet caches if they exist (to clear any wrong voices)
    try {
      const oldBlob = await getAudioByKey("real_prophet");
      if (oldBlob) {
        console.log("[AutoCache] Old prophet voice detected. Deleting old key from IndexedDB...");
        await deleteAudioByKey("real_prophet");
      }
      const oldBlob2 = await getAudioByKey("real_prophet_v2");
      if (oldBlob2) {
        console.log("[AutoCache] Old v2 prophet voice detected. Deleting old key from IndexedDB...");
        await deleteAudioByKey("real_prophet_v2");
      }
    } catch (e) {
      console.warn("[AutoCache] Failed to delete old prophet cache keys", e);
    }

    // 1. Prophet Blessing audios pre-caching
    const prophetVoicesToCache = [
      { key: "real_prophet_v3", url: "/audio/real_prophet.mp3?v=3", filename: "adhan_real_prophet.mp3", fallbackUrl: "https://archive.org/download/nbeslo3leh/%D8%A7%D9%84%D9%86%D8%A8%D9%8A%20%D1%81%D9%84%D9%88%D8%A7%20%D8%B9%D9%84%D9%8A%D9%87.mp3" },
      { key: "prophet_voice_1_v1", url: "/audio/prophet_voice_1.mp3", filename: "adhan_prophet_voice_1.mp3", fallbackUrl: "" },
      { key: "prophet_voice_2_v1", url: "/audio/prophet_voice_2.mp3", filename: "adhan_prophet_voice_2.mp3", fallbackUrl: "" }
    ];

    for (const item of prophetVoicesToCache) {
      let needsDownload = false;
      let blob: Blob | null = null;

      try {
        blob = await getAudioByKey(item.key);
        if (!blob) {
          needsDownload = true;
        } else if (isNativeAndroid() && !hasNativeAudioFile(item.filename)) {
          console.log(`[AutoCache] Syncing ${item.filename} from IndexedDB to native Android...`);
          const b64 = await blobToBase64(blob);
          saveNativeAudioFile(item.filename, b64);
        }
      } catch (e) {
        needsDownload = true;
      }

      if (needsDownload) {
        console.log(`[AutoCache] Downloading ${item.filename} for offline use...`);
        try {
          let res = await fetch(item.url);
          if (!res.ok && item.fallbackUrl) {
            res = await fetch(item.fallbackUrl);
          }
          if (res.ok) {
            const downloadedBlob = await res.blob();
            await saveAudioByKey(item.key, downloadedBlob);
            if (isNativeAndroid()) {
              const b64 = await blobToBase64(downloadedBlob);
              saveNativeAudioFile(item.filename, b64);
            }
            console.log(`[AutoCache] ${item.filename} pre-cached successfully!`);
          }
        } catch (err) {
          console.warn(`[AutoCache] Failed to download ${item.filename}`, err);
        }
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
