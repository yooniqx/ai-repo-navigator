// GitHub public API helpers (server-only)

const GH = "https://api.github.com";

const headers = (): Record<string, string> => {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RepoMind",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
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

export async function fetchRepo(owner: string, name: string): Promise<GhRepo> {
  const r = await fetch(`${GH}/repos/${owner}/${name}`, { headers: headers() });
  if (r.status === 404)
    throw new Error("Repository not found. Make sure the URL points to a public GitHub repo.");
  if (r.status === 403)
    throw new Error("GitHub API rate limit reached. Please try again in a minute.");
  if (!r.ok) throw new Error(`GitHub API error (${r.status})`);
  return (await r.json()) as GhRepo;
}

export async function fetchLanguages(owner: string, name: string): Promise<Record<string, number>> {
  const r = await fetch(`${GH}/repos/${owner}/${name}/languages`, { headers: headers() });
  if (!r.ok) return {};
  return (await r.json()) as Record<string, number>;
}

export async function fetchReadme(owner: string, name: string): Promise<string> {
  const r = await fetch(`${GH}/repos/${owner}/${name}/readme`, {
    headers: { ...headers(), Accept: "application/vnd.github.raw" },
  });
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
  if (!r.ok) return [];
  const items = (await r.json()) as Array<{ path: string; type: string }>;
  return items.map((i) => ({ path: i.path, type: i.type === "dir" ? "tree" : "blob" }));
}
