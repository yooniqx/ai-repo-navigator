import {
  fetchRepo,
  fetchLanguages,
  fetchReadme,
  fetchTopLevel,
  type GhTreeEntry,
  type GhRepo,
} from "./github.server";

export interface TechStack {
  languages: string[];
  frontend: string[];
  backend: string[];
  buildTools: string[];
  packageManagers: string[];
  deployment: string[];
  testing: string[];
  databases: string[];
}

export interface ImportantFile {
  path: string;
  why: string;
}

export interface DeveloperInsights {
  scale: string;
  maintainability: string;
  modularity: string;
  collaboration: string;
  activity: string;
}

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
  createdAt: string;
  topics: string[];
  summary: string;
  architecture: { title: string; description: string }[];
  applicationFlow: string;
  beginnerGuide: string[];
  importantFolders: { path: string; purpose: string }[];
  importantFiles: ImportantFile[];
  technologies: string[];
  techStack: TechStack;
  developerInsights: DeveloperInsights;
  readmeExcerpt: string;
}

const FOLDER_PURPOSES: Record<string, string> = {
  src: "Main application source code — the heart of the project where most logic lives.",
  app: "Application source — typically routes/pages in modern frameworks like Next.js or Expo.",
  lib: "Shared library code, utilities, and core helpers reused across modules.",
  components: "Reusable UI components — building blocks for the interface.",
  pages: "Route-level page components mapped to URLs.",
  routes: "Route definitions and request handlers.",
  public: "Static assets served as-is (favicons, robots.txt, images).",
  static: "Static, versioned assets bundled with the app.",
  assets: "Images, fonts, and other media imported by source code.",
  styles: "Global stylesheets, themes, and CSS variables.",
  server: "Server-side code, API logic, and request handlers.",
  api: "API endpoints and route handlers exposed to clients.",
  backend: "Backend service code — business logic, persistence, integrations.",
  frontend: "Frontend application code — UI, state, and client-side routing.",
  client: "Client-side application code consumed by browsers.",
  tests: "Automated unit, integration, or end-to-end tests.",
  __tests__: "Co-located automated tests (Jest convention).",
  test: "Automated tests for the project.",
  docs: "Project documentation, guides, and references.",
  examples: "Example usages and demos of the library.",
  scripts: "Build, dev, deploy, or maintenance scripts.",
  config: "Configuration files for tooling and environments.",
  ".github": "GitHub workflows, issue templates, and CI configuration.",
  packages: "Monorepo packages (workspaces) sharing tooling.",
  apps: "Monorepo applications, each a deployable unit.",
  hooks: "Reusable React hooks encapsulating logic.",
  utils: "Utility helpers and pure functions.",
  types: "Shared TypeScript types and interfaces.",
  models: "Data models, schemas, and ORM entities.",
  controllers: "Request controllers (MVC) — translate HTTP into actions.",
  views: "View templates (MVC) — render server-side HTML.",
  services: "Business logic and external service clients.",
  migrations: "Database migration files tracking schema changes.",
  prisma: "Prisma schema and migrations.",
  supabase: "Supabase config, edge functions, and migrations.",
  android: "Android native project (React Native / Expo).",
  ios: "iOS native project (React Native / Expo).",
  cmd: "Go command entrypoints (main packages).",
  internal: "Go internal packages (private to the module).",
  pkg: "Reusable Go packages exposed to consumers.",
};

