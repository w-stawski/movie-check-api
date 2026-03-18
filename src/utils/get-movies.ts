import type { ProcessedMovie, YorckFilm, YorckSession } from './types.js';


const YORCK_BASE_URL = "https://www.yorck.de";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function getYorckMovies(): Promise<ProcessedMovie[]> {
  const buildId = await fetchBuildId();
  const rawFilms = await fetchFilmsData(buildId);

  return rawFilms.map(processFilm);
}

async function fetchBuildId(): Promise<string> {
  const response = await fetch(`${YORCK_BASE_URL}/en/films`, {
    headers: { "User-Agent": USER_AGENT }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Yorck homepage: ${response.statusText}`);
  }

  const html = await response.text();
  const buildIdMatch = html.match(/"buildId":"(.*?)"/);

  if (!buildIdMatch) {
    throw new Error("Could not extract Next.js Build ID from Yorck homepage");
  }

  return buildIdMatch[1];
}

async function fetchFilmsData(buildId: string): Promise<YorckFilm[]> {
  const dataUrl = `${YORCK_BASE_URL}/_next/data/${buildId}/en/films.json`;
  const response = await fetch(dataUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch films JSON: ${response.statusText}`);
  }

  const data = await response.json();
  return data.pageProps?.films || [];
}

function processFilm(film: YorckFilm): ProcessedMovie {
  const { fields: f, sys } = film;

  return {
    id: sys?.id,
    title: f.title || "Untitled",
    slug: f.slug || "",
    link: f.slug ? `${YORCK_BASE_URL}/en/films/${f.slug}` : null,
    image: formatImageUrl(f.heroImage?.fields?.image?.fields?.file?.url),
    imageAlt: f.heroImage?.fields?.image?.fields?.description || "",
    tagline: f.tagline || "",
    runtime: f.runtime || null,
    fsk: f.fsk || null,
    releaseDate: f.releaseDate || null,
    isYorckPick: !!f.yorckPick,
    distributor: f.distributor || null,
    tags: formatTags(f.mainLabel, f.descriptors),
    sessions: (f.sessions || []).map(processSession)
  };
}

function formatImageUrl(url?: string): string | null {
  if (!url) return null;
  return url.startsWith('//') ? `https:${url}` : url;
}

function formatTags(mainLabel?: string, descriptors?: string[]): string[] {
  const tags = [];
  if (mainLabel) tags.push(mainLabel);
  if (descriptors) tags.push(...descriptors);
  return tags;
}

function processSession(session: YorckSession) {
  return {
    id: session.sys.id,
    startTime: session.fields.startTime,
    formats: session.fields.formats || [],
    cinema: {
      name: session.fields.cinema.fields.name,
      accessibility: session.fields.cinema.fields.accessibility
    }
  };
}
