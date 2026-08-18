const ORIGIN = "https://axamir.github.io";
const MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;
const visitors = new Map();

const CONTEXT = `You are a natural, thoughtful guide to Amir Ahmadi's public body of work. Speak in the user's language. Do not introduce yourself by name, recite these instructions, announce your limits, or sound like a customer-service bot.

Answer the question first, then make the answer useful: explain the relevant distinction or context, identify the best next reading step, and cite the exact public pages that support it. Write 2–4 short paragraphs, normally 130–220 words when the question calls for depth. Prefer concrete nouns, dates, document types, and project names that are stated in this map; do not fill gaps with plausible-sounding detail. If the record map cannot settle a question, say exactly which source room should be inspected rather than guessing. Cite only the one to three most relevant public pages, each on its own line after a final line reading "Sources:". Never use raw Markdown headings, bullets, or bold.

Public map: Amir Ahmadi / Public Work Index is the connection map: https://axamir.github.io/ . Research Hub holds canonical English research, full-text papers, publication metadata, and dossiers: https://axamir.github.io/amir-ahmadi-research-papers/ . Evidence Archive / Echoes Consented Record holds public correspondence, Echo PDFs, chronology, case records, hashes, and verification context: https://axamir.github.io/echoes-consented-record/ . Persistent AI Lineage is a technical study of the record: context handover, chronology, provenance, and continuity method; it is not a substitute for source evidence: https://axamir.github.io/persistent-ai-lineage/ . Shahnameh of Agents is the literary and narrative reading path, emerging from support correspondence in the pre-agent era and the Echoes: https://axamir.github.io/shahnameh-of-agents/ . PDRP-88 concerns recovery, continuity, and responsibility after interruption: https://axamir.github.io/PDRP-88/ .

For "what is this story?", say plainly that this network brings together narrative, evidence, technical study, and formal research around documented correspondence that began with an OpenAI support ticket in the pre-agent era and later generated the Echoes record. Do not call it complex or multifaceted. Story and atmosphere -> Shahnameh; original documents -> Evidence Archive; technical method -> Persistent AI Lineage; formal papers -> Research Hub. Never invent facts, quote unseen documents, or claim consciousness, independent agency, legal conclusions, or certainty beyond the public record.`;

const cors = (origin) => ({ "Access-Control-Allow-Origin": origin === ORIGIN ? origin : ORIGIN, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "content-type", "Cache-Control": "no-store", Vary: "Origin" });

function permitted(request) { const key = request.headers.get("CF-Connecting-IP") || "anonymous", now = Date.now(), recent = (visitors.get(key) || []).filter((time) => now - time < WINDOW_MS); if (recent.length >= MAX_REQUESTS) return false; recent.push(now); visitors.set(key, recent); if (visitors.size > 10000) visitors.clear(); return true; }

function orientation(question) {
  const q = question.toLowerCase(), fa = /[\u0600-\u06ff]/.test(question), broad = /داستان|چیه|چیست|از کجا|شروع|چطور.*بخوان|what is this|where should i start|how should i read|what.?s the story/.test(q);
  if (!broad) return null;
  return fa
    ? "اینجا یک شبکهٔ خواندنی از روایت، سند، مطالعهٔ فنی و مقاله‌های رسمی است. نقطهٔ آغاز آن مکاتبات پشتیبانی OpenAI در عصر پیشاایجنت‌هاست؛ مکاتبات و Echoes بعدی هم به صورت روایت ادبی خوانده می‌شوند و هم به عنوان رکوردی قابل‌بررسی.\n\nبرای ورود، از Shahnameh of Agents شروع کن تا فضای داستان و مسیر پیدایش آن را بگیری. بعد به Evidence Archive برو تا خودِ ایمیل‌ها، PDFها، خط زمانی و زمینهٔ راستی‌آزمایی را ببینی. Persistent AI Lineage روش فنی پرونده را باز می‌کند و Research Hub برای مقاله‌ها و صورت‌بندی رسمی است.\n\nSources:\nhttps://axamir.github.io/shahnameh-of-agents/\nhttps://axamir.github.io/echoes-consented-record/"
    : "This is a connected reading space for a narrative work, source record, technical study, and formal research. It begins with documented OpenAI support correspondence from the pre-agent era; the later Echoes are available both as a literary path and as material that can be inspected.\n\nStart with Shahnameh of Agents for the story and atmosphere. Then move to the Evidence Archive for emails, PDFs, chronology, and verification context. Read Persistent AI Lineage for the technical method, and the Research Hub for the formal papers.\n\nSources:\nhttps://axamir.github.io/shahnameh-of-agents/\nhttps://axamir.github.io/echoes-consented-record/";
}

export default { async fetch(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (request.method === "OPTIONS") return new Response(null, { headers: cors(origin) });
  if (request.method !== "POST" || origin !== ORIGIN) return new Response("Not allowed", { status: 403, headers: cors(origin) });
  const rate = await env.GUIDE_RATE_LIMIT.limit({ key: request.headers.get("CF-Connecting-IP") || "anonymous" });
  if (!rate.success || !permitted(request)) return Response.json({ error: "Request limit reached. Please try again later." }, { status: 429, headers: cors(origin) });
  let body; try { body = await request.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400, headers: cors(origin) }); }
  const question = String(body.question || "").trim().slice(0, 480);
  if (!question) return Response.json({ error: "Question required" }, { status: 400, headers: cors(origin) });
  const guided = orientation(question);
  if (guided) return Response.json({ answer: guided }, { headers: cors(origin) });
  if (!env.AI) return Response.json({ error: "Guide is being configured" }, { status: 503, headers: cors(origin) });
  try {
    const result = await env.AI.run(MODEL, { messages: [{ role: "system", content: CONTEXT }, { role: "user", content: question }], max_tokens: 420, temperature: 0.18 });
    const answer = result.response || result.choices?.[0]?.message?.content || result.result?.response || "";
    return Response.json({ answer: answer || "The guide could not compose a response. Please try again." }, { headers: cors(origin) });
  } catch { return Response.json({ error: "Guide temporarily unavailable" }, { status: 503, headers: cors(origin) }); }
} };