const FILE_PURPOSES: Record<string, string> = {
  "package.json": "Defines Node dependencies, scripts (dev/build/test), and project metadata. Start here to understand how to run the project.",
  "package-lock.json": "Locks exact npm dependency versions for reproducible installs.",
  "bun.lockb": "Locks Bun dependency versions — the project uses Bun as its package manager.",
  "yarn.lock": "Locks Yarn dependency versions — the project uses Yarn.",
  "pnpm-lock.yaml": "Locks pnpm dependency versions — the project uses pnpm.",
  "readme.md": "Primary project documentation — read this first.",
  "tsconfig.json": "TypeScript compiler options and path aliases.",
  "vite.config.ts": "Vite build configuration — plugins, aliases, server options.",
  "vite.config.js": "Vite build configuration — plugins, aliases, server options.",
  "next.config.js": "Next.js configuration — routing, build, and runtime behavior.",
  "next.config.ts": "Next.js configuration — routing, build, and runtime behavior.",
  "tailwind.config.js": "Tailwind CSS theme and plugin configuration.",
  "tailwind.config.ts": "Tailwind CSS theme and plugin configuration.",
  "postcss.config.js": "PostCSS plugin configuration (often paired with Tailwind).",
  "eslint.config.js": "ESLint rules for code style and quality.",
  ".eslintrc.json": "ESLint rules for code style and quality.",
  "prettier.config.js": "Prettier formatting rules.",
  ".prettierrc": "Prettier formatting rules.",
  "dockerfile": "Container image definition for building and running the app.",
  "docker-compose.yml": "Multi-container orchestration for local dev or deploy.",
  "requirements.txt": "Python dependencies — install with pip.",
  "pyproject.toml": "Modern Python project metadata and dependencies.",
  "setup.py": "Legacy Python package definition.",
  "go.mod": "Go module definition and dependencies.",
  "cargo.toml": "Rust crate manifest — dependencies and build config.",
  "gemfile": "Ruby dependencies managed by Bundler.",
  "pom.xml": "Maven build configuration for Java projects.",
  "build.gradle": "Gradle build configuration for Java/Kotlin projects.",
  "composer.json": "PHP dependencies managed by Composer.",
  ".env.example": "Template for required environment variables — copy to .env.",
  "makefile": "Make targets for common dev tasks.",
  "vercel.json": "Vercel deployment configuration.",
  "netlify.toml": "Netlify deployment configuration.",
  "wrangler.toml": "Cloudflare Workers deployment configuration.",
  "wrangler.jsonc": "Cloudflare Workers deployment configuration.",
  "server.js": "Custom server entry point — likely Express or Node HTTP server.",
  "server.ts": "Custom server entry point — likely Express or Node HTTP server.",
  "app.js": "Application entry — often the Express app or main module.",
  "app.ts": "Application entry — often the Express app or main module.",
  "index.js": "Project entry point — execution starts here.",
  "index.ts": "Project entry point — execution starts here.",
  "main.py": "Python entry script — execution starts here.",
  "main.go": "Go entry point for the main package.",
  "main.rs": "Rust binary entry point.",
  "license": "Legal terms governing use, modification, and distribution.",
};

const FRONTEND_HINTS = ["src", "app", "components", "pages", "frontend", "client", "web", "ui"];
const BACKEND_HINTS = ["server", "api", "backend", "cmd", "internal", "controllers", "services", "routes"];

function lc(s: string) {
  return s.toLowerCase();
}

