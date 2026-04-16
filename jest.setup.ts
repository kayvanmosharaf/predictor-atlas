import "@testing-library/jest-dom";

// Mock the Supabase browser client
const mockGetUser = jest.fn().mockResolvedValue({
  data: { user: null },
  error: null,
});
const mockSignOut = jest.fn().mockResolvedValue({});
const mockOnAuthStateChange = jest.fn().mockReturnValue({
  data: { subscription: { unsubscribe: jest.fn() } },
});

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
  })),
}));

// Mock the useAuth hook
const mockUseAuth = jest.fn(() => ({
  authStatus: "authenticated" as const,
  user: { id: "test-user-id", email: "test@example.com" },
  signOut: mockSignOut,
}));

jest.mock("@/app/hooks/useAuth", () => ({
  useAuth: mockUseAuth,
}));

// Mock the API client used by all pages
jest.mock("@/lib/api-client", () => ({
  apiFetch: jest.fn().mockResolvedValue([]),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock next/link
jest.mock("next/link", () => {
  const React = require("react");
  return React.forwardRef(function MockLink(
    { children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown },
    ref: React.Ref<HTMLAnchorElement>
  ) {
    return React.createElement("a", { href, ref, ...props }, children);
  });
});

// Export mocks for test files to access
(globalThis as Record<string, unknown>).__mockUseAuth = mockUseAuth;
(globalThis as Record<string, unknown>).__mockSignOut = mockSignOut;
(globalThis as Record<string, unknown>).__mockGetUser = mockGetUser;
