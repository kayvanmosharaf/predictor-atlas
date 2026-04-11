import "@testing-library/jest-dom";

// Mock amplify_outputs.json
jest.mock("@/amplify_outputs.json", () => ({}), { virtual: true });

// Mock aws-amplify modules
jest.mock("aws-amplify", () => ({
  Amplify: { configure: jest.fn() },
}));

jest.mock("aws-amplify/auth", () => ({
  fetchAuthSession: jest.fn().mockResolvedValue({
    tokens: {
      accessToken: {
        payload: { "cognito:groups": [] },
      },
    },
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
}));

// Mock the API client used by all pages
jest.mock("@/lib/api-client", () => ({
  apiFetch: jest.fn().mockResolvedValue([]),
}));

// Mock @aws-amplify/ui-react
const mockSignOut = jest.fn();
const mockUseAuthenticator = jest.fn(() => ({
  authStatus: "authenticated",
  user: { username: "testuser", userId: "test-user-id" },
  signOut: mockSignOut,
}));

jest.mock("@aws-amplify/ui-react", () => ({
  useAuthenticator: mockUseAuthenticator,
  Authenticator: ({ children }: { children?: React.ReactNode }) => children ?? null,
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
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
(globalThis as Record<string, unknown>).__mockUseAuthenticator = mockUseAuthenticator;
(globalThis as Record<string, unknown>).__mockSignOut = mockSignOut;
