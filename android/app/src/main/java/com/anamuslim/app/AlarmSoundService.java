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
import java.util.ArrayList;
import java.util.List;

public class AlarmSoundService extends Service {
    private static final String TAG = "AlarmSoundService";
    private MediaPlayer mediaPlayer;
    private PowerManager.WakeLock wakeLock;

    private final List<String> playQueue = new ArrayList<>();
    private String activeVoiceId = null;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private static final String PLAYBACK_CHANNEL_ID = "alarm-playback-channel";
    private static final int FOREGROUND_NOTIFICATION_ID = 9091;

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

        createPlaybackNotificationChannel();
    }

    private void createPlaybackNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            android.app.NotificationChannel channel = new android.app.NotificationChannel(
                    PLAYBACK_CHANNEL_ID,
                    "تشغيل أصوات التنبيهات",
                    android.app.NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("يقوم بتشغيل أصوات الأذان وتنبيهات الصلاة على النبي في الخلفية");
            channel.setSound(null, null);
            channel.enableVibration(false);
            android.app.NotificationManager manager = (android.app.NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            synchronized (playQueue) {
                if (activeVoiceId == null && playQueue.isEmpty()) {
                    stopSelf();
                }
            }
            return START_NOT_STICKY;
        }

        String voiceId = intent.getStringExtra("voiceId");
        Log.d(TAG, "onStartCommand: Received voiceId: " + voiceId);

        // Build a notification for the foreground service to meet Oreo+ background service requirements
        int appIconResId = getApplicationInfo().icon;
        if (appIconResId == 0) {
            appIconResId = android.R.drawable.ic_dialog_info;
        }

        androidx.core.app.NotificationCompat.Builder builder = new androidx.core.app.NotificationCompat.Builder(this, PLAYBACK_CHANNEL_ID)
                .setSmallIcon(appIconResId)
                .setContentTitle("تطبيق أنا مسلم")
                .setContentText("جاري تشغيل صوت التنبيه المخصص...")
                .setPriority(androidx.core.app.NotificationCompat.PRIORITY_LOW)
                .setCategory(androidx.core.app.NotificationCompat.CATEGORY_SERVICE)
                .setAutoCancel(true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(FOREGROUND_NOTIFICATION_ID, builder.build(), android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(FOREGROUND_NOTIFICATION_ID, builder.build());
        }

        if (voiceId == null || voiceId.equals("silent")) {
            Log.d(TAG, "Received silent or null voiceId. Ignoring.");
            synchronized (playQueue) {
                if (activeVoiceId == null && playQueue.isEmpty()) {
                    stopSelf();
                }
            }
            return START_NOT_STICKY;
        }

        handleIncomingVoice(voiceId);

        return START_NOT_STICKY;
    }

    private void handleIncomingVoice(String voiceId) {
        synchronized (playQueue) {
            boolean incomingIsProphet = voiceId.contains("prophet") || voiceId.equals("pre_reminder");

            if (activeVoiceId == null) {
                // Nothing playing, start playing immediately
                activeVoiceId = voiceId;
                playAudioDirect(voiceId);
            } else {
                boolean activeIsProphet = activeVoiceId.contains("prophet") || activeVoiceId.equals("pre_reminder");

                if (activeIsProphet && !incomingIsProphet) {
                    // Preemption! Incoming is high-priority Adhan, current is low-priority Prophet
                    Log.d(TAG, "Preempting low-priority Prophet reminder [" + activeVoiceId + "] for high-priority Adhan [" + voiceId + "]");
                    
                    // Put the stopped Prophet reminder back to queue (to play after Adhan)
                    playQueue.add(0, activeVoiceId);
                    
                    // Stop current playback
                    if (mediaPlayer != null) {
                        try {
                            mediaPlayer.stop();
                        } catch (Exception e) {}
                    }
                    
                    // Start Adhan immediately
                    activeVoiceId = voiceId;
                    playAudioDirect(voiceId);
                } else {
                    // Sequential queuing!
                    Log.d(TAG, "Queuing audio [" + voiceId + "] sequentially behind active [" + activeVoiceId + "]");
                    playQueue.add(voiceId);
                }
            }
        }
    }

    private void playNext() {
        synchronized (playQueue) {
            if (playQueue.isEmpty()) {
                Log.d(TAG, "No more audio in queue. Stopping service.");
                activeVoiceId = null;
                stopSelf();
            } else {
                String nextVoiceId = playQueue.remove(0);
                activeVoiceId = nextVoiceId;
                Log.d(TAG, "Playing next queued audio: " + nextVoiceId);
                playAudioDirect(nextVoiceId);
            }
        }
    }

    private void playAudioDirect(String voiceId) {
        if (mediaPlayer != null) {
            try {
                mediaPlayer.release();
            } catch (Exception e) {}
        }

        mediaPlayer = new MediaPlayer();

        String resolvedVoiceId = voiceId;
        if (voiceId.equals("prophet") || voiceId.equals("pre_reminder")) {
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
                        playNext();
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
                    playNext();
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
        } else if (voiceId.equals("prophet_voice_1")) {
            onlineUrl = "https://ais-pre-4njjxv7a6hjryet3spykcm-960490970057.europe-west2.run.app/audio/prophet_voice_1.mp3";
        } else if (voiceId.equals("prophet_voice_2")) {
            onlineUrl = "https://ais-pre-4njjxv7a6hjryet3spykcm-960490970057.europe-west2.run.app/audio/prophet_voice_2.mp3";
        } else if (voiceId.contains("prophet") || voiceId.equals("real_prophet") || voiceId.equals("pre_reminder")) {
            onlineUrl = "https://archive.org/download/abhd1984520_gmail_20150511_1134/%D8%B5%D9%84%D9%88%D8%A7%20%D8%B9%D9%84%D9%8A%D9%87%20%D9%88%D8%B3%D9%84%D9%85%D9%88%D8%A7%20%D8%AA%D8%B3%D9%84%D9%8A%D9%85%D8%A7%20.%20%D8%A7%D9%84%D8%B9%D9%81%D8%A7%D8%B3%D9%8A.mp3";
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
                            playNext();
                        }
                    }
                });

                mediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
                    @Override
                    public boolean onError(MediaPlayer mp, int what, int extra) {
                        Log.e(TAG, "MediaPlayer error preparing online URL: what=" + what + " extra=" + extra);
                        playNext();
                        return true;
                    }
                });

                mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                    @Override
                    public void onCompletion(MediaPlayer mp) {
                        playNext();
                    }
                });

                mediaPlayer.prepareAsync();
                Log.d(TAG, "Initiated prepareAsync for online URL: " + onlineUrl);
                return;
            } catch (Exception ex) {
                Log.e(TAG, "Failed to play online fallback audio", ex);
            }
        }

        // If all plays failed, play next queued item
        playNext();
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "AlarmSoundService destroyed");
        synchronized (playQueue) {
            playQueue.clear();
            activeVoiceId = null;
        }
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
