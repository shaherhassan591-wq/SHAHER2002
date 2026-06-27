package com.anamuslim.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;

import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AlarmReceiver";
    private static final String CHANNEL_ID = "prayer-times-channel";
    private static MediaPlayer alarmMediaPlayer;

    @Override
    public void onReceive(Context context, Intent intent) {
        String prayerName = intent.getStringExtra("prayerName");
        String voiceId = intent.getStringExtra("voiceId");
        String time24h = intent.getStringExtra("time24h");

        Log.d(TAG, "Exact Alarm triggered for: " + prayerName + " (Voice: " + voiceId + ")");

        // Acquire a WakeLock to keep the CPU awake while rendering notification & starting sound
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "AnaMuslim:AlarmWakeLock");
            wakeLock.acquire(10000); // 10 seconds timeout safety
        }

        try {
            // 1. Create native notification channel
            createNotificationChannel(context);

            // 2. Build intent to launch app on click
            Intent appIntent = new Intent(context, MainActivity.class);
            appIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context,
                    0,
                    appIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
            );

            // 3. Build notification (Max Importance, Heads-up popup)
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.ic_dialog_info)
                    .setContentTitle("🕌 حان الآن موعد صلاة " + prayerName)
                    .setContentText("الله أكبر، الله أكبر.. نداء الحق لصلاة " + prayerName + " بتوقيتك المحلي.")
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setContentIntent(pendingIntent)
                    .setAutoCancel(true)
                    .setVibrate(new long[]{0, 1000, 500, 1000})
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

            NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (notificationManager != null) {
                notificationManager.notify(getNotificationId(prayerName), builder.build());
            }

            // 4. Play the Adhan sound natively
            playAdhanSound(context, voiceId);

        } catch (Exception e) {
            Log.e(TAG, "Error in AlarmReceiver onReceive", e);
        } finally {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        }
    }

    private void playAdhanSound(Context context, String voiceId) {
        if (alarmMediaPlayer != null) {
            try {
                if (alarmMediaPlayer.isPlaying()) {
                    alarmMediaPlayer.stop();
                }
                alarmMediaPlayer.release();
            } catch (Exception e) {
                // Ignore
            }
        }

        alarmMediaPlayer = new MediaPlayer();
        try {
            // Determine adhan audio asset path inside the packaged web assets
            String assetPath = "public/audio/adhan_" + voiceId + ".mp3";
            AssetFileDescriptor afd = context.getAssets().openFd(assetPath);
            alarmMediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            afd.close();

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                alarmMediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build());
            }

            alarmMediaPlayer.setVolume(1.0f, 1.0f);
            alarmMediaPlayer.prepare();
            alarmMediaPlayer.start();
            Log.d(TAG, "Playing native adhan audio file: " + assetPath);
        } catch (Exception e) {
            Log.e(TAG, "Could not play native adhan audio, playing default system alarm sound.", e);
            // Play default system ringtone/notification as fallback
            try {
                alarmMediaPlayer.release();
                alarmMediaPlayer = MediaPlayer.create(context, Settings.System.DEFAULT_ALARM_ALERT_URI);
                if (alarmMediaPlayer != null) {
                    alarmMediaPlayer.start();
                }
            } catch (Exception ex) {
                Log.e(TAG, "Failed playing default system sound", ex);
            }
        }
    }

    private void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "أوقات الصلاة والتنبيهات والآذان";
            String description = "تنبيهات مواعيد الصلوات الخمس والأذكار والآيات الشريفة بحد أقصى للأولوية لظهورها كإشعار منبثق على شاشة الهاتف.";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableLights(true);
            channel.enableVibration(true);
            channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);

            NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private int getNotificationId(String prayerName) {
        if (prayerName == null) return 5000;
        return 5000 + Math.abs(prayerName.hashCode() % 1000);
    }
}
