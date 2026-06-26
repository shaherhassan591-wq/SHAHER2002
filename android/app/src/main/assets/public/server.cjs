var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  const ai = new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-startups-graceful",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  app.get("/api/proxy-audio", async (req, res) => {
    try {
      const audioUrl = req.query.url;
      if (!audioUrl) {
        return res.status(400).send("Parameter 'url' is required.");
      }
      const safeUrl = new URL(audioUrl).toString();
      const targetUrlObj = new URL(safeUrl);
      const origin = targetUrlObj.origin;
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
      res.setHeader("Cache-Control", "public, max-age=604800");
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error) {
      console.log(`[AudioProxy] Expected network fallback attempt: ${error.message}`);
      res.status(502).send(`CORS Audio Proxy Retry Alert: ${error.message}`);
    }
  });
  app.post("/api/gemini/explain", async (req, res) => {
    try {
      const { verse, surahName, verseNumber } = req.body;
      if (!verse) {
        return res.status(400).json({ error: "\u0627\u0644\u0622\u064A\u0629 \u0627\u0644\u0643\u0631\u064A\u0645\u0629 \u0645\u0637\u0644\u0648\u0628\u0629 \u0643\u0645\u0639\u0637\u0649." });
      }
      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({
          explanation: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643! \u0644\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062A\u0641\u0633\u064A\u0631 \u0627\u0644\u062D\u0642\u064A\u0642\u064A \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A\u060C \u064A\u0631\u062C\u0649 \u062A\u0632\u0648\u064A\u062F \u0645\u0641\u062A\u0627\u062D API \u0627\u0644\u062A\u0627\u0628\u0639 \u0644\u0643 (GEMINI_API_KEY) \u0645\u0646 \u062E\u0644\u0627\u0644 \u0644\u0648\u062D\u0629 \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D \u0648\u0627\u0644\u0631\u0645\u0648\u0632 \u0627\u0644\u0633\u0631\u064A\u0629 \u0628\u0627\u0644Settings\u060C \u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636 \u0647\u0648 \u062A\u0641\u0633\u064A\u0631 \u0627\u0641\u062A\u0631\u0627\u0636\u064A \u0645\u064A\u0633\u0631 \u0644\u0644\u062A\u062F\u0628\u0631 \u0648\u0627\u0644\u0645\u0637\u0627\u0644\u0639\u0629."
        });
      }
      const promptText = `\u0623\u0646\u062A \u0639\u0627\u0644\u0645 \u0645\u0641\u0633\u0631 \u0648\u0645\u0639\u0644\u0645 \u062A\u0631\u0628\u0648\u064A \u0645\u0633\u0644\u0645 \u062C\u0644\u064A\u0644. \u0628\u0623\u0633\u0644\u0648\u0628 \u0625\u0633\u0644\u0627\u0645\u064A \u0631\u0627\u0642 \u0648\u0628\u0644\u064A\u063A \u0648\u0633\u0647\u0644 \u0627\u0644\u0641\u0647\u0645 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0633\u0644\u0645\u064A\u0646\u060C \u0642\u0645 \u0628\u062A\u0642\u062F\u064A\u0645 \u062A\u0641\u0633\u064A\u0631 \u0645\u064A\u0633\u0631 \u0648\u062A\u062F\u0628\u0631 \u0631\u0648\u062D\u064A \u0639\u0645\u064A\u0642 \u0645\u0639 \u062A\u0648\u0636\u064A\u062D \u0627\u0644\u0641\u0648\u0627\u0626\u062F \u0648\u0627\u0644\u062E\u0648\u0627\u0637\u0631 \u0627\u0644\u062A\u0637\u0628\u064A\u0642\u064A\u0629 \u0644\u0644\u0622\u064A\u0629 \u0627\u0644\u0643\u0631\u064A\u0645\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629:
\u0627\u0644\u0622\u064A\u0629: "${verse}"
\u0633\u0648\u0631\u0629: "${surahName}"\u060C \u0631\u0642\u0645 \u0627\u0644\u0622\u064A\u0629: ${verseNumber}.
\u064A\u0631\u062C\u0649 \u0635\u064A\u0627\u063A\u0629 \u0627\u0644\u062A\u0641\u0633\u064A\u0631 \u0648\u0627\u0644\u062A\u062F\u0628\u0631 \u0641\u064A 3-4 \u0646\u0642\u0627\u0637 \u0628\u0627\u0631\u0632\u0629 \u0648\u0627\u0636\u062D\u0629\u060C \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649 \u0627\u0644\u0623\u0646\u064A\u0642\u0629 \u0648\u0627\u0644\u0645\u062D\u0628\u0628\u0629 \u0644\u0644\u0642\u0644\u0628.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText
      });
      res.json({ explanation: response.text });
    } catch (e) {
      console.error("Gemini server error: ", e);
      res.status(500).json({ error: "\u0641\u0634\u0644 \u0627\u0633\u062A\u062E\u0644\u0627\u0635 \u0627\u0644\u062A\u0641\u0633\u064A\u0631 \u0645\u0646 \u062E\u0648\u0627\u062F\u0645 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A." });
    }
  });
  app.post("/api/feedback", async (req, res) => {
    try {
      const { name, email, type, message, submittedAt, userAgent } = req.body;
      if (!name || !message) {
        return res.status(400).json({ error: "Name and message are required." });
      }
      const feedbackDir = import_path.default.join(process.cwd(), "src", "data");
      const feedbackFilePath = import_path.default.join(feedbackDir, "feedback_submissions.json");
      let submissions = [];
      try {
        if (import_fs.default.existsSync(feedbackFilePath)) {
          const fileContent = import_fs.default.readFileSync(feedbackFilePath, "utf8");
          submissions = JSON.parse(fileContent);
        }
      } catch (readError) {
        console.warn("[Feedback API] Failed to read existing feedback, initializing new list:", readError);
      }
      const newSubmission = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
        name,
        email: email || "",
        type,
        message,
        submittedAt: submittedAt || (/* @__PURE__ */ new Date()).toISOString(),
        userAgent: userAgent || ""
      };
      submissions.push(newSubmission);
      import_fs.default.writeFileSync(feedbackFilePath, JSON.stringify(submissions, null, 2), "utf8");
      console.log(`[Feedback API] New submission received from ${name} (${type}): "${message.substring(0, 50)}..."`);
      res.status(200).json({ status: "success", data: newSubmission });
    } catch (error) {
      console.error("[Feedback API] Server error: ", error);
      res.status(500).json({ error: "Failed to store feedback submission." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Islam application server is running successfully on: http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
