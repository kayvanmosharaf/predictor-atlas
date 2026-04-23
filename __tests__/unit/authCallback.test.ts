/**
 * @jest-environment node
 */
import type { NextRequest } from "next/server";

const mockExchangeCodeForSession = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: jest.fn(async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}));

import { GET } from "@/app/auth/callback/route";

function makeRequest(url: string): NextRequest {
  return { url } as unknown as NextRequest;
}

describe("/auth/callback GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exchanges the code and redirects to the `next` param on success", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const res = await GET(
      makeRequest(
        "https://example.com/auth/callback?code=abc123&next=/auth/update-password"
      )
    );
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("abc123");
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get("location")).toBe(
      "https://example.com/auth/update-password"
    );
  });

  it("defaults to `/` when `next` is not provided", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const res = await GET(
      makeRequest("https://example.com/auth/callback?code=abc123")
    );
    expect(res.headers.get("location")).toBe("https://example.com/");
  });

  it("redirects to /?auth_error=1 when the code exchange fails", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      error: { message: "bad code" },
    });
    const res = await GET(
      makeRequest(
        "https://example.com/auth/callback?code=bad&next=/auth/update-password"
      )
    );
    expect(res.headers.get("location")).toBe(
      "https://example.com/?auth_error=1"
    );
  });

  it("redirects to /?auth_error=1 when the code param is missing", async () => {
    const res = await GET(makeRequest("https://example.com/auth/callback"));
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBe(
      "https://example.com/?auth_error=1"
    );
  });
});
