import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { put } from "@vercel/blob";
import { bearerAuth } from "hono/bearer-auth";
import { BLOB_URL, getYorckMovies } from "./utils/get-movies.js";
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
        const rawMovies = await getYorckMovies();
        const extendedMoviesData = await Promise.all(rawMovies.map(async (movie) => {
            try {
                const searchTitle = encodeURIComponent(movie.title).replace(/%20/g, "+");
                const omdbUrl = `https://www.omdbapi.com/?t=${searchTitle}&apikey=${process.env.OMDB_API_KEY}`;
                const response = await fetch(omdbUrl);
                const data = await response.json();
                return {
                    ...movie,
                    ...data,
                };
            }
            catch (e) {
                // If one movie fails, return the original movie object so the whole sync doesn't crash
                console.error(`Failed to fetch OMDb for ${movie.title}`);
                return movie;
            }
        }));
        console.log(extendedMoviesData, "eeeeee");
        const { url } = await put("berlin-movies.json", JSON.stringify(extendedMoviesData), {
            access: "public",
            addRandomSuffix: false,
            allowOverwrite: true,
        });
        return c.json({ success: true, count: extendedMoviesData.length, url });
    }
    catch (error) {
        return c.json({ success: false, error: error.message }, 500);
    }
});
app.get("/marty", async (c) => {
    try {
        const response = await fetch(`https://www.omdbapi.com/demo.aspx/?t=marty+supreme&token=${process.env.OMDB_API_KEY}`);
        const data = await response.json();
        return c.json(data);
    }
    catch (error) {
        return c.json({ success: false, error: error.message }, 500);
    }
});
app.get("/movies", (c) => {
    return c.redirect(BLOB_URL, 302);
});
const port = Number(process.env.PORT) || 3300;
if (process.env.NODE_ENV !== "production") {
    serve({ fetch: app.fetch, port }, (info) => {
        console.log(`
      'Movie check API running on http://localhost:${info.port}`);
    });
}
export default app;
