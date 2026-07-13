import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Building2,
  ChevronRight,
  LifeBuoy,
  Mail,
  MessageCircle,
  Minus,
  PackageSearch,
  Phone,
  Send,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import type { Distributor, Industry, NewsArticle, Product, Service, SiteConfig } from '@/lib/data';
import { askChatbot, getChatbotStatus, getDistributors, getIndustries, getNewsArticles, getProducts, getServices } from '@/lib/data';

type NavigateFn = (page: string, param?: string) => void;

type ActionLink = {
  label: string;
  page: string;
  param?: string;
};

type ChatMessage = {
  id: number;
  role: 'bot' | 'user';
  text: string;
  links?: ActionLink[];
};

type KnowledgeItem = {
  title: string;
  type: 'Product' | 'Service' | 'Industry' | 'News' | 'Dealer';
  summary: string;
  keywords: string;
  page: string;
  param?: string;
  productModel?: string;
  productPowerKw?: number;
  productPowerHp?: number;
};

interface ChatbotProps {
  config: SiteConfig;
  onNavigate: NavigateFn;
}

const quickActions = [
  { label: 'Products', prompt: 'Show me your compressor products', icon: PackageSearch },
  { label: 'Service', prompt: 'I need compressor service support', icon: Wrench },
  { label: 'About', prompt: 'I want to know about us', icon: Building2 },
  { label: 'Warranty', prompt: 'Tell me about warranty information', icon: LifeBuoy },
  { label: 'Contact', prompt: 'How can I contact your team?', icon: Mail },
];

const stopWords = new Set([
  'a', 'about', 'an', 'and', 'any', 'are', 'base', 'based', 'can', 'details', 'do', 'for', 'give', 'have', 'how',
  'i', 'in', 'is', 'me', 'of', 'on', 'or', 'our', 'please', 'provide', 'question', 'questions', 'site',
  'tell', 'the', 'this', 'to', 'us', 'want', 'what', 'where', 'with', 'you', 'your',
]);

const allowedShortTokens = new Set(['cfm', 'hp', 'kw']);

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.+-]+/g, ' ').trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/\s+/)
    .filter(word => ((word.length > 2 || allowedShortTokens.has(word)) || /^\d+(\.\d+)?$/.test(word)) && !stopWords.has(word));
}

function compactList(values: string[], limit = 3) {
  return values.filter(Boolean).slice(0, limit).join(', ');
}

function productSummary(product: Product) {
  const pressure = product.pressureMin === product.pressureMax
    ? `${product.pressureMax} kg/cm2(g)`
    : `${product.pressureMin}-${product.pressureMax} kg/cm2(g)`;
  return `${product.model} is a ${product.powerKw} kW compressor with ${product.flowRateCfm} CFM flow and ${pressure} pressure. Key uses include ${compactList(product.applications)}.`;
}

function createKnowledgeBase(
  products: Product[],
  services: Service[],
  industries: Industry[],
  news: NewsArticle[],
  distributors: Distributor[],
) {
  const productItems: KnowledgeItem[] = products.map(product => ({
    title: product.model,
    type: 'Product',
    summary: productSummary(product),
    keywords: [
      product.model,
      product.name,
      product.series,
      product.description,
      product.longDescription,
      product.powerHp,
      product.powerKw,
      product.flowRateCfm,
      product.flowRateM3Min,
      ...product.features,
      ...product.applications,
      ...product.specifications.map(spec => `${spec.label} ${spec.value}`),
    ].join(' '),
    page: 'product-detail',
    param: String(product.id),
    productModel: product.model,
    productPowerKw: product.powerKw,
    productPowerHp: product.powerHp,
  }));

  const serviceItems: KnowledgeItem[] = services.map(service => ({
    title: service.name,
    type: 'Service',
    summary: `${service.name}: ${service.shortDescription} Benefits include ${compactList(service.benefits)}.`,
    keywords: [
      service.name,
      service.shortDescription,
      service.fullDescription,
      ...service.benefits,
      ...service.process.map(step => `${step.title} ${step.description}`),
    ].join(' '),
    page: 'service-detail',
    param: service.slug,
  }));

  const industryItems: KnowledgeItem[] = industries.map(industry => ({
    title: industry.name,
    type: 'Industry',
    summary: `${industry.name}: ${industry.shortDescription} Recommended products include ${compactList(industry.recommendedProducts)}.`,
    keywords: [
      industry.name,
      industry.shortDescription,
      industry.fullDescription,
      ...industry.applications,
      ...industry.recommendedProducts,
      ...industry.challenges.map(challenge => `${challenge.title} ${challenge.solution}`),
    ].join(' '),
    page: 'industry-detail',
    param: industry.slug,
  }));

  const newsItems: KnowledgeItem[] = news.map(article => ({
    title: article.title,
    type: 'News',
    summary: `${article.title}: ${article.excerpt}`,
    keywords: [article.title, article.category, article.excerpt, article.content, article.author].join(' '),
    page: 'news-detail',
    param: article.slug,
  }));

  const distributorItems: KnowledgeItem[] = distributors.map(distributor => ({
    title: `${distributor.city}, ${distributor.state}`,
    type: 'Dealer',
    summary: `${distributor.name} serves ${distributor.city}, ${distributor.state}. Contact ${distributor.contactPerson} at ${distributor.phone}.`,
    keywords: [
      distributor.name,
      distributor.region,
      distributor.contactPerson,
      distributor.city,
      distributor.state,
      distributor.fullAddress,
      distributor.phone,
      distributor.email,
      ...distributor.authorizedProducts,
    ].join(' '),
    page: 'distributors',
  }));

  return [...productItems, ...serviceItems, ...industryItems, ...newsItems, ...distributorItems];
}

