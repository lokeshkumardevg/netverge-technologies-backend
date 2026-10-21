import { Injectable, Module, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatalogModule } from '../catalog/catalog.module';
import { slugify } from '../catalog/crud.factory';
import { ContentModule, Content } from '../content/content.module';
import { Faq, Partner, Service, TeamMember, Testimonial } from '../catalog/schemas';



/* ───────────────── Company Profile 2026 data (from the NetVerge profile PDF) ───────────────── */
const PROFILE = {
  tagline: 'Transform. Secure. Automate. Scale.',
  heroSubtitle: 'Your trusted partner for secure infrastructure, cyber resilience and enterprise AI transformation.',
  aboutShort: 'NetVerge Technologies (OPC) Pvt. Ltd. is a digital transformation partner delivering secure infrastructure, cybersecurity, enterprise networking, AI & automation, application services, cloud and managed IT services to organizations across regulated and enterprise environments.',
  story: [
    'NetVerge Technologies (OPC) Pvt. Ltd. is a digital transformation partner delivering secure infrastructure, cybersecurity, enterprise networking, AI & automation, application services, cloud and managed IT services to organizations across regulated and enterprise environments.',
    'With a customer-first mindset, deep technical expertise and strong business acumen, we deliver tailored solutions that solve complex challenges and drive meaningful outcomes. We help organizations modernize and optimize their digital infrastructure for greater agility, resilience and collaboration.',
  ],
  stats: [
    { value: '75+', label: 'Years Combined Leadership Experience' },
    { value: '24/7', label: 'Infrastructure Monitoring' },
    { value: '18+', label: 'Strategic Technology Partners' },
  ],
  whyChoose: [
    { title: '75+ Years Combined Experience', text: 'Seasoned leadership guiding every engagement with deep technical expertise and strong business acumen.' },
    { title: 'Customer First', text: 'Outcome-focused delivery, tailored to solve complex challenges and drive meaningful results.' },
    { title: 'Enterprise-Grade Architectures', text: 'Secure and scalable architectures built for regulated and enterprise environments.' },
    { title: 'Strategic Ecosystem', text: 'Partner-enabled capabilities for faster delivery, specialised expertise and less single-vendor dependency.' },
  ],
  industries: {
    eyebrow: 'Industries',
    title: 'Industries We',
    highlight: 'Serve',
    text: 'We support organizations across regulated and enterprise environments with solutions tailored to their sector.',
    items: [
      'Banking & Financial Services (BFSI)',
      'Manufacturing & Industrial Enterprises',
      'Retail & Distribution',
      'Healthcare & Life Sciences',
      'Public Sector & Utilities',
      'IT/ITES & Digital Services',
    ],
  },
  engagement: {
    eyebrow: 'How We Engage',
    title: 'Flexible',
    highlight: 'Engagement Models',
    text: 'End-to-end technology capabilities spanning advisory, architecture, implementation, integration and ongoing managed support.',
    items: [
      'Consulting & Advisory',
      'Project-Based Delivery',
      'Managed Services & Long-Term Support',
      'Co-Delivery with Strategic Partners',
      'Outcome-Oriented Transformation Programs',
    ],
  },
  highlights: {
    items: [
      { title: '75+ Years', text: 'Combined leadership experience' },
      { title: 'Customer First', text: 'Outcome-focused delivery' },
      { title: 'Enterprise Grade', text: 'Secure & scalable architectures' },
      { title: 'Strategic Ecosystem', text: 'Partner-enabled capabilities' },
    ],
  },
  partnersContent: {
    eyebrow: 'Strategic Partnership',
    title: 'Our Strategic',
    highlight: 'Partners',
    text: 'Our partnerships enable faster delivery, access to specialized expertise, and reduced dependency on single-vendor ecosystems.',
    points: ['Faster delivery', 'Access to specialized expertise', 'Reduced single-vendor dependency'],
  },
  // service bullet lists from the profile (applied to the starter services)
  serviceItems: {
    'Enterprise Network Solutions': ['Network design & architecture', 'SD-WAN implementation', 'LAN/WAN optimization', 'Wireless infrastructure', 'Network security & access control', 'Performance monitoring'],
    'Cybersecurity Services': ['Threat detection & response', 'Risk & vulnerability management', 'Identity & access management', 'Security architecture design', 'Compliance & governance', 'SOC as a Service'],
    'Data Center Solutions': ['Datacenter design & architecture', 'Virtualization & consolidation', 'Migration & modernization', 'Backup & disaster recovery'],
    'Cloud Solutions': ['Cloud migration & deployment', 'Hybrid & multi-cloud architecture', 'Cloud monitoring & optimization', 'Cloud strategy & consulting', 'Cloud security & compliance'],
    'Managed IT Services': ['24/7 infrastructure monitoring', 'Help desk & technical support', 'Patch management & updates', 'IT asset management', 'Security management & compliance', 'Backup & disaster recovery'],
  } as Record<string, string[]>,
  // first bullet of the OLD defaults, used to detect "not customised yet"
  oldFirstItem: {
    'Enterprise Network Solutions': 'Network Design & Architecture',
    'Cybersecurity Services': 'Threat Detection & Incident Response',
    'Data Center Solutions': 'Data Center Design & Architecture',
    'Cloud Solutions': 'Cloud Strategy & Consulting',
    'Managed IT Services': '24/7 Network Monitoring',
  } as Record<string, string>,
  newServices: [
    { title: 'AI & Automation', icon: 'rocket', description: 'Practical enterprise AI, analytics and automation that turn your data into decisions and save time.', items: ['AI research & implementation', 'Enterprise AI & consulting', 'Data analytics', 'LLM applications', 'AI Voice BOT'] },
    { title: 'Application Services', icon: 'laptop', description: 'Modernise, integrate and support the applications your business runs on, securely and at scale.', items: ['Enterprise-grade secure integration', 'Application modernization', 'DevOps & agile engineering', 'System integration & support', 'Infrastructure & app optimization', 'Digital transformation planning'] },
  ],
  partners: [
    ['Microsoft', 'microsoft'], ['Dell', 'dell'], ['Cisco', 'cisco'], ['Fortinet', 'fortinet'], ['Palo Alto Networks', 'palo-alto-networks'], ['Seceon', 'seceon'],
    ['ManageEngine', 'manageengine'], ['Logitech', 'logitech'], ['Adobe', 'adobe'], ['Extreme Networks', 'extreme-networks'], ['Kaspersky', 'kaspersky'], ['Veeam', 'veeam'],
    ['ViH Metaverse', 'vih-metaverse', 'Enterprise Communication'], ['Santa Fe Research', 'santa-fe-research', 'AI Research & Innovation'], ['DIGISOL', 'digisol'],
    ['iTorizin', 'itorizin', 'CERT-IN empaneled Security Advisor'], ['Videolytical', 'videolytical'], ['Telekonnectors', 'telekonnectors'],
  ].map(([name, file, description], order) => ({ name, logo: `/partners/${file}.png`, description: description || undefined, order })),
};

