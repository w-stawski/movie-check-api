import { describe, it, expect } from "vitest";
import app from "./index.js"; // Adjust path if needed

describe("SJP SERVER:", () => {
  it("Should return 200 on health check", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
  });

  it("Should calculate points correctly for a 5-letter word", async () => {
    const res = await app.request("/validate-words-boggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        words: [{ val: "bajka" }],
      }),
    });
    const data = await res.json();

    expect(data[0].points).toBe(2);
  });

  it("Should handle invalid input", async () => {
    const res = await app.request("/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: null }),
    });
    expect(res.status).toBe(400);
  });
});
