package com.anamuslim.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;
import android.widget.RemoteViews;

import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AlarmReceiver";
    private static final String CHANNEL_ID = "prayer-times-v3-channel";

    @Override
    public void onReceive(Context context, Intent intent) {
        String prayerName = intent.getStringExtra("prayerName");
        String voiceId = intent.getStringExtra("voiceId");
        String time24h = intent.getStringExtra("time24h");

        Log.d(TAG, "Exact Alarm triggered for: " + prayerName + " (Voice: " + voiceId + ")");

        // Acquire a temporary WakeLock to keep CPU awake while building notification and starting service
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "AnaMuslim:AlarmWakeLock");
            wakeLock.acquire(10000); // 10 seconds timeout safety
        }

        try {
            // 1. Create native notification channel with silent configuration to avoid default ringtone double-beeps
            createNotificationChannel(context, voiceId);

            // 2. Build intent to launch app on click
            Intent appIntent = new Intent(context, MainActivity.class);
            appIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pendingIntent = PendingIntent.getActivity(
                    context,
                    0,
                    appIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
            );

            // 3. Build notification
            String title = "🕌 حان الآن موعد صلاة " + prayerName;
            String text = "الله أكبر، الله أكبر.. نداء الحق لصلاة " + prayerName + " بتوقيتك المحلي.";

            if (prayerName != null && (prayerName.contains("النبي") || prayerName.contains("الصلاة") || prayerName.contains("الذكر") || prayerName.contains("صلى"))) {
                title = "💚 تذكير بالصلاة على النبي ﷺ";
                text = "اللهم صلِّ وسلِّم وبارك على نبينا محمد وعلى آله وصحبه أجمعين.";
            }

            int appIconResId = context.getApplicationInfo().icon;
            if (appIconResId == 0) {
                appIconResId = android.R.drawable.ic_dialog_info;
            }

            RemoteViews customView = new RemoteViews(context.getPackageName(), R.layout.custom_notification);
            customView.setTextViewText(R.id.notification_title, title);
            customView.setTextViewText(R.id.notification_message, text);
            customView.setImageViewResource(R.id.notification_icon, appIconResId);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(appIconResId)
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setContentIntent(pendingIntent)
                    .setFullScreenIntent(pendingIntent, true) // Trigger heads-up popup over screen!
                    .setAutoCancel(true)
                    .setSound(null) // Crucial: Set sound to null to prevent default notification beeps!
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setStyle(new NotificationCompat.DecoratedCustomViewStyle())
                    .setCustomContentView(customView)
                    .setCustomHeadsUpContentView(customView);

            if (voiceId != null && voiceId.equals("silent")) {
                builder.setVibrate(null);
            } else {
                builder.setVibrate(new long[]{0, 1000, 500, 1000});
            }

            NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (notificationManager != null) {
                notificationManager.notify(getNotificationId(prayerName), builder.build());
            }

            // 4. Delegate sound playback to AlarmSoundService so it plays fully in background without interruption
            if (voiceId != null && !voiceId.equals("silent")) {
                try {
                    Intent serviceIntent = new Intent(context, AlarmSoundService.class);
                    serviceIntent.putExtra("voiceId", voiceId);
                    context.startService(serviceIntent);
                    Log.d(TAG, "Successfully delegated playback to AlarmSoundService");
                } catch (Exception ex) {
                    Log.e(TAG, "Failed to start AlarmSoundService from background, ignoring.", ex);
                }
            }

        } catch (Exception e) {
            Log.e(TAG, "Error in AlarmReceiver onReceive", e);
        } finally {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        }
    }

    private void createNotificationChannel(Context context, String voiceId) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "أوقات الصلاة والتنبيهات والآذان";
            String description = "تنبيهات مواعيد الصلوات الخمس والأذكار والآيات الشريفة بحد أقصى للأولوية لظهورها كإشعار منبثق على شاشة الهاتف.";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableLights(true);
            channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
            
            // Set channel sound to null to completely silence the native default ringtone double-beeping!
            channel.setSound(null, null);

            if (voiceId != null && voiceId.equals("silent")) {
                channel.enableVibration(false);
            } else {
                channel.enableVibration(true);
            }

            NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
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
