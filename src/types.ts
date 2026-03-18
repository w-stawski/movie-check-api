export interface YorckSession {
  sys: { id: string };
  fields: {
    startTime: string;
    formats: string[];
    cinema: {
      fields: {
        name: string;
        accessibility: string;
      };
    };
  };
}

export interface YorckRawFilmData {
  sys: { id: string };
  fields: {
    title: string;
    slug: string;
    runtime?: number;
    fsk?: number;
    tagline?: string;
    mainLabel?: string;
    descriptors?: string[];
    releaseDate?: string;
    yorckPick?: boolean;
    distributor?: string;
    heroImage?: {
      fields: {
        image: {
          fields: {
            description: string;
            file: { url: string };
          };
        };
      };
    };
    sessions?: YorckSession[];
  };
}

export interface ProcessedMovie {
  id: string;
  title: string;
  link: string | null;
  sessions: {
    id: string;
    startTime: string;
    formats: string[];
    cinema: {
      name: string;
      accessibility: string;
    };
  }[];
}

interface Rating {
  Source: string;
  Value: string;
}

interface Cinema {
  name: string;
  accessibility: "Not accessible" | "Partially accessible" | "Fully accessible";
}

interface Session {
  id: string;
  startTime: string; // ISO 8601 format
  formats: string[];
  cinema: Cinema;
}

export interface ExtendedMovieData {
  id: string;
  title: string;
  link: string;
  sessions: Session[];
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Rating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: "movie" | "series" | "episode";
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}
