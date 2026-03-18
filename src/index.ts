import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { bearerAuth } from "hono/bearer-auth";


const app = new Hono();

const allowedKeys = (process.env.ALLOWED_KEYS || "").split(",");

app.use("*", cors());

app.use("/validate-*", (c, next) => {
  const auth = bearerAuth({ token: allowedKeys });
  return auth(c, next);
});

// Health Check
app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/movies", (c) => {
  return c.redirect(
    "https://fic7x30v7swdye53.public.blob.vercel-storage.com/berlin-movies.json",
    302,
  );
});

const port = Number(process.env.PORT) || 3000;

if (process.env.NODE_ENV !== "production") {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`
      'Movie check API running on http://localhost:${info.port}`);
  });
}

export default app;