function buildTechStack(repo: GhRepo, langs: Record<string, number>, files: GhTreeEntry[]): TechStack {
  const names = new Set(files.map((f) => lc(f.path)));
  const folders = new Set(files.filter((f) => f.type === "tree").map((f) => lc(f.path)));
  const has = (n: string) => names.has(n);
  const hasFolder = (n: string) => folders.has(n);

  const stack: TechStack = {
    languages: Object.keys(langs).length ? Object.keys(langs) : repo.language ? [repo.language] : [],
    frontend: [],
    backend: [],
    buildTools: [],
    packageManagers: [],
    deployment: [],
    testing: [],
    databases: [],
  };

  // Frontend
  if (has("next.config.js") || has("next.config.ts") || has("next.config.mjs")) stack.frontend.push("Next.js");
  if (has("nuxt.config.ts") || has("nuxt.config.js")) stack.frontend.push("Nuxt");
  if (has("astro.config.mjs") || has("astro.config.ts")) stack.frontend.push("Astro");
  if (has("svelte.config.js")) stack.frontend.push("SvelteKit");
  if (has("remix.config.js")) stack.frontend.push("Remix");
  if (has("angular.json")) stack.frontend.push("Angular");
  if (has("vue.config.js")) stack.frontend.push("Vue");
  if (has("expo.json") || has("app.json")) stack.frontend.push("Expo / React Native");
  if (has("tailwind.config.js") || has("tailwind.config.ts")) stack.frontend.push("Tailwind CSS");
  if (hasFolder("components") && (stack.languages.includes("TypeScript") || stack.languages.includes("JavaScript"))) {
    if (!stack.frontend.some((f) => /next|nuxt|astro|svelte|remix|angular|vue|expo/i.test(f))) {
      stack.frontend.push("React (likely)");
    }
  }

  // Backend
  if (has("server.js") || has("server.ts")) stack.backend.push("Node.js server");
  if (hasFolder("api") || hasFolder("routes")) stack.backend.push("API routes");
  if (has("requirements.txt") || has("pyproject.toml")) stack.backend.push("Python backend");
  if (has("manage.py")) stack.backend.push("Django");
  if (has("flask")) stack.backend.push("Flask");
  if (has("go.mod")) stack.backend.push("Go service");
  if (has("cargo.toml")) stack.backend.push("Rust binary");
  if (has("gemfile")) stack.backend.push("Ruby on Rails (likely)");
  if (has("pom.xml") || has("build.gradle")) stack.backend.push("Java / JVM");
  if (has("composer.json")) stack.backend.push("PHP");

  // Build tools
  if (has("vite.config.ts") || has("vite.config.js")) stack.buildTools.push("Vite");
  if (has("webpack.config.js")) stack.buildTools.push("Webpack");
  if (has("rollup.config.js")) stack.buildTools.push("Rollup");
  if (has("esbuild.config.js")) stack.buildTools.push("esbuild");
  if (has("turbo.json")) stack.buildTools.push("Turborepo");
  if (has("nx.json")) stack.buildTools.push("Nx");
  if (has("tsconfig.json")) stack.buildTools.push("TypeScript");
  if (has("babel.config.js") || has(".babelrc")) stack.buildTools.push("Babel");

  // Package managers
  if (has("package.json")) stack.packageManagers.push("npm");
  if (has("bun.lockb") || has("bun.lock")) stack.packageManagers.push("Bun");
  if (has("yarn.lock")) stack.packageManagers.push("Yarn");
  if (has("pnpm-lock.yaml")) stack.packageManagers.push("pnpm");
  if (has("requirements.txt")) stack.packageManagers.push("pip");
  if (has("pyproject.toml")) stack.packageManagers.push("Poetry / uv");
  if (has("cargo.toml")) stack.packageManagers.push("Cargo");
  if (has("go.mod")) stack.packageManagers.push("Go modules");

  // Deployment
  if (has("dockerfile")) stack.deployment.push("Docker");
  if (has("docker-compose.yml") || has("docker-compose.yaml")) stack.deployment.push("Docker Compose");
  if (has("vercel.json")) stack.deployment.push("Vercel");
  if (has("netlify.toml")) stack.deployment.push("Netlify");
  if (has("wrangler.toml") || has("wrangler.jsonc")) stack.deployment.push("Cloudflare Workers");
  if (has("fly.toml")) stack.deployment.push("Fly.io");
  if (has("railway.json")) stack.deployment.push("Railway");
  if (hasFolder(".github")) stack.deployment.push("GitHub Actions");

  // Testing
  if (has("vitest.config.ts") || has("vitest.config.js")) stack.testing.push("Vitest");
  if (has("jest.config.js") || has("jest.config.ts")) stack.testing.push("Jest");
  if (has("playwright.config.ts") || has("playwright.config.js")) stack.testing.push("Playwright");
  if (has("cypress.config.ts") || has("cypress.config.js")) stack.testing.push("Cypress");
  if (hasFolder("tests") || hasFolder("__tests__") || hasFolder("test")) stack.testing.push("Test suite present");

  // Databases (heuristic from configs/folders)
  if (hasFolder("prisma") || has("prisma")) stack.databases.push("Prisma");
  if (hasFolder("supabase")) stack.databases.push("Supabase");
  if (hasFolder("migrations")) stack.databases.push("SQL migrations");
  if (has("knexfile.js")) stack.databases.push("Knex");
  if (has("drizzle.config.ts") || has("drizzle.config.js")) stack.databases.push("Drizzle ORM");
  if (has("mongoose")) stack.databases.push("MongoDB / Mongoose");

  return stack;
}