function scoreItem(item: KnowledgeItem, tokens: string[]) {
  const text = normalizeText(`${item.title} ${item.type} ${item.keywords}`);
  const textWords = new Set(text.split(/\s+/));
  const title = normalizeText(item.title);
  const titleWords = new Set(title.split(/\s+/));

  return tokens.reduce((score, token) => {
    if (titleWords.has(token) || (token.length > 2 && title.includes(token))) return score + 6;
    if (textWords.has(token)) return score + 2;
    if (token.length > 3 && text.includes(token)) return score + 1;
    return score;
  }, 0);
}

function canonicalModel(value: string) {
  return normalizeText(value).replace(/[^a-z0-9]/g, '');
}

function requestedModel(question: string) {
  const match = normalizeText(question).match(/\b(fas|fsg)\s*-?\s*(\d+[a-z]*)\b/);
  if (!match) return '';
  return `${match[1]}${match[2]}`;
}

function requestedFamily(question: string) {
  const match = normalizeText(question).match(/\b(fas|fsg)\b/);
  return match?.[1].toUpperCase() || '';
}

function requestedPowerKw(question: string) {
  const normalized = normalizeText(question);
  const explicitKw = normalized.match(/\b(\d+(?:\.\d+)?)\s*(kw|kilowatt|kilowatts)\b/);
  if (explicitKw) return Number(explicitKw[1]);

  if (/(compressor|model|fas|fsg)/.test(normalized)) {
    const plainNumber = normalized.match(/\b(\d+(?:\.\d+)?)\b/);
    if (plainNumber) return Number(plainNumber[1]);
  }

  return undefined;
}

function scoreProductIntent(item: KnowledgeItem, question: string, tokens: string[]) {
  let score = scoreItem(item, tokens);
  const askedModel = requestedModel(question);
  const askedFamily = requestedFamily(question);
  const askedPowerKw = requestedPowerKw(question);

  if (askedModel && item.productModel) {
    const model = canonicalModel(item.productModel);
    if (model === askedModel) score += 120;
    else if (model.startsWith(askedModel)) score += 30;
  }

  if (askedFamily && item.productModel?.toUpperCase().startsWith(askedFamily)) {
    score += 18;
  }

  if (typeof askedPowerKw === 'number' && typeof item.productPowerKw === 'number') {
    const difference = Math.abs(item.productPowerKw - askedPowerKw);
    if (difference === 0) score += 90;
    else if (difference <= 1) score += 35;
    else if (difference <= 3) score += 12;
    else score -= Math.min(20, difference);
  }

  return score;
}

function productMatchKind(match: { item: KnowledgeItem; score: number }, question: string) {
  const askedModel = requestedModel(question);
  const askedPowerKw = requestedPowerKw(question);
  const model = match.item.productModel ? canonicalModel(match.item.productModel) : '';

  if (askedModel && model === askedModel) return 'exact-model';
  if (
    typeof askedPowerKw === 'number' &&
    typeof match.item.productPowerKw === 'number' &&
    Math.abs(match.item.productPowerKw - askedPowerKw) === 0
  ) return 'same-kw';
  if (typeof askedPowerKw === 'number') return 'nearest-kw';
  return 'general';
}

