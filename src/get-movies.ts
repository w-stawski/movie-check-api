import type {
  ExtendedMovieData,
  ProcessedMovie as ProcessedYorckMovie,
  YorckRawFilmData,
  YorckSession,
} from "./types.js";

export const BLOB_URL =
  "https://fic7x30v7swdye53.public.blob.vercel-storage.com/berlin-movies.json";
const YORCK_BASE_URL = "https://www.yorck.de";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Main Data Processors
 */

const fetchBuildId = async (): Promise<string> => {
  const response = await fetch(`${YORCK_BASE_URL}/en/films`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok)
    throw new Error(`Failed to fetch Yorck homepage: ${response.statusText}`);

  const html = await response.text();
  const buildIdMatch = html.match(/"buildId":"(.*?)"/);

  if (!buildIdMatch)
    throw new Error("Could not extract Next.js Build ID from Yorck homepage");

  return buildIdMatch[1];
};

const fetchFilmsData = async (buildId: string): Promise<YorckRawFilmData[]> => {
  const dataUrl = `${YORCK_BASE_URL}/_next/data/${buildId}/en/films.json`;
  const response = await fetch(dataUrl);

  if (!response.ok)
    throw new Error(`Failed to fetch films JSON: ${response.statusText}`);

  const data = await response.json();
  return data.pageProps?.films || [];
};

const processSession = (session: YorckSession) => ({
  id: session.sys.id,
  startTime: session.fields.startTime,
  formats: session.fields.formats || [],
  cinema: {
    name: session.fields.cinema.fields.name,
    accessibility: session.fields.cinema.fields.accessibility,
  },
});

const parseYorckFilmData = (film: YorckRawFilmData): ProcessedYorckMovie => {
  const { fields: f, sys } = film;

  return {
    id: sys?.id,
    title: f.title || "Untitled",
    link: f.slug ? `${YORCK_BASE_URL}/en/films/${f.slug}` : null,
    sessions: (f.sessions || []).map(processSession),
  };
};

export const getYorckMovies = async (): Promise<ProcessedYorckMovie[]> => {
  const buildId = await fetchBuildId();
  const rawFilms = await fetchFilmsData(buildId);

  return rawFilms.map(parseYorckFilmData);
};

export const getExtendedMovieData = async (
  yorckMoviesData: ProcessedYorckMovie[],
): Promise<ExtendedMovieData[]> => {
  return await Promise.all(
    yorckMoviesData.map(async (movie: any) => {
      try {
        const searchTitle = encodeURIComponent(movie.title).replace(
          /%20/g,
          "+",
        );
        const omdbUrl = `https://www.omdbapi.com/?t=${searchTitle}&apikey=${process.env.OMDB_API_KEY}`;

        const response = await fetch(omdbUrl);
        const data = await response.json();

        return { ...movie, ...data };
      } catch (e) {
        console.error(`Failed to fetch OMDb for ${movie.title}`, e);
        return movie;
      }
    }),
  );
};
