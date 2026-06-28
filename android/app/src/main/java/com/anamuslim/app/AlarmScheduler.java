package com.anamuslim.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import java.util.Calendar;

public class AlarmScheduler {
    private static final String TAG = "AlarmScheduler";
    public static final int BASE_PENDING_INTENT_ID = 2000;

    public static void scheduleAlarm(Context context, String prayerName, String time24h, String voiceId) {
        try {
            String[] timeParts = time24h.split(":");
            if (timeParts.length != 2) return;
            
            int hour = Integer.parseInt(timeParts[0]);
            int minute = Integer.parseInt(timeParts[1]);

            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) return;

            Calendar calendar = Calendar.getInstance();
            calendar.setTimeInMillis(System.currentTimeMillis());
            calendar.set(Calendar.HOUR_OF_DAY, hour);
            calendar.set(Calendar.MINUTE, minute);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);

            // If scheduled time is in the past, schedule for tomorrow
            if (calendar.getTimeInMillis() <= System.currentTimeMillis()) {
                calendar.add(Calendar.DAY_OF_YEAR, 1);
            }

            int requestCode = getUniqueRequestCode(prayerName);

            Intent intent = new Intent(context, AlarmReceiver.class);
            intent.putExtra("prayerName", prayerName);
            intent.putExtra("voiceId", voiceId);
            intent.putExtra("time24h", time24h);

            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    requestCode,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
            );

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        calendar.getTimeInMillis(),
                        pendingIntent
                );
            } else {
                alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP,
                        calendar.getTimeInMillis(),
                        pendingIntent
                );
            }

            // Save state to SharedPreferences to allow native BootReceiver to restore it on reboot
            SharedPreferences prefs = context.getSharedPreferences("AnaMuslimAlarms", Context.MODE_PRIVATE);
            prefs.edit().putString("alarm_" + prayerName, time24h + "|" + voiceId).apply();

            Log.d(TAG, "Natively scheduled EXACT alarm for " + prayerName + " at " + time24h + " (RequestCode: " + requestCode + ")");
        } catch (Exception e) {
            Log.e(TAG, "Failed to schedule exact alarm", e);
        }
    }

    public static void cancelAlarms(Context context) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager == null) return;

            SharedPreferences prefs = context.getSharedPreferences("AnaMuslimAlarms", Context.MODE_PRIVATE);
            java.util.Map<String, ?> allEntries = prefs.getAll();
            for (java.util.Map.Entry<String, ?> entry : allEntries.entrySet()) {
                String key = entry.getKey();
                if (key.startsWith("alarm_")) {
                    String prayer = key.substring(6); // get prayerName
                    int requestCode = getUniqueRequestCode(prayer);
                    Intent intent = new Intent(context, AlarmReceiver.class);
                    PendingIntent pendingIntent = PendingIntent.getBroadcast(
                            context,
                            requestCode,
                            intent,
                            PendingIntent.FLAG_NO_CREATE | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
                    );
                    if (pendingIntent != null) {
                        alarmManager.cancel(pendingIntent);
                        pendingIntent.cancel();
                    }
                }
            }

            // Clear backup cache
            prefs.edit().clear().apply();

            Log.d(TAG, "Natively cancelled all active alarms dynamically from SharedPreferences");
        } catch (Exception e) {
            Log.e(TAG, "Failed to cancel native alarms", e);
        }
    }

    private static int getUniqueRequestCode(String prayerName) {
        if (prayerName == null) return BASE_PENDING_INTENT_ID;
        switch (prayerName) {
            case "الفجر": return BASE_PENDING_INTENT_ID + 1;
            case "الشروق": return BASE_PENDING_INTENT_ID + 2;
            case "الظهر": return BASE_PENDING_INTENT_ID + 3;
            case "العصر": return BASE_PENDING_INTENT_ID + 4;
            case "المغرب": return BASE_PENDING_INTENT_ID + 5;
            case "العشاء": return BASE_PENDING_INTENT_ID + 6;
            default: return BASE_PENDING_INTENT_ID + Math.abs(prayerName.hashCode() % 1000);
        }
    }
}
