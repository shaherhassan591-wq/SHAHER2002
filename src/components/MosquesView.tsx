import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap, 
  useMapsLibrary 
} from '@vis.gl/react-google-maps';
import { 
  Compass, 
  MapPin, 
  Search, 
  Navigation, 
  Info, 
  BookOpen, 
  Map as MapIcon, 
  Check, 
  ExternalLink,
  ChevronDown,
  RefreshCw
} from "lucide-react";
import { isNativeAndroid, requestNativeLocationPermission, ensureLocationPermission } from "../utils/androidBridge";

// Get API Key securely
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

interface Mosque {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: google.maps.LatLngLiteral;
  googleMapsURI?: string;
  distance?: number; // meters
}

interface MosquesViewProps {
  darkMode: boolean;
}

export default function MosquesView({ darkMode }: MosquesViewProps) {
  const { language, isAr, dir } = useLanguage();

  // Color Theme Accent tracking
  const [accentTheme, setAccentTheme] = useState<string>(() => {
    return localStorage.getItem("app_accent_theme") || "gold";
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setAccentTheme(localStorage.getItem("app_accent_theme") || "gold");
    };
    window.addEventListener("theme-changed", handleThemeChange);
    return () => {
      window.removeEventListener("theme-changed", handleThemeChange);
    };
  }, []);

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case "emerald":
        return {
          hex: "#10b981",
          text: "text-emerald-400",
          border: "border-emerald-500/20",
          bg: "bg-emerald-500",
          accentBg: "bg-emerald-500/10",
          borderSolid: "border-emerald-500",
        };
      case "blue":
        return {
          hex: "#0284c7",
          text: "text-sky-400",
          border: "border-sky-500/20",
          bg: "bg-sky-500",
          accentBg: "bg-sky-500/10",
          borderSolid: "border-sky-500",
        };
      case "ruby":
        return {
          hex: "#f43f5e",
          text: "text-rose-400",
          border: "border-rose-500/20",
          bg: "bg-rose-500",
          accentBg: "bg-rose-500/10",
          borderSolid: "border-rose-500",
        };
      case "purple":
        return {
          hex: "#8b5cf6",
          text: "text-violet-400",
          border: "border-violet-500/20",
          bg: "bg-violet-500",
          accentBg: "bg-violet-500/10",
          borderSolid: "border-violet-500",
        };
      case "gold":
      default:
        return {
          hex: "#cca05a",
          text: "text-amber-400",
          border: "border-[#cca05a]/20",
          bg: "bg-[#cca05a]",
          accentBg: "bg-[#cca05a]/10",
          borderSolid: "border-[#cca05a]",
        };
    }
  };

  const colors = getThemeColor(accentTheme);

  // Core state for searching & geolocation
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: 21.4225, lng: 39.8262 }); // Default Mecca Kaaba
  const [radius, setRadius] = useState<number>(3000); // meters
  const [places, setPlaces] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [selectedPlace, setSelectedPlace] = useState<Mosque | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"map" | "rulings">("map");

  // Load user current location on start
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    if (navigator.geolocation) {
      setLoading(true);
      setStatusMessage(isAr ? "جاري تحديد موقعك الجغرافي..." : "Detecting your location...");
      if (isNativeAndroid()) {
        const isGranted = await ensureLocationPermission();
        if (!isGranted) {
          setLoading(false);
          setStatusMessage(
            isAr 
              ? "تم رفض إذن الوصول للموقع الجغرافي. يمكنك استخدام البحث أو التكبير على الخريطة." 
              : "Location permission was denied. Please use the search bar or map controls."
          );
          return;
        }
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setMapCenter(loc);
          setStatusMessage(isAr ? "تم تحديد موقعك بنجاح" : "Location detected successfully");
          setLoading(false);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setLoading(false);
          setStatusMessage(
            isAr 
              ? "تعذر الحصول على موقعك الجغرافي تلقائياً. يمكنك استخدام البحث أو التكبير على الخريطة." 
              : "Could not retrieve geolocation automatically. Please use the search bar or map controls."
          );
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      setStatusMessage(isAr ? "المتصفح لا يدعم تحديد الموقع" : "Geolocation not supported by browser.");
    }
  };

  // Safe API Key Splash Screen rendering
  if (!hasValidKey) {
    return (
      <div className={`w-full max-w-xl mx-auto p-6 my-10 rounded-2xl border text-center space-y-6 ${
        darkMode ? "bg-slate-950/80 border-white/5 text-white" : "bg-white border-amber-900/10 text-slate-800"
      }`}>
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-[#cca05a] border border-amber-500/20 mx-auto">
          <MapIcon className="w-8 h-8 text-amber-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-amber-400">
            {isAr ? "مطلوب مفتاح خرائط جوجل (Google Maps API Key Required)" : "Google Maps API Key Required"}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            {isAr 
              ? "لتفعيل ميزة البحث عن المساجد القريبة على الخريطة التفاعلية، يرجى تزويد التطبيق بمفتاح المنصة من الإعدادات."
              : "To enable interactive mosque search and maps, please set up the Google Maps API Key in your app secrets."}
          </p>
        </div>

        <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 text-right text-xs space-y-3" style={{ direction: "rtl" }}>
          <p className="font-bold text-amber-500 mb-1">💡 طريقة إضافة المفتاح وتشغيل الخرائط:</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>الحصول على مفتاح خرائط جوجل من <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">منصة جوجل السحابية</a>.</li>
            <li>افتح <strong>الإعدادات (Settings)</strong> من الأيقونة بأعلى يمين المنصة (⚙️ ترس الإعدادات).</li>
            <li>اختر <strong>السرية (Secrets)</strong> ثم اكتب اسم المتغير بالتحديد: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-rose-400">GOOGLE_MAPS_PLATFORM_KEY</code></li>
            <li>ضع قيمة المفتاح في حقل القيمة ثم اضغط <strong>Enter</strong> لحفظه وتحديث التطبيق تلقائياً.</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-3 md:p-6 space-y-6" style={{ direction: dir }}>
      
      {/* HEADER SECTION */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 ${
        darkMode 
          ? "bg-gradient-to-br from-[#071b29] to-[#04121e] border-[#cca05a]/20" 
          : "bg-gradient-to-br from-amber-50 to-orange-100/40 border-amber-900/10"
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-right">
            <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center justify-center sm:justify-start gap-2">
              <Compass className="w-5.5 h-5.5 text-amber-500 animate-spin-slow" />
              {isAr ? "خريطة المساجد القريبة وصلاة الجماعة" : "Nearby Mosques & Travel Prayer Map"}
            </h2>
            <p className="text-[11px] text-slate-400 font-light mt-1 max-w-xl">
              {isAr 
                ? "حدد موقعك الحالي للبحث عن أقرب المساجد لأداء صلاة الجماعة، مع دليل ميسّر للأحكام الشرعية للمسافر (الجمع والقصر)."
                : "Locate mosques nearest to you during travels, equipped with comprehensive Islamic guidelines for prayer shortening and combination."}
            </p>
          </div>

          {/* Quick tab toggle */}
          <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab("map")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "map"
                  ? `${colors.bg} text-slate-950 font-extrabold shadow-sm`
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{isAr ? "الخريطة التفاعلية" : "Interactive Map"}</span>
            </button>
            <button
              onClick={() => setActiveTab("rulings")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "rulings"
                  ? `${colors.bg} text-slate-950 font-extrabold shadow-sm`
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isAr ? "أحكام صلاة السفر" : "Traveler Rulings"}</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === "map" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: CONTROLS & MOSQUES LIST */}
          <div className="lg:col-span-4 space-y-4 flex flex-col">
            
            {/* Search and Locate Widget */}
            <div className={`p-4 rounded-xl border space-y-3.5 ${
              darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
            }`}>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-400 block">
                  {isAr ? "🌐 تحديد موقع البحث" : "🌐 Search Area"}
                </span>
                <p className="text-[9px] text-slate-400 font-light">
                  {isAr 
                    ? "ابحث باسم المدينة أو الحي، أو انقر على الزر لتحديد موقعك عبر GPS مباشرة" 
                    : "Search by city, or click to use browser GPS location immediately"}
                </p>
              </div>

              {/* Geolocation Button */}
              <button
                onClick={detectLocation}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                  userLocation 
                    ? "bg-slate-950/40 border-amber-500/30 text-amber-200" 
                    : "bg-amber-500/10 border-amber-500/20 text-[#cca05a] hover:bg-amber-500/20"
                }`}
              >
                <MapPin className={`w-4 h-4 text-amber-500 ${loading ? "animate-bounce" : ""}`} />
                <span>{isAr ? "تحديد موقعي الحالي (GPS)" : "Detect My Location (GPS)"}</span>
              </button>

              {/* Search input with Address lookup fallback */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold block">
                  {isAr ? "🔍 ابحث عن موقع يدوي" : "🔍 Custom Search Address"}
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isAr ? "مثال: مكة المكرمة، القاهرة، الرياض..." : "e.g. Mecca, Cairo, Riyadh..."}
                    className="w-full bg-slate-950/80 border border-white/5 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // Triggers query
                      }
                    }}
                  />
                  <SearchAddress query={searchQuery} onLocationFound={(loc) => {
                    setMapCenter(loc);
                    setUserLocation(loc);
                  }} />
                </div>
              </div>

              {/* Radius selector */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <span>{isAr ? "📐 نطاق البحث" : "📐 Search Radius"}</span>
                  <span className="text-amber-400">{(radius / 1000).toFixed(0)} {isAr ? "كم" : "km"}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {[1000, 3000, 5000, 10000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setRadius(val)}
                      className={`py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                        radius === val
                          ? "bg-[#cca05a]/20 border-[#cca05a] text-amber-100"
                          : "bg-slate-950/40 border-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {val / 1000} {isAr ? "كم" : "km"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className="p-2 bg-slate-950/30 rounded text-[10px] text-amber-200 font-light border border-white/5">
                  {statusMessage}
                </div>
              )}
            </div>

            {/* List of Found Mosques */}
            <div className={`p-4 rounded-xl border flex-1 flex flex-col space-y-3 min-h-[300px] max-h-[450px] overflow-hidden ${
              darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-amber-400">
                  {isAr ? "🕌 المساجد المكتشفة" : "🕌 Identified Mosques"}
                </span>
                <span className="font-mono text-[10px] bg-slate-950/50 px-2 py-0.5 rounded text-amber-500">
                  {places.length} {isAr ? "مساجد" : "Mosques"}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-3">
                    <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
                    <span className="text-xs text-slate-400">{isAr ? "جاري البحث عن المساجد القريبة..." : "Searching nearby mosques..."}</span>
                  </div>
                ) : places.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-xs text-slate-400 font-light">{isAr ? "لم يتم العثور على مساجد في هذا النطاق" : "No mosques found in this radius"}</p>
                    <p className="text-[10px] text-slate-500 font-light">{isAr ? "جرب زيادة نطاق البحث أو تغيير الموقع" : "Try increasing the radius or moving the map"}</p>
                  </div>
                ) : (
                  places.map((p) => {
                    const isSelected = selectedPlace?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPlace(p);
                          setMapCenter(p.location);
                        }}
                        className={`p-3 rounded-lg border text-right transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? `${colors.borderSolid} bg-[#cca05a]/10`
                            : "bg-slate-950/20 border-white/5 hover:bg-slate-950/40"
                        }`}
                      >
                        <h4 className="text-xs font-bold text-amber-200 line-clamp-1">{p.displayName}</h4>
                        <p className="text-[10px] text-slate-400 font-light line-clamp-2 mt-1 leading-relaxed">
                          {p.formattedAddress}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5">
                          {p.distance !== undefined ? (
                            <span className="text-[9px] font-mono text-[#cca05a]">
                              {isAr ? "المسافة: " : "Distance: "}
                              {(p.distance / 1000).toFixed(2)} {isAr ? "كم" : "km"}
                            </span>
                          ) : (
                            <span />
                          )}

                          {p.googleMapsURI && (
                            <a
                              href={p.googleMapsURI}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-amber-400 hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>{isAr ? "خرائط جوجل" : "Google Maps"}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: GOOGLE MAP COMPONENT */}
          <div className="lg:col-span-8 flex flex-col h-[550px] lg:h-auto min-h-[500px]">
            <div className={`w-full h-full rounded-2xl border overflow-hidden relative ${
              darkMode ? "border-white/5 shadow-inner" : "border-amber-900/10 shadow-lg"
            }`} style={{ height: "100%" }}>
              
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  center={mapCenter}
                  zoom={14}
                  mapId="DEMO_MAP_ID"
                  onCenterChanged={(ev) => {
                    if (ev.detail.center) {
                      setMapCenter(ev.detail.center);
                    }
                  }}
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* User location marker */}
                  {userLocation && (
                    <AdvancedMarker position={userLocation}>
                      <Pin background="#0284c7" glyphColor="#fff" scale={1.1}>
                        <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                      </Pin>
                    </AdvancedMarker>
                  )}

                  {/* Mosque Markers */}
                  {places.map((p) => {
                    const isSelected = selectedPlace?.id === p.id;
                    return (
                      <AdvancedMarker
                        key={p.id}
                        position={p.location}
                        onClick={() => setSelectedPlace(p)}
                      >
                        <Pin 
                          background={isSelected ? "#ea580c" : colors.hex} 
                          glyphColor="#fff"
                        />
                      </AdvancedMarker>
                    );
                  })}

                  {/* Info Window */}
                  {selectedPlace && (
                    <InfoWindow
                      position={selectedPlace.location}
                      onCloseClick={() => setSelectedPlace(null)}
                    >
                      <div className="p-2 text-slate-900 text-right max-w-sm" style={{ direction: "rtl" }}>
                        <h4 className="font-bold text-xs text-amber-800 flex items-center gap-1 justify-end">
                          <span>{selectedPlace.displayName}</span>
                          <span>🕌</span>
                        </h4>
                        <p className="text-[10px] text-slate-600 mt-1">{selectedPlace.formattedAddress}</p>
                        
                        {selectedPlace.googleMapsURI && (
                          <div className="mt-2 text-left">
                            <a
                              href={selectedPlace.googleMapsURI}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] bg-[#cca05a] text-white px-2.5 py-1 rounded-md font-bold hover:bg-amber-700 transition"
                            >
                              <span>🏃 اتجاهات السفر</span>
                              <Navigation className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </InfoWindow>
                  )}

                  {/* Custom Helper to Fetch Nearby Places when Center or Radius changes */}
                  <FetchNearbyMosques 
                    center={mapCenter} 
                    radius={radius} 
                    onPlacesFound={(found) => {
                      // Compute distances if user location is known
                      if (userLocation) {
                        const withDistance = found.map(p => {
                          const dist = getDistanceFromLatLonInM().computeDistanceBetween(
                            new google.maps.LatLng(userLocation.lat, userLocation.lng),
                            new google.maps.LatLng(p.location.lat, p.location.lng)
                          );
                          return { ...p, distance: dist };
                        });
                        // Sort by distance
                        withDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
                        setPlaces(withDistance);
                      } else {
                        setPlaces(found);
                      }
                    }} 
                    setLoading={setLoading}
                  />

                </Map>
              </APIProvider>

              {/* Floating Help Banner */}
              <div className="absolute top-3 left-3 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-white/5 text-[10px] text-slate-300 pointer-events-none z-10">
                {isAr ? "📍 حرك الخريطة ليتم البحث تلقائياً" : "📍 Drag map to search automatically"}
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* 📖 RULINGS AND GUIDELINES FOR THE TRAVELING MUSLIM */
        <div className={`p-6 rounded-2xl border space-y-6 ${
          darkMode ? "bg-[#071b29] border-white/5" : "bg-white border-amber-900/10"
        }`}>
          
          <div className="text-right space-y-2 border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-amber-400">
              🕋 الجمع والقصر في السفر والجماعة
            </h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              تسهيلاً وتخفيفاً من الله الشريف لعباده، شرع الإسلام رخصة الجمع والقصر للمسافر صيانةً للفريضة وتأصيلاً لصلاة الجماعة أينما رحل.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-slate-950/20 p-5 rounded-xl border border-white/5 space-y-3.5 text-right">
              <span className="text-xs font-bold text-[#cca05a] block border-b border-[#cca05a]/10 pb-1.5">
                📏 رخصة قصر الصلاة (Shortening Prayers)
              </span>
              <ul className="space-y-3 text-xs text-slate-300 font-light leading-relaxed list-disc list-inside">
                <li>المقصود به صلاة الرباعية (الظهر، العصر، العشاء) ركعتين فقط بدلاً من أربع ركعات.</li>
                <li>لا يقصر الفجر (ركعتان) والمغرب (ثلاث ركعات) بحال من الأحوال.</li>
                <li>تبدأ الرخصة عند مفارقة بنيان القرية أو البلدة التي تسكن فيها.</li>
                <li><strong>صلاة الجماعة:</strong> إذا صلى المسافر خلف إمام مقيم، فيجب عليه إتمام الصلاة أربعاً ولا يجوز له القصر. أما إذا صلى مع جماعة مسافرين فيقصرون.</li>
              </ul>
            </div>

            <div className="bg-slate-950/20 p-5 rounded-xl border border-white/5 space-y-3.5 text-right">
              <span className="text-xs font-bold text-[#cca05a] block border-b border-[#cca05a]/10 pb-1.5">
                🔄 رخصة جمع الصلاة (Combining Prayers)
              </span>
              <ul className="space-y-3 text-xs text-slate-300 font-light leading-relaxed list-disc list-inside">
                <li>يجوز للمسافر جمع صلاة الظهر مع العصر، وصلاة المغرب مع العشاء.</li>
                <li><strong>جمع التقديم:</strong> أن يصلي الظهر والعصر معاً في وقت الظهر، أو المغرب والعشاء معاً في وقت المغرب.</li>
                <li><strong>جمع التأخير:</strong> أن يؤخر صلاة الظهر ليصليها مع العصر في وقت العصر، أو المغرب ليصليها مع العشاء في وقت العشاء.</li>
                <li>لا يجوز جمع الفجر مع ما قبله أو ما بعده، ولا جمع العصر مع المغرب.</li>
              </ul>
            </div>

          </div>

          <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/15 space-y-2.5 text-right">
            <span className="text-xs font-bold text-amber-400 block">
              💡 توجيهات لصلاة الجماعة أثناء الترحال:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              إن أداء الصلاة جماعة في المساجد التي تقع على طرق السفر يعين المسافر على كسب الأجر العظيم وملاقاة إخوانه المؤمنين. احرص على تتبع المساجد عبر الخريطة أعلاه لتنظيم فترات استراحتك وتنقلك بمحاذاة مواقيت الصلوات الخمس. نسأل الله لكم سفراً ميموناً وصلاةً مقبولة.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}

// Sub-component to perform Geocoding Lookup based on queries inside the react-google-maps context
function SearchAddress({ 
  query, 
  onLocationFound 
}: { 
  query: string; 
  onLocationFound: (loc: google.maps.LatLngLiteral) => void;
}) {
  const map = useMap();
  const geocodingLib = useMapsLibrary('geocoding');
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!geocodingLib || !query.trim() || !map) return;
    setSearching(true);
    
    const geocoder = new geocodingLib.Geocoder();
    geocoder.geocode({ address: query }, (results, status) => {
      setSearching(false);
      if (status === "OK" && results?.[0]?.geometry?.location) {
        const loc = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        onLocationFound(loc);
        map.setCenter(loc);
        map.setZoom(14);
      } else {
        console.error("Geocoding failed status:", status);
      }
    });
  };

  return (
    <button
      onClick={handleSearch}
      disabled={searching || !query.trim()}
      className="absolute top-1/2 left-2 -translate-y-1/2 p-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-md text-slate-950 transition cursor-pointer z-10"
      title="البحث عن العنوان"
    >
      {searching ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Search className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

// Helper to calculate geometry distance using geometry maps library safely
function getDistanceFromLatLonInM() {
  if (typeof window !== "undefined" && (window as any).google?.maps?.geometry?.spherical) {
    return (window as any).google.maps.geometry.spherical;
  }
  // Fallback simple haversine distance function if library isn't loaded yet
  return {
    computeDistanceBetween: (p1: google.maps.LatLng, p2: google.maps.LatLng) => {
      const R = 6371e3; // meters
      const lat1 = p1.lat() * Math.PI/180;
      const lat2 = p2.lat() * Math.PI/180;
      const deltaLat = (p2.lat()-p1.lat()) * Math.PI/180;
      const deltaLon = (p2.lng()-p1.lng()) * Math.PI/180;

      const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c;
    }
  };
}

// Helper component that subscribes to the map instance and invokes searchNearby when map changes center/radius
function FetchNearbyMosques({
  center,
  radius,
  onPlacesFound,
  setLoading
}: {
  center: google.maps.LatLngLiteral;
  radius: number;
  onPlacesFound: (places: Mosque[]) => void;
  setLoading: (val: boolean) => void;
}) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLib || !map) return;

    setLoading(true);

    const request = {
      fields: ['displayName', 'location', 'formattedAddress', 'googleMapsURI'],
      locationRestriction: {
        center,
        radius,
      },
      includedPrimaryTypes: ['mosque'],
      maxResultCount: 20,
    };

    // Use Place class from Places API (New)
    placesLib.Place.searchNearby(request)
      .then(({ places }) => {
        setLoading(false);
        if (places) {
          const formatted: Mosque[] = places.map((p) => ({
            id: p.id || Math.random().toString(),
            displayName: p.displayName || "",
            formattedAddress: p.formattedAddress || "",
            location: {
              lat: p.location?.lat() || center.lat,
              lng: p.location?.lng() || center.lng
            },
            googleMapsURI: p.googleMapsURI || undefined
          }));
          onPlacesFound(formatted);
        } else {
          onPlacesFound([]);
        }
      })
      .catch((err) => {
        console.error("searchNearby failed:", err);
        setLoading(false);
        
        // Fallback: If Places API (New) fails or isn't enabled, try Text Search or classical search
        placesLib.Place.searchByText({
          textQuery: "mosque",
          fields: ['displayName', 'location', 'formattedAddress', 'googleMapsURI'],
          locationBias: center,
          maxResultCount: 15
        }).then(({ places }) => {
          if (places) {
            const formatted: Mosque[] = places.map((p) => ({
              id: p.id || Math.random().toString(),
              displayName: p.displayName || "",
              formattedAddress: p.formattedAddress || "",
              location: {
                lat: p.location?.lat() || center.lat,
                lng: p.location?.lng() || center.lng
              },
              googleMapsURI: p.googleMapsURI || undefined
            }));
            onPlacesFound(formatted);
          } else {
            onPlacesFound([]);
          }
        }).catch((e) => {
          console.error("TextSearch fallback also failed:", e);
          onPlacesFound([]);
        });
      });

  }, [placesLib, map, center.lat, center.lng, radius]);

  return null;
}
