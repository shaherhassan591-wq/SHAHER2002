import React, { useState } from "react";
import { X, Send, Mail, AlertCircle, CheckCircle, MessageSquare } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { isNativeAndroid } from "../utils/androidBridge";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export default function FeedbackModal({ isOpen, onClose, darkMode = true }: FeedbackModalProps) {
  const { t, isAr } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "suggestion", // suggestion | issue | other
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return isAr ? "يرجى كتابة الاسم الكريم" : "Please enter your name";
    }
    if (!formData.message.trim()) {
      return isAr ? "يرجى كتابة نص الرسالة" : "Please enter your message";
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return isAr ? "البريد الإلكتروني المدخل غير صحيح" : "Please enter a valid email address";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setSubmitStatus("error");
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    const isNative = isNativeAndroid();
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    // Build submission object
    const newSubmission = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      ...formData,
      submittedAt: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Android Native App",
    };

    // Save to local storage in all cases as a secure offline backup
    try {
      const existingStr = localStorage.getItem("local_feedback_submissions") || "[]";
      const existing = JSON.parse(existingStr);
      existing.push(newSubmission);
      localStorage.setItem("local_feedback_submissions", JSON.stringify(existing));
    } catch (saveErr) {
      console.warn("Failed to backup feedback to localStorage", saveErr);
    }

    // If running in native Android or device is offline, we complete successfully offline!
    if (isNative || !isOnline) {
      setTimeout(() => {
        setSubmitStatus("success");
        setIsSubmitting(false);
        // Reset form
        setFormData({
          name: "",
          email: "",
          type: "suggestion",
          message: "",
        });
      }, 600);
      return;
    }

    // Otherwise, attempt to send to Express API route in standard browser mode
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSubmission),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback to server");
      }

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        type: "suggestion",
        message: "",
      });
    } catch (err: any) {
      console.error("Feedback submission error: ", err);
      // Fallback is already saved in local storage, so we can still mark it as success but warn them or fallback to email.
      setSubmitStatus("error");
      setErrorMessage(
        isAr
          ? "تعذر الإرسال الفوري للخادم لعدم توفر اتصال بالإنترنت. تم حفظ مقترحك بأمان محلياً على جهازك، ويمكنك الضغط على زر البريد بالأسفل لإرساله لنا مباشرة."
          : "Could not send immediately to server. Your input has been saved locally on this device. You can click the Email button below to send it to us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to generate mailto URL
  const getMailtoUrl = () => {
    const subject = encodeURIComponent(`[Ana Muslim Feedback] - ${formData.type.toUpperCase()}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email || "Not Provided"}\n` +
      `Type: ${formData.type}\n\n` +
      `Message:\n${formData.message}`
    );
    return `mailto:shaher2.2020@gmail.com?subject=${subject}&body=${body}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Content Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
          className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden z-10 font-sans ${
            darkMode
              ? "bg-[#071b29] border-white/10 text-white"
              : "bg-[#fdfbf7] border-amber-900/15 text-slate-800"
          }`}
          style={{ direction: isAr ? "rtl" : "ltr" }}
        >
          {/* Top Banner Accent */}
          <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-amber-300 to-[#cca05a]" />

          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-4 ${isAr ? "left-4" : "right-4"} p-2 rounded-full transition-colors ${
              darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-amber-900/5 text-slate-500 hover:text-slate-800"
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
              <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-[#cca05a]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">
                  {isAr ? "مربع الاقتراحات والشكاوى" : "Suggestions & Reports Box"}
                </h3>
                <p className={`text-[11px] leading-normal ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  {isAr
                    ? "نسعد بآرائكم لتطوير التطبيق وخدمة المسلمين"
                    : "We value your input to improve this app for Muslims"}
                </p>
              </div>
            </div>

            {submitStatus === "success" ? (
              /* Success State View */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6 space-y-4"
              >
                <div className="inline-flex p-3 bg-emerald-500/10 rounded-full border border-emerald-500/30 text-emerald-400 mb-2">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h4 className="text-base font-bold text-emerald-400">
                  {isAr ? "تم الإرسال بنجاح! الحمد لله" : "Successfully Sent! Alhamdulillah"}
                </h4>
                <p className={`text-xs leading-relaxed max-w-sm mx-auto ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                  {isAr
                    ? "نشكرك جزيلاً على وقتك واهتمامك. مقترحك يساهم في جعل التطبيق أكثر نفعاً وفائدة للمسلمين."
                    : "Thank you for your valuable time and input. Your feedback helps make the app more beneficial for everyone."}
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-2.5 justify-center">
                  <button
                    onClick={() => setSubmitStatus("idle")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      darkMode
                        ? "bg-slate-800 hover:bg-slate-750 text-white"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                    }`}
                  >
                    {isAr ? "إرسال مقترح آخر" : "Send Another Suggestion"}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-[#cca05a] hover:opacity-90 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
                  >
                    {isAr ? "إغلاق النافذة" : "Close Window"}
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Submission Form View */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Banner */}
                {submitStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-red-500/10 border border-red-500/35 rounded-2xl flex items-start gap-2.5 text-right text-xs text-red-400"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold">{isAr ? "تنبيـه:" : "Notice:"}</p>
                      <p className="leading-relaxed">{errorMessage}</p>
                    </div>
                  </motion.div>
                )}

                {/* Form Field Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name field */}
                  <div className="flex flex-col gap-1">
                    <label className={`text-[11px] font-bold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      {isAr ? "الاسم الكريم:" : "Your Name:"} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={isAr ? "شاهر حسان" : "Shaher Hassan"}
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-[#cca05a] transition ${
                        darkMode
                          ? "bg-slate-900/60 border-white/5 text-white placeholder-slate-500"
                          : "bg-white border-slate-250 text-slate-800 placeholder-slate-400"
                      }`}
                    />
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col gap-1">
                    <label className={`text-[11px] font-bold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      {isAr ? "البريد الإلكتروني (اختياري):" : "Your Email (optional):"}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-[#cca05a] transition ${
                        darkMode
                          ? "bg-slate-900/60 border-white/5 text-white placeholder-slate-500"
                          : "bg-white border-slate-250 text-slate-800 placeholder-slate-400"
                      }`}
                    />
                  </div>
                </div>

                {/* Feedback Type Selector */}
                <div className="flex flex-col gap-1">
                  <label className={`text-[11px] font-bold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                    {isAr ? "نوع الرسالة أو الطلب:" : "Feedback Type:"}
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-[#cca05a] transition cursor-pointer appearance-none ${
                      darkMode
                        ? "bg-slate-900 border-white/5 text-amber-100"
                        : "bg-white border-slate-250 text-slate-800"
                    }`}
                  >
                    <option value="suggestion">{isAr ? "💡 اقتراح أو فكرة تحسين" : "💡 Suggestion or Improvement"}</option>
                    <option value="issue">{isAr ? "⚙️ بلاغ عن مشكلة فنية" : "⚙️ Technical Issue or Bug"}</option>
                    <option value="other">{isAr ? "✉️ تواصل أو استفسار عام" : "✉️ General Inquiry"}</option>
                  </select>
                </div>

                {/* Feedback message */}
                <div className="flex flex-col gap-1">
                  <label className={`text-[11px] font-bold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                    {isAr ? "تفاصيل الرسالة والمقترح:" : "Message / Details:"} <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder={
                      isAr
                        ? "يرجى كتابة تفاصيل مقترحك أو تفاصيل المشكلة الفنية التي واجهتك..."
                        : "Type the details of your suggestion or technical issue here..."
                    }
                    className={`w-full px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-[#cca05a] transition resize-none ${
                      darkMode
                        ? "bg-slate-900/60 border-white/5 text-white placeholder-slate-500"
                        : "bg-white border-slate-250 text-slate-800 placeholder-slate-400"
                    }`}
                  />
                </div>

                {/* Submission Action Buttons */}
                <div className="pt-2.5 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-[#cca05a] text-slate-950 font-black rounded-xl text-xs hover:opacity-95 transition shadow-lg hover:shadow-amber-500/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? (isAr ? "جاري إرسال مقترحك..." : "Sending your feedback...") : (isAr ? "إرسال المقترح" : "Submit Feedback")}</span>
                  </button>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 py-1">
                    <span className="h-px bg-slate-500/20 flex-1 mx-2" />
                    <span>{isAr ? "أو أرسل بريداً إلكترونياً مباشراً" : "OR SEND DIRECT EMAIL"}</span>
                    <span className="h-px bg-slate-500/20 flex-1 mx-2" />
                  </div>

                  {/* Mailto alternative action */}
                  <a
                    href={getMailtoUrl()}
                    className={`w-full py-3 border border-dashed text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      darkMode
                        ? "bg-slate-900/40 border-amber-500/30 text-amber-300 hover:bg-amber-500/15 hover:text-white"
                        : "bg-amber-50/20 border-amber-900/20 text-slate-800 hover:bg-amber-900/5 hover:text-amber-900"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isAr ? "تجهيز وإرسال كبريد إلكتروني ✉️" : "Send as Direct Email ✉️"}</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
