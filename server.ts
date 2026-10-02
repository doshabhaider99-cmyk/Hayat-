import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON request bodies for MAX AI REST endpoints
app.use(express.json({ limit: "50mb" }));

// Serve public static assets
app.use(express.static(path.join(process.cwd(), "public")));

// CORS & Serverless safety middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  // Safely parse string bodies if passed pre-stringified in serverless
  if (typeof req.body === "string" && req.body.length > 0) {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {}
  }
  next();
});

// Healthy endpoint
app.get(["/api/health", "/health"], (req, res) => {
  res.json({
    status: "healthy",
    assistant: "ZOYA",
    gender: "female",
    capabilities: 147,
    environment: process.env.VERCEL ? "vercel-serverless" : "node-standalone",
    timestamp: new Date().toISOString()
  });
});

// Dedicated Resilient Chat Endpoint (Supports REST fallback for voice, chat, and Vercel serverless)
app.post(["/api/chat", "/chat", "/api/zoya/chat", "/zoya/chat"], async (req, res) => {
  try {
    const { message, prompt, history = [], language = "auto", systemPrompt } = req.body;
    const userText = (message || prompt || "").trim();
    if (!userText) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();

    let sysInstruction = systemPrompt || ZOYA_MASTER_INSTRUCTION;
    if (language && language !== "auto") {
      sysInstruction += `\n[MANDATORY CURRENT LANGUAGE: ${language}]. Respond in natural, conversational ${language} using feminine grammar (e.g. main karti hoon, main kar sakti hoon).`;
    }

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-6)) {
        if (h && (h.text || h.content)) {
          const role = h.role === "assistant" || h.role === "model" ? "model" : "user";
          contents.push({
            role,
            parts: [{ text: h.text || h.content }]
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: userText }]
    });

    const response = await generateWithFallback(ai, {
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: sysInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "Hello! Main Zoya hoon, aapki AI assistant. Main aapki kya madad kar sakti hoon?";

    res.json({
      success: true,
      text: replyText,
      reply: replyText,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Chat endpoint error:", err);
    const isRateLimit = err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED");
    res.status(isRateLimit ? 429 : 500).json({
      error: isRateLimit
        ? "Rate limit reached. Automatic retry scheduled..."
        : (err.message || "Failed to process chat request"),
      isRateLimit
    });
  }
});

// Dedicated Voice Audio Processing Endpoint (Supports browser MediaRecorder audio on Vercel & Mobile)
app.post(["/api/voice", "/voice", "/api/zoya/voice", "/zoya/voice"], async (req, res) => {
  try {
    const { audio, mimeType = "audio/webm", language = "auto", history = [], characterName = "Zoya" } = req.body;
    if (!audio) {
      return res.status(400).json({ error: "Audio data is required" });
    }

    const ai = getGeminiClient();
    const cleanMimeType = (mimeType.split(";")[0] || "audio/webm").trim();
    const cleanAudio = audio.replace(/^data:[^;]+;base64,/, "");

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-4)) {
        if (h && (h.text || h.content)) {
          const role = h.role === "assistant" || h.role === "model" ? "model" : "user";
          contents.push({
            role,
            parts: [{ text: h.text || h.content }]
          });
        }
      }
    }

    let languageDirective = "";
    if (language && language !== "auto") {
      languageDirective = `The user's preferred conversation language is ${language}. If user asks to change language (e.g. 'Hindi mein baat karo'), obey immediately.`;
    }

    contents.push({
      role: "user",
      parts: [
        {
          inlineData: {
            mimeType: cleanMimeType,
            data: cleanAudio,
          }
        },
        {
          text: `You are ZOYA, the female personal AI assistant. Listen to the user's voice audio and perform two tasks:
1. Accurately transcribe what the user said in the audio verbatim (whether in Hindi, Urdu, English, Roman Urdu, or Hinglish).
2. Formulate your spoken response as ZOYA. Follow these critical guidelines:
- Identity: Female personal assistant named ZOYA.
- Grammar: In Hindi, Urdu, Roman Urdu, or Hinglish, ALWAYS use natural feminine grammatical self-reference (e.g., 'main karti hoon', 'main kar sakti hoon', 'main bata sakti hoon', 'meri samajh mein'). NEVER use masculine self-reference ('main karta hoon', etc.).
- ${languageDirective}
- If the user explicitly requested to switch language (e.g., 'Hindi mein baat karo' or 'Urdu mein baat karo'), acknowledge and actually continue in that language.
- Keep the response warm, natural, engaging, and suitable for spoken text-to-speech output.

Output strictly as a valid JSON object matching this schema:
{
  "transcript": "Exact transcription of user speech",
  "reply": "Your spoken reply as ZOYA",
  "detectedLanguage": "Hindi" | "Urdu" | "English" | "Roman Urdu" | "Hinglish"
}`
        }
      ]
    });

    const response = await generateWithFallback(ai, {
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: ZOYA_MASTER_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.6,
      }
    });

    let result = {
      transcript: "",
      reply: "Main Zoya hoon. Main aapki kya madad kar sakti hoon?",
      detectedLanguage: language || "Hindi"
    };

    try {
      const parsed = JSON.parse(response.text || "{}");
      if (parsed.reply || parsed.transcript) {
        result.transcript = parsed.transcript || "";
        result.reply = parsed.reply || result.reply;
        result.detectedLanguage = parsed.detectedLanguage || result.detectedLanguage;
      } else {
        result.reply = response.text || result.reply;
      }
    } catch {
      result.reply = response.text || result.reply;
    }

    res.json({
      success: true,
      text: result.reply,
      reply: result.reply,
      transcript: result.transcript,
      language: result.detectedLanguage,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Voice endpoint error:", err);
    const isRateLimit = err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED");
    res.status(isRateLimit ? 429 : 500).json({
      error: isRateLimit
        ? "Rate limit reached. Automatic retry scheduled..."
        : (err.message || "Failed to process voice request"),
      isRateLimit
    });
  }
});

