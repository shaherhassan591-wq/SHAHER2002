# 📱 طريقة الحصول على تطبيق APK وتصدير المشروع إلى GitHub من الهاتف بدون كمبيوتر
# How to Get the APK and Export the Project to GitHub from your Phone

بما أنك تستخدم الهاتف المحمول ولا تملك جهاز كمبيوتر، لا داعي للقلق! يمكنك تصدير المشروع بالكامل إلى **GitHub** وتحميل تطبيق الـ **APK** مباشرة على هاتفك باتباع الخطوات البسيطة التالية.

---

## 🚀 الجزء الأول: كيف ترفع مجلدات المشروع إلى GitHub من الهاتف؟

لا تحتاج إلى كتابة أي أوامر برمجية أو استخدام كمبيوتر. واجهة **Google AI Studio** تتيح لك تصدير مشروعك مباشرة بضغطة زر:

1. **افتح واجهة التطبيق في Google AI Studio** على متصفح هاتفك.
2. في الزاوية العلوية (أو القائمة الجانبية)، اضغط على زر **Settings (الإعدادات)** أو أيقونة **تصدير / مشاركة (Export / Share)**.
3. اضغط على خيار **Export to GitHub (التصدير إلى GitHub)**.
4. سيطلب منك المتصفح تسجيل الدخول بحسابك على **GitHub** (إذا لم يكن لديك حساب، يمكنك إنشاء حساب مجاني جديد في دقيقة واحدة).
5. بعد تسجيل الدخول والموافقة، سيقوم النظام **تلقائياً وبشكل كامل** بإنشاء مستودع (Repository) جديد ورفع جميع الملفات والمجلدات إليه دون أي تدخل منك!

---

## 🛠️ الجزء الثاني: كيف تحصل على ملف الـ APK وتثبته على هاتفك؟

لقد قمنا بإعداد نظام **GitHub Actions** ذكي داخل المشروع. بمجرد رفع المشروع إلى GitHub، ستبدأ خوادم GitHub المجانية والعملاقة ببناء وتجميع تطبيق الأندرويد تلقائياً:

1. بعد إتمام تصدير المشروع، افتح حسابك في **GitHub** من متصفح الهاتف واذهب للمستودع (Repository) الخاص بمشروعك الجديد.
2. اضغط على تبويب **Actions** الموجود في الأعلى.
3. ستجد سير عمل يعمل حالياً باسم: **`Build Offline Android APK ('أنا مسلم')`**.
4. انتظر من **3 إلى 5 دقائق** حتى يكتمل البناء ويتحول الشعار إلى اللون الأخضر (✅).
5. اضغط على اسم العملية المكتملة، ثم انزل إلى أسفل الصفحة حتى تصل إلى قسم **Artifacts (المرفقات)**.
6. ستجد ملفاً باسم **`ana-muslim-offline-apk`**. اضغط عليه لتحميله مباشرة إلى هاتفك.
7. بعد التحميل، قم بفك الضغط عن الملف (Zip) لتجد بداخله ملف التثبيت المباشر **`app-debug.apk`**.
8. قم بتثبيت التطبيق على هاتفك واستمتع بتطبيقك الإسلامي المتكامل **أنا مسلم**!

---

### ⚠️ لماذا لا يمكن إضافة الـ APK مباشرة في ملفات المشروع هنا؟
البيئة التجريبية الحالية (Cloud Container) هي خادم ويب خفيف مخصص فقط لتشغيل وتجربة الكود، ولا تحتوي على حزم تطوير أندرويد الضخمة (Android SDK) ولا بيئة تشغيل جافا (JDK) اللازمة لبناء وتجميع ملفات الأندرويد الثنائية (Binary APK). لذلك، فإن **GitHub** هو الحل السحابي الأفضل والأقوى للقيام بذلك مجاناً وبضغطة زر من الهاتف.

---

# English Quick Guide

### 1. How to upload to GitHub from your phone:
1. Open your project inside **Google AI Studio**.
2. Click on the **Settings/Export** menu at the top.
3. Select **"Export to GitHub"**.
4. Log in with your GitHub account, and AI Studio will automatically upload the entire project to your repository.

### 2. How to download the APK on your phone:
1. Go to your exported repository on the GitHub mobile browser.
2. Click on the **Actions** tab.
3. Select the latest running action: **`Build Offline Android APK`**.
4. Wait **3-5 minutes** until it turns green (completed).
5. Scroll down to the **Artifacts** section at the bottom.
6. Click on **`ana-muslim-offline-apk`** to download the ZIP file containing your installable **`app-debug.apk`**!
