export function parseRepoUrl(url: string): { owner: string; name: string } | null {
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes("github.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], name: parts[1].replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

export interface AnalyzeResult {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  summary: string;
  architecture: { title: string; description: string }[];
  beginnerGuide: string[];
  importantFolders: { path: string; purpose: string }[];
  technologies: string[];
}

export function buildMockAnalysis(url: string, owner: string, name: string): AnalyzeResult {
  const fullName = `${owner}/${name}`;
  return {
    owner,
    name,
    fullName,
    url,
    summary: `${fullName} is a modern open-source project that focuses on delivering a clean, modular, and developer-friendly experience. It is organized into well-defined modules with a clear separation between core logic, utilities, and presentation. The codebase favors readability and composability, making it approachable for new contributors while still powerful enough for production use.`,
    architecture: [
      { title: "Entry Point", description: "Application bootstraps from a single root file that wires together routing, providers, and global styles." },
      { title: "Modular Layers", description: "Code is split into UI components, business logic, and integration helpers — each with a single responsibility." },
      { title: "Configuration", description: "Build, lint, and runtime configs live at the project root for easy discovery and tweaking." },
      { title: "Testing & CI", description: "Automated checks run on every push, ensuring stability across pull requests." },
    ],
    beginnerGuide: [
      `Clone ${fullName} and run the install command from the README.`,
      "Open the entry file (often src/index or src/main) to understand how the app starts.",
      "Explore the components or modules folder to see how features are composed.",
      "Read any CONTRIBUTING.md to learn the project's conventions before opening a PR.",
      "Try changing a small UI string or adding a console log to confirm your dev loop works.",
    ],
    importantFolders: [
      { path: "src/", purpose: "Main application source code." },
      { path: "src/components/", purpose: "Reusable UI building blocks." },
      { path: "src/lib/", purpose: "Utility functions and shared logic." },
      { path: "public/", purpose: "Static assets served as-is." },
      { path: "tests/", purpose: "Unit and integration tests." },
    ],
    technologies: ["TypeScript", "React", "Vite", "Node.js", "Tailwind CSS", "ESLint", "Prettier"],
  };
}

export function buildMockChatAnswer(repo: string, question: string): string {
  const q = question.toLowerCase();
  if (q.includes("start") || q.includes("begin")) {
    return `Great question! In ${repo}, start by reading the README, then jump into src/ where the entry file imports the rest of the app. Trace one feature end-to-end to build a mental model.`;
  }
  if (q.includes("test")) {
    return `${repo} uses standard test runners. Look for a tests/ or __tests__ folder, and check package.json scripts for the exact command (often \`npm test\`).`;
  }
  if (q.includes("deploy")) {
    return `Deployment for ${repo} typically runs the build script and uploads the output to a host like Vercel, Netlify, or a container registry. Check CI workflows under .github/workflows for the exact pipeline.`;
  }
  if (q.includes("architect") || q.includes("structure")) {
    return `${repo} follows a layered structure: an entry point wires providers and routing, components live in src/components, and shared logic sits in src/lib. Each layer has a single responsibility.`;
  }
  return `Based on my analysis of ${repo}: ${question.replace(/\?$/, "")} — the relevant code lives in src/. I'd recommend opening the main entry file and following imports to find the exact module responsible. (This is a placeholder answer; real AI integration coming soon.)`;
}