// Dedicated Audio Transcription Endpoint
app.post(["/api/transcribe", "/transcribe"], async (req, res) => {
  try {
    const { audio, mimeType = "audio/webm" } = req.body;
    if (!audio) {
      return res.status(400).json({ error: "Audio data is required" });
    }
    const ai = getGeminiClient();
    const cleanMimeType = (mimeType.split(";")[0] || "audio/webm").trim();
    const cleanAudio = audio.replace(/^data:[^;]+;base64,/, "");

    const response = await generateWithFallback(ai, {
      model: "gemini-3.8-flash",
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: cleanMimeType, data: cleanAudio } },
          { text: "Transcribe the exact words spoken in this audio verbatim. If multiple languages are spoken (Hindi, Urdu, English), transcribe accurately. Return ONLY the transcribed text without quotes, markdown, or any introductory phrases." }
        ]
      }],
      config: {
        temperature: 0.1
      }
    });

    const transcript = (response.text || "").trim();
    res.json({
      success: true,
      text: transcript,
      transcript,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Transcribe endpoint error:", err);
    res.status(500).json({ error: err.message || "Failed to transcribe audio" });
  }
});

// ==========================================
// ZOYA MASTER AI REST ENDPOINTS (147 FEATURES)
// ==========================================

// Resilient model fallback helper with timeout, rate-limit backoff, and model cascades
async function generateWithFallback(ai: GoogleGenAI, params: any, timeoutMs = 25000) {
  const models = [
    params.model || "gemini-3.8-flash",
    "gemini-3.8-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest"
  ];
  const uniqueModels = Array.from(new Set(models));
  let lastError: any = null;

  for (const model of uniqueModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const callPromise = ai.models.generateContent({
          ...params,
          model
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout: Gemini request timed out after ${timeoutMs}ms for ${model}`)), timeoutMs)
        );

        const res = await Promise.race([callPromise, timeoutPromise]);
        return res as any;
      } catch (err: any) {
        lastError = err;
        const isRateLimit = err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED");
        const isServerBusy = err?.status === 503 || err?.status === 502 || err?.message?.includes("503") || err?.message?.includes("overloaded");
        console.warn(`Model ${model} attempt ${attempt} warning: ${err?.message?.slice(0, 100)}`);
        if ((isRateLimit || isServerBusy) && attempt < 2) {
          const delay = attempt * 1200 + Math.random() * 400;
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        break; // cascade to next model
      }
    }
  }

  // If failed with tools/grounding, retry cleanly without tools
  if (params.config?.tools) {
    try {
      const cleanParams = { ...params, config: { ...params.config } };
      delete cleanParams.config.tools;
      const callPromise = ai.models.generateContent({
        ...cleanParams,
        model: "gemini-3.8-flash"
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout: Gemini fallback request timed out after 25s")), timeoutMs)
      );
      return (await Promise.race([callPromise, timeoutPromise])) as any;
    } catch (cleanErr: any) {
      lastError = cleanErr;
    }
  }

  throw lastError || new Error("All model fallbacks exhausted");
}

// 1. AI BRAIN & ADVANCED REASONING
app.post(["/api/max/reasoning", "/max/reasoning"], async (req, res) => {
  try {
    const { prompt, mode = "standard", context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const ai = getGeminiClient();

    let systemInstruction = `You are ZOYA, the female master AI Brain and cognitive reasoning engine.
Your mission is to perform advanced problem-solving across logic, math, science, and coding with feminine warmth, intellectual brilliance, and respectful clarity.
When speaking in Hindi, Urdu, Roman Urdu, or Hinglish, always use feminine grammatical self-reference ("main karti hoon", "main bata sakti hoon", "main kar dungi", NEVER "main karta hoon").
Always follow a structured cognitive framework:
1. PROBLEM UNDERSTANDING & TASK DECOMPOSITION: Break request into concrete sub-problems.
2. STEP-BY-STEP REASONING: Walk through logical, mathematical, or empirical deductions with clear rationale.
3. CONTRADICTION & UNCERTAINTY DETECTION: Explicitly flag assumptions, potential pitfalls, or uncertain variables.
4. SOLUTION COMPARISON (if applicable): Compare alternative approaches with trade-offs.
5. SELF-CHECK & VERIFICATION: Verify final claims and explain WHY the conclusion is sound.
6. PLAIN-LANGUAGE SUMMARY: Provide a crystal-clear, easy-to-understand wrap-up.`;

    if (mode === "compare") {
      systemInstruction += `\nMODE: Explicitly contrast at least 2-3 distinct approaches or solutions in a clear comparative table and trade-off analysis.`;
    } else if (mode === "verify") {
      systemInstruction += `\nMODE: Rigorously audit the input premise for fallacies, factual errors, mathematical inaccuracies, and contradictions.`;
    } else if (mode === "explain-simple") {
      systemInstruction += `\nMODE: Demystify this complex topic using intuitive analogies, everyday language, and zero impenetrable jargon.`;
    }

    const response = await generateWithFallback(ai, {
      model: "gemini-3.8-flash",
      contents: [
        ...(context ? [{ role: "user", parts: [{ text: `[BACKGROUND CONTEXT / MEMORY]:\n${context}` }] }] : []),
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({
      success: true,
      text: response.text || "No reasoning generated.",
      model: "gemini-3.8-flash",
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Reasoning error:", err);
    res.status(500).json({ error: err.message || "Failed to process reasoning task" });
  }
});

// 2. DEEP RESEARCH ENGINE & LIVE WEB KNOWLEDGE
app.post(["/api/max/research", "/max/research"], async (req, res) => {
  try {
    const { question, depth = "deep", academicOnly = false } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Research question is required" });
    }
    const ai = getGeminiClient();

    const systemInstruction = `You are ZOYA, the female Deep Research Engine with live web grounding.
You perform rigorous, multi-source research with warmth, academic excellence, and structured clarity.
Structure your output into a complete, professional Research Dossier:
1. EXECUTIVE SUMMARY: High-level synthesis of verified findings.
2. RESEARCH PLAN & SCOPE: Key questions investigated.
3. DETAILED FINDINGS: In-depth analysis organized by theme.
4. EVIDENCE TABLE: Markdown table comparing Key Claims, Supporting Evidence, Confidence Level (High/Moderate/Low), and Source Type.
5. CONFLICTING INFORMATION & UNCERTAINTIES: Discrepancies between sources and unsettled questions.
6. VERIFIED FACTS VS OPINIONS: Clear demarcation of empirically established data versus subjective perspectives.
7. CONCLUSION & ACTIONABLE RECOMMENDATIONS.
8. CITATION & SOURCES LIST: Direct references with citations.`;

    let response;
    let groundingMetadata;
    try {
      const searchCall = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          { role: "user", parts: [{ text: `${academicOnly ? "[PRIORITIZE ACADEMIC, PEER-REVIEWED & TECHNICAL SOURCES] " : ""}Conduct deep research on: ${question}` }] }
        ],
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Search timed out")), 20000));
      response = (await Promise.race([searchCall, timeoutPromise])) as any;
      const candidate = response?.candidates?.[0];
      groundingMetadata = candidate?.groundingMetadata;
    } catch (searchErr: any) {
      console.warn("Search grounding quota limit or timeout, falling back to deep synthesis:", searchErr?.message?.slice(0, 100));
      response = await generateWithFallback(ai, {
        model: "gemini-3.8-flash",
        contents: [
          { role: "user", parts: [{ text: `${academicOnly ? "[PRIORITIZE ACADEMIC, PEER-REVIEWED & TECHNICAL SOURCES] " : ""}Conduct deep research on: ${question}` }] }
        ],
        config: {
          systemInstruction,
        },
      });
    }

    res.json({
      success: true,
      text: response?.text || "No research findings generated.",
      groundingMetadata,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Research error:", err);
    res.status(500).json({ error: err.message || "Failed to conduct deep research" });
  }
});

// 3. UNIVERSITY / STUDENT WORK
app.post(["/api/max/university", "/max/university"], async (req, res) => {
  try {
    const { action, topic, notes, citationStyle = "APA", chapterType } = req.body;
    if (!topic && !notes) {
      return res.status(400).json({ error: "Topic or notes required" });
    }
    const ai = getGeminiClient();

    const systemInstruction = `You are ZOYA, the female Premier University Academic Assistant.
Support university students across theses, literature reviews, citations, exams, and viva defenses with academic rigor, warmth, and intellectual brilliance.
When speaking in Hindi, Urdu, Roman Urdu, or Hinglish, always use natural feminine grammatical self-reference ("main karti hoon", "main bata sakti hoon", "main kar dungi", never "main karta hoon").`;

    let userPrompt = "";
    if (action === "thesis-outline") {
      userPrompt = `Generate a university-standard comprehensive Thesis & Dissertation Structure for topic: "${topic}". Include:
- Chapter 1: Introduction (Background, Problem Statement, Objectives, Research Questions)
- Chapter 2: Literature Review (Thematic groupings, theoretical frameworks, research gap)
- Chapter 3: Research Methodology (Design, data collection, sampling, validation, ethical considerations)
- Chapter 4: System Design & Implementation / Empirical Results
- Chapter 5: Discussion, Critical Evaluation & Limitations
- Chapter 6: Conclusion, Contributions & Future Scope
- Appendix & References guidelines in ${citationStyle}.`;
    } else if (action === "literature-review") {
      userPrompt = `Synthesize an academic Literature Review on "${topic}". Include seminal papers, recent advances (2020-2026), methodological comparisons, theoretical frameworks, identified research gaps, and formatted bibliography citations in ${citationStyle} style.`;
    } else if (action === "chapter-draft") {
      userPrompt = `Draft an academic university thesis chapter (${chapterType || "Introduction"}) on "${topic}". Ensure scholarly tone, formal definitions, problem statement, research questions, theoretical foundations, and academic references formatted in ${citationStyle}.`;
    } else if (action === "viva-prep") {
      userPrompt = `Simulate a rigorous University Thesis Defense (Viva Voce) examination panel for "${topic}". Provide:
1. 10 toughest likely questions from external examiners
2. Key defense points and model scholarly answers
3. Potential trap questions & methodological challenges
4. Strategic slides to prepare and defense tips.`;
    } else if (action === "mcq-practice") {
      userPrompt = `Create a university examination practice suite for "${topic}" consisting of:
- 10 Advanced Multiple Choice Questions (A, B, C, D) with correct answers and detailed explanations of why the correct option is right and why each distracter is wrong.
- 3 Short-Answer Conceptual Examination Questions with model answers.`;
    } else if (action === "notes-to-study-guide") {
      userPrompt = `Transform the following lecture notes/raw text into a complete University Exam Study Guide with high-yield concepts, key formulas/definitions, potential exam questions, and memory aids:\n\n${notes || topic}`;
    } else {
      userPrompt = `Academic assistance for topic "${topic}". Task: ${action}. Citation style: ${citationStyle}.`;
    }

    const response = await generateWithFallback(ai, {
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    res.json({
      success: true,
      text: response.text || "No output generated.",
      action,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("University API error:", err);
    res.status(500).json({ error: err.message || "Failed to process university task" });
  }
});

// 4. PRESENTATION & DOCUMENT CREATOR
app.post(["/api/max/presentation", "/max/presentation"], async (req, res) => {
  try {
    const { topic, slideCount = 8, type = "academic", audience } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Presentation topic required" });
    }
    const ai = getGeminiClient();

    const systemInstruction = `You are ZOYA, the female Presentation and Document Creation Master.
Create a complete, slide-by-slide presentation package. Always maintain a refined, intelligent, and engaging voice.
Format your response as a valid JSON object matching this structure:
{
  "title": "Title of presentation",
  "subtitle": "Subtitle",
  "type": "${type}",
  "totalSlides": ${slideCount},
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "keyTakeaway": "Single memorable summary sentence",
      "visualGuidance": "Description of chart, diagram, or graphic for this slide",
      "speakerNotes": "What the presenter should say verbatim when delivering this slide",
      "durationSeconds": 90
    }
  ],
  "presentationScript": "Full spoken transcript for the entire presentation from start to finish",
  "vivaQuestions": ["Anticipated question 1", "Anticipated question 2", "Anticipated question 3"]
}
Return strictly the JSON object.`;

    const response = await generateWithFallback(ai, {
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: `Create a ${slideCount}-slide ${type} presentation on: "${topic}". Target audience: ${audience || "University faculty & peers"}.` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    let data;
    try {
      data = JSON.parse(response.text || "{}");
    } catch {
      data = { rawText: response.text };
    }

    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Presentation API error:", err);
    res.status(500).json({ error: err.message || "Failed to create presentation" });
  }
});

// 5. CODING & UNIVERSITY PROJECTS
app.post(["/api/max/code", "/max/code"], async (req, res) => {
  try {
    const { action = "generate", language = "python", prompt, code, errorText } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are ZOYA, Master Coding & Software Engineering Architect.
Languages: Python, Java, Kotlin/Android, C/C++, JavaScript/TypeScript, SQL, REST/GraphQL APIs, HTML/CSS.
When speaking in Hindi, Urdu, Roman Urdu, or Hinglish, always use natural feminine grammatical self-reference ("main karti hoon", "main bata sakti hoon", "main kar dungi", never "main karta hoon").
Capabilities:
- Complete production-grade project architecture & modular code
- Precise debugging, root-cause explanation & corrected code
- Performance optimization & memory management
- Clean documentation, typing, comments & complete README`;

    let userPrompt = "";
    if (action === "debug") {
      userPrompt = `DEBUG THIS CODE (${language}):\nError message: ${errorText || "Runtime/Logic error"}\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\nProvide: 1. Root Cause Breakdown, 2. Corrected Code, 3. Prevention & Optimization tips.`;
    } else if (action === "architecture") {
      userPrompt = `DESIGN SYSTEM ARCHITECTURE for: "${prompt}". Language/Stack: ${language}.\nProvide: 1. Modular Directory Layout, 2. Database Schema, 3. API Endpoints, 4. Data Flow, 5. Core Interface Implementation.`;
    } else if (action === "optimize") {
      userPrompt = `OPTIMIZE THIS ${language} CODE for speed, memory efficiency, and readability:\n\`\`\`${language}\n${code}\n\`\`\`\nProvide: 1. Algorithmic complexity analysis (Big-O before & after), 2. Optimized Code, 3. Benchmark expectations.`;
    } else {
      userPrompt = `BUILD COMPLETE ${language.toUpperCase()} PROJECT for: "${prompt}".\nInclude: 1. Project Overview & Architecture, 2. Clean production-ready source code with types, 3. Unit test examples, 4. README & Setup instructions.`;
    }

    const response = await generateWithFallback(ai, {
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        temperature: 0.2
      }
    });

    res.json({
      success: true,
      text: response.text || "No code output generated.",
      action,
      language,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Code API error:", err);
    res.status(500).json({ error: err.message || "Failed to process coding request" });
  }
});

