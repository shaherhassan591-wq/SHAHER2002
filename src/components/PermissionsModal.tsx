import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  MapPin, 
  Check, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Clock, 
  BookOpen 
} from "lucide-react";
import { requestLocalNotificationPermissions, isLocalNotificationsSupported } from "../utils/localNotifications";
import { isNativeAndroid } from "../utils/androidBridge";

interface PermissionsModalProps {
  onComplete: () => void;
  darkMode: boolean;
}

export default function PermissionsModal({ onComplete, darkMode }: PermissionsModalProps) {
  const [notificationStatus, setNotificationStatus] = useState<"default" | "granted" | "denied">("default");
  const [locationStatus, setLocationStatus] = useState<"default" | "granted" | "denied">("default");
  const [isRequestingNotifications, setIsRequestingNotifications] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Detect initial permission status on mount
  useEffect(() => {
    // Check Notification API
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationStatus("granted");
      } else if (Notification.permission === "denied") {
        setNotificationStatus("denied");
      }
    }

    // Check Geolocation API (permissions query)
    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" as PermissionName }).then((result) => {
        if (result.state === "granted") {
          setLocationStatus("granted");
        } else if (result.state === "denied") {
          setLocationStatus("denied");
        }
        // Watch for changes
        result.onchange = () => {
          if (result.state === "granted") {
            setLocationStatus("granted");
          } else if (result.state === "denied") {
            setLocationStatus("denied");
          } else {
            setLocationStatus("default");
          }
        };
      }).catch(() => {
        // Fallback: request will tell us
      });
    }
  }, []);

  // Handler for requesting Notification permission
  const handleRequestNotifications = async () => {
    setIsRequestingNotifications(true);
    try {
      let granted = false;

      // 1. Prioritize Capacitor/Native local notifications if on native Android
      if (isNativeAndroid() && isLocalNotificationsSupported()) {
        const nativeGranted = await requestLocalNotificationPermissions();
        if (nativeGranted) {
          granted = true;
          setNotificationStatus("granted");
        } else {
          setNotificationStatus("denied");
        }
      } else {
        // 2. Try standard web Notifications
        if (typeof window !== "undefined" && "Notification" in window) {
          const res = await Notification.requestPermission();
          if (res === "granted") {
            granted = true;
            setNotificationStatus("granted");
          } else if (res === "denied") {
            setNotificationStatus("denied");
          }
        }
      }
      
      if (granted) {
        // Trigger a nice haptic or subtle desktop browser notification test
        try {
          new window.Notification("تطبيق أنا مسلم 🕌", {
            body: "تم تفعيل التنبيهات والأذان بنجاح!",
            icon: "/splash_screen.jpg",
          });
        } catch (e) {}
      }
    } catch (err) {
      console.warn("Error requesting notification permissions", err);
    } finally {
      setIsRequestingNotifications(false);
    }
  };

  // Handler for requesting Location permission
  const handleRequestLocation = () => {
    setIsRequestingLocation(true);
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus("granted");
          setIsRequestingLocation(false);
          // Save location coords to localStorage to calculate prayer times instantly
          localStorage.setItem(
            "cached_user_location",
            JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: Date.now(),
            })
          );
          // Dispatch a custom event so other components (Dashboard, prayer times calculator) update
          window.dispatchEvent(new Event("user-location-updated"));
        },
        (error) => {
          setLocationStatus("denied");
          setIsRequestingLocation(false);
          console.warn("Geolocation permission error", error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsRequestingLocation(false);
    }
  };

  // Finish onboarding
  const handleFinish = () => {
    localStorage.setItem("has_seen_permissions_modal", "true");
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-[#04121e]/95 backdrop-blur-md flex items-center justify-center text-white overflow-y-auto z-[99999] p-4 select-none">
      
      {/* Glow decorative ambient shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden text-right flex flex-col ${
          darkMode 
            ? "bg-gradient-to-b from-[#0a273c] to-[#051624] border-[#cca05a]/20" 
            : "bg-white text-slate-900 border-amber-200"
        }`}
        style={{ direction: "rtl" }}
      >
        {/* Visual Header Banner */}
        <div className="relative p-6 text-center border-b border-white/5 bg-gradient-to-r from-emerald-950/40 via-[#071b29] to-amber-950/40 flex flex-col items-center">
          <div className="absolute left-4 top-4 opacity-[0.03] text-7xl text-amber-500 pointer-events-none">🕌</div>
          
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-[#cca05a]/30 flex items-center justify-center mb-3">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
          </div>

          <h2 className="text-xl font-bold text-amber-500 tracking-tight">
            تفعيل صلاحيات وإعدادات الهاتف
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 max-w-md leading-relaxed">
            للحصول على كامل روحانية التطبيق وتشغيله بكافة مزاياه وخدماته الهامة، يرجى تفعيل الأذونات التالية من هاتفك:
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 flex-1">
          
          {/* Card 1: Notifications */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            notificationStatus === "granted" 
              ? (darkMode ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200")
              : (darkMode ? "bg-[#0b1e2d] border-white/5" : "bg-slate-50 border-slate-200")
          }`}>
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl ${
                notificationStatus === "granted"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-amber-500/15 text-[#cca05a]"
              }`}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-500">
                    أصوات الأذان والذكر التلقائي 🔔
                  </h3>
                  {notificationStatus === "granted" && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                      <Check className="w-3 h-3" /> مسموح به
                    </span>
                  )}
                  {notificationStatus === "denied" && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full font-bold">
                      <AlertCircle className="w-3 h-3" /> مرفوض
                    </span>
                  )}
                </div>
                <p className={`text-xs leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  يتطلب إذن الإشعارات لتنبيهك بالصلاة على النبي ﷺ والصلوات الخمس في وقتها الدقيق حتى لو كان التطبيق مغلقاً تماماً أو في الخلفية.
                </p>

                {notificationStatus !== "granted" && (
                  <button
                    onClick={handleRequestNotifications}
                    disabled={isRequestingNotifications}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    <span>{isRequestingNotifications ? "جاري تفعيل الإذن..." : "سماح بالإشعارات والأذان 🔔"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Location */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            locationStatus === "granted" 
              ? (darkMode ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200")
              : (darkMode ? "bg-[#0b1e2d] border-white/5" : "bg-slate-50 border-slate-200")
          }`}>
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl ${
                locationStatus === "granted"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-amber-500/15 text-[#cca05a]"
              }`}>
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-amber-500">
                    تحديد الموقع الجغرافي 📍
                  </h3>
                  {locationStatus === "granted" && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                      <Check className="w-3 h-3" /> مسموح به
                    </span>
                  )}
                  {locationStatus === "denied" && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full font-bold">
                      <AlertCircle className="w-3 h-3" /> مرفوض
                    </span>
                  )}
                </div>
                <p className={`text-xs leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  يتم استخدام الموقع فقط لحساب أوقات الصلاة والاتجاه الدقيق لبوصلة القبلة، والبحث التلقائي عن أقرب المساجد إليك بنظام أوفلاين آمن.
                </p>

                {locationStatus !== "granted" && (
                  <button
                    onClick={handleRequestLocation}
                    disabled={isRequestingLocation}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    <span>{isRequestingLocation ? "جاري تفعيل الإذن..." : "سماح بتحديد الموقع 📍"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed bg-[#061726]/40 p-3 rounded-xl border border-white/5">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>ملاحظة خصوصية هامة:</strong> تطبيق «أنا مسلم» لا يجمع ولا يشارك أي بيانات خاصة بك أو بيانات موقعك مع أي خوادم خارجية تماماً. تتم جميع العمليات الحسابية محلياً في هاتفك بشكل آمن تماماً وبدون إنترنت.
            </p>
          </div>

        </div>

        {/* Action Button Footer */}
        <div className="p-6 border-t border-white/5 bg-gradient-to-r from-emerald-950/10 via-[#071b29]/40 to-amber-950/10 flex flex-col space-y-2">
          <button
            onClick={handleFinish}
            className="w-full bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-700 hover:to-amber-600 text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl transition shadow-xl hover:shadow-emerald-950/20 active:scale-[0.98]"
          >
            حفظ الصلاحيات والدخول للتطبيق 🕌
          </button>
          
          <button 
            onClick={handleFinish}
            className={`w-full text-[11px] font-bold py-1 text-center underline transition duration-200 ${
              darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            تخطي لخطوة لاحقة يدوية
          </button>
        </div>

      </motion.div>
    </div>
  );
}