function rankedMatches(knowledge: KnowledgeItem[], tokens: string[], type?: KnowledgeItem['type']) {
  return knowledge
    .filter(item => !type || item.type === type)
    .map(item => ({ item, score: scoreItem(item, tokens) }))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score);
}

function rankedProductMatches(knowledge: KnowledgeItem[], question: string, tokens: string[]) {
  return knowledge
    .filter(item => item.type === 'Product')
    .map(item => ({ item, score: scoreProductIntent(item, question, tokens) }))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score);
}

function linksFor(matches: { item: KnowledgeItem; score: number }[], limit = 3) {
  return matches.slice(0, limit).map(match => ({
    label: `Open ${match.item.title}`,
    page: match.item.page,
    param: match.item.param,
  }));
}

function joinSummaries(matches: { item: KnowledgeItem; score: number }[], limit = 2) {
  return matches.slice(0, limit).map(match => match.item.summary).join(' ');
}

function getThinkingMessage(question: string) {
  const normalized = normalizeText(question);
  if (/(service|maintenance|repair|install|installation|spare|parts|breakdown)/.test(normalized)) {
    return 'Checking the right service support for your request...';
  }
  if (/(product|compressor|model|fas|fsg|cfm|kw|hp|pressure|flow|sizing|spec)/.test(normalized)) {
    return 'Reviewing compressor details and matching options...';
  }
  if (/(dealer|distributor|network|city|state|near|location)/.test(normalized)) {
    return 'Looking through dealer and regional support details...';
  }
  if (/(warranty|guarantee|coverage)/.test(normalized)) {
    return 'Checking warranty guidance for you...';
  }
  if (/(about|aout|company|story|mission|vision|profile|who are)/.test(normalized)) {
    return 'Reading the company story and background...';
  }
  if (/(contact|phone|call|email|address|sales)/.test(normalized)) {
    return 'Getting the best contact path for you...';
  }
  return 'Reading the website details and preparing a helpful answer...';
}

