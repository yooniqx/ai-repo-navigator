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

export interface RepositoryHealth {
  documentationQuality: string;
  projectStructure: string;
  maintainabilityScore: string;
  onboardingDifficulty: string;
  dependencyComplexity: string;
  codeOrganization: string;
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
  repositoryHealth: RepositoryHealth;
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
  "package.json":
    "Defines Node dependencies, scripts (dev/build/test), and project metadata. Start here to understand how to run the project.",
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
  dockerfile: "Container image definition for building and running the app.",
  "docker-compose.yml": "Multi-container orchestration for local dev or deploy.",
  "requirements.txt": "Python dependencies — install with pip.",
  "pyproject.toml": "Modern Python project metadata and dependencies.",
  "setup.py": "Legacy Python package definition.",
  "go.mod": "Go module definition and dependencies.",
  "cargo.toml": "Rust crate manifest — dependencies and build config.",
  gemfile: "Ruby dependencies managed by Bundler.",
  "pom.xml": "Maven build configuration for Java projects.",
  "build.gradle": "Gradle build configuration for Java/Kotlin projects.",
  "composer.json": "PHP dependencies managed by Composer.",
  ".env.example": "Template for required environment variables — copy to .env.",
  makefile: "Make targets for common dev tasks.",
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
  license: "Legal terms governing use, modification, and distribution.",
};

const FRONTEND_HINTS = ["src", "app", "components", "pages", "frontend", "client", "web", "ui"];
const BACKEND_HINTS = [
  "server",
  "api",
  "backend",
  "cmd",
  "internal",
  "controllers",
  "services",
  "routes",
];

function lc(s: string) {
  return s.toLowerCase();
}

