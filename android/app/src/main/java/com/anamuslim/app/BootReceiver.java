package com.anamuslim.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import java.util.Map;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.d(TAG, "Device rebooted. Restoring exact prayer alarms natively...");
            
            SharedPreferences prefs = context.getSharedPreferences("AnaMuslimAlarms", Context.MODE_PRIVATE);
            Map<String, ?> allEntries = prefs.getAll();
            
            for (Map.Entry<String, ?> entry : allEntries.entrySet()) {
                String key = entry.getKey();
                if (key.startsWith("alarm_")) {
                    String prayerName = key.substring(6);
                    String val = (String) entry.getValue();
                    if (val != null && val.contains("|")) {
                        String[] parts = val.split("\\|");
                        String time24h = parts[0];
                        String voiceId = parts[1];
                        
                        Log.d(TAG, "Restoring alarm: " + prayerName + " at " + time24h + " with voice: " + voiceId);
                        AlarmScheduler.scheduleAlarm(context, prayerName, time24h, voiceId);
                    }
                }
            }
        }
    }
}
