import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnalysisCard } from "@/components/AnalysisCard";
import { ChatPanel } from "@/components/ChatPanel";
import { ReadmePreview } from "@/components/ReadmePreview";
import type { AnalyzeResult } from "@/lib/repo";

export const Route = createFileRoute("/dashboard")({
  validateSearch: (s: Record<string, unknown>) => ({ url: (s.url as string) ?? "" }),
  head: () => ({
    meta: [
      { title: "Dashboard — RepoMind" },
      { name: "description", content: "AI-generated analysis of your GitHub repository." },
    ],
  }),
  component: Dashboard,
});

const STAGES = [
  "Fetching repository metadata…",
  "Reading README and languages…",
  "Mapping folder structure…",
  "Analyzing architecture…",
  "Generating beginner guide…",
];

function SkeletonLine({ w = "100%" }: { w?: string }) {
  return <div className="h-3 rounded-md bg-primary/10 shimmer" style={{ width: w }} />;
}

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-lg bg-primary/20 shimmer" />
        <div className="h-4 w-32 rounded-md bg-primary/10 shimmer" />
      </div>
      <SkeletonLine />
      <SkeletonLine w="92%" />
      <SkeletonLine w="78%" />
      <SkeletonLine w="85%" />
    </div>
  );
}

function LoadingState() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 animate-fade-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 glass rounded-full px-5 py-2 mb-4">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-mono text-muted-foreground">{STAGES[stage]}</span>
        </div>
        <div className="h-1 w-full max-w-md mx-auto rounded-full bg-muted overflow-hidden">
          <div className="h-full shimmer" style={{ background: "var(--gradient-primary)" }} />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