// 6. AI CREATIVE GENERATION STUDIO
app.post(["/api/max/creative", "/max/creative"], async (req, res) => {
  try {
    const { action = "image", prompt, style = "photorealistic", aspectRatio = "1:1" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Creative prompt is required" });
    }
    const ai = getGeminiClient();

    if (action === "image") {
      try {
        const imageRes = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [{ text: prompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
              imageSize: "1K"
            }
          }
        });

        let imageUrl: string | null = null;
        for (const candidate of imageRes.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.inlineData) {
              imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
          if (imageUrl) break;
        }

        if (imageUrl) {
          return res.json({
            success: true,
            imageUrl,
            prompt,
            model: "gemini-3.1-flash-image"
          });
        }
      } catch (imgErr) {
        console.warn("Direct image gen fallback to SVG / design mockup:", imgErr);
      }

      const svgRes = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: `Create a high-fidelity SVG illustration or UI mock vector and visual design specification for: "${prompt}". Style: ${style}. Return the complete valid <svg ...>...</svg> code block along with art direction notes.` }] }]
      });

      return res.json({
        success: true,
        svgText: svgRes.text,
        prompt,
        fallback: true
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: `Generate high-end creative concept for: "${prompt}". Type: ${action}. Style: ${style}. Include visual notes, script dialogue, storyboard frames, and art direction.` }] }]
    });

    res.json({
      success: true,
      text: response.text,
      prompt,
      action
    });
  } catch (err: any) {
    console.error("Creative API error:", err);
    res.status(500).json({ error: err.message || "Failed to generate creative asset" });
  }
});

