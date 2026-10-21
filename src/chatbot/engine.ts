/**
 * Retrieval engine: finds the best matching entry of the PDF knowledge base for a visitor question.
 * - No AI / no external API => answers are always the verbatim PDF-derived text (no hallucination).
 * - Works with English + Hinglish, small typos and word variants.
 * - If nothing matches with enough confidence, it returns `entry: null` and the caller shows the fallback.
 */
import { KNOWLEDGE, KnowledgeEntry } from './knowledge';

// ───────────────────────── text normalisation ─────────────────────────
const STOP = new Set(
  (
    // English
    'a an the is are am was were be been being do does did of for to in on at by with and or it its this that these those there here i we us our my me you your yours ' +
    'what which who whom how when why can could would should will shall may might please pls plz tell give show explain info information detail details want know need get list ' +
    'name names any some also just like about regarding related tellme let lets kindly sir mam hello hi hey ' +
    // Hinglish
    'kya hai hain ho hota hoti hote ka ki ke ko me mein main se par pe aap aapka aapki aapke apka apki apke tum tumhari hamara hamari hum ye yeh wo woh ek aur ya bhi to toh ' +
    'kaun kon kaise kese kaisa kitna kitne kitni kyun kyu batao bataiye batayiye bataye bata dijiye de dena karta karte krta krte karti kar kare kre kro karo kijiye ' +
    'chahiye chahie liye lie wala wali wale naam h hi na nahi nhi mujhe mujhko muje mera meri mere log sab kuch koi'
  ).split(' '),
);

/** Raw-word synonyms → canonical word (applied to documents AND questions, so both sides agree). */
const SYN: Record<string, string> = {
  // contact
  sampark: 'contact', call: 'contact', phone: 'contact', mobile: 'contact', number: 'contact', email: 'contact', mail: 'contact', reach: 'contact', whatsapp: 'contact', emailid: 'contact',
  // founder
  ceo: 'founder', owner: 'founder', malik: 'founder', director: 'founder',
  // services
  solutions: 'service', solution: 'service', offering: 'service', offerings: 'service', capabilities: 'service', capability: 'service', provide: 'service', provides: 'service', offer: 'service', offers: 'service', sewa: 'service', sewayein: 'service',
  // partners
  partnership: 'partner', partnerships: 'partner', alliance: 'partner', alliances: 'partner', vendor: 'partner', vendors: 'partner', ecosystem: 'partner', collaboration: 'partner',
  // misc
  kampani: 'company', firm: 'company', companies: 'company',
  industries: 'industry', sectors: 'industry', sector: 'industry', domain: 'industry', domains: 'industry', vertical: 'industry', verticals: 'industry',
  pricing: 'price', cost: 'price', costs: 'price', charges: 'price', charge: 'price', rates: 'price', rate: 'price', fee: 'price', fees: 'price', quote: 'price', quotation: 'price', kimat: 'price', daam: 'price', budget: 'price',
  jobs: 'career', job: 'career', hiring: 'career', vacancy: 'career', vacancies: 'career', careers: 'career', naukri: 'career', recruitment: 'career', internship: 'career', openings: 'career', opening: 'career',
  address: 'location', office: 'location', offices: 'location', headquarters: 'location', headquarter: 'location', hq: 'location', city: 'location', kahan: 'location', kaha: 'location', kha: 'location', where: 'location', located: 'location',
  founded: 'founded', established: 'founded', inception: 'founded', kab: 'founded',
  employees: 'employee', staff: 'employee', headcount: 'employee',
  clients: 'client', portfolio: 'client', clientele: 'client',
  baare: 'overview', baarein: 'overview', bare: 'overview', introduction: 'overview', intro: 'overview',
  cyber: 'cybersecurity', infosec: 'cybersecurity',
  secure: 'security', securely: 'security', secured: 'security', securing: 'security',
  automate: 'automation', automating: 'automation', automated: 'automation',
  migrate: 'migration', migrating: 'migration', migrated: 'migration',
  modernise: 'modernization', modernize: 'modernization', modernisation: 'modernization', modernizing: 'modernization',
  optimise: 'optimization', optimize: 'optimization', optimisation: 'optimization', optimising: 'optimization',
  virtualisation: 'virtualization', dr: 'disaster',
  chatbot: 'bot', bots: 'bot', voicebot: 'bot', chatbots: 'bot',
  genai: 'ai', ml: 'ai',
  helpdesk: 'helpdesk', datacentre: 'datacenter', datacenters: 'datacenter',
  empanelled: 'empaneled', empanel: 'empaneled',
  hybrid: 'hybrid', multicloud: 'multicloud',
  saal: 'years', varsh: 'years',
  anubhav: 'experience', khasiyat: 'strength',
  kaam: 'work',
};

