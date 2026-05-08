import {
  fetchRepo,
  fetchLanguages,
  fetchReadme,
  fetchTopLevel,
  type GhTreeEntry,
} from "./github.server";

export interface AnalyzeResult {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string;
  stars: number;
  forks: number;
  issues: number;
  defaultBranch: string;
  license: string | null;
  pushedAt: string;
  summary: string;
  architecture: { title: string; description: string }[];
  beginnerGuide: string[];
  importantFolders: { path: string; purpose: string }[];
  technologies: string[];
  readmeExcerpt: string;
}

const FOLDER_PURPOSES: Record<string, string> = {
  src: "Main application source code.",
  app: "Application source — often routes/pages in modern frameworks.",
  lib: "Shared library code and utilities.",
  components: "Reusable UI components.",
  pages: "Route-level page components.",
  routes: "Route definitions and handlers.",
  public: "Static assets served as-is.",
  static: "Static assets.",
  assets: "Images, fonts and other media.",
  styles: "Global stylesheets and theme files.",
  server: "Server-side code and API logic.",
  api: "API endpoints / route handlers.",
  backend: "Backend service code.",
  frontend: "Frontend application code.",
  client: "Client-side application code.",
  tests: "Automated tests.",
  __tests__: "Automated tests.",
  test: "Automated tests.",
  docs: "Project documentation.",
  examples: "Example usages of the library.",
  scripts: "Build, dev, or maintenance scripts.",
  config: "Configuration files.",
  ".github": "GitHub workflows, issue templates, and CI configuration.",
  packages: "Monorepo packages (workspaces).",
  apps: "Monorepo applications.",
  hooks: "Reusable React hooks.",
  utils: "Utility helpers.",
  types: "Shared TypeScript types.",
  models: "Data models / schemas.",
  controllers: "Request controllers (MVC).",
  views: "View templates (MVC).",
  services: "Business logic / external service clients.",
  migrations: "Database migration files.",
  prisma: "Prisma schema and migrations.",
  supabase: "Supabase config, functions, migrations.",
  android: "Android native project.",
  ios: "iOS native project.",
  cmd: "Go command entrypoints.",
  internal: "Go internal packages.",
  pkg: "Reusable Go packages.",
};

const FRONTEND_HINTS = ["src", "app", "components", "pages", "frontend", "client", "web", "ui"];
const BACKEND_HINTS = ["server", "api", "backend", "cmd", "internal", "controllers", "services", "routes"];

function detectTech(repo: { language: string | null }, langs: Record<string, number>, files: GhTreeEntry[]): string[] {
  const tech = new Set<string>();
  Object.keys(langs).forEach((l) => tech.add(l));
  if (repo.language) tech.add(repo.language);

  const names = new Set(files.map((f) => f.path.toLowerCase()));
  const has = (n: string) => names.has(n);

  if (has("package.json")) tech.add("Node.js");
  if (has("tsconfig.json")) tech.add("TypeScript");
  if (has("vite.config.ts") || has("vite.config.js")) tech.add("Vite");
  if (has("next.config.js") || has("next.config.ts") || has("next.config.mjs")) tech.add("Next.js");
  if (has("remix.config.js")) tech.add("Remix");
  if (has("astro.config.mjs") || has("astro.config.ts")) tech.add("Astro");
  if (has("svelte.config.js")) tech.add("Svelte");
  if (has("nuxt.config.ts") || has("nuxt.config.js")) tech.add("Nuxt");
  if (has("tailwind.config.js") || has("tailwind.config.ts")) tech.add("Tailwind CSS");
  if (has("dockerfile") || has("docker-compose.yml")) tech.add("Docker");
  if (has("requirements.txt") || has("pyproject.toml") || has("setup.py")) tech.add("Python");
  if (has("cargo.toml")) tech.add("Rust");
  if (has("go.mod")) tech.add("Go");
  if (has("gemfile")) tech.add("Ruby");
  if (has("pom.xml") || has("build.gradle")) tech.add("Java");
  if (has("composer.json")) tech.add("PHP");
  if (has(".eslintrc") || has(".eslintrc.js") || has(".eslintrc.json") || has("eslint.config.js")) tech.add("ESLint");
  if (has("prisma")) tech.add("Prisma");
  if (has("supabase")) tech.add("Supabase");

  return Array.from(tech).slice(0, 12);
}