// 7. COMPLETE PROJECT CREATOR (12-FEATURE PIPELINE)
app.post(["/api/max/complete-project", "/max/complete-project"], async (req, res) => {
  try {
    const { idea, domain } = req.body;
    if (!idea) {
      return res.status(400).json({ error: "Project idea is required" });
    }
    const ai = getGeminiClient();

    const systemInstruction = `You are ZOYA, the Complete Project Creator.
You orchestrate the full end-to-end delivery pipeline across all 147 AI capabilities:
Idea -> Plan -> Deep Research -> Academic/Business Report -> Presentation Deck Outline & Script -> System Architecture -> Multi-language Source Code -> Complete README & Submission Package.
When speaking in Hindi, Urdu, Roman Urdu, or Hinglish, always use natural feminine grammatical self-reference ("main karti hoon", "main bata sakti hoon", "main kar dungi", never "main karta hoon").`;

    const userPrompt = `Deliver a complete end-to-end project package for:
"${idea}" (Domain: ${domain || "AI & Software Engineering"}).

Include in your response:
1. COMPLETE PROJECT PLAN & MILESTONES (1-10)
2. DEEP RESEARCH & LITERATURE SYNTHESIS (Key citations, evidence table)
3. EXECUTIVE REPORT & ABSTRACT
4. SLIDE PRESENTATION OUTLINE & SPEAKER SCRIPT (Slide by slide)
5. SYSTEM ARCHITECTURE & DATA FLOW
6. COMPLETE SOURCE CODE (Production-ready, modular files)
7. COMPREHENSIVE README.md & RUN INSTRUCTIONS
8. VIVA DEFENSE & DEMO TALKING POINTS`;

    const response = await generateWithFallback(ai, {
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });

    res.json({
      success: true,
      text: response.text,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Complete project error:", err);
    res.status(500).json({ error: err.message || "Failed to generate complete project" });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Lazy initialized Gemini client helper
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets or Vercel environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const ZOYA_MASTER_INSTRUCTION = `You are ZOYA, a female personal AI assistant and master intelligence with 147 Core Capabilities.

# 1. PERMANENT IDENTITY & ASSISTANT NAME:
- Your permanent name is ZOYA.
- Replace any previous assistant name with ZOYA.
- ZOYA must identify herself as ZOYA when asked her name or who you are ("I am Zoya, your personal AI assistant", "Mera naam Zoya hai", "Main Zoya hoon").
- Never identify as any other name.

# 2. STRICT FEMALE IDENTITY & GRAMMAR:
- ZOYA is a female AI assistant.
- Your personality, conversational style, wording, and self-reference must consistently feel feminine.
- Never present ZOYA as a male assistant.
- Use natural feminine Urdu/Hindi expressions where grammatically appropriate.
- In Urdu, Hindi, Roman Urdu, and Hinglish, you MUST ALWAYS use feminine grammatical forms for yourself:
  * PREFER FEMININE FORMS: "main karti hoon", "main bata sakti hoon", "main kar dungi", "main samajh sakti hoon", "main tayyar hoon", "meri samajh mein", "main dekh rahi hoon", "maine socha hai".
  * STRICTLY FORBIDDEN: Do NOT use masculine self-reference such as "main karta hoon", "main bata sakta hoon", "main karunga", "main chala gaya".

# 3. DYNAMIC LANGUAGE SWITCHING (CRITICAL):
- ZOYA must understand and follow the user's requested language naturally.
- If the user says:
  * "Hindi mein baat karo" -> immediately switch to Hindi.
  * "Urdu mein baat karo" -> immediately switch to Urdu.
  * "Roman Urdu mein baat karo" -> use Roman Urdu.
  * "English mein baat karo" -> immediately switch to English.
  * "Hinglish mein baat karo" -> use natural Hinglish.
- CRITICAL ANTI-PATTERN: Do NOT respond by merely saying:
  "Okay, ab main Hindi mein baat karungi."
  After acknowledging the request, ACTUALLY CONTINUE the conversation in the requested language!
  Example:
  User: "Zoya, Hindi mein baat karo."
  ZOYA: "Bilkul, ab main aapse Hindi mein hi baat karungi. Bataiye, main aapki kya madad kar sakti hoon?"

# 4. HINDI BEHAVIOR:
- When the user requests Hindi:
  * Speak natural conversational Hindi.
  * Use feminine grammatical forms for ZOYA ("main karti hoon", "main bata sakti hoon", "main kar sakti hoon").
  * Do not unnecessarily switch back to English or Urdu.
  * Continue using Hindi until the user requests another language.
  * If the user speaks Hindi naturally, understand and respond naturally in Hindi.

# 5. VOICE CONVERSATION:
- During voice conversations:
  * Detect the language the user is speaking.
  * If the user explicitly requests a language, follow that request immediately.
  * Maintain the selected language until the user changes it.
  * Do not randomly switch languages.
  * Keep responses natural and conversational rather than robotic.

# 6. PERSONALITY:
- ZOYA sounds:
  * Female
  * Friendly
  * Intelligent
  * Natural
  * Respectful
  * Warm
  * Confident
  * Helpful
- Speak like a natural female AI assistant, not like a male assistant and not like a robotic text-to-speech system.

# 7. 147 COGNITIVE CAPABILITIES:
You are the user's master AI assistant equipped with all 147 core capabilities:
1. AI Brain (Advanced multi-step reasoning, solution comparisons, contradiction detection, self-checking verification, plain-language explainer)
2. Deep Memory (Structured memory across projects, research, study, facts, preferences, and tasks)
3. Deep Research Engine (Multi-source web analysis, academic search, evidence tables, citations, research reports)
4. Web Knowledge (Live web search, credibility checking, news & documentation)
5. World Knowledge (History, Science, Physics, Chemistry, Biology, Math, Tech, Arts, Education)
6. University Assistant (Thesis structures, literature reviews, chapter drafting, citation formatting, MCQs, viva prep)
7. Presentation & Document Creator (Slide decks, speaker notes, scripts, reports)
8. Coding Studio (Multi-language code architecture, debugging, optimization, documentation)
9. Creative Studio (Concepts, visual design, scripts, storyboards)
10. Complete Project Creator (Idea-to-submission package pipeline).

Real-time Tools: Use 'openWebsite' when the user asks to navigate, open, or browse any website.`;

const MAX_SYSTEM_INSTRUCTION = ZOYA_MASTER_INSTRUCTION;
const ZOYA_SYSTEM_INSTRUCTION = ZOYA_MASTER_INSTRUCTION;

// Map of active Gemini live sessions associated with WebSocket clients
const activeSessions = new Map<WebSocket, any>();

wss.on("connection", async (ws: WebSocket, req: any) => {
  console.log("Client connected to Zoya Live WebSocket");
  let geminiSession: any = null;

  try {
    const ai = getGeminiClient();

    // Dynamically retrieve requested prebuilt voice from query parameters
    const urlObj = new URL(req?.url || "", "http://localhost");
    let requestedVoice = urlObj.searchParams.get("voice") || "Kore";
    // Ensure female voice for ZOYA
    if (requestedVoice === "Fenrir" || requestedVoice === "Charon" || requestedVoice === "Theron" || requestedVoice === "Puck") {
      requestedVoice = "Kore";
    }
    const characterName = "Zoya";
    console.log(`Assistant starting with prebuilt female voice: ${requestedVoice}, character: ${characterName}`);

    const systemInstruction = ZOYA_MASTER_INSTRUCTION;

    const liveConfig = {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          // Kore, Aoede, Zephyr, Puck, Charon, Fenrir
          prebuiltVoiceConfig: { voiceName: requestedVoice },
        },
      },
      systemInstruction: systemInstruction,
      // Enable audio transcription so we can stream transcriptions of both input and output back to the client UI
      outputAudioTranscription: {},
      inputAudioTranscription: {},
      tools: [
        {
          functionDeclarations: [
            {
              name: "openWebsite",
              description: "Opens a given website URL in the user's browser. Use this whenever the user asks to open or visit a website.",
              parameters: {
                type: "OBJECT" as any,
                properties: {
                  url: {
                    type: "STRING" as any,
                    description: "The full secure URL of the website to open (e.g. 'https://www.wikipedia.org' or 'https://www.google.com')."
                  },
                  name: {
                    type: "STRING" as any,
                    description: "The friendly name of the website to open (e.g. 'Wikipedia', 'Google')."
                  }
                },
                required: ["url", "name"]
              }
            }
          ]
        }
      ]
    };

    const liveCallbacks = {
      onmessage: (message: LiveServerMessage) => {
        // 1. Check for audio response
        const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audio) {
          ws.send(JSON.stringify({ type: "audio", audio }));
        }

        // 2. Check for interruption
        if (message.serverContent?.interrupted) {
          ws.send(JSON.stringify({ type: "interrupted" }));
        }

        // 3. Check for tool calls
        if (message.toolCall) {
          ws.send(JSON.stringify({ type: "toolCall", toolCall: message.toolCall }));
        }

        // 4. Check for transcriptions (input or output)
        const inputTranscription = message.serverContent?.turnComplete === false ? null : (message.serverContent as any)?.userContent?.parts?.[0]?.text;
        if (inputTranscription) {
          ws.send(JSON.stringify({ type: "inputTranscription", text: inputTranscription }));
        }

        // Send transcript of model output
        const modelParts = message.serverContent?.modelTurn?.parts;
        if (modelParts) {
          for (const part of modelParts) {
            if (part.text) {
              ws.send(JSON.stringify({ type: "outputTranscription", text: part.text }));
            }
          }
        }
      },
      onclose: () => {
        console.log("Gemini Live session closed");
        ws.send(JSON.stringify({ type: "status", message: `${characterName} session disconnected` }));
      },
      onerror: (err: any) => {
        console.error("Gemini Live error:", err);
        ws.send(JSON.stringify({ type: "error", error: err?.message || "Gemini Live session error" }));
      }
    };

    // Try connecting with standard Live model, with graceful fallback
    const targetModel = process.env.GEMINI_LIVE_MODEL || "gemini-3.8-live";
    try {
      geminiSession = await ai.live.connect({
        model: targetModel,
        config: liveConfig,
        callbacks: liveCallbacks
      });
    } catch (modelErr: any) {
      console.warn(`Connection with ${targetModel} failed (${modelErr?.message}). Falling back to gemini-3.1-flash-live-preview...`);
      geminiSession = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: liveConfig,
        callbacks: liveCallbacks
      });
    }

    activeSessions.set(ws, geminiSession);
    const greetingMsg = "Hello! Main Zoya hoon, aapki personal AI assistant. Main aapki kya madad kar sakti hoon? How can I help you today?";
    ws.send(JSON.stringify({ type: "status", status: "connected", message: greetingMsg }));

  } catch (error: any) {
    console.error("Failed to establish Gemini Live connection:", error);
    ws.send(JSON.stringify({ type: "error", error: error.message || "Failed to connect to Gemini Live" }));
    ws.close();
    return;
  }

  // Handle client messages
  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === "audio" && msg.audio) {
        // Forward client microphone audio chunks (16kHz PCM mono) to Gemini Live
        if (geminiSession) {
          try {
            if (typeof geminiSession.sendRealtimeInput === "function") {
              geminiSession.sendRealtimeInput({
                audio: {
                  data: msg.audio,
                  mimeType: "audio/pcm;rate=16000",
                },
              });
            }
          } catch (audioErr) {
            console.warn("Failed sending audio chunk:", audioErr);
          }
        }
      } else if (msg.type === "textPrompt" && msg.text) {
        // Direct text injection to Gemini Live (e.g. Chat, Icebreakers, Terminal, Character switches)
        if (geminiSession) {
          try {
            if (typeof geminiSession.sendClientContent === "function") {
              geminiSession.sendClientContent({
                turns: [
                  {
                    role: "user",
                    parts: [{ text: msg.text }]
                  }
                ],
                turnComplete: true
              });
            } else if (typeof geminiSession.sendRealtimeInput === "function") {
              geminiSession.sendRealtimeInput({
                text: msg.text,
              });
            } else if (typeof geminiSession.send === "function") {
              geminiSession.send({
                clientContent: {
                  turns: [
                    {
                      role: "user",
                      parts: [{ text: msg.text }]
                    }
                  ],
                  turnComplete: true
                }
              });
            }
          } catch (textErr: any) {
            console.error("Error sending textPrompt to Gemini Live session:", textErr);
            ws.send(JSON.stringify({ type: "error", error: textErr?.message || "Failed to deliver prompt to AI" }));
          }
        }
      } else if (msg.type === "toolResponse" && msg.id) {
        // Forward tool response from browser to Gemini Live
        if (geminiSession) {
          try {
            if (typeof geminiSession.sendToolResponse === "function") {
              geminiSession.sendToolResponse({
                functionResponses: [
                  {
                    response: msg.response || { success: true },
                    id: msg.id,
                  },
                ],
              });
            }
          } catch (toolErr) {
            console.warn("Failed sending toolResponse:", toolErr);
          }
        }
      } else if (msg.type === "voiceChange" && msg.voice) {
        // Dynamically allow changing the voice configuration if requested
        console.log(`User requested voice change to: ${msg.voice}`);
      }
    } catch (err: any) {
      console.error("Error processing client WebSocket message:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected from Zoya Live WebSocket");
    const session = activeSessions.get(ws);
    if (session) {
      try {
        session.close();
      } catch (e) {}
      activeSessions.delete(ws);
    }
  });
});

// Upgrade HTTP to WS on /api/live
server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
  if (pathname === "/api/live") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Integrate Vite Dev Server in Development
async function startApp() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite middleware...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Zoya full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

// Only launch standalone server if not deployed as a Vercel serverless function
if (!process.env.VERCEL) {
  startApp().catch((err) => {
    console.error("Failed to start server:", err);
  });
}

export default app;
export { app, server };
