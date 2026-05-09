import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const SUGGESTIONS = [
  { label: "Where is authentication handled?", icon: "🔐" },
  { label: "Explain the frontend structure", icon: "🎨" },
  { label: "What technologies are used?", icon: "🧰" },
  { label: "Where should a beginner start?", icon: "🚀" },
  { label: "Explain backend architecture", icon: "🖧" },
  { label: "How is testing set up?", icon: "🧪" },
];

const STATUS_STAGES = [
  "Repository context loaded",
  "Analyzing project structure",
  "Mapping architecture",
  "Composing developer-focused response",
];

// Typewriter that streams content in chunk-aligned bursts (word/punctuation aware)
function useStreamedContent(full: string, enabled: boolean) {
  const [shown, setShown] = useState(enabled ? "" : full);
  useEffect(() => {
    if (!enabled) {
      setShown(full);
      return;
    }
    let i = 0;
    setShown("");
    let raf = 0;
    let last = performance.now();
    // Tokenize into chunks: words, whitespace, punctuation, newlines
    const chunks = full.match(/(\s+|[^\s]+)/g) ?? [full];
    const tick = (now: number) => {
      // pacing: ~18ms per chunk, longer pause after sentence punctuation
      const prev = chunks[i - 1] ?? "";
      const delay = /[.!?]\s*$/.test(prev) ? 90 : /[,;:]\s*$/.test(prev) ? 45 : 18;
      if (now - last >= delay) {
        i = Math.min(i + 1, chunks.length);
        setShown(chunks.slice(0, i).join(""));
        last = now;
      }
      if (i < chunks.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [full, enabled]);
  return shown;
}

function MarkdownBubble({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground
      prose-h3:text-base prose-h3:mt-0 prose-h3:mb-2 prose-h3:text-primary
      prose-p:my-2 prose-p:text-foreground/90 prose-p:leading-relaxed
      prose-strong:text-foreground prose-strong:font-semibold
      prose-ul:my-2 prose-ul:space-y-1 prose-li:my-0 prose-li:text-foreground/90
      prose-ol:my-2 prose-ol:space-y-1
      prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.8em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-background/70 prose-pre:border prose-pre:border-border/60 prose-pre:rounded-lg prose-pre:text-xs prose-pre:my-2
      prose-blockquote:border-l-primary/50 prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-blockquote:text-xs prose-blockquote:font-mono
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function StatusIndicator() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STATUS_STAGES.length - 1)), 500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex justify-start animate-fade-up">
      <div className="glass rounded-2xl px-4 py-3 max-w-[85%] space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-mono text-primary uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {STATUS_STAGES[stage]}
        </div>
        <div className="flex gap-1.5 items-center">
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "120ms" }} />
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "240ms" }} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ repo, onPick }: { repo: string; onPick: (q: string) => void }) {
  return (
    <div className="animate-fade-up space-y-5 py-2">
      <div className="glass rounded-2xl p-5 border-primary/20">
        <div className="flex items-center gap-2 text-[11px] font-mono text-primary uppercase tracking-wider mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Repository Context Loaded
        </div>
        <h3 className="font-semibold text-foreground mb-1">Ask anything about <span className="font-mono text-primary">{repo}</span></h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          I've indexed this repository's metadata, README, file structure, and detected stack.
          Ask about architecture, where to start, specific folders, or how features are wired together.
        </p>
      </div>

      <div>
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Suggested questions</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => onPick(s.label)}
              className="group glass rounded-xl px-3 py-2.5 text-left text-xs hover:border-primary/50 hover:shadow-glow transition-all animate-fade-up flex items-center gap-2.5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="text-base">{s.icon}</span>
              <span className="text-foreground/90 group-hover:text-foreground transition-colors">{s.label}</span>
              <span className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({ repo }: { repo: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (q: string) => {
    if (!q || loading) return;
    setMessages((m) => [...m, { role: "user", content: q, ts: Date.now() }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, message: q }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer ?? "_Something went wrong._", ts: Date.now() },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "_Network error. Try again._", ts: Date.now() }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(input.trim());
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Scrollable conversation */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-4 scroll-smooth"
        style={{ scrollbarGutter: "stable" }}
      >
        {messages.length === 0 && !loading && <EmptyState repo={repo} onPick={sendMessage} />}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex animate-fade-up ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="shrink-0 mr-2 h-7 w-7 rounded-lg flex items-center justify-center text-primary-foreground text-xs font-bold" style={{ background: "var(--gradient-primary)" }}>
                R
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "glass text-foreground rounded-bl-sm"
              }`}
            >
              {m.role === "assistant" ? <MarkdownBubble content={m.content} /> : <p className="whitespace-pre-wrap">{m.content}</p>}
            </div>
          </div>
        ))}

        {loading && <StatusIndicator />}
      </div>

      {/* Inline suggestions after first response */}
      {messages.length > 0 && !loading && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/40">
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button
              key={s.label}
              onClick={() => sendMessage(s.label)}
              className="text-[11px] glass rounded-full px-3 py-1 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Sticky input bar */}
      <form onSubmit={submit} className="mt-3 sticky bottom-0">
        <div className="glass rounded-2xl p-1.5 flex gap-2 items-center focus-within:border-primary/60 focus-within:shadow-glow transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loading ? "RepoMind is thinking…" : "Ask about this repository…"}
            disabled={loading}
            className="flex-1 bg-transparent rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:scale-100 flex items-center gap-1.5"
            style={{ background: "var(--gradient-primary)" }}
          >
            <span>Send</span>
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/60 mt-1.5 text-center">
          Heuristic mode · real AI integration coming soon
        </p>
      </form>
    </div>
  );
}
