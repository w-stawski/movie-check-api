import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import {
  calculatePoints,
  getDictFilter,
  isWordInDict,
} from "../utils/helpers.js";
import type {
  BatchWordRequest,
  BloomFilterType,
  WordRequest,
  WordValidationResult,
} from "../utils/types.js";
import { bearerAuth } from "hono/bearer-auth";

let filter: BloomFilterType | null = getDictFilter();

if (!filter) {
  throw new Error("No Failed to init dictionary filter");
}

const app = new Hono();

const allowedKeys = (process.env.ALLOWED_KEYS || "").split(",");

app.use("*", cors());

app.use("/validate-*", (c, next) => {
  const auth = bearerAuth({ token: allowedKeys });
  return auth(c, next);
});

// Health Check
app.get("/health", (c) => c.json({ status: "ok" }));

app.post("/validate-word", async (c) => {
  const body = await c.req.json<WordRequest>();

  if (!body.word || typeof body.word !== "string") {
    return c.json({ error: "Invalid input" }, 400);
  }

  const isValid = isWordInDict(filter, body.word);

  return c.json({
    word: body.word.toLowerCase(),
    valid: isValid,
  });
});

app.post("/validate-words-boggle", async (c) => {
  try {
    const { words } = await c.req.json<BatchWordRequest>();

    if (!Array.isArray(words)) {
      return c.json(
        { error: "'words' must be an array of objects with 'val' property" },
        400,
      );
    }

    const results: WordValidationResult[] = words.map(({ val }) => {
      const cleanWord = (val || "").trim().toLowerCase();
      const isValid = cleanWord.length >= 3 && isWordInDict(filter, cleanWord);

      return {
        val: cleanWord,
        valid: isValid,
        points: isValid ? calculatePoints(cleanWord.length) : 0,
      };
    });

    return c.json(results);
  } catch (e) {
    console.error("Batch validation error:", e);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

const port = Number(process.env.PORT) || 3000;

if (process.env.NODE_ENV !== "production") {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`SJP CHECK Server running on http://localhost:${info.port}`);
  });
}

export default app;