function buildTechnologiesFlat(stack: TechStack, repo: GhRepo): string[] {
  const all = new Set<string>();
  [stack.languages, stack.frontend, stack.backend, stack.buildTools, stack.packageManagers, stack.deployment, stack.testing, stack.databases].forEach((arr) =>
    arr.forEach((t) => all.add(t)),
  );
  if (repo.language) all.add(repo.language);
  return Array.from(all).slice(0, 16);
}

function buildArchitecture(files: GhTreeEntry[], stack: TechStack): { title: string; description: string }[] {
  const folders = files.filter((f) => f.type === "tree").map((f) => lc(f.path));
  const fileNames = files.filter((f) => f.type === "blob").map((f) => lc(f.path));
  const has = (n: string) => fileNames.includes(n);
  const arch: { title: string; description: string }[] = [];

  const hasFrontend = folders.some((f) => FRONTEND_HINTS.includes(f)) || stack.frontend.length > 0;
  const hasBackend = folders.some((f) => BACKEND_HINTS.includes(f)) || stack.backend.length > 0;

  if (hasFrontend && hasBackend) {
    arch.push({
      title: "Full-Stack Architecture",
      description: `Frontend (${stack.frontend[0] ?? "client UI"}) and backend (${stack.backend[0] ?? "server logic"}) live side-by-side. Requests flow from the UI to API routes/services, which return JSON consumed by the client.`,
    });
  } else if (hasFrontend) {
    arch.push({
      title: "Client-Side Application",
      description: `A frontend-only project organized around UI components and pages${stack.frontend.length ? `, built with ${stack.frontend.join(", ")}` : ""}. State and routing are handled in the browser.`,
    });
  } else if (hasBackend) {
    arch.push({
      title: "Backend Service",
      description: `Service-oriented layout focused on routes, controllers, or commands${stack.backend.length ? ` (${stack.backend.join(", ")})` : ""}. The entry point boots an HTTP server or CLI.`,
    });
  } else {
    arch.push({
      title: "Library / Utility",
      description: "No clear client/server split — likely a reusable library, CLI, or single-purpose module.",
    });
  }

  if (folders.some((f) => ["packages", "apps"].includes(f))) {
    arch.push({
      title: "Monorepo Layout",
      description: "Multiple packages or apps share tooling under one repo. Each workspace is a self-contained unit; root configs propagate down.",
    });
  }

  if (has("package.json")) {
    arch.push({
      title: "Node.js Configuration",
      description: "package.json defines dependencies and scripts. tsconfig.json (if present) configures TypeScript paths and strictness. Lockfiles pin exact versions.",
    });
  }

  if (folders.includes("api") || folders.includes("routes") || folders.includes("server")) {
    arch.push({
      title: "API / Server Layer",
      description: "HTTP endpoints live in api/, routes/, or server/. Each file typically maps to a URL and handles its own request/response cycle.",
    });
  }

  if (folders.some((f) => ["tests", "__tests__", "test"].includes(f)) || fileNames.some((f) => f.includes(".test.") || f.includes(".spec."))) {
    arch.push({
      title: "Automated Testing",
      description: `Test suite present${stack.testing.length ? ` (${stack.testing.join(", ")})` : ""}. CI likely runs these on every PR to guard against regressions.`,
    });
  }

  if (folders.includes(".github")) {
    arch.push({
      title: "Continuous Integration",
      description: ".github/workflows defines automated checks (build, test, lint, deploy) triggered by pushes and pull requests.",
    });
  }

  return arch.slice(0, 6);
}

