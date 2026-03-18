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

export interface YorckFilm {
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
  slug: string;
  link: string | null;
  image: string | null;
  imageAlt: string;
  tagline: string;
  runtime: number | null;
  fsk: number | null;
  releaseDate: string | null;
  isYorckPick: boolean;
  distributor: string | null;
  tags: string[];
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
