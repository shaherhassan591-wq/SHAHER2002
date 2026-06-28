package com.anamuslim.app;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.res.AssetFileDescriptor;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

import java.io.IOException;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private MediaPlayer mediaPlayer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register JavaScript interface when WebView is initialized
        registerBridgeInterface();
    }

    private void registerBridgeInterface() {
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            // Explicitly enable geolocation in WebView settings to avoid silent rejection
            webView.getSettings().setGeolocationEnabled(true);
            webView.getSettings().setGeolocationDatabasePath(getFilesDir().getPath());
            
            AndroidBridgeInterface bridge = new AndroidBridgeInterface(this);
            webView.addJavascriptInterface(bridge, "Android");
            webView.addJavascriptInterface(bridge, "AndroidBridge");
            Log.d(TAG, "Successfully registered Javascript interfaces: 'Android' & 'AndroidBridge' and enabled WebView Geolocation");
        } else {
            Log.e(TAG, "WebView is null! Failed to register Javascript interface.");
        }
    }

    public class AndroidBridgeInterface {
        private Context mContext;

        public AndroidBridgeInterface(Context context) {
            this.mContext = context;
        }

        @JavascriptInterface
        public void scheduleAlarm(String prayerName, String time24h, String voiceId) {
            Log.d(TAG, "scheduleAlarm called: " + prayerName + " at " + time24h + " with voice: " + voiceId);
            AlarmScheduler.scheduleAlarm(mContext, prayerName, time24h, voiceId);
        }

        @JavascriptInterface
        public void cancelAlarms() {
            Log.d(TAG, "cancelAlarms called");
            AlarmScheduler.cancelAlarms(mContext);
        }

        @JavascriptInterface
        public void requestAutostart() {
            Log.d(TAG, "requestAutostart called");
            try {
                Intent intent = new Intent();
                String manufacturer = android.os.Build.MANUFACTURER.toLowerCase();
                if ("xiaomi".equals(manufacturer)) {
                    intent.setComponent(new ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"));
                } else if ("oppo".equals(manufacturer)) {
                    intent.setComponent(new ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"));
                } else if ("vivo".equals(manufacturer)) {
                    intent.setComponent(new ComponentName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"));
                } else if ("huawei".equals(manufacturer)) {
                    intent.setComponent(new ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity"));
                } else {
                    Toast.makeText(mContext, "ميزة التشغيل التلقائي مفعلة بالفعل على جهازك.", Toast.LENGTH_SHORT).show();
                    return;
                }
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                mContext.startActivity(intent);
            } catch (Exception e) {
                Log.e(TAG, "Error opening manufacturer autostart settings", e);
                Toast.makeText(mContext, "الرجاء البحث عن خيار التشغيل التلقائي في إعدادات التطبيقات بجهازك.", Toast.LENGTH_LONG).show();
            }
        }

        @JavascriptInterface
        public void requestIgnoreBatteryOptimizations() {
            Log.d(TAG, "requestIgnoreBatteryOptimizations called");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent intent = new Intent();
                String packageName = mContext.getPackageName();
                PowerManager pm = (PowerManager) mContext.getSystemService(Context.POWER_SERVICE);
                if (pm != null && !pm.isIgnoringBatteryOptimizations(packageName)) {
                    intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + packageName));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    mContext.startActivity(intent);
                } else {
                    Toast.makeText(mContext, "وضع تحسين البطارية ملغى بالفعل لهذا التطبيق لضمان دقة مواقيت الصلاة.", Toast.LENGTH_LONG).show();
                }
            }
        }

        @JavascriptInterface
        public String getAppVersion() {
            try {
                PackageInfo pInfo = mContext.getPackageManager().getPackageInfo(mContext.getPackageName(), 0);
                return pInfo.versionName;
            } catch (Exception e) {
                return "1.0.0";
            }
        }

        @JavascriptInterface
        public boolean hasLocationPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                boolean fine = mContext.checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED;
                boolean coarse = mContext.checkSelfPermission(android.Manifest.permission.ACCESS_COARSE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED;
                return fine || coarse;
            }
            return true;
        }

        @JavascriptInterface
        public void requestLocationPermission() {
            Log.d(TAG, "requestLocationPermission called");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                MainActivity.this.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        MainActivity.this.requestPermissions(new String[]{
                            android.Manifest.permission.ACCESS_FINE_LOCATION,
                            android.Manifest.permission.ACCESS_COARSE_LOCATION
                        }, 1002);
                    }
                });
            }
        }

        @JavascriptInterface
        public void playEmbeddedAudio(String assetName) {
            Log.d(TAG, "playEmbeddedAudio called: " + assetName);
            stopEmbeddedAudio();
            try {
                mediaPlayer = new MediaPlayer();
                String path = "public/audio/" + assetName;
                if (assetName.contains("/") || assetName.contains("public/")) {
                    path = assetName.replace("./", "public/").replace("public/public/", "public/");
                }
                
                AssetFileDescriptor afd = mContext.getAssets().openFd(path);
                mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                afd.close();
                mediaPlayer.setVolume(1.0f, 1.0f);
                mediaPlayer.prepare();
                mediaPlayer.start();
            } catch (IOException e) {
                Log.e(TAG, "Error playing asset natively: " + assetName, e);
                // Fallback attempt
                try {
                    mediaPlayer = new MediaPlayer();
                    mediaPlayer.setDataSource(mContext, Uri.parse("file:///android_asset/public/audio/" + assetName));
                    mediaPlayer.setVolume(1.0f, 1.0f);
                    mediaPlayer.prepare();
                    mediaPlayer.start();
                } catch (Exception ex) {
                    Log.e(TAG, "Fallback playback also failed", ex);
                }
            }
        }

        @JavascriptInterface
        public boolean saveAudioFile(String fileName, String base64Data) {
            Log.d(TAG, "saveAudioFile called: " + fileName);
            try {
                byte[] decodedBytes = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT);
                java.io.File file = new java.io.File(mContext.getFilesDir(), fileName);
                java.io.FileOutputStream fos = new java.io.FileOutputStream(file);
                fos.write(decodedBytes);
                fos.close();
                Log.d(TAG, "Saved audio file natively to: " + file.getAbsolutePath());
                return true;
            } catch (Exception e) {
                Log.e(TAG, "Error saving audio file: " + fileName, e);
                return false;
            }
        }

        @JavascriptInterface
        public boolean hasAudioFile(String fileName) {
            java.io.File file = new java.io.File(mContext.getFilesDir(), fileName);
            boolean exists = file.exists() && file.length() > 0;
            Log.d(TAG, "hasAudioFile check for " + fileName + ": " + exists);
            return exists;
        }

        @JavascriptInterface
        public void stopEmbeddedAudio() {
            Log.d(TAG, "stopEmbeddedAudio called");
            if (mediaPlayer != null) {
                try {
                    if (mediaPlayer.isPlaying()) {
                        mediaPlayer.stop();
                    }
                    mediaPlayer.release();
                } catch (Exception e) {
                    Log.e(TAG, "Error stopping native MediaPlayer", e);
                }
                mediaPlayer = null;
            }
        }
    }
}