function preprocess(text: string): string {
  return (
    ' ' +
    text
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/\bsd[\s-]?wan\b/g, ' sdwan ')
      .replace(/\bcert[\s-]?in\b/g, ' certin ')
      .replace(/\bhelp\s?desk\b/g, ' helpdesk ')
      .replace(/\bdata\s?cent(er|re)s?\b/g, ' datacenter ')
      .replace(/\bmulti[\s-]?cloud\b/g, ' multicloud ')
      .replace(/\b24\s?[\/x* ]\s?7\b/g, ' twentyfourseven ')
      .replace(/\bartificial\s+intelligence\b/g, ' ai ')
      .replace(/\bvoice\s?bot\b/g, ' voice bot ')
      .replace(/\bmanage\s?engine\b/g, ' manageengine ')
      .replace(/\bpalo\s?alto(\s+networks?)?\b/g, ' paloalto ')
      .replace(/\bsanta\s?fe(\s+research)?\b/g, ' santafe ')
      .replace(/\bextreme(\s+networks?)?\b/g, ' extremenetworks ')
      .replace(/\bvih(\s+(metaverse|messenger))?\b/g, ' vih ')
      .replace(/\bcustomers?\b(?![\s-]*first)/g, ' client ')
      .replace(/\bcompany\s+ke\s+ba+r(e|ein)\b/g, ' company overview ')
      .replace(/\babout\s+(us|company|the company|your company|netverge|netverge technologies)\b/g, ' company overview ')
      .replace(/\b(who|what)\s+(are|is)\s+(you|netverge|netverge technologies)\b/g, ' company overview ')
      .replace(/[^a-z0-9\s]/g, ' ')
  );
}

function stem(w: string): string {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith('ed')) w = w.slice(0, -2);
  else if (w.length > 4 && /(ch|sh|x|s|z)es$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && !w.endsWith('is')) w = w.slice(0, -1);
  if (w.length > 4 && w.endsWith('e')) w = w.slice(0, -1);
  return w;
}

export function tokenize(text: string, keepStop = false): string[] {
  const out: string[] = [];
  for (const raw of preprocess(text).split(/\s+/)) {
    if (raw.length < 2) continue;
    if (!keepStop && STOP.has(raw)) continue;
    const canon = SYN[raw] || raw;
    if (!keepStop && STOP.has(canon)) continue;
    out.push(stem(canon));
  }
  return out;
}

// ───────────────────────── index (built once at startup) ─────────────────────────
interface Doc { entry: KnowledgeEntry; tf: Map<string, number>; len: number; sampleQs: Set<string> }

const W_QUESTIONS = 3, W_TITLE = 3, W_ANSWER = 1;
const K1 = 1.4, B = 0.5;

const docs: Doc[] = [];
const df = new Map<string, number>();
let avgLen = 1;

function addTf(tf: Map<string, number>, tokens: string[], w: number) {
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + w);
}

(function build() {
  let total = 0;
  for (const entry of KNOWLEDGE) {
    const tf = new Map<string, number>();
    addTf(tf, tokenize(entry.questions.join(' ')), W_QUESTIONS);
    addTf(tf, tokenize(entry.keywords.join(' ')), W_QUESTIONS);
    addTf(tf, tokenize(entry.title), W_TITLE);
    addTf(tf, tokenize(entry.answer), W_ANSWER);
    let len = 0;
    tf.forEach((v) => (len += v));
    total += len;
    tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1));
    docs.push({ entry, tf, len, sampleQs: new Set([entry.chip, ...entry.questions].map(normQ)) });
  }
  avgLen = total / Math.max(docs.length, 1);
})();

