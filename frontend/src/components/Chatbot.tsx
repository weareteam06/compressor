import { SiteText } from '@/lib/SiteText';
import { useEffect, useRef, useState } from 'react';
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
import type { SiteConfig } from '@/lib/data';
import { askChatbot, getChatbotStatus } from '@/lib/data';

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

interface ChatbotProps {
  config: SiteConfig;
  onNavigate: NavigateFn;
}

export default function Chatbot({ config, onNavigate }: ChatbotProps) {
  const { chatbot: copy, quickActions } = config.publicContent;
  const actionIcons: Record<string, React.ElementType> = { PackageSearch, Wrench, Building2, LifeBuoy, Mail };
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const loadingMessage = copy.thinking;
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiChecked, setAiChecked] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'bot',
      text: copy.greeting.replace('{company}', config.company.name),
      links: copy.greetingLinks,
    },
  ]);
  const messageEndRef = useRef<HTMLDivElement | null>(null);



  useEffect(() => {
    let alive = true;
    getChatbotStatus()
      .then(status => {
        if (!alive) return;
        setAiConfigured(Boolean(status));
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

  const statusText = !aiChecked ? copy.checking : aiConfigured ? copy.ready : copy.offline;

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

    setLoading(true);

    try {
      const aiAnswer = await askChatbot(trimmed, history);
      setAiConfigured(true);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: aiAnswer.answer,
        links: aiAnswer.links,
      }]);
    } catch {
      setAiConfigured(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: copy.unavailable }]);
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
                  <h2 className="truncate text-sm font-black"><SiteText section="Chatbot" name="intelligent_assistant" /></h2>
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
                  const Icon = actionIcons[action.icon] || MessageCircle;
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
                  <Phone className="h-3 w-3" />{" "}<SiteText section="Chatbot" name="call_sales" />{" "}</a>
                <a href={`mailto:${config.contact.email}`} className="flex items-center gap-1.5 hover:text-red-700">
                  <Mail className="h-3 w-3" />{" "}<SiteText section="Chatbot" name="email_team" />{" "}</a>
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
