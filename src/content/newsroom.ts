// Editorial taxonomy for the Cumulant newsroom.
//
// Sections (the primary desk a story belongs to), their subtopics, the article
// types, and a controlled tag vocabulary. This file is the single source of
// truth for navigation, topic pages, classification, and the story-mix engine.
// It carries no styling or copy beyond labels and one-line blurbs.

export interface NewsSection {
  /** URL segment, e.g. "markets". */
  slug: string;
  label: string;
  /** Shorter label for tight nav. */
  short?: string;
  /** One sentence describing the desk, used on topic pages. */
  blurb: string;
  /** Controlled subtopics within the section. */
  subtopics: string[];
  /** Flexible target share of the daily story mix (0-1). */
  mix: number;
  /** Show in the primary top navigation. */
  nav?: boolean;
  /** Display + classification order. */
  order: number;
}

// Flexible editorial targets, not rigid quotas. The diversity engine compares
// recent coverage against these and steers toward under-served desks.
export const SECTIONS: NewsSection[] = [
  { slug: "markets", label: "Markets", blurb: "Equities, bonds, currencies, and what is moving them.", mix: 0.11, nav: true, order: 1,
    subtopics: ["Equities", "Bonds and rates", "Currencies", "Volatility", "Market structure", "Earnings", "Sectors"] },
  { slug: "economy", label: "Economy", blurb: "Inflation, growth, jobs, and the data that shapes them.", mix: 0.12, nav: true, order: 2,
    subtopics: ["Inflation", "Interest rates", "Employment", "Consumer spending", "GDP", "Housing", "Manufacturing", "Productivity", "Government debt", "Credit conditions"] },
  { slug: "politics", label: "Politics", blurb: "Elections, leadership, and the politics that move money.", mix: 0.08, nav: true, order: 3,
    subtopics: ["Elections", "Tax policy", "Government spending", "Central-bank appointments", "Antitrust", "Immigration and labor supply", "Defense spending", "Industrial policy"] },
  { slug: "policy", label: "Policy", blurb: "Regulation, taxation, and rules that reshape industries.", mix: 0.07, nav: true, order: 4,
    subtopics: ["Regulation", "Tax policy", "Trade policy", "Antitrust", "Financial regulation", "Industrial policy", "Healthcare policy", "Housing policy"] },
  { slug: "geopolitics", label: "Geopolitics", blurb: "Conflict, sanctions, and trade routes that price into markets.", mix: 0.1, nav: true, order: 5,
    subtopics: ["Wars and conflicts", "Sanctions", "Tariffs", "Shipping routes", "Energy security", "Foreign investment", "Currency pressure", "Supply-chain disruptions", "Alliances", "Political instability"] },
  { slug: "business", label: "Business", blurb: "Corporate strategy and the decisions that signal industry shifts.", mix: 0.07, nav: true, order: 6,
    subtopics: ["Corporate strategy", "Leadership", "Restructuring", "Earnings", "Industry shifts", "Governance"] },
  { slug: "technology", label: "Technology", short: "Tech", blurb: "Semiconductors, cloud, software, and tech regulation.", mix: 0.06, nav: true, order: 7,
    subtopics: ["Semiconductors", "Cloud computing", "Cybersecurity", "Consumer technology", "Enterprise software", "Automation", "Data centers", "Technology regulation"] },
  { slug: "ai", label: "Artificial Intelligence", short: "AI", blurb: "Models, compute, business models, and the economics of AI.", mix: 0.06, nav: true, order: 8,
    subtopics: ["Models", "Compute and chips", "Data centers", "AI business models", "Labor impact", "AI regulation", "Infrastructure"] },
  { slug: "banking", label: "Banking", blurb: "Banks, credit, and the plumbing of the financial system.", mix: 0.05, nav: true, order: 9,
    subtopics: ["Central banks", "Big banks", "Regional banks", "Credit", "Lending", "Payments", "Financial stability"] },
  { slug: "investing", label: "Investing", blurb: "Strategy, asset allocation, and how to read the market.", mix: 0.05, nav: true, order: 10,
    subtopics: ["Strategy", "Asset allocation", "Funds and ETFs", "Fixed income", "Dividends", "Risk"] },
  { slug: "personal-finance", label: "Personal Finance", short: "Personal Finance", blurb: "Practical guidance on money, credit, and households.", mix: 0.06, nav: true, order: 11,
    subtopics: ["Credit", "Mortgages", "Student loans", "Taxes", "Retirement", "Banking", "Insurance", "Budgeting", "Investing basics", "Consumer protection"] },
  { slug: "real-estate", label: "Real Estate", blurb: "Housing, commercial property, and the cost of shelter.", mix: 0.04, nav: true, order: 12,
    subtopics: ["Housing", "Mortgages", "Commercial real estate", "Construction", "Home insurance", "Rents"] },
  { slug: "energy", label: "Energy", blurb: "Oil, power, and the transition reshaping the grid.", mix: 0.04, nav: true, order: 13,
    subtopics: ["Oil and gas", "Electricity", "Renewables", "Grid", "Nuclear", "Energy security"] },
  { slug: "commodities", label: "Commodities", blurb: "Crude, metals, agriculture, and the climate that moves them.", mix: 0.03, order: 14,
    subtopics: ["Crude oil", "Natural gas", "Metals", "Agriculture", "Climate", "Carbon"] },
  { slug: "healthcare", label: "Healthcare", blurb: "Drugs, devices, payers, and the business of health.", mix: 0.03, order: 15,
    subtopics: ["Pharma", "Biotech", "Medical devices", "Insurers", "Life-science tools", "Healthcare policy"] },
  { slug: "consumer", label: "Consumer", blurb: "Retail, brands, and how households actually spend.", mix: 0.04, order: 16,
    subtopics: ["Retail", "Brands", "Spending", "E-commerce", "Food and beverage", "Travel"] },
  { slug: "labor", label: "Labor", blurb: "Jobs, wages, unions, and the supply of work.", mix: 0.03, order: 17,
    subtopics: ["Employment", "Wages", "Unions", "Layoffs", "Immigration", "Remote work", "Skills"] },
  { slug: "trade", label: "Trade", blurb: "Tariffs, supply chains, and the flow of goods.", mix: 0.03, order: 18,
    subtopics: ["Tariffs", "Supply chains", "Exports", "Shipping", "Trade agreements", "Industrial policy"] },
  { slug: "deals", label: "Deals", blurb: "M&A, IPOs, private equity, and venture capital.", mix: 0.05, nav: true, order: 19,
    subtopics: ["Mergers and acquisitions", "IPOs", "Private equity", "Venture capital", "Buyouts", "Spin-offs"] },
  { slug: "crypto", label: "Crypto", blurb: "Digital assets, stablecoins, and tokenized finance.", mix: 0.03, order: 20,
    subtopics: ["Bitcoin", "Ethereum", "Stablecoins", "Regulation", "Exchanges", "Tokenization", "DeFi"] },
  { slug: "global-markets", label: "Global Markets", blurb: "Economies and markets beyond the United States.", mix: 0.03, order: 21,
    subtopics: ["Europe", "China", "Japan", "Emerging markets", "Asia", "Currencies"] },
  { slug: "research", label: "Research and Data", short: "Research", blurb: "Data stories and research notes, methodology forward.", mix: 0.04, nav: true, order: 22,
    subtopics: ["Data stories", "Research notes", "Methodology", "Replication", "Models"] },
  { slug: "explainers", label: "Explainers", blurb: "One question, answered clearly, with the terms defined.", mix: 0.03, order: 23,
    subtopics: ["How it works", "Why it matters", "Definitions", "Guides"] },
  { slug: "opinion", label: "Opinion", blurb: "Clearly labeled argument and analysis, separated from reporting.", mix: 0.02, order: 24,
    subtopics: ["Commentary", "Argument", "Columns"] },
  { slug: "breaking", label: "Breaking News", short: "Breaking", blurb: "Fast, verified, timestamped developments.", mix: 0.02, order: 25,
    subtopics: ["Developing", "Confirmed", "Live"] },
];

