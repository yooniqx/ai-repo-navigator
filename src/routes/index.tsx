import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { parseRepoUrl } from "@/lib/repo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RepoMind — Understand Any GitHub Repository in Minutes" },
      { name: "description", content: "AI-powered tool that explains any GitHub repository — architecture, structure, and beginner guides in seconds." },
      { property: "og:title", content: "RepoMind — Understand Any GitHub Repository in Minutes" },
      { property: "og:description", content: "AI-powered repository analysis for developers." },
    ],
  }),
  component: Index,
});

const EXAMPLES = [
  "https://github.com/facebook/react",
  "https://github.com/vercel/next.js",
  "https://github.com/tanstack/router",
];

function Index() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    const parsed = parseRepoUrl(url);
    if (!parsed) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }
    setLoading(true);
    navigate({ to: "/dashboard", search: { url } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" />
          <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground mb-8 animate-fade-up">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
              AI-powered repo intelligence
            </div>

            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] animate-fade-up">
              Understand Any{" "}
              <span className="gradient-text glow-text">GitHub Repository</span>
              <br className="hidden sm:block" />
              {" "}in Minutes
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "80ms" }}>
              Paste a repo URL and RepoMind generates an instant breakdown — architecture,
              folder structure, tech stack, and a beginner-friendly tour. Built for developers.
            </p>

            <form onSubmit={submit} className="mt-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "160ms" }}>
              <div className="glass gradient-border rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-glow">
                <div className="flex items-center gap-3 flex-1 px-4">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted-foreground shrink-0" fill="currentColor"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.55v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.18.08 1.8 1.21 1.8 1.21 1.04 1.79 2.74 1.27 3.41.97.1-.76.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.48.11-3.08 0 0 .98-.31 3.2 1.18a11 11 0 0 1 5.82 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.6.23 2.78.11 3.08.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.8 1.07.8 2.16v3.21c0 .31.21.66.8.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" /></svg>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    className="flex-1 bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground/60 font-mono"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl px-6 py-3 font-medium text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:scale-100"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {loading ? "Analyzing…" : "Analyze Repository"}
                </button>
              </div>
              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs animate-fade-up" style={{ animationDelay: "240ms" }}>
              <span className="text-muted-foreground mr-1">Try:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setUrl(ex)}
                  className="rounded-full glass px-3 py-1.5 font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {ex.replace("https://github.com/", "")}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { t: "Instant Architecture Map", d: "See how the codebase is organized before reading a single line." },
              { t: "Beginner-Friendly Tour", d: "A guided onboarding path so new contributors ramp up fast." },
              { t: "Ask Anything", d: "Chat with the repo to get answers grounded in its structure." },
            ].map((f, i) => (
              <div key={f.t} className="glass rounded-2xl p-6 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                  <span className="font-mono font-semibold text-primary-foreground">{i + 1}</span>
                </div>
                <h3 className="font-semibold mb-1">{f.t}</h3>
                <p className="text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why RepoMind? */}
        <section id="why" className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-up">
            <p className="text-xs font-mono text-primary mb-3">WHY REPOMIND?</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Built for Developers, Not <span className="gradient-text">Generic AI Chats</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              RepoMind specializes in understanding GitHub repositories and helping developers
              navigate unfamiliar codebases faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { g: "Requires manually pasting context every time", r: "Automatically analyzes the entire repository structure" },
              { g: "Provides broad, generic answers", r: "Gives developer-focused architecture insights" },
              { g: "Struggles with onboarding new contributors", r: "Generates beginner-friendly guidance and tours" },
              { g: "Not repository-aware out of the box", r: "Optimized specifically for GitHub repositories" },
              { g: "Responses can feel unstructured", r: "Organizes summaries into clear developer workflows" },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="glass rounded-2xl p-5 opacity-70 hover:opacity-90 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-6 w-6 rounded-md flex items-center justify-center bg-muted text-muted-foreground text-xs">✕</span>
                    <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">Generic AI</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/40">{row.g}</p>
                </div>

                <div className="glass rounded-2xl p-5 border-primary/30 hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-glow transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="h-6 w-6 rounded-md flex items-center justify-center text-primary-foreground text-xs font-semibold"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      ✓
                    </span>
                    <span className="text-xs font-mono uppercase tracking-wide text-primary">RepoMind</span>
                  </div>
                  <p className="text-sm text-foreground">{row.r}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How RepoMind Works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-up">
            <p className="text-xs font-mono text-primary mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              How <span className="gradient-text">RepoMind</span> Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              From a single GitHub URL to a complete developer-ready breakdown — in seconds.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: "Paste GitHub URL", d: "Drop in any public GitHub repository link and RepoMind takes it from there.", icon: "🔗" },
              { t: "Analyze Structure", d: "We pull metadata, README, languages, and the file tree to map the codebase.", icon: "🔍" },
              { t: "Generate Insights", d: "Architecture, tech stack, and important files are organized into clean cards.", icon: "🧠" },
              { t: "Onboard Faster", d: "Beginner guides and a chat assistant help developers get productive immediately.", icon: "🚀" },
            ].map((s, i) => (
              <div
                key={s.t}
                className="glass rounded-2xl p-6 animate-fade-up hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-glow transition-all duration-300 relative"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="absolute top-4 right-4 text-[10px] font-mono text-muted-foreground">
                  STEP {String(i + 1).padStart(2, "0")}
                </span>
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="font-semibold mb-1.5">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Developer Features */}
        <section id="developer-features" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-up">
            <p className="text-xs font-mono text-primary mb-3">DEVELOPER FEATURES</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Everything You Need to <span className="gradient-text">Decode a Codebase</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Purpose-built tools for the way developers actually explore unfamiliar repositories.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { t: "Repository Analysis", d: "Deep metadata, language breakdown, and project health signals at a glance.", icon: "📊" },
              { t: "Architecture Overview", d: "Detect frontend/backend split, application flow, and folder responsibilities.", icon: "🏗️" },
              { t: "Beginner Guidance", d: "Step-by-step onboarding tailored to the project's actual setup and stack.", icon: "🎓" },
              { t: "Developer-Focused AI", d: "Structured, technical answers — no generic chatbot fluff or vague summaries.", icon: "🤖" },
              { t: "GitHub Integration", d: "Direct connection to public GitHub APIs — no installs, no auth, no friction.", icon: "🐙" },
              { t: "Important Files", d: "Auto-surfaced configs and entry points with explanations of what they do.", icon: "📁" },
            ].map((f, i) => (
              <div
                key={f.t}
                className="glass rounded-2xl p-6 animate-fade-up hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-glow transition-all duration-300"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-1.5">{f.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