function buildArchitecture(files: GhTreeEntry[]): { title: string; description: string }[] {
  const folders = files.filter((f) => f.type === "tree").map((f) => f.path);
  const fileNames = files.filter((f) => f.type === "blob").map((f) => f.path.toLowerCase());
  const arch: { title: string; description: string }[] = [];

  const hasFrontend = folders.some((f) => FRONTEND_HINTS.includes(f.toLowerCase()));
  const hasBackend = folders.some((f) => BACKEND_HINTS.includes(f.toLowerCase()));

  if (fileNames.includes("package.json")) {
    arch.push({
      title: "Node.js Project",
      description: "A package.json at the root defines dependencies and npm scripts — the entry points to running, building, and testing the project.",
    });
  }
  if (hasFrontend && hasBackend) {
    arch.push({
      title: "Full-Stack Layout",
      description: "Frontend and backend code live in separate top-level folders, suggesting a clear split between the user interface and server logic.",
    });
  } else if (hasFrontend) {
    arch.push({
      title: "Frontend Application",
      description: "Source code is organized around UI components and pages — a typical client-side application layout.",
    });
  } else if (hasBackend) {
    arch.push({
      title: "Backend Service",
      description: "The structure focuses on services, routes, or commands — characteristic of a backend or CLI project.",
    });
  }
  if (folders.some((f) => ["packages", "apps"].includes(f.toLowerCase()))) {
    arch.push({
      title: "Monorepo",
      description: "Multiple packages or apps live side-by-side under a single repository, sharing tooling and dependencies.",
    });
  }
  if (folders.some((f) => ["tests", "__tests__", "test"].includes(f.toLowerCase())) || fileNames.some((f) => f.includes(".test.") || f.includes(".spec."))) {
    arch.push({
      title: "Automated Testing",
      description: "Dedicated test files or folders indicate the project ships with automated checks to guard against regressions.",
    });
  }
  if (folders.includes(".github")) {
    arch.push({
      title: "Continuous Integration",
      description: ".github workflows run automated checks on every push and pull request, keeping the main branch healthy.",
    });
  }
  if (arch.length === 0) {
    arch.push({
      title: "Simple Layout",
      description: "A flat structure focused on a small set of source files — easy to read end-to-end.",
    });
  }
  return arch.slice(0, 5);
}

function buildImportantFolders(files: GhTreeEntry[]): { path: string; purpose: string }[] {
  return files
    .filter((f) => f.type === "tree" && !f.path.startsWith("."))
    .slice(0, 8)
    .map((f) => ({
      path: f.path + "/",
      purpose: FOLDER_PURPOSES[f.path.toLowerCase()] ?? "Project module — open it to see its responsibilities.",
    }));
}

function buildBeginnerGuide(repo: { full_name: string }, files: GhTreeEntry[]): string[] {
  const names = new Set(files.map((f) => f.path.toLowerCase()));
  const folders = files.filter((f) => f.type === "tree").map((f) => f.path.toLowerCase());
  const steps: string[] = [];

  steps.push(`Read the README in ${repo.full_name} first — it usually covers what the project does and how to run it.`);

  if (names.has("package.json")) {
    steps.push("Open package.json to see the dependencies and the scripts (dev, build, test) you can run with npm or bun.");
  } else if (names.has("requirements.txt") || names.has("pyproject.toml")) {
    steps.push("Install Python dependencies from requirements.txt or pyproject.toml, then run the project's main entry script.");
  } else if (names.has("go.mod")) {
    steps.push("Run `go mod download` and explore the cmd/ folder for the program's entry point.");
  } else if (names.has("cargo.toml")) {
    steps.push("Use `cargo run` to start the project. The src/main.rs or src/lib.rs file is the entry point.");
  }

  const front = folders.find((f) => FRONTEND_HINTS.includes(f));
  const back = folders.find((f) => BACKEND_HINTS.includes(f));
  if (front && back) {
    steps.push(`Frontend code likely lives in ${front}/, while server-side logic lives in ${back}/.`);
  } else if (front) {
    steps.push(`The ${front}/ folder holds the application source — start with the entry file (often index, main, or App).`);
  } else if (back) {
    steps.push(`The ${back}/ folder holds the service code — find the entry handler and follow its imports.`);
  }

  if (folders.includes("docs")) steps.push("Browse docs/ for deeper documentation on internals.");
  steps.push("Make a small change (a string or console log) to confirm the dev loop works before tackling bigger features.");

  return steps.slice(0, 6);
}