export const SECTION_BY_SLUG: Record<string, NewsSection> = Object.fromEntries(SECTIONS.map((s) => [s.slug, s]));
export const NAV_SECTIONS = SECTIONS.filter((s) => s.nav).sort((a, b) => a.order - b.order);

// --------------------------------------------------------------------------- //
// Article types: a story is written in one of these shapes. Each type names the
// components it tends to render so the page can adapt to the format.

export interface ArticleType {
  slug: string;
  label: string;
  blurb: string;
}

export const ARTICLE_TYPES: ArticleType[] = [
  { slug: "breaking", label: "Breaking News", blurb: "Fast, concise, timestamped, frequently updated, verified facts." },
  { slug: "news-analysis", label: "News Analysis", blurb: "Why an event matters, connected to markets, industries, and people." },
  { slug: "market-brief", label: "Market Brief", blurb: "Index, rate, currency and commodity moves, the drivers, and what to watch." },
  { slug: "explainer", label: "Explainer", blurb: "One question answered, terms defined, with examples." },
  { slug: "data-story", label: "Data Story", blurb: "Built around a dataset, with charts, methodology, and honest reading." },
  { slug: "company-analysis", label: "Company Analysis", blurb: "Business model, revenue drivers, risks, competition, and implications." },
  { slug: "policy-impact", label: "Policy Impact Report", blurb: "Policy details, industries and companies affected, household consequences." },
  { slug: "geopolitical", label: "Geopolitical Market Analysis", blurb: "Event, countries, trade and commodity exposure, currency, and scenarios." },
  { slug: "personal-finance-guide", label: "Personal Finance Guide", blurb: "Practical guidance, examples, calculations, with risks and limits." },
  { slug: "feature", label: "Long-Form Feature", blurb: "Narrative structure, deep synthesis, rich visuals, multiple sections." },
  { slug: "research-note", label: "Research Note", blurb: "Question, evidence, method, findings, limitations, implications." },
  { slug: "opinion", label: "Opinion", blurb: "Clearly labeled argument, evidence-based, separated from reporting." },
];