/** Default detail-page content for the starter services (matched by title). Edit everything from Admin > Services. */
const SERVICE_DETAILS: Record<string, any> = {
  'Enterprise Network Solutions': {
    tagline: 'Reliable, high-performance networks that keep your business connected.',
    overview: 'A strong network is the backbone of every modern business. We design, deploy and optimise enterprise networks that are fast, secure and ready to scale with your growth.\n\nFrom a single office to multi-site operations, our engineers assess your current environment, remove bottlenecks and build an architecture that delivers consistent performance and uptime.',
    technologies: ['Cisco', 'Fortinet', 'Aruba', 'Juniper', 'SD-WAN', 'Wi-Fi 6'],
    benefits: [{ title: 'Higher uptime', text: 'Resilient design with redundancy to avoid single points of failure.' }, { title: 'Better performance', text: 'Optimised LAN/WAN and wireless for faster applications.' }, { title: 'Secure by design', text: 'Segmentation and access control built into the architecture.' }, { title: 'Ready to scale', text: 'Add sites and users without redesigning your network.' }],
    process: [{ title: 'Assess', text: 'We audit your current network, traffic and business needs.' }, { title: 'Design', text: 'A clear architecture with capacity, security and cost planned upfront.' }, { title: 'Implement', text: 'Deployment with minimal disruption to day-to-day operations.' }, { title: 'Support', text: 'Monitoring, tuning and ongoing support after go-live.' }],
  },
  'Cybersecurity Services': {
    tagline: 'Protect your business from evolving cyber threats.',
    overview: 'Cyber threats are becoming more frequent and more sophisticated. We help you understand your risks, close the gaps and respond quickly when something goes wrong.\n\nOur approach combines assessment, strong architecture and continuous monitoring so security becomes a built-in part of your business, not an afterthought.',
    technologies: ['Firewall & UTM', 'EDR / XDR', 'SIEM', 'IAM / MFA', 'Zero Trust', 'VAPT'],
    benefits: [{ title: 'Reduced risk', text: 'Find and fix vulnerabilities before attackers do.' }, { title: 'Faster response', text: 'Detect and contain incidents quickly to limit damage.' }, { title: 'Compliance ready', text: 'Controls aligned to common standards and audits.' }, { title: 'Peace of mind', text: 'Continuous protection for your data and users.' }],
    process: [{ title: 'Risk assessment', text: 'Identify assets, threats and weak points.' }, { title: 'Harden', text: 'Fix vulnerabilities and strengthen identity and access controls.' }, { title: 'Monitor', text: 'Continuous threat detection across endpoints and network.' }, { title: 'Respond', text: 'Incident response and recovery support when needed.' }],
  },
  'Data Center Solutions': {
    tagline: 'Modern, scalable and high-performance data center infrastructure.',
    overview: 'Your data center should be efficient, resilient and ready for what is next. We help you design new environments, consolidate existing ones and migrate workloads with confidence.\n\nWhether on-premise or hybrid, we focus on availability, performance and a clear disaster recovery plan.',
    technologies: ['VMware', 'Dell EMC', 'Hyper-V', 'HPE', 'Backup & DR'],
    benefits: [{ title: 'Lower costs', text: 'Virtualisation and consolidation reduce hardware and power spend.' }, { title: 'High availability', text: 'Designed to keep critical applications running.' }, { title: 'Safe migration', text: 'Planned moves with testing and rollback options.' }, { title: 'Disaster ready', text: 'Backup and recovery that you can actually rely on.' }],
    process: [{ title: 'Discover', text: 'Map workloads, dependencies and capacity.' }, { title: 'Architect', text: 'Design the target environment and migration plan.' }, { title: 'Migrate', text: 'Move and modernise with minimal downtime.' }, { title: 'Protect', text: 'Set up backup, DR and regular recovery tests.' }],
  },
  'Managed IT Services': {
    tagline: 'Proactive monitoring and support for seamless operations.',
    overview: 'Let our team take care of your day-to-day IT so you can focus on your business. We monitor, maintain and support your infrastructure around the clock.\n\nWith clear SLAs and proactive maintenance, most issues are fixed before your users even notice them.',
    technologies: ['24/7 Monitoring', 'Help Desk', 'Patch Management', 'Asset Management', 'Remote Support'],
    benefits: [{ title: 'Predictable costs', text: 'A fixed monthly model instead of surprise repair bills.' }, { title: 'Less downtime', text: 'Problems detected and fixed proactively.' }, { title: 'Expert help', text: 'A skilled team on call without hiring in-house.' }, { title: 'Always up to date', text: 'Regular patching and updates keep systems secure.' }],
    process: [{ title: 'Onboard', text: 'Document your environment and set up monitoring.' }, { title: 'Stabilise', text: 'Fix existing issues and standardise configurations.' }, { title: 'Operate', text: 'Help desk, monitoring and maintenance every day.' }, { title: 'Improve', text: 'Regular reviews and recommendations for improvement.' }],
  },
  'Cloud Solutions': {
    tagline: 'Flexible, secure and scalable cloud services for digital transformation.',
    overview: 'The cloud can make your business faster and more flexible, but only with the right strategy. We help you choose the right platforms, migrate safely and keep costs and security under control.\n\nFrom a first workload to a full hybrid or multi-cloud setup, we guide every step.',
    technologies: ['Microsoft Azure', 'AWS', 'Google Cloud', 'Microsoft 365', 'Hybrid Cloud'],
    benefits: [{ title: 'Scale on demand', text: 'Add capacity when you need it, pay for what you use.' }, { title: 'Secure by default', text: 'Cloud security and compliance built in from day one.' }, { title: 'Faster delivery', text: 'Launch new services quicker with modern platforms.' }, { title: 'Cost control', text: 'Right-sizing and governance to avoid cloud waste.' }],
    process: [{ title: 'Strategy', text: 'Define goals and pick the right cloud approach.' }, { title: 'Migrate', text: 'Move workloads with minimal disruption.' }, { title: 'Secure', text: 'Apply identity, network and data protection controls.' }, { title: 'Optimise', text: 'Monitor usage and keep improving cost and performance.' }],
  },
  'AI & Automation': {
    tagline: 'Enterprise AI, analytics and automation built around real business outcomes.',
    overview: 'AI delivers value when it is applied to real business problems. We help you identify high-impact use cases, build secure AI solutions and integrate them into the way your teams already work.\n\nFrom data analytics and LLM-powered applications to AI voice bots, we take you from idea to a working, supported solution.',
    technologies: ['LLM Applications', 'AI Voice BOT', 'Data Analytics', 'Automation', 'Enterprise AI'],
    benefits: [{ title: 'Smarter decisions', text: 'Turn your data into insights your teams can act on.' }, { title: 'Save time', text: 'Automate repetitive work so people focus on higher-value tasks.' }, { title: 'Better experience', text: 'Conversational AI and voice bots that serve customers around the clock.' }, { title: 'Secure by design', text: 'Enterprise-grade controls for your data and models.' }],
    process: [{ title: 'Discover', text: 'Identify high-impact AI and automation opportunities.' }, { title: 'Prototype', text: 'Validate the approach quickly with a focused proof of value.' }, { title: 'Build & integrate', text: 'Develop the solution and integrate it with your systems.' }, { title: 'Scale & support', text: 'Roll out, monitor and keep improving results.' }],
  },
  'Application Services': {
    tagline: 'Modern, integrated and well-supported applications for your business.',
    overview: 'Your applications should help your business move faster, not hold it back. We modernise legacy systems, integrate them securely and keep them running smoothly.\n\nOur engineers combine DevOps and agile practices with careful system integration so delivery is faster and more reliable.',
    technologies: ['DevOps', 'System Integration', 'Application Modernization', 'Agile Engineering', 'Secure Integration'],
    benefits: [{ title: 'Modernised systems', text: 'Update legacy applications without disrupting the business.' }, { title: 'Seamless integration', text: 'Secure integration across applications, data and platforms.' }, { title: 'Faster delivery', text: 'DevOps and agile engineering for quicker, safer releases.' }, { title: 'Reliable support', text: 'Ongoing optimisation and support after go-live.' }],
    process: [{ title: 'Plan', text: 'Assess your applications and define a transformation plan.' }, { title: 'Engineer', text: 'Modernise and integrate using agile, secure engineering.' }, { title: 'Deploy', text: 'Automated delivery pipelines for smooth releases.' }, { title: 'Optimise', text: 'Support, monitor and continually improve performance.' }],
  },
  'IT Consulting': {
    tagline: 'Strategic guidance to align technology with your business goals.',
    overview: 'Technology decisions should support your business goals. Our consultants help you plan, prioritise and choose the right solutions, so every rupee invested in IT delivers value.\n\nWe provide independent advice, honest assessments and a practical roadmap you can act on.',
    technologies: ['IT Roadmap', 'Technology Audit', 'Digital Transformation', 'Vendor Selection'],
    benefits: [{ title: 'Clear direction', text: 'A practical roadmap aligned to your business goals.' }, { title: 'Better decisions', text: 'Independent advice on tools, vendors and architecture.' }, { title: 'Reduced risk', text: 'Spot issues early before they become costly.' }, { title: 'Faster results', text: 'Experienced guidance that saves time and rework.' }],
    process: [{ title: 'Understand', text: 'Learn your business, goals and constraints.' }, { title: 'Assess', text: 'Review your current technology and processes.' }, { title: 'Recommend', text: 'Deliver a prioritised roadmap and options.' }, { title: 'Guide', text: 'Support execution and track results.' }],
  },
};

