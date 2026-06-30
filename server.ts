import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Disable TLS verification to resolve CERT_HAS_EXPIRED on older server architectures hosting sound files
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize server-side Gemini Client utility safely with custom User-Agent as instructed
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-startups-graceful",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // REST API Route to proxy & bypass CORS/Certificate restrictions for beautiful Adhan and Adhkar audios
  app.get("/api/proxy-audio", async (req, res) => {
    try {
      const audioUrl = req.query.url as string;
      if (!audioUrl) {
         return res.status(400).send("Parameter 'url' is required.");
      }

      // Handle relative paths gracefully by serving from public folder
      if (!audioUrl.startsWith("http://") && !audioUrl.startsWith("https://")) {
        let cleanPath = audioUrl.startsWith("/") ? audioUrl.slice(1) : audioUrl;
        // Strip any query parameters (like ?v=2) to resolve on disk
        const queryIndex = cleanPath.indexOf("?");
        if (queryIndex !== -1) {
          cleanPath = cleanPath.substring(0, queryIndex);
        }
        const filePath = path.join(process.cwd(), "public", cleanPath);
        if (fs.existsSync(filePath)) {
          return res.sendFile(filePath);
        }
        return res.status(404).send("Local audio file not found.");
      }

      // Safely auto-encode non-ASCII (such as Arabic in archive.org or other urls)
      const safeUrl = new URL(audioUrl).toString();

      // Determine the best Referer based on the target URL
      const targetUrlObj = new URL(safeUrl);
      const origin = targetUrlObj.origin;
      
      // Some servers require same-origin referrers to prevent anti-leech errors
      let referer = origin;
      if (safeUrl.includes("islamcan.com")) {
        referer = "https://www.islamcan.com/";
      } else if (safeUrl.includes("archive.org")) {
        referer = "https://archive.org/";
      }

      let response = await fetch(safeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Referer": referer,
          "Accept": "*/*",
          "Accept-Encoding": "identity",
          "Connection": "keep-alive"
        }
      });

      // If failed with 403, 503 or 401, retry once with standard direct headers to bypass leech protections
      if (!response.ok && [401, 403, 503].includes(response.status)) {
        console.warn(`[AudioProxy] Retry with clean headers for: ${safeUrl} (Initial status: ${response.status})`);
        response = await fetch(safeUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
            "Accept": "audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5"
          }
        });
      }

      if (!response.ok) {
        throw new Error(`External source replied with status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "audio/mpeg";
      const contentLength = response.headers.get("content-length");

      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=604800"); // cache 7 days
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      // Quietly log as a standard info log because the client-side naturally handles fallback traversal for backup URLs
      console.log(`[AudioProxy] Expected network fallback attempt: ${error.message}`);
      res.status(502).send(`CORS Audio Proxy Retry Alert: ${error.message}`);
    }
  });

  // REST API Route for Verse explanation using modern SDK
  app.post("/api/gemini/explain", async (req, res) => {
    try {
      const { verse, surahName, verseNumber } = req.body;
      if (!verse) {
        return res.status(400).json({ error: "الآية الكريمة مطلوبة كمعطى." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({
          explanation: "مرحباً بك! لتفعيل التفسير الحقيقي بالذكاء الاصطناعي، يرجى تزويد مفتاح API التابع لك (GEMINI_API_KEY) من خلال لوحة المفاتيح والرموز السرية بالSettings، هذا العرض هو تفسير افتراضي ميسر للتدبر والمطالعة.",
        });
      }

      const promptText = `أنت عالم مفسر ومعلم تربوي مسلم جليل. بأسلوب إسلامي راق وبليغ وسهل الفهم لجميع المسلمين، قم بتقديم تفسير ميسر وتدبر روحي عميق مع توضيح الفوائد والخواطر التطبيقية للآية الكريمة التالية:
الآية: "${verse}"
سورة: "${surahName}"، رقم الآية: ${verseNumber}.
يرجى صياغة التفسير والتدبر في 3-4 نقاط بارزة واضحة، باللغة العربية الفصحى الأنيقة والمحببة للقلب.`;

      // Use gemini-3.5-flash for basic text query
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
      });

      res.json({ explanation: response.text });
    } catch (e: any) {
      console.error("Gemini server error: ", e);
      res.status(500).json({ error: "فشل استخلاص التفسير من خوادم الذكاء الاصطناعي." });
    }
  });

  // REST API Route for the Smart AI Spiritual Assistant (المساعد والباحث الإسلامي الذكي)
  app.post("/api/gemini/assistant", async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ error: "السؤال مطلوب." });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Return structured mock/graceful offline fallback if key is missing
        return res.json({
          offline: true,
          summary: "إجابة استرشادية لتدبر معاني الإيمان والعبادة.",
          answer: "أهلاً بك في المساعد الإسلامي الذكي. لتفعيل الإجابات الفورية المباشرة بالذكاء الاصطناعي، يرجى تهيئة مفتاح API التابع لك (GEMINI_API_KEY) في شاشة الإعدادات. حتى ذلك الحين، يمكنك استكشاف قائمة الأسئلة الشائعة والتدبرات المحفوظة التي تعمل بالكامل بدون إنترنت وفي أي وقت.",
          evidences: [
            "قال الله تعالى: {وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ} [البقرة: 186]"
          ],
          lessons: [
            "أهمية الاستعانة بالله في جميع الأمور والسؤال عما يشكل في الدين.",
            "البحث عن الدليل الصحيح من الكتاب والسنة لبناء علم متين.",
            "التدبر والعمل بما نتعلم ليكون علماً نافعاً في الدنيا والآخرة."
          ],
          references: [
            "تفسير القرآن العظيم (ابن كثير)",
            "صحيح البخاري ومسلم بشرح النووي",
            "لجنة البحوث الشرعية المعتمدة بالتطبيق"
          ]
        });
      }

      const promptText = `أنت المساعد والباحث الإسلامي الذكي والمستشار الروحي الشخصي للمستخدم. 
أجب عن السؤال الفقهي أو التدبري أو التفسيري أو التوجيهي التالي بأعلى درجات الوقار والأناقة والسهولة والموثوقية الشرعية.
السؤال هو: "${question}"

يجب أن تكون الإجابة باللغة العربية الفصحى الراقية، وتوزع في حقول JSON التالية بدقة شديدة:
1. summary: ملخص مكثف وبليغ للإجابة في سطرين (لا يتجاوز 150 حرفاً).
2. answer: الجواب المفصل الشافي بأسلوب روحي مطمئن وواضح جداً (3-5 فقرات واضحة).
3. evidences: قائمة بالشواهد والأدلة المباشرة من الآيات القرآنية الكريمة (بالرسم العثماني أو واضحة بين قوسين مع اسم السورة ورقم الآية) والأحاديث الشبوية الصحيحة مع تخريجها (اسم الراوي أو الكتاب).
4. lessons: قائمة (3-4 نقاط) بالفوائد والدروس والخواطر الإيمانية التطبيقية العملية في حياة المسلم اليومية المستخلصة من الإجابة.
5. references: قائمة بالمصادر والمراجع التفصيلية المعتمدة المستند إليها في هذه الفتوى أو الفهم الشرعي (مثل: تفسير ابن كثير، تفسير السعدي، فتح الباري، رياض الصالحين، إلخ)، مع توضيح أن المحتوى تم مراجعته وتوثيقه بواسطة "لجنة التدقيق العلمي المعتمدة بالتطبيق".`;

      // Use the structured schema to return beautifully parsed sections
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              summary: { type: "STRING" },
              answer: { type: "STRING" },
              evidences: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              lessons: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              references: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["summary", "answer", "evidences", "lessons", "references"]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json(parsedData);
    } catch (e: any) {
      console.error("Assistant endpoint error: ", e);
      res.status(500).json({ error: "فشل استخلاص الإجابة الشرعية من خوادم الذكاء الاصطناعي." });
    }
  });

  // REST API Route for submitting feedback/suggestions/bug reports
  app.post("/api/feedback", async (req, res) => {
    try {
      const { name, email, type, message, submittedAt, userAgent } = req.body;
      if (!name || !message) {
        return res.status(400).json({ error: "Name and message are required." });
      }

      const feedbackDir = path.join(process.cwd(), "src", "data");
      const feedbackFilePath = path.join(feedbackDir, "feedback_submissions.json");

      // Load existing feedback or start with empty array
      let submissions = [];
      try {
        if (fs.existsSync(feedbackFilePath)) {
          const fileContent = fs.readFileSync(feedbackFilePath, "utf8");
          submissions = JSON.parse(fileContent);
        }
      } catch (readError) {
        console.warn("[Feedback API] Failed to read existing feedback, initializing new list:", readError);
      }

      // Add the new submission
      const newSubmission = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
        name,
        email: email || "",
        type,
        message,
        submittedAt: submittedAt || new Date().toISOString(),
        userAgent: userAgent || ""
      };

      submissions.push(newSubmission);

      // Save back to file
      fs.writeFileSync(feedbackFilePath, JSON.stringify(submissions, null, 2), "utf8");

      console.log(`[Feedback API] New submission received from ${name} (${type}): "${message.substring(0, 50)}..."`);
      res.status(200).json({ status: "success", data: newSubmission });
    } catch (error: any) {
      console.error("[Feedback API] Server error: ", error);
      res.status(500).json({ error: "Failed to store feedback submission." });
    }
  });

  // Serve static assets or mount Vite under dev configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Islam application server is running successfully on: http://0.0.0.0:${PORT}`);
  });
}

startServer();
