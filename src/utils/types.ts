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
