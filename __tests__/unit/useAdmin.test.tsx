import { renderHook, waitFor } from "@testing-library/react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useAdmin } from "@/app/hooks/useAdmin";

const mockUseAuthenticator = (globalThis as Record<string, unknown>).__mockUseAuthenticator as jest.Mock;

describe("useAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthenticator.mockReturnValue({
      authStatus: "authenticated",
      user: { username: "testuser", userId: "test-user-id" },
      signOut: jest.fn(),
    });
  });

  it("returns isAdmin: true when cognito:groups includes 'admin'", async () => {
    (fetchAuthSession as jest.Mock).mockResolvedValue({
      tokens: {
        accessToken: {
          payload: { "cognito:groups": ["admin"] },
        },
      },
    });

    const { result } = renderHook(() => useAdmin());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(true);
  });

  it("returns isAdmin: false for non-admin user", async () => {
    (fetchAuthSession as jest.Mock).mockResolvedValue({
      tokens: {
        accessToken: {
          payload: { "cognito:groups": ["users"] },
        },
      },
    });

    const { result } = renderHook(() => useAdmin());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns isAdmin: false when unauthenticated", async () => {
    mockUseAuthenticator.mockReturnValue({
      authStatus: "unauthenticated",
      user: undefined,
      signOut: jest.fn(),
    });

    const { result } = renderHook(() => useAdmin());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });

  it("shows loading state while checking", () => {
    (fetchAuthSession as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAdmin());
    expect(result.current.loading).toBe(true);
  });

  it("handles fetchAuthSession errors gracefully", async () => {
    (fetchAuthSession as jest.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAdmin());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns isAdmin: false when groups is undefined", async () => {
    (fetchAuthSession as jest.Mock).mockResolvedValue({
      tokens: {
        accessToken: {
          payload: {},
        },
      },
    });

    const { result } = renderHook(() => useAdmin());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });
});