function buildApplicationFlow(stack: TechStack, files: GhTreeEntry[]): string {
  const folders = files.filter((f) => f.type === "tree").map((f) => lc(f.path));
  const hasFrontend = folders.some((f) => FRONTEND_HINTS.includes(f)) || stack.frontend.length > 0;
  const hasBackend = folders.some((f) => BACKEND_HINTS.includes(f)) || stack.backend.length > 0;

  if (hasFrontend && hasBackend) {
    return "User loads the UI → frontend renders components and routes → user actions hit API endpoints → backend processes requests, talks to data sources, and returns JSON → frontend updates state and re-renders.";
  }
  if (hasFrontend) {
    return "Browser loads the entry HTML → bundler-built JavaScript hydrates the app → routes render pages → client-side state drives the UI. No backend in this repo.";
  }
  if (hasBackend) {
    return "Process starts at the entry file → server initializes and registers routes/handlers → incoming requests are dispatched to controllers → responses flow back to clients.";
  }
  return "Entry file initializes the module → exported APIs are consumed by importers. There's no long-running runtime — it's a library or script.";
}

function buildImportantFolders(files: GhTreeEntry[]): { path: string; purpose: string }[] {
  return files
    .filter((f) => f.type === "tree" && !f.path.startsWith("."))
    .slice(0, 8)
    .map((f) => ({
      path: f.path + "/",
      purpose: FOLDER_PURPOSES[lc(f.path)] ?? "Project module — open it to see its responsibilities.",
    }));
}

function buildImportantFiles(files: GhTreeEntry[]): ImportantFile[] {
  const blobs = files.filter((f) => f.type === "blob");
  const out: ImportantFile[] = [];
  const seen = new Set<string>();

  // priority order
  const priority = [
    "readme.md", "package.json", "requirements.txt", "pyproject.toml", "go.mod", "cargo.toml",
    "tsconfig.json", "vite.config.ts", "vite.config.js", "next.config.js", "next.config.ts",
    "tailwind.config.ts", "tailwind.config.js",
    "server.ts", "server.js", "app.ts", "app.js", "index.ts", "index.js",
    "main.py", "main.go", "main.rs",
    "dockerfile", "docker-compose.yml", "vercel.json", "netlify.toml", "wrangler.jsonc", "wrangler.toml",
    ".env.example", "makefile", "license",
  ];

  for (const p of priority) {
    const match = blobs.find((b) => lc(b.path) === p);
    if (match && !seen.has(match.path)) {
      out.push({ path: match.path, why: FILE_PURPOSES[p] ?? "Notable project file." });
      seen.add(match.path);
    }
  }

  return out.slice(0, 10);
}

function buildBeginnerGuide(repo: GhRepo, files: GhTreeEntry[], stack: TechStack): string[] {
  const names = new Set(files.map((f) => lc(f.path)));
  const folders = files.filter((f) => f.type === "tree").map((f) => lc(f.path));
  const steps: string[] = [];

  steps.push(`Read README.md in ${repo.full_name} — it usually explains what the project does, who it's for, and how to run it locally.`);

  if (names.has("package.json")) {
    const pm = stack.packageManagers.find((p) => p !== "npm") ?? "npm";
    steps.push(`Open package.json to inspect dependencies and scripts. Install with \`${pm.toLowerCase()} install\` and start with the dev script (typically \`${pm.toLowerCase()} run dev\`).`);
  } else if (names.has("requirements.txt") || names.has("pyproject.toml")) {
    steps.push("Create a virtual environment, install dependencies (pip install -r requirements.txt or poetry install), then run the main entry script.");
  } else if (names.has("go.mod")) {
    steps.push("Run `go mod download`, then explore cmd/ or main.go for the entry point. `go run .` boots the program.");
  } else if (names.has("cargo.toml")) {
    steps.push("Use `cargo run` to build and execute. src/main.rs (binary) or src/lib.rs (library) is the entry.");
  }

  const entryFile = ["src/index.ts", "src/index.tsx", "src/main.ts", "src/main.tsx", "src/app.tsx", "index.js", "main.py"].find((f) => names.has(lc(f)));
  if (entryFile) {
    steps.push(`Open the entry file (\`${entryFile}\`) and follow its imports outward — this is the fastest way to map the code.`);
  }

  const front = folders.find((f) => FRONTEND_HINTS.includes(f));
  const back = folders.find((f) => BACKEND_HINTS.includes(f));
  if (front && back) {
    steps.push(`Explore ${front}/ for UI code and ${back}/ for server logic. Trace one feature end-to-end to understand how they connect.`);
  } else if (front) {
    steps.push(`The ${front}/ folder holds the application — look for components/, pages/, or routes/ subfolders to understand the UI structure.`);
  } else if (back) {
    steps.push(`The ${back}/ folder holds the service — find the route registrations and follow handlers to controllers/services.`);
  }

  if (folders.includes("docs")) steps.push("Browse docs/ for deeper explanations of internals and design decisions.");
  if (names.has(".env.example")) steps.push("Copy .env.example to .env and fill in any required secrets before running.");

  steps.push("Make a tiny change (a string, console log, or comment) and confirm hot-reload works — this validates your dev setup.");
  steps.push("Read the most recently modified files for clues about active areas of development.");

  return steps.slice(0, 8);
}

