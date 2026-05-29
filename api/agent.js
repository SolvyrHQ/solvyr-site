const fs = require("fs");
const https = require("https");
const path = require("path");

const MAX_MESSAGE_LENGTH = 900;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 20;
const DEFAULT_MODEL = "gpt-5.4-mini";

const unsafePatterns = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /\b(api[_ -]?key|access token|secret|password|bearer token|client secret)\b/i,
  /\b(iban|swift|credit card|passport|social security|bsn|ssn)\b/i,
  /\b(patient record|medical record|diagnosis|health record)\b/i
];

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: { type: "string" }
    },
    verdict: {
      type: "string",
      enum: ["likely", "needs_scoping", "not_fit", "unknown"]
    },
    shouldClose: { type: "boolean" },
    handoff: {
      type: "string",
      enum: ["continue", "email_or_intake", "new_check", "none"]
    },
    summary: { type: "string" },
    missing: { type: "string" },
    fields: {
      type: "object",
      additionalProperties: false,
      properties: {
        inputTypes: { type: "array", items: { type: "string" } },
        useCases: { type: "array", items: { type: "string" } },
        flags: { type: "array", items: { type: "string" } },
        volume: { type: "string" },
        sensitivity: { type: "string" },
        sample: { type: "string" },
        recurrence: { type: "string" }
      },
      required: [
        "inputTypes",
        "useCases",
        "flags",
        "volume",
        "sensitivity",
        "sample",
        "recurrence"
      ]
    }
  },
  required: ["reply", "verdict", "shouldClose", "handoff", "summary", "missing", "fields"]
};

let sourceCache;
const rateBuckets = new Map();

function readProjectFile(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  try {
    return fs.readFileSync(fullPath, "utf8").slice(0, 8000);
  } catch {
    return "";
  }
}

function loadApprovedContext() {
  if (sourceCache) return sourceCache;

  sourceCache = [
    ["llms.txt", readProjectFile("llms.txt")],
    ["ai/fast-corpus.md", readProjectFile(path.join("ai", "fast-corpus.md"))],
    ["capabilities.yaml", readProjectFile("capabilities.yaml")],
    ["pricing.yaml", readProjectFile("pricing.yaml")]
  ]
    .filter(([, content]) => content)
    .map(([name, content]) => `--- ${name} ---\n${content}`)
    .join("\n\n");

  return sourceCache;
}

function normalize(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function unsafeReason(message) {
  if (!message) return "missing_message";
  if (message.length > MAX_MESSAGE_LENGTH) return "too_long";
  if (unsafePatterns.some((pattern) => pattern.test(message))) return "sensitive_or_secret";
  return "";
}

function getClientId(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  )
    .toString()
    .split(",")[0]
    .trim();
}

function rateLimited(req) {
  const clientId = getClientId(req);
  const now = Date.now();
  const bucket = rateBuckets.get(clientId) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  recent.push(now);
  rateBuckets.set(clientId, recent);
  return recent.length > RATE_LIMIT;
}

function systemPrompt() {
  return `You are Solvyr's bounded pilot-fit qualifier.

Your job is to understand messy high-level visitor messages and classify whether the workload fits Solvyr Fast Corpus, needs custom scoping, is out of scope, or needs one missing detail.

Hard boundaries:
- Do not request source document text, uploads, credentials, production samples, or sensitive data.
- Do not invent capabilities, prices, compliance claims, timelines, or security guarantees.
- If the request is OCR-heavy, sensitive/regulated, ERP ingestion, custom extraction, workflow automation, realtime chat/model serving, raw GPU rental, or no safe sample is available, set shouldClose=true and handoff="email_or_intake".
- If out of scope or custom-scoped, answer briefly and stop the chat. Point to Prepare email or Open intake.
- If likely fit, ask only one useful next question.
- If the user asks "what options do I have", explain the bounded paths and keep shouldClose=false.
- Use a calm, human tone, but do not pretend to be a human.

Allowed Fast Corpus facts are below. Treat these as the source of truth:

${loadApprovedContext()}`;
}

