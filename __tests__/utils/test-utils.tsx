import React from "react";
import { render, RenderOptions } from "@testing-library/react";

// Access global mocks set up in jest.setup.ts
const mockUseAuthenticator = (globalThis as Record<string, unknown>).__mockUseAuthenticator as jest.Mock;

/**
 * Set mock authentication state
 */
export function setMockAuthState(state: "authenticated" | "unauthenticated") {
  mockUseAuthenticator.mockReturnValue({
    authStatus: state,
    user: state === "authenticated"
      ? { username: "testuser", userId: "test-user-id" }
      : undefined,
    signOut: (globalThis as Record<string, unknown>).__mockSignOut as jest.Mock,
  });
}

/**
 * Set mock admin state by configuring fetchAuthSession
 */
export function setMockAdminState(isAdmin: boolean) {
  const { fetchAuthSession } = require("aws-amplify/auth");
  (fetchAuthSession as jest.Mock).mockResolvedValue({
    tokens: {
      accessToken: {
        payload: {
          "cognito:groups": isAdmin ? ["admin"] : [],
        },
      },
    },
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
