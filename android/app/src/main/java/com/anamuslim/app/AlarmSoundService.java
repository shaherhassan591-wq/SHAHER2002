package com.anamuslim.app;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;

public class AlarmSoundService extends Service {
    private static final String TAG = "AlarmSoundService";
    private MediaPlayer mediaPlayer;
    private PowerManager.WakeLock wakeLock;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "AlarmSoundService created");
        
        // Acquire WakeLock to ensure audio continues playing even if device CPU wants to sleep
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AnaMuslim:AlarmSoundServiceWakeLock");
            wakeLock.acquire(10 * 60 * 1000); // 10 minutes maximum duration
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        String voiceId = intent.getStringExtra("voiceId");
        Log.d(TAG, "onStartCommand: Received voiceId: " + voiceId);

        playAudio(voiceId);

        return START_NOT_STICKY;
    }

    private void playAudio(String voiceId) {
        if (mediaPlayer != null) {
            try {
                mediaPlayer.release();
            } catch (Exception e) {}
        }

        mediaPlayer = new MediaPlayer();

        // 1. If silent, play nothing
        if (voiceId == null || voiceId.equals("silent")) {
            Log.d(TAG, "VoiceId is silent. Stopping service.");
            stopSelf();
            return;
        }

        String resolvedVoiceId = voiceId;
        if (voiceId.contains("prophet") || voiceId.equals("pre_reminder")) {
            resolvedVoiceId = "real_prophet";
        }

        // 2. Play from local storage if downloaded file exists
        String localFileName = "adhan_" + resolvedVoiceId + ".mp3";
        java.io.File localFile = new java.io.File(getFilesDir(), localFileName);
        if (localFile.exists() && localFile.length() > 0) {
            try {
                mediaPlayer.setDataSource(localFile.getAbsolutePath());
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .build());
                }
                mediaPlayer.setVolume(1.0f, 1.0f);
                mediaPlayer.prepare();
                mediaPlayer.start();

                mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                    @Override
                    public void onCompletion(MediaPlayer mp) {
                        Log.d(TAG, "Finished playing local file.");
                        stopSelf();
                    }
                });

                Log.d(TAG, "Playing downloaded audio file: " + localFile.getAbsolutePath());
                return;
            } catch (Exception e) {
                Log.e(TAG, "Failed playing local file, trying fallback: " + localFileName, e);
            }
        }

        // 2b. Play from packaged built-in assets if available
        String assetPath = "public/audio/" + resolvedVoiceId + ".mp3";
        try {
            android.content.res.AssetFileDescriptor afd = getAssets().openFd(assetPath);
            mediaPlayer.release();
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            afd.close();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build());
            }
            mediaPlayer.setVolume(1.0f, 1.0f);
            mediaPlayer.prepare();
            mediaPlayer.start();

            mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                @Override
                public void onCompletion(MediaPlayer mp) {
                    Log.d(TAG, "Finished playing asset file.");
                    stopSelf();
                }
            });

            Log.d(TAG, "Playing built-in asset file: " + assetPath);
            return;
        } catch (Exception e) {
            Log.d(TAG, "No built-in asset found for: " + assetPath + " (or failed playing: " + e.getMessage() + "), trying online fallback...");
        }

        // 3. Play from online fallback URL if device is connected to the internet
        String onlineUrl = null;
        if (voiceId.startsWith("http")) {
            onlineUrl = voiceId;
        } else if (voiceId.equals("makkah")) {
            onlineUrl = "https://dn710002.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan_662/019--1.mp3";
        } else if (voiceId.equals("abdulbasit")) {
            onlineUrl = "https://ia600100.us.archive.org/34/items/90---azan---90---azan--many----sound----mp3---alazan_662/041--.mp3";
        } else if (voiceId.equals("afasy")) {
            onlineUrl = "https://dn710002.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan_662/038-1.mp3";
        } else if (voiceId.equals("aqsa")) {
            onlineUrl = "https://dn710002.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan_662/045--.mp3";
        } else if (voiceId.equals("makkah_2")) {
            onlineUrl = "https://dn710603.ca.archive.org/0/items/90---azan---90---azan--many----sound----mp3---alazan/019--1.mp3";
        } else if (voiceId.contains("prophet") || voiceId.equals("real_prophet") || voiceId.equals("pre_reminder")) {
            onlineUrl = "https://storage.pdftolink.io/users/guest/4a185c90-df6f-4a94-ae66-53f1e0fd1155.mp3";
        }

        if (onlineUrl != null) {
            try {
                mediaPlayer.release();
                mediaPlayer = new MediaPlayer();
                mediaPlayer.setDataSource(onlineUrl);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .build());
                }
                mediaPlayer.setVolume(1.0f, 1.0f);

                mediaPlayer.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
                    @Override
                    public void onPrepared(MediaPlayer mp) {
                        try {
                            mp.start();
                            Log.d(TAG, "Playing online fallback audio URL asynchronously.");
                        } catch (Exception ex) {
                            Log.e(TAG, "Failed starting prepared online player", ex);
                            stopSelf();
                        }
                    }
                });

                mediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
                    @Override
                    public boolean onError(MediaPlayer mp, int what, int extra) {
                        Log.e(TAG, "MediaPlayer error preparing online URL: what=" + what + " extra=" + extra);
                        stopSelf();
                        return true;
                    }
                });

                mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                    @Override
                    public void onCompletion(MediaPlayer mp) {
                        stopSelf();
                    }
                });

                mediaPlayer.prepareAsync();
                Log.d(TAG, "Initiated prepareAsync for online URL: " + onlineUrl);
                return;
            } catch (Exception ex) {
                Log.e(TAG, "Failed to play online fallback audio", ex);
            }
        }

        // If all plays failed, stop the service
        stopSelf();
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "AlarmSoundService destroyed");
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
                mediaPlayer.release();
            } catch (Exception e) {}
            mediaPlayer = null;
        }
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        super.onDestroy();
    }
}
