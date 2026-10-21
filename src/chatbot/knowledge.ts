/**
 * Knowledge base for the website chatbot.
 *
 * SINGLE SOURCE OF TRUTH: "NetVerge Technologies (OPC) Pvt. Ltd. – Company Profile 2026" (PDF, 3 pages).
 * Every answer below is taken from that PDF. Nothing is invented, so the bot can never "hallucinate".
 *
 * To update the bot when the PDF changes, edit this file only (answers / questions / keywords).
 *
 * Fields
 *  - id        unique key (also used by the clickable suggestion chips)
 *  - chip      short question shown as a clickable suggestion
 *  - questions sample phrasings (English + Hinglish) – used by the matcher
 *  - keywords  extra words that should lead to this entry
 *  - answer    text shown to the visitor. Supports **bold** and "• " bullets
 *  - page      PDF page number the answer comes from (shown as "Source")
 *  - related   ids of follow-up suggestions
 *  - icon      icon key understood by the frontend widget
 */
export interface KnowledgeEntry {
  id: string;
  chip: string;
  title: string;
  icon: string;
  page: number;
  questions: string[];
  keywords: string[];
  answer: string;
  related: string[];
}

export const DOCUMENT_NAME = 'NetVerge Company Profile 2026';
export const COMPANY = 'NetVerge Technologies (OPC) Pvt. Ltd.';

export const CONTACT = {
  company: 'NETVERGE TECHNOLOGIES (OPC) PVT. LTD.',
  website: 'www.netverge.tech',
  person: 'Vineet Mohan',
  role: 'Founder & CEO',
  phone: '+91 9350183663',
  email: 'vineet.mohan@netverge.tech',
};

const CONTACT_BLOCK =
  `• **Website:** ${CONTACT.website}\n` +
  `• **${CONTACT.person}** – ${CONTACT.role}\n` +
  `• **Phone:** ${CONTACT.phone}\n` +
  `• **Email:** ${CONTACT.email}`;

/** Partners exactly as shown on page 3 of the PDF. `note` is the caption printed under the logo (if any). */
export const PARTNERS: { name: string; aliases: string[]; note?: string }[] = [
  { name: 'Microsoft', aliases: ['microsoft'] },
  { name: 'Dell', aliases: ['dell'] },
  { name: 'Cisco', aliases: ['cisco'] },
  { name: 'Fortinet', aliases: ['fortinet'] },
  { name: 'Palo Alto Networks', aliases: ['palo alto', 'paloalto', 'palo', 'alto'] },
  { name: 'Seceon', aliases: ['seceon'] },
  { name: 'ManageEngine', aliases: ['manageengine', 'manage engine'] },
  { name: 'Logitech', aliases: ['logitech'] },
  { name: 'Adobe', aliases: ['adobe'] },
  { name: 'Extreme Networks', aliases: ['extreme networks', 'extreme'] },
  { name: 'Kaspersky', aliases: ['kaspersky'] },
  { name: 'Veeam', aliases: ['veeam'] },
  { name: 'ViH Metaverse', aliases: ['vih', 'vih messenger', 'metaverse'], note: 'Enterprise Communication' },
  { name: 'Santa Fe Research', aliases: ['santa fe', 'santafe'], note: 'AI Research & Innovation' },
  { name: 'DIGISOL', aliases: ['digisol'] },
  { name: 'iTorizin', aliases: ['itorizin', 'itorizen'], note: 'CERT-IN empaneled Security Advisor' },
  { name: 'Videolytical', aliases: ['videolytical'] },
  { name: 'Telekonnectors', aliases: ['telekonnectors', 'tele konnectors'] },
];

const partnerEntries: KnowledgeEntry[] = PARTNERS.map((p) => ({
  id: `partner-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
  chip: `Is ${p.name} a partner?`,
  title: `${p.name} partnership`,
  icon: 'handshake',
  page: 3,
  questions: [`Is ${p.name} your partner?`, `Do you work with ${p.name}?`, `Tell me about ${p.name}`],
  keywords: ['partner', ...p.aliases],
  answer:
    `Yes – **${p.name}** is listed among NetVerge's strategic partners` +
    (p.note ? ` (${p.note}).` : '.') +
    `\n\nThe profile does not give further details about this specific partnership. ` +
    `For more information, please contact ${CONTACT.person} (${CONTACT.email}).`,
  related: ['partners', 'contact'],
}));

