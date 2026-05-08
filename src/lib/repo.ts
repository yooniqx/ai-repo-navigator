export function parseRepoUrl(url: string): { owner: string; name: string } | null {
  try {
    const trimmed = url.trim();
    // Accept "owner/name" shorthand
    if (/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
      const [owner, name] = trimmed.split("/");
      return { owner, name: name.replace(/\.git$/, "") };
    }
    const u = new URL(trimmed);
    if (!u.hostname.includes("github.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], name: parts[1].replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

export type { AnalyzeResult } from "./analyze.server";
