import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, PATCH } from "@/app/api/entries/[id]/route";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(),
}));

describe("api/entries/[id] route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("GET returns 404 when entry is missing", async () => {
    const cookieStore = {
      get: () => ({ value: "token" }),
    } as unknown as Awaited<ReturnType<typeof cookies>>;
    vi.mocked(cookies).mockResolvedValue(cookieStore);

    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "Not found" },
      }),
    };

    vi.mocked(createServerSupabase).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(query),
    } as never);

    const response = (await GET(
      new Request("http://localhost/api/entries/1"),
      {
        params: Promise.resolve({ id: "1" }),
      },
    )) as Response;

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Entry not found" });
  });

  it("PATCH returns 400 when content is missing", async () => {
    const cookieStore = {
      get: () => ({ value: "token" }),
    } as unknown as Awaited<ReturnType<typeof cookies>>;
    vi.mocked(cookies).mockResolvedValue(cookieStore);

    vi.mocked(createServerSupabase).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
    } as never);

    const request = new Request("http://localhost/api/entries/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Title" }),
    });

    const response = (await PATCH(request, {
      params: Promise.resolve({ id: "1" }),
    })) as Response;

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Title and content are required",
    });
  });
});
