// Release data from this repo's GitHub releases, read at build time. The page reads them again
// in the browser (see the script in index.astro), so a new release and its notes show up before
// the next deploy.

export const REPO = 'sophie-maney/neuetunes-releases';
export const RELEASES_URL = `https://github.com/${REPO}/releases`;
// scripts/release.sh in the app repo uploads every DMG a second time under this name, so the
// download buttons always point at the latest release's copy.
export const STABLE_DMG = 'neueTunes.dmg';
export const STABLE_DMG_URL = `${RELEASES_URL}/latest/download/${STABLE_DMG}`;

export interface Release {
  version: string;
  date: string;
  url: string;
  notes: string[];
  dmgBytes: number | null;
}

export interface GitHubRelease {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  assets: { name: string; size: number; browser_download_url: string }[];
}

export function toRelease(r: GitHubRelease): Release {
  const dmg = r.assets.find((a) => a.name === STABLE_DMG) ?? r.assets.find((a) => a.name.endsWith('.dmg'));
  return {
    version: r.tag_name.replace(/^v/, ''),
    date: r.published_at,
    url: r.html_url,
    // Bullets only: the body ends with the commit it was built from, in a private repo.
    notes: (r.body ?? '')
      .split('\n')
      .filter((line) => /^\s*[-*] /.test(line))
      .map((line) => line.replace(/^\s*[-*] /, '').trim()),
    dmgBytes: dmg?.size ?? null,
  };
}

// The API lists newest first; leave out drafts and prereleases, as releases/latest does.
export function publishedReleases(all: GitHubRelease[], count: number): Release[] {
  return all.filter((r) => !r.draft && !r.prerelease).slice(0, count).map(toRelease);
}

export async function fetchReleases(count = 3): Promise<Release[]> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  // Optional: Vercel's shared build IPs can hit the unauthenticated rate limit.
  const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=${count + 2}`, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const all = (await res.json()) as GitHubRelease[];
    return publishedReleases(all, count);
  } catch (error) {
    console.warn(`Couldn't read releases, building without them: ${error}`);
    return [];
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function formatSize(bytes: number | null): string | null {
  return bytes ? `${Math.round(bytes / 1_000_000)} MB` : null;
}