export const ARTICLE_TYPE_BY_SLUG: Record<string, ArticleType> = Object.fromEntries(ARTICLE_TYPES.map((t) => [t.slug, t]));

// --------------------------------------------------------------------------- //
// Controlled tag vocabulary. Aliases collapse to one canonical label so similar
// ideas never become duplicate tags ("Artificial Intelligence" -> "AI").

const TAG_ALIASES: Record<string, string> = {
  "artificial intelligence": "AI", "a.i.": "AI", "machine intelligence": "AI", "machine learning": "AI", "genai": "AI", "generative ai": "AI",
  "the fed": "Federal Reserve", "fed": "Federal Reserve", "federal reserve board": "Federal Reserve", "fomc": "Federal Reserve",
  "interest rate": "Interest rates", "rates": "Interest rates", "rate cut": "Interest rates", "rate hike": "Interest rates",
  "inflation rate": "Inflation", "cpi": "Inflation", "consumer prices": "Inflation",
  "mergers": "M&A", "merger": "M&A", "acquisition": "M&A", "mergers and acquisitions": "M&A", "takeover": "M&A",
  "ipo": "IPOs", "initial public offering": "IPOs", "public offering": "IPOs", "listing": "IPOs",
  "chips": "Semiconductors", "chip": "Semiconductors", "semiconductor": "Semiconductors", "silicon": "Semiconductors",
  "crypto": "Cryptocurrency", "digital assets": "Cryptocurrency", "bitcoin": "Bitcoin", "btc": "Bitcoin",
  "oil": "Crude oil", "wti": "Crude oil", "brent": "Crude oil", "petroleum": "Crude oil",
  "tariff": "Tariffs", "duties": "Tariffs", "import taxes": "Tariffs",
  "housing market": "Housing", "home prices": "Housing", "real estate": "Housing",
  "jobs": "Employment", "unemployment": "Employment", "payrolls": "Employment", "labor market": "Employment",
  "treasuries": "Treasury yields", "yields": "Treasury yields", "10-year": "Treasury yields", "bond yields": "Treasury yields",
  "regional bank": "Regional banks", "regional banking": "Regional banks",
  "private equity": "Private equity", "pe": "Private equity", "buyout": "Private equity",
  "venture capital": "Venture capital", "vc": "Venture capital", "startups": "Venture capital",
  "data center": "Data centers", "datacenter": "Data centers", "data centre": "Data centers",
  "supply chain": "Supply chains", "logistics": "Supply chains",
  "us": "United States", "u.s.": "United States", "usa": "United States", "america": "United States",
  "china": "China", "prc": "China", "eu": "Europe", "european union": "Europe",
};

/** Normalize a free-text tag to its canonical label (controlled vocabulary). */
export function normalizeTag(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (TAG_ALIASES[key]) return TAG_ALIASES[key];
  // Title-case unknown tags so casing never splits a tag in two.
  return raw
    .trim()
    .split(/\s+/)
    .map((w) => (w.length > 3 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function dedupeTags(tags: string[] = []): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    const n = normalizeTag(t);
    const k = n.toLowerCase();
    if (n && !seen.has(k)) {
      seen.add(k);
      out.push(n);
    }
  }
  return out;
}

export const READER_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export const TIME_HORIZONS = ["Breaking", "Short-Term", "Medium-Term", "Long-Term"] as const;
