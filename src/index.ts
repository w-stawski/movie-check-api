import { serve } from "@hono/node-server";
import { put } from "@vercel/blob";
import "dotenv/config";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { cors } from "hono/cors";
import {
  BLOB_URL,
  getExtendedMovieData,
  getYorckMovies,
} from "./get-movies.js";

const app = new Hono();

const allowedKeys = (process.env.ALLOWED_KEYS || "").split(",");

app.use("*", cors());

app.use("/validate-*", (c, next) => {
  const auth = bearerAuth({ token: allowedKeys });
  return auth(c, next);
});

// Health Check
app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/update-movies", async (c) => {
  try {
    const yorckMoviesData = await getYorckMovies();
    const extendedMoviesData = await getExtendedMovieData(yorckMoviesData);

    const { url } = await put(
      "berlin-movies.json",
      JSON.stringify(extendedMoviesData),
      {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
      },
    );

    return c.json({ success: true, count: extendedMoviesData.length, url });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.get("/movies", (c) => {
  return c.redirect(BLOB_URL, 302);
});

const port = Number(process.env.PORT) || 3350;

if (process.env.NODE_ENV !== "production") {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`
      'Movie check API running on: http://localhost:${info.port}`);
  });
}

export default app;