function buildTechStack(
  repo: GhRepo,
  langs: Record<string, number>,
  files: GhTreeEntry[],
): TechStack {
  const names = new Set(files.map((f) => lc(f.path)));
  const folders = new Set(files.filter((f) => f.type === "tree").map((f) => lc(f.path)));
  const has = (n: string) => names.has(n);
  const hasFolder = (n: string) => folders.has(n);

  const stack: TechStack = {
    languages: Object.keys(langs).length
      ? Object.keys(langs)
      : repo.language
        ? [repo.language]
        : [],
    frontend: [],
    backend: [],
    buildTools: [],
    packageManagers: [],
    deployment: [],
    testing: [],
    databases: [],
  };

  // Frontend
  if (has("next.config.js") || has("next.config.ts") || has("next.config.mjs"))
    stack.frontend.push("Next.js");
  if (has("nuxt.config.ts") || has("nuxt.config.js")) stack.frontend.push("Nuxt");
  if (has("astro.config.mjs") || has("astro.config.ts")) stack.frontend.push("Astro");
  if (has("svelte.config.js")) stack.frontend.push("SvelteKit");
  if (has("remix.config.js")) stack.frontend.push("Remix");
  if (has("angular.json")) stack.frontend.push("Angular");
  if (has("vue.config.js")) stack.frontend.push("Vue");
  if (has("expo.json") || has("app.json")) stack.frontend.push("Expo / React Native");
  if (has("tailwind.config.js") || has("tailwind.config.ts")) stack.frontend.push("Tailwind CSS");
  if (
    hasFolder("components") &&
    (stack.languages.includes("TypeScript") || stack.languages.includes("JavaScript"))
  ) {
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
  if (has("docker-compose.yml") || has("docker-compose.yaml"))
    stack.deployment.push("Docker Compose");
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
  if (hasFolder("tests") || hasFolder("__tests__") || hasFolder("test"))
    stack.testing.push("Test suite present");

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
  [
    stack.languages,
    stack.frontend,
    stack.backend,
    stack.buildTools,
    stack.packageManagers,
    stack.deployment,
    stack.testing,
    stack.databases,
  ].forEach((arr) => arr.forEach((t) => all.add(t)));
  if (repo.language) all.add(repo.language);
  return Array.from(all).slice(0, 16);
}

function buildArchitecture(
  files: GhTreeEntry[],
  stack: TechStack,
): { title: string; description: string }[] {
  const folders = files.filter((f) => f.type === "tree").map((f) => lc(f.path));
  const fileNames = files.filter((f) => f.type === "blob").map((f) => lc(f.path));
  const has = (n: string) => fileNames.includes(n);
  const arch: { title: string; description: string }[] = [];

  const hasFrontend = folders.some((f) => FRONTEND_HINTS.includes(f)) || stack.frontend.length > 0;
  const hasBackend = folders.some((f) => BACKEND_HINTS.includes(f)) || stack.backend.length > 0;

  if (hasFrontend && hasBackend) {
    arch.push({
      title: "Full-Stack Architecture",
      description: `**Frontend:** ${stack.frontend[0] ?? "Client UI"}\n**Backend:** ${stack.backend[0] ?? "Server logic"}\n\n• Requests flow from UI to API routes/services\n• Backend returns JSON consumed by client\n• Shared codebase enables type safety across layers`,
    });
  } else if (hasFrontend) {
    arch.push({
      title: "Client-Side Application",
      description: `**Framework:** ${stack.frontend.length ? stack.frontend.join(", ") : "Browser-based UI"}\n\n• Organized around UI components and pages\n• State and routing handled in the browser\n• Typically consumes external APIs or static data`,
    });
  } else if (hasBackend) {
    arch.push({
      title: "Backend Service",
      description: `**Technology:** ${stack.backend.length ? stack.backend.join(", ") : "Server-side logic"}\n\n• Service-oriented layout with routes/controllers\n• Entry point boots HTTP server or CLI\n• Handles business logic and data persistence`,
    });
  } else {
    arch.push({
      title: "Library / Utility",
      description: `**Type:** Reusable module or tool\n\n• No client/server split detected\n• Likely a library, CLI, or single-purpose utility\n• Consumed by other projects as a dependency`,
    });
  }

  if (folders.some((f) => ["packages", "apps"].includes(f))) {
    arch.push({
      title: "Monorepo Layout",
      description: `**Structure:** Multiple packages under one repository\n\n• Each workspace is self-contained and independently deployable\n• Shared tooling and dependencies across packages\n• Root configs propagate to all workspaces`,
    });
  }

  if (has("package.json")) {
    arch.push({
      title: "Node.js Configuration",
      description: `**Package Management:** npm/yarn/pnpm/bun\n\n• package.json defines dependencies and scripts\n• tsconfig.json configures TypeScript (if present)\n• Lock files ensure reproducible builds`,
    });
  }

  if (folders.includes("api") || folders.includes("routes") || folders.includes("server")) {
    arch.push({
      title: "API / Server Layer",
      description: `**Location:** api/, routes/, or server/ folder\n\n• HTTP endpoints mapped to URL patterns\n• Each file handles its own request/response cycle\n• Middleware processes requests before handlers`,
    });
  }

  if (
    folders.some((f) => ["tests", "__tests__", "test"].includes(f)) ||
    fileNames.some((f) => f.includes(".test.") || f.includes(".spec."))
  ) {
    arch.push({
      title: "Automated Testing",
      description: `**Framework:** ${stack.testing.length ? stack.testing.join(", ") : "Test suite present"}\n\n• Tests guard against regressions\n• CI likely runs tests on every PR\n• Ensures code quality and reliability`,
    });
  }

  if (folders.includes(".github")) {
    arch.push({
      title: "Continuous Integration",
      description:
        ".github/workflows defines automated checks (build, test, lint, deploy) triggered by pushes and pull requests.",
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
      purpose:
        FOLDER_PURPOSES[lc(f.path)] ?? "Project module — open it to see its responsibilities.",
    }));
}

function buildImportantFiles(files: GhTreeEntry[]): ImportantFile[] {
  const blobs = files.filter((f) => f.type === "blob");
  const out: ImportantFile[] = [];
  const seen = new Set<string>();

  // priority order
  const priority = [
    "readme.md",
    "package.json",
    "requirements.txt",
    "pyproject.toml",
    "go.mod",
    "cargo.toml",
    "tsconfig.json",
    "vite.config.ts",
    "vite.config.js",
    "next.config.js",
    "next.config.ts",
    "tailwind.config.ts",
    "tailwind.config.js",
    "server.ts",
    "server.js",
    "app.ts",
    "app.js",
    "index.ts",
    "index.js",
    "main.py",
    "main.go",
    "main.rs",
    "dockerfile",
    "docker-compose.yml",
    "vercel.json",
    "netlify.toml",
    "wrangler.jsonc",
    "wrangler.toml",
    ".env.example",
    "makefile",
    "license",
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

  // Step 1: Read documentation
  steps.push(
    `**Read the README** — Start with README.md to understand:\n   • What the project does\n   • Who it's for\n   • How to run it locally`,
  );

  // Step 2: Install dependencies
  if (names.has("package.json")) {
    const pm = stack.packageManagers.find((p) => p !== "npm") ?? "npm";
    steps.push(
      `**Install dependencies** — Run these commands:\n   • \`${pm.toLowerCase()} install\` to install packages\n   • \`${pm.toLowerCase()} run dev\` to start development server\n   • Check package.json scripts for other commands`,
    );
  } else if (names.has("requirements.txt") || names.has("pyproject.toml")) {
    steps.push(
      `**Set up Python environment** — Follow these steps:\n   • Create virtual environment: \`python -m venv venv\`\n   • Activate it: \`source venv/bin/activate\` (Unix) or \`venv\\Scripts\\activate\` (Windows)\n   • Install: \`pip install -r requirements.txt\``,
    );
  } else if (names.has("go.mod")) {
    steps.push(
      `**Set up Go project** — Run these commands:\n   • \`go mod download\` to fetch dependencies\n   • \`go run .\` to start the application\n   • Check cmd/ or main.go for entry points`,
    );
  } else if (names.has("cargo.toml")) {
    steps.push(
      `**Set up Rust project** — Run these commands:\n   • \`cargo build\` to compile\n   • \`cargo run\` to execute\n   • Entry: src/main.rs (binary) or src/lib.rs (library)`,
    );
  }

  // Step 3: Find entry point
  const entryFile = [
    "src/index.ts",
    "src/index.tsx",
    "src/main.ts",
    "src/main.tsx",
    "src/app.tsx",
    "index.js",
    "main.py",
  ].find((f) => names.has(lc(f)));
  if (entryFile) {
    steps.push(
      `**Trace the entry point** — Open \`${entryFile}\` and:\n   • Follow imports to understand dependencies\n   • Identify initialization logic\n   • Map out the application structure`,
    );
  }

  // Step 4: Explore codebase structure
  const front = folders.find((f) => FRONTEND_HINTS.includes(f));
  const back = folders.find((f) => BACKEND_HINTS.includes(f));
  if (front && back) {
    steps.push(
      `**Explore the codebase** — Navigate key folders:\n   • ${front}/ contains UI components and pages\n   • ${back}/ contains server logic and APIs\n   • Trace one feature end-to-end to see how they connect`,
    );
  } else if (front) {
    steps.push(
      `**Explore the frontend** — Navigate ${front}/ folder:\n   • Look for components/, pages/, or routes/\n   • Understand the UI component hierarchy\n   • Check routing configuration`,
    );
  } else if (back) {
    steps.push(
      `**Explore the backend** — Navigate ${back}/ folder:\n   • Find route registrations\n   • Follow handlers to controllers/services\n   • Understand the API structure`,
    );
  }

  // Step 5: Environment setup
  if (names.has(".env.example")) {
    steps.push(
      `**Configure environment** — Set up required variables:\n   • Copy \`.env.example\` to \`.env\`\n   • Fill in required secrets and API keys\n   • Never commit .env to version control`,
    );
  }

  // Step 6: Additional resources
  if (folders.includes("docs")) {
    steps.push(
      `**Read documentation** — Browse docs/ folder for:\n   • Architecture decisions\n   • API documentation\n   • Development guidelines`,
    );
  }

  // Step 7: Validate setup
  steps.push(
    `**Validate your setup** — Confirm everything works:\n   • Make a small change (add a console.log)\n   • Verify hot-reload updates automatically\n   • Run tests if available`,
  );

  // Step 8: Explore recent changes
  steps.push(
    `**Understand recent work** — Check Git history:\n   • Review recently modified files\n   • Read recent commit messages\n   • Identify active development areas`,
  );

  return steps.slice(0, 8);
}

function buildSummary(
  repo: GhRepo,
  readme: string,
  stack: TechStack,
  files: GhTreeEntry[],
): string {
  const desc = repo.description?.trim();
  const folders = files.filter((f) => f.type === "tree").map((f) => lc(f.path));
  const hasFrontend = folders.some((f) => FRONTEND_HINTS.includes(f)) || stack.frontend.length > 0;
  const hasBackend = folders.some((f) => BACKEND_HINTS.includes(f)) || stack.backend.length > 0;
  const stars = repo.stargazers_count;

  // Infer project purpose and type
  const hasAPI = folders.some((f) => ["api", "routes", "endpoints"].includes(f));
  const hasUI = folders.some((f) => ["components", "pages", "views", "ui"].includes(f));
  const hasLib =
    folders.some((f) => ["lib", "packages", "src"].includes(f)) && !hasFrontend && !hasBackend;
  const hasCLI = folders.some((f) => ["cli", "cmd", "bin"].includes(f));
  const hasDocs = folders.some((f) => ["docs", "documentation"].includes(f));
  const hasExamples = folders.some((f) => ["examples", "demo", "samples"].includes(f));

  // Infer application type
  let appType = "";
  if (hasFrontend && hasBackend) {
    appType = hasAPI ? "full-stack web application with REST API" : "full-stack web application";
  } else if (hasFrontend) {
    appType = stack.frontend.some((f) => f.includes("Next.js"))
      ? "server-rendered web application"
      : "single-page application (SPA)";
  } else if (hasBackend) {
    appType = hasAPI ? "backend API service" : "server-side application";
  } else if (hasCLI) {
    appType = "command-line tool";
  } else if (hasLib) {
    appType =
      stack.languages.includes("TypeScript") || stack.languages.includes("JavaScript")
        ? "JavaScript/TypeScript library"
        : "software library";
  } else {
    appType = "software project";
  }

  // Infer target users
  let targetUsers = "";
  if (hasDocs && hasExamples && stars > 500) {
    targetUsers = "developers building production applications";
  } else if (hasExamples || hasDocs) {
    targetUsers = "developers looking for a ready-to-use solution";
  } else if (stars > 1000) {
    targetUsers = "developers and teams in production environments";
  } else if (stack.testing.length > 0) {
    targetUsers = "developers who value code quality";
  } else {
    targetUsers = "developers and early adopters";
  }

  // Infer developer experience level
  let devLevel = "";
  const hasTypes =
    stack.buildTools.includes("TypeScript") || stack.languages.includes("TypeScript");
  const hasTests = stack.testing.length > 0;
  const complexStack = stack.languages.length > 2 || (hasFrontend && hasBackend);

  if (complexStack && hasTypes && hasTests) {
    devLevel = "intermediate to advanced developers";
  } else if (complexStack) {
    devLevel = "developers with full-stack experience";
  } else if (hasTypes || hasTests) {
    devLevel = "developers comfortable with modern tooling";
  } else if (hasFrontend || hasBackend) {
    devLevel = "beginner to intermediate developers";
  } else {
    devLevel = "developers of all levels";
  }

  // Build architecture description
  const archParts: string[] = [];
  if (stack.frontend.length) archParts.push(stack.frontend[0]);
  if (stack.backend.length) archParts.push(stack.backend[0]);
  if (!archParts.length && stack.languages.length) archParts.push(stack.languages[0]);

  const archDesc = archParts.length ? ` built with ${archParts.slice(0, 2).join(" and ")}` : "";

  // Compose intelligent summary
  const parts: string[] = [];

  // Opening: What it is
  if (desc) {
    parts.push(`**${repo.full_name}** — ${desc}`);
  } else {
    parts.push(`**${repo.full_name}** is a ${appType}${archDesc}.`);
  }

  // Purpose and users
  parts.push(
    `\n\n**Purpose:** ${appType.charAt(0).toUpperCase() + appType.slice(1)} designed for ${targetUsers}.`,
  );

  // Architecture style
  const archStyle =
    hasFrontend && hasBackend
      ? "full-stack architecture"
      : hasFrontend
        ? "client-side architecture"
        : hasBackend
          ? "server-side architecture"
          : "modular library structure";
  parts.push(
    `\n\n**Architecture:** ${archStyle.charAt(0).toUpperCase() + archStyle.slice(1)}${archDesc ? ` using ${archParts.join(" + ")}` : ""}.`,
  );

  // Developer experience
  parts.push(`\n\n**Best suited for:** ${devLevel.charAt(0).toUpperCase() + devLevel.slice(1)}.`);

  // Popularity metrics
  parts.push(
    `\n\n**Community:** ${stars.toLocaleString()} stars · ${repo.forks_count.toLocaleString()} forks · ${repo.open_issues_count.toLocaleString()} open issues`,
  );

  return parts.join("");
}

function buildDeveloperInsights(
  repo: GhRepo,
  files: GhTreeEntry[],
  stack: TechStack,
): DeveloperInsights {
  const folderCount = files.filter((f) => f.type === "tree").length;
  const fileCount = files.filter((f) => f.type === "blob").length;
  const stars = repo.stargazers_count;

  const scale =
    stars > 10000
      ? "Large-scale, widely adopted project — used in production by many teams."
      : stars > 1000
        ? "Established project with a meaningful user base."
        : stars > 100
          ? "Growing project with early traction."
          : "Small or early-stage project — likely a personal/hackathon repo or new library.";

  const maintainability =
    stack.testing.length &&
    (stack.buildTools.includes("TypeScript") || stack.languages.includes("TypeScript"))
      ? "Strong: typed codebase plus an automated test suite reduces regressions."
      : stack.testing.length
        ? "Decent: tests are present but the codebase isn't fully typed."
        : stack.buildTools.includes("TypeScript") || stack.languages.includes("TypeScript")
          ? "Moderate: TypeScript provides safety, but no obvious test suite was found."
          : "Lean: no tests or types detected — rely on careful review when changing code.";

  const modularity =
    folderCount >= 8
      ? "Highly modular — many top-level folders separate concerns clearly."
      : folderCount >= 4
        ? "Reasonably modular — distinct folders for different responsibilities."
        : "Flat structure — most code lives close to the root.";

  const pushed = new Date(repo.pushed_at);
  const daysSince = Math.floor((Date.now() - pushed.getTime()) / 86400000);
  const activity =
    daysSince < 14
      ? `Active — last pushed ${daysSince} day${daysSince === 1 ? "" : "s"} ago.`
      : daysSince < 90
        ? `Recently active — last pushed ${daysSince} days ago.`
        : daysSince < 365
          ? `Slowing — last pushed ~${Math.round(daysSince / 30)} month(s) ago.`
          : `Likely inactive — last pushed over a year ago.`;

  const collaboration =
    stars > 1000
      ? "Open-source community project — expect issues, PRs, and contribution guidelines."
      : repo.forks_count > 20
        ? "Multi-contributor project — forks suggest active community involvement."
        : "Likely solo or small-team project — coordinate directly with maintainers.";

  return { scale, maintainability, modularity, collaboration, activity };
}

function readmeExcerpt(readme: string): string {
  if (!readme) return "";
  return readme.split("\n").slice(0, 30).join("\n").slice(0, 1200);
}

function buildRepositoryHealth(
  repo: GhRepo,
  readme: string,
  files: GhTreeEntry[],
  techStack: TechStack,
  langs: Record<string, number>,
): RepositoryHealth {
  const fileNames = new Set(files.map((f) => lc(f.path)));
  const folderCount = files.filter((f) => f.type === "tree").length;
  const fileCount = files.filter((f) => f.type === "blob").length;
  const hasReadme = readme.length > 100;
  const readmeLength = readme.length;

  // Documentation Quality
  const hasDocs =
    fileNames.has("docs") || files.some((f) => f.path.toLowerCase().startsWith("docs/"));
  const hasContributing =
    fileNames.has("contributing.md") || fileNames.has(".github/contributing.md");
  const hasChangelog = fileNames.has("changelog.md") || fileNames.has("history.md");
  const hasExamples =
    fileNames.has("examples") || files.some((f) => f.path.toLowerCase().startsWith("examples/"));

  const documentationQuality =
    hasReadme && readmeLength > 2000 && hasDocs && hasExamples
      ? "Excellent — comprehensive README, dedicated docs folder, and examples"
      : hasReadme && readmeLength > 1000 && (hasDocs || hasExamples)
        ? "Good — detailed README with additional documentation or examples"
        : hasReadme && readmeLength > 500
          ? "Adequate — README covers basics but could be more detailed"
          : hasReadme
            ? "Minimal — README exists but lacks depth"
            : "Poor — no README or very sparse documentation";

  // Project Structure Quality
  const hasStandardFolders = ["src", "lib", "app"].some((f) => fileNames.has(f));
  const hasTests =
    techStack.testing.length > 0 || ["tests", "test", "__tests__"].some((f) => fileNames.has(f));
  const hasConfig =
    fileNames.has("config") || files.some((f) => /config\.(ts|js|json)/.test(f.path));
  const wellOrganized = folderCount >= 4 && folderCount <= 15;

  const projectStructure =
    hasStandardFolders && hasTests && wellOrganized
      ? "Well-organized — clear separation of concerns with standard conventions"
      : hasStandardFolders && wellOrganized
        ? "Good — follows common patterns with logical folder structure"
        : folderCount > 15
          ? "Complex — many folders may indicate over-engineering or monorepo"
          : folderCount < 3
            ? "Flat — minimal folder structure, may be hard to navigate as it grows"
            : "Standard — basic organization, room for improvement";

  // Maintainability Score
  const hasTypes =
    techStack.buildTools.includes("TypeScript") || techStack.languages.includes("TypeScript");
  const hasLinter =
    fileNames.has("eslint.config.js") ||
    fileNames.has(".eslintrc.json") ||
    fileNames.has(".eslintrc");
  const hasFormatter = fileNames.has("prettier.config.js") || fileNames.has(".prettierrc");
  const hasCI =
    fileNames.has(".github") || fileNames.has(".gitlab-ci.yml") || fileNames.has(".circleci");

  const maintainabilityScore =
    hasTypes && hasTests && hasLinter && hasCI
      ? "High — typed, tested, linted, with automated CI"
      : hasTypes && hasTests
        ? "Good — type safety and tests provide solid foundation"
        : hasTests || hasTypes
          ? "Moderate — some quality measures in place"
          : hasLinter
            ? "Basic — linting helps but lacks tests or types"
            : "Low — minimal quality tooling detected";

  // Onboarding Difficulty
  const hasEnvExample = fileNames.has(".env.example") || fileNames.has("env.example");
  const hasSetupDocs =
    readme.toLowerCase().includes("install") || readme.toLowerCase().includes("setup");
  const complexDeps = Object.keys(langs).length > 3;
  const hasDocker = fileNames.has("dockerfile") || fileNames.has("docker-compose.yml");

  const onboardingDifficulty =
    hasReadme && hasSetupDocs && hasEnvExample && !complexDeps
      ? "Easy — clear setup instructions and simple dependencies"
      : hasReadme && hasSetupDocs
        ? "Moderate — documentation exists but may require some figuring out"
        : hasReadme && !complexDeps
          ? "Moderate — basic README but setup steps could be clearer"
          : complexDeps || !hasReadme
            ? "Challenging — complex stack or sparse documentation"
            : "Difficult — minimal guidance for new contributors";

  // Dependency Complexity
  const depFiles = [
    "package.json",
    "requirements.txt",
    "go.mod",
    "cargo.toml",
    "pom.xml",
    "build.gradle",
  ];
  const hasDeps = depFiles.some((f) => fileNames.has(f));
  const hasLockFile =
    fileNames.has("package-lock.json") ||
    fileNames.has("yarn.lock") ||
    fileNames.has("bun.lockb") ||
    fileNames.has("pnpm-lock.yaml");
  const multiLanguage = Object.keys(langs).length > 2;
  const hasMonorepo =
    fileNames.has("packages") ||
    fileNames.has("apps") ||
    fileNames.has("turbo.json") ||
    fileNames.has("nx.json");

  const dependencyComplexity = hasMonorepo
    ? "High — monorepo with multiple packages and shared dependencies"
    : multiLanguage && hasDeps
      ? "Moderate-High — multiple languages with different package managers"
      : hasDeps && hasLockFile
        ? "Standard — typical dependency setup with lock file"
        : hasDeps
          ? "Moderate — dependencies present but no lock file (reproducibility risk)"
          : "Low — minimal or no external dependencies";

  // Code Organization
  const hasModules = folderCount >= 5;
  const hasClearSeparation = files.some((f) =>
    /components|services|utils|lib|helpers/i.test(f.path),
  );
  const hasLayering = files.some((f) => /controllers|models|views|routes/i.test(f.path));

  const codeOrganization =
    hasModules && hasClearSeparation && hasLayering
      ? "Excellent — modular design with clear architectural layers"
      : hasModules && hasClearSeparation
        ? "Good — well-separated concerns with logical grouping"
        : hasModules
          ? "Adequate — multiple modules but separation could be clearer"
          : folderCount <= 2
            ? "Flat — most code at root level, harder to navigate"
            : "Basic — minimal organization, suitable for small projects";

  return {
    documentationQuality,
    projectStructure,
    maintainabilityScore,
    onboardingDifficulty,
    dependencyComplexity,
    codeOrganization,
  };
}

export async function analyzeRepository(
  owner: string,
  name: string,
  url: string,
): Promise<AnalyzeResult> {
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
    repositoryHealth: buildRepositoryHealth(repo, readme, files, techStack, langs),
    readmeExcerpt: readmeExcerpt(readme),
  };
}

function fmtList(items: string[]): string {
  return items.length ? items.map((i) => `- ${i}`).join("\n") : "_None detected._";
}

function fmtFolderList(folders: { path: string; purpose: string }[]): string {
  return folders.map((f) => `- \`${f.path}\` — ${f.purpose}`).join("\n");
}

function fmtFileList(files: { path: string; why: string }[]): string {
  if (!files.length) return "_No standout files detected at the root._";
  return files.map((f) => `- \`${f.path}\` — ${f.why}`).join("\n");
}

export function buildChatAnswer(repo: AnalyzeResult, question: string): string {
  const q = question.toLowerCase();
  const ts = repo.techStack;

  const header = `**Repository:** \`${repo.fullName}\` · ${repo.stars.toLocaleString()}★ · ${repo.forks.toLocaleString()} forks`;

  if (q.includes("auth") || q.includes("login") || q.includes("session")) {
    const candidates = repo.importantFolders.filter((f) =>
      /auth|login|session|user|account|security|middleware/i.test(f.path),
    );
    const authFiles = repo.importantFiles.filter((f) =>
      /auth|login|session|middleware|guard/i.test(f.path),
    );

    return `### Authentication Architecture

${header}

#### Where Authentication Lives

Authentication logic is typically distributed across multiple layers in modern applications:

${candidates.length ? `**Detected folders:**\n${fmtFolderList(candidates)}` : "**No dedicated auth folder detected** — authentication may be:\n- Embedded in middleware files\n- Part of the API/routes layer\n- Handled by a third-party service (Auth0, Clerk, Supabase Auth)"}

${authFiles.length ? `\n**Related files:**\n${fmtFileList(authFiles)}` : ""}

#### Common Authentication Patterns

Based on the detected stack (${ts.backend.join(", ") || "server-side logic"}), look for these patterns:

**Session-based authentication:**
- Session middleware in server initialization
- Cookie parsing and validation
- Session store (Redis, database, in-memory)
- Login/logout route handlers

**Token-based authentication (JWT):**
- Token generation on login (typically in \`/api/auth/login\`)
- Token verification middleware protecting routes
- Refresh token logic for long-lived sessions
- Token storage strategy (httpOnly cookies vs localStorage)

**OAuth/Social login:**
- OAuth provider configuration (Google, GitHub, etc.)
- Callback routes handling OAuth redirects
- User profile mapping from OAuth providers

#### Where to Start

1. **Check environment variables** — Look for \`.env.example\` or config files containing:
   - \`JWT_SECRET\`, \`SESSION_SECRET\`, \`AUTH_SECRET\`
   - OAuth client IDs and secrets
   - Database connection strings for user storage

2. **Find the middleware** — Search for:
   \`\`\`bash
   # Common auth middleware patterns
   grep -r "authenticate" src/
   grep -r "verifyToken" src/
   grep -r "requireAuth" src/
   grep -r "passport" src/
   \`\`\`

3. **Locate auth routes** — Check:
   - \`${ts.backend.length ? `${repo.importantFolders.find((f) => /api|routes|server/i.test(f.path))?.path || "api/"}/auth/` : "api/auth/"}\`
   - Login, logout, register, password reset endpoints
   - Protected route examples

4. **User model/schema** — Find where users are defined:
   - Database models (\`models/User\`, \`prisma/schema.prisma\`)
   - TypeScript interfaces for user objects
   - Password hashing logic (bcrypt, argon2)

#### Tech Stack Context

${ts.backend.length ? `**Backend:** ${ts.backend.join(", ")}\n` : ""}${ts.databases.length ? `**Database/ORM:** ${ts.databases.join(", ")}\n` : ""}${ts.frontend.length ? `**Frontend:** ${ts.frontend.join(", ")} — check for auth context providers, protected route wrappers\n` : ""}

#### Security Checklist

When reviewing authentication code, verify:
- [ ] Passwords are hashed (never stored plain text)
- [ ] Tokens have expiration times
- [ ] HTTPS is enforced in production
- [ ] CSRF protection is enabled for session-based auth
- [ ] Rate limiting on login endpoints
- [ ] Secure cookie flags (httpOnly, secure, sameSite)

> **Note:** This is a heuristic analysis based on repository structure. For definitive answers, examine the actual implementation files.`;
  }

  if (q.includes("frontend") || q.includes("ui") || q.includes("client")) {
    const frontendFolders = repo.importantFolders.filter((f) =>
      /src|app|components|pages|client|frontend|ui|hooks|styles|assets|public/i.test(f.path),
    );
    const entryFiles = repo.importantFiles.filter((f) =>
      /index\.(tsx?|jsx?)|main\.(tsx?|jsx?)|app\.(tsx?|jsx?)|_app\.(tsx?|jsx?)|page\.(tsx?|jsx?)/i.test(
        f.path,
      ),
    );

    return `### Frontend Architecture & Structure

${header}

#### Detected Frontend Stack

${ts.frontend.length ? fmtList(ts.frontend) : "_No specific frontend framework detected — likely vanilla JS/HTML or a minimal setup._"}

${
  ts.frontend.length
    ? `\n**Framework Context:**\n${ts.frontend
        .map((f) => {
          if (f.includes("Next.js"))
            return "- **Next.js** — React framework with file-based routing, SSR/SSG, and API routes";
          if (f.includes("React"))
            return "- **React** — Component-based UI library with virtual DOM";
          if (f.includes("Vue"))
            return "- **Vue** — Progressive framework with reactive data binding";
          if (f.includes("Angular"))
            return "- **Angular** — Full-featured framework with TypeScript and dependency injection";
          if (f.includes("Svelte"))
            return "- **SvelteKit** — Compiler-based framework with minimal runtime";
          if (f.includes("Astro"))
            return "- **Astro** — Content-focused framework with partial hydration";
          if (f.includes("Tailwind")) return "- **Tailwind CSS** — Utility-first CSS framework";
          if (f.includes("Expo"))
            return "- **Expo/React Native** — Cross-platform mobile development";
          return `- **${f}**`;
        })
        .join("\n")}`
    : ""
}

#### Frontend Folder Structure

${frontendFolders.length ? fmtFolderList(frontendFolders) : "_No clear frontend folders detected at root level._"}

${frontendFolders.length ? `\n**Typical organization pattern:**\n- **components/** — Reusable UI building blocks (buttons, cards, modals)\n- **pages/** or **routes/** — Top-level views mapped to URLs\n- **hooks/** — Custom React hooks for shared logic\n- **styles/** — Global CSS, theme variables, utility classes\n- **assets/** — Images, fonts, icons bundled with the app\n- **public/** — Static files served as-is (favicon, robots.txt)` : ""}

#### Entry Points & Application Bootstrap

${entryFiles.length ? `**Detected entry files:**\n${fmtFileList(entryFiles)}\n` : "**Common entry points to look for:**\n- \`src/index.tsx\` or \`src/main.tsx\` — React app initialization\n- \`src/App.tsx\` — Root component\n- \`app/page.tsx\` — Next.js app directory entry\n- \`pages/_app.tsx\` — Next.js pages directory wrapper\n"}

**What happens at startup:**
1. Entry file imports root component and dependencies
2. React (or framework) initializes and mounts to DOM
3. Router sets up navigation and renders initial route
4. Global providers wrap the app (theme, auth, data fetching)
5. Component tree renders based on current URL

#### Application Workflow

${repo.applicationFlow}

#### Routing Strategy

${
  ts.frontend.some((f) => f.includes("Next.js"))
    ? "**Next.js file-based routing:**\n- Files in \`pages/\` or \`app/\` automatically become routes\n- \`pages/index.tsx\` → \`/\`\n- \`pages/about.tsx\` → \`/about\`\n- \`pages/blog/[slug].tsx\` → \`/blog/:slug\` (dynamic)\n- \`app/dashboard/page.tsx\` → \`/dashboard\` (app directory)"
    : ts.frontend.some((f) => f.includes("React"))
      ? "**Client-side routing (likely React Router or TanStack Router):**\n- Routes defined in a central config file\n- Components mapped to URL patterns\n- Navigation via \`<Link>\` components or programmatic navigation\n- URL changes don't trigger full page reloads"
      : "**Check the routing implementation:**\n- Look for route definitions in the entry file or a dedicated router file\n- Search for \`<Route>\`, \`createBrowserRouter\`, or framework-specific routing"
}

#### State Management

Look for these patterns in the codebase:

**Local state:**
- \`useState\`, \`useReducer\` in components
- Props passed down the component tree

**Global state:**
- Context API (\`createContext\`, \`useContext\`)
- Redux (\`store.ts\`, \`reducers/\`, \`actions/\`)
- Zustand (\`stores/\` with \`create()\`)
- Jotai/Recoil (atom-based state)

**Server state:**
- React Query / TanStack Query (\`useQuery\`, \`useMutation\`)
- SWR (\`useSWR\` hooks)
- Apollo Client (GraphQL)

#### Styling Approach

${
  ts.frontend.includes("Tailwind CSS")
    ? '**Tailwind CSS detected:**\n- Utility classes applied directly in JSX (\`className="flex items-center gap-2"\`)\n- Configuration in \`tailwind.config.js/ts\`\n- Custom theme extensions and plugins\n- PostCSS processes Tailwind directives'
    : "**Check for:**\n- CSS Modules (\`*.module.css\` files)\n- Styled Components (\`styled.div\\`...\\`\`)\n- Emotion (\`css={...}\` prop)\n- Plain CSS/SCSS in \`styles/\` folder"
}

#### How to Explore the Frontend

1. **Start at the entry point** — Open \`${entryFiles[0]?.path || "src/index.tsx"}\` and trace imports
2. **Map the component tree** — Follow the hierarchy from root to leaves
3. **Understand routing** — Find how URLs map to components
4. **Check state flow** — Identify where data lives and how it moves
5. **Inspect a feature end-to-end** — Pick one user flow (e.g., login) and trace it through components, state, and API calls

#### Developer Tools

- **React DevTools** — Inspect component tree, props, state
- **Redux DevTools** — Time-travel debugging for Redux state
- **Network tab** — Monitor API calls and responses
- **Console** — Check for errors, warnings, logs

> **Note:** This analysis is based on repository structure and detected files. Actual implementation may vary.`;
  }

  if (q.includes("backend") || q.includes("server") || q.includes("api")) {
    const backendFolders = repo.importantFolders.filter((f) =>
      /server|api|backend|routes|controllers|services|cmd|internal|models|middleware/i.test(f.path),
    );
    const serverFiles = repo.importantFiles.filter((f) =>
      /server\.(ts|js)|app\.(ts|js)|main\.(py|go|rs)|index\.(ts|js)/i.test(f.path),
    );

    return `### Backend Architecture & API Design

${header}

#### Detected Backend Stack

${ts.backend.length ? fmtList(ts.backend) : "_No clear backend framework detected — may be a frontend-only project or using serverless functions._"}

${
  ts.backend.length
    ? `\n**Technology Context:**\n${ts.backend
        .map((b) => {
          if (b.includes("Node.js"))
            return "- **Node.js server** — JavaScript runtime for server-side code";
          if (b.includes("API routes"))
            return "- **API routes** — Endpoint handlers (REST or GraphQL)";
          if (b.includes("Python"))
            return "- **Python backend** — Likely Flask, FastAPI, or Django";
          if (b.includes("Django"))
            return "- **Django** — Full-featured Python web framework with ORM";
          if (b.includes("Flask")) return "- **Flask** — Lightweight Python web framework";
          if (b.includes("Go")) return "- **Go service** — Compiled, concurrent backend service";
          if (b.includes("Rust"))
            return "- **Rust binary** — High-performance, memory-safe service";
          if (b.includes("Ruby"))
            return "- **Ruby on Rails** — Convention-over-configuration web framework";
          return `- **${b}**`;
        })
        .join("\n")}`
    : ""
}

#### Backend Folder Structure

${backendFolders.length ? fmtFolderList(backendFolders) : "_No dedicated backend folders detected — API logic may be co-located with frontend or in serverless functions._"}

${backendFolders.length ? `\n**Common backend organization:**\n- **routes/** or **api/** — HTTP endpoint definitions\n- **controllers/** — Request handlers that orchestrate business logic\n- **services/** — Business logic layer (reusable, testable)\n- **models/** — Data models and database schemas\n- **middleware/** — Request/response interceptors (auth, logging, validation)\n- **utils/** or **helpers/** — Shared utility functions` : ""}

#### Server Entry Point

${serverFiles.length ? `**Detected server files:**\n${fmtFileList(serverFiles)}\n` : "**Look for these entry points:**\n- \`server.ts\` or \`server.js\` — Express/Fastify/Hono server\n- \`app.ts\` or \`app.js\` — Application initialization\n- \`main.py\` — Python entry script\n- \`main.go\` — Go main package\n- \`src/index.ts\` — TypeScript server entry\n"}

**Server initialization flow:**
1. Import dependencies (framework, database, middleware)
2. Initialize app instance (\`express()\`, \`Hono()\`, etc.)
3. Configure middleware (CORS, body parsing, logging)
4. Register routes and handlers
5. Connect to database/external services
6. Start listening on port (typically 3000, 8000, or from env)

#### Application Request Flow

${repo.applicationFlow}

**Typical request lifecycle:**
1. **Client sends HTTP request** → \`POST /api/users\`
2. **Server receives request** → Framework routes to handler
3. **Middleware chain executes** → Auth, validation, logging
4. **Controller processes request** → Extracts data, calls services
5. **Service layer executes business logic** → Database queries, external APIs
6. **Response formatted and sent** → JSON, HTML, or error response

#### API Architecture Patterns

${backendFolders.some((f) => /routes/i.test(f.path)) ? "**Route-based architecture:**\n- Each route file handles a resource (\`users.ts\`, \`posts.ts\`)\n- Routes define HTTP methods (GET, POST, PUT, DELETE)\n- Handlers are thin, delegating to services\n\nExample structure:\n\`\`\`\nroutes/\n  users.ts    → /api/users (GET, POST)\n  posts.ts    → /api/posts (GET, POST, PUT, DELETE)\n  auth.ts     → /api/auth/login, /api/auth/logout\n\`\`\`" : ""}

${backendFolders.some((f) => /controllers/i.test(f.path)) ? "\n**MVC (Model-View-Controller) pattern:**\n- **Models** — Data structures and database schemas\n- **Views** — Response templates (or JSON for APIs)\n- **Controllers** — Request handlers that coordinate models and views\n\nRequest flow: Route → Controller → Model → Database → Controller → View → Response" : ""}

${backendFolders.some((f) => /services/i.test(f.path)) ? "\n**Service layer pattern:**\n- Controllers are thin, handling HTTP concerns only\n- Services contain business logic (reusable, testable)\n- Services may call other services or repositories\n- Promotes separation of concerns and testability" : ""}

#### Database Integration

${ts.databases.length ? `**Detected database tools:**\n${fmtList(ts.databases)}\n` : "**Check for database integration:**\n- ORM configuration (Prisma, TypeORM, Sequelize)\n- Raw SQL queries or query builders\n- Migration files tracking schema changes\n"}

${ts.databases.includes("Prisma") ? "**Prisma workflow:**\n1. Define schema in \`prisma/schema.prisma\`\n2. Run \`prisma migrate dev\` to create migrations\n3. Use \`prisma.client\` in code for type-safe queries\n4. Models auto-generated from schema" : ""}

${ts.databases.includes("SQL migrations") ? "\n**Migration-based approach:**\n- Migrations in \`migrations/\` folder (timestamped)\n- Each migration has \`up\` (apply) and \`down\` (rollback)\n- Run migrations on deploy to update production schema\n- Never edit old migrations — create new ones" : ""}

#### Middleware & Request Processing

Common middleware patterns to look for:

**Authentication middleware:**
\`\`\`typescript
// Protects routes, verifies tokens/sessions
app.use('/api/protected', authenticateUser);
\`\`\`

**Validation middleware:**
\`\`\`typescript
// Validates request body against schema
app.post('/api/users', validateBody(userSchema), createUser);
\`\`\`

**Error handling middleware:**
\`\`\`typescript
// Catches errors, formats responses
app.use(errorHandler);
\`\`\`

**Logging middleware:**
\`\`\`typescript
// Logs requests, responses, timing
app.use(logger);
\`\`\`

#### Environment Configuration

Look for environment variables in:
- \`.env.example\` — Template showing required variables
- \`config/\` folder — Configuration modules
- Server initialization code — \`process.env.PORT\`, etc.

**Common variables:**
- \`PORT\` — Server port (default 3000, 8000)
- \`DATABASE_URL\` — Database connection string
- \`JWT_SECRET\` — Token signing key
- \`NODE_ENV\` — Environment (development, production)
- \`API_KEY\` — External service credentials

#### How to Explore the Backend

1. **Find the entry point** — \`${serverFiles[0]?.path || "server.ts"}\` or equivalent
2. **Map the routes** — List all endpoints and their handlers
3. **Trace a request** — Pick one endpoint and follow it through middleware → controller → service → database
4. **Understand data models** — Check schemas, migrations, or model definitions
5. **Review middleware** — See what runs on every request (auth, logging, etc.)
6. **Check error handling** — How are errors caught and formatted?

#### Testing the API

${ts.testing.length ? `**Testing tools detected:** ${ts.testing.join(", ")}\n\n` : ""}**Manual testing:**
- Use Postman, Insomnia, or curl to hit endpoints
- Check request/response formats
- Test error cases (invalid data, auth failures)

**Automated testing:**
- Unit tests for services and utilities
- Integration tests for API endpoints
- E2E tests for full user flows

> **Note:** This analysis is based on repository structure. Actual implementation details require code inspection.`;
  }

  if (q.includes("start") || q.includes("begin") || q.includes("first") || q.includes("onboard")) {
    return `### Beginner's Onboarding Guide

${header}

#### Step-by-Step Getting Started

${repo.beginnerGuide.map((s, i) => `**${i + 1}. ${s.split("—")[0].trim()}**\n   ${s.split("—").slice(1).join("—").trim() || s}`).join("\n\n")}

#### Quick Start Commands

${
  ts.packageManagers.includes("Bun")
    ? "**Using Bun:**\n\`\`\`bash\nbun install\nbun run dev\n\`\`\`"
    : ts.packageManagers.includes("pnpm")
      ? "**Using pnpm:**\n\`\`\`bash\npnpm install\npnpm dev\n\`\`\`"
      : ts.packageManagers.includes("Yarn")
        ? "**Using Yarn:**\n\`\`\`bash\nyarn install\nyarn dev\n\`\`\`"
        : ts.packageManagers.includes("npm")
          ? "**Using npm:**\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`"
          : ts.packageManagers.includes("pip")
            ? "**Using Python:**\n\`\`\`bash\npip install -r requirements.txt\npython main.py\n\`\`\`"
            : ts.packageManagers.includes("Go modules")
              ? "**Using Go:**\n\`\`\`bash\ngo mod download\ngo run .\n\`\`\`"
              : ts.packageManagers.includes("Cargo")
                ? "**Using Rust:**\n\`\`\`bash\ncargo build\ncargo run\n\`\`\`"
                : "Check the README for setup instructions."
}

#### What to Read First

1. **README.md** — Project overview, setup instructions, and contribution guidelines
2. **${repo.importantFiles[0]?.path || "package.json"}** — Dependencies and available scripts
3. **${repo.importantFiles.find((f) => /index|main|app|server/i.test(f.path))?.path || "Entry file"}** — Application entry point

#### Common Pitfalls for Beginners

- **Missing environment variables** — Copy \`.env.example\` to \`.env\` if it exists
- **Wrong Node version** — Check if there's a \`.nvmrc\` or \`engines\` field in package.json
- **Port conflicts** — Default ports (3000, 8000) may be in use
- **Database not running** — Some projects need local PostgreSQL, MongoDB, etc.

> **Note:** This guidance is generated from repository structure. Always check the README for project-specific instructions.`;
  }

  if (
    q.includes("tech") ||
    q.includes("stack") ||
    q.includes("language") ||
    q.includes("framework")
  ) {
    return `### Complete Technology Stack

${header}

#### Programming Languages

${fmtList(ts.languages)}

${
  ts.languages.length > 1
    ? `\n**Multi-language project** — Different languages serve different purposes:\n${ts.languages
        .map((lang) => {
          if (lang === "TypeScript" || lang === "JavaScript")
            return `- **${lang}** — Likely frontend/backend web code`;
          if (lang === "Python") return `- **${lang}** — Backend services, data processing, or ML`;
          if (lang === "Go") return `- **${lang}** — High-performance backend services`;
          if (lang === "Rust")
            return `- **${lang}** — Systems programming, performance-critical code`;
          if (lang === "HTML") return `- **${lang}** — Markup for web pages`;
          if (lang === "CSS") return `- **${lang}** — Styling and layout`;
          return `- **${lang}**`;
        })
        .join("\n")}`
    : ""
}

#### Frontend Technologies

${ts.frontend.length ? fmtList(ts.frontend) : "_No frontend framework detected — may be a backend-only or CLI project._"}

${
  ts.frontend.length
    ? `\n**Frontend architecture:**\n${
        ts.frontend.includes("Next.js")
          ? "- Server-side rendering with React\n- File-based routing\n- API routes co-located with frontend"
          : ts.frontend.includes("React")
            ? "- Component-based UI\n- Virtual DOM for efficient updates\n- Likely client-side routing"
            : ts.frontend.includes("Vue")
              ? "- Progressive framework\n- Reactive data binding\n- Single-file components"
              : "- Check the framework documentation for architecture patterns"
      }`
    : ""
}

#### Backend Technologies

${ts.backend.length ? fmtList(ts.backend) : "_No backend detected — may be a static site or frontend-only app._"}

${
  ts.backend.length
    ? `\n**Backend patterns:**\n${
        ts.backend.some((b) => b.includes("Node.js"))
          ? "- JavaScript/TypeScript on the server\n- Async I/O for handling concurrent requests\n- npm ecosystem for packages"
          : ts.backend.some((b) => b.includes("Python"))
            ? "- Python web framework (Flask/Django/FastAPI)\n- Rich ecosystem for data processing\n- WSGI/ASGI server deployment"
            : ts.backend.some((b) => b.includes("Go"))
              ? "- Compiled binary for fast startup\n- Built-in concurrency with goroutines\n- Static typing and performance"
              : "- Check the entry file for framework initialization"
      }`
    : ""
}

#### Build & Development Tools

${fmtList(ts.buildTools)}

${ts.buildTools.includes("TypeScript") ? "\n**TypeScript benefits:**\n- Static type checking catches errors early\n- Better IDE autocomplete and refactoring\n- Compiles to JavaScript for runtime" : ""}

${ts.buildTools.includes("Vite") ? "\n**Vite features:**\n- Lightning-fast HMR (Hot Module Replacement)\n- Native ES modules in dev\n- Optimized production builds" : ""}

#### Package Management

${fmtList(ts.packageManagers)}

#### Deployment & Infrastructure

${ts.deployment.length ? fmtList(ts.deployment) : "_No deployment configuration detected at root level._"}

${ts.deployment.includes("Docker") ? "\n**Docker deployment:**\n- Containerized application\n- Consistent environment across dev/prod\n- Check \`Dockerfile\` for build steps" : ""}

${ts.deployment.includes("Vercel") ? "\n**Vercel deployment:**\n- Optimized for Next.js and frontend frameworks\n- Automatic deployments from Git\n- Edge network for global performance" : ""}

${ts.deployment.includes("Cloudflare Workers") ? "\n**Cloudflare Workers:**\n- Edge computing platform\n- Runs code close to users globally\n- Serverless with instant cold starts" : ""}

#### Testing Infrastructure

${ts.testing.length ? fmtList(ts.testing) : "_No testing framework detected — tests may be minimal or absent._"}

${ts.testing.length ? `\n**Testing strategy:**\n${ts.testing.includes("Vitest") || ts.testing.includes("Jest") ? "- Unit tests for individual functions/components\n- Run with \`npm test\` or similar command" : ""}${ts.testing.includes("Playwright") || ts.testing.includes("Cypress") ? "\n- E2E tests simulating real user interactions\n- Browser automation for integration testing" : ""}` : ""}

#### Database & Data Layer

${ts.databases.length ? fmtList(ts.databases) : "_No database tools detected — may use external services or be stateless._"}

> **Note:** This stack analysis is based on configuration files and folder structure. Actual usage may vary.`;
  }

  if (q.includes("test")) {
    return `### Testing Strategy & Setup

${header}

#### Detected Testing Tools

${ts.testing.length ? fmtList(ts.testing) : "**No testing framework detected** — The project may not have automated tests, or they're configured in a non-standard way."}

#### Test Organization

**Where to find tests:**
- \`tests/\` or \`test/\` — Dedicated test directory
- \`__tests__/\` — Jest convention (co-located with source)
- \`*.test.ts\` or \`*.spec.ts\` — Test files alongside source code
- \`e2e/\` or \`integration/\` — End-to-end test suites

**Common test patterns:**
\`\`\`
src/
  utils/
    math.ts
    math.test.ts     ← Unit test
  components/
    Button.tsx
    Button.test.tsx  ← Component test
tests/
  integration/
    api.test.ts      ← Integration test
  e2e/
    user-flow.spec.ts ← E2E test
\`\`\`

#### Running Tests

${
  ts.testing.includes("Vitest")
    ? "**Vitest (fast Vite-native testing):**\n\`\`\`bash\nnpm run test        # Run all tests\nnpm run test:watch  # Watch mode\nnpm run test:ui     # UI mode\n\`\`\`"
    : ts.testing.includes("Jest")
      ? "**Jest (popular JavaScript testing):**\n\`\`\`bash\nnpm test           # Run all tests\nnpm test -- --watch # Watch mode\nnpm test -- --coverage # Coverage report\n\`\`\`"
      : ts.testing.includes("Playwright")
        ? "**Playwright (E2E testing):**\n\`\`\`bash\nnpx playwright test           # Run all E2E tests\nnpx playwright test --ui      # UI mode\nnpx playwright test --debug   # Debug mode\n\`\`\`"
        : ts.testing.includes("Cypress")
          ? "**Cypress (E2E testing):**\n\`\`\`bash\nnpx cypress open   # Interactive mode\nnpx cypress run    # Headless mode\n\`\`\`"
          : "**Check package.json scripts:**\n\`\`\`bash\nnpm test  # or yarn test, pnpm test\n\`\`\`"
}

#### Test Types Explained

**Unit Tests:**
- Test individual functions or components in isolation
- Fast execution, no external dependencies
- Example: Testing a utility function that formats dates

**Integration Tests:**
- Test how multiple units work together
- May involve database, API calls, or file system
- Example: Testing an API endpoint that queries the database

**End-to-End (E2E) Tests:**
- Test complete user workflows in a real browser
- Slowest but most comprehensive
- Example: User signs up, logs in, creates a post, logs out

#### Writing Your First Test

${ts.testing.includes("Vitest") || ts.testing.includes("Jest") ? "**Example unit test:**\n\`\`\`typescript\nimport { describe, it, expect } from 'vitest';\nimport { add } from './math';\n\ndescribe('add function', () => {\n  it('should add two numbers', () => {\n    expect(add(2, 3)).toBe(5);\n  });\n});\n\`\`\`" : ""}

${ts.testing.includes("Playwright") ? "\n**Example E2E test:**\n\`\`\`typescript\nimport { test, expect } from '@playwright/test';\n\ntest('user can log in', async ({ page }) => {\n  await page.goto('/login');\n  await page.fill('[name=\"email\"]', 'user@example.com');\n  await page.fill('[name=\"password\"]', 'password123');\n  await page.click('button[type=\"submit\"]');\n  await expect(page).toHaveURL('/dashboard');\n});\n\`\`\`" : ""}

#### Test Coverage

To generate a coverage report:
\`\`\`bash
npm test -- --coverage
\`\`\`

**Good coverage targets:**
- **80%+ for critical business logic**
- **60%+ for overall codebase**
- **100% for security-sensitive code**

> **Note:** High coverage doesn't guarantee quality — focus on testing critical paths and edge cases.`;
  }

  if (q.includes("deploy") || q.includes("ci") || q.includes("hosting")) {
    return `### Deployment & CI/CD Pipeline

${header}

#### Detected Deployment Tools

${ts.deployment.length ? fmtList(ts.deployment) : "_No deployment configuration detected — may be deployed manually or through undocumented process._"}

#### Continuous Integration

${repo.importantFolders.some((f) => f.path === ".github") ? "**GitHub Actions detected:**\n- Workflows in \`.github/workflows/\`\n- Automated on push, PR, or schedule\n- Common jobs: lint, test, build, deploy\n\n**Check workflows:**\n\`\`\`bash\nls .github/workflows/\n\`\`\`" : "**No CI configuration detected** — Consider adding:\n- GitHub Actions (\`.github/workflows/\`)\n- GitLab CI (\`.gitlab-ci.yml\`)\n- CircleCI (\`.circleci/config.yml\`)"}

#### Deployment Strategies

${ts.deployment.includes("Docker") ? "**Docker Deployment:**\n\n1. **Build the image:**\n   \`\`\`bash\n   docker build -t ${repo.name} .\n   \`\`\`\n\n2. **Run locally:**\n   \`\`\`bash\n   docker run -p 3000:3000 ${repo.name}\n   \`\`\`\n\n3. **Deploy to production:**\n   - Push to Docker Hub or container registry\n   - Deploy to Kubernetes, ECS, or Docker Swarm\n   - Use docker-compose for multi-container apps" : ""}

${ts.deployment.includes("Vercel") ? "\n**Vercel Deployment:**\n\n1. **Install Vercel CLI:**\n   \`\`\`bash\n   npm i -g vercel\n   \`\`\`\n\n2. **Deploy:**\n   \`\`\`bash\n   vercel\n   \`\`\`\n\n3. **Production:**\n   \`\`\`bash\n   vercel --prod\n   \`\`\`\n\n**Features:**\n- Automatic HTTPS\n- Global CDN\n- Preview deployments for PRs\n- Environment variables in dashboard" : ""}

${ts.deployment.includes("Cloudflare Workers") ? "\n**Cloudflare Workers Deployment:**\n\n1. **Install Wrangler:**\n   \`\`\`bash\n   npm i -g wrangler\n   \`\`\`\n\n2. **Deploy:**\n   \`\`\`bash\n   wrangler deploy\n   \`\`\`\n\n**Configuration:**\n- Check \`wrangler.toml\` or \`wrangler.jsonc\`\n- Set secrets: \`wrangler secret put SECRET_NAME\`\n- View logs: \`wrangler tail\`" : ""}

${ts.deployment.includes("Netlify") ? "\n**Netlify Deployment:**\n\n1. **Install Netlify CLI:**\n   \`\`\`bash\n   npm i -g netlify-cli\n   \`\`\`\n\n2. **Deploy:**\n   \`\`\`bash\n   netlify deploy\n   \`\`\`\n\n3. **Production:**\n   \`\`\`bash\n   netlify deploy --prod\n   \`\`\`" : ""}

#### Environment Variables

**Production secrets:**
- Never commit secrets to Git
- Use platform-specific secret management:
  - Vercel: Dashboard → Settings → Environment Variables
  - Netlify: Site settings → Build & deploy → Environment
  - Docker: Pass via \`-e\` flag or env file
  - Cloudflare: \`wrangler secret put\`

**Required variables (check \`.env.example\`):**
${repo.importantFiles.some((f) => f.path === ".env.example") ? "- See \`.env.example\` for the complete list\n- Copy to \`.env\` locally\n- Set in deployment platform for production" : "- Check the README or source code for required env vars"}

#### Deployment Checklist

Before deploying to production:
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Build succeeds locally
- [ ] Security headers configured
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Performance monitoring enabled
- [ ] Backup strategy in place

#### Branch Strategy

**Default branch:** \`${repo.defaultBranch}\`

**Common workflows:**
- \`main\`/\`master\` → Production
- \`develop\` → Staging
- \`feature/*\` → Feature branches
- Pull requests trigger preview deployments

> **Note:** Deployment configuration is inferred from detected files. Check project documentation for specific instructions.`;
  }

  if (
    q.includes("architect") ||
    q.includes("structure") ||
    q.includes("organi") ||
    q.includes("flow")
  ) {
    return `### Complete Architecture Analysis

${header}

#### Architecture Patterns

${repo.architecture.map((a) => `**${a.title}**\n\n${a.description}`).join("\n\n")}

#### Application Data Flow

${repo.applicationFlow}

**Detailed request/response cycle:**
1. **User interaction** triggers an event (click, form submit, page load)
2. **Client-side logic** processes the event (validation, state update)
3. **API request** sent to backend (if needed)
4. **Server receives** and routes to appropriate handler
5. **Business logic executes** (authentication, data processing)
6. **Database query** (if data persistence needed)
7. **Response formatted** and sent back to client
8. **UI updates** to reflect new state

#### Project Structure & Organization

${fmtFolderList(repo.importantFolders)}

**How folders relate:**
${
  repo.importantFolders.some((f) => /components/i.test(f.path)) &&
  repo.importantFolders.some((f) => /pages|routes/i.test(f.path))
    ? "- **components/** provides reusable UI → **pages/** composes them into views\n"
    : ""
}${
      repo.importantFolders.some((f) => /api|routes/i.test(f.path)) &&
      repo.importantFolders.some((f) => /services/i.test(f.path))
        ? "- **routes/** handles HTTP → **services/** contains business logic\n"
        : ""
    }${
      repo.importantFolders.some((f) => /models/i.test(f.path)) &&
      repo.importantFolders.some((f) => /controllers/i.test(f.path))
        ? "- **models/** defines data → **controllers/** orchestrates operations\n"
        : ""
    }${
      repo.importantFolders.some((f) => /lib|utils/i.test(f.path))
        ? "- **lib/** or **utils/** provides shared helpers used everywhere\n"
        : ""
    }

#### Design Principles Observed

${repo.architecture.some((a) => /monorepo/i.test(a.title)) ? "**Monorepo architecture:**\n- Multiple packages share tooling and dependencies\n- Each workspace is independently deployable\n- Shared code lives in common packages\n\n" : ""}${repo.architecture.some((a) => /full-stack/i.test(a.title)) ? "**Full-stack integration:**\n- Frontend and backend in same repository\n- Shared types between client and server\n- Unified deployment pipeline\n\n" : ""}${repo.developerInsights.modularity.includes("modular") ? "**Modular design:**\n- Clear separation of concerns\n- Each module has a single responsibility\n- Easy to test and maintain independently\n\n" : ""}

#### Entry Points by Use Case

**For developers:**
- Start at \`${repo.importantFiles.find((f) => /readme/i.test(f.path))?.path || "README.md"}\` for overview
- Check \`${repo.importantFiles.find((f) => /package\.json|requirements\.txt|go\.mod/i.test(f.path))?.path || "package.json"}\` for dependencies
- Open \`${repo.importantFiles.find((f) => /index|main|app|server/i.test(f.path))?.path || "src/index.ts"}\` to trace execution

**For contributors:**
- Read contribution guidelines (CONTRIBUTING.md if present)
- Check issue templates in \`.github/\`
- Review recent pull requests for code style

**For users:**
- Installation instructions in README
- API documentation (if library/framework)
- Example usage in \`examples/\` folder

> **Note:** This analysis is based on detected patterns. Actual architecture may have additional nuances.`;
  }

  if (q.includes("file") || q.includes("config") || q.includes("important")) {
    return `### Important Files & Configuration

${header}

#### Critical Files Detected

${fmtFileList(repo.importantFiles)}

#### File Categories Explained

**Configuration files:**
${
  repo.importantFiles.filter((f) => /config|\.json|\.toml|\.yaml|\.yml/i.test(f.path)).length
    ? repo.importantFiles
        .filter((f) => /config|\.json|\.toml|\.yaml|\.yml/i.test(f.path))
        .map((f) => `- \`${f.path}\` — ${f.why}`)
        .join("\n")
    : "- No major config files detected at root"
}

**Entry points:**
${
  repo.importantFiles.filter((f) => /index|main|app|server/i.test(f.path)).length
    ? repo.importantFiles
        .filter((f) => /index|main|app|server/i.test(f.path))
        .map((f) => `- \`${f.path}\` — ${f.why}`)
        .join("\n")
    : "- Check \`src/\` folder for entry files"
}

**Build & tooling:**
${
  repo.importantFiles.filter((f) => /vite|webpack|rollup|tsconfig|babel/i.test(f.path)).length
    ? repo.importantFiles
        .filter((f) => /vite|webpack|rollup|tsconfig|babel/i.test(f.path))
        .map((f) => `- \`${f.path}\` — ${f.why}`)
        .join("\n")
    : "- Standard build configuration"
}

**Deployment:**
${
  repo.importantFiles.filter((f) => /docker|vercel|netlify|wrangler/i.test(f.path)).length
    ? repo.importantFiles
        .filter((f) => /docker|vercel|netlify|wrangler/i.test(f.path))
        .map((f) => `- \`${f.path}\` — ${f.why}`)
        .join("\n")
    : "- No deployment config at root"
}

#### What Each File Controls

**Dependency management:**
- Defines what external code the project needs
- Locks versions for reproducible builds
- Specifies scripts for common tasks (dev, build, test)

**TypeScript configuration:**
- Sets compiler strictness and target
- Defines path aliases for imports
- Controls type checking behavior

**Build tool configuration:**
- Configures bundling and optimization
- Sets up dev server and HMR
- Defines environment-specific builds

**Deployment configuration:**
- Specifies runtime environment
- Sets build commands and output directory
- Configures environment variables and secrets

#### Files You Shouldn't Edit Directly

- **Lock files** (\`package-lock.json\`, \`yarn.lock\`, \`bun.lockb\`) — Auto-generated
- **Build output** (\`dist/\`, \`build/\`, \`.next/\`) — Generated by build process
- **Generated types** (\`*.gen.ts\`, \`routeTree.gen.ts\`) — Auto-generated from source

#### Files to Check When Things Break

1. **Dependencies not installing?** → Check lock file and package manager version
2. **Build failing?** → Check build tool config (vite.config, webpack.config)
3. **Types not working?** → Check tsconfig.json paths and includes
4. **Deploy failing?** → Check deployment config and environment variables

> **Note:** Always read file comments and documentation before modifying configuration.`;
  }

  if (q.includes("license")) {
    return `### License & Usage Rights

${header}

#### License Information

${
  repo.license
    ? `**Licensed under: ${repo.license}**

**What this means:**
${
  repo.license.includes("MIT")
    ? "- Commercial use allowed\n- Modification allowed\n- Distribution allowed\n- Private use allowed\n- Must include license and copyright notice\n- No liability or warranty"
    : repo.license.includes("Apache")
      ? "- Commercial use allowed\n- Modification allowed\n- Distribution allowed\n- Patent grant included\n- Must include license, copyright, and state changes\n- No liability or warranty"
      : repo.license.includes("GPL")
        ? "- Commercial use allowed\n- Modification allowed\n- Distribution allowed\n- Must disclose source code\n- Must use same license for derivatives\n- No liability or warranty"
        : repo.license.includes("BSD")
          ? "- Commercial use allowed\n- Modification allowed\n- Distribution allowed\n- Must include license and copyright notice\n- No liability or warranty"
          : "- Check the LICENSE file for specific terms"
}

**Common use cases:**
- **Using as a dependency:** ${repo.license.includes("MIT") || repo.license.includes("Apache") || repo.license.includes("BSD") ? "Safe to use in commercial projects" : "Check license compatibility"}
- **Forking and modifying:** ${repo.license.includes("GPL") ? "Must open-source your modifications" : "Allowed with attribution"}
- **Redistributing:** ${repo.license ? "Allowed with proper attribution" : "No license = no permission"}`
    : "**No license detected**\n\n**Important:** Without a license, the code is under exclusive copyright by default. This means:\n- You cannot use it commercially\n- You cannot modify it\n- You cannot distribute it\n- You cannot fork it\n\n**What to do:**\n1. Check for a LICENSE file in the repository\n2. Contact the repository owner for clarification\n3. Request they add an open-source license\n4. Consider using a different project with a clear license"
}

#### Attribution Requirements

${
  repo.license
    ? `When using this project, you should:
1. Include a copy of the LICENSE file
2. Preserve copyright notices
3. State any modifications you made
4. Link back to the original repository: ${repo.url}`
    : "Without a license, you cannot legally use this code."
}

#### Contributing

${repo.license ? `By contributing to this project, you agree to license your contributions under the same ${repo.license} license.` : "Check with the maintainer about contribution terms."}

**Before contributing:**
- Read CONTRIBUTING.md (if present)
- Check for a Contributor License Agreement (CLA)
- Ensure your contributions are your own work

> **Disclaimer:** This is not legal advice. Consult a lawyer for specific legal questions.`;
  }

  if (
    q.includes("scale") ||
    q.includes("size") ||
    q.includes("popular") ||
    q.includes("active") ||
    q.includes("health") ||
    q.includes("quality")
  ) {
    return `### Project Health & Maturity

${header}

#### Community Metrics

- **Stars:** ${repo.stars.toLocaleString()}
- **Forks:** ${repo.forks.toLocaleString()}
- **Open Issues:** ${repo.issues.toLocaleString()}
- **Created:** ${new Date(repo.createdAt).toLocaleDateString()}
- **Last Updated:** ${new Date(repo.pushedAt).toLocaleDateString()}

#### Repository Health Assessment

**Documentation Quality**
${repo.repositoryHealth.documentationQuality}

**Project Structure**
${repo.repositoryHealth.projectStructure}

**Maintainability Score**
${repo.repositoryHealth.maintainabilityScore}

**Onboarding Difficulty**
${repo.repositoryHealth.onboardingDifficulty}

**Dependency Complexity**
${repo.repositoryHealth.dependencyComplexity}

**Code Organization**
${repo.repositoryHealth.codeOrganization}

#### Developer Insights

**Project Scale**
${repo.developerInsights.scale}

${
  repo.stars > 10000
    ? "**Implications:**\n- Battle-tested in production\n- Large community for support\n- Extensive documentation likely\n- Breaking changes are rare and well-communicated"
    : repo.stars > 1000
      ? "**Implications:**\n- Proven in real-world use\n- Active community\n- Good documentation\n- Regular updates and bug fixes"
      : repo.stars > 100
        ? "**Implications:**\n- Early adopters using it\n- Growing community\n- Documentation may be incomplete\n- API may still evolve"
        : "**Implications:**\n- Experimental or personal project\n- Limited community support\n- Use with caution in production\n- May be abandoned"
}

**Maintainability**
${repo.developerInsights.maintainability}

${
  repo.developerInsights.maintainability.includes("Strong")
    ? "**What this means:**\n- Easy to understand and modify\n- Low risk of introducing bugs\n- Good for learning and contributing\n- Scales well as project grows"
    : repo.developerInsights.maintainability.includes("Decent")
      ? "**What this means:**\n- Reasonably maintainable\n- Some technical debt may exist\n- Contributions require care\n- Consider adding tests or types"
      : "**What this means:**\n- May be hard to modify safely\n- Higher risk of bugs\n- Contributions need extra review\n- Consider refactoring before major changes"
}

**Code Organization**
${repo.developerInsights.modularity}

**Collaboration Style**
${repo.developerInsights.collaboration}

${
  repo.developerInsights.collaboration.includes("community")
    ? "**How to engage:**\n- Check open issues for good first issues\n- Read contribution guidelines\n- Join discussions in issues/PRs\n- Follow the code of conduct"
    : "**How to engage:**\n- Open an issue before major changes\n- Coordinate directly with maintainers\n- Keep PRs focused and small\n- Be patient with review times"
}

**Development Activity**
${repo.developerInsights.activity}

${
  repo.developerInsights.activity.includes("Active")
    ? "**What to expect:**\n- Quick response to issues\n- Regular updates and releases\n- Active maintenance and bug fixes\n- Safe to depend on"
    : repo.developerInsights.activity.includes("Recently")
      ? "**What to expect:**\n- Slower response times\n- Occasional updates\n- May need to fork for urgent fixes\n- Evaluate alternatives"
      : "**What to expect:**\n- Project may be abandoned\n- No support for issues\n- Consider forking or finding alternatives\n- Use only if you can maintain it yourself"
}

#### Should You Use This Project?

**Good fit if:**
${repo.stars > 1000 ? "- You need a proven, stable solution\n" : ""}${repo.developerInsights.maintainability.includes("Strong") ? "- You may need to customize or extend it\n" : ""}${repo.developerInsights.activity.includes("Active") ? "- You need ongoing support and updates\n" : ""}${ts.testing.length > 0 ? "- You value code quality and testing\n" : ""}

**Consider alternatives if:**
${repo.stars < 100 ? "- You need production-grade stability\n" : ""}${repo.developerInsights.activity.includes("inactive") ? "- You need active maintenance\n" : ""}${!ts.testing.length ? "- You require comprehensive test coverage\n" : ""}${!repo.license ? "- You need clear licensing terms\n" : ""}

> **Note:** These insights are based on repository metadata and structure. Always evaluate the actual code quality and fit for your use case.`;
  }

  // Generic structured fallback
  return `### Repository Analysis

${header}

I don't have a specific answer for _"${question.replace(/\?$/, "")}"_, but here's a comprehensive overview to help you find what you need:

#### Project Structure

**Top-level organization:**
${fmtFolderList(repo.importantFolders.slice(0, 6))}

**Key files:**
${repo.importantFiles
  .slice(0, 5)
  .map((f) => `- \`${f.path}\` — ${f.why}`)
  .join("\n")}

#### Technology Stack

**Languages:** ${ts.languages.join(", ") || "Not detected"}
**Frontend:** ${ts.frontend.join(", ") || "None detected"}
**Backend:** ${ts.backend.join(", ") || "None detected"}
**Build Tools:** ${ts.buildTools.slice(0, 3).join(", ") || "Standard tooling"}

#### Architecture Summary

${repo.architecture[0] ? `**${repo.architecture[0].title}**\n${repo.architecture[0].description}` : "Standard project layout"}

#### How to Find Your Answer

1. **Search the codebase:**
   \`\`\`bash
   # Search for keywords from your question
   grep -r "your-keyword" src/
   \`\`\`

2. **Check documentation:**
   - README.md for overview
   - docs/ folder for detailed guides
   - Code comments for implementation details

3. **Explore related files:**
   - Look in folders matching your question topic
   - Check imports/exports to trace dependencies
   - Review tests for usage examples

4. **Ask more specific questions:**
   Try asking about:
   - "frontend architecture"
   - "backend API structure"
   - "authentication flow"
   - "deployment process"
   - "testing strategy"

#### Quick Navigation

- **Getting started:** ${repo.beginnerGuide[0] || "Check README.md"}
- **Main entry point:** ${repo.importantFiles.find((f) => /index|main|app/i.test(f.path))?.path || "src/index.ts"}
- **Configuration:** ${repo.importantFiles.find((f) => /config|\.json/i.test(f.path))?.path || "package.json"}

> **Tip:** For better answers, try asking more specific questions about particular aspects of the repository (architecture, tech stack, deployment, etc.).`;
}
