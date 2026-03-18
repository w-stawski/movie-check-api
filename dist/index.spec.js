import { describe, it, expect } from "vitest";
import app from "./index.js";
describe("MOVIE CHECK API:", () => {
    it("Should return 200 on health check", async () => {
        const res = await app.request("/health");
        expect(res.status).toBe(200);
    });
});
