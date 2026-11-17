/**
 * Everything the portfolio says lives here.
 *
 * Entries with `draft: true` are placeholders: they show with a "draft" badge in `npm run dev`
 * and are left out of production builds. Fill one in, then delete its `draft` flag.
 */

export type Link = { label: string; href: string };

export type Project = {
  name: string;
  kind: 'work' | 'personal';
  summary: string;
  highlights: string[];
  stack: string[];
  links: Link[];
  image?: string;   // screenshot of the project's site, under /public; shown in a browser frame with the first link's address
  video?: string;   // optional short muted loop shown in that frame instead (the screenshot becomes its still frame)
  draft?: boolean;
};

export type Role = {
  title: string;
  company: string;
  location?: string;
  period: string;
  points: string[];
  stack?: string[];
  draft?: boolean;
};

const projects: Project[] = [
  {
    name: 'Bizscout',
    kind: 'work',
    summary: 'A business acquisition marketplace connecting buyers, sellers and brokers through centralized listings and broker management workflows.',
    highlights: [
      'Built and maintained 10+ automated Firecrawl scrapers processing 25,000+ business listings a day',
      'Designed the daily pipeline that sanitizes, normalizes, standardizes and scores scraped data, with retries, failure handling and rate-limit management',
      'Built the supply team’s admin dashboard to review, approve and edit listings, manage leads and monitor scrapers',
      'Integrated brokerage partners to ingest for-sale listings, with automated broker notifications and lead tracking when buyers show interest',
      'Built CRM integrations for the broker and lead workflows',   // TODO: name the CRM(s) and what syncs, if you like
      'Mapbox geocoding and Resend for personalized automated email workflows',
    ],
    stack: ['Next.js', 'NestJS', 'MongoDB', 'CRM integrations', 'Supabase', 'AWS', 'Docker', 'Railway', 'Vercel', 'GitHub Actions'],
    links: [{ label: 'bizscout.com', href: 'https://bizscout.com' }],
    image: '/images/projects/bizscout.jpg',
  },
  {
    name: 'Helou Firm – MyFileHR',
    kind: 'work',
    summary: 'A full-stack HR platform for employee onboarding, leave management, feedback and organization-specific workflows, with a RAG-powered HR assistant.',
    highlights: [
      'Built a multi-organization RAG chatbot with Firebase Genkit, Gemini and Firestore, serving 5+ organizations and 300+ employee records',
      'AI query routing that works out what is being asked and retrieves from that organization’s HR data and policies',
      'Role-based access control for admins, managers and employees, so AI answers only use data the asker is allowed to see',
      'Personalized questions about leave balances, feedback, employee details and company policy',
    ],
    stack: ['RAG', 'Firebase Genkit', 'Gemini', 'React', 'Node.js', 'Redux', 'Firebase', 'Firestore'],
    links: [{ label: 'heloufirm.com', href: 'https://www.heloufirm.com' }],   // the bare domain fails HTTPS; www works
    image: '/images/projects/heloufirm.jpg',
  },
  {
    name: 'Rewaa',
    kind: 'work',
    summary: 'A retail management platform, where I worked as a full-stack engineer on frontend features, backend services and API integrations.',
    highlights: [
      'Built the onboarding feature end to end, from the frontend flows to the APIs behind them',
      'Integrated and maintained APIs between the frontend, backend and external systems',
    ],
    stack: ['Angular', 'Node.js', 'AWS', 'PostgreSQL', 'Docker'],
    links: [{ label: 'rewaa.com', href: 'https://rewaa.com' }],   // rewaatech.com now redirects here (Arabic only)
    image: '/images/projects/rewaa.jpg',
  },
  {
    name: 'Book Intelligence',
    kind: 'personal',
    summary: 'An open, AI-powered library. Upload a PDF and ask it anything: every answer comes only from the book, with citations to the exact chapter and page.',
    highlights: [
      'Hybrid RAG: pgvector similarity plus Postgres full-text search, and citations can only point at passages that were actually retrieved',
      'Background ingestion pipeline: PDF extraction, cleaning, chapter detection, structure-aware chunking and embeddings, resumable after failures',
      'Grounding check on every answer: an answer that cites nothing is regenerated with a stricter prompt, honest “not in this book” replies are labelled, and anything still unbacked carries a warning',
      'Private chats without accounts: each browser gets an anonymous id, and the server only ever shows a visitor their own conversations',
      'Runs on local Ollama models or any OpenAI-compatible API; the live demo uses Gemini’s free tier and waits out its per-minute limits',
      'Deployed for free on Render, Neon (Postgres + pgvector) and Supabase Storage, with no personal data stored',
    ],
    stack: ['Next.js', 'TypeScript', 'RAG', 'pgvector', 'PostgreSQL', 'Drizzle', 'Gemini', 'Ollama'],
    links: [
      { label: 'books.devvrania.com', href: 'https://books.devvrania.com' },
      { label: 'Code', href: 'https://github.com/devvrania/book-intelligence' },
    ],
    image: '/images/projects/book-intelligence.jpg',
  },
  {
    name: 'Spendly',
    kind: 'personal',
    summary: 'A calm personal finance tracker for income and expenses in PKR across wallets and categories, built to go deep on database design and SQL.',
    highlights: [
      'Composite foreign keys, so the database itself guarantees every transaction uses the owner’s own wallet and a category of the matching type, even if the app code has a bug',
      'CHECK constraints, case-insensitive unique names and balances always derived from transactions, never stored',
      'Dashboard analytics in raw SQL (FILTER, window functions, generate_series), indexed and verified with EXPLAIN ANALYZE on 60k rows',
      'HttpOnly cookie sessions with Argon2id, CSRF origin checks and rate limiting, covered by end-to-end tests',
      'One-click live demo: every visitor gets their own pre-filled account, private to them and deleted after 24 hours',
      'Next.js on Vercel proxies the NestJS API on Render through the same domain, so the session cookie stays first-party',
    ],
    stack: ['Next.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'Prisma', 'Tailwind', 'Recharts'],
    links: [
      { label: 'spendly.devvrania.com', href: 'https://spendly.devvrania.com' },
      { label: 'Code', href: 'https://github.com/devvrania/spendly' },
    ],
    image: '/images/projects/spendly.jpg',
  },
  {
    name: 'Kairo',
    kind: 'personal',
    summary: 'My 3D coding companion: a VRM character at a night desk who types, follows your cursor, takes stretch breaks and says hello when you click him. He’s the one at the top of this page.',
    highlights: [
      'Procedural seated pose built from the model’s own bones, with breathing, typing and gaze layered on top',
      'Mood, attention and idle-break behaviours driven by what the visitor is doing',
      'The whole room is generated in code: canvas-painted window, IDE screen and keyboard backlight',
    ],
    stack: ['three.js', 'three-vrm', 'JavaScript', 'WebGL'],
    links: [
      { label: 'kairo.devvrania.com', href: 'https://kairo.devvrania.com/' },
      { label: 'Code', href: 'https://github.com/devvrania/kairo' },
    ],
    image: '/images/projects/kairo.jpg',
    video: '/images/projects/kairo-loop.mp4',
  },
];

// **Text in double asterisks** in a role's points is highlighted (used for the measurable results).
const experience: Role[] = [
  {
    title: 'Software Engineer',
    company: 'Devsinc',
    location: 'Pakistan',
    period: 'July 2024 – Present',
    points: [
      'Built and maintained production full-stack applications with Node.js, NestJS, React, Next.js and AWS, across multiple production deployments',
      'Designed scalable backend services and microservice architectures, integrating third-party APIs for business-critical workflows',
      'Built an AI-powered RAG system with Firebase Genkit and LLMs for querying **300+ employee records** and organization-specific HR data',
      'Cut API response times by **up to 30%** with Redis caching, query optimization and better data access',
      'Improved MongoDB and PostgreSQL query performance by **up to 40%** through indexing and query optimization',
      'Reduced code complexity by **20%** by refactoring legacy Node.js services',
      'Worked with QA and DevOps to troubleshoot production issues and keep downtime low',
    ],
    stack: ['Node.js', 'NestJS', 'React', 'Next.js', 'AWS', 'Redis', 'MongoDB', 'PostgreSQL'],
  },
];

export const site = {
  name: 'Rania',
  fullName: 'Rania Nasir',
  handle: 'devvrania',
  role: 'Software Engineer · Full-Stack Developer · AI-Powered Apps',
  tagline: 'Building thoughtful digital experiences, scalable backend systems, and AI-powered applications.',
  url: "https://www.devvrania.com",

  links: {
    github: 'https://github.com/devvrania',
    linkedin: 'https://www.linkedin.com/in/devvrania',
    email: 'devv.rania@gmail.com',
    resume: '',  // '/resume.pdf' after adding a copy without your phone number to /public; empty hides the button
  },

  /** Shown with a green dot in Contact, e.g. 'Open to full-time and freelance roles'. Empty hides it. */
  availability: '',

  // The first paragraph is shown larger as the lead. **Text in double asterisks** is highlighted.
  about: [
    'I’m a software engineer with **four years of production experience**, building scalable full-stack and backend applications with Node.js, NestJS, React, TypeScript and AWS.',
    'Most of my work is **REST APIs, microservices and data-heavy systems** where performance matters. Lately that includes **AI features built on LLMs and retrieval-augmented generation**.',
    'I care about clean architecture, readable code and the small details that make software feel right.',
  ],

  impact: [
    { value: '30%', label: 'faster API responses, through Redis caching and query work' },
    { value: '40%', label: 'faster MongoDB and PostgreSQL queries, through indexing' },
    { value: '20%', label: 'less code complexity, refactoring legacy Node.js services' },
  ],

  education: {
    degree: 'BS Computer Science',
    school: 'FAST – National University of Computer and Emerging Sciences',
    years: '2020 – 2024',
  },

  skills: [
    { group: 'Languages', items: ['TypeScript', 'JavaScript', 'SQL'] },
    { group: 'Frontend', items: ['React', 'Next.js', 'Angular', 'Redux', 'Tailwind CSS', 'Material UI', 'TanStack Query', 'three.js'] },
    { group: 'Backend & APIs', items: ['Node.js', 'NestJS', 'Express', 'REST APIs', 'WebSockets', 'JWT auth', 'Mongoose', 'Prisma', 'Drizzle ORM', 'BullMQ', 'Redis'] },
    { group: 'Databases', items: ['MongoDB', 'PostgreSQL', 'MySQL', 'Supabase', 'Neon', 'pgvector'] },
    { group: 'AI & Integrations', items: ['CRM integrations', 'LLM integrations', 'RAG', 'Ollama', 'Firebase Genkit', 'Gemini', 'Firecrawl', 'Mapbox', 'Stripe', 'SendGrid', 'Resend'] },
    { group: 'Cloud & DevOps', items: ['AWS', 'Docker', 'GitHub Actions', 'CI/CD', 'Vercel', 'Railway', 'Render', 'Firebase'] },
    { group: 'Architecture', items: ['Microservices', 'Event-driven', 'MVC', 'SOLID'] },
    { group: 'Tools', items: ['Git', 'GitHub', 'GitLab', 'Jira', 'Linear', 'Jest', 'Claude Code'] },
  ],

  projects,

  experience,
};

/** Drafts show while developing and never ship. */
export const showDrafts = process.env.NODE_ENV !== 'production';
export const visible = <T extends { draft?: boolean }>(items: T[]) => items.filter(i => showDrafts || !i.draft);