function buildSummary(repo: { full_name: string; description: string | null; stargazers_count: number; language: string | null }, readme: string): string {
  const desc = repo.description?.trim();
  const firstPara = readme
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("#") && !l.startsWith("![") && !l.startsWith("<") && !l.startsWith("[!") && l.length > 60);

  const parts = [
    desc
      ? `${repo.full_name} — ${desc}`
      : `${repo.full_name} is a ${repo.language ?? "software"} project hosted on GitHub.`,
    firstPara ? firstPara.slice(0, 320) : null,
    `It has ${repo.stargazers_count.toLocaleString()} stars on GitHub.`,
  ].filter(Boolean);

  return parts.join(" ");
}

function readmeExcerpt(readme: string): string {
  if (!readme) return "";
  return readme.split("\n").slice(0, 30).join("\n").slice(0, 1200);
}

export async function analyzeRepository(owner: string, name: string, url: string): Promise<AnalyzeResult> {
  const repo = await fetchRepo(owner, name);
  const [langs, readme, files] = await Promise.all([
    fetchLanguages(owner, name),
    fetchReadme(owner, name),
    fetchTopLevel(owner, name, repo.default_branch),
  ]);

  return {
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url || url,
    description: repo.description ?? "",
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    issues: repo.open_issues_count,
    defaultBranch: repo.default_branch,
    license: repo.license?.name ?? null,
    pushedAt: repo.pushed_at,
    summary: buildSummary(repo, readme),
    architecture: buildArchitecture(files),
    beginnerGuide: buildBeginnerGuide(repo, files),
    importantFolders: buildImportantFolders(files),
    technologies: detectTech(repo, langs, files),
    readmeExcerpt: readmeExcerpt(readme),
  };
}

export function buildChatAnswer(repo: AnalyzeResult, question: string): string {
  const q = question.toLowerCase();
  const folders = repo.importantFolders.map((f) => f.path).join(", ");

  if (q.includes("start") || q.includes("begin") || q.includes("first")) {
    return `In ${repo.fullName}, start with the README, then look at these top-level folders: ${folders}. ${repo.beginnerGuide[1] ?? ""}`;
  }
  if (q.includes("test")) {
    const hasTests = repo.architecture.some((a) => a.title.includes("Testing"));
    return hasTests
      ? `${repo.fullName} ships automated tests — look in the tests/ folder or for files ending in .test.* / .spec.*. Check package.json scripts for the exact command.`
      : `${repo.fullName} doesn't have an obvious test folder at the top level. Check the README or package.json scripts for testing instructions.`;
  }
  if (q.includes("deploy") || q.includes("ci")) {
    return `Deployment hints usually live in .github/workflows or a Dockerfile. ${repo.fullName} is on the ${repo.defaultBranch} branch by default.`;
  }
  if (q.includes("architect") || q.includes("structure") || q.includes("organi")) {
    return `${repo.fullName} is organized into: ${folders}. ${repo.architecture[0]?.description ?? ""}`;
  }
  if (q.includes("language") || q.includes("stack") || q.includes("tech")) {
    return `${repo.fullName} uses ${repo.technologies.join(", ")}.`;
  }
  if (q.includes("license")) {
    return repo.license ? `${repo.fullName} is licensed under ${repo.license}.` : `${repo.fullName} doesn't expose a license through the GitHub API — check the repo for a LICENSE file.`;
  }
  if (q.includes("star") || q.includes("popular")) {
    return `${repo.fullName} has ${repo.stars.toLocaleString()} stars and ${repo.forks.toLocaleString()} forks on GitHub.`;
  }
  return `Based on ${repo.fullName}'s structure (${folders}), the answer to "${question.replace(/\?$/, "")}" likely lives in one of those folders. Open the README and the most relevant folder to dig deeper. (This is a heuristic answer — real AI integration is coming soon.)`;
}