function buildAnswer(question: string, config: SiteConfig, knowledge: KnowledgeItem[]): Omit<ChatMessage, 'id' | 'role'> {
  const normalized = normalizeText(question);
  const tokens = tokenize(question);

  if (!tokens.length) {
    return {
      text: 'Ask me about products, compressor sizing, service, warranty, dealers, technical information, or contact details. I can point you to the right page.',
      links: [
        { label: 'Browse products', page: 'products' },
        { label: 'Contact team', page: 'contact' },
      ],
    };
  }

  if (/(about us|aout us|about company|company profile|company story|our story|your story|who are you|who is firstair|who is first air|mission|vision)/.test(normalized)) {
    return {
      text: `${config.company.name} is focused on reliable compressed air solutions. ${config.about.storyShort} The company mission is ${config.about.mission} Its vision is ${config.about.vision}`,
      links: [
        { label: 'About the company', page: 'about-story' },
        { label: 'Company timeline', page: 'about-timeline' },
        { label: 'Contact team', page: 'contact' },
      ],
    };
  }

  if (/(phone|call|contact|email|address|office|sales)/.test(normalized)) {
    return {
      text: `Sure. For sales or a quotation, call ${config.contact.salesPhone}. For factory support, call ${config.contact.factoryPhone}. You can also email ${config.contact.email}. The head office address is ${config.contact.headquarters.address}.`,
      links: [
        { label: 'Open contact form', page: 'contact' },
        { label: 'Dealer network', page: 'distributors' },
      ],
    };
  }

  if (/(warranty|guarantee|support coverage)/.test(normalized)) {
    return {
      text: 'For warranty questions, the best next step is to check the warranty information page and share your compressor model or serial details with the support team. That helps them confirm the exact coverage and service process.',
      links: [
        { label: 'Warranty information', page: 'warranty' },
        { label: 'Ask support', page: 'contact' },
      ],
    };
  }

  if (/(service|maintenance|repair|install|installation|spare|parts|breakdown|amc|support)/.test(normalized)) {
    const serviceMatches = rankedMatches(knowledge, tokens, 'Service');

    if (serviceMatches.length) {
      return {
        text: `Yes, we can help with that. ${joinSummaries(serviceMatches)} If your compressor is down or needs scheduled support, send the machine model, location, and issue details so the team can respond properly.`,
        links: [
          ...linksFor(serviceMatches),
          { label: 'Request service', page: 'contact' },
        ],
      };
    }

    return {
      text: 'For service support, please share your compressor model, site location, running hours, and issue. The team can help with installation, maintenance, repair, and support requests.',
      links: [
        { label: 'View services', page: 'services' },
        { label: 'Request service', page: 'contact' },
      ],
    };
  }

  if (/(dealer|distributor|network|near|region|city|state|location)/.test(normalized)) {
    const dealerMatches = rankedMatches(knowledge, tokens, 'Dealer');

    if (dealerMatches.length) {
      return {
        text: `There is dealer information that matches your request. ${joinSummaries(dealerMatches)} You can open the dealer network page for the complete list and contact details.`,
        links: [
          { label: 'Dealer network', page: 'distributors' },
          { label: 'Contact team', page: 'contact' },
        ],
      };
    }

    return {
      text: 'You can check the dealer network page for regional distributor details. If you tell the team your city and requirement, they can guide you to the right contact.',
      links: [
        { label: 'Dealer network', page: 'distributors' },
        { label: 'Ask for dealer help', page: 'contact' },
      ],
    };
  }

  if (/(technical|pressure|flow|cfm|kw|hp|sizing|installation|specification|specs|product|compressor|model|fas|fsg)/.test(normalized)) {
    const productMatches = rankedProductMatches(knowledge, question, tokens);

    if (/(small|workshop|garage|light|compact)/.test(normalized)) {
      const smallProducts = knowledge
        .filter(item => item.type === 'Product' && typeof item.productPowerKw === 'number' && item.productPowerKw <= 11)
        .map(item => ({ item, score: item.productPowerKw || 0 }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);

      if (smallProducts.length) {
        return {
          text: `For a small workshop, start with a lower-kW FAS compressor and confirm the required pressure and CFM before final selection. ${joinSummaries(smallProducts, 2)} If your air demand is higher or multiple tools run together, the team can help size it correctly.`,
          links: [
            ...linksFor(smallProducts, 2),
            { label: 'Request sizing help', page: 'contact' },
          ],
        };
      }
    }

    if (productMatches.length) {
      const bestMatch = productMatches[0];
      const exactOrPowerMatch = bestMatch.score >= 80;

      if (exactOrPowerMatch) {
        const matchKind = productMatchKind(bestMatch, question);
        const intro = matchKind === 'exact-model'
          ? `${bestMatch.item.title} is available.`
          : matchKind === 'same-kw'
            ? `I found an available ${bestMatch.item.productPowerKw} kW compressor for your requirement: ${bestMatch.item.title}.`
            : `I found the closest available compressor for your requirement: ${bestMatch.item.title}.`;

        return {
          text: `${intro} ${bestMatch.item.summary} If you want a quotation or confirmation for your application, share your required pressure, running hours, and usage details with the team.`,
          links: [
            { label: `View ${bestMatch.item.title}`, page: bestMatch.item.page, param: bestMatch.item.param },
            { label: 'Request quote', page: 'contact' },
          ],
        };
      }

      return {
        text: `Based on your requirement, these compressor details look relevant: ${joinSummaries(productMatches, 3)} For correct selection, compare required pressure, air flow, duty cycle, and application.`,
        links: [
          ...linksFor(productMatches),
          { label: 'Technical information', page: 'technical' },
        ],
      };
    }

    return {
      text: 'For compressor selection, start with required pressure, CFM or air demand, duty cycle, and your application. You can browse the product range or open technical information for more guidance.',
      links: [
        { label: 'Browse products', page: 'products' },
        { label: 'Technical information', page: 'technical' },
      ],
    };
  }

  const matches = rankedMatches(knowledge, tokens).slice(0, 4);

  if (matches.length) {
    const top = matches.slice(0, 3);
    return {
      text: `I can help with that. ${top.map(match => match.item.summary).join(' ')} I have added the most useful page links below so you can continue from here.`,
      links: linksFor(top),
    };
  }

  return {
    text: 'I want to guide you correctly. Please share a little more detail, such as compressor model, required CFM, pressure, service issue, city, or application. You can also use the links below to reach the right team quickly.',
    links: [
      { label: 'Products', page: 'products' },
      { label: 'Services', page: 'services' },
      { label: 'Contact', page: 'contact' },
    ],
  };
}

function delay(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

export default function Chatbot({ config, onNavigate }: ChatbotProps) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Reading the website details and preparing a helpful answer...');
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiChecked, setAiChecked] = useState(false);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'bot',
      text: `Hi, I am the ${config.company.name} assistant. Ask me about products, service, warranty, technical details, dealers, or contact information.`,
      links: [
        { label: 'Browse products', page: 'products' },
        { label: 'Request quote', page: 'contact' },
      ],
    },
  ]);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getProducts().catch(() => [] as Product[]),
      getServices().catch(() => [] as Service[]),
      getIndustries().catch(() => [] as Industry[]),
      getNewsArticles().catch(() => [] as NewsArticle[]),
      getDistributors().catch(() => [] as Distributor[]),
    ]).then(([products, services, industries, news, distributors]) => {
      if (alive) setKnowledge(createKnowledgeBase(products, services, industries, news, distributors));
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    getChatbotStatus()
      .then(status => {
        if (!alive) return;
        setAiConfigured(Boolean(status.configured));
        setAiChecked(true);
      })
      .catch(() => {
        if (!alive) return;
        setAiConfigured(false);
        setAiChecked(true);
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, minimized]);

  const statusText = useMemo(() => {
    if (!aiChecked) return 'Checking AI connection';
    if (aiConfigured) return 'OpenRouter AI ready';
    if (!knowledge.length) return 'Loading site details';
    return 'Site assistant ready';
  }, [aiChecked, aiConfigured, knowledge.length]);

  const navigateLink = (link: ActionLink) => {
    onNavigate(link.page, link.param);
    setOpen(false);
  };

  const askQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    const userMessage: ChatMessage = { id: Date.now(), role: 'user', text: trimmed };
    const history = messages.slice(-8).map(message => ({ role: message.role, text: message.text }));

    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setLoadingMessage(getThinkingMessage(trimmed));
    setLoading(true);

    try {
      if (!aiConfigured) {
        throw new Error('AI is not configured');
      }
      const [aiAnswer] = await Promise.all([
        askChatbot(trimmed, history),
        delay(2100 + Math.round(Math.random() * 900)),
      ]);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: aiAnswer.answer,
        links: aiAnswer.links,
      }]);
    } catch {
      setAiConfigured(false);
      await delay(500);
      const fallbackAnswer = buildAnswer(trimmed, config, knowledge);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', ...fallbackAnswer }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    askQuestion(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70] print:hidden">
      {open && (
        <section className={`mb-4 w-[calc(100vw-2.5rem)] max-w-[390px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 ${minimized ? 'h-auto' : ''}`}>
          <header className="bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-600">
                  <Bot className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black">Intelligent Assistant</h2>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-200">
                    <Sparkles className="h-3 w-3" />
                    {statusText}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setMinimized(value => !value)} className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Minimize chatbot">
                  <Minus className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setOpen(false)} className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Close chatbot">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          {!minimized && (
            <>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 bg-slate-50 p-3">
                {quickActions.map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => askQuestion(action.prompt)}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-xs font-black text-slate-800 hover:border-red-200 hover:bg-red-50"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-red-600" />
                      <span className="truncate">{action.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="h-[360px] space-y-3 overflow-y-auto bg-white p-4">
                {messages.map(message => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[86%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-red-600 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700'
                    }`}>
                      <p>{message.text}</p>
                      {message.links && message.links.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {message.links.map(link => (
                            <button
                              key={`${link.label}-${link.page}-${link.param || ''}`}
                              type="button"
                              onClick={() => navigateLink(link)}
                              className="flex w-full items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-left text-xs font-black text-red-700 shadow-sm ring-1 ring-red-100 hover:bg-red-50"
                            >
                              <span className="line-clamp-1">{link.label}</span>
                              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500">
                      {loadingMessage}
                    </div>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-100 bg-white p-3">
                <input
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  placeholder="Ask about products, services, dealers..."
                  className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
                <button type="submit" disabled={loading} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60" aria-label="Send message">
                  <Send className="h-4 w-4" />
                </button>
              </form>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-bold text-slate-500">
                <a href={`tel:${config.contact.salesPhone}`} className="flex items-center gap-1.5 hover:text-red-700">
                  <Phone className="h-3 w-3" />
                  Call sales
                </a>
                <a href={`mailto:${config.contact.email}`} className="flex items-center gap-1.5 hover:text-red-700">
                  <Mail className="h-3 w-3" />
                  Email team
                </a>
              </div>
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen(value => !value);
          setMinimized(false);
        }}
        className="ml-auto flex h-15 w-15 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-950/30 ring-4 ring-white transition hover:bg-slate-950"
        aria-label="Open intelligent assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  );
}