export const KNOWLEDGE: KnowledgeEntry[] = [
  // ───────────────────────── Page 1 ─────────────────────────
  {
    id: 'about',
    chip: 'What does NetVerge do?',
    title: 'About NetVerge',
    icon: 'building',
    page: 1,
    questions: [
      'What does NetVerge do?', 'Tell me about NetVerge', 'Who are you?', 'What is NetVerge Technologies?',
      'About the company', 'Company overview', 'Company profile', 'Introduce your company',
      'Company ke baare me batao', 'NetVerge kya karta hai', 'Aap log kya karte ho', 'Kampani kya hai',
    ],
    keywords: ['about', 'overview', 'company', 'profile', 'introduction', 'digital transformation partner', 'opc', 'pvt ltd', 'regulated', 'enterprise environments', 'what do you do'],
    answer:
      `**${COMPANY}** is a digital transformation partner delivering secure infrastructure, cybersecurity, enterprise networking, AI & automation, application services, cloud and managed IT services to organizations across regulated and enterprise environments.\n\n` +
      `With a customer-first mindset, deep technical expertise and strong business acumen, NetVerge delivers tailored solutions that solve complex challenges and drive meaningful outcomes. It helps organizations modernize and optimize their digital infrastructure for greater agility, resilience and collaboration.`,
    related: ['services', 'industries', 'highlights'],
  },
  {
    id: 'tagline',
    chip: "What is NetVerge's tagline?",
    title: 'Tagline',
    icon: 'sparkles',
    page: 1,
    questions: ['What is your tagline?', 'What is your motto?', 'Company slogan', 'Tagline kya hai'],
    keywords: ['tagline', 'slogan', 'motto', 'transform', 'secure', 'automate', 'scale', 'trusted partner', 'cyber resilience', 'enterprise ai transformation'],
    answer:
      `**Transform. Secure. Automate. Scale.**\n\n` +
      `NetVerge positions itself as your trusted partner for secure infrastructure, cyber resilience and enterprise AI transformation.`,
    related: ['about', 'highlights'],
  },
  {
    id: 'highlights',
    chip: 'Why choose NetVerge?',
    title: 'Why NetVerge',
    icon: 'badge',
    page: 1,
    questions: [
      'Why choose NetVerge?', 'What makes NetVerge different?', 'What are your strengths?', 'Key highlights',
      'Why should I work with you?', 'Aapko kyu choose kare', 'Aapki khasiyat kya hai', 'USP',
    ],
    keywords: ['why', 'choose', 'strength', 'highlight', 'advantage', 'different', 'usp', 'benefit', 'customer first', 'enterprise grade', 'strategic ecosystem', 'outcome focused'],
    answer:
      `NetVerge's key highlights:\n\n` +
      `• **75+ Years** – combined leadership experience\n` +
      `• **Customer First** – outcome-focused delivery\n` +
      `• **Enterprise Grade** – secure & scalable architectures\n` +
      `• **Strategic Ecosystem** – partner-enabled capabilities\n\n` +
      `Its partnerships enable faster delivery, access to specialized expertise, and reduced dependency on single-vendor ecosystems.`,
    related: ['experience', 'partners', 'engage'],
  },
  {
    id: 'experience',
    chip: 'How much experience does the team have?',
    title: 'Leadership experience',
    icon: 'badge',
    page: 1,
    questions: [
      'How much experience do you have?', 'How many years of experience?', 'Leadership experience',
      'Kitne saal ka experience hai', 'Aapka anubhav kitna hai', 'Combined experience',
    ],
    keywords: ['experience', 'years', '75', 'combined', 'leadership', 'anubhav', 'expertise', 'seasoned'],
    answer:
      `NetVerge highlights **75+ years of combined leadership experience**, together with deep technical expertise and strong business acumen.`,
    related: ['highlights', 'about'],
  },
  {
    id: 'industries',
    chip: 'Which industries do you serve?',
    title: 'Industries served',
    icon: 'factory',
    page: 1,
    questions: [
      'Which industries do you serve?', 'What sectors do you work in?', 'Industries we serve',
      'Do you serve banking?', 'Do you work with healthcare?', 'Manufacturing, retail, BFSI',
      'Kin industries ke saath kaam karte ho', 'Konse sector me kaam karte ho',
    ],
    keywords: ['industry', 'sector', 'bfsi', 'banking', 'financial', 'bank', 'finance', 'manufacturing', 'industrial', 'retail', 'distribution', 'healthcare', 'life sciences', 'pharma', 'public sector', 'government', 'utilities', 'it', 'ites', 'digital services', 'domain', 'vertical'],
    answer:
      `NetVerge serves these industries:\n\n` +
      `• Banking & Financial Services (BFSI)\n` +
      `• Manufacturing & Industrial Enterprises\n` +
      `• Retail & Distribution\n` +
      `• Healthcare & Life Sciences\n` +
      `• Public Sector & Utilities\n` +
      `• IT/ITES & Digital Services`,
    related: ['services', 'engage', 'about'],
  },

  // ───────────────────────── Page 2 ─────────────────────────
  {
    id: 'services',
    chip: 'What services do you offer?',
    title: 'Solutions & capabilities',
    icon: 'layers',
    page: 2,
    questions: [
      'What services do you offer?', 'What are your solutions?', 'Our solutions and capabilities',
      'List all services', 'What can you help me with?', 'What technology capabilities do you have?',
      'Aap kya services dete ho', 'Aapki services batao', 'Kya kya solutions hai',
    ],
    keywords: ['service', 'solution', 'capability', 'offering', 'portfolio', 'end to end', 'advisory', 'architecture', 'implementation', 'integration', 'managed support', 'products', 'all services'],
    answer:
      `NetVerge offers end-to-end technology capabilities spanning advisory, architecture, implementation, integration and ongoing managed support, across six areas:\n\n` +
      `• **Enterprise Network Solutions**\n` +
      `• **Cybersecurity Solutions**\n` +
      `• **Datacenter & Cloud**\n` +
      `• **AI & Automation**\n` +
      `• **Enterprise Applications**\n` +
      `• **Managed IT Services**\n\n` +
      `Tap a topic below or ask about any of them for the full list of what is covered.`,
    related: ['network', 'cyber', 'cloud', 'ai', 'apps', 'managed'],
  },
  {
    id: 'network',
    chip: 'Enterprise network solutions',
    title: 'Enterprise Network Solutions',
    icon: 'network',
    page: 2,
    questions: [
      'Tell me about network solutions', 'Do you provide networking services?', 'SD-WAN implementation',
      'Do you offer wireless infrastructure?', 'LAN WAN optimization', 'Network security and access control',
      'Network services kya hai', 'Networking ki service hai kya',
    ],
    keywords: ['network', 'networking', 'sd wan', 'sdwan', 'lan', 'wan', 'wireless', 'wifi', 'wi fi', 'access control', 'performance monitoring', 'network design', 'enterprise network solutions'],
    answer:
      `**Enterprise Network Solutions** include:\n\n` +
      `• Network design & architecture\n` +
      `• SD-WAN implementation\n` +
      `• LAN/WAN optimization\n` +
      `• Wireless infrastructure\n` +
      `• Network security & access control\n` +
      `• Performance monitoring`,
    related: ['cyber', 'cloud', 'managed'],
  },
  {
    id: 'cyber',
    chip: 'Cybersecurity solutions',
    title: 'Cybersecurity Solutions',
    icon: 'shield',
    page: 2,
    questions: [
      'What cybersecurity services do you offer?', 'Tell me about security solutions', 'Do you provide SOC as a service?',
      'Threat detection and response', 'Identity and access management', 'Compliance and governance',
      'Risk and vulnerability management', 'Cyber security ki services batao',
    ],
    keywords: ['cybersecurity', 'cyber', 'security', 'soc', 'soc as a service', 'threat', 'detection', 'response', 'risk', 'vulnerability', 'identity', 'iam', 'access management', 'security architecture', 'compliance', 'governance', 'hacking', 'attack', 'protection'],
    answer:
      `**Cybersecurity Solutions** include:\n\n` +
      `• Threat detection & response\n` +
      `• Risk & vulnerability management\n` +
      `• Identity & access management\n` +
      `• Security architecture design\n` +
      `• Compliance & governance\n` +
      `• SOC as a Service`,
    related: ['network', 'managed', 'partner-itorizin'],
  },
  {
    id: 'cloud',
    chip: 'Datacenter & cloud services',
    title: 'Datacenter & Cloud',
    icon: 'cloud',
    page: 2,
    questions: [
      'Do you provide cloud services?', 'Tell me about datacenter and cloud', 'Cloud migration and deployment',
      'Hybrid and multi-cloud architecture', 'Virtualization and consolidation', 'Cloud monitoring and optimization',
      'Cloud ki service hai kya', 'Datacenter services batao',
    ],
    keywords: ['cloud', 'datacenter', 'data center', 'dc', 'virtualization', 'consolidation', 'migration', 'migrate', 'deployment', 'hybrid', 'multi cloud', 'multicloud', 'backup', 'disaster recovery', 'dr', 'cloud monitoring', 'optimization'],
    answer:
      `**Datacenter & Cloud** services include:\n\n` +
      `• Datacenter design & architecture\n` +
      `• Virtualization & consolidation\n` +
      `• Cloud migration & deployment\n` +
      `• Hybrid & multi-cloud architecture\n` +
      `• Backup & disaster recovery\n` +
      `• Cloud monitoring & optimization`,
    related: ['managed', 'network', 'partner-veeam'],
  },
  {
    id: 'ai',
    chip: 'AI & automation',
    title: 'AI & Automation',
    icon: 'cpu',
    page: 2,
    questions: [
      'Do you offer AI services?', 'Tell me about AI and automation', 'Do you build LLM applications?',
      'AI voice bot', 'Enterprise AI consulting', 'Data analytics services', 'AI research and implementation',
      'AI ki services batao', 'Chatbot banate ho kya',
    ],
    keywords: ['ai', 'artificial intelligence', 'automation', 'llm', 'voice bot', 'voicebot', 'bot', 'chatbot', 'analytics', 'data analytics', 'enterprise ai', 'ai research', 'machine learning', 'ml', 'genai', 'generative', 'secure integration'],
    answer:
      `**AI & Automation** services include:\n\n` +
      `• AI research & implementation\n` +
      `• Enterprise AI & consulting\n` +
      `• Data analytics\n` +
      `• LLM applications\n` +
      `• AI Voice BOT\n` +
      `• Enterprise-grade secure integration`,
    related: ['partner-santa-fe-research', 'apps', 'services'],
  },
  {
    id: 'apps',
    chip: 'Enterprise applications',
    title: 'Enterprise Applications',
    icon: 'app',
    page: 2,
    questions: [
      'Do you do application modernization?', 'Tell me about enterprise applications', 'DevOps and agile engineering',
      'System integration and support', 'Digital transformation planning', 'Application services',
      'Application development ki service hai kya', 'DevOps karte ho kya',
    ],
    keywords: ['application', 'app', 'apps', 'modernization', 'modernisation', 'devops', 'agile', 'engineering', 'system integration', 'infrastructure and app optimization', 'digital transformation', 'planning', 'software', 'development', 'enterprise applications'],
    answer:
      `**Enterprise Applications** services include:\n\n` +
      `• Application modernization\n` +
      `• DevOps & agile engineering\n` +
      `• System integration & support\n` +
      `• Infrastructure & app optimization\n` +
      `• Digital transformation planning`,
    related: ['ai', 'managed', 'services'],
  },
  {
    id: 'managed',
    chip: 'Managed IT services',
    title: 'Managed IT Services',
    icon: 'server',
    page: 2,
    questions: [
      'Do you provide managed IT services?', 'Do you offer 24/7 monitoring?', 'Help desk and technical support',
      'Patch management', 'IT asset management', 'Do you provide IT support?',
      'Managed services kya hai', '24x7 support milta hai kya', 'Helpdesk support',
    ],
    keywords: ['managed', 'managed it', 'managed services', 'it support', 'support', '24 7', '24x7', 'monitoring', 'help desk', 'helpdesk', 'technical support', 'patch', 'patching', 'updates', 'asset', 'it asset management', 'security management', 'compliance', 'backup', 'disaster recovery', 'maintenance', 'amc'],
    answer:
      `**Managed IT Services** include:\n\n` +
      `• 24/7 infrastructure monitoring\n` +
      `• Help desk & technical support\n` +
      `• Patch management & updates\n` +
      `• IT asset management\n` +
      `• Security management & compliance\n` +
      `• Backup & disaster recovery`,
    related: ['engage', 'cloud', 'cyber'],
  },
  {
    id: 'engage',
    chip: 'How do you engage with clients?',
    title: 'How we engage',
    icon: 'workflow',
    page: 2,
    questions: [
      'How do you engage with clients?', 'What are your engagement models?', 'How do you work?',
      'Do you do project based work?', 'Do you provide consulting?', 'Co-delivery with partners',
      'Aap kaise kaam karte ho', 'Engagement model kya hai', 'Long term support milta hai kya',
    ],
    keywords: ['engage', 'engagement', 'model', 'delivery', 'consulting', 'advisory', 'project based', 'project', 'managed services', 'long term support', 'co delivery', 'transformation programs', 'outcome oriented', 'process', 'approach', 'how we work', 'work with you'],
    answer:
      `NetVerge works with clients through these engagement models:\n\n` +
      `• Consulting & Advisory\n` +
      `• Project-Based Delivery\n` +
      `• Managed Services & Long-Term Support\n` +
      `• Co-Delivery with Strategic Partners\n` +
      `• Outcome-Oriented Transformation Programs`,
    related: ['services', 'partners', 'contact'],
  },

  // ───────────────────────── Page 3 ─────────────────────────
  {
    id: 'partners',
    chip: 'Who are your strategic partners?',
    title: 'Strategic partners',
    icon: 'handshake',
    page: 3,
    questions: [
      'Who are your partners?', 'Which technology partners do you have?', 'List of strategic partnerships',
      'Which vendors do you work with?', 'Partner names', 'Aapke partners kaun kaun se hai',
      'Kin companies ke saath partnership hai',
    ],
    keywords: ['partner', 'partnership', 'strategic', 'vendor', 'ecosystem', 'alliance', 'oem', 'brands', 'technology partners', 'single vendor', 'logos', 'collaboration'],
    answer:
      `NetVerge's strategic partnerships enable faster delivery, access to specialized expertise, and reduced dependency on single-vendor ecosystems.\n\n` +
      `**Partners listed in the profile:**\n` +
      `• Microsoft • Dell • Cisco\n` +
      `• Fortinet • Palo Alto Networks • Seceon\n` +
      `• ManageEngine • Logitech • Adobe\n` +
      `• Extreme Networks • Kaspersky • Veeam\n` +
      `• ViH Metaverse (Enterprise Communication)\n` +
      `• Santa Fe Research (AI Research & Innovation)\n` +
      `• DIGISOL\n` +
      `• iTorizin (CERT-IN empaneled Security Advisor)\n` +
      `• Videolytical • Telekonnectors`,
    related: ['highlights', 'engage', 'contact'],
  },
  {
    id: 'certin',
    chip: 'Are you CERT-IN empaneled?',
    title: 'CERT-IN empaneled Security Advisor',
    icon: 'shield',
    page: 3,
    questions: ['Are you CERT-IN empaneled?', 'CERT-IN security advisor', 'Any security certification?', 'Security audit partner'],
    keywords: ['certin', 'cert in', 'empaneled', 'empanelled', 'empanel', 'certification', 'certified', 'accreditation', 'audit', 'security advisor', 'itorizin'],
    answer:
      `The profile lists **iTorizin** among NetVerge's strategic partners, described as a **CERT-IN empaneled Security Advisor**.\n\n` +
      `The profile does not state any other certifications. For more details, please contact ${CONTACT.person} (${CONTACT.email}).`,
    related: ['cyber', 'partners'],
  },
  {
    id: 'founder',
    chip: 'Who is the founder & CEO?',
    title: 'Founder & CEO',
    icon: 'user',
    page: 3,
    questions: [
      'Who is the founder?', 'Who is the CEO?', 'Who runs NetVerge?', 'Who is Vineet Mohan?',
      'Founder kaun hai', 'CEO kaun hai', 'Company ka malik kaun hai', 'Owner of the company',
    ],
    keywords: ['founder', 'ceo', 'owner', 'head', 'director', 'management', 'vineet', 'vinit', 'mohan', 'vineet mohan', 'leader', 'boss', 'malik'],
    answer:
      `**${CONTACT.person}** is the **${CONTACT.role}** of NetVerge Technologies.\n\n` +
      `• **Phone:** ${CONTACT.phone}\n` +
      `• **Email:** ${CONTACT.email}`,
    related: ['contact', 'experience'],
  },
  {
    id: 'contact',
    chip: 'How can I contact NetVerge?',
    title: 'Contact details',
    icon: 'phone',
    page: 3,
    questions: [
      'How can I contact NetVerge?', 'Contact details', 'What is your phone number?', 'What is your email?',
      'Website address', 'How do I reach you?', 'I want to talk to someone', 'Get in touch',
      'Contact kaise kare', 'Phone number batao', 'Email id kya hai', 'Sampark kaise kare',
    ],
    keywords: ['contact', 'phone', 'call', 'email', 'mail', 'website', 'url', 'reach', 'talk', 'get in touch', 'enquiry', 'inquiry', 'whatsapp', 'sampark', 'number', 'connect', 'website link', 'netverge tech'],
    answer: `You can reach NetVerge here:\n\n${CONTACT_BLOCK}`,
    related: ['founder', 'services', 'partners'],
  },

  // ─────────── Things the PDF does NOT contain (answered honestly, never guessed) ───────────
  {
    id: 'not-in-profile',
    chip: 'Where is your office located?',
    title: 'Information not in the profile',
    icon: 'info',
    page: 3,
    questions: [
      'Where is your office?', 'What is your office address?', 'Where are you located?', 'Which city are you in?',
      'What is the pricing?', 'How much does it cost?', 'Do you have job openings?', 'How many employees do you have?',
      'When was NetVerge founded?', 'Who are your clients?', 'Show me case studies', 'What is your revenue?',
      'Office kahan hai', 'Address kya hai', 'Price kitna hai', 'Kitne employees hai', 'Job openings hai kya',
    ],
    keywords: ['location', 'address', 'office', 'headquarters', 'city', 'price', 'cost', 'quote', 'budget', 'career', 'job', 'hiring', 'employee', 'founded', 'established', 'client', 'portfolio', 'case study', 'revenue', 'turnover', 'testimonial', 'reference', 'size', 'branch', 'country'],
    answer:
      `That specific detail (such as office address, pricing, careers, employee count, founding year, client names or case studies) is **not mentioned in the NetVerge Company Profile 2026**, so I don't want to guess.\n\n` +
      `Please contact the team directly:\n\n${CONTACT_BLOCK}`,
    related: ['services', 'partners', 'industries'],
  },

  ...partnerEntries,
];

/** Suggestions shown when the chat opens (in this order). */
export const STARTER_IDS = ['about', 'services', 'industries', 'partners', 'cyber', 'engage', 'contact'];

export const GREETING =
  `Hi! 👋 I'm the **NetVerge Assistant**. I answer questions using the official ${DOCUMENT_NAME}.\n\nPick a topic below or type your own question (English or Hinglish).`;

export const FALLBACK =
  `I couldn't find that in the **${DOCUMENT_NAME}**, and I only answer from that document, so I won't guess.\n\n` +
  `You can try one of the topics below, or contact the team directly:\n\n${CONTACT_BLOCK}`;