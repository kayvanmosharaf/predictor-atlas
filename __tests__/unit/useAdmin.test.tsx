import { renderHook, waitFor } from "@testing-library/react";
import { useAdmin } from "@/app/hooks/useAdmin";

const mockGetUser = (globalThis as Record<string, unknown>).__mockGetUser as jest.Mock;

describe("useAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns isAdmin: true when app_metadata.role is 'admin'", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "test-user-id",
          email: "test@example.com",
          app_metadata: { role: "admin" },
        },
      },
      error: null,
    });

    const { result } = renderHook(() => useAdmin());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(true);
  });

  it("returns isAdmin: false for non-admin user", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "test-user-id",
          email: "test@example.com",
          app_metadata: { role: "user" },
        },
      },
      error: null,
    });

    const { result } = renderHook(() => useAdmin());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns isAdmin: false when user is null", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const { result } = renderHook(() => useAdmin());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });

  it("shows loading state while checking", () => {
    mockGetUser.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAdmin());
    expect(result.current.loading).toBe(true);
  });

  it("returns isAdmin: false when app_metadata is empty", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "test-user-id",
          email: "test@example.com",
          app_metadata: {},
        },
      },
      error: null,
    });

    const { result } = renderHook(() => useAdmin());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });
});
