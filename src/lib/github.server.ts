// GitHub public API helpers (server-only)

const GH = "https://api.github.com";

// Store the environment context for accessing Cloudflare env variables
let envContext: { GITHUB_TOKEN?: string } | undefined;

/**
 * Set the environment context for GitHub API requests
 * This should be called with the Cloudflare env object
 */
export function setGitHubEnv(env: { GITHUB_TOKEN?: string }) {
  envContext = env;
}

/**
 * Get headers for GitHub API requests with authentication if available
 * Supports both Cloudflare Workers env and Node.js process.env
 */
const headers = (): Record<string, string> => {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RepoMind",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  
  // Try Cloudflare env first, then fall back to process.env
  const token = envContext?.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  
  return h;
};

export interface GhRepo {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  topics?: string[];
  license?: { name: string } | null;
  owner: { login: string; avatar_url: string };
  pushed_at: string;
  created_at: string;
}

export interface GhTreeEntry {
  path: string;
  type: "blob" | "tree";
}

/**
 * Handle GitHub API rate limit errors with detailed information
 */
function handleRateLimitError(response: Response): Error {
  const remaining = response.headers.get("x-ratelimit-remaining");
  const reset = response.headers.get("x-ratelimit-reset");
  
  if (remaining === "0" && reset) {
    const resetDate = new Date(parseInt(reset) * 1000);
    const minutesUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / 60000);
    return new Error(
      `GitHub API rate limit exceeded. Please try again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`
    );
  }
  
  return new Error("GitHub API rate limit reached. Please try again later.");
}

export async function fetchRepo(owner: string, name: string): Promise<GhRepo> {
  const r = await fetch(`${GH}/repos/${owner}/${name}`, { headers: headers() });
  
  if (r.status === 404) {
    throw new Error("Repository not found. Make sure the URL points to a public GitHub repo.");
  }
  
  if (r.status === 403) {
    throw handleRateLimitError(r);
  }
  
  if (!r.ok) {
    throw new Error(`GitHub API error (${r.status})`);
  }
  
  return (await r.json()) as GhRepo;
}

export async function fetchLanguages(owner: string, name: string): Promise<Record<string, number>> {
  const r = await fetch(`${GH}/repos/${owner}/${name}/languages`, { headers: headers() });
  
  if (r.status === 403) {
    console.warn("GitHub API rate limit reached while fetching languages");
    return {};
  }
  
  if (!r.ok) return {};
  return (await r.json()) as Record<string, number>;
}

export async function fetchReadme(owner: string, name: string): Promise<string> {
  const r = await fetch(`${GH}/repos/${owner}/${name}/readme`, {
    headers: { ...headers(), Accept: "application/vnd.github.raw" },
  });
  
  if (r.status === 403) {
    console.warn("GitHub API rate limit reached while fetching README");
    return "";
  }
  
  if (!r.ok) return "";
  return await r.text();
}

export async function fetchTopLevel(
  owner: string,
  name: string,
  branch: string,
): Promise<GhTreeEntry[]> {
  const r = await fetch(
    `${GH}/repos/${owner}/${name}/contents/?ref=${encodeURIComponent(branch)}`,
    {
      headers: headers(),
    },
  );
  
  if (r.status === 403) {
    console.warn("GitHub API rate limit reached while fetching top-level files");
    return [];
  }
  
  if (!r.ok) return [];
  const items = (await r.json()) as Array<{ path: string; type: string }>;
  return items.map((i) => ({ path: i.path, type: i.type === "dir" ? "tree" : "blob" }));
}