function Dashboard() {
  const { url } = Route.useSearch();
  const [data, setData] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError("No repository URL provided.");
      return;
    }
    setData(null);
    setError(null);
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Failed");
        setData(json);
      })
      .catch((e) => setError(e.message));
  }, [url]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {error && (
          <div className="mx-auto max-w-2xl px-6 py-32 text-center">
            <h2 className="text-2xl font-semibold mb-2">Couldn't analyze repository</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex rounded-xl px-5 py-2.5 font-medium text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              Try another repo
            </Link>
          </div>
        )}

        {!error && !data && <LoadingState />}

        {data && (
          <div className="mx-auto max-w-6xl px-6 py-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 animate-fade-up">
              <div>
                <p className="text-xs font-mono text-primary mb-2">REPOSITORY ANALYSIS</p>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                  <span className="text-muted-foreground">{data.owner}/</span>
                  <span className="gradient-text">{data.name}</span>
                </h1>
                <a
                  href={data.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
                >
                  {data.url} ↗
                </a>
              </div>
              <Link
                to="/"
                className="self-start sm:self-end glass rounded-xl px-4 py-2 text-sm hover:border-primary/40 transition-colors"
              >
                ← New Analysis
              </Link>
            </div>

            {/* Stats row */}
            <div
              className="flex flex-wrap items-center gap-3 mb-4 animate-fade-up"
              style={{ animationDelay: "40ms" }}
            >
              <span className="glass rounded-full px-3 py-1 text-xs font-mono text-muted-foreground">
                ★ {data.stars.toLocaleString()}
              </span>
              <span className="glass rounded-full px-3 py-1 text-xs font-mono text-muted-foreground">
                ⑂ {data.forks.toLocaleString()} forks
              </span>
              <span className="glass rounded-full px-3 py-1 text-xs font-mono text-muted-foreground">
                {data.issues.toLocaleString()} open issues
              </span>
              <span className="glass rounded-full px-3 py-1 text-xs font-mono text-muted-foreground">
                branch: {data.defaultBranch}
              </span>
              {data.license && (
                <span className="glass rounded-full px-3 py-1 text-xs font-mono text-muted-foreground">
                  {data.license}
                </span>
              )}
            </div>

            {/* Topics */}
            {data.topics.length > 0 && (
              <div
                className="flex flex-wrap gap-2 mb-8 animate-fade-up"
                style={{ animationDelay: "60ms" }}
              >
                {data.topics.slice(0, 10).map((t) => (
                  <span
                    key={t}
                    className="glass rounded-full px-3 py-1 text-xs font-mono text-primary/90 border-primary/30"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Cards grid */}
            <div className="grid lg:grid-cols-2 gap-5">
              <AnalysisCard
                title="Repository Summary"
                subtitle="Purpose · architecture · workflow"
                delay={120}
                expandable
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8M8 17h6" />
                  </svg>
                }
              >
                <p className="text-foreground/90 leading-7">{data.summary}</p>
                {data.readmeExcerpt && <ReadmePreview content={data.readmeExcerpt} />}
              </AnalysisCard>

              <AnalysisCard
                title="Architecture Overview"
                subtitle="How the codebase fits together"
                delay={180}
                expandable
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                }
              >
                <ul className="space-y-3">
                  {data.architecture.map((a) => (
                    <li key={a.title}>
                      <p className="text-foreground font-medium">{a.title}</p>
                      <p>{a.description}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-foreground font-medium mb-1.5 text-xs uppercase tracking-wider">
                    Application Flow
                  </p>
                  <p className="leading-relaxed">{data.applicationFlow}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-foreground font-medium mb-2 text-xs uppercase tracking-wider">
                    Key Folders
                  </p>
                  <ul className="space-y-1.5 font-mono text-xs">
                    {data.importantFolders.map((f) => (
                      <li key={f.path} className="flex gap-3">
                        <span className="text-primary shrink-0 w-28">{f.path}</span>
                        <span className="text-muted-foreground">{f.purpose}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnalysisCard>

              <AnalysisCard
                title="Technologies Used"
                subtitle="Frameworks · languages · tooling"
                delay={220}
                expandable
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                }
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  {(
                    [
                      ["Languages", data.techStack.languages],
                      ["Frontend", data.techStack.frontend],
                      ["Backend", data.techStack.backend],
                      ["Build Tools", data.techStack.buildTools],
                      ["Package Managers", data.techStack.packageManagers],
                      ["Deployment", data.techStack.deployment],
                      ["Testing", data.techStack.testing],
                      ["Databases", data.techStack.databases],
                    ] as const
                  ).map(
                    ([label, items]) =>
                      items.length > 0 && (
                        <div key={label}>
                          <p className="text-[11px] font-mono uppercase tracking-wider text-primary/80 mb-2">
                            {label}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {items.map((t) => (
                              <span
                                key={t}
                                className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-mono text-foreground/90"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ),
                  )}
                </div>
              </AnalysisCard>

              <AnalysisCard
                title="Important Files"
                subtitle="Where to look first"
                delay={260}
                expandable
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                }
              >
                {data.importantFiles.length === 0 ? (
                  <p className="text-muted-foreground italic">
                    No standout config or entry files detected at the root.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {data.importantFiles.map((f) => (
                      <li key={f.path} className="flex gap-3 items-start">
                        <code className="shrink-0 text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                          {f.path}
                        </code>
                        <span className="text-xs leading-relaxed">{f.why}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </AnalysisCard>

              <AnalysisCard
                title="Beginner Guide"
                subtitle="Step-by-step onboarding"
                delay={300}
                expandable
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v8" />
                    <path d="m4.93 10.93 1.41 1.41" />
                    <path d="M2 18h2" />
                    <path d="M20 18h2" />
                    <path d="m19.07 10.93-1.41 1.41" />
                    <path d="M22 22H2" />
                    <path d="m16 6-4 4-4-4" />
                    <path d="M16 18a4 4 0 0 0-8 0" />
                  </svg>
                }
              >
                <ol className="space-y-2.5 list-none">
                  {data.beginnerGuide.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="shrink-0 h-5 w-5 rounded-full text-[11px] font-mono font-semibold flex items-center justify-center text-primary-foreground"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </AnalysisCard>

              <AnalysisCard
                title="Developer Insights"
                subtitle="Scale · maintainability · activity"
                delay={340}
                expandable
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                }
              >
                <dl className="space-y-3">
                  {(
                    [
                      ["Project Scale", data.developerInsights.scale],
                      ["Maintainability", data.developerInsights.maintainability],
                      ["Modularity", data.developerInsights.modularity],
                      ["Collaboration", data.developerInsights.collaboration],
                      ["Activity", data.developerInsights.activity],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[11px] font-mono uppercase tracking-wider text-primary/80">
                        {k}
                      </dt>
                      <dd className="text-foreground/90 mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
              </AnalysisCard>

              <AnalysisCard
                title="Repository Health"
                subtitle="Quality · structure · complexity"
                delay={360}
                expandable
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                }
              >
                <dl className="space-y-3">
                  {(
                    [
                      ["Documentation Quality", data.repositoryHealth.documentationQuality],
                      ["Project Structure", data.repositoryHealth.projectStructure],
                      ["Maintainability Score", data.repositoryHealth.maintainabilityScore],
                      ["Onboarding Difficulty", data.repositoryHealth.onboardingDifficulty],
                      ["Dependency Complexity", data.repositoryHealth.dependencyComplexity],
                      ["Code Organization", data.repositoryHealth.codeOrganization],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[11px] font-mono uppercase tracking-wider text-primary/80">
                        {k}
                      </dt>
                      <dd className="text-foreground/90 mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
              </AnalysisCard>

              <AnalysisCard
                title="Ask RepoMind"
                subtitle="Chat with the repository"
                delay={400}
                className="lg:col-span-2"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
              >
                <ChatPanel repo={data.fullName} />
              </AnalysisCard>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
