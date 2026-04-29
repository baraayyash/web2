/**
 * Tiny Express server: POST /explain sends a topic to an LLM (Gemini or Groq) and returns text.
 */
require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const MOCK_AI =
  process.env.USE_MOCK_AI === "1" || /^true$/i.test(String(process.env.USE_MOCK_AI || ""));

/** @type {"gemini" | "groq"} */
const AI_PROVIDER = String(process.env.AI_PROVIDER || "gemini").toLowerCase() === "groq" ? "groq" : "gemini";

app.use(express.json());

function buildUserPrompt(topic) {
  return `Explain the following in 2–4 short sentences, plain language, no markdown: ${topic}`;
}

async function explainWithGemini(topic) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      "Missing GEMINI_API_KEY. Copy .env.example to .env or set AI_PROVIDER=groq with GROQ_API_KEY."
    );
    err.status = 500;
    throw err;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const prompt = `You are helping beginners. ${buildUserPrompt(topic)}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return { explanation: text, source: "gemini", model: GEMINI_MODEL };
}

async function explainWithGroq(topic) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error("Missing GROQ_API_KEY. Get a free key at https://console.groq.com/keys");
    err.status = 500;
    throw err;
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are helping beginners. Answer in 2–4 short sentences, plain language, no markdown.",
        },
        { role: "user", content: buildUserPrompt(topic) },
      ],
      temperature: 0.4,
      max_tokens: 512,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message || res.statusText || "Groq request failed";
    const err = new Error(`[Groq] ${message}`);
    err.status = res.status;
    throw err;
  }

  const explanation = data?.choices?.[0]?.message?.content?.trim();
  if (!explanation) {
    const err = new Error("[Groq] Empty reply from model");
    err.status = 502;
    throw err;
  }

  return { explanation, source: "groq", model: data.model || GROQ_MODEL };
}

app.get("/", (_req, res) => {
  const lines = [
    `Provider: ${MOCK_AI ? "mock" : AI_PROVIDER} (set AI_PROVIDER=gemini or groq; USE_MOCK_AI=1 skips LLM).`,
    'POST /explain with JSON body: { "topic": "what recursion is" }',
    "Example: curl -s -X POST http://localhost:3000/explain -H \"Content-Type: application/json\" -d '{\"topic\":\"a stack in programming\"}'",
  ];
  res.type("text/plain").send(lines.join("\n\n"));
});

app.post("/explain", async (req, res) => {
  const topic = typeof req.body?.topic === "string" ? req.body.topic.trim() : "";

  if (!topic) {
    return res.status(400).json({ error: 'Send JSON: { "topic": "something to explain" }' });
  }

  if (MOCK_AI) {
    return res.json({
      topic,
      source: "mock",
      explanation: [
        `This is a placeholder answer for “${topic}”.`,
        "Your Express route, JSON body, and response shape are real; only the LLM call is skipped.",
        "Set USE_MOCK_AI=0 and use AI_PROVIDER=groq + GROQ_API_KEY, or AI_PROVIDER=gemini + GEMINI_API_KEY.",
      ].join(" "),
    });
  }

  try {
    const out =
      AI_PROVIDER === "groq" ? await explainWithGroq(topic) : await explainWithGemini(topic);
    return res.json({ topic, explanation: out.explanation, source: out.source, model: out.model });
  } catch (err) {
    console.error(err);
    const message = err?.message || "LLM request failed";
    const msg = typeof message === "string" ? message : "";
    const fromStatus = typeof err?.status === "number" ? err.status : undefined;
    const is429 =
      fromStatus === 429 || msg.includes("429") || msg.includes("Too Many Requests");
    const is403 =
      fromStatus === 403 ||
      msg.includes("403") ||
      msg.includes("Forbidden") ||
      msg.includes("denied access");
    let hint;
    let status = fromStatus ?? 502;
    if (is429) status = 429;
    if (is403) status = 403;
    if (!is429 && !is403 && typeof fromStatus !== "number") status = 502;

    if (is429) {
      status = 429;
      hint =
        AI_PROVIDER === "groq"
          ? "Groq rate limit hit. Wait a minute or see https://console.groq.com/docs/rate-limits — try GROQ_MODEL=llama-3.1-8b-instant for higher daily caps than larger models."
          : "Free tier limits are per model and per minute/day. Wait ~1 minute, reduce calls, or set GEMINI_MODEL to e.g. gemini-2.5-flash-lite. See https://ai.google.dev/gemini-api/docs/rate-limits";
    } else if (is403) {
      status = 403;
      hint =
        'If the message says "project has been denied access", that applies to the whole Cloud project — changing GEMINI_MODEL will not fix it. Create a new API key in a new Google Cloud project, or switch to AI_PROVIDER=groq with a key from https://console.groq.com/keys — or set USE_MOCK_AI=1 to teach without an LLM.';
    }
    return res.status(status).json({ error: message, ...(hint && { hint }) });
  }
});

app.listen(PORT, () => {
  const mode = MOCK_AI
    ? "mock AI (no LLM)"
    : AI_PROVIDER === "groq"
      ? `Groq model: ${GROQ_MODEL}`
      : `Gemini model: ${GEMINI_MODEL}`;
  console.log(`Listening on http://localhost:${PORT} (${mode})`);
});
