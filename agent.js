(() => {
  const MAX_INPUT_LENGTH = 900;
  const MAX_FEEDBACK_LENGTH = 500;
  const MAILBOX = "pilot@solvyr.com";
  const AGENT_VERSION = "pilot-fit-smart-v0.1";
  const DEFAULT_SUMMARY = "Share the input type, approximate volume, use case, sensitivity, and whether a safe representative sample exists.";
  const INITIAL_MESSAGE = [
    "Hi, I can help you sanity-check whether a document or text workload is a sensible Fast Corpus pilot.",
    "Keep it high level: input type, rough volume, use case, sensitivity, and desired output. Please do not paste source content, credentials, personal data, or confidential excerpts."
  ];

  const state = {
    inputTypes: new Set(),
    useCases: new Set(),
    flags: new Set(),
    volumes: new Set(),
    recurrence: "",
    sensitivity: "",
    sample: "",
    verdict: "unknown",
    lastSummary: DEFAULT_SUMMARY,
    turns: 0,
    closed: false,
    pending: false
  };

  const unsafePatterns = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
    /\b(api[_ -]?key|access token|secret|password|bearer token|client secret)\b/i,
    /\b(iban|swift|credit card|passport|social security|bsn|ssn)\b/i,
    /\b(patient record|medical record|diagnosis|health record)\b/i
  ];

  const nodes = {
    chatLog: document.getElementById("chat-log"),
    form: document.getElementById("agent-form"),
    input: document.getElementById("agent-input"),
    badge: document.getElementById("fit-badge"),
    summary: document.getElementById("fit-summary"),
    facts: document.getElementById("agent-facts"),
    email: document.getElementById("agent-email"),
    reset: document.getElementById("agent-reset"),
    experienceForm: document.getElementById("experience-form"),
    send: document.querySelector("#agent-form button[type='submit']"),
    year: document.getElementById("y")
  };

  function normalize(text) {
    return text.trim().replace(/\s+/g, " ");
  }

  function unsafeReason(text) {
    if (text.length > MAX_INPUT_LENGTH) {
      return "That is more detail than this public assistant should handle. Please summarize the workload shape instead.";
    }

    if (unsafePatterns.some((pattern) => pattern.test(text))) {
      return "That looks like it may contain sensitive data or credentials. Please do not paste it here.";
    }

    return "";
  }

  function appendMessage(role, lines) {
    const message = document.createElement("article");
    message.className = `chatMessage ${role}`;

    const speaker = document.createElement("strong");
    speaker.className = "chatSpeaker";
    speaker.textContent = role === "user" ? "You" : "Solvyr assistant";
    message.append(speaker);

    const bodyLines = Array.isArray(lines) ? lines : [lines];
    bodyLines.forEach((line) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      message.append(paragraph);
    });

    nodes.chatLog.append(message);
    nodes.chatLog.scrollTop = nodes.chatLog.scrollHeight;
  }

  function addFinding(collection, value) {
    if (value) collection.add(value);
  }

  function clearSet(collection) {
    collection.clear();
  }

  function resetState() {
    clearSet(state.inputTypes);
    clearSet(state.useCases);
    clearSet(state.flags);
    clearSet(state.volumes);
    state.recurrence = "";
    state.sensitivity = "";
    state.sample = "";
    state.verdict = "unknown";
    state.lastSummary = DEFAULT_SUMMARY;
    state.turns = 0;
    state.closed = false;
    state.pending = false;
  }

  function extractVolumes(text) {
    const volumes = new Set();
    const patterns = [
      /(\d[\d,.]*)\s*(k|m)?\s*(pages?|pdfs?|documents?|docs?|files?)/gi,
      /(\d[\d,.]*)\s*(k|m)?(?:\s+[a-z-]+){1,4}\s+(pages?|pdfs?|documents?|docs?|files?)/gi
    ];

    patterns.forEach((pattern) => {
      let match = pattern.exec(text);

      while (match) {
        volumes.add(`${match[1]}${match[2] || ""} ${match[3]}`);
        match = pattern.exec(text);
      }
    });

    return [...volumes];
  }

  function analyze(text) {
    const lower = text.toLowerCase();
    const findings = [];
    const hasShareableSignal = /\b(public|non-sensitive|non sensitive|not sensitive|low sensitivity|redacted|safe sample)\b/.test(lower);
    const hasSensitiveSignal = /\b(regulated|confidential|personal data|pii|medical|legal|financial|customer data|employee data)\b/.test(lower)
      || (/\bsensitive\b/.test(lower) && !hasShareableSignal);
    const negatesRealtime = /\b(not|no|without)\s+(a\s+)?(real-time|realtime|live chat|chatbot|model serving|inference api|low latency)\b/.test(lower);

    if (/\b(clean|digital|born-digital|searchable|machine-readable)\b/.test(lower) && /\bpdfs?\b/.test(lower)) {
      addFinding(state.inputTypes, "clean digital PDFs");
      findings.push("clean digital PDFs");
    }

    if (/\b(text files?|txt|markdown|html|xml|jsonl|text exports?|exports?)\b/.test(lower)) {
      addFinding(state.inputTypes, "text files or exports");
      findings.push("text files or exports");
    }

    if (/\b(scan|scanned|ocr|image-only|image only|handwritten)\b/.test(lower)) {
      addFinding(state.flags, "OCR-heavy or scanned input");
      findings.push("OCR-heavy input");
    }

    if (/\b(rag|retrieval|search|indexing|re-index|reindex)\b/.test(lower)) {
      addFinding(state.useCases, "RAG, search, or re-indexing");
      findings.push("RAG/search use case");
    }

    if (/\b(eval|evaluation|fine-tuning|finetuning|agent memory|memory corpus)\b/.test(lower)) {
      addFinding(state.useCases, "evals, fine-tuning prep, or agent memory");
      findings.push("AI dataset use case");
    }

    if (/\b(jsonl|chunks?|embeddings?|stable ids?|source ids?|run report)\b/.test(lower)) {
      addFinding(state.useCases, "AI-ready JSONL/chunks/embeddings output");
      findings.push("Fast Corpus output target");
    }

    if (/\b(erp|invoice|purchase order|recognized|recognised|recognize|recognise|classify|classified|classification|relevant information|ingest|ingested|integration|integrated|workflow|fields?|metadata)\b/.test(lower)) {
      addFinding(state.useCases, "document recognition or ERP ingestion");
      addFinding(state.flags, "structured workflow or ERP integration");
      findings.push("ERP/document-workflow intent");
    }

    if (/\b(recurring|refresh|monthly|weekly|daily|backfill|repeat|repeated)\b/.test(lower)) {
      state.recurrence = "possible recurring refresh";
      findings.push("recurring or refresh path");
    }

    if (hasShareableSignal) {
      state.sensitivity = "low or shareable with care";
      state.sample = "safe sample may be available";
      findings.push("safe sample signal");
    }

    if (hasSensitiveSignal) {
      state.sensitivity = "sensitive or regulated";
      addFinding(state.flags, "sensitive data needs prior agreement");
      findings.push("sensitive data boundary");
    }

    if (/\b(no sample|cannot share|can't share|cannot send|no safe sample)\b/.test(lower)) {
      state.sample = "no safe sample yet";
      addFinding(state.flags, "safe sample not available yet");
      findings.push("sample constraint");
    }

    if (!negatesRealtime && /\b(real-time|realtime|live chat|chatbot|model serving|inference api|low latency)\b/.test(lower)) {
      addFinding(state.flags, "real-time chat or model serving");
      findings.push("real-time/model serving");
    }

    if (/\b(gpu rental|rent gpus?|raw gpu|compute marketplace|marketplace of machines)\b/.test(lower)) {
      addFinding(state.flags, "raw GPU rental request");
      findings.push("raw GPU rental");
    }

    if (/\b(custom extraction|structured extraction|field extraction|invoice extraction|extract tables|layout parsing|relevant information|fields?|metadata)\b/.test(lower)) {
      addFinding(state.flags, "custom extraction or layout parsing");
      findings.push("custom extraction");
    }

    extractVolumes(text).forEach((volume) => state.volumes.add(volume));
    return findings;
  }

  function turnIntent(text) {
    const lower = text.toLowerCase();
    const help = /\b(what options|options do i have|what can i do|what should i do|help|choices|next steps?|what now|how does this work)\b/.test(lower);
    const corpus = /\b(rag|retrieval|search|eval|evaluation|fine-tuning|finetuning|agent memory|jsonl|chunks?|embeddings?|stable ids?|source ids?|run report|re-index|reindex|corpus)\b/.test(lower);
    const erp = /\b(erp|invoice|purchase order|recognized|recognised|recognize|recognise|classify|classified|classification|relevant information|ingest|ingested|integration|integrated|workflow|fields?|metadata)\b/.test(lower);
    const ocr = /\b(scan|scanned|ocr|image-only|image only|handwritten)\b/.test(lower);
    const custom = /\b(custom extraction|structured extraction|field extraction|invoice extraction|extract tables|layout parsing|relevant information|fields?|metadata)\b/.test(lower);

    return { help, corpus, erp, ocr, custom };
  }

  function shouldClose(verdict) {
    const terminalFlags = [
      "real-time chat or model serving",
      "raw GPU rental request",
      "OCR-heavy or scanned input",
      "sensitive data needs prior agreement",
      "safe sample not available yet",
      "custom extraction or layout parsing",
      "structured workflow or ERP integration"
    ];

    return verdict === "notFit" || terminalFlags.some((flag) => state.flags.has(flag));
  }

  function classify() {
    const hardNo = ["real-time chat or model serving", "raw GPU rental request"].some((flag) => state.flags.has(flag));
    const needsScoping = [
      "OCR-heavy or scanned input",
      "sensitive data needs prior agreement",
      "safe sample not available yet",
      "custom extraction or layout parsing"
    ].some((flag) => state.flags.has(flag));
    const likelyInput = state.inputTypes.size > 0;
    const likelyUse = state.useCases.size > 0;

    if (hardNo) return "notFit";
    if (needsScoping) return "scoped";
    if (likelyInput && likelyUse) return "likely";
    return "unknown";
  }

  function summarizePickedUp(findings) {
    const unique = [...new Set(findings)].slice(0, 5);
    if (!unique.length) return "I do not have enough concrete fit signals yet.";
    return `What I am hearing: ${unique.join(", ")}.`;
  }

  function topicResponse(text) {
    const lower = text.toLowerCase();

    if (/\b(price|pricing|cost|eur|euro)\b/.test(lower)) {
      return [
        "For the standard path, Fast Corpus starts at EUR 0.95 per 1000 pages, excluding VAT and taxes unless agreed otherwise.",
        "That price is for clean digital PDF/text batch processing. OCR-heavy scans, custom enrichment, sensitive workflows, unusual formats, and recurring refreshes need separate scoping."
      ];
    }

    if (/\b(output|jsonl|chunks?|embeddings?|stable ids?|run report)\b/.test(lower)) {
      return [
        "The useful output is concrete: extracted text, chunks, embeddings, stable source IDs, item-level notes where applicable, and a run report.",
        "The goal is an inspectable corpus artifact your AI team can actually reason about, not a vague processed-documents claim."
      ];
    }

    if (/\b(security|privacy|sensitive|regulated|personal data|pii)\b/.test(lower)) {
      return [
        "This is the right thing to be cautious about. Please do not send sensitive source data through public forms or email.",
        "Sensitive or regulated workloads need prior agreement and may be out of scope for the current phase. A safer pilot starts with lifecycle, retention, deletion, scoped access, and a representative non-sensitive or redacted sample."
      ];
    }

    if (/\b(process|pilot|sample|next step|handoff)\b/.test(lower)) {
      return [
        "A good pilot path is small and legible: describe the corpus, check fit, agree on a safe representative sample, run or scope a capped test, then decide whether this becomes one-time output or recurring refresh.",
        "The best handoff is a concise summary of input type, volume, use case, sensitivity, output target, and recurrence."
      ];
    }

    return [];
  }

  function nextQuestion() {
    if (state.flags.has("structured workflow or ERP integration") && !state.useCases.has("AI-ready JSONL/chunks/embeddings output")) {
      return "Which outcome matters more: an AI-ready corpus for search/RAG, or specific fields and events flowing into the ERP?";
    }

    if (!state.inputTypes.size) return "What kind of input are we talking about: clean digital PDFs, text exports, mixed files, or scanned/OCR-heavy documents?";
    if (!state.useCases.size) return "What should the corpus support: RAG/search, evals, fine-tuning prep, agent memory, or re-indexing?";
    if (!state.volumes.size) return "Roughly how many pages or documents are involved? A range is enough.";
    if (!state.sensitivity) return "How sensitive is the data: public, low-sensitivity, moderate, or sensitive/regulated?";
    if (!state.sample) return "Could you share a representative non-sensitive or redacted sample for a capped pilot?";
    return "The last useful piece is success criteria: how would your team judge whether the JSONL/chunks/embeddings are usable?";
  }

  function responseFor(verdict, findings, text) {
    const topical = topicResponse(text);
    const pickedUp = summarizePickedUp(findings);
    const intent = turnIntent(text);

    if (intent.help) {
      return [
        "You have three sensible paths here.",
        "If your files are clean PDFs or text and you want JSONL/chunks/embeddings for RAG, search, evals, or agent memory, continue the Fast Corpus check.",
        "If you need scanned-document OCR, field extraction, ERP ingestion, or workflow automation, use Prepare email or Open intake so it can be scoped without a long chat.",
        "If you are unsure, start with input type, rough volume, desired output, sensitivity, and whether a safe sample exists."
      ];
    }

    if (intent.erp && !intent.corpus) {
      return [
        "That sounds less like standard Fast Corpus and more like document recognition plus ERP ingestion.",
        "Solvyr's public front door right now is Fast Corpus: clean PDFs or text into AI-ready JSONL, chunks, embeddings, stable IDs, and a run report.",
        "This needs custom scoping, so I will stop the chat here. Use Prepare email or Open intake and include the ERP system, document types, fields needed, volume, sensitivity, and whether a safe sample exists."
      ];
    }

    if (verdict === "likely") {
      return [
        "This sounds close to the Fast Corpus sweet spot.",
        pickedUp,
        "The fit is strongest when the source is clean digital PDF or text, the target is AI-ready JSONL/chunks/embeddings, and async processing is acceptable.",
        nextQuestion()
      ];
    }

    if (verdict === "scoped") {
      return [
        "This needs scoping before it belongs in a pilot conversation.",
        pickedUp,
        "OCR-heavy scans, sensitive or regulated data, custom extraction, ERP/workflow integration, and no-safe-sample situations are not standard Fast Corpus self-serve inputs.",
        "I will stop the chat here. Use Prepare email or Open intake with only high-level workload details, and do not attach production or sensitive samples until a transfer path is agreed."
      ];
    }

    if (verdict === "notFit") {
      return [
        "This is outside the current Fast Corpus path.",
        pickedUp,
        "Solvyr is focused on async document/text corpus preparation, not real-time chat/model serving or raw GPU rental.",
        "I will stop the chat here. If there is a separate clean corpus-prep backlog, start a New check for that specific workload."
      ];
    }

    if (topical.length) {
      return topical.concat(nextQuestion());
    }

    return [
      "I need a little more shape before I can call fit with confidence.",
      pickedUp,
      "Fast Corpus usually fits clean digital PDFs or text archives for RAG, search, evals, fine-tuning prep, agent memory, or corpus refresh.",
      nextQuestion()
    ];
  }

  function updateSummary(verdict, summaryOverride = "") {
    const verdictLabels = {
      likely: ["Likely fit", "Likely Fast Corpus fit if the sample is representative and non-sensitive."],
      scoped: ["Needs scoping", "Potential fit, but one or more boundaries need agreement before data moves."],
      notFit: ["Not current fit", "This sounds outside the current Fast Corpus path."],
      unknown: ["Needs shape", DEFAULT_SUMMARY]
    };
    const [label, summary] = verdictLabels[verdict] || verdictLabels.unknown;

    state.verdict = verdict;
    state.lastSummary = summaryOverride || summary;
    nodes.badge.textContent = label;
    nodes.badge.dataset.state = verdict;
    nodes.summary.textContent = state.lastSummary;

    const facts = [
      ["Input", [...state.inputTypes].join(", ") || "Unknown"],
      ["Use case", [...state.useCases].join(", ") || "Unknown"],
      ["Volume", [...state.volumes].join(", ") || "Unknown"],
      ["Sensitivity", state.sensitivity || "Unknown"],
      ["Sample", state.sample || "Unknown"],
      ["Recurrence", state.recurrence || "Unknown"],
      ["Flags", [...state.flags].join(", ") || "None yet"]
    ];

    nodes.facts.replaceChildren();
    facts.forEach(([term, detail]) => {
      const wrapper = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = term;
      dd.textContent = detail;
      wrapper.append(dt, dd);
      nodes.facts.append(wrapper);
    });

    nodes.email.href = buildMailto();
    updateComposer();
  }

  function updateComposer() {
    const closed = Boolean(state.closed);
    const pending = Boolean(state.pending);
    nodes.input.disabled = closed || pending;
    nodes.send.disabled = closed || pending;
    nodes.input.placeholder = pending
      ? "Checking the fit boundary..."
      : closed
      ? "This check is closed. Use New check to start again."
      : "Describe the workload shape, not the source content.";
  }

  function setPending(isPending) {
    state.pending = isPending;
    updateComposer();
  }

  function buildMailto() {
    const body = [
      "Source:",
      "pilot-fit-agent",
      "",
      "Agent version:",
      AGENT_VERSION,
      "",
      "Assistant read:",
      state.lastSummary,
      "",
      "Input:",
      [...state.inputTypes].join(", ") || "-",
      "",
      "Use case:",
      [...state.useCases].join(", ") || "-",
      "",
      "Volume:",
      [...state.volumes].join(", ") || "-",
      "",
      "Sensitivity:",
      state.sensitivity || "-",
      "",
      "Safe sample:",
      state.sample || "-",
      "",
      "Recurrence:",
      state.recurrence || "-",
      "",
      "Flags to scope:",
      [...state.flags].join(", ") || "-",
      "",
      "Notes:",
      "Please do not attach sensitive or production samples until scope and transfer path are agreed."
    ].join("\n");

    return `mailto:${MAILBOX}?subject=${encodeURIComponent("Solvyr Fast Corpus pilot")}&body=${encodeURIComponent(body)}`;
  }

  function getFacts() {
    return {
      verdict: state.verdict,
      summary: state.lastSummary,
      input: [...state.inputTypes].join(", ") || "-",
      useCase: [...state.useCases].join(", ") || "-",
      volume: [...state.volumes].join(", ") || "-",
      sensitivity: state.sensitivity || "-",
      sample: state.sample || "-",
      recurrence: state.recurrence || "-",
      flags: [...state.flags].join(", ") || "-",
      turns: String(state.turns),
      closed: state.closed ? "yes" : "no"
    };
  }

  function buildApiPayload(message) {
    return {
      message,
      state: getFacts()
    };
  }

  async function requestSmartReply(message) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 7000);

    setPending(true);
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildApiPayload(message)),
        signal: controller.signal
      });

      if (!response.ok) return null;
      const result = await response.json();
      return result && Array.isArray(result.reply) ? result : null;
    } catch {
      return null;
    } finally {
      window.clearTimeout(timeoutId);
      setPending(false);
    }
  }

  function normalizeVerdict(verdict) {
    const map = {
      likely: "likely",
      needs_scoping: "scoped",
      scoped: "scoped",
      not_fit: "notFit",
      notFit: "notFit",
      unknown: "unknown"
    };

    return map[verdict] || "unknown";
  }

  function replaceSet(collection, values) {
    collection.clear();
    (Array.isArray(values) ? values : []).forEach((value) => {
      const normalizedValue = normalize(value);
      if (normalizedValue) collection.add(normalizedValue);
    });
  }

  function applySmartReply(result) {
    const fields = result.fields || {};
    const verdict = normalizeVerdict(result.verdict);

    replaceSet(state.inputTypes, fields.inputTypes);
    replaceSet(state.useCases, fields.useCases);
    replaceSet(state.flags, fields.flags);
    replaceSet(state.volumes, fields.volume ? [fields.volume] : []);
    state.sensitivity = normalize(fields.sensitivity);
    state.sample = normalize(fields.sample);
    state.recurrence = normalize(fields.recurrence);
    state.closed = Boolean(result.shouldClose);
    state.lastSummary = normalize(result.summary) || DEFAULT_SUMMARY;

    updateSummary(verdict, state.lastSummary);
    appendMessage("assistant", result.reply);
    updateComposer();
  }

  function buildExperienceMailto(form) {
    const data = new FormData(form);
    const note = normalize(String(data.get("note") || "")).slice(0, MAX_FEEDBACK_LENGTH);
    const tags = data.getAll("tag");
    const facts = getFacts();
    const body = [
      "Source:",
      "pilot-fit-agent-ux-feedback",
      "",
      "Agent version:",
      AGENT_VERSION,
      "",
      "Experience ratings, 1 low to 5 high:",
      `Clarity: ${data.get("clarity") || "-"}`,
      `Felt understood: ${data.get("understood") || "-"}`,
      `Tone: ${data.get("tone") || "-"}`,
      `Confidence: ${data.get("confidence") || "-"}`,
      "",
      "Experience tags:",
      tags.length ? tags.join(", ") : "-",
      "",
      "Optional note:",
      note || "-",
      "",
      "Assistant context, no raw transcript:",
      `Verdict: ${facts.verdict}`,
      `Summary: ${facts.summary}`,
      `Input: ${facts.input}`,
      `Use case: ${facts.useCase}`,
      `Volume: ${facts.volume}`,
      `Sensitivity: ${facts.sensitivity}`,
      `Sample: ${facts.sample}`,
      `Recurrence: ${facts.recurrence}`,
      `Flags: ${facts.flags}`,
      `Turns: ${facts.turns}`,
      `Closed: ${facts.closed}`,
      "",
      "Privacy note:",
      "This feedback email intentionally excludes the raw chat transcript."
    ].join("\n");

    return `mailto:${MAILBOX}?subject=${encodeURIComponent("Solvyr pilot-fit agent UX feedback")}&body=${encodeURIComponent(body)}`;
  }

  async function handleText(rawText) {
    if (state.closed) {
      return;
    }

    const text = normalize(rawText);
    if (!text) return;

    const reason = unsafeReason(text);
    if (reason) {
      appendMessage("user", "[Message withheld locally because it looked too detailed or sensitive.]");
      appendMessage("assistant", [
        reason,
        "Try again with only workload metadata: input type, rough page count, use case, sensitivity level, and desired output."
      ]);
      return;
    }

    appendMessage("user", text);
    state.turns += 1;
    const smartReply = await requestSmartReply(text);

    if (smartReply) {
      applySmartReply(smartReply);
      return;
    }

    const intent = turnIntent(text);

    if (intent.help) {
      appendMessage("assistant", responseFor(state.verdict, [], text));
      return;
    }

    const findings = analyze(text);
    const verdict = classify();
    updateSummary(verdict);
    appendMessage("assistant", responseFor(verdict, findings, text));

    if (shouldClose(verdict)) {
      state.closed = true;
      updateComposer();
    }
  }

  nodes.form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleText(nodes.input.value);
    nodes.input.value = "";
    nodes.input.focus();
  });

  document.querySelectorAll("[data-agent-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      handleText(button.dataset.agentPrompt || "");
      nodes.input.focus();
    });
  });

  nodes.reset.addEventListener("click", () => {
    resetState();
    nodes.chatLog.replaceChildren();
    updateSummary("unknown");
    updateComposer();
    appendMessage("assistant", INITIAL_MESSAGE);
    nodes.input.value = "";
    nodes.input.focus();
  });

  nodes.experienceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = normalize(String(new FormData(event.currentTarget).get("note") || ""));

    if (unsafeReason(note)) {
      window.alert("Please keep the feedback high-level. Do not include sensitive details, credentials, or source content.");
      return;
    }

    window.location.href = buildExperienceMailto(event.currentTarget);
  });

  if (nodes.year) {
    nodes.year.textContent = new Date().getFullYear();
  }

  resetState();
  updateSummary("unknown");
  appendMessage("assistant", INITIAL_MESSAGE);
})();
