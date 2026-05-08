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
      </main>

      <Footer />
    </div>
  );
}
