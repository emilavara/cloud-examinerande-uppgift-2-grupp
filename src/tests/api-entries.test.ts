import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/entries/route";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(),
}));

describe("api/entries route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("GET returns 401 when unauthenticated", async () => {
    const cookieStore = {
      get: () => undefined,
    } as unknown as Awaited<ReturnType<typeof cookies>>;
    vi.mocked(cookies).mockResolvedValue(cookieStore);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("POST returns 400 when title is missing", async () => {
    const cookieStore = {
      get: () => ({ value: "token" }),
    } as unknown as Awaited<ReturnType<typeof cookies>>;
    vi.mocked(cookies).mockResolvedValue(cookieStore);
    vi.mocked(createServerSupabase).mockImplementation(() => {
      throw new Error("Should not reach Supabase for validation errors");
    });

    const request = new Request("http://localhost/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Hello" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Title and content are required",
    });
  });
});