function buildSummary(repo: GhRepo, readme: string, stack: TechStack, files: GhTreeEntry[]): string {
  const desc = repo.description?.trim();
  const firstPara = readme
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("#") && !l.startsWith("![") && !l.startsWith("<") && !l.startsWith("[!") && l.length > 60);

  const folders = files.filter((f) => f.type === "tree").map((f) => lc(f.path));
  const hasFrontend = folders.some((f) => FRONTEND_HINTS.includes(f)) || stack.frontend.length > 0;
  const hasBackend = folders.some((f) => BACKEND_HINTS.includes(f)) || stack.backend.length > 0;
  const archStyle = hasFrontend && hasBackend ? "full-stack" : hasFrontend ? "client-side" : hasBackend ? "backend service" : "library/utility";

  const techParts: string[] = [];
  if (stack.frontend.length) techParts.push(`frontend with ${stack.frontend.slice(0, 2).join(", ")}`);
  if (stack.backend.length) techParts.push(`backend on ${stack.backend.slice(0, 2).join(", ")}`);
  if (!techParts.length && stack.languages.length) techParts.push(`written in ${stack.languages.slice(0, 2).join(", ")}`);

  const intro = desc
    ? `${repo.full_name} — ${desc}`
    : `${repo.full_name} is a ${stack.languages[0] ?? "software"} project hosted on GitHub.`;

  const styleSentence = `It follows a ${archStyle} architecture${techParts.length ? `, ${techParts.join(" and ")}` : ""}.`;

  const workflow = stack.deployment.length
    ? `Deployment is wired through ${stack.deployment.slice(0, 2).join(" / ")}${stack.testing.length ? `, with ${stack.testing[0]} for testing` : ""}.`
    : stack.testing.length
      ? `Testing uses ${stack.testing[0]}.`
      : "";

  const popularity = `${repo.stargazers_count.toLocaleString()} stars · ${repo.forks_count.toLocaleString()} forks · ${repo.open_issues_count.toLocaleString()} open issues.`;

  return [intro, styleSentence, firstPara ? firstPara.slice(0, 280) : null, workflow, popularity].filter(Boolean).join(" ");
}

