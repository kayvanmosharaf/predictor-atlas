import React from "react";
import { render, RenderOptions } from "@testing-library/react";

// Access global mocks set up in jest.setup.ts
const mockUseAuth = (globalThis as Record<string, unknown>).__mockUseAuth as jest.Mock;

/**
 * Set mock authentication state
 */
export function setMockAuthState(state: "authenticated" | "unauthenticated") {
  mockUseAuth.mockReturnValue({
    authStatus: state,
    user: state === "authenticated"
      ? { id: "test-user-id", email: "test@example.com" }
      : null,
    signOut: (globalThis as Record<string, unknown>).__mockSignOut as jest.Mock,
  });
}

/**
 * Set mock admin state by configuring the Supabase getUser mock
 */
export function setMockAdminState(isAdmin: boolean) {
  const mockGetUser = (globalThis as Record<string, unknown>).__mockGetUser as jest.Mock;
  mockGetUser.mockResolvedValue({
    data: {
      user: {
        id: "test-user-id",
        email: "test@example.com",
        app_metadata: { role: isAdmin ? "admin" : undefined },
      },
    },
    error: null,
  });
}

/**
 * Get mock API client
 */
export function getMockApiFetch() {
  const { apiFetch } = require("@/lib/api-client");
  return apiFetch as jest.Mock;
}

/**
 * Custom render (add providers here as needed)
 */
function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { ...options });
}

export * from "@testing-library/react";
export { customRender as render };