/** Fills the DB with the content from the design on first run (only if empty). Edit everything later from admin. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(Service.name) private services: Model<Service>,
    @InjectModel(TeamMember.name) private team: Model<TeamMember>,
    @InjectModel(Partner.name) private partners: Model<Partner>,
    @InjectModel(Faq.name) private faqs: Model<Faq>,
    @InjectModel(Testimonial.name) private testimonials: Model<Testimonial>,
    @InjectModel(Content.name) private content: Model<Content>,
  ) {}

  async onApplicationBootstrap() {
    if (!(await this.services.countDocuments())) {
      await this.services.insertMany([
        { title: 'Enterprise Network Solutions', icon: 'network', description: 'Secure, scalable and reliable network infrastructure to keep your business connected.', items: PROFILE.serviceItems['Enterprise Network Solutions'] },
        { title: 'Cybersecurity Services', icon: 'shield', description: 'Protect your business from evolving cyber threats with our comprehensive security solutions.', items: PROFILE.serviceItems['Cybersecurity Services'] },
        { title: 'Data Center Solutions', icon: 'database', description: 'Optimize and modernize your data center infrastructure with scalable, secure and high-performance solutions.', items: PROFILE.serviceItems['Data Center Solutions'] },
        { title: 'Managed IT Services', icon: 'server', description: 'Proactive monitoring and support for seamless operations.', items: PROFILE.serviceItems['Managed IT Services'] },
        { title: 'Cloud Solutions', icon: 'cloud', description: 'Accelerate your digital transformation with flexible, secure, and scalable cloud services.', items: PROFILE.serviceItems['Cloud Solutions'] },
        { title: 'IT Consulting', icon: 'users', description: 'Strategic guidance and expert advice to align your technology initiatives with your business goals.', items: ['IT Strategy & Roadmap Development', 'Technology Assessments & Audits', 'Digital Transformation Planning', 'Vendor Selection & Management'] },
        ...PROFILE.newServices,
      ].map((s, i) => ({ ...s, order: i })));
    }
    // Backfill: slug for every service + default detail content for the starter services (only where still empty).
    for (const svc of await this.services.find().lean() as any[]) {
      const upd: any = {};
      if (!svc.slug) {
        let slug = slugify(svc.title) || 'service', n = 2;
        while (await this.services.exists({ slug, _id: { $ne: svc._id } })) slug = `${slugify(svc.title)}-${n++}`;
        upd.slug = slug;
      }
      const d = SERVICE_DETAILS[svc.title];
      if (d && !svc.overview) Object.assign(upd, d);
      if (Object.keys(upd).length) await this.services.updateOne({ _id: svc._id }, { $set: upd });
    }
    if (!(await this.team.countDocuments())) {
      await this.team.insertMany([
        { name: 'Mr. Vineet Mohan', designation: 'Founder & CEO', bio: '25+ years of experience in IT, Telecom, Retail, Manufacturing and more.', photo: '/vinit.jpeg', featured: true, order: 0 },
        { name: 'Ms. Neha Sharma', designation: 'Operations Head', bio: 'Focused on process management, client relations and business operations.', order: 1 },
        { name: 'Mr. Rahul Verma', designation: 'CTO', bio: 'Specialist in cloud architecture, cybersecurity and enterprise solutions.', order: 2 },
        { name: 'Ms. Pooja Singh', designation: 'HR Head', bio: 'Focused on building strong teams and a positive work culture.', order: 3 },
      ]);
    }
    if (!(await this.partners.countDocuments())) {
      await this.partners.insertMany(PROFILE.partners);
    }
    if (!(await this.faqs.countDocuments())) {
      const general = [
        ['What services does NetVerge Technologies offer?', 'We provide Digital Transformation, Cybersecurity, and Enterprise Application services, along with end-to-end IT support tailored to your business.'],
        ['How do I get started with a project?', 'Reach out through the contact form or by phone or email. We will understand your requirements, discuss the right approach, and share a clear plan for next steps.'],
        ['Do you work with businesses of all sizes?', 'Yes. We work with organizations of different sizes and adapt our solutions to match your goals, existing systems, and budget.'],
        ['Can you integrate with our existing systems and tools?', 'In most cases, yes. We review your current setup first and design solutions that work alongside the tools and platforms you already use.'],
        ['Do you provide support after the project is delivered?', 'Yes. We offer ongoing support and maintenance so your solutions stay secure, reliable, and up to date.'],
        ['How do you approach security?', 'Security is built in from the start, not added at the end. We assess risks, follow industry best practices, and help you maintain protection as your business evolves.'],
      ].map(([question, answer], i) => ({ question, answer, pages: ['home', 'services'], order: i }));
      const contact = [
        ['How quickly will I hear back?', 'We reply to every enquiry within 24 hours on business days. Urgent support requests are prioritised and usually answered the same day.'],
        ['Can I schedule a call or a meeting?', 'Absolutely. Mention your preferred date and time in the message form and our team will confirm a slot for a call or an in-person visit at our Gurugram office.'],
        ['What details should I include in my message?', 'A short description of your project or issue, your timeline, and any budget range you have in mind helps us give you a useful first response.'],
        ['Do you work with clients outside Gurugram?', 'Yes. We work with clients across India and internationally, with remote collaboration and regular check-ins.'],
      ].map(([question, answer], i) => ({ question, answer, pages: ['contact'], order: 10 + i }));
      await this.faqs.insertMany([...general, ...contact]);
    }
    if (!(await this.testimonials.countDocuments())) {
      // Sample entries — replace with real client feedback from Admin > Testimonials.
      await this.testimonials.insertMany([
        { name: 'Amit Khanna', designation: 'IT Head', company: 'Sample Client Pvt. Ltd.', rating: 5, pages: ['home', 'about', 'contact'], order: 0, quote: 'NetVerge redesigned our network and security setup with almost no downtime. The team was responsive, professional and clear at every step.' },
        { name: 'Priya Malhotra', designation: 'Operations Director', company: 'Sample Retail Co.', rating: 5, pages: ['home', 'services', 'about'], order: 1, quote: 'Their managed IT support has been a real relief. Issues are resolved quickly and we finally have proper visibility into our infrastructure.' },
        { name: 'Sandeep Rao', designation: 'CTO', company: 'Sample Manufacturing Ltd.', rating: 5, pages: ['home', 'services', 'leadership'], order: 2, quote: 'From cloud migration to ongoing security monitoring, NetVerge delivered exactly what they promised. A partner we trust for the long term.' },
      ]);
    }
    const seed = async (key: string, data: any) => { if (!(await this.content.exists({ key }))) await this.content.create({ key, data }); };
    await seed('settings', {
      companyName: 'NetVerge Technologies (OPC) Pvt. Ltd.', tagline: PROFILE.tagline,
      logo: '/logo.png', phone: '+91 9350183663', email: 'vineet.mohan@netverge.tech', hours: 'Mon - Fri, 9:00 AM - 6:00 PM',
      address: 'Plot No. 502, Tower B 2, Tulip Violet, Badshahpur, Sector-69, Gurugram, Haryana, 122101, India',
      mapEmbedUrl: '', social: { linkedin: '', x: '', facebook: '', youtube: '' }, footerText: 'Building secure, scalable and intelligent technology solutions for a better tomorrow.',
    });
    await seed('home', {
      hero: { eyebrow: 'Your Trusted Technology Partner', title: 'Transform. Secure. Automate.', highlight: 'Scale.', subtitle: PROFILE.heroSubtitle, image: '', primaryCta: { label: 'Our Services', href: '/services' }, secondaryCta: { label: 'Contact Us', href: '/contact' } },
      badges: [{ title: 'Robust Security', text: 'Your data, our priority' }, { title: 'Scalable Solutions', text: 'Built for future growth' }, { title: 'Expert Team', text: 'Turning ideas into reality' }],
      about: { eyebrow: 'About NetVerge', title: 'About NetVerge', highlight: 'Technologies', text: PROFILE.aboutShort, image: '' },
      servicesIntro: { title: 'Comprehensive IT Solutions for a', highlight: 'Stronger Tomorrow', text: 'We provide end-to-end technology solutions to help businesses stay secure, agile, and ahead in a digital-first world.' },
      leadershipIntro: { title: 'Experienced Leaders. A', highlight: 'Stronger Vision.', text: 'Our leadership team brings decades of industry experience, innovation, and a passion for building technology solutions that make a real impact.' },
      contactCta: { title: "Let's Build Something Great", text: 'Have a project in mind or need expert guidance? We\'re here to help.' },
    });
    await seed('about', {
      hero: { eyebrow: 'About Us', title: 'Who We Are', text: 'We are more than just a tech company — we are a team of innovators, problem solvers, and digital experts.', image: '' },
      story: { title: 'Building a Smarter Digital Future', paragraphs: PROFILE.story, image: '' },
      stats: PROFILE.stats,
      mission: { title: 'Our Mission', text: 'To deliver innovative, secure, and scalable technology solutions that empower businesses to grow.' },
      vision: { title: 'Our Vision', text: 'To be a global leader in digital and technology innovation.' },
      values: { title: 'Our Values', text: 'Integrity, excellence, collaboration, and a commitment to customer success.' },
      whyChoose: PROFILE.whyChoose,
    });
    await seed('services', { hero: { eyebrow: 'Our Services', title: 'Technology Solutions for a', highlight: 'Stronger Tomorrow', text: 'We offer a comprehensive range of IT services designed to help businesses stay secure, agile, and ahead in a digital-first world.' }, cta: { title: 'Need a Custom Solution?', text: 'Our team is ready to help you build the right technology solution for your unique business needs.' } });
    await seed('leadership', { hero: { eyebrow: 'Our Leadership', title: 'Meet Our Leaders', text: 'Visionaries. Strategists. Problem Solvers.' }, intro: { title: 'Our Leadership Team', text: 'Our leadership team brings decades of industry experience, innovation, and a passion for building technology solutions that make a real impact.' }, cta: { title: 'Great People Build Great Solutions', text: 'Join our team and be part of a culture that values innovation, growth, and impact.' } });
    await seed('faq', { eyebrow: 'FAQ', title: 'Frequently Asked', highlight: 'Questions', text: 'Quick answers to the things people ask us most. Cannot find yours? Talk to us directly.', helpTitle: 'Still have questions?', helpText: 'Our team is happy to help you find the right solution.', buttonText: 'Contact Us' });
    await seed('testimonials', { eyebrow: 'Testimonials', title: 'What Our Clients', highlight: 'Say About Us', text: 'Real feedback from the businesses we have helped to stay secure, scalable and smart.' });
    await seed('industries', PROFILE.industries);
    await seed('engagement', PROFILE.engagement);
    await seed('partners', PROFILE.partnersContent);
    await seed('highlights', PROFILE.highlights);
    await this.applyProfile2026();
    await seed('contact', { hero: { eyebrow: 'Contact Us', title: 'Get In Touch', text: 'We\'d love to hear from you. Whether you have a project in mind, need support, or just want to say hello, we\'re here for you.' } });
  }

  /**
   * One-time upgrade of an EXISTING database with details from the NetVerge Company Profile 2026.
   * It only replaces values that are still the old starter defaults and only adds what is missing,
   * so anything already edited in the admin panel is never overwritten. Runs once (marker key below).
   */
  private async applyProfile2026() {
    const MARK = 'meta_profile2026';
    if (await this.content.exists({ key: MARK })) return;
    const set = (key: string, filter: Record<string, any>, update: Record<string, any>) =>
      this.content.updateOne({ key, ...filter } as any, { $set: update });

    await set('settings', { 'data.tagline': 'Secure. Scalable. Smart.' }, { 'data.tagline': PROFILE.tagline });
    await set('settings', { 'data.phone': '+91 98815 86360' }, { 'data.phone': '+91 9350183663' });
    await set('home', { 'data.hero.title': 'Secure. Scalable.', 'data.hero.highlight': 'Smart.' }, { 'data.hero.title': 'Transform. Secure. Automate.', 'data.hero.highlight': 'Scale.' });
    await set('home', { 'data.hero.subtitle': 'Your trusted partner in Digital Transformation, Cybersecurity, and Enterprise Application Services.' }, { 'data.hero.subtitle': PROFILE.heroSubtitle });
    await set('home', { 'data.about.text': 'NetVerge Technologies is your trusted partner in Digital Transformation, Cybersecurity, and Enterprise Application Services.' }, { 'data.about.text': PROFILE.aboutShort });
    await set('about', { 'data.story.paragraphs': ['NetVerge Technologies (OPC) Pvt. Ltd. is a trusted partner in Digital Transformation, Cybersecurity, and Enterprise Application Services.'] }, { 'data.story.paragraphs': PROFILE.story });
    await set('about', { 'data.stats.0.value': '10+', 'data.stats.1.value': '50+', 'data.stats.2.value': '30+' }, { 'data.stats': PROFILE.stats });
    await set('about', { 'data.whyChoose.0.title': 'Expert Team', 'data.whyChoose.1.title': 'Client-Centric Approach' }, { 'data.whyChoose': PROFILE.whyChoose });

    // services: bullet lists from the profile (only if still the old defaults) + the 2 missing services
    for (const [title, items] of Object.entries(PROFILE.serviceItems)) {
      await this.services.updateOne({ title, 'items.0': PROFILE.oldFirstItem[title] } as any, { $set: { items } });
    }
    let order = (((await this.services.find().sort({ order: -1 }).limit(1).lean()) as any[])[0]?.order ?? -1) + 1;
    for (const def of PROFILE.newServices) {
      if (await this.services.exists({ title: def.title })) continue;
      const root = slugify(def.title);
      let slug = root, n = 2;
      while (await this.services.exists({ slug })) slug = `${root}-${n++}`;
      await this.services.create({ ...def, ...SERVICE_DETAILS[def.title], slug, order: order++ } as any);
    }

    // partners: add the missing ones, attach profile logos to existing ones that have none
    const norm = (v: string) => String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const existing = (await this.partners.find().lean()) as any[];
    let pOrder = Math.max(-1, ...existing.map((p) => p.order ?? 0)) + 1;
    for (const p of PROFILE.partners) {
      const hit = existing.find((e) => norm(e.name).includes(norm(p.name)) || norm(p.name).includes(norm(e.name)));
      if (hit) {
        const upd: any = {};
        if (!hit.logo) upd.logo = p.logo;
        if (!hit.description && p.description) upd.description = p.description;
        if (Object.keys(upd).length) await this.partners.updateOne({ _id: hit._id }, { $set: upd });
        continue;
      }
      await this.partners.create({ ...p, order: pOrder++ } as any);
    }

    await this.team.updateOne({ name: /vineet/i, designation: 'Director' } as any, { $set: { designation: 'Founder & CEO' } });
    await this.content.create({ key: MARK, data: { appliedAt: new Date().toISOString() } });
  }
}

@Module({ imports: [CatalogModule, ContentModule], providers: [SeedService] })
export class SeedModule {}