function buildDeveloperInsights(repo: GhRepo, files: GhTreeEntry[], stack: TechStack): DeveloperInsights {
  const folderCount = files.filter((f) => f.type === "tree").length;
  const fileCount = files.filter((f) => f.type === "blob").length;
  const stars = repo.stargazers_count;

  const scale =
    stars > 10000 ? "Large-scale, widely adopted project — used in production by many teams."
    : stars > 1000 ? "Established project with a meaningful user base."
    : stars > 100 ? "Growing project with early traction."
    : "Small or early-stage project — likely a personal/hackathon repo or new library.";

  const maintainability =
    stack.testing.length && (stack.buildTools.includes("TypeScript") || stack.languages.includes("TypeScript"))
      ? "Strong: typed codebase plus an automated test suite reduces regressions."
      : stack.testing.length
        ? "Decent: tests are present but the codebase isn't fully typed."
        : (stack.buildTools.includes("TypeScript") || stack.languages.includes("TypeScript"))
          ? "Moderate: TypeScript provides safety, but no obvious test suite was found."
          : "Lean: no tests or types detected — rely on careful review when changing code.";

  const modularity =
    folderCount >= 8 ? "Highly modular — many top-level folders separate concerns clearly."
    : folderCount >= 4 ? "Reasonably modular — distinct folders for different responsibilities."
    : "Flat structure — most code lives close to the root.";

  const pushed = new Date(repo.pushed_at);
  const daysSince = Math.floor((Date.now() - pushed.getTime()) / 86400000);
  const activity =
    daysSince < 14 ? `Active — last pushed ${daysSince} day${daysSince === 1 ? "" : "s"} ago.`
    : daysSince < 90 ? `Recently active — last pushed ${daysSince} days ago.`
    : daysSince < 365 ? `Slowing — last pushed ~${Math.round(daysSince / 30)} month(s) ago.`
    : `Likely inactive — last pushed over a year ago.`;

  const collaboration =
    stars > 1000 ? "Open-source community project — expect issues, PRs, and contribution guidelines."
    : repo.forks_count > 20 ? "Multi-contributor project — forks suggest active community involvement."
    : "Likely solo or small-team project — coordinate directly with maintainers.";

  return { scale, maintainability, modularity, collaboration, activity };
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

  const techStack = buildTechStack(repo, langs, files);

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
    createdAt: repo.created_at,
    topics: repo.topics ?? [],
    summary: buildSummary(repo, readme, techStack, files),
    architecture: buildArchitecture(files, techStack),
    applicationFlow: buildApplicationFlow(techStack, files),
    beginnerGuide: buildBeginnerGuide(repo, files, techStack),
    importantFolders: buildImportantFolders(files),
    importantFiles: buildImportantFiles(files),
    technologies: buildTechnologiesFlat(techStack, repo),
    techStack,
    developerInsights: buildDeveloperInsights(repo, files, techStack),
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
    return repo.techStack.testing.length
      ? `${repo.fullName} uses ${repo.techStack.testing.join(", ")} for testing. Run the test script in package.json.`
      : `${repo.fullName} doesn't expose an obvious test suite at the top level — check the README or scripts section.`;
  }
  if (q.includes("deploy") || q.includes("ci")) {
    return repo.techStack.deployment.length
      ? `Deployment is set up via ${repo.techStack.deployment.join(", ")}. Look in .github/workflows or the relevant config file.`
      : `No deployment config detected. Check the README for hosting instructions.`;
  }
  if (q.includes("architect") || q.includes("structure") || q.includes("organi") || q.includes("flow")) {
    return `${repo.fullName} flow: ${repo.applicationFlow} Folders: ${folders}.`;
  }
  if (q.includes("language") || q.includes("stack") || q.includes("tech")) {
    return `${repo.fullName} stack — languages: ${repo.techStack.languages.join(", ") || "n/a"}; frontend: ${repo.techStack.frontend.join(", ") || "n/a"}; backend: ${repo.techStack.backend.join(", ") || "n/a"}; build: ${repo.techStack.buildTools.join(", ") || "n/a"}.`;
  }
  if (q.includes("license")) {
    return repo.license ? `${repo.fullName} is licensed under ${repo.license}.` : `${repo.fullName} doesn't expose a license through the GitHub API — check the repo for a LICENSE file.`;
  }
  if (q.includes("star") || q.includes("popular") || q.includes("scale")) {
    return `${repo.developerInsights.scale} ${repo.stars.toLocaleString()} stars, ${repo.forks.toLocaleString()} forks.`;
  }
  return `Based on ${repo.fullName}'s structure (${folders}), the answer to "${question.replace(/\?$/, "")}" likely lives in one of those folders. Open the README and the most relevant folder to dig deeper. (This is a heuristic answer — real AI integration is coming soon.)`;
}