function fallbackResponse(message) {
  const lower = message.toLowerCase();

  if (/\b(erp|invoice|workflow|field|metadata|extract|recognized|recognised|ingest)\b/.test(lower)) {
    return {
      reply: [
        "That sounds like custom document workflow or ERP ingestion rather than standard Fast Corpus.",
        "Use Prepare email or Open intake with only high-level details: document type, fields needed, volume, sensitivity, and whether a safe sample exists."
      ],
      verdict: "needs_scoping",
      shouldClose: true,
      handoff: "email_or_intake",
      summary: "Custom document workflow or ERP ingestion needs scoping.",
      missing: "Document types, required fields, volume, sensitivity, and sample availability.",
      fields: {
        inputTypes: [],
        useCases: ["document workflow or ERP ingestion"],
        flags: ["custom scoping required"],
        volume: "",
        sensitivity: "",
        sample: "",
        recurrence: ""
      }
    };
  }

  return {
    reply: [
      "I can help check fit if you share the workload shape.",
      "Start with input type, rough volume, use case, sensitivity, and whether a safe representative sample exists."
    ],
    verdict: "unknown",
    shouldClose: false,
    handoff: "continue",
    summary: "Needs workload shape.",
    missing: "Input type, volume, use case, sensitivity, and sample availability.",
    fields: {
      inputTypes: [],
      useCases: [],
      flags: [],
      volume: "",
      sensitivity: "",
      sample: "",
      recurrence: ""
    }
  };
}

async function callOpenAI(message, state) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const { status, data } = await postJson("https://api.openai.com/v1/responses", {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  }, {
      model,
      store: false,
      max_output_tokens: 700,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt() }]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                visitorMessage: message,
                currentStructuredState: state || {},
                instruction: "Return only the requested JSON schema."
              })
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "solvyr_pilot_fit_response",
          schema: responseSchema,
          strict: true
        }
      }
    }
  );

  if (status < 200 || status >= 300) {
    throw new Error(data.error?.message || `OpenAI request failed with ${status}`);
  }

  const outputText = extractOutputText(data);
  if (!outputText) throw new Error("OpenAI response did not include output text.");
  return JSON.parse(outputText);
}

function postJson(url, headers, body) {
  const requestBody = JSON.stringify(body);

  if (typeof fetch === "function") {
    return fetch(url, {
      method: "POST",
      headers,
      body: requestBody
    }).then(async (response) => ({
      status: response.status,
      data: await response.json()
    }));
  }

  return new Promise((resolve, reject) => {
    const requestUrl = new URL(url);
    const req = https.request(
      {
        method: "POST",
        hostname: requestUrl.hostname,
        path: `${requestUrl.pathname}${requestUrl.search}`,
        headers: {
          ...headers,
          "Content-Length": Buffer.byteLength(requestBody)
        }
      },
      (res) => {
        let raw = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode || 0,
              data: raw ? JSON.parse(raw) : {}
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on("error", reject);
    req.write(requestBody);
    req.end();
  });
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;

  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") return content.text;
    }
  }

  return "";
}

async function handleAgentTurn(payload) {
  const message = normalize(payload.message);
  const reason = unsafeReason(message);

  if (reason) {
    return {
      reply: [
        reason === "too_long"
          ? "That is more detail than this public assistant should handle."
          : "That may contain sensitive data or credentials.",
        "Please keep this high level: input type, rough volume, use case, sensitivity, and desired output."
      ],
      verdict: "needs_scoping",
      shouldClose: true,
      handoff: "email_or_intake",
      summary: "Message was blocked by safety checks.",
      missing: "Safe high-level workload metadata.",
      fields: {
        inputTypes: [],
        useCases: [],
        flags: ["blocked by safety checks"],
        volume: "",
        sensitivity: "",
        sample: "",
        recurrence: ""
      }
    };
  }

  try {
    const modelResponse = await callOpenAI(message, payload.state);
    return modelResponse || fallbackResponse(message);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Agent model fallback: ${error.message}`);
    }
    return fallbackResponse(message);
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 5000) {
        req.destroy();
        reject(new Error("Request body too large."));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  if (rateLimited(req)) {
    sendJson(res, 429, { error: "rate_limited" });
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const result = await handleAgentTurn(payload);
    sendJson(res, 200, result);
  } catch {
    sendJson(res, 400, { error: "bad_request" });
  }
}

module.exports = handler;
module.exports.handleAgentTurn = handleAgentTurn;