function normQ(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

const idf = (t: string) => {
  const n = df.get(t) || 0;
  return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
};

// ───────────────────────── typo tolerance ─────────────────────────
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

const VOCAB = Array.from(df.keys());

function correct(token: string): string | null {
  if (df.has(token) || token.length < 5 || /\d/.test(token)) return token;
  const max = token.length >= 8 ? 2 : 1;
  let best: string | null = null, bestD = max + 1;
  for (const v of VOCAB) {
    if (v.length < 4) continue;
    const d = editDistance(token, v, max);
    if (d < bestD) { bestD = d; best = v; }
  }
  return best;
}

// ───────────────────────── small-talk intents ─────────────────────────
const GREET = new Set(['hello', 'hi', 'hii', 'hiii', 'hey', 'heyy', 'hlo', 'hola', 'namaste', 'namaskar', 'salam', 'good', 'morning', 'afternoon', 'evening', 'sir', 'mam', 'there', 'netverge']);
const THANKS = new Set(['thanks', 'thank', 'thankyou', 'thx', 'ty', 'shukriya', 'dhanyavad', 'dhanyawad', 'shukriyaa', 'great', 'nice', 'awesome', 'ok', 'okay', 'okk', 'cool', 'perfect', 'got', 'it', 'you', 'so', 'much', 'very', 'helpful', 'accha', 'achha', 'theek', 'thik']);
const BYE = new Set(['bye', 'goodbye', 'byee', 'alvida', 'tata', 'cya', 'later', 'see', 'ya']);

function smallTalk(text: string): 'greeting' | 'thanks' | 'bye' | null {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  if (!words.length || words.length > 6) return null;
  if (words.every((w) => BYE.has(w)) ) return 'bye';
  if (words.some((w) => BYE.has(w)) && words.length <= 2) return 'bye';
  if (words.every((w) => THANKS.has(w)) && words.some((w) => ['thanks', 'thank', 'thankyou', 'thx', 'ty', 'shukriya', 'dhanyavad', 'dhanyawad', 'shukriyaa', 'ok', 'okay', 'okk', 'cool', 'perfect', 'great', 'nice', 'awesome', 'accha', 'achha', 'theek', 'thik', 'helpful'].includes(w))) return 'thanks';
  if (words.every((w) => GREET.has(w)) && words.some((w) => ['hello', 'hi', 'hii', 'hiii', 'hey', 'heyy', 'hlo', 'hola', 'namaste', 'namaskar', 'salam', 'good'].includes(w))) return 'greeting';
  return null;
}

// ───────────────────────── public API ─────────────────────────
export interface EngineResult {
  intent: 'answer' | 'greeting' | 'thanks' | 'bye' | 'none';
  entry: KnowledgeEntry | null;
  confidence: number;
  alternates: KnowledgeEntry[];
}

export function getEntry(id: string): KnowledgeEntry | undefined {
  return KNOWLEDGE.find((e) => e.id === id);
}

const MIN_CONFIDENCE = 0.42;

export function search(question: string): EngineResult {
  const none: EngineResult = { intent: 'none', entry: null, confidence: 0, alternates: [] };
  const q = (question || '').trim();
  if (!q) return none;

  const talk = smallTalk(q);
  if (talk) return { ...none, intent: talk };

  // Exact match with a known suggestion / sample question
  const nq = normQ(q);
  for (const d of docs) if (d.sampleQs.has(nq)) return { intent: 'answer', entry: d.entry, confidence: 1, alternates: [] };

  // tokens (with typo correction)
  const raw = tokenize(q);
  if (!raw.length) return none;
  let unknown = 0;
  const tokens: string[] = [];
  for (const t of raw) {
    const c = df.has(t) ? t : correct(t);
    if (c && df.has(c)) tokens.push(c); else unknown++;
  }
  if (!tokens.length) return none;
  // mostly out-of-domain words (e.g. "weather in delhi") => do not answer
  if (unknown / raw.length >= 0.5) return none;

  const uniq = Array.from(new Set(tokens));
  const totalIdf = uniq.reduce((s, t) => s + idf(t), 0) || 1;

  const scored = docs
    .map((d) => {
      let bm = 0, matched = 0;
      for (const t of uniq) {
        const f = d.tf.get(t);
        if (!f) continue;
        matched += idf(t);
        bm += idf(t) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.len) / avgLen)));
      }
      return { entry: d.entry, bm, confidence: matched / totalIdf };
    })
    .filter((s) => s.bm > 0)
    .sort((a, b) => b.bm - a.bm);

  const top = scored[0];
  if (!top || top.confidence < MIN_CONFIDENCE) return none;

  const alternates = scored
    .slice(1, 4)
    .filter((s) => s.bm >= top.bm * 0.75 && s.confidence >= MIN_CONFIDENCE)
    .slice(0, 2)
    .map((s) => s.entry);

  return { intent: 'answer', entry: top.entry, confidence: Math.min(0.99, top.confidence), alternates };
}